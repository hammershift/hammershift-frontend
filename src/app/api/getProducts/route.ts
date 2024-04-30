import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET() {
  try {
    const prices = await stripe.prices.list();
    return NextResponse.json(prices.data);
  } catch (error) {
    NextResponse.json({ status: "Failed to get price list", error: error });
  }
}
