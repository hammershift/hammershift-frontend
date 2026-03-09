import connectToDB from '@/lib/mongoose';
import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';

export const dynamic = 'force-dynamic';

/**
 * GET /api/polygon-markets/[marketId]/history
 *
 * Returns 7 daily YES price data points for sparkline rendering.
 * TODO: Replace synthetic data with real stored price history once
 * PolygonMarket model tracks priceHistory array.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ marketId: string }> }
) {
  try {
    const { marketId } = await params;

    let marketObjectId: Types.ObjectId;
    try {
      marketObjectId = new Types.ObjectId(marketId);
    } catch {
      return NextResponse.json({ message: 'Invalid marketId' }, { status: 400 });
    }

    await connectToDB();
    const db = mongoose.connection.db!;

    const market = await db
      .collection('polygon_markets')
      .findOne({ _id: marketObjectId }, { projection: { yesPrice: 1 } });

    if (!market) {
      return NextResponse.json({ message: 'Market not found' }, { status: 404 });
    }

    const currentPrice = market.yesPrice ?? 0.5;

    // --- SYNTHETIC HISTORY STUB ---
    // Generates a plausible 7-day random walk ending at currentPrice.
    // Replace with real DB history when PolygonMarket.priceHistory is implemented.
    const points = generateSyntheticHistory(currentPrice, 7, marketId);
    // --- END STUB ---

    return NextResponse.json(points);
  } catch (error) {
    console.error('GET /api/polygon-markets/[marketId]/history error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

function generateSyntheticHistory(
  endPrice: number,
  days: number,
  seed: string
): { day: number; price: number }[] {
  // Deterministic pseudo-random from seed string so sparklines don't flicker on re-render
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }

  const points: { day: number; price: number }[] = [];
  let price = Math.min(Math.max(endPrice + (((hash % 20) - 10) / 100), 0.1), 0.9);

  for (let d = days; d >= 0; d--) {
    points.push({ day: d, price: parseFloat(price.toFixed(3)) });
    hash = ((hash * 1664525 + 1013904223) | 0);
    const delta = ((hash % 10) - 5) / 100;
    price = Math.min(Math.max(price + delta, 0.05), 0.95);
  }

  // Force last point to match actual current price
  points[points.length - 1].price = endPrice;
  return points.reverse();
}
