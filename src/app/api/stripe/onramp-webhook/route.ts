import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * Stripe Onramp webhook handler.
 *
 * Listens for `crypto.onramp_session.updated` events from Stripe.
 * When status is "fulfillment_complete", credits the user's DB balance
 * so the wallet page stays in sync with on-chain USDC.
 *
 * Webhook secret: STRIPE_ONRAMP_WEBHOOK_SECRET (separate from the
 * regular STRIPE_WEBHOOK_SECRET used by the invoice webhook).
 *
 * Register this endpoint in the Stripe dashboard under
 * Developers → Webhooks → Add endpoint:
 *   URL: https://<domain>/api/stripe/onramp-webhook
 *   Events: crypto.onramp_session.updated
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_ONRAMP_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("onramp-webhook: signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Stripe TS types don't include crypto onramp events yet — cast to string
  if ((event.type as string) !== "crypto.onramp_session.updated") {
    return NextResponse.json({ received: true });
  }

  // Use a typed interface for the onramp session shape
  interface OnrampSession {
    id: string;
    status: string;
    wallet_addresses?: { polygon?: string };
    destination_details?: { crypto?: { destination_address?: string } };
    quote?: { destination_amount?: number };
  }
  const session = event.data.object as OnrampSession;

  if (session.status !== "fulfillment_complete") {
    return NextResponse.json({ received: true });
  }

  try {
    const walletAddress: string | undefined =
      session.wallet_addresses?.polygon ??
      session.destination_details?.crypto?.destination_address;

    // destination_amount is in USDC's smallest unit (6 decimals)
    const rawAmount: number | undefined = session.quote?.destination_amount;

    if (!walletAddress || !rawAmount) {
      console.warn("onramp-webhook: missing wallet address or amount", {
        walletAddress,
        rawAmount,
        sessionId: session.id,
      });
      return NextResponse.json({ received: true });
    }

    const usdcAmount = rawAmount / 1_000_000;

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);

    // Find user by their Privy embedded wallet address (lowercase match)
    const user = await db.collection("users").findOneAndUpdate(
      {
        $or: [
          { embeddedWalletAddress: walletAddress.toLowerCase() },
          { embeddedWalletAddress: walletAddress },
          { walletAddress: walletAddress.toLowerCase() },
          { walletAddress: walletAddress },
        ],
      },
      {
        $inc: { balance: usdcAmount },
        $set: { updatedAt: new Date() },
      },
      { returnDocument: "after" }
    );

    if (!user) {
      // User not found — USDC still landed on-chain (that's fine).
      // Log for manual review but don't fail the webhook.
      console.error("onramp-webhook: no user found for wallet address", walletAddress);
      return NextResponse.json({ received: true });
    }

    // Record transaction for audit trail
    await db.collection("transactions").insertOne({
      userID: (user as any)._id,
      transactionType: "deposit",
      amount: usdcAmount,
      type: "+",
      status: "success",
      method: "stripe_onramp",
      stripeSessionId: session.id,
      polygonWalletAddress: walletAddress,
      createdAt: new Date(),
    });

    console.log(
      `onramp-webhook: credited $${usdcAmount} USDC to user ${(user as any)._id} (wallet: ${walletAddress})`
    );
  } catch (err) {
    console.error("onramp-webhook: error processing fulfillment", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
