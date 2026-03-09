// src/app/api/markets/trending/route.ts
import { NextResponse } from 'next/server';
import connectToDB from '@/lib/mongoose';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET() {
  await connectToDB();
  const db = mongoose.connection.db!;

  const markets = await db.collection('polygon_markets')
    .find({ status: 'ACTIVE' })
    .sort({ totalVolume: -1 })
    .limit(4)
    .toArray();

  if (markets.length === 0) {
    return NextResponse.json([]);
  }

  // Enrich with auction image + title
  const auctionIds = markets.map((m) => m.auctionId).filter(Boolean);
  const auctionDocs = await db.collection('auctions').find({
    $or: [
      { auction_id: { $in: auctionIds } },
    ],
  }).project({ title: 1, image: 1, sort: 1, auction_id: 1 }).toArray();

  const auctionMap = new Map(auctionDocs.map((a) => [a.auction_id, a]));

  const enriched = markets.map((m) => {
    const auction = auctionMap.get(m.auctionId);
    return {
      _id: m._id.toString(),
      auctionId: m.auctionId,
      question: m.question,
      status: m.status,
      yesPrice: m.yesPrice ?? 0.5,
      noPrice: m.noPrice ?? 0.5,
      totalVolume: m.totalVolume ?? 0,
      predictedPrice: m.predictedPrice ?? 0,
      closesAt: m.closesAt ?? null,
      auction: {
        title: auction?.title ?? m.title ?? null,
        image: auction?.image ?? m.imageUrl ?? null,
        deadline: auction?.sort?.deadline ?? m.closesAt ?? null,
      },
    };
  });

  return NextResponse.json(enriched);
}
