import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDB from '@/lib/mongoose';
import Users from '@/models/user.model';
import Transaction from '@/models/transaction';
import { Types } from 'mongoose';

export const dynamic = "force-dynamic";

/**
 * POST /api/stripe/onramp-complete
 *
 * Called by the client-side DepositModal after the Stripe Onramp widget
 * fires an `onramp_session_updated` event with status `fulfillment_complete`.
 *
 * Server verifies the session directly with Stripe, checks for duplicate
 * processing via stripeSessionId, then credits the user's balance and
 * records an audit transaction.
 */
export async function POST(req: NextRequest) {
  // 1. Auth guard
  const session = await getServerSession(authOptions);
  if (!session?.user?._id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // 2. Parse and validate body
  let sessionId: string;
  try {
    const body = await req.json();
    sessionId = body?.sessionId;
  } catch {
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
  }

  if (!sessionId || typeof sessionId !== 'string') {
    return NextResponse.json({ message: 'sessionId is required' }, { status: 400 });
  }

  // 3. Verify session with Stripe via direct REST fetch — stripe.crypto is undefined in SDK v15.x
  let onrampSession: any;
  try {
    const stripeRes = await fetch(
      `https://api.stripe.com/v1/crypto/onramp_sessions/${sessionId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        },
      }
    );
    if (!stripeRes.ok) {
      const errBody = await stripeRes.text();
      console.error('onramp-complete: Stripe API returned non-OK', stripeRes.status, errBody);
      return NextResponse.json({ message: 'Session not found' }, { status: 404 });
    }
    onrampSession = await stripeRes.json();
  } catch (err: any) {
    console.error('onramp-complete: Stripe session retrieval failed', err);
    return NextResponse.json({ message: 'Failed to verify session with Stripe' }, { status: 502 });
  }

  // 4. Guard: only process completed sessions
  if (onrampSession?.status !== 'fulfillment_complete') {
    return NextResponse.json(
      { message: `Session not complete (status: ${onrampSession?.status ?? 'unknown'})` },
      { status: 422 }
    );
  }

  // 5. Extract USDC amount — destination_amount is in USDC's 6-decimal unit form
  const rawAmount: number | undefined = onrampSession?.quote?.destination_amount;
  if (!rawAmount || rawAmount <= 0) {
    console.error('onramp-complete: missing or zero destination_amount', { sessionId, onrampSession });
    return NextResponse.json({ message: 'Cannot determine credited amount' }, { status: 422 });
  }
  const usdcAmount = rawAmount / 1_000_000;

  await connectToDB();

  // 6. Idempotency check — reject if this sessionId was already processed
  const alreadyProcessed = await Transaction.findOne({ stripeSessionId: sessionId }).lean();
  if (alreadyProcessed) {
    // Return success silently — safe to call twice (e.g., page refresh after completion)
    return NextResponse.json({ success: true, credited: usdcAmount, duplicate: true });
  }

  // 7. Locate the authenticated user
  const userId = new Types.ObjectId(session.user._id as string);
  const user = await Users.findById(userId);
  if (!user) {
    console.error('onramp-complete: authenticated user not found in DB', { userId });
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  // 8. Credit balance and record transaction atomically (sequential writes — Mongo transactions
  //    require a replica set; this app uses a shared cluster so we do two writes and rely on the
  //    idempotency check above for safety)
  user.balance = (user.balance ?? 0) + usdcAmount;
  user.updatedAt = new Date();
  await user.save();

  await Transaction.create({
    userID: userId,
    transactionType: 'deposit',
    amount: usdcAmount,
    type: '+',
    status: 'success',
    method: 'stripe_onramp',
    stripeSessionId: sessionId,
    transactionDate: new Date(),
  });

  console.log(
    `onramp-complete: credited $${usdcAmount} USDC to user ${userId} via session ${sessionId}`
  );

  return NextResponse.json({ success: true, credited: usdcAmount });
}
