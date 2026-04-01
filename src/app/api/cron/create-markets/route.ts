// src/app/api/cron/create-markets/route.ts
//
// Creates prediction markets for qualifying live BaT auctions.
//
// Changed from original:
//   - Injects risk fields at creation via computeMarketRiskFields()
//   - tradingClosesAt written at creation (4 hours before closesAt)
//   - riskTier, positionCapUSDC, oracleStatus written at creation

import { NextResponse } from 'next/server';
import connectToDB from '@/lib/mongoose';
import mongoose from 'mongoose';
import { computeMarketRiskFields } from '@/lib/marketRiskSetup';
import { computeLinePrice } from '@/lib/pricingEngine';
import { keccak256, stringToBytes } from 'viem';

export const dynamic = 'force-dynamic';

const QUALIFYING_MAKES = [
  'ferrari', 'lamborghini', 'corvette', 'mercedes', 'bmw',
  'maserati', 'alfa romeo', 'mustang', 'porsche', 'camaro',
];

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

  // Scraper offsets sort.deadline by -1 day from BaT's actual end time.
  // Look back 24h to catch auctions that are still live on BaT.
  const liveThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const qualifyingAuctions = await db.collection('auctions').find({
    'sort.deadline': { $gt: liveThreshold },
    $or: QUALIFYING_MAKES.map((make) => ({
      title: { $regex: make, $options: 'i' },
    })),
  }).project({
    _id: 1,
    auction_id: 1,
    title: 1,
    image: 1,
    'sort.price': 1,
    'sort.deadline': 1,
  }).toArray();

  let created = 0;
  let skipped = 0;
  let reactivated = 0;

  for (const auction of qualifyingAuctions) {
    const auctionId = auction.auction_id ?? auction._id.toString();

    const existing = await db.collection('polygon_markets').findOne({ auctionId });
    if (existing) {
      // If existing market is stale (wrong closesAt or not ACTIVE), fix it
      const correctClosesAt = auction.sort?.deadline
        ? new Date(new Date(auction.sort.deadline).getTime() + 24 * 60 * 60 * 1000)
        : null;
      if (correctClosesAt && (existing.status !== 'ACTIVE' || !existing.closesAt || Math.abs(new Date(existing.closesAt).getTime() - correctClosesAt.getTime()) > 60000)) {
        await db.collection('polygon_markets').updateOne(
          { _id: existing._id },
          { $set: { closesAt: correctClosesAt, status: 'ACTIVE', updatedAt: now } }
        );
        reactivated++;
      } else {
        skipped++;
      }
      continue;
    }

    // Use pricing engine for comparable-based prediction; fall back to current bid
    let predictedPrice = auction.sort?.price ?? 0;
    try {
      if (auction.title) {
        const pricing = await computeLinePrice(auction.title);
        if (pricing.linePrice > 0) predictedPrice = pricing.linePrice;
      }
    } catch { /* fall back to current bid */ }
    // Add 24h back to get the real BaT deadline for market close time
    const closesAt: Date | null = auction.sort?.deadline
      ? new Date(new Date(auction.sort.deadline).getTime() + 24 * 60 * 60 * 1000)
      : null;

    // Compute all risk fields at creation time — never recomputed later
    const riskFields = computeMarketRiskFields(closesAt, predictedPrice);

    const onChainMarketId = keccak256(stringToBytes(auctionId));

    await db.collection('polygon_markets').insertOne({
      auctionId,
      contractAddress: process.env.VELOCITY_MARKETS_CONTRACT ?? null,
      onChainMarketId,
      question: `Will this sell above $${predictedPrice.toLocaleString()}?`,
      status: 'ACTIVE',
      yesPrice: 0.5,
      noPrice: 0.5,
      yesPool: 50,
      noPool: 50,
      totalVolume: 0,
      totalLiquidity: 0,
      predictedPrice,
      winningOutcome: null,
      resolvedAt: null,
      closesAt,
      imageUrl: auction.image ?? null,
      title: auction.title ?? null,
      // Risk fields
      ...riskFields,
      createdAt: now,
      updatedAt: now,
    });

    created++;
  }

  return NextResponse.json({ ok: true, created, reactivated, skipped, total: qualifyingAuctions.length });
}
