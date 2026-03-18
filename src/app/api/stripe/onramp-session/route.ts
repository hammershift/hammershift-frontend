import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { walletAddress } = body;
    const parsedAmount = body.amount !== undefined && body.amount !== null
      ? Number(body.amount)
      : 100;
    const depositAmount = isNaN(parsedAmount) || parsedAmount <= 0 ? 100 : parsedAmount;

    if (!walletAddress) {
      return NextResponse.json({ message: 'Wallet address required' }, { status: 400 });
    }

    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
    if (!STRIPE_SECRET_KEY) {
      return NextResponse.json({ message: 'Stripe not configured' }, { status: 500 });
    }

    // stripe.crypto does not exist in the Node SDK — use the REST API directly
    const params = new URLSearchParams();
    params.append('transaction_details[destination_currency]', 'usdc');
    params.append('transaction_details[destination_exchange_amount]', String(depositAmount));
    params.append('transaction_details[destination_network]', 'polygon');
    params.append('transaction_details[wallet_addresses][polygon]', walletAddress);
    params.append('transaction_details[lock_wallet_address]', 'true');
    params.append('transaction_details[supported_destination_currencies][]', 'usdc');
    params.append('transaction_details[supported_destination_networks][]', 'polygon');

    const response = await fetch('https://api.stripe.com/v1/crypto/onramp_sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const session = await response.json();

    if (!response.ok) {
      const stripeError = session?.error?.message ?? JSON.stringify(session);
      console.error('Stripe onramp session error:', stripeError);
      return NextResponse.json(
        { message: `Stripe error: ${stripeError}` },
        { status: response.status }
      );
    }

    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Stripe onramp session error:', error);
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}
