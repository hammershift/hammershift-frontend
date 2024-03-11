import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { calculateTournamentScores } from './calculateTournamentScores';

interface TournamentWager {
  _id: ObjectId;
  tournamentID: ObjectId;
  wagers: Array<{
    auctionID: ObjectId;
    priceGuessed: number;
  }>;
  user: {
    _id: ObjectId;
    username: string;
    image: string;
  };
}

type Auction = {
  _id: mongoose.Types.ObjectId;
  finalSellingPrice: number;
  status: number;
};

export async function updateTournamentScores(tournamentId: string): Promise<void> {
  const client = await clientPromise;
  const db = client.db();

  const tournamentWagersArray: TournamentWager[] = (await db
    .collection('tournament_wagers')
    .find({ tournamentID: new ObjectId(tournamentId) })
    .toArray()) as TournamentWager[];

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
    const filter = {
      tournamentID: new ObjectId(tournamentId),
      'user._id': new ObjectId(result.userID),
    };

    const update = {
      $set: {
        user: {
          _id: new ObjectId(result.userID),
          username: result.username,
          image: result.image,
        },
        auctionScores: result.auctionScores,
      },
    };

    const options = { upsert: true };

    await db.collection('tournament_points').updateOne(filter, update, options);
  }
}
