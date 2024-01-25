import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

import { addWagerWinnings } from '@/helpers/addWagerWinnings';
import { createWinningTransaction } from '@/helpers/createWinningTransaction';
import prizeDistribution from '@/helpers/prizeDistribution';
import { refundWagers } from '@/helpers/refundWagers';
import { updateWinnerWallet } from '@/helpers/updateWinnerWallet';

// dont delete this
// export async function POST(req: NextRequest) {
//   const session = await getServerSession(authOptions);
//   if (!session) {
//     return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
//   }

//   try {
//     const { auctionID } = await req.json();
//     const convertedAuctionID = new mongoose.Types.ObjectId(auctionID);

//     const client = await clientPromise;
//     const db = client.db();

//     const auction = await db.collection('auctions').findOne({ _id: convertedAuctionID });
//     if (!auction) {
//       return NextResponse.json({ message: 'Auction not found' }, { status: 404 });
//     }

//     const auctionStatus = auction.attributes.find((attr: { key: string }) => attr.key === 'status')?.value;
//     const hasPot = auction.pot && auction.pot > 0;

//     if (auctionStatus === 2 && hasPot) {
//       const wagers = await db.collection('wagers').find({ auctionID: convertedAuctionID }).toArray();
//       const finalSellingPrice = auction.attributes.find((attr: { key: string }) => attr.key === 'price')?.value || 0;

//       const formattedWagers = wagers.map((wager) => ({
//         _id: wager._id,
//         userID: wager.user._id,
//         priceGuessed: wager.priceGuessed,
//       }));

//       const winners = prizeDistribution(formattedWagers, finalSellingPrice, auction.pot);

//       for (const winner of winners) {
//         const correspondingWager = wagers.find((wager) => wager._id.toString() === winner.wagerID.toString());
//         if (correspondingWager) {
//           const transactionId = await createWinningTransaction(new ObjectId(winner.userID), winner.prize);
//           console.log(`Updating wallet balance for user ${winner.userID} with amount ${winner.prize}`);
//           await updateWinnerWallet(new ObjectId(winner.userID), winner.prize);
//           console.log(`Wallet balance updated for user ${winner.userID}`);
//           await addWagerWinnings(new ObjectId(winner.wagerID), winner.prize);

//           winner.transactionID = transactionId;
//         }
//       }

//       const winnerObjects = winners.map((winner) => {
//         const correspondingWager = wagers.find((wager) => wager._id.toString() === winner.wagerID.toString());

//         return {
//           userID: new mongoose.Types.ObjectId(winner.userID),
//           objectID: convertedAuctionID,
//           wagerID: correspondingWager ? correspondingWager._id : null,
//           transaction: winner.transactionID,
//           auctionID: auction.auction_id,
//           prize: winner.prize,
//           rank: winner.rank,
//           username: correspondingWager ? correspondingWager.user.username : null,
//           userImage: correspondingWager ? correspondingWager.user.image : null,
//           priceGuessed: correspondingWager ? correspondingWager.priceGuessed : null,
//           winningDate: new Date(),
//         };
//       });

//       await db.collection('auctions').updateOne({ _id: convertedAuctionID }, { $push: { winners: { $each: winnerObjects } } });

//       return NextResponse.json({ winners: winnerObjects }, { status: 200 });
//     }

//     return NextResponse.json({ message: 'No action performed' }, { status: 200 });
//   } catch (error) {
//     console.error('Error in POST auctionWinner API:', error);
//     return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
//   }
// }

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    // get all auction IDs that need processing
    const auctionsToProcess = await db
      .collection('auctions')
      .find({ 'attributes.key': 'status', 'attributes.value': 2, pot: { $gt: 0 } })
      .project({ _id: 1 })
      .toArray();

    let auctionsToUpdate = []; // to update to status 3
    let wagerIDsForRefund = []; // store wagerIDs for refunds

    // loop over all auction IDs
    for (const { _id } of auctionsToProcess) {
      const auction = await db.collection('auctions').findOne({ _id });
      if (!auction) {
        console.error(`Auction with ID ${_id} not found`);
        continue;
      }

      const wagers = await db.collection('wagers').find({ auctionID: _id }).toArray();
      if (wagers.length <= 3) {
        auctionsToUpdate.push(_id);
        wagerIDsForRefund.push(...wagers.map((wager) => wager._id));
        continue;
      }

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
          const transactionId = await createWinningTransaction(new ObjectId(winner.userID), winner.prize);
          console.log(`Updating wallet balance for user ${winner.userID} with amount ${winner.prize}`);
          await updateWinnerWallet(new ObjectId(winner.userID), winner.prize);
          console.log(`Wallet balance updated for user ${winner.userID}`);
          await addWagerWinnings(new ObjectId(winner.wagerID), winner.prize);

          winner.transactionID = transactionId;
        }
      }

      const winnerObjects = winners.map((winner) => {
        const correspondingWager = wagers.find((wager) => wager._id.toString() === winner.wagerID.toString());

        return {
          userID: new mongoose.Types.ObjectId(winner.userID),
          objectID: _id,
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

      await db.collection('auctions').updateOne(
        { _id },
        {
          $push: { winners: { $each: winnerObjects } },
          $set: { 'attributes.$[elem].value': 4 },
        },
        { arrayFilters: [{ 'elem.key': 'status' }] }
      );
    }

    // update status for auctions with insufficient players
    for (const auctionID of auctionsToUpdate) {
      await db.collection('auctions').updateOne({ _id: auctionID, 'attributes.key': 'status' }, { $set: { 'attributes.$.value': 3 } });
    }

    // perform refunds in a batch
    if (wagerIDsForRefund.length > 0) {
      await refundWagers(wagerIDsForRefund);
    }

    return NextResponse.json({ message: 'Auctions processed' }, { status: 200 });
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
