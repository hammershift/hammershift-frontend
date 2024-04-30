import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

//For stripe hosted checkout
// export async function POST(req: NextRequest) {
//   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
//   let data = await req.json();
//   const host = req.headers.get("host");
//   let priceId = data.priceId;
//   const session = await stripe.checkout.sessions.create({
//     line_items: [{ price: priceId, quantity: 1 }],
//     mode: "payment",
//     success_url: `http://localhost:3000`,
//   });

//   return NextResponse.json(session.url);
// }

// For embedded forms
export async function POST(request: Request) {
  try {
    const { priceId } = await request.json();

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      return_url: `${request.headers.get(
        "origin"
      )}/return?session_id={CHECKOUT_SESSION_ID}`,
    });

    return NextResponse.json({
      id: session.id,
      client_secret: session.client_secret,
    });
  } catch (error: any) {
    console.error("Error creating Stripe Checkout session:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
