// src/app/api/cron/create-markets/route.ts
import { NextResponse } from 'next/server';
import connectToDB from '@/lib/mongoose';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

const QUALIFYING_MAKES = [
  'ferrari', 'lamborghini', 'corvette', 'mercedes', 'bmw',
  'maserati', 'alfa romeo', 'mustang', 'porsche', 'camaro',
];

// Simple secret to prevent public triggering. Set CRON_SECRET in Amplify env vars.
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

  // 1. Find qualifying live auctions
  const qualifyingAuctions = await db.collection('auctions').find({
    isActive: true,
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

    // 2. Check if market already exists (idempotent)
    const existing = await db.collection('polygon_markets').findOne({ auctionId });
    if (existing) {
      skipped++;
      continue;
    }

    const predictedPrice = auction.sort?.price ?? 0;

    // 3. Create the market
    await db.collection('polygon_markets').insertOne({
      auctionId,
      question: `Will this sell above $${predictedPrice.toLocaleString()}?`,
      status: 'ACTIVE',
      yesPrice: 0.5,
      noPrice: 0.5,
      totalVolume: 0,
      totalLiquidity: 0,
      predictedPrice,
      winningOutcome: null,
      resolvedAt: null,
      closesAt: auction.sort?.deadline ?? null,
      imageUrl: auction.image ?? null,
      title: auction.title ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    created++;
  }

  return NextResponse.json({ ok: true, created, skipped, total: qualifyingAuctions.length });
}
