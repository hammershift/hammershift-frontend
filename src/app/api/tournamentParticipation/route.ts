import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import TournamentWager from '@/models/tournament_wager.model';
import Transaction from '@/models/transaction';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

interface Wager {
  auctionID: ObjectId;
  priceGuessed: number;
  amount: number;
}

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
    const { tournamentID, wagers }: { tournamentID: string; wagers: Wager[] } = await req.json();
    const userID = session.user.id;
    const buyInAmount = 50; // fixed buy-in

    // Calculate total wager amount based on user-submitted wagers
    const totalWagerAmount = wagers.reduce((total, wager) => total + wager.amount, 0);
    const totalDeduction = buyInAmount + totalWagerAmount;

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

    // Verify if the user has sufficient balance for the total deduction
    const user = await db.collection('users').findOne({ _id: new ObjectId(userID) });
    if (!user || user.balance < totalDeduction) {
      throw new Error('Insufficient balance');
    }

    // Deduct the total amount (buy-in + wagers) from the user's wallet
    await db.collection('users').updateOne({ _id: new ObjectId(userID) }, { $inc: { balance: -totalDeduction } }, { session: mongoSession });

    // Create tournament entry and wager record
    await TournamentWager.create(
      [
        {
          tournamentID: new ObjectId(tournamentID),
          buyInAmount,
          wagers,
          user: { _id: new ObjectId(userID), fullName: user.fullName, username: user.username, image: user.image },
        },
      ],
      { session: mongoSession }
    );

    // Record the transaction for the buy-in and wagers
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
        {
          userID: new ObjectId(userID),
          tournamentID: new ObjectId(tournamentID),
          transactionType: 'wager',
          amount: totalWagerAmount, // recording the total wager amount as a single transaction
          type: '-',
          transactionDate: new Date(),
        },
      ],
      { session: mongoSession }
    );

    await mongoSession.commitTransaction();
    return NextResponse.json({ message: 'Tournament participation successful', tournamentID, userID, buyInAmount, totalWagerAmount }, { status: 200 });
  } catch (error) {
    await mongoSession.abortTransaction();
    return NextResponse.json({ message: 'Failed to process tournament participation' }, { status: 500 });
  } finally {
    mongoSession.endSession();
  }
}
