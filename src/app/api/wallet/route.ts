import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userID = new mongoose.Types.ObjectId(session.user.id);
  console.log(userID);

  try {
    const client = await clientPromise;
    const db = client.db();

    const wallet = await db.collection('wallet').findOne({ userId: userID });
    if (!wallet) {
      return NextResponse.json({ message: 'No wallet found' }, { status: 404 });
    }

    return NextResponse.json({ balance: wallet.balance });
  } catch (error) {
    console.error('GET Wallet - Internal server error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // extract the wager amount from the request body.
  const { wagerAmount } = await req.json();
  if (!wagerAmount || wagerAmount <= 0) {
    return NextResponse.json({ message: 'Invalid wager amount' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const userID = new mongoose.Types.ObjectId(session.user.id);

    // check if the wallet has enough balance for the wager
    const wallet = await db.collection('wallet').findOne({ userId: userID });
    if (!wallet || wallet.balance < wagerAmount) {
      return NextResponse.json({ message: 'Insufficient funds' }, { status: 400 });
    }

    // deduct the wager amount from the wallet balance
    const newBalance = wallet.balance - wagerAmount;
    await db.collection('wallet').updateOne({ userId: userID }, { $set: { balance: newBalance } });

    return NextResponse.json({ message: 'Wager placed successfully', newBalance });
  } catch (error) {
    console.error('POST Update Wallet - Internal server error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
