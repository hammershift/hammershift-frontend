import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import connectToDB from '@/lib/mongoose';
import Users from '@/models/user.model';
import Transaction from '@/models/transaction';

export const dynamic = 'force-dynamic';

const ETH_ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;
const TX_HASH_RE = /^0x[0-9a-fA-F]{64}$/;
const MAX_CREDIT = 10_000; // hard cap per transaction

function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(
    new Uint8Array(Buffer.from(a)),
    new Uint8Array(Buffer.from(b))
  );
}

/**
 * POST /api/admin/credit-deposit
 *
 * Admin-only endpoint to manually credit a user's balance for a direct
 * crypto transfer that wasn't auto-detected.
 *
 * Body: { walletAddress, amount, txHash, note? }
 * Auth: CRON_SECRET header
 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret') ?? '';
  const expected = process.env.CRON_SECRET ?? '';
  if (!secret || !expected || !secureCompare(secret, expected)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
  }

  const { walletAddress, email, amount, txHash, note } = body ?? {};

  // Must provide either walletAddress or email
  if (!walletAddress && !email) {
    return NextResponse.json(
      { message: 'Provide walletAddress or email' },
      { status: 400 }
    );
  }

  // Validate wallet address format if provided (prevents ReDoS via regex injection)
  if (walletAddress && (typeof walletAddress !== 'string' || !ETH_ADDRESS_RE.test(walletAddress))) {
    return NextResponse.json(
      { message: 'Invalid wallet address format' },
      { status: 400 }
    );
  }

  // Validate txHash format
  if (!txHash || typeof txHash !== 'string' || !TX_HASH_RE.test(txHash)) {
    return NextResponse.json(
      { message: 'Invalid transaction hash format' },
      { status: 400 }
    );
  }

  // Validate amount: must be positive, finite, within cap
  const numAmount = Number(amount);
  if (!Number.isFinite(numAmount) || numAmount <= 0 || numAmount > MAX_CREDIT) {
    return NextResponse.json(
      { message: `Amount must be between $0.01 and $${MAX_CREDIT}` },
      { status: 400 }
    );
  }
  // Round to 2 decimal places
  const creditAmount = Math.round(numAmount * 100) / 100;

  await connectToDB();

  // Find user by embedded wallet address or email
  const query = walletAddress
    ? { embeddedWalletAddress: { $regex: new RegExp(`^${walletAddress}$`, 'i') } }
    : { email: { $regex: new RegExp(`^${email}$`, 'i') } };
  const user = await Users.findOne(query);

  if (!user) {
    return NextResponse.json(
      { message: `No user found with ${walletAddress ? 'that wallet address' : 'that email'}` },
      { status: 404 }
    );
  }

  // Idempotency: check if this txHash was already credited
  const existing = await Transaction.findOne({ stripeSessionId: txHash });
  if (existing) {
    return NextResponse.json({
      success: true,
      duplicate: true,
      message: 'This transaction was already credited',
    });
  }

  // Atomic balance increment (prevents race conditions)
  const updated = await Users.findByIdAndUpdate(
    user._id,
    { $inc: { balance: creditAmount }, $set: { updatedAt: new Date() } },
    { new: true }
  );

  await Transaction.create({
    userID: user._id,
    transactionType: 'deposit',
    amount: creditAmount,
    type: '+',
    status: 'success',
    method: 'direct_usdc_transfer',
    stripeSessionId: txHash,
    transactionDate: new Date(),
  });

  console.log(
    `[admin/credit-deposit] Credited $${creditAmount} USDC to user ${user._id} ` +
    `wallet=${walletAddress} tx=${txHash}` +
    (note ? ` note: ${note}` : '')
  );

  return NextResponse.json({
    success: true,
    credited: creditAmount,
    newBalance: updated?.balance,
  });
}
