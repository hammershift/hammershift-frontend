import mongoose from 'mongoose';

type Wager = {
  userID: string;
  priceGuessed: number;
  _id: mongoose.Types.ObjectId;
};

type Winner = {
  userID: string;
  prize: number;
  points: number;
  rank: number;
  wagerID: mongoose.Types.ObjectId;
};

type WagerWithDelta = Wager & {
  delta: number;
};

const rankPoints = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

function prizeDistribution(wagers: Wager[], finalSellingPrice: number, totalPot: number): Winner[] {
  // add delta to each wager (difference between guessed price and final selling price)
  const wagersWithDelta: WagerWithDelta[] = wagers.map((wager) => ({
    ...wager,
    delta: Math.abs(wager.priceGuessed - finalSellingPrice),
    wagerID: wager._id,
  }));

  // sort wagers by their delta (closeness to the final selling price)
  const sortedWagers: WagerWithDelta[] = [...wagersWithDelta].sort((a, b) => a.delta - b.delta);

  const prizeDistributionPercentages = [0.5, 0.3, 0.2];

  // create an array of winners including prize money for top 3 closest guesses and points for top 10
  const winners: Winner[] = sortedWagers.map((wager, index) => {
    const prize = index < 3 ? totalPot * prizeDistributionPercentages[index] : 0; // monetary prize for top 3
    const points = index < 10 ? rankPoints[index] : 0; // points for top 10

    return {
      userID: wager.userID,
      prize: prize,
      points: points,
      rank: index + 1,
      wagerID: wager._id,
    };
  });

  // filter out the winners to return only those who have a prize or points
  const actualWinners = winners.filter((winner) => winner.prize > 0 || winner.points > 0);

  return actualWinners;
}

export default prizeDistribution;
