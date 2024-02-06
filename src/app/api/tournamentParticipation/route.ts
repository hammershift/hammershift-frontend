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
    await mongoSession.startTransaction();
    const body = await req.json();
    const { tournamentID, wagers } = body;
    const userID = session.user.id;
    const buyInAmount = 50;

    // Validate tournament details
    const tournament = await db.collection('tournaments').findOne({ _id: new ObjectId(tournamentID) });
    if (!tournament || !tournament.isActive) {
      throw new Error('Invalid or inactive tournament');
    }

    // Check if user already participated
    const existingEntry = await db.collection('tournament_wagers').findOne(
      {
        tournamentID: new ObjectId(tournamentID),
        'user._id': new ObjectId(userID),
      },
      { session: mongoSession }
    );
    if (existingEntry) {
      throw new Error('User has already entered the tournament');
    }

    // Deduct the buy-in amount from the user's wallet balance
    const { value: user } = await db
      .collection('users')
      .findOneAndUpdate({ _id: new ObjectId(userID) }, { $inc: { balance: -buyInAmount } }, { session: mongoSession, returnDocument: 'after' });
    if (!user || user.balance < 0) {
      throw new Error('Insufficient balance');
    }

    // Create tournament entry and wager record
    await TournamentWager.create(
      [
        {
          tournamentID: new ObjectId(tournamentID),
          buyInAmount,
          user: { _id: new ObjectId(userID), fullName: user.fullName, username: user.username, image: user.image },
          wagers: wagers,
        },
      ],
      { session: mongoSession }
    );

    // Record the buy-in transaction
    await Transaction.create(
      [
        {
          userID: new ObjectId(userID),
          tournamentID: new ObjectId(tournamentID),
          transactionType: 'tournament buy-in',
          amount: buyInAmount,
          type: '-',
          transactionDate: new Date(),
        },
      ],
      { session: mongoSession }
    );

    await mongoSession.commitTransaction();
    return NextResponse.json({ message: 'Tournament participation successful' }, { status: 200 });
  } catch (error) {
    await mongoSession.abortTransaction();
    return NextResponse.json({ message: 'Failed to process tournament participation' }, { status: 500 });
  } finally {
    await mongoSession.endSession();
  }
}
