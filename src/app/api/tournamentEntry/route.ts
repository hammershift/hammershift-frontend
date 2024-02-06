import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import TournamentWager from '@/models/tournament_wager.model';
import Transaction from '@/models/transaction';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db();
  const mongoSession = await client.startSession();

  try {
    const { tournamentID } = await req.json();
    const userID = session.user.id;
    const buyInAmount = 50;

    await mongoSession.startTransaction();

    // validate tournament details. Unsure of the naming convention for the collections yet
    const tournament = await db.collection('tournaments').findOne({ _id: new ObjectId(tournamentID) });
    if (!tournament || !tournament.isActive) {
      return NextResponse.json({ message: 'Invalid or inactive tournament' }, { status: 400 });
    }

    // check if user already participated
    const existingEntry = await db.collection('tournament_wagers').findOne({
      tournamentID: new ObjectId(tournamentID),
      'user._id': new ObjectId(userID),
    });
    if (existingEntry) {
      return NextResponse.json({ message: 'User has already entered the tournament' }, { status: 400 });
    }

    // deduct the buy-in amount from the user's wallet balance
    const user = await db.collection('users').findOne({ _id: new ObjectId(userID) });
    if (user?.balance < buyInAmount) {
      return NextResponse.json({ message: 'Insufficient balance' }, { status: 400 });
    }

    // deduct buy-in amount from user's wallet
    await db.collection('users').updateOne({ _id: new ObjectId(userID) }, { $inc: { balance: -buyInAmount } }, { session: mongoSession });

    // create tournament entry record
    const newTournamentWager = new TournamentWager({
      tournamentID: new ObjectId(tournamentID),
      buyInAmount,
      user: { _id: new ObjectId(userID), ...user },
      wagers: [],
    });

    await db.collection('tournamentWagers').insertOne(newTournamentWager, { session: mongoSession });

    // record the buy-in transaction
    const transaction = new Transaction({
      userID: new ObjectId(userID),
      tournamentID: new ObjectId(tournamentID),
      transactionType: 'tournament buy-in',
      amount: buyInAmount,
      type: '-',
      transactionDate: new Date(),
    });

    await db.collection('transactions').insertOne(transaction, { session: mongoSession });
    await mongoSession.commitTransaction();

    return NextResponse.json({ message: 'Tournament entry successful', tournamentID, userID, buyInAmount }, { status: 200 });
  } catch (error) {
    console.error('Error in buy-in process:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  } finally {
    await mongoSession.endSession();
  }
}
