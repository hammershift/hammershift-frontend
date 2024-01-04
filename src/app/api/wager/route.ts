import mongoose from 'mongoose';

import { NextRequest, NextResponse } from 'next/server';
import getServerSession from 'next-auth/next';

import Wager from '@/models/wager';
import clientPromise from '@/lib/mongodb';
import { authOptions } from '@/lib/auth';
import connectToDB from '@/lib/mongoose';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    console.log('Unauthorized: No session found');
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const requestBody = await req.json();
    console.log('Received Wager Data:', requestBody);

    const { auctionID, priceGuessed, wagerAmount, user } = requestBody;

    // validate the fields
    if (!auctionID || priceGuessed === undefined || wagerAmount === undefined) {
      console.log('Missing required fields:', requestBody);
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // convert auctionID from string to ObjectId
    let convertedAuctionID;
    try {
      convertedAuctionID = new mongoose.Types.ObjectId(auctionID);
    } catch (error) {
      console.error('Invalid auctionID:', auctionID, error);
      return NextResponse.json({ message: 'Invalid auctionID' }, { status: 400 });
    }

    const newWager = new Wager({
      _id: new mongoose.Types.ObjectId(),
      auctionID: convertedAuctionID,
      priceGuessed,
      wagerAmount,
      user,
    });

    await newWager.save();

    const client = await clientPromise;
    const db = client.db();

    // calculate the total wager for the auction
    const totalWagerAggregation = await db
      .collection('wagers')
      .aggregate([{ $match: { auctionID: convertedAuctionID } }, { $group: { _id: '$auctionID', totalWager: { $sum: '$wagerAmount' } } }])
      .toArray();

    const totalWager = totalWagerAggregation.length > 0 ? totalWagerAggregation[0].totalWager : 0;

    console.log('Wager created successfully. Total wager for auction:', Math.floor(totalWager * 0.88));

    return NextResponse.json({ message: 'Wager created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error in wager creation:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectToDB();
    const id = req.nextUrl.searchParams.get('id');
    const user = req.nextUrl.searchParams.get('user_id');

    if (id && user) {
      const wager = await Wager.find({
        auctionID: new ObjectId(id),
        'user._id': new ObjectId(user),
      });
      return NextResponse.json(wager);
    }

    //IMPORTANT use the _id instead of auction_id when fetching wagers
    // api/wager?auction_id=656e95bc8727754b7cb5ec6b to get all wagers with the same auctionID
    if (id) {
      const auctionWagers = await Wager.find({ auctionID: new ObjectId(id) }).sort({ createdAt: -1 });
      return NextResponse.json(auctionWagers);
    }

    if (user) {
      const userWagers = await Wager.find({ 'user._id': new ObjectId(user) });
      return NextResponse.json(userWagers);
    }
    // api/wager to get all wagers
    const wagers = await Wager.find();
    return NextResponse.json({ wagers: wagers });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectToDB();
    const id = req.nextUrl.searchParams.get('id');
    const edits = await req.json();

    if (id) {
      const editedWager = await Wager.findOneAndUpdate({ $and: [{ _id: new ObjectId(id) }] }
        ,
        { $set: edits },
        { new: true }
      )
      return NextResponse.json(editedWager, { status: 202 });
    }

  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Internal server error" });
  }
}
