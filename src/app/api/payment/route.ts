import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import mongoose from 'mongoose';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

//For stripe hosted checkout
// export async function POST(req: NextRequest) {
//   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
//   let data = await req.json();
//   const host = req.headers.get("host");
//   let priceId = data.priceId;
//   const session = await stripe.checkout.sessions.create({
//     line_items: [{ price: priceId, quantity: 1 }],
//     mode: "payment",
//     success_url: `http://localhost:3000`,
//   });

//   return NextResponse.json(session.url);
// }

// For embedded forms
// export async function POST(request: Request) {
//   try {
//     const { priceId } = await request.json();

//     const session = await stripe.checkout.sessions.create({
//       ui_mode: 'embedded',
//       payment_method_types: ['card'],
//       line_items: [
//         {
//           price: priceId,
//           quantity: 1,
//         },
//       ],
//       mode: 'payment',
//       return_url: `${request.headers.get('origin')}/return?session_id={CHECKOUT_SESSION_ID}`,
//     });

//     return NextResponse.json({
//       id: session.id,
//       client_secret: session.client_secret,
//     });
//   } catch (error: any) {
//     console.error(error);
//     return NextResponse.json({ message: error.message }, { status: 500 });
//   }
// }

export async function POST(request: Request) {
  try {
    const { priceId, userId } = await request.json();

    const client = await clientPromise;
    const db = client.db();

    // check for existing Stripe Customer ID
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

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      payment_method_types: ['card'],
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        userId: userId,
      },
      return_url: `${request.headers.get('origin')}/return?session_id={CHECKOUT_SESSION_ID}`,
    });

    console.log(session);
    return NextResponse.json({
      id: session.id,
      client_secret: session.client_secret,
    });
  } catch (error: any) {
    console.error('Error creating Stripe Checkout session:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
