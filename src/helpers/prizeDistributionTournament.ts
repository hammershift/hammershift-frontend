import mongoose from 'mongoose';

type TournamentWager = {
  userID: string;
  totalScore: number;
  _id: mongoose.Types.ObjectId;
};

type TournamentWinner = {
  userID: string;
  prize: number;
  rank: number;
  wagerID: mongoose.Types.ObjectId;
  transactionID?: mongoose.Types.ObjectId;
};

function prizeDistributionTournament(wagers: TournamentWager[], totalPot: number): TournamentWinner[] {
  // Sort wagers by their totalScore in ascending order
  const sortedWagers: TournamentWager[] = [...wagers].sort((a, b) => a.totalScore - b.totalScore);

  const winners: TournamentWinner[] = [];
  const prizeDistributionPercentages = [0.5, 0.3, 0.2];

  let prizePercentageIndex = 0;
  let currentRank = 1;

  for (let i = 0; i < sortedWagers.length; i++) {
    const wager = sortedWagers[i];

    // Find all wagers that have the same totalScore, indicating a tie
    const tiedWinners = sortedWagers.filter((w) => w.totalScore === wager.totalScore);

    let prizePercentageForGroup = 0;
    for (let j = 0; j < tiedWinners.length; j++) {
      prizePercentageForGroup += prizeDistributionPercentages[prizePercentageIndex + j] || 0;
    }

    const totalPrizeForGroup = totalPot * prizePercentageForGroup;
    const prizePerWinner = totalPrizeForGroup / tiedWinners.length;

    for (const tiedWager of tiedWinners) {
      if (!winners.some((winner) => winner.userID === tiedWager.userID)) {
        winners.push({
          userID: tiedWager.userID,
          prize: prizePerWinner,
          rank: currentRank,
          wagerID: tiedWager._id,
        });
      }
    }

    prizePercentageIndex += tiedWinners.length;
    currentRank += tiedWinners.length;
    i += tiedWinners.length - 1;
  }

  const actualWinners = winners.filter((winner) => winner.prize > 0);
  return actualWinners;
}

export default prizeDistributionTournament;
