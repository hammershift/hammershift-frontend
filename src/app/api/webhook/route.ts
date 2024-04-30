import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import clientPromise from '@/lib/mongodb';
import mongoose from 'mongoose';
import Transaction from '@/models/transaction';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// export async function POST(req: NextRequest, res: NextResponse) {
//   const payload = await req.text();
//   const signature = req.headers.get('Stripe-Signature');

//   try {
//     let event = stripe.webhooks.constructEvent(payload, signature!, process.env.STRIPE_WEBHOOK_SECRET!);

//     console.log('event', event.type);
//     //event handlers
//     switch (event.type) {
//       case 'payment_intent.created':
//         console.log('created payment intent');
//     }
//     return NextResponse.json({ status: 'Success', event: event.type });
//   } catch (error) {
//     return NextResponse.json({ status: 'Failed', error });
//   }
// }

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

    const userId = session.metadata.userId;
    console.log('User ID:', userId);

    const client = await clientPromise;
    const db = client.db();

    const userObjectId = new mongoose.Types.ObjectId(userId);
    console.log('User ObjectID:', userObjectId);

    const user = await db.collection('users').findOne({ _id: userObjectId });
    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const amountToAdd = session.amount_total / 100;
    console.log('Amount to Add:', amountToAdd);
    const newBalance = user.balance + amountToAdd;
    console.log('New Balance:', newBalance);

    const updateResult = await db.collection('users').updateOne({ _id: userObjectId }, { $set: { balance: newBalance } });
    console.log('Balance update result:', updateResult);

    if (updateResult.modifiedCount === 0) {
      console.error('Balance update failed');
      return new NextResponse('Balance update failed', { status: 500 });
    }

    // Record the transaction
    const transaction = new Transaction({
      userID: session.metadata.userId,
      transactionType: 'deposit',
      amount: session.amount_total / 100,
      type: '+',
      transactionDate: new Date(),
    });
    console.log(transaction);
    await transaction.save();

    return new NextResponse('Success', { status: 200 });
  }
}
