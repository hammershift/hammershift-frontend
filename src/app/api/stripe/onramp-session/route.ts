import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { walletAddress } = body;
    // Parse amount explicitly — coerce strings to number, fall back to 100 only when truly absent
    const parsedAmount = body.amount !== undefined && body.amount !== null
      ? Number(body.amount)
      : 100;
    const depositAmount = isNaN(parsedAmount) || parsedAmount <= 0 ? 100 : parsedAmount;

    if (!walletAddress) {
      return NextResponse.json({ message: 'Wallet address required' }, { status: 400 });
    }

    const session = await (stripe as any).crypto.onrampSessions.create({
      transaction_details: {
        destination_currency: 'usdc',
        destination_exchange_amount: String(depositAmount),
        destination_network: 'polygon',
        wallet_address: walletAddress,
        wallet_addresses: { polygon: walletAddress },
        lock_wallet_address: true,
        supported_destination_currencies: ['usdc'],
        supported_destination_networks: ['polygon'],
      },
    });

    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (error: any) {
    console.error('Stripe onramp session error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
