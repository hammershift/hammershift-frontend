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

/**
 * POST /api/wallet/claim-deposit
 *
 * User claims on-chain USDC that was sent directly to their embedded wallet.
 * Reads the on-chain balance, compares to what's already been credited,
 * and credits the difference to the platform balance.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?._id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await connectToDB();

  const userId = new Types.ObjectId(session.user._id as string);
  const user = await Users.findById(userId);
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

  // Read on-chain USDC balance
  const chainId = Number(process.env.NEXT_PUBLIC_VELOCITY_MARKETS_CHAIN_ID ?? 80002);
  const usdcAddress = process.env.NEXT_PUBLIC_VELOCITY_MARKETS_USDC as `0x${string}` | undefined;
  if (!usdcAddress) {
    return NextResponse.json(
      { message: 'USDC contract not configured' },
      { status: 500 }
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
      { message: 'Failed to read on-chain balance' },
      { status: 502 }
    );
  }

  if (onChainBalance < 0.01) {
    return NextResponse.json({
      success: false,
      message: 'No USDC found in your wallet to claim',
      onChainBalance,
    });
  }

  // Sum all previous direct_usdc_transfer credits for this user
  const previousClaims = await Transaction.aggregate([
    {
      $match: {
        userID: userId,
        method: 'direct_usdc_transfer',
        status: 'success',
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const alreadyClaimed = previousClaims[0]?.total ?? 0;

  // Credit = on-chain balance minus what we've already credited
  const claimable = Math.floor((onChainBalance - alreadyClaimed) * 100) / 100; // round down to cents

  if (claimable < 0.01) {
    return NextResponse.json({
      success: false,
      message: 'On-chain balance already credited to your account',
      onChainBalance,
      alreadyClaimed,
    });
  }

  // Credit platform balance
  user.balance = (user.balance ?? 0) + claimable;
  user.updatedAt = new Date();
  await user.save();

  // Record transaction
  await Transaction.create({
    userID: userId,
    transactionType: 'deposit',
    amount: claimable,
    type: '+',
    status: 'success',
    method: 'direct_usdc_transfer',
    stripeSessionId: `claim_${userId}_${Date.now()}`, // unique key for idempotency
    transactionDate: new Date(),
  });

  console.log(
    `[claim-deposit] Credited $${claimable} USDC to user ${userId} ` +
    `(on-chain: ${onChainBalance}, previously claimed: ${alreadyClaimed})`
  );

  return NextResponse.json({
    success: true,
    credited: claimable,
    onChainBalance,
    newPlatformBalance: user.balance,
  });
}
