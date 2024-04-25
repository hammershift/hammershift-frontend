import { stripe } from '@/lib/stripe';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const prices = await stripe.prices.list({
      limit: 6,
    });

    const sortedPrices = prices.data.filter((price) => price.unit_amount !== null).sort((a, b) => (a.unit_amount || 0) - (b.unit_amount || 0));

    return NextResponse.json(sortedPrices);
  } catch (error) {
    console.error('Error fetching prices:', error);
    return NextResponse.json({ error: 'Failed to fetch prices' }, { status: 500 });
  }
}
