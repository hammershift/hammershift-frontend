import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import connectToDB from '@/lib/mongoose';
import TransferLogs from '@/models/transferLog.model';
import Users from '@/models/user.model';

export const dynamic = 'force-dynamic';

const DAILY_LIMIT_STANDARD = 500;
const DAILY_LIMIT_TRUSTED = 2500;
const MAX_TRANSFERS_PER_DAY = 5;
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

/**
 * GET /api/wallet/transfer/check-limits
 *
 * Returns the user's current transfer limits and usage.
 */
export async function GET() {
  const session = await getAuthSession();
  if (!session?.user?._id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await connectToDB();

  const user = await Users.findById(session.user._id, { role: 1 }).lean() as { role?: string } | null;
  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  const isTrusted = user.role === 'trusted' || user.role === 'admin';
  const dailyLimit = isTrusted ? DAILY_LIMIT_TRUSTED : DAILY_LIMIT_STANDARD;

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const recentTransfers = await TransferLogs.find({
    userId: session.user._id,
    createdAt: { $gt: twentyFourHoursAgo },
    status: { $in: ['BROADCAST', 'CONFIRMED', 'PENDING'] },
  })
    .sort({ createdAt: -1 })
    .lean();

  const dailyUsed = recentTransfers.reduce((sum, t) => sum + t.amount, 0);
  const transfersToday = recentTransfers.length;

  let cooldownRemaining = 0;
  if (recentTransfers.length > 0) {
    const lastTransferAt = new Date(recentTransfers[0].createdAt).getTime();
    const elapsed = Date.now() - lastTransferAt;
    if (elapsed < COOLDOWN_MS) {
      cooldownRemaining = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
    }
  }

  return NextResponse.json({
    dailyUsed: Math.round(dailyUsed * 100) / 100,
    dailyLimit,
    dailyRemaining: Math.max(0, Math.round((dailyLimit - dailyUsed) * 100) / 100),
    transfersToday,
    maxTransfersPerDay: MAX_TRANSFERS_PER_DAY,
    cooldownRemaining,
    isTrusted,
  });
}
