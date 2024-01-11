// import { authOptions } from '@/lib/auth';
// import clientPromise from '@/lib/mongodb';
// import Auctions from '@/models/auction.model';
// import Wager from '@/models/wager';
// import mongoose from 'mongoose';
// import { getServerSession } from 'next-auth';
// import { NextRequest, NextResponse } from 'next/server';

// export async function POST(req: NextRequest) {
//   const session = await getServerSession(authOptions);
//   if (!session) {
//     return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
//   }

//   try {
//     const { auctionID } = await req.json();
//     const convertedAuctionID = new mongoose.Types.ObjectId(auctionID);

//     // fetch auctions with the necessary fields
//     const auction = await Auctions.findOne({ _id: convertedAuctionID }).select('pot attributes auction_id winners').exec();

//     if (!auction) {
//       return NextResponse.json({ message: 'Auction not found' }, { status: 404 });
//     }

//     const auctionStatus = auction.attributes.find((attr: { key: string }) => attr.key === 'status')?.value;
//     const hasPot = auction.pot && auction.pot > 0;

//     if (auctionStatus === 2 || hasPot) {
//       const wagers = await Wager.find({ auctionID: convertedAuctionID }).exec();
//     }

//     // implement algorithm for prize pool distribution
//   } catch (error) {
//     return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
//   }
// }
