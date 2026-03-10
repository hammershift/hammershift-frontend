import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/polygon-markets/[marketId]/history
 *
 * Returns 7 deterministic synthetic YES price data points for sparkline rendering.
 * Seed is the marketId so the line is stable across re-renders.
 * Replace with real stored price history once priceHistory is tracked in DB.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ marketId: string }> }
) {
  const { marketId } = await params;

  if (!marketId) {
    return NextResponse.json({ message: 'Missing marketId' }, { status: 400 });
  }

  const points = generateSyntheticHistory(0.5, 7, marketId);
  return NextResponse.json(points);
}

function generateSyntheticHistory(
  endPrice: number,
  days: number,
  seed: string
): { day: number; price: number }[] {
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

  points[points.length - 1].price = endPrice;
  return points.reverse();
}
