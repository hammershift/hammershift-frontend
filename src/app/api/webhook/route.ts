import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import clientPromise from '@/lib/mongodb';
import mongoose from 'mongoose';
import Transaction from '@/models/transaction';
import { stripe } from '@/lib/stripe';

// export async function POST(req: NextRequest) {
//   const signature = headers().get('Stripe-Signature') as string;
//   const payload = await req.text();

//   let event: Stripe.Event;

//   try {
//     event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET!);
//   } catch (err) {
//     return new NextResponse('Webhook Error: Invalid Signature', { status: 400 });
//   }

//   if (event.type === 'checkout.session.completed') {
//     const session = event.data.object as Stripe.Checkout.Session;
//     if (!session.metadata?.userId || !session.amount_total) {
//       return new NextResponse('Necessary session data missing', { status: 400 });
//     }

//     const userId = session.metadata.userId;
//     const amountPaid = session.amount_total ? session.amount_total / 100 : 0;

//     if (!userId || amountPaid === 0) {
//       return new NextResponse('Invalid userId or amountPaid', { status: 400 });
//     }

//     try {
//       const client = await clientPromise;
//       const db = client.db();

//       const updateResult = await db.collection('users').updateOne({ _id: new mongoose.Types.ObjectId(userId) }, { $inc: { balance: amountPaid } });
//       if (updateResult.modifiedCount === 0) {
//         console.error('User balance update failed');
//         return new NextResponse('User balance update failed', { status: 400 });
//       }

//       const transaction = new Transaction({
//         userID: new mongoose.Types.ObjectId(userId),
//         transactionType: 'deposit',
//         amount: amountPaid,
//         type: '+',
//         transactionDate: new Date(),
//       });

//       const result = await db.collection('transactions').insertOne(transaction);
//       console.log('Transaction inserted with ID:', result.insertedId);

//       return new NextResponse('Success', { status: 200 });
//     } catch (err: any) {
//       return new NextResponse(`Processing error: ${err.message}`, { status: 500 });
//     }
//   }
//   return new NextResponse('Unhandled event type', { status: 200 });
// }

export async function POST(req: NextRequest) {
  try {
    const signature = headers().get('Stripe-Signature') as string;
    const payload = await req.text();

    let event: Stripe.Event;

    event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET!);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      if (!session.metadata?.userId || !session.amount_total) {
        throw new Error('Necessary session data missing');
      }

      const userId = session.metadata.userId;
      const amountPaid = session.amount_total ? session.amount_total / 100 : 0;

      if (!userId || amountPaid === 0) {
        throw new Error('Invalid userId or amountPaid');
      }

      const client = await clientPromise;
      const db = client.db();

      const updateResult = await db.collection('users').updateOne({ _id: new mongoose.Types.ObjectId(userId) }, { $inc: { balance: amountPaid } });
      if (updateResult.modifiedCount === 0) {
        throw new Error('User balance update failed');
      }

      const transaction = new Transaction({
        userID: new mongoose.Types.ObjectId(userId),
        transactionType: 'deposit',
        amount: amountPaid,
        type: '+',
        transactionDate: new Date(),
      });

      const result = await db.collection('transactions').insertOne(transaction);

      return new NextResponse('Success', { status: 200 });
    }
    return new NextResponse('Unhandled event type', { status: 200 });
  } catch (err: any) {
    console.error(err);
    return new NextResponse(`Processing error: ${err.message}`, { status: 500 });
  }
}
