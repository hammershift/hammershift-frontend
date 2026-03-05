import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import mongoose from 'mongoose';
import { stripe } from '@/lib/stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  const authSession = await getServerSession(authOptions);
  if (!authSession) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { priceId, userEmail } = await request.json();
    const userId = (authSession as any).user.id;

    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(userId) });

    if (!user) {
      throw new Error('User not found');
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
      await db.collection('users').updateOne({ _id: new mongoose.Types.ObjectId(userId) }, { $set: { stripeCustomerId } });
    }

    const stripeSession = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      payment_method_types: ['card'],
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
      mode: 'payment',
      payment_intent_data: {
        metadata: {
          userId: userId,
        },
      },
      return_url: `${(request as NextRequest).headers.get('origin')}/my_wallet?success=true`,
    });

    return NextResponse.json({
      id: stripeSession.id,
      client_secret: stripeSession.client_secret,
    });
  } catch (error: any) {
    console.error('Error creating Stripe Checkout session:', error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
