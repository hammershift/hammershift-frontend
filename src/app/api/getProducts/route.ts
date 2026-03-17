import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const priceList = await stripe.prices.list({
      active: true,
      expand: ['data.product'],
    });

    const products = priceList.data.map((price) => {
      const product = price.product as { name?: string } | null;
      return {
        id: price.id,
        unit_amount: price.unit_amount,
        currency: price.currency,
        product_name: product?.name ?? null,
      };
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching Stripe products:', error);
    return NextResponse.json(
      { message: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
