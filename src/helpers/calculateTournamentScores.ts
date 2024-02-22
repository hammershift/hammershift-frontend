import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

type Auction = {
  _id: mongoose.Types.ObjectId;
  finalSellingPrice: number;
};

type Wager = {
  auctionID: mongoose.Types.ObjectId;
  priceGuessed: number;
};

type UserWager = {
  // userID: mongoose.Types.ObjectId;
  userID: string;
  wagers: Wager[];
};

// type TournamentResult = {
//   userID: mongoose.Types.ObjectId;
//   totalScore: number;
// };

type TournamentResult = {
  userID: string; // maybe string will work?
  totalScore: number;
};

export function calculateTournamentScores(userWagers: UserWager[], auctions: Auction[]): TournamentResult[] {
  const scores = userWagers.map((userWager) => {
    const totalDelta = userWager.wagers.reduce((sum, wager) => {
      const auction = auctions.find((a) => a._id.toString() === wager.auctionID.toString());
      if (!auction) {
        throw new Error('Auction not found for wager.');
      }
      const delta = Math.abs(wager.priceGuessed - auction.finalSellingPrice);
      return sum + delta;
    }, 0);

    return {
      userID: userWager.userID.toString(),
      totalScore: totalDelta,
    };
  });

  // sort by ascending order
  scores.sort((a, b) => a.totalScore - b.totalScore);

  return scores;
}
