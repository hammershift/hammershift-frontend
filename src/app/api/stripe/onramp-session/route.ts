import { NextRequest, NextResponse } from 'next/server';
import { privyClient } from '@/lib/privy';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Auth guard — verify Privy bearer token
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    try {
      await privyClient.verifyAuthToken(authHeader.replace('Bearer ', ''));
    } catch {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

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

    // Extract real client IP from headers (AWS ALB / Amplify / Cloudfront)
    const customerIp =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      req.headers.get('x-real-ip') ??
      '127.0.0.1';

    const params = new URLSearchParams();
    params.append('wallet_addresses[polygon]', walletAddress);
    params.append('lock_wallet_address', 'true');
    params.append('source_currency', 'usd');
    params.append('destination_amount', String(depositAmount));
    params.append('destination_currency', 'usdc');
    params.append('destination_network', 'polygon');
    params.append('destination_currencies[]', 'usdc');
    params.append('destination_networks[]', 'polygon');
    params.append('customer_ip_address', customerIp);

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
      console.error('Stripe onramp session error:', stripeError, 'Full response:', JSON.stringify(session));
      return NextResponse.json(
        { message: `Stripe error: ${stripeError}` },
        { status: response.status }
      );
    }

    return NextResponse.json({
      redirectUrl: session.url ?? session.redirect_url,
      clientSecret: session.client_secret,
      sessionId: session.id,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Stripe onramp session error:', error);
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}
