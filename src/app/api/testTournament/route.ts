import { addTournamentWagerWinning } from '@/helpers/addTournamentWagerWinning';
import { calculateTournamentScores } from '@/helpers/calculateTournamentScores';
import { createWinningTransaction } from '@/helpers/createWinningTransaction';
import prizeDistributionTournament from '@/helpers/prizeDistributionTournament';
import { refundTournamentWagers } from '@/helpers/refundTournamentWagers';
import { updateWinnerWallet } from '@/helpers/updateWinnerWallet';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

interface TournamentWager {
  _id: ObjectId;
  tournamentID: ObjectId;
  wagers: Array<{
    auctionID: ObjectId;
    priceGuessed: number;
  }>;
  user: {
    _id: ObjectId;
    fullName: string;
    username: string;
    image: string;
  };
}

type Auction = {
  _id: mongoose.Types.ObjectId;
  finalSellingPrice: number;
  status: number; // test
};

interface Tournament {
  _id: ObjectId;
  auctions: ObjectId[];
  status: number;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db();
  const mongoSession = client.startSession();

  try {
    await mongoSession.startTransaction();

    const activeTournaments: Tournament[] = (await db.collection('tournaments').find({ status: 1 }).toArray()) as Tournament[];
    const completedTournaments: Tournament[] = (await db.collection('tournaments').find({ status: 2 }).toArray()) as Tournament[];

    for (const tournament of activeTournaments) {
      const tournamentWagersArray: TournamentWager[] = (await db.collection('tournament_wagers').find({ tournamentID: tournament._id }).toArray()) as TournamentWager[];

      const playerCount = tournamentWagersArray.length;
      console.log('Players:', playerCount);

      const allAuctions = await db.collection('auctions').find({ tournamentID: tournament._id }).toArray();

      const auctionStatuses = allAuctions.map((auction) => {
        const statusAttribute = auction.attributes.find((attr: { key: string }) => attr.key === 'status');
        const status = statusAttribute ? statusAttribute.value : undefined;
        console.log(`Auction ID: ${auction._id}, Status: ${status}`);
        return statusAttribute ? parseInt(statusAttribute.value) : undefined;
      });
      console.log(`Auction statuses for tournament ${tournament._id}:`, auctionStatuses);

      const liveAuctionsCount = auctionStatuses.filter((status) => status === 1).length;
      const unsuccessfulAuctionsCount = auctionStatuses.filter((status) => status === 3).length;
      const successfulAuctionsCount = auctionStatuses.filter((status) => status === 2).length;
      const totalAuctionsCount = auctionStatuses.length;
      const allAuctionsComplete = (successfulAuctionsCount >= 4 && unsuccessfulAuctionsCount <= 1) || successfulAuctionsCount === totalAuctionsCount;

      if (liveAuctionsCount > 0) {
        console.log(`Tournament ${tournament._id} is still active with live auctions.`);
      } else if (playerCount <= 2 && unsuccessfulAuctionsCount < 2 && liveAuctionsCount === 0) {
        console.log(`Cancelling tournament ${tournament._id} due to insufficient buy-ins and no live auctions.`);
        await db.collection('tournaments').updateOne({ _id: tournament._id }, { $set: { status: 3 } });
        await refundTournamentWagers(tournamentWagersArray.map((wager) => wager._id));
        console.log(`Tournament ${tournament._id} cancelled and refunds processed.`);
      } else if (unsuccessfulAuctionsCount >= 2 && liveAuctionsCount === 0) {
        console.log(`Cancelling tournament ${tournament._id} due to unsuccessful auctions and no live auctions.`);
        await db.collection('tournaments').updateOne({ _id: tournament._id }, { $set: { status: 3 } });
        await refundTournamentWagers(tournamentWagersArray.map((wager) => wager._id));
        console.log(`Tournament ${tournament._id} cancelled and refunds processed.`);
      } else if (allAuctionsComplete && playerCount >= 3) {
        console.log(`All auctions are complete. Updating status for tournament ${tournament._id} to 2`);
        await db.collection('tournaments').updateOne({ _id: tournament._id }, { $set: { status: 2 } });
      } else {
        console.log(`Tournament ${tournament._id} is still active.`);
      }

      // Part 1: Update Tournament Scores
      const auctionIDs = tournamentWagersArray.flatMap((wager) => wager.wagers.map((wager) => wager.auctionID));

      const auctionDocuments = await db
        .collection('auctions')
        .find({ _id: { $in: auctionIDs } })
        .toArray();

      const auctions: Auction[] = auctionDocuments.map((doc) => ({
        _id: doc._id,
        finalSellingPrice: doc.attributes.find((attr: { key: string }) => attr.key === 'price')?.value || 0,
        status: doc.attributes.find((attr: { key: string }) => attr.key === 'status')?.value || 0,
      }));

      const auctionsForScoreCalculation = auctions.filter((auction) => auction.status !== 3);

      const userWagers = tournamentWagersArray.map((tournamentWager) => ({
        userID: tournamentWager.user._id.toString(),
        username: tournamentWager.user.username,
        image: tournamentWager.user.image || '',
        wagers: tournamentWager.wagers.map((wager) => ({
          auctionID: wager.auctionID,
          priceGuessed: wager.priceGuessed,
        })),
      }));

      const tournamentResults = calculateTournamentScores(userWagers, auctions);
      console.log('Tournament Results:', JSON.stringify(tournamentResults, null, 2));

      // save the points to a separate collection
      for (const result of tournamentResults) {
        const auctionScoresWithAllAuctions = result.auctionScores.map((auctionScore) => {
          const correspondingAuction = allAuctions.find((auction) => auction._id.toString() === auctionScore.auctionID);
          return {
            ...auctionScore,
            isSuccessful: correspondingAuction ? correspondingAuction.status === 2 : false,
          };
        });

        const filter = {
          tournamentID: tournament._id,
          'user._id': new ObjectId(result.userID),
        };

        const update = {
          $set: {
            user: {
              _id: new ObjectId(result.userID),
              username: result.username,
              image: result.image,
            },
            auctionScores: auctionScoresWithAllAuctions,
          },
        };

        const options = { upsert: true };

        await db.collection('tournament_points').updateOne(filter, update, options);
      }
    }

    // Third part: Process Tournament Winners
    for (const tournament of completedTournaments) {
      if (tournament.status === 2) {
        const tournamentTransactions = await db
          .collection('transactions')
          .find({
            tournamentID: tournament._id,
            transactionType: 'tournament buy-in',
            type: '-',
          })
          .toArray();
        console.log('tournamentID:', tournamentTransactions);

        // Calculate the totalPot for the tournament
        const totalPot = 0.88 * tournamentTransactions.map((transaction) => transaction.amount).reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        console.log('Total Pot:', totalPot);

        const tournamentWagersArray: TournamentWager[] = (await db.collection('tournament_wagers').find({ tournamentID: tournament._id }).toArray()) as TournamentWager[];
        const auctionIDs: ObjectId[] = tournamentWagersArray.flatMap((tournamentWager) => tournamentWager.wagers.map((wager) => wager.auctionID));
        console.log(`Auction IDs:`, auctionIDs);

        // fetch the corresponding auctions from the db
        const auctions = await db
          .collection('auctions')
          .find({ _id: { $in: auctionIDs } }, { projection: { _id: 1, 'attributes.key': 1, 'attributes.value': 1 } })
          .toArray();

        // Prepare the data for calculating tournament scores
        const auctionsToProcess = auctions.map((auction) => ({
          _id: auction._id,
          finalSellingPrice: auction.attributes.find((attr: { key: string }) => attr.key === 'price')?.value || 0,
          status: auction.attributes.find((attr: { key: string }) => attr.key === 'status')?.value || 0,
        }));

        const userWagers = tournamentWagersArray.map((tournamentWager) => ({
          userID: tournamentWager.user._id.toString(),
          username: tournamentWager.user.username,
          image: tournamentWager.user.image || '',
          wagers: tournamentWager.wagers.map((wager) => ({
            auctionID: wager.auctionID,
            priceGuessed: wager.priceGuessed,
          })),
        }));

        // Calculate the tournament results (scores)
        const tournamentResults = calculateTournamentScores(userWagers, auctionsToProcess);
        console.log('Tournament Results:', JSON.stringify(tournamentResults, null, 2));

        // Prize distribution
        const tournamentWagersForPrizeDistribution = tournamentResults.map((result) => {
          const tournamentWager = tournamentWagersArray.find((wager) => wager.user._id.toString() === result.userID.toString());

          if (!tournamentWager) {
            throw new Error(`Wager not found for user ${result.userID}`);
          }

          return {
            userID: result.userID.toString(),
            totalScore: result.totalScore,
            _id: tournamentWager._id,
          };
        });

        const tournamentWinners = prizeDistributionTournament(tournamentWagersForPrizeDistribution, totalPot);
        console.log('Tournament Winners:', tournamentWinners);

        // Create winning transactions and update the wallet balances for the winners
        for (const winner of tournamentWinners) {
          const user = await db.collection('users').findOne({ _id: new ObjectId(winner.userID) });
          const transactionId = await createWinningTransaction(new ObjectId(winner.userID), winner.prize);

          await updateWinnerWallet(new ObjectId(winner.userID), winner.prize);
          await addTournamentWagerWinning(new ObjectId(winner.wagerID), winner.prize);

          winner.transactionID = transactionId;
          winner.username = user ? user.username : '';
          winner.userImage = user && user.image ? user.image : '';
        }

        await db.collection('tournaments').updateOne(
          { _id: tournament._id },
          {
            $set: {
              status: 4,
              winners: tournamentWinners.map((winner) => ({
                userID: winner.userID,
                username: winner.username,
                userImage: winner.userImage,
                transactionID: winner.transactionID,
                prize: winner.prize,
                rank: winner.rank,
                winningDate: new Date(),
              })),
            },
          }
        );
        console.log(`Updated tournament status to 4 for tournamentId: ${tournament._id}`);
      }
    }

    await mongoSession.commitTransaction();
    return NextResponse.json({ message: 'Tournaments processed successfully' }, { status: 200 });
  } catch (error) {
    await mongoSession.abortTransaction();
    console.error('Error in POST API:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  } finally {
    mongoSession.endSession();
  }
}
