import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { auctionID, action } = await req.json();
    const client = await clientPromise;
    const db = client.db();
    let convertedAuctionID = new mongoose.Types.ObjectId(auctionID);

    if (action === 'add') {
      const existingItem = await db.collection('watchlist').findOne({ auctionID: convertedAuctionID, userID: new mongoose.Types.ObjectId(session.user.id) });
      if (!existingItem) {
        await db.collection('watchlist').insertOne({
          auctionID: convertedAuctionID,
          userID: new mongoose.Types.ObjectId(session.user.id),
          createdAt: new Date(),
        });
        console.log('Added to watchlist successfully');
        return NextResponse.json({ message: 'Added to watchlist successfully' }, { status: 201 });
      } else {
        console.log('Item already in watchlist');
        return NextResponse.json({ message: 'Item already in watchlist' }, { status: 200 });
      }
    } else if (action === 'remove') {
      await db.collection('watchlist').deleteOne({ auctionID: convertedAuctionID, userID: new mongoose.Types.ObjectId(session.user.id) });
      console.log('Removed from watchlist successfully');
      return NextResponse.json({ message: 'Removed from watchlist successfully' }, { status: 200 });
    } else {
      console.log('Invalid action');
      return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in watchlist operation:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    console.log('Unauthorized: No session found');
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const userWatchlist = await db
      .collection('watchlist')
      .aggregate([
        { $match: { userID: new mongoose.Types.ObjectId(session.user.id) } },
        {
          $lookup: {
            from: 'auctions',
            localField: 'auctionID',
            foreignField: '_id',
            as: 'auctionDetails',
          },
        },
        { $unwind: '$auctionDetails' },
        {
          $project: {
            _id: 1,
            auctionID: 1,
            auctionPot: '$auctionDetails.pot',
            auctionImage: { $arrayElemAt: ['$auctionDetails.images_list.src', 0] },
            auctionYear: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: '$auctionDetails.attributes',
                    as: 'attribute',
                    cond: { $eq: ['$$attribute.key', 'year'] },
                  },
                },
                0,
              ],
            },
            auctionMake: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: '$auctionDetails.attributes',
                    as: 'attribute',
                    cond: { $eq: ['$$attribute.key', 'make'] },
                  },
                },
                0,
              ],
            },
            auctionModel: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: '$auctionDetails.attributes',
                    as: 'attribute',
                    cond: { $eq: ['$$attribute.key', 'model'] },
                  },
                },
                0,
              ],
            },
            auctionDeadline: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: '$auctionDetails.attributes',
                    as: 'attribute',
                    cond: { $eq: ['$$attribute.key', 'deadline'] },
                  },
                },
                0,
              ],
            },
            createdAt: 1,
          },
        },
        { $sort: { createdAt: -1 } },
      ])
      .toArray();

    return NextResponse.json({ watchlist: userWatchlist }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user watchlist:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
