export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

const ALLOWED_AMOUNTS = [25, 50, 100, 250, 500, 1000];

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { amount } = await req.json();

  if (!ALLOWED_AMOUNTS.includes(amount)) {
    return NextResponse.json(
      { error: `Invalid amount. Choose from: ${ALLOWED_AMOUNTS.join(", ")}` },
      { status: 400 }
    );
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://velocity-markets.com";

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Velocity Markets — $${amount} Deposit`,
              description: "Add funds to your Velocity Markets account",
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: session.user.id,
        depositAmount: String(amount),
        type: "usd_deposit",
      },
      success_url: `${baseUrl}/my_wallet?deposit=success&amount=${amount}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/my_wallet?deposit=cancelled`,
    });

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (err) {
    console.error("Stripe checkout session creation failed:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
