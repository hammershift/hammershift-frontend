import mongoose from 'mongoose';

type Auction = {
  status: number;
  _id: mongoose.Types.ObjectId;
  finalSellingPrice: number;
};

type Wager = {
  auctionID: mongoose.Types.ObjectId;
  priceGuessed: number;
};

type UserWager = {
  userID: string;
  username: string;
  image: string;
  wagers: Wager[];
};

type AuctionScore = {
  auctionID: string;
  score: number;
};

type TournamentResult = {
  userID: string;
  username: string;
  image: string;
  totalScore: number;
  auctionScores: AuctionScore[];
};

export function calculateTournamentScores(userWagers: UserWager[], auctions: Auction[]): TournamentResult[] {
  const scores = userWagers.map((userWager) => {
    const auctionScores = userWager.wagers.map((wager) => {
      const auction = auctions.find((a) => a._id.toString() === wager.auctionID.toString());
      if (!auction) {
        console.error(`Auction not found for wager. Wager auction ID: ${wager.auctionID}`);
        throw new Error('Auction not found for wager.');
      }

      const score = Math.abs(wager.priceGuessed - auction.finalSellingPrice);

      // to make sure that isSuccessful: false is only for auctions with status 3
      const isSuccessful = auction.status !== 3;

      return {
        auctionID: wager.auctionID.toString(),
        score: score,
        isSuccessful: isSuccessful,
      };
    });

    const totalScore = auctionScores.filter((auctionScore) => auctionScore.isSuccessful).reduce((sum, scoreObj) => sum + scoreObj.score, 0);

    return {
      userID: userWager.userID,
      username: userWager.username,
      image: userWager.image,
      totalScore,
      auctionScores,
    };
  });

  scores.sort((a, b) => a.totalScore - b.totalScore);

  return scores;
}
