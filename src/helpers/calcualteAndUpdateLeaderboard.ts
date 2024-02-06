import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

interface Auction {
  _id: ObjectId;
  finalPrice?: number;
}

interface SubWager {
  auctionID: string;
  priceGuessed: number;
}

interface Wager {
  _id: ObjectId;
  user: { _id: ObjectId };
  wagers: SubWager[];
}

async function calculateAndUpdateLeaderboard(tournamentID: string): Promise<any[]> {
  const client = await clientPromise;
  const db = client.db();

  const wagers = (await db
    .collection('tournament_wagers')
    .find({ tournamentID: new ObjectId(tournamentID) })
    .toArray()) as unknown as Wager[];

  let leaderboard: { wagerID: ObjectId; userID: ObjectId; score: number }[] = [];

  for (const wager of wagers) {
    let totalScore = 0;
    for (const subWager of wager.wagers) {
      const auction: Auction | null = await db.collection('auctions').findOne({ _id: new ObjectId(subWager.auctionID) });
      if (auction && auction.finalPrice !== undefined) {
        const score = Math.abs(subWager.priceGuessed - auction.finalPrice);
        totalScore += score;
      }
    }
    leaderboard.push({ wagerID: wager._id, userID: wager.user._id, score: totalScore });
  }

  leaderboard.sort((a, b) => a.score - b.score);

  for (let rank = 0; rank < leaderboard.length; rank++) {
    const entry = leaderboard[rank];
    await db.collection('tournament_wagers').updateOne({ _id: entry.wagerID }, { $set: { score: entry.score, rank: rank + 1 } });
  }

  return leaderboard;
}

export default calculateAndUpdateLeaderboard;
