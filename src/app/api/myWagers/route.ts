import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    console.log('Unauthorized: No session found');
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const userID = new mongoose.Types.ObjectId(session.user.id);

    const userWagers = await db
      .collection('wagers')
      .aggregate([
        { $match: { 'user._id': userID } },
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
            auctionAttributes: '$auctionDetails.attributes',
            createdAt: 1,
          },
        },
        { $sort: { createdAt: -1 } },
      ])
      .toArray();

    // extracted 'price' from the attributes
    userWagers.forEach((wager) => {
      const priceAttribute = wager.auctionAttributes.find((attr: { key: string }) => attr.key === 'price');
      wager.auctionPrice = priceAttribute ? priceAttribute.value : null;
      delete wager.auctionAttributes;
    });

    return NextResponse.json({ wagers: userWagers }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user wagers:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
