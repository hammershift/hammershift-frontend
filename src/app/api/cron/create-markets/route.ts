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

  const qualifyingAuctions = await db.collection('auctions').find({
    'sort.deadline': { $gt: now },
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

  for (const auction of qualifyingAuctions) {
    const auctionId = auction.auction_id ?? auction._id.toString();

    const existing = await db.collection('polygon_markets').findOne({ auctionId });
    if (existing) {
      skipped++;
      continue;
    }

    const predictedPrice = auction.sort?.price ?? 0;
    const closesAt: Date | null = auction.sort?.deadline
      ? new Date(auction.sort.deadline)
      : null;

    // Compute all risk fields at creation time — never recomputed later
    const riskFields = computeMarketRiskFields(closesAt, predictedPrice);

    await db.collection('polygon_markets').insertOne({
      auctionId,
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

  return NextResponse.json({ ok: true, created, skipped, total: qualifyingAuctions.length });
}
