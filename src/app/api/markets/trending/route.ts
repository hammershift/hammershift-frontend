// src/app/api/markets/trending/route.ts
import { NextResponse } from 'next/server';
import connectToDB from '@/lib/mongoose';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET() {
  await connectToDB();
  const db = mongoose.connection.db!;

  const now = new Date();

  // Only show markets that are ACTIVE and whose auction hasn't closed yet
  const markets = await db.collection('polygon_markets')
    .find({
      status: 'ACTIVE',
    })
    .sort({ totalVolume: -1 })
    .limit(4)
    .toArray();

  if (markets.length === 0) {
    return NextResponse.json([]);
  }

  // Enrich with auction image + title — try both auction_id string and _id ObjectId
  const auctionIds = markets.map((m) => m.auctionId).filter(Boolean);
  const objectIds: mongoose.Types.ObjectId[] = [];
  for (const id of auctionIds) {
    try { objectIds.push(new mongoose.Types.ObjectId(id)); } catch { /* not an ObjectId */ }
  }

  const auctionDocs = await db.collection('auctions').find({
    $or: [
      { auction_id: { $in: auctionIds } },
      ...(objectIds.length ? [{ _id: { $in: objectIds } }] : []),
    ],
  }).project({ title: 1, image: 1, sort: 1, auction_id: 1 }).toArray();

  const auctionMap = new Map<string, typeof auctionDocs[0]>();
  for (const a of auctionDocs) {
    if (a.auction_id) auctionMap.set(a.auction_id, a);
    auctionMap.set(a._id.toString(), a);
  }

  const enriched = markets
    .map((m) => {
      const auction = auctionMap.get(m.auctionId);
      const deadline = auction?.sort?.deadline ?? m.closesAt ?? null;
      const deadlineDate = deadline ? new Date(deadline) : null;
      // Skip markets whose auction has already ended
      if (deadlineDate && deadlineDate < now) return null;
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
          deadline,
        },
      };
    })
    .filter(Boolean);

  return NextResponse.json(enriched);
}
