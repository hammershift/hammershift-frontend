import { NextRequest, NextResponse } from 'next/server';
import connectToDB from '@/lib/mongoose';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

/**
 * GET /api/markets/comparables?make=Porsche&model=911&limit=10
 *
 * Returns recent sold auctions for the same make/model from the shared
 * MongoDB auctions collection (populated by the BaT scraper).
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const make = searchParams.get('make');
  const model = searchParams.get('model');
  const limit = Math.min(Number(searchParams.get('limit') || 10), 20);

  if (!make || !model) {
    return NextResponse.json({ error: 'make and model are required' }, { status: 400 });
  }

  await connectToDB();
  const db = mongoose.connection.db!;

  // Query sold auctions (status=2) for same make/model
  const auctions = await db.collection('auctions').find({
    attributes: {
      $all: [
        { $elemMatch: { key: 'make', value: { $regex: new RegExp(`^${escapeRegex(make)}$`, 'i') } } },
        { $elemMatch: { key: 'model', value: { $regex: new RegExp(escapeRegex(model), 'i') } } },
        { $elemMatch: { key: 'status', value: 2 } },
      ],
    },
    'sort.price': { $gt: 0 },
  })
    .sort({ 'sort.deadline': -1 })
    .limit(limit)
    .project({
      title: 1,
      image: 1,
      page_url: 1,
      'sort.price': 1,
      'sort.deadline': 1,
      'sort.bids': 1,
      attributes: 1,
      comments: 1,
      views: 1,
    })
    .toArray();

  const comparables = auctions.map((a: any) => {
    const attrs = a.attributes ?? [];
    const getAttr = (key: string) => attrs.find((attr: any) => attr.key === key)?.value;

    return {
      title: a.title,
      year: Number(getAttr('year')) || null,
      make: getAttr('make') || make,
      model: getAttr('model') || model,
      salePrice: Number(a.sort?.price) || Number(getAttr('price')) || 0,
      saleDate: a.sort?.deadline || a.updatedAt || null,
      bidCount: Number(a.sort?.bids) || Number(getAttr('bids')) || 0,
      commentCount: Number(a.comments) || 0,
      viewCount: Number(a.views) || 0,
      mileage: parseMileage(a.title || ''),
      imageUrl: a.image || null,
      batUrl: a.page_url || null,
    };
  });

  // Compute simple stats
  const prices = comparables.map((c: any) => c.salePrice).filter((p: number) => p > 0);
  prices.sort((a: number, b: number) => a - b);
  const stats = {
    count: prices.length,
    median: prices.length > 0 ? prices[Math.floor(prices.length / 2)] : 0,
    p25: prices.length >= 4 ? prices[Math.floor(prices.length * 0.25)] : prices[0] ?? 0,
    p75: prices.length >= 4 ? prices[Math.floor(prices.length * 0.75)] : prices[prices.length - 1] ?? 0,
    min: prices[0] ?? 0,
    max: prices[prices.length - 1] ?? 0,
  };

  return NextResponse.json({ comparables, stats });
}

function parseMileage(title: string): number | null {
  const kMatch = title.match(/(\d+)[kK]-[Mm]ile/);
  if (kMatch) return parseInt(kMatch[1]) * 1000;
  const fullMatch = title.match(/([\d,]+)-[Mm]ile/);
  if (fullMatch) return parseInt(fullMatch[1].replace(/,/g, ''));
  return null;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
