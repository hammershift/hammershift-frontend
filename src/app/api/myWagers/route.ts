import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// export async function GET(req: NextRequest) {
//   const session = await getServerSession(authOptions);
//   if (!session || !session.user) {
//     console.log('Unauthorized: No session found');
//     return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
//   }

//   console.log('User ID from session:', session.user.id);

//   try {
//     const client = await clientPromise;
//     const db = client.db();

//     const userIdFromSession = session.user.id;
//     const userWagers = await db
//       .collection('wagers')
//       .find({ 'user._id': new ObjectId(userIdFromSession) })
//       .sort({ createdAt: -1 })
//       .toArray();

//     return NextResponse.json({ wagers: userWagers }, { status: 200 });
//   } catch (error) {
//     console.error('Error fetching user wagers:', error);
//     return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
//   }
// }

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    console.log('Unauthorized: No session found');
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const userWagers = await db
      .collection('wagers')
      .aggregate([
        { $match: { 'user._id': new mongoose.Types.ObjectId(session.user.id) } }, // match wagers by user ID
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
            priceGuessed: 1,
            wagerAmount: 1,
            user: 1,
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
            // will add more necessary field
            createdAt: 1,
          },
        },

        { $sort: { createdAt: -1 } }, // sort by the creation date of the wager
      ])
      .toArray();

    return NextResponse.json({ wagers: userWagers }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user wagers:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
