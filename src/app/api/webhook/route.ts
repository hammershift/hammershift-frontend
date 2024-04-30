import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

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

        const userEmail = event.data.object.metadata.customer_email;
        const amountPaid = event.data.object.amount_received / 100; 

        // Update the user's balance
        const updateUserBalance = await db.collection("users").updateOne(
          { email: userEmail },
          { $inc: { balance: amountPaid } } 
        );

        console.log(
          `Updated user balance for ${userEmail}:`,
          updateUserBalance
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
