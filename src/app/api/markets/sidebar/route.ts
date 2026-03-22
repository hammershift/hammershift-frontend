import { NextResponse } from 'next/server';
import connectToDB from '@/lib/mongoose';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET() {
  await connectToDB();
  const db = mongoose.connection.db;
  if (!db) return NextResponse.json({ endingSoon: [], mostActive: [], biggestMovers: [] });

  const now = new Date();

  // Ending soon: active markets sorted by deadline ascending
  const endingSoonRaw = await db.collection('polygon_markets')
    .find({ status: 'ACTIVE' })
    .sort({ closesAt: 1 })
    .limit(10)
    .toArray();

  // Most active: active markets sorted by volume descending
  const mostActiveRaw = await db.collection('polygon_markets')
    .find({ status: 'ACTIVE' })
    .sort({ totalVolume: -1 })
    .limit(5)
    .toArray();

  // Get auction data for enrichment
  const allMarkets = [...endingSoonRaw, ...mostActiveRaw];
  const auctionIds = Array.from(new Set(allMarkets.map(m => m.auctionId).filter(Boolean)));
  const objectIds: mongoose.Types.ObjectId[] = [];
  for (const id of auctionIds) {
    try { objectIds.push(new mongoose.Types.ObjectId(id)); } catch {}
  }

  const auctionDocs = await db.collection('auctions').find({
    $or: [
      { auction_id: { $in: auctionIds } },
      ...(objectIds.length ? [{ _id: { $in: objectIds } }] : []),
    ],
  }).project({ title: 1, image: 1, sort: 1, auction_id: 1 }).toArray();

  const auctionMap = new Map<string, any>();
  for (const a of auctionDocs) {
    if (a.auction_id) auctionMap.set(a.auction_id, a);
    auctionMap.set(a._id.toString(), a);
  }

  function enrich(m: any) {
    const auction = auctionMap.get(m.auctionId);
    const deadline = auction?.sort?.deadline ?? m.closesAt ?? null;
    return {
      _id: m._id.toString(),
      question: m.question,
      yesPrice: m.yesPrice ?? 0.5,
      totalVolume: m.totalVolume ?? 0,
      closesAt: deadline,
      auction: {
        title: auction?.title ?? null,
        image: auction?.image ?? null,
      },
    };
  }

  // Filter out ended auctions
  const endingSoon = endingSoonRaw
    .map(enrich)
    .filter(m => m.closesAt && new Date(m.closesAt) > now)
    .slice(0, 5);

  const mostActive = mostActiveRaw
    .map(enrich)
    .filter(m => !m.closesAt || new Date(m.closesAt) > now)
    .slice(0, 5);

  // Biggest movers: use aggregation to compute price delta server-side
  // Only fetch markets that have priceHistory (potential movers), limit to top 20 by volume
  // to avoid scanning the entire collection
  const now24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const moverCandidates = await db.collection('polygon_markets')
    .find({ status: 'ACTIVE', 'priceHistory.0': { $exists: true } })
    .sort({ totalVolume: -1 })
    .limit(20)
    .project({ question: 1, yesPrice: 1, auctionId: 1, priceHistory: 1, closesAt: 1 })
    .toArray();

  const withDelta = moverCandidates.map(m => {
    const history = (m.priceHistory ?? []) as any[];
    const ref = history.find((h: any) => new Date(h.timestamp) >= now24h) ?? history[0];
    const priceChange = ref ? Math.round(((m.yesPrice ?? 0.5) - (ref.yesPrice ?? 0.5)) * 100) : 0;
    return { ...m, priceChange, absDelta: Math.abs(priceChange) };
  });

  const biggestMovers = withDelta
    .sort((a, b) => b.absDelta - a.absDelta)
    .slice(0, 3)
    .map((m: any) => {
      const auction = auctionMap.get(m.auctionId);
      return {
        _id: m._id.toString(),
        question: m.question,
        yesPrice: m.yesPrice ?? 0.5,
        priceChange: m.priceChange,
        auction: { title: auction?.title ?? null },
      };
    });

  return NextResponse.json({ endingSoon, mostActive, biggestMovers });
}
