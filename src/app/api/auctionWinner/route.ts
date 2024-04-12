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

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();

    // auctions to process
    const auctions = await db
      .collection('auctions')
      .find({
        attributes: {
          $elemMatch: {
            key: 'status',
            value: { $in: [2, 3] },
          },
        },
        pot: { $gt: 0 },
        isProcessed: { $ne: true },
        winners: { $exists: false },
      })
      .project({ _id: 1, pot: 1, attributes: { $elemMatch: { key: 'status' } } })
      .toArray();

    const allWagers = await db
      .collection('wagers')
      .find({ auctionID: { $in: auctions.map((auction) => auction._id) } })
      .toArray();

    const auctionsToProcess = await Promise.all(
      auctions.map(async (auction) => {
        const playerCount = await db.collection('wagers').countDocuments({ auctionID: auction._id });
        const status = auction.attributes[0]?.value;
        return {
          _id: auction._id,
          pot: auction.pot,
          playerCount,
          status,
          attributes: auction.attributes,
        };
      })
    );

    console.log('Auctions to process:', auctionsToProcess.length);
    console.log('Auctions with placed wagers:', auctionsToProcess);

    if (auctionsToProcess.length === 0) {
      console.log('No auctions available for processing that meet the specified criteria.');
      return NextResponse.json({ message: 'No auctions available for processing that meet the specified criteria.' });
    }

    for (const auction of auctionsToProcess) {
      console.log(`Processing auction ${auction._id} with status ${auction.status}`);

      const wagers = allWagers.filter((wager) => wager.auctionID.toString() === auction._id.toString());

      switch (auction.status) {
        case 1:
          console.log(`Auction: ${auction._id} is live/ongoing. No action needed at this time`);
          break;

        case 2:
          console.log(`Auction: ${auction._id} has ${auction.playerCount} players and status of ${auction.status}`);
          if (auction.playerCount < 3) {
            console.log(`Refunding players for auction: ${auction._id} due to insufficient player. Player count: (${auction.playerCount})`);

            // refund
            const wagerIDsToRefund = wagers.map((wager) => wager._id);
            await refundWagers(wagerIDsToRefund);

            await db.collection('auctions').updateOne(
              { _id: auction._id, 'attributes.key': 'status' },
              {
                $set: {
                  'attributes.$[elem].value': 3,
                  isProcessed: true,
                },
              },
              { arrayFilters: [{ 'elem.key': 'status' }] }
            );
          } else {
            console.log(`Processing winner for auction: ${auction._id} `);

            // get the totalPot
            const auctionTransactions = await db
              .collection('transactions')
              .find({
                auctionID: auction._id,
                transactionType: 'wager',
                type: '-',
              })
              .toArray();

            const totalPot = 0.88 * auctionTransactions.map((transaction) => transaction.amount).reduce((accumulator, currentValue) => accumulator + currentValue, 0);

            const wagers = await db.collection('wagers').find({ auctionID: auction._id }).toArray();

            const formattedWagers = wagers.map((wager) => ({
              _id: wager._id,
              userID: wager.user._id,
              priceGuessed: wager.priceGuessed,
            }));

            const finalSellingPrice = auction.attributes.find((attr: { key: string }) => attr.key === 'price')?.value || 0;

            const winners = prizeDistribution(formattedWagers, finalSellingPrice, totalPot);

            for (const winner of winners) {
              const correspondingWager = wagers.find((wager) => wager._id.toString() === winner.wagerID.toString());
              if (correspondingWager) {
                const transactionId = await createWinningTransaction(new ObjectId(winner.userID), winner.prize);
                console.log(`Updating wallet balance for user: ${winner.userID} with amount: ${winner.prize}`);

                const updateResult = await updateWinnerWallet(new ObjectId(winner.userID), winner.prize);
                console.log(
                  JSON.stringify({
                    action: 'Update wallet balance',
                    userID: winner.userID,
                    amount: winner.prize,
                    transactionID: transactionId,
                    updateResult: updateResult,
                  })
                );

                await addWagerWinnings(new ObjectId(winner.wagerID), winner.prize);
                winner.transactionID = transactionId;
              }
            }

            const winnerObjects = winners.map((winner) => {
              const correspondingWager = wagers.find((wager) => wager._id.toString() === winner.wagerID.toString());

              return {
                userID: new mongoose.Types.ObjectId(winner.userID),
                objectID: auction._id,
                wagerID: correspondingWager ? correspondingWager._id : null,
                transaction: winner.transactionID,
                auctionID: auction._id,
                rank: winner.rank,
                username: correspondingWager ? correspondingWager.user.username : null,
                userImage: correspondingWager ? correspondingWager.user.image : null,
                priceGuessed: correspondingWager ? correspondingWager.priceGuessed : null,
                winningDate: new Date(),
              };
            });

            await db.collection('auctions').updateOne(
              { _id: auction._id, 'attributes.key': 'status' },
              {
                $push: { winners: { $each: winnerObjects } },
                $set: {
                  'attributes.$[elem].value': 4,
                  isProcessed: true,
                },
              },
              { arrayFilters: [{ 'elem.key': 'status' }] }
            );
          }
          console.log(`Case 2 processing for auction: ${auction._id} completed`);
          break;

        case 3:
          console.log(`Auction: ${auction._id} is unsuccessful or withdrawn. Refunding all players`);

          // get all the wagers that need to be refunded
          if (wagers.length === 0) {
            console.log(`No wagers to refund for auction: ${auction._id}`);
          } else {
            const wagerIDsToRefund = wagers.map((wager) => wager._id);
            await refundWagers(wagerIDsToRefund);
            console.log(`Refund process intiated for ${wagerIDsToRefund.length} wagers in auction: ${auction._id}`);
          }

          await db.collection('auctions').updateOne({ _id: auction._id }, { $set: { isProcessed: true } });

          console.log(`Case 3 processing completed for auction: ${auction._id}.`);
          break;
      }
    }

    return NextResponse.json({ message: 'Auctions processed' }, { status: 200 });
  } catch (error) {
    console.error('Error in POST auctionWinner API:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // const session = await getServerSession(authOptions);
  // if (!session) {
  //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  // }

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

    let totalPot;

    const auctionTransactions = await db
      .collection('transactions')
      .find({
        auctionID: convertedAuctionID,
        transactionType: 'wager',
        type: '-',
      })
      .toArray();

    if (auctionTransactions.length > 0) {
      totalPot = 0.88 * auctionTransactions.map((transaction) => transaction.amount).reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    }

    const auctionStatus = auction.attributes.find((attr: { key: string }) => attr.key === 'status')?.value;
    const hasPot = totalPot && totalPot > 0;

    if (auctionStatus === 2 || (auctionStatus === 3 && hasPot)) {
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
