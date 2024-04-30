import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import Transaction from "@/models/transaction";
import mongoose from "mongoose";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest, res: NextResponse) {
  const payload = await req.text();
  const signature = req.headers.get("Stripe-Signature");

  try {
    let event = stripe.webhooks.constructEvent(
      payload,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log("event", event.type);

    // Event handlers
    switch (event.type) {
      case "payment_intent.created":
        console.log("PaymentIntent was created.");
        break;
      case "payment_intent.succeeded":
        const client = await clientPromise;
        const db = client.db();

        const stripeCustomerId = event.data.object.customer;
        const amountPaid = event.data.object.amount_received / 100;
        const userId = event.data.object.metadata.userId;

        const updateUserBalance = await db
          .collection("users")
          .updateOne(
            { stripeCustomerId: stripeCustomerId },
            { $inc: { balance: amountPaid } }
          );

        console.log(
          `Updated user balance for ${stripeCustomerId}:`,
          updateUserBalance
        );

        const depositTransaction = new Transaction({
          userID: new mongoose.Types.ObjectId(userId),
          transactionType: "deposit",
          amount: amountPaid,
          type: "+",
          transactionDate: new Date(),
        });

        const createDepositTransaction = await db
          .collection("transactions")
          .insertOne(depositTransaction);
        console.log(
          `Created deposit transaction for user id: ${userId} with stripe ID: ${stripeCustomerId}:`,
          createDepositTransaction
        );

        break;
      case "payment_intent.payment_failed":
        console.log("PaymentIntent failed.");
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    return NextResponse.json({ status: "Success", event: event.type });
  } catch (error) {
    console.error("Error handling Stripe webhook event:", error);
    return NextResponse.json({ status: "Failed", error: error });
  }
}
