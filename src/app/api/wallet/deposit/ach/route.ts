import { authOptions } from '@/lib/auth';
import Transaction from '@/models/transaction';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { amount, routingNumber, accountNumber, accountType } = body as Record<string, unknown>;

  // Validate amount
  if (amount === undefined || amount === null || typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
    return NextResponse.json({ error: 'amount must be a positive number' }, { status: 400 });
  }

  // Validate routing number — exactly 9 digits
  if (typeof routingNumber !== 'string' || !/^\d{9}$/.test(routingNumber)) {
    return NextResponse.json({ error: 'routingNumber must be exactly 9 digits' }, { status: 400 });
  }

  // Validate account number — non-empty string
  if (typeof accountNumber !== 'string' || accountNumber.trim().length === 0) {
    return NextResponse.json({ error: 'accountNumber is required' }, { status: 400 });
  }

  // Validate account type
  if (accountType !== 'checking' && accountType !== 'savings') {
    return NextResponse.json({ error: 'accountType must be "checking" or "savings"' }, { status: 400 });
  }

  try {
    // Ensure mongoose is connected — reuse existing connection
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI as string);
    }

    const userID = new mongoose.Types.ObjectId((session as any).user.id as string);

    const transaction = new Transaction({
      userID,
      transactionType: 'ach_deposit',
      amount,
      type: '+',
      transactionDate: new Date(),
      status: 'pending',
      method: 'ach',
      // Store only last 4 digits — never persist full sensitive bank identifiers
      routingNumberLast4: routingNumber.slice(-4),
      accountNumberLast4: (accountNumber as string).trim().slice(-4),
    });

    await transaction.save();

    return NextResponse.json({
      success: true,
      transactionId: transaction._id,
      message: 'ACH deposit initiated. Funds typically arrive in 2-3 business days.',
    });
  } catch (error: any) {
    console.error('ACH deposit error:', error.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
