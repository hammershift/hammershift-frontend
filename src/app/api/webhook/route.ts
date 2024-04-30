import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import Transaction from '@/models/transaction';
import mongoose from 'mongoose';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const signature = headers().get('Stripe-Signature') as string;
    const payload = await req.text();

    let event: Stripe.Event;

    event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET!);

    if (event.type === 'payment_intent.succeeded') {
      const client = await clientPromise;
      const db = client.db();

      const amountPaid = event.data.object.amount_received / 100;
      const userId = event.data.object.metadata.userId;

      if (!userId || amountPaid === 0) {
        throw new Error('Invalid userId or amountPaid');
      }

      const updateResult = await db.collection('users').updateOne({ _id: new mongoose.Types.ObjectId(userId) }, { $inc: { balance: amountPaid } });
      if (updateResult.modifiedCount === 0) {
        throw new Error('User balance update failed');
      }

      const depositTransaction = new Transaction({
        userID: new mongoose.Types.ObjectId(userId),
        transactionType: 'deposit',
        amount: amountPaid,
        type: '+',
        transactionDate: new Date(),
      });

      const createDepositTransaction = await db.collection('transactions').insertOne(depositTransaction);
      console.log(`Created deposit transaction for user id: ${userId}:`, createDepositTransaction);

      return NextResponse.json({ message: 'Success' }, { status: 200 });
    }
    return NextResponse.json({ message: 'Unhandled event type' }, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
