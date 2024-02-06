import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import getServerSession from 'next-auth/next';
import Transaction from '@/models/transaction';
import clientPromise from '@/lib/mongodb';
import TournamentWager from '@/models/tournament_wager.model';
import { authOptions } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db();
  // const mongoSession = client.startSession();

  // let transactionCommitted = false;

  try {
    // await mongoSession.startTransaction();
    // console.log('Transaction started');

    const requestBody = await req.json();
    console.log('Received Wager Data:', requestBody);

    const { tournamentID, wagers, buyInAmount, user } = requestBody;
    if (!tournamentID || !wagers || !buyInAmount || !user) {
      console.log('Missing required fields:', requestBody);
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    for (const subWager of wagers) {
      const { auctionID, priceGuessed } = subWager;
      if (!auctionID || priceGuessed === undefined) {
        console.log('Invalid sub-wager:', subWager);
        return NextResponse.json({ message: 'Invalid sub-wager' }, { status: 400 });
      }
    }

    // const userBalance = await db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(user._id) });
    // if (!userBalance || userBalance.balance < buyInAmount) {
    //   return NextResponse.json({ message: 'Insufficient balance' }, { status: 400 });
    // }

    const newTournamentWager = new TournamentWager({
      tournamentID: new mongoose.Types.ObjectId(tournamentID),
      wagers,
      buyInAmount,
      user,
    });

    await db.collection('tournament_wagers').insertOne(newTournamentWager);
    // await TournamentWager.insertMany(newWagers, { session: mongoSession });

    // const transaction = new Transaction({
    //   userID: new mongoose.Types.ObjectId(user._id),
    //   wagerIDs: newWagers.map((wager: any) => wager._id),
    //   tournamentID: new mongoose.Types.ObjectId(tournamentID),
    //   transactionType: 'wager',
    //   amount: buyInAmount,
    //   type: '-',
    //   transactionDate: new Date(),
    // });

    // await transaction.save({ session: mongoSession });

    // await mongoSession.commitTransaction();
    // console.log('Transaction committed');
    // console.log('Wagers and transaction created successfully');
    // transactionCommitted = true;

    return NextResponse.json({ message: 'Wagers created successfully' }, { status: 201 });
  } catch (error) {
    console.log('An error occurred');
    // if (!transactionCommitted) {
    //   console.log('Aborting transaction');
    //   await mongoSession.abortTransaction();
    // }
    console.error('Error in wager creation:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  } finally {
    console.log('Ending session');
    // await mongoSession.endSession();
  }
}

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const tournamentID = req.nextUrl.searchParams.get('tournament_id');

    if (tournamentID) {
      const wagers = await db.collection('tournament_wagers').find({
        $and: [{ tournamentID: new ObjectId(tournamentID) }, { isActive: true }]
      }).toArray();
      return NextResponse.json({ wagers });
    }

    const wagers = await db.collection('tournament_wagers').find().toArray();
    return NextResponse.json({ wagers: wagers });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' });
  }
}