import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

/**
 * GET /api/polygon-markets/[marketId]/history
 *
 * Returns the real stored price history for a market.
 * Price snapshots are written on every trade execution via the trade route.
 * If no history exists yet (brand-new market), returns a single seed point
 * at the market's createdAt timestamp with prices at 0.5/0.5.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ marketId: string }> }
) {
  const { marketId } = await params;

  if (!marketId) {
    return NextResponse.json({ message: 'Missing marketId' }, { status: 400 });
  }

  let marketObjectId: ObjectId;
  try {
    marketObjectId = new ObjectId(marketId);
  } catch {
    return NextResponse.json({ message: 'Invalid marketId format' }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db();

  const market = await db
    .collection('polygon_markets')
    .findOne(
      { _id: marketObjectId },
      { projection: { priceHistory: 1, createdAt: 1 } }
    );

  if (!market) {
    return NextResponse.json({ message: 'Market not found' }, { status: 404 });
  }

  const history = market.priceHistory ?? [];

  if (history.length === 0) {
    return NextResponse.json([
      {
        timestamp: market.createdAt ?? new Date(),
        yesPrice: 0.5,
        noPrice: 0.5,
        volume: 0,
      },
    ]);
  }

  return NextResponse.json(history);
}
