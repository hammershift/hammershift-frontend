import { addWagerWinnings } from '@/helpers/addWagerWinnings';
import { createWinningTransaction } from '@/helpers/createWinningTransaction';
import prizeDistribution from '@/helpers/prizeDistribution';
import { updateWinnerWallet } from '@/helpers/updateWinnerWallet';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import Transaction from '@/models/transaction';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// export async function POST(req: NextRequest) {
//   const session = await getServerSession(authOptions);
//   if (!session) {
//     console.log('Unauthorized: No session found');
//     return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
//   }

//   try {
//     const { auctionID } = await req.json();

//     const client = await clientPromise;
//     const db = client.db();

//     const convertedAuctionID = new mongoose.Types.ObjectId(auctionID);
//     const auction = await db.collection('auctions').findOne({ _id: convertedAuctionID });

//     if (!auction) {
//       console.log('Auction not found:', auctionID);
//       return NextResponse.json({ message: 'Auction not found' }, { status: 404 });
//     }

//     const auctionStatus = auction.attributes.find((attr: { key: string }) => attr.key === 'status')?.value;
//     const hasPot = auction.pot && auction.pot > 0;
//     console.log('Auction status and pot:', auctionStatus, hasPot);

//     if (auctionStatus === 2 && hasPot) {
//       const wagers = await db.collection('wagers').find({ auctionID: convertedAuctionID }).toArray();
//       console.log('Wagers fetched:', wagers);

//       // extract the final selling price from the auction attributes
//       const finalSellingPriceAttr = auction.attributes.find((attr: { key: string }) => attr.key === 'price');
//       console.log('Final selling price attribute:', finalSellingPriceAttr);

//       let finalSellingPrice = 0;
//       if (finalSellingPriceAttr) {
//         if (finalSellingPriceAttr.value.$numberInt) {
//           finalSellingPrice = parseInt(finalSellingPriceAttr.value.$numberInt, 10);
//         } else if (typeof finalSellingPriceAttr.value === 'number') {
//           finalSellingPrice = finalSellingPriceAttr.value;
//         }
//       }
//       console.log('Final selling price:', finalSellingPrice);

//       // convert wagers to the expected format by the prizeDistribution algo (might change it?)
//       const formattedWagers = wagers.map((wager) => ({
//         _id: new mongoose.Types.ObjectId(wager._id),
//         userID: wager.user._id.toString(),
//         priceGuessed: wager.priceGuessed,
//       }));
//       console.log('Formatted wagers:', formattedWagers);

//       const winners = prizeDistribution(formattedWagers, finalSellingPrice, auction.pot);
//       console.log('Calculated winners:', winners);

//       const winnerObjects = winners.map((winner) => {
//         const correspondingWager = wagers.find((wager) => wager._id.toString() === winner.wagerID.toString());

//         return {
//           userID: new mongoose.Types.ObjectId(winner.userID),
//           objectID: convertedAuctionID,
//           auctionID: auction.auction_id,
//           wagerID: correspondingWager ? correspondingWager._id : null,
//           transaction: winner.transactionID,
//           username: correspondingWager ? correspondingWager.user.username : null,
//           userImage: correspondingWager ? correspondingWager.user.image : null,
//           priceGuessed: correspondingWager ? correspondingWager.priceGuessed : null,
//           prize: winner.prize,
//           rank: winner.rank,
//           winningDate: new Date(),
//         };
//       });

//       console.log('Preparing to update auction with winners...');
//       winnerObjects.forEach((winnerObj, index) => {
//         console.log(`Winner ${index + 1}:`, winnerObj);
//       });

//       await db.collection('auctions').updateOne({ _id: convertedAuctionID }, { $push: { winners: { $each: winnerObjects } } });

//       console.log('Auction updated successfully with winners.');
//       return NextResponse.json({ winners }, { status: 200 });
//     }

//     return NextResponse.json({ message: 'No action performed' }, { status: 200 });
//   } catch (error) {
//     console.error('Error in POST auctionWinner API:', error);
//     return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
//   }
// }

export async function POST(req: NextRequest) {
  // const session = await getServerSession(authOptions);
  // if (!session) {
  //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  // }

  try {
    const { auctionID } = await req.json();
    const convertedAuctionID = new mongoose.Types.ObjectId(auctionID);

    const client = await clientPromise;
    const db = client.db();

    const auction = await db.collection('auctions').findOne({ _id: convertedAuctionID });
    if (!auction) {
      return NextResponse.json({ message: 'Auction not found' }, { status: 404 });
    }

    const auctionStatus = auction.attributes.find((attr: { key: string }) => attr.key === 'status')?.value;
    const hasPot = auction.pot && auction.pot > 0;

    if (auctionStatus === 2 && hasPot) {
      const wagers = await db.collection('wagers').find({ auctionID: convertedAuctionID }).toArray();
      const finalSellingPrice = auction.attributes.find((attr: { key: string }) => attr.key === 'price')?.value || 0;

      const formattedWagers = wagers.map((wager) => ({
        _id: wager._id,
        userID: wager.user._id,
        priceGuessed: wager.priceGuessed,
      }));

      const winners = prizeDistribution(formattedWagers, finalSellingPrice, auction.pot);

      for (const winner of winners) {
        const correspondingWager = wagers.find((wager) => wager._id.toString() === winner.wagerID.toString());
        if (correspondingWager) {
          await createWinningTransaction(new ObjectId(winner.userID), winner.prize);
          console.log(`Updating wallet balance for user ${winner.userID} with amount ${winner.prize}`);
          await updateWinnerWallet(new ObjectId(winner.userID), winner.prize);
          console.log(`Wallet balance updated for user ${winner.userID}`);
          await addWagerWinnings(new ObjectId(winner.wagerID), winner.prize);
        }
      }

      const winnerObjects = winners.map((winner) => {
        const correspondingWager = wagers.find((wager) => wager._id.toString() === winner.wagerID.toString());

        return {
          userID: new mongoose.Types.ObjectId(winner.userID),
          objectID: convertedAuctionID,
          wagerID: correspondingWager ? correspondingWager._id : null,
          transaction: winner.transactionID,
          auctionID: auction.auction_id,
          prize: winner.prize,
          rank: winner.rank,
          username: correspondingWager ? correspondingWager.user.username : null,
          userImage: correspondingWager ? correspondingWager.user.image : null,
          priceGuessed: correspondingWager ? correspondingWager.priceGuessed : null,
          winningDate: new Date(),
        };
      });

      await db.collection('auctions').updateOne({ _id: convertedAuctionID }, { $push: { winners: { $each: winnerObjects } } });

      return NextResponse.json({ winners: winnerObjects }, { status: 200 });
    }

    return NextResponse.json({ message: 'No action performed' }, { status: 200 });
  } catch (error) {
    console.error('Error in POST auctionWinner API:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    // extracting auctionID from the query parameters
    const auctionID = req.nextUrl.searchParams.get('auctionID');
    if (!auctionID) {
      return NextResponse.json({ message: 'Auction ID is required' }, { status: 400 });
    }

    const convertedAuctionID = new mongoose.Types.ObjectId(auctionID);

    // fetch auctions with the necessary fields
    const auction = await db.collection('auctions').findOne({ _id: convertedAuctionID });

    if (!auction) {
      return NextResponse.json({ message: 'Auction not found' }, { status: 404 });
    }

    const auctionStatus = auction.attributes.find((attr: { key: string }) => attr.key === 'status')?.value;
    const hasPot = auction.pot && auction.pot > 0;

    if (auctionStatus === 2 && hasPot) {
      // fetch all wagers associated with this auction
      const wagers = await db.collection('wagers').find({ auctionID: convertedAuctionID }).toArray();

      // testing response
      return NextResponse.json({ wagers }, { status: 200 });
    }

    return NextResponse.json({ message: 'No action performed' }, { status: 200 });
  } catch (error) {
    console.error('Error in GET auctionWinner API:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
