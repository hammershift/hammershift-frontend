import mongoose from 'mongoose';

type Auction = {
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

// export function calculateTournamentScores(userWagers: UserWager[], auctions: Auction[]): TournamentResult[] {
//   const scores = userWagers.map((userWager) => {
//     const totalDelta = userWager.wagers.reduce((sum, wager) => {
//       const auction = auctions.find((a) => a._id.toString() === wager.auctionID.toString());
//       if (!auction) {
//         throw new Error('Auction not found for wager.');
//       }
//       const delta = Math.abs(wager.priceGuessed - auction.finalSellingPrice);
//       return sum + delta;
//     }, 0);

//     return {
//       userID: userWager.userID.toString(),
//       totalScore: totalDelta,
//     };
//   });

//   // sort by ascending order
//   scores.sort((a, b) => a.totalScore - b.totalScore);

//   return scores;
// }

export function calculateTournamentScores(userWagers: UserWager[], auctions: Auction[]): TournamentResult[] {
  const scores = userWagers.map((userWager) => {
    const auctionScores = userWager.wagers.map((wager) => {
      const auction = auctions.find((a) => a._id.toString() === wager.auctionID.toString());
      if (!auction) {
        throw new Error('Auction not found for wager.');
      }
      const score = Math.abs(wager.priceGuessed - auction.finalSellingPrice);
      return {
        auctionID: wager.auctionID.toString(),
        score: score,
      };
    });

    const totalScore = auctionScores.reduce((sum, scoreObj) => sum + scoreObj.score, 0);

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
