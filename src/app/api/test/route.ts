import { calculateTournamentScores } from '@/helpers/calculateTournamentScores';
import { createWinningTransaction } from '@/helpers/createWinningTransaction';
import prizeDistributionTournament from '@/helpers/prizeDistributionTournament';
import { refundTournamentWagers } from '@/helpers/refundTournamentWagers';
import { updateWinnerWallet } from '@/helpers/updateWinnerWallet';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// interface TournamentWager {
//   _id: ObjectId;
//   tournamentID: ObjectId;
//   wagers: Array<{
//     auctionID: ObjectId;
//     priceGuessed: number;
//   }>;
//   user: {
//     _id: ObjectId;
//     fullName: string;
//     username: string;
//     image: string;
//   };
// }

// export async function POST(req: NextRequest) {
//   const session = await getServerSession(authOptions);
//   if (!session) {
//     return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
//   }

//   const client = await clientPromise;
//   const db = client.db();
//   const mongoSession = client.startSession();

//   try {
//     await mongoSession.startTransaction();
//     console.log('Transaction started');

//     const tournamentId = req.nextUrl.searchParams.get('tournament_id');
//     console.log('Tournament ID:', tournamentId);

//     if (!tournamentId) {
//       return NextResponse.json({ message: 'TournamentID is required' }, { status: 400 });
//     }

//     const tournament = await db.collection('tournaments').findOne({ _id: new ObjectId(tournamentId) });
//     if (!tournament) {
//       return NextResponse.json({ message: 'Tournament not found' }, { status: 404 });
//     }

//     const tournamentTransactions = await db
//       .collection('transactions')
//       .find({
//         tournamentID: new ObjectId(tournamentId),
//         transactionType: 'tournament buy-in',
//         type: '-',
//       })
//       .toArray();
//     console.log('tournamentID:', tournamentTransactions);

//     // check if the tournament has already been completed or cancelled
//     if (tournament.status === 4 || tournament.status === 3) {
//       return NextResponse.json({ message: 'Tournament already completed or cancelled' }, { status: 400 });
//     }

//     // check if the prizes have already been distributed for this tournament
//     if (tournament.winners && tournament.winners.length > 0) {
//       return NextResponse.json({ message: 'Prizes already distributed for this tournament' }, { status: 400 });
//     }

//     // fetch all wagers associated with the tournament
//     const tournamentWagersArray: TournamentWager[] = (await db
//       .collection('tournament_wagers')
//       .find({ tournamentID: new ObjectId(tournamentId) })
//       .toArray()) as TournamentWager[];

//     // extract all auctionIDs from the tournament wagers
//     const auctionIDs: ObjectId[] = tournamentWagersArray.flatMap((tournamentWager) => tournamentWager.wagers.map((wager) => wager.auctionID));
//     console.log(`Auction IDs:`, auctionIDs);

//     // fetch the corresponding auctions from the db
//     const auctions = await db
//       .collection('auctions')
//       .find({ _id: { $in: auctionIDs } }, { projection: { _id: 1, 'attributes.key': 1, 'attributes.value': 1 } })
//       .toArray();

//     // extract the status of each auction
//     const auctionStatuses = auctions.map((auction) => {
//       const statusAttribute = auction.attributes.find((attr: { key: string }) => attr.key === 'status');
//       const status = statusAttribute ? statusAttribute.value : undefined;
//       console.log(`Auction ID: ${auction._id}, Status: ${status}`);
//       return {
//         auctionID: auction._id,
//         status: status,
//       };
//     });

//     // count the # of unsuccessful auctions
//     const unsuccessfulAuctionsCount = auctionStatuses.filter((auctionStatus) => parseInt(auctionStatus.status) === 3).length;
//     console.log('Unsuccessful Auctions:', unsuccessfulAuctionsCount);

//     // count the # of players who placed a buy-in
//     const playerCount = tournamentWagersArray.length;
//     console.log('Players:', playerCount);

//     // get the totalPot for the tournament
//     const totalPot = 0.88 * tournamentTransactions.map((transaction) => transaction.amount).reduce((accumulator, currentValue) => accumulator + currentValue, 0);
//     console.log('Total Pot:', totalPot);

//     // check if the tournament should be cancelled due to insufficient participants or unsuccessful auctions
//     if (unsuccessfulAuctionsCount >= 2 || playerCount < 3) {
//       await db.collection('tournaments').updateOne({ _id: new ObjectId(tournamentId) }, { $set: { status: 3 } });
//       await db.collection('auctions').updateMany({ _id: { $in: auctionIDs } }, { $set: { 'attributes.$[elem].value': 3 } }, { arrayFilters: [{ 'elem.key': 'status' }] });

//       // check for refunds
//       const liveAuctionsCount = auctionStatuses.filter((auctionStatus) => parseInt(auctionStatus.status) === 1).length;
//       if (liveAuctionsCount === 0) {
//         await refundTournamentWagers(tournamentWagersArray.map((wager) => wager._id));
//       }
//       return NextResponse.json({ message: 'Tournament cancelled due to insufficient participants or unsuccessful auctions' }, { status: 200 });
//     }

//     // prepare the data for calculating tournament scores
//     const auctionsToProcess = auctions.map((auction) => ({
//       _id: auction._id,
//       finalSellingPrice: auction.attributes.find((attr: { key: string }) => attr.key === 'price')?.value || 0,
//       status: auction.attributes.find((attr: { key: string }) => attr.key === 'status')?.value || 0,
//     }));

//     const userWagers = tournamentWagersArray.map((tournamentWager) => ({
//       userID: tournamentWager.user._id.toString(),
//       username: tournamentWager.user.username,
//       image: tournamentWager.user.image || '',
//       wagers: tournamentWager.wagers.map((wager) => ({
//         auctionID: wager.auctionID,
//         priceGuessed: wager.priceGuessed,
//       })),
//     }));

//     // calculate the tournament results (scores)
//     const tournamentResults = calculateTournamentScores(userWagers, auctionsToProcess);
//     console.log('Tournament Results:', JSON.stringify(tournamentResults, null, 2));

//     // save the points to a separate collection
//     for (const result of tournamentResults) {
//       const filter = {
//         tournamentID: new ObjectId(tournamentId),
//         'user._id': new ObjectId(result.userID),
//       };

//       const update = {
//         $set: {
//           user: {
//             _id: new ObjectId(result.userID),
//             username: result.username,
//             image: result.image,
//           },
//           auctionScores: result.auctionScores,
//         },
//       };

//       const options = { upsert: true };

//       await db.collection('tournament_points').updateOne(filter, update, options);
//     }

//     // validation if the auctions are successful
//     const successfulAuctionsCount = auctionStatuses.filter((auctionStatus) => parseInt(auctionStatus.status) === 2).length;
//     const totalAuctionsCount = auctionStatuses.length;
//     const allAuctionsComplete = (successfulAuctionsCount >= 4 && unsuccessfulAuctionsCount <= 1) || successfulAuctionsCount === totalAuctionsCount;

//     if (allAuctionsComplete) {
//       console.log(`Updating status for tournament ${tournament._id} to 2`);
//       const updateResult = await db.collection('tournaments').updateOne({ _id: tournament._id }, { $set: { status: 2 } });
//       console.log(`Status update result: `, updateResult);

//       const tournamentWagersForPrizeDistribution = tournamentResults.map((result) => {
//         const tournamentWager = tournamentWagersArray.find((wager) => wager.user._id.toString() === result.userID.toString());

//         if (!tournamentWager) {
//           throw new Error(`Wager not found for user ${result.userID}`);
//         }

//         return {
//           userID: result.userID.toString(),
//           totalScore: result.totalScore,
//           _id: tournamentWager._id,
//         };
//       });

//       // prizeDistribution
//       const tournamentWinners = prizeDistributionTournament(tournamentWagersForPrizeDistribution, totalPot);
//       console.log('Tournament Winners:', tournamentWinners);

//       // create winning transactions and update the wallet balances for the winners
//       for (const winner of tournamentWinners) {
//         const user = await db.collection('users').findOne({ _id: new ObjectId(winner.userID) });
//         const transactionId = await createWinningTransaction(new ObjectId(winner.userID), winner.prize);
//         await updateWinnerWallet(new ObjectId(winner.userID), winner.prize);

//         // add the transactionID to the winner object
//         winner.transactionID = transactionId;
//         winner.username = user ? user.username : '';
//         winner.userImage = user && user.image ? user.image : '';
//       }

//       // update the tournament status to indicate that it is complete
//       await db.collection('tournaments').updateOne(
//         { _id: new ObjectId(tournamentId) },
//         {
//           $set: {
//             status: 4,
//             winners: tournamentWinners.map((winner) => ({
//               userID: winner.userID,
//               username: winner.username,
//               userImage: winner.userImage,
//               transactionID: winner.transactionID,
//               prize: winner.prize,
//               rank: winner.rank,
//               winningDate: new Date(),
//             })),
//           },
//         }
//       );
//       await mongoSession.commitTransaction();
//       console.log('Transaction committed');

//       return NextResponse.json({ message: 'Tournament complete and prizes distributed', winners: tournamentWinners }, { status: 200 });
//     } else {
//       return NextResponse.json({ message: 'Tournament scores updated' }, { status: 200 });
//     }
//   } catch (error) {
//     await mongoSession.abortTransaction();
//     console.error('Error in POST tournamentWinner API:', error);
//     return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
//   } finally {
//     console.log('Ending session');
//     await mongoSession.endSession();
//   }
// }

interface AuctionScore {
  auctionID: string;
  score: number;
  isSuccessful: boolean;
}

// I ran this API so it will add the isSuccessful field to all tournament_points data
export async function POST(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const auctions = await db.collection('auctions').find().toArray();
    const auctionStatusMap = new Map<string, number>();

    auctions.forEach((auction) => {
      const statusAttribute = auction.attributes.find((attr: { key: string }) => attr.key === 'status');
      if (statusAttribute) {
        auctionStatusMap.set(auction._id.toString(), Number(statusAttribute.value));
      }
    });
    console.log('Auction Status Map:', auctionStatusMap);

    const tournamentPoints = await db.collection('tournament_points').find().toArray();

    for (const points of tournamentPoints) {
      const updatedAuctionScores = points.auctionScores.map((score: AuctionScore) => {
        const status = auctionStatusMap.get(score.auctionID) || 3;
        const isSuccessful = status !== 3;

        return {
          ...score,
          isSuccessful,
        };
      });
      console.log(`Updated Auction Scores for Tournament Points ID ${points._id}:`, updatedAuctionScores);

      await db.collection('tournament_points').updateOne({ _id: points._id }, { $set: { auctionScores: updatedAuctionScores } });
    }

    return new Response(JSON.stringify({ message: 'Update complete!' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error updating tournament_points:', error);
    return new Response(JSON.stringify({ message: 'Error updating tournament_points' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
