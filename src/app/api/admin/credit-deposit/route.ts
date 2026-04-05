import { NextRequest, NextResponse } from 'next/server';
import connectToDB from '@/lib/mongoose';
import Users from '@/models/user.model';
import Transaction from '@/models/transaction';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/credit-deposit
 *
 * Admin-only endpoint to manually credit a user's balance for a direct
 * crypto transfer that wasn't auto-detected.
 *
 * Body: { walletAddress, amount, txHash, note? }
 * Auth: CRON_SECRET header (reuses existing secret for admin ops)
 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret');
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { walletAddress, amount, txHash, note } = body;

  if (!walletAddress || !amount || !txHash) {
    return NextResponse.json(
      { message: 'walletAddress, amount, and txHash are required' },
      { status: 400 }
    );
  }

  await connectToDB();

  // Find user by embedded wallet address (case-insensitive)
  const user = await Users.findOne({
    embeddedWalletAddress: { $regex: new RegExp(`^${walletAddress}$`, 'i') },
  });

  if (!user) {
    return NextResponse.json(
      { message: `No user found with wallet ${walletAddress}` },
      { status: 404 }
    );
  }

  // Idempotency: check if this txHash was already credited
  const existing = await Transaction.findOne({ stripeSessionId: txHash });
  if (existing) {
    return NextResponse.json({
      success: true,
      duplicate: true,
      message: `txHash ${txHash} was already credited`,
    });
  }

  // Credit balance
  const prevBalance = user.balance ?? 0;
  user.balance = prevBalance + Number(amount);
  user.updatedAt = new Date();
  await user.save();

  // Record transaction
  await Transaction.create({
    userID: user._id,
    transactionType: 'deposit',
    amount: Number(amount),
    type: '+',
    status: 'success',
    method: 'direct_usdc_transfer',
    stripeSessionId: txHash, // reuse for idempotency
    transactionDate: new Date(),
  });

  console.log(
    `[admin/credit-deposit] Credited $${amount} USDC to user ${user._id} ` +
    `(${user.email ?? user.username ?? 'unknown'}) wallet=${walletAddress} tx=${txHash}` +
    (note ? ` note: ${note}` : '')
  );

  return NextResponse.json({
    success: true,
    userId: user._id,
    username: user.username ?? user.email,
    previousBalance: prevBalance,
    newBalance: user.balance,
    txHash,
  });
}
