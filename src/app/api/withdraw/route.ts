import clientPromise from '@/lib/mongodb';
import Transaction from '@/models/transaction';
import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log('Starting transaction...');

    const { amount, accountName, accountNumber, bankName, wireRoutingNumber, userId } = await req.json();
    console.log('Request data:', {
      amount,
      accountName,
      accountNumber,
      bankName,
      wireRoutingNumber,
      userId,
    });

    const userID = new ObjectId(userId);
    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection('users').findOne({ _id: userID }, { session });
    if (!user) {
      throw new Error('User not found');
    }

    console.log('User found:', user);

    // check for wallet balance
    if (user.balance < amount) {
      console.error('Insufficient balance:', user.balance);
      throw new Error('Insufficient balance');
    }

    console.log('Sufficient balance available');

    // create a transaction record
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
    console.log('Transaction object before save:', transaction);

    await transaction.save({ session });

    console.log('Transaction saved:', transaction);

    await session.commitTransaction();
    session.endSession();

    console.log('Transaction committed');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error processing withdrawal request:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
