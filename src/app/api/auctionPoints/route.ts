import clientPromise from '@/lib/mongodb';
import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const leaderboardData = await db
      .collection('auction_points')
      .aggregate([
        {
          $group: {
            _id: '$userID',
            totalPoints: { $sum: '$points' },
            fullName: { $first: '$fullName' },
            username: { $first: '$username' },
            image: { $first: '$image' },
            auctions: { $push: { auctionID: '$auctionID', points: '$points', rank: '$rank' } },
          },
        },
        { $sort: { totalPoints: -1 } },
      ])
      .toArray();

    return NextResponse.json(leaderboardData);
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const { userID, auctionID, points } = await req.json();

    const updateResult = await db.collection('auction_points').updateOne(
      {
        userID: new mongoose.Types.ObjectId(userID),
        auctionID: new mongoose.Types.ObjectId(auctionID),
      },
      {
        $set: { points },
      }
    );

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json({ message: 'No changes made or item not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Points updated successfully' });
  } catch (error) {
    console.error('Error updating auction points:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
