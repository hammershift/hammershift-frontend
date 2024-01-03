import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import Auctions from '@/models/auction.model';
import Wager from '@/models/wager';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    console.log('Unauthorized: No session found');
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userID = new mongoose.Types.ObjectId(session.user.id);

  try {
    const userWagers = await Wager.find({ 'user._id': userID })
      .populate({
        path: 'auctionID',
        model: Auctions,
        select: 'pot images_list attributes auction_id',
      })
      .sort({ createdAt: 1 })
      .exec();

    const wagerDetails = userWagers
      .map((wager) => {
        if (!wager.auctionID) {
          console.error(`Missing auction details for wager with ID: ${wager._id}`);
          return null;
        }

        const auctionDetails = wager.auctionID;

        return {
          _id: wager._id.toString(),
          auctionObjectId: auctionDetails._id,
          auctionIdentifierId: auctionDetails.auction_id,
          auctionPot: auctionDetails.pot,
          auctionImage: auctionDetails.images_list.length > 0 ? auctionDetails.images_list[0].src : null,
          auctionYear: auctionDetails.attributes.find((attr: { key: string }) => attr.key === 'year')?.value,
          auctionMake: auctionDetails.attributes.find((attr: { key: string }) => attr.key === 'make')?.value,
          auctionModel: auctionDetails.attributes.find((attr: { key: string }) => attr.key === 'model')?.value,
          auctionPrice: auctionDetails.attributes.find((attr: { key: string }) => attr.key === 'price')?.value,
          auctionDeadline: auctionDetails.attributes.find((attr: { key: string }) => attr.key === 'deadline')?.value,
          auctionStatus: auctionDetails.attributes.find((attr: { key: string }) => attr.key === 'status')?.value,
          priceGuessed: wager.priceGuessed,
          wagerAmount: wager.wagerAmount,
          user: wager.user,
          createdAt: wager.createdAt,
        };
      })
      .filter((detail) => detail !== null);

    return NextResponse.json({ wagers: wagerDetails }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user wagers:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
