import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import Transaction from '@/models/transaction';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// export async function GET(req: NextRequest) {
//   const session = await getServerSession(authOptions);
//   if (!session) {
//     return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
//   }

//   const userID = new mongoose.Types.ObjectId(session.user.id);

//   try {
//     const client = await clientPromise;
//     const db = client.db();

//     const wallet = await db.collection('wallet').findOne({ userId: userID });
//     if (!wallet) {
//       return NextResponse.json({ message: 'No wallet found' }, { status: 404 });
//     }

//     return NextResponse.json({ balance: wallet.balance });
//   } catch (error) {
//     console.error('GET Wallet - Internal server error:', error);
//     return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
//   }
// }

// export async function POST(req: NextRequest) {
//   const session = await getServerSession(authOptions);
//   if (!session) {
//     return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
//   }

//   const { wagerAmount } = await req.json();
//   if (!wagerAmount || wagerAmount <= 0) {
//     return NextResponse.json({ message: 'Invalid wager amount' }, { status: 400 });
//   }

//   try {
//     const client = await clientPromise;
//     const db = client.db();

//     const userID = new mongoose.Types.ObjectId(session.user.id);

//     const wallet = await db.collection('wallet').findOne({ userId: userID });
//     if (!wallet || wallet.balance < wagerAmount) {
//       return NextResponse.json({ message: 'Insufficient funds' }, { status: 400 });
//     }

//     const newBalance = wallet.balance - wagerAmount;
//     await db.collection('wallet').updateOne({ userId: userID }, { $set: { balance: newBalance } });

//     // record the transaction (TEST IMPLEMENTATION)
//     const transaction = new Transaction({
//       userID,
//       transactionType: 'wager',
//       amount: wagerAmount,
//       wagerID: mongoose.Schema.Types.ObjectId,
//     });

//     await transaction.save();

//     return NextResponse.json({ message: 'Wager placed successfully', newBalance });
//   } catch (error) {
//     console.error('POST Update Wallet - Internal server error:', error);
//     return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
//   }
// }

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userID = new mongoose.Types.ObjectId(session.user.id);

  try {
    const client = await clientPromise;
    const db = client.db();

    // retrieve the user's balance from the users collection
    const user = await db.collection('users').findOne({ _id: userID });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ balance: user.balance });
  } catch (error) {
    console.error('GET User Wallet - Internal server error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { wagerAmount } = await req.json();
  if (!wagerAmount || wagerAmount <= 0) {
    return NextResponse.json({ message: 'Invalid wager amount' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const userID = new mongoose.Types.ObjectId(session.user.id);

    // retrieve the user and check their balance
    const user = await db.collection('users').findOne({ _id: userID });
    if (!user || user.balance < wagerAmount) {
      return NextResponse.json({ message: 'Insufficient funds' }, { status: 400 });
    }

    // deduct the wager amount from the user's balance and update the user document
    const newBalance = user.balance - wagerAmount;
    await db.collection('users').updateOne({ _id: userID }, { $set: { balance: newBalance } });

    const transaction = new Transaction({
      userID,
      transactionType: 'wager',
      amount: wagerAmount,
      type: '-',
      // might add wagerID?
    });

    await transaction.save();

    return NextResponse.json({ message: 'Wager placed successfully', newBalance });
  } catch (error) {
    console.error('POST Update User Wallet - Internal server error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
