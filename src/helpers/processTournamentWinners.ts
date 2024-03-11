import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import prizeDistributionTournament from './prizeDistributionTournament';
import { createWinningTransaction } from './createWinningTransaction';
import { updateWinnerWallet } from './updateWinnerWallet';
import { calculateTournamentScores } from './calculateTournamentScores';
import { addWagerWinnings } from './addWagerWinnings';
import { addTournamentWagerWinning } from './addTournamentWagerWinning';

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

export async function processTournamentWinners(tournamentId: string): Promise<void> {
  const client = await clientPromise;
  const db = client.db();

  const tournament = await db.collection('tournaments').findOne({ _id: new ObjectId(tournamentId) });
  if (!tournament) {
    throw new Error(`Tournament not found with ID ${tournamentId}`);
  }

  // check if the tournament has already been completed or cancelled
  if (tournament.status === 4 || tournament.status === 3) {
    throw new Error('Tournament already completed or cancelled');
  }

  // check if the prizes have already been distributed for this tournament
  if (tournament.winners && tournament.winners.length > 0) {
    throw new Error('Prizes already distributed for this tournament');
  }

  const tournamentTransactions = await db
    .collection('transactions')
    .find({
      tournamentID: new ObjectId(tournamentId),
      transactionType: 'tournament buy-in',
      type: '-',
    })
    .toArray();
  console.log('tournamentID:', tournamentTransactions);

  // Calculate the totalPot for the tournament
  const totalPot = 0.88 * tournamentTransactions.map((transaction) => transaction.amount).reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  console.log('Total Pot:', totalPot);

  // Fetch all wagers associated with the tournament
  const tournamentWagersArray: TournamentWager[] = (await db
    .collection('tournament_wagers')
    .find({ tournamentID: new ObjectId(tournamentId) })
    .toArray()) as TournamentWager[];

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

  // create winning transactions and update the wallet balances for the winners
  for (const winner of tournamentWinners) {
    const user = await db.collection('users').findOne({ _id: new ObjectId(winner.userID) });

    const transactionId = await createWinningTransaction(new ObjectId(winner.userID), winner.prize);
    await updateWinnerWallet(new ObjectId(winner.userID), winner.prize);
    await addTournamentWagerWinning(new ObjectId(winner.wagerID), winner.prize);

    // add the transactionID to the winner object
    winner.transactionID = transactionId;
    winner.username = user ? user.username : '';
    winner.userImage = user && user.image ? user.image : '';
  }

  await db.collection('tournaments').updateOne(
    { _id: new ObjectId(tournamentId) },
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
  console.log(`Updated tournament status to 4 for tournamentId: ${tournamentId}`);
}
