import clientPromise from '@/lib/mongodb';
import Transaction from '@/models/transaction';
import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const authSession = await getServerSession(authOptions);
  if (!authSession) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const mongoSession = await mongoose.startSession();
  mongoSession.startTransaction();

  try {
    const { amount, accountName, accountNumber, bankName, wireRoutingNumber } = await req.json();

    const userID = new ObjectId((authSession as any).user.id);
    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection('users').findOne({ _id: userID }, { session: mongoSession });
    if (!user) {
      throw new Error('User not found');
    }

    if (user.balance < amount) {
      throw new Error('Insufficient balance');
    }

    const transaction = new Transaction({
      userID: userID,
      transactionType: 'withdraw',
      amount: amount,
      type: '-',
      transactionDate: new Date(),
      accountName: accountName,
      accountNumber: accountNumber,
      bankName: bankName,
      wireRoutingNumber: wireRoutingNumber,
      status: 'processing',
    });

    await transaction.save({ session: mongoSession });

    await mongoSession.commitTransaction();
    mongoSession.endSession();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    await mongoSession.abortTransaction();
    mongoSession.endSession();
    console.error('Error processing withdrawal request:', error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
