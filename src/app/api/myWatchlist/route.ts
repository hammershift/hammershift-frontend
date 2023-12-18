import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import Auctions from '@/models/auction.model';
import Watchlist from '@/models/watchlist';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { auctionID, action } = await req.json();
  const convertedAuctionID = new mongoose.Types.ObjectId(auctionID);
  const userID = new mongoose.Types.ObjectId(session.user.id);

  if (action !== 'add' && action !== 'remove') {
    console.log('Invalid action');
    return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
  }

  try {
    if (action === 'add') {
      // check if the auction is expired or not found (TEST IMPLEMENTATION)
      const auction = await Auctions.findOne({
        _id: convertedAuctionID,
        attributes: { $elemMatch: { key: 'status', value: { $ne: 2 } } },
      });

      if (!auction) {
        await Watchlist.deleteOne({ auctionID: convertedAuctionID, userID });
        console.log('Auction not found or is expired, removed from Watchlist if it was there');
        return NextResponse.json({ message: 'Auction not found or is expired, removed from Watchlist if it was there' }, { status: 404 });
      }

      // check if the auction item is already in the watchlist
      const existingAuctionItem = await Watchlist.findOne({ auctionID: convertedAuctionID, userID });
      if (existingAuctionItem) {
        console.log('Auction already in Watchlist');
        return NextResponse.json({ message: 'Auction already in Watchlist' }, { status: 200 });
      }

      await Watchlist.create({ auctionID: convertedAuctionID, userID });
      console.log('Added to Watchlist successfully');
      return NextResponse.json({ message: 'Added to Watchlist successfully' }, { status: 201 });
    }

    // if action is 'remove'
    await Watchlist.deleteOne({ auctionID: convertedAuctionID, userID });
    console.log('Removed from Watchlist successfully');
    return NextResponse.json({ message: 'Removed from Watchlist successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error in watchlist operation:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  console.log('Session:', session);
  if (!session) {
    console.log('Unauthorized: No session found');
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userID = new mongoose.Types.ObjectId(session.user.id);
  console.log('Using userID for query:', userID);

  try {
    const client = await clientPromise;
    const db = client.db();

    const userWatchlist = await db
      .collection('watchlists')
      .aggregate([
        { $match: { userID: userID } },
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
