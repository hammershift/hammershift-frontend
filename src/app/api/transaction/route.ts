import mongoose from 'mongoose';

import { authOptions } from '@/lib/auth';
import Transaction from '@/models/transaction';
import { ObjectId } from 'mongodb';

import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userID = new mongoose.Types.ObjectId(session.user.id);

  try {
    const { transactionType, amount } = await req.json();

    const transaction = new Transaction({
      userID,
      transactionType,
      amount,
    });

    await transaction.save();

    return NextResponse.json({ success: true, message: 'Transaction recorded successfully', transaction });
  } catch (error: any) {
    console.error('POST Transaction - Internal server error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error', error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userID = new mongoose.Types.ObjectId(session.user.id);
  const tournamentID = req.nextUrl.searchParams.get('tournamentID');
  const auctionID = req.nextUrl.searchParams.get('auctionID');

  try {
    const client = await clientPromise;
    const db = client.db();

    //fetch buy in transaction from a specific tournament
    if (tournamentID) {
      const tournamentTransactions = await db.collection('transactions').find({
        tournamentID: new ObjectId(tournamentID),
        transactionType: "tournament buy-in",
        type: "-"
      }).toArray();

      return NextResponse.json(tournamentTransactions);
    }

    if (auctionID) {
      const auctionTransactions = await db.collection('transactions').find({
        auctionID: new ObjectId(auctionID),
        transactionType: "wager",
        type: "-"
      }).toArray();

      return NextResponse.json(auctionTransactions);
    }

    const transactions = await db.collection('transactions').find({ userId: userID }).toArray();

    return NextResponse.json({ success: true, transactions });
  } catch (error: any) {
    console.error('GET Transactions - Internal server error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error', error: error.message }, { status: 500 });
  }
}

// export async function POST(req: NextRequest) {
//   const session = await getServerSession(authOptions);
//   if (!session) {
//     return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
//   }

//   const userID = new mongoose.Types.ObjectId(session.user.id);

//   try {
//     const { transactionType, amount } = await req.json(); // Assuming the schema uses 'amount'

//     if (!transactionType || amount === undefined) {
//       return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
//     }

//     const transaction = new Transaction({
//       userID,
//       transactionType,
//       amount, // Changed from wagerAmount to amount
//     });

//     await transaction.save();

//     return NextResponse.json({ success: true, message: 'Transaction recorded successfully', transaction });
//   } catch (error) {
//     console.error('POST Transaction - Error:', error);
//     return NextResponse.json({ success: false, message: 'Error recording transaction', error: error.message }, { status: 500 });
//   }
// }

// export async function GET(req: NextRequest) {
//   const session = await getServerSession(authOptions);
//   if (!session) {
//     return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
//   }

//   const userID = new mongoose.Types.ObjectId(session.user.id);

//   try {
//     const transactions = await Transaction.find({ userID }).sort({ transactionDate: -1 });
//     // Consider adding .limit() for pagination

//     return NextResponse.json({ success: true, transactions });
//   } catch (error) {
//     console.error('GET Transactions - Error:', error);
//     return NextResponse.json({ success: false, message: 'Error fetching transactions', error: error.message }, { status: 500 });
//   }
// }
