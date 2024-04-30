import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import clientPromise from '@/lib/mongodb';
import mongoose from 'mongoose';
import Transaction from '@/models/transaction';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  const signature = headers().get('Stripe-Signature') as string;
  const payload = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET!);
    console.log('Webhook event received:', event);
  } catch (err) {
    console.error('Error constructing event:', err);
    return new NextResponse('Webhook Error: Invalid Signature', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    if (!session.metadata?.userId || !session.amount_total) {
      return new NextResponse('Necessary session data not found', { status: 400 });
    }

    const userId = session.metadata?.userId;
    const amountPaid = session.amount_total ? session.amount_total / 100 : 0;

    if (!userId || amountPaid === 0) {
      return new NextResponse('Necessary session data not found', { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Update the user's balance by user ID
    const updateUserBalance = await db.collection('users').updateOne({ _id: new mongoose.Types.ObjectId(userId) }, { $inc: { balance: amountPaid } });

    console.log('Balance update result:', updateUserBalance);

    try {
      const transaction = new Transaction({
        userID: new mongoose.Types.ObjectId(userId),
        transactionType: 'deposit',
        amount: session.amount_total / 100,
        type: '+',
        transactionDate: new Date(),
      });
      await transaction.save();
      console.log('Transaction saved:', transaction);
    } catch (err: any) {
      console.error('Transaction save failed:', err.message);
      return new NextResponse(`Transaction save failed: ${err.message}`, { status: 500 });
    }

    return new NextResponse('Success', { status: 200 });
  }

  return new NextResponse('Unhandled event type', { status: 200 });
}
