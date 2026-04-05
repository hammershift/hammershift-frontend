import { NextResponse } from 'next/server';
import connectToDB from '@/lib/mongoose';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

const DAY_MS = 24 * 60 * 60 * 1000;

export async function GET() {
  try {
    await connectToDB();
    const db = mongoose.connection.db;
    if (!db) return NextResponse.json([]);

    const now = new Date();
    // Scraper stores deadline -1 day from real end, so subtract 1 day from "now"
    const liveThreshold = new Date(now.getTime() - DAY_MS);

    // First: live auctions (ending soonest first)
    const liveAuctions = await db
      .collection('auctions')
      .find({
        'sort.deadline': { $gt: liveThreshold },
        'sort.price': { $gt: 0 },
      })
      .sort({ 'sort.deadline': 1 })
      .limit(20)
      .project({ title: 1, 'sort.price': 1, 'sort.deadline': 1 })
      .toArray();

    // Fill remaining slots with recent sales (ended within 3 days)
    const recentThreshold = new Date(now.getTime() - 3 * DAY_MS);
    const remainingSlots = Math.max(0, 20 - liveAuctions.length);
    const recentSales = remainingSlots > 0
      ? await db
          .collection('auctions')
          .find({
            'sort.deadline': { $lte: liveThreshold, $gt: recentThreshold },
            'sort.price': { $gt: 0 },
          })
          .sort({ 'sort.deadline': -1 })
          .limit(remainingSlots)
          .project({ title: 1, 'sort.price': 1, 'sort.deadline': 1 })
          .toArray()
      : [];

    const items = [...liveAuctions, ...recentSales].map((a) => {
      const rawDeadline = a.sort?.deadline ? new Date(a.sort.deadline).getTime() : 0;
      const realDeadline = rawDeadline + DAY_MS; // compensate scraper -1d offset
      const isLive = realDeadline > now.getTime();

      return {
        title: a.title ?? 'Unknown',
        price: a.sort?.price ?? 0,
        soldDate: rawDeadline ? new Date(rawDeadline).toISOString() : null,
        realDeadline: rawDeadline ? new Date(realDeadline).toISOString() : null,
        isLive,
      };
    });

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
