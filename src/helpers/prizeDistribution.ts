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
  transactionID?: mongoose.Types.ObjectId;
};

type WagerWithDelta = Wager & {
  delta: number;
};

const rankPoints = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

function prizeAlgorithm(wagers: Wager[], finalSellingPrice: number, totalPot: number): Winner[] {
  // add delta to each wager (difference between guessed price and final selling price)
  const wagersWithDelta: WagerWithDelta[] = wagers.map((wager) => ({
    ...wager,
    delta: Math.abs(wager.priceGuessed - finalSellingPrice),
    wagerID: wager._id,
  }));

  // sort wagers by their delta (closeness to the final selling price)
  const sortedWagers: WagerWithDelta[] = [...wagersWithDelta].sort((a, b) => a.delta - b.delta);

  const prizeDistributionPercentages = [0.5, 0.3, 0.2];
  const winners: Winner[] = [];

  let prizePercentageIndex = 0;
  let currentRank = 1;

  console.log(`Starting prize distribution for final selling price: $${finalSellingPrice}`);

  for (let i = 0; i < sortedWagers.length; i++) {
    const currentWager = sortedWagers[i];
    const tiedWagers = sortedWagers.filter((w) => w.delta === currentWager.delta);
    console.log(`Found ${tiedWagers.length} wager(s) with delta ${currentWager.delta}` + (tiedWagers.length > 1 ? ', indicating a tie' : ''));

    // calculate combined points for the tied ranks
    const totalPointsForTiedRanks =
      tiedWagers.length > rankPoints.length ? 0 : rankPoints.slice(currentRank - 1, currentRank - 1 + tiedWagers.length).reduce((acc, cur) => acc + cur, 0);
    const pointsPerWinner = totalPointsForTiedRanks / tiedWagers.length;

    // calculate the total prize for this group based on the prize/winning percentage
    let remainingPrizePercentage = prizeDistributionPercentages.slice(prizePercentageIndex).reduce((acc, cur) => acc + cur, 0);
    let totalPrizePercentageForGroup = 0;

    if (tiedWagers.length > prizeDistributionPercentages.length - prizePercentageIndex) {
      totalPrizePercentageForGroup = remainingPrizePercentage;
      remainingPrizePercentage = 0;
    } else {
      totalPrizePercentageForGroup = prizeDistributionPercentages.slice(prizePercentageIndex, prizePercentageIndex + tiedWagers.length).reduce((acc, cur) => acc + cur, 0);
      remainingPrizePercentage -= totalPrizePercentageForGroup;
    }

    const totalPrizeForGroup = totalPot * totalPrizePercentageForGroup;
    const prizePerWinner = totalPrizeForGroup / tiedWagers.length;

    console.log(`Distributing ${totalPointsForTiedRanks} points and ${totalPrizeForGroup.toFixed(2)} in prize money`);

    // add each winner to the winners array with prize and points
    tiedWagers.forEach((wager) => {
      if (!winners.some((winner) => winner.userID === wager.userID)) {
        winners.push({
          userID: wager.userID,
          prize: prizePerWinner,
          points: pointsPerWinner,
          rank: currentRank,
          wagerID: wager._id,
        });
        console.log(`Awarded ${wager.userID}: $${prizePerWinner.toFixed(2)} and ${pointsPerWinner} points at rank ${currentRank}`);
      }
    });

    // update the indexes for the next iteration
    prizePercentageIndex += tiedWagers.length;
    currentRank += tiedWagers.length;
    i += tiedWagers.length - 1; // skip tied wagers in the next iteration
  }
  console.log('Finished processing all wagers.');
  return winners.filter((winner, index) => index < 10); // only the top 10 ranks are returned
}

export default prizeAlgorithm;
