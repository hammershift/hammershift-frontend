import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDB from '@/lib/mongoose';
import Users from '@/models/user.model';
import Transaction from '@/models/transaction';
import { Types } from 'mongoose';
import { createPublicClient, http, formatUnits } from 'viem';
import { polygon, polygonAmoy } from 'viem/chains';

export const dynamic = 'force-dynamic';

const USDC_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

// Rate limit: one claim per user per 30 seconds (in-memory, resets on deploy)
const claimCooldowns = new Map<string, number>();
const COOLDOWN_MS = 30_000;
const MAX_SINGLE_CLAIM = 10_000; // hard cap per claim

/**
 * POST /api/wallet/claim-deposit
 *
 * User claims on-chain USDC that was sent directly to their embedded wallet.
 * Reads the on-chain balance, compares to what's already been credited,
 * and credits the difference to the platform balance.
 *
 * Race-condition protection: uses a "pending" transaction as a lock.
 * If two requests fire simultaneously, the second will see the pending
 * record and bail out.
 */
export async function POST(req: NextRequest) {
  // 1. Auth
  const session = await getServerSession(authOptions);
  if (!session?.user?._id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userIdStr = session.user._id as string;

  // 2. Rate limit
  const lastClaim = claimCooldowns.get(userIdStr) ?? 0;
  if (Date.now() - lastClaim < COOLDOWN_MS) {
    const waitSec = Math.ceil((COOLDOWN_MS - (Date.now() - lastClaim)) / 1000);
    return NextResponse.json(
      { message: `Please wait ${waitSec}s before claiming again` },
      { status: 429 }
    );
  }
  claimCooldowns.set(userIdStr, Date.now());

  await connectToDB();

  const userId = new Types.ObjectId(userIdStr);
  const user = await Users.findById(userId).select('embeddedWalletAddress balance');
  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  const walletAddress = user.embeddedWalletAddress;
  if (!walletAddress) {
    return NextResponse.json(
      { message: 'No embedded wallet found for this account' },
      { status: 400 }
    );
  }

  // 3. Read on-chain USDC balance
  const chainId = Number(process.env.NEXT_PUBLIC_VELOCITY_MARKETS_CHAIN_ID ?? 80002);
  const usdcAddress = process.env.NEXT_PUBLIC_VELOCITY_MARKETS_USDC as `0x${string}` | undefined;
  if (!usdcAddress) {
    return NextResponse.json(
      { message: 'Service temporarily unavailable' },
      { status: 503 }
    );
  }

  const chain = chainId === 137 ? polygon : polygonAmoy;
  const client = createPublicClient({ chain, transport: http() });

  let onChainBalance: number;
  try {
    const raw = await client.readContract({
      address: usdcAddress,
      abi: USDC_ABI,
      functionName: 'balanceOf',
      args: [walletAddress as `0x${string}`],
    });
    onChainBalance = Number(formatUnits(raw, 6));
  } catch (err) {
    console.error('[claim-deposit] Failed to read on-chain balance:', err);
    return NextResponse.json(
      { message: 'Failed to verify on-chain balance. Try again shortly.' },
      { status: 502 }
    );
  }

  if (onChainBalance < 0.01) {
    return NextResponse.json({
      success: false,
      message: 'No USDC found in your wallet to claim',
    });
  }

  // 4. Sum all previous direct_usdc_transfer credits (including pending locks)
  const previousClaims = await Transaction.aggregate([
    {
      $match: {
        userID: userId,
        method: 'direct_usdc_transfer',
        status: { $in: ['success', 'pending'] },
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const alreadyClaimed = previousClaims[0]?.total ?? 0;

  const claimable = Math.floor((onChainBalance - alreadyClaimed) * 100) / 100;

  if (claimable < 0.01) {
    return NextResponse.json({
      success: false,
      message: 'On-chain balance already credited to your account',
    });
  }

  // Cap single claim
  if (claimable > MAX_SINGLE_CLAIM) {
    return NextResponse.json({
      success: false,
      message: `Claims over $${MAX_SINGLE_CLAIM} require manual review. Contact support.`,
    });
  }

  // 5. Insert a "pending" transaction as a lock — prevents double-credit race
  const lockKey = `claim_${userId}_${Math.floor(Date.now() / COOLDOWN_MS)}`;
  const lockTx = await Transaction.findOneAndUpdate(
    { stripeSessionId: lockKey },
    {
      $setOnInsert: {
        userID: userId,
        transactionType: 'deposit',
        amount: claimable,
        type: '+',
        status: 'pending',
        method: 'direct_usdc_transfer',
        stripeSessionId: lockKey,
        transactionDate: new Date(),
      },
    },
    { upsert: true, new: true, rawResult: true }
  );

  // If the document already existed, another request is processing
  if (!lockTx.lastErrorObject?.upserted) {
    return NextResponse.json({
      success: false,
      message: 'Claim already in progress. Please wait.',
    });
  }

  try {
    // 6. Atomic balance increment
    await Users.findByIdAndUpdate(userId, {
      $inc: { balance: claimable },
      $set: { updatedAt: new Date() },
    });

    // 7. Mark transaction as success
    await Transaction.findByIdAndUpdate(lockTx.value?._id, {
      $set: { status: 'success' },
    });

    console.log(
      `[claim-deposit] Credited $${claimable} USDC to user ${userId}`
    );

    return NextResponse.json({
      success: true,
      credited: claimable,
    });
  } catch (err) {
    // Rollback: remove the pending lock so user can retry
    await Transaction.deleteOne({ stripeSessionId: lockKey, status: 'pending' });
    console.error('[claim-deposit] Credit failed, rolled back lock:', err);
    return NextResponse.json(
      { message: 'Failed to credit balance. Please try again.' },
      { status: 500 }
    );
  }
}
