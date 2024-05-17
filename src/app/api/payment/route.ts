import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import mongoose from "mongoose";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const { priceId, userId, userEmail } = await request.json();

    const client = await clientPromise;
    const db = client.db();

    // check for existing Stripe Customer ID
    const user = await db
      .collection("users")
      .findOne({ _id: new mongoose.Types.ObjectId(userId) });

    if (!user) {
      throw new Error("User not found");
    }

    let stripeCustomerId = user.stripeCustomerId;
    let customer;

    if (stripeCustomerId) {
      customer = await stripe.customers.retrieve(stripeCustomerId);
    } else {
      customer = await stripe.customers.create({
        email: user.email,
      });
      stripeCustomerId = customer.id;
      await db
        .collection("users")
        .updateOne(
          { _id: new mongoose.Types.ObjectId(userId) },
          { $set: { stripeCustomerId } }
        );
    }

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      payment_method_types: ["card"],
      customer: stripeCustomerId,
      invoice_creation: {
        enabled: true,
        invoice_data: { metadata: { userId: userId } },
      },
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      payment_intent_data: {
        metadata: {
          userId: userId,
        },
      },
      return_url: `${request.headers.get("origin")}/my_wallet`,
    });

    console.log("Session: ", session);
    return NextResponse.json({
      id: session.id,
      client_secret: session.client_secret,
    });
  } catch (error: any) {
    console.error("Error creating Stripe Checkout session:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
