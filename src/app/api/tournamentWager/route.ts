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

  try {
    const requestBody = await req.json();
    console.log('Received Wager Data:', requestBody);

    const { tournamentID, wagers, buyInAmount, user } = requestBody;

    if (!tournamentID || !wagers || !buyInAmount || !user) {
      console.log('Missing required fields:', requestBody);
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // validate tournament details
    const tournament = await db.collection('tournaments').findOne({ _id: new ObjectId(tournamentID) });
    if (!tournament || !tournament.isActive) {
      return NextResponse.json({ message: 'Invalid or inactive tournament' }, { status: 400 });
    }

    // check if user already participated
    const existingEntry = await db.collection('tournament_wagers').findOne({
      tournamentID: new ObjectId(tournamentID),
      'user._id': new ObjectId(user._id),
    });
    if (existingEntry) {
      return NextResponse.json({ message: 'User has already entered the tournament' }, { status: 400 });
    }

    // validate sub-wagers
    for (const subWager of wagers) {
      const { auctionID, priceGuessed } = subWager;
      if (!auctionID || priceGuessed === undefined) {
        console.log('Invalid sub-wager:', subWager);
        return NextResponse.json({ message: 'Invalid sub-wager' }, { status: 400 });
      }
    }

    // deduct buy-in amount from the user's wallet
    const userInfo = await db
      .collection('users')
      .findOne({ _id: new mongoose.Types.ObjectId(user._id) });

    if (userInfo) {
      if (userInfo.balance < buyInAmount) {
        return NextResponse.json({ message: 'Insufficient funds for buy-in' }, { status: 400 });
      } else {
        const userUpdateResult = await db
          .collection('users')
          .findOneAndUpdate({ _id: new mongoose.Types.ObjectId(user._id) }, { $inc: { balance: -buyInAmount } }, { returnDocument: 'after' });
      }
    }

    //get auction images
    const tournamentAuctions = await db
      .collection('auctions')
      .find({ tournamentID: new mongoose.Types.ObjectId(tournamentID) })
      .toArray();

    const tournamentImages = tournamentAuctions.map((auction) => auction.image);


    // create the transaction record for the buy-in
    await db.collection('transactions').insertOne({
      userID: new mongoose.Types.ObjectId(user._id),
      tournamentID: new ObjectId(tournamentID),
      transactionType: 'tournament buy-in',
      amount: buyInAmount,
      type: '-',
      transactionDate: new Date(),
    });

    const newTournamentWager = new TournamentWager({
      tournamentID: new ObjectId(tournamentID),
      wagers,
      buyInAmount,
      user,
      tournamentImages
    });

    await db.collection('tournament_wagers').insertOne(newTournamentWager);

    return NextResponse.json({ message: 'Tournament wager created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error in wager creation:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const tournamentID = req.nextUrl.searchParams.get('tournament_id');
    const userID = req.nextUrl.searchParams.get('user_id');

    if (tournamentID && userID) {
      const userWager = await db.collection('tournament_wagers').findOne({
        tournamentID: new ObjectId(tournamentID),
        'user._id': new ObjectId(userID),
        isActive: true
      });
      return NextResponse.json(userWager);
    }

    if (tournamentID) {
      const wagers = await db.collection('tournament_wagers').find({
        tournamentID: new ObjectId(tournamentID),
        isActive: true
      })
        .sort({ createdAt: -1 })
        .toArray();
      return NextResponse.json(wagers);
    }

    const wagers = await db.collection('tournament_wagers').find().toArray();
    return NextResponse.json({ wagers: wagers });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' });
  }
}
