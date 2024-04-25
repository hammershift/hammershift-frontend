import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function GET(){
const prices = await stripe.prices.list()

return NextResponse.json(prices.data)
}