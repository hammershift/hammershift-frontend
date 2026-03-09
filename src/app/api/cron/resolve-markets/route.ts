// src/app/api/cron/resolve-markets/route.ts
import { NextResponse } from 'next/server';
import connectToDB from '@/lib/mongoose';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

function isAuthorized(req: Request): boolean {
  const secret = req.headers.get('x-cron-secret');
  return secret === process.env.CRON_SECRET;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectToDB();
  const db = mongoose.connection.db!;

  const now = new Date();

  // Find ACTIVE markets whose closesAt has passed
  const expiredMarkets = await db.collection('polygon_markets').find({
    status: 'ACTIVE',
    closesAt: { $lt: now },
  }).toArray();

  let resolved = 0;

  for (const market of expiredMarkets) {
    // Find the corresponding auction
    let auctionObjectId: mongoose.Types.ObjectId | null = null;
    try {
      auctionObjectId = new mongoose.Types.ObjectId(market.auctionId);
    } catch {
      // auctionId is not a valid ObjectId — skip _id lookup
    }

    const orClauses: Record<string, unknown>[] = [{ auction_id: market.auctionId }];
    if (auctionObjectId) {
      orClauses.push({ _id: auctionObjectId });
    }

    const auction = await db.collection('auctions').findOne({ $or: orClauses });

    if (!auction) continue;

    const finalPrice = auction.sort?.price ?? 0;
    const winningOutcome = finalPrice > market.predictedPrice ? 'YES' : 'NO';

    await db.collection('polygon_markets').updateOne(
      { _id: market._id },
      {
        $set: {
          status: 'RESOLVED',
          winningOutcome,
          resolvedAt: now,
          updatedAt: now,
        },
      }
    );

    resolved++;
  }

  return NextResponse.json({ ok: true, resolved });
}
