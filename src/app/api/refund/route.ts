import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import Transaction from '@/models/transaction';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { auctionID } = await req.json();
    const convertedAuctionID = new mongoose.Types.ObjectId(auctionID);

    const client = await clientPromise;
    const db = client.db();

    // check if the auction is unsuccessful
    const auction = await db.collection('auctions').findOne({ _id: convertedAuctionID });
    const statusAttribute = auction?.attributes.find((attr: { key: string }) => attr.key === 'status');
    if (!statusAttribute || statusAttribute.value !== 3) {
      return NextResponse.json({ message: 'Auction is successful or does not exist' }, { status: 400 });
    }

    // find wagers related to the unsuccessful auction
    const unsuccessfulWagers = await db.collection('wagers').find({ auctionID: convertedAuctionID }).toArray();

    // process refunds for these wagers
    for (let wager of unsuccessfulWagers) {
      const user = await db.collection('users').findOne({ _id: wager.user._id });
      if (!user) continue;

      const updatedBalance = (user.balance || 0) + wager.wagerAmount;

      await db.collection('users').updateOne({ _id: user._id }, { $set: { balance: updatedBalance } });

      const refundTransaction = new Transaction({
        userID: user._id,
        wagerID: wager._id,
        transactionType: 'refund',
        amount: wager.wagerAmount,
        type: '+',
        transactionDate: new Date(),
      });

      await refundTransaction.save();
    }

    console.log('Refunds processed successfully for unsuccessful auction');
    return NextResponse.json({ message: 'Refunds processed successfully for unsuccessful auction' }, { status: 200 });
  } catch (error) {
    console.error('Error processing refunds:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
