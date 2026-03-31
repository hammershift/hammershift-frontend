import { NextResponse } from 'next/server';
import connectToDB from '@/lib/mongoose';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDB();
    const db = mongoose.connection.db;
    if (!db) return NextResponse.json([]);

    const recentSales = await db
      .collection('auctions')
      .find({
        isActive: false,
        'sort.price': { $gt: 0 },
      })
      .sort({ 'sort.deadline': -1 })
      .limit(20)
      .project({
        title: 1,
        'sort.price': 1,
        'sort.deadline': 1,
      })
      .toArray();

    const items = recentSales.map((a) => ({
      title: a.title ?? 'Unknown',
      price: a.sort?.price ?? 0,
      soldDate: a.sort?.deadline ?? null,
    }));

    return NextResponse.json(items, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (err) {
    console.error('Ticker API error:', err);
    return NextResponse.json([]);
  }
}
