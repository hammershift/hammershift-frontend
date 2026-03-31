export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

/**
 * POST /api/stripe/verify-checkout
 * Verifies a Stripe Checkout session and credits the user if the webhook
 * hasn't already recorded the transaction (belt-and-suspenders).
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = await req.json();
  if (!sessionId || typeof sessionId !== "string") {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    // Verify this session belongs to the requesting user
    if (checkoutSession.metadata?.userId !== session.user.id) {
      return NextResponse.json({ error: "Session mismatch" }, { status: 403 });
    }

    if (checkoutSession.payment_status !== "paid") {
      return NextResponse.json({
        credited: false,
        reason: "Payment not completed",
      });
    }

    const depositAmount = parseFloat(
      checkoutSession.metadata?.depositAmount ?? "0"
    );
    if (depositAmount <= 0) {
      return NextResponse.json({
        credited: false,
        reason: "Invalid deposit amount",
      });
    }

    const client = await clientPromise;
    const db = client.db();

    // Idempotency: check if webhook already recorded this
    const existing = await db
      .collection("transactions")
      .findOne({ stripeSessionId: sessionId });

    if (existing) {
      return NextResponse.json({ credited: true, amount: depositAmount, source: "webhook" });
    }

    // Webhook missed — credit now
    const userId = new ObjectId(session.user.id);

    await db.collection("users").updateOne(
      { _id: userId },
      { $inc: { balance: depositAmount } }
    );

    await db.collection("transactions").insertOne({
      userID: userId,
      transactionType: "deposit",
      method: "stripe_checkout",
      amount: depositAmount,
      type: "+",
      transactionDate: new Date(),
      stripeSessionId: sessionId,
      status: "success",
    });

    console.log(
      `verify-checkout: credited $${depositAmount} to user ${session.user.id} (webhook fallback)`
    );

    return NextResponse.json({ credited: true, amount: depositAmount, source: "verify" });
  } catch (err) {
    console.error("verify-checkout error:", err);
    return NextResponse.json(
      { error: "Failed to verify checkout session" },
      { status: 500 }
    );
  }
}
