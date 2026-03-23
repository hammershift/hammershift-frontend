import { NextRequest, NextResponse } from 'next/server';
import connectToDB from '@/lib/mongoose';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ auctionId: string }> }
) {
  try {
    const { auctionId } = await params;
    await connectToDB();
    const db = (await import('mongoose')).default.connection.db;
    if (!db) throw new Error('DB not connected');

    const prediction = await db.collection('agent_predictions').findOne({ auctionId });

    if (!prediction) {
      return NextResponse.json({ error: 'Prediction not found' }, { status: 404 });
    }

    const auction = await db.collection('auctions').findOne(
      { auction_id: auctionId },
      { projection: { title: 1, image: 1, page_url: 1, views: 1, watchers: 1, comments: 1, sort: 1, attributes: 1 } }
    );

    return NextResponse.json({ prediction, auction: auction ?? null });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Agent API] Error fetching prediction detail:', message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
