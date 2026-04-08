import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectToDB from '@/lib/mongoose';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await connectToDB();
  const db = mongoose.connection.db;
  if (!db) return NextResponse.json([]);

  const userId = (session.user as any)._id || (session.user as any).id;
  if (!userId) return NextResponse.json([]);

  const notifications: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
  }> = [];

  // 1. Markets with positions that resolved recently
  const userPositions = await db
    .collection('polygon_positions')
    .find({ userId: userId.toString() })
    .toArray();

  if (userPositions.length > 0) {
    const marketIds = userPositions.map((p) => p.marketId).filter(Boolean);
    const marketObjectIds = marketIds.reduce<mongoose.Types.ObjectId[]>(
      (acc, id: string) => {
        try {
          acc.push(new mongoose.Types.ObjectId(id));
        } catch {
          // skip invalid ids
        }
        return acc;
      },
      []
    );
    const resolvedMarkets = await db
      .collection('polygon_markets')
      .find({
        _id: { $in: marketObjectIds },
        status: 'RESOLVED',
        resolvedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      })
      .limit(5)
      .toArray();

    for (const m of resolvedMarkets) {
      notifications.push({
        id: `resolved-${m._id}`,
        type: 'resolution',
        title: 'Market Resolved',
        message: `"${m.question?.slice(0, 50)}..." resolved ${m.winningOutcome ?? 'N/A'}`,
        time: m.resolvedAt
          ? new Date(m.resolvedAt).toISOString()
          : new Date().toISOString(),
        read: false,
      });
    }
  }

  // 2. Markets ending soon (within 6 hours) where user has positions
  if (userPositions.length > 0) {
    const positionMarketIds = userPositions
      .map((p) => p.marketId)
      .filter(Boolean);
    const positionObjectIds = positionMarketIds.reduce<mongoose.Types.ObjectId[]>(
      (acc, id: string) => {
        try {
          acc.push(new mongoose.Types.ObjectId(id));
        } catch {
          // skip invalid ids
        }
        return acc;
      },
      []
    );
    const in6h = new Date(Date.now() + 6 * 60 * 60 * 1000);
    const endingSoon = await db
      .collection('polygon_markets')
      .find({
        _id: { $in: positionObjectIds },
        status: 'ACTIVE',
        closesAt: { $lte: in6h, $gte: new Date() },
      })
      .limit(3)
      .toArray();

    for (const m of endingSoon) {
      notifications.push({
        id: `ending-${m._id}`,
        type: 'ending_soon',
        title: 'Ending Soon',
        message: `A market you hold a position in is ending soon`,
        time: new Date().toISOString(),
        read: false,
      });
    }
  }

  // Sort by time descending
  notifications.sort(
    (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
  );

  return NextResponse.json(notifications.slice(0, 10));
}
