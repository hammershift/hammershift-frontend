import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { refundTournamentWagers } from './refundTournamentWagers';

interface Tournament {
  _id: ObjectId;
  auctions: ObjectId[];
  status: number;
}

interface TournamentWager {
  _id: ObjectId;
  tournamentID: ObjectId;
  wagers: { auctionID: ObjectId }[];
}

export async function updateTournamentStatus(): Promise<{ tournamentId: string; status: number }[]> {
  const client = await clientPromise;
  const db = client.db();

  const activeTournaments: Tournament[] = (await db.collection('tournaments').find({ status: 1 }).toArray()) as Tournament[];
  const updatedTournaments = [];

  for (const tournament of activeTournaments) {
    const tournamentWagersArray: TournamentWager[] = (await db.collection('tournament_wagers').find({ tournamentID: tournament._id }).toArray()) as TournamentWager[];
    const playerCount = tournamentWagersArray.length;
    console.log('Players:', playerCount);

    // Fetch all auctions related to the tournament
    const allAuctions = await db.collection('auctions').find({ tournamentID: tournament._id }).toArray();

    const auctionStatuses = allAuctions.map((auction) => {
      const statusAttribute = auction.attributes.find((attr: { key: string }) => attr.key === 'status');
      return statusAttribute ? parseInt(statusAttribute.value) : undefined;
    });
    console.log(`Auction statuses for tournament ${tournament._id}:`, auctionStatuses);

    const liveAuctionsCount = auctionStatuses.filter((status) => status === 1).length;
    const unsuccessfulAuctionsCount = auctionStatuses.filter((status) => status === 3).length;
    const successfulAuctionsCount = auctionStatuses.filter((status) => status === 2).length;
    const totalAuctionsCount = auctionStatuses.length;
    const allAuctionsComplete = (successfulAuctionsCount >= 4 && unsuccessfulAuctionsCount <= 1) || successfulAuctionsCount === totalAuctionsCount;

    if (liveAuctionsCount > 0) {
      console.log(`Tournament ${tournament._id} is still active with live auctions.`);
      await db.collection('tournaments').updateOne({ _id: tournament._id }, { $set: { status: 1 } });
    } else if (playerCount <= 2 && unsuccessfulAuctionsCount < 2 && liveAuctionsCount === 0) {
      console.log(`Cancelling tournament ${tournament._id} due to insufficient buy-ins and no live auctions.`);
      await db.collection('tournaments').updateOne({ _id: tournament._id }, { $set: { status: 3 } });
      await refundTournamentWagers(tournamentWagersArray.map((wager) => wager._id));
      console.log(`Tournament ${tournament._id} cancelled and refunds processed.`);
    } else if (unsuccessfulAuctionsCount >= 2 && liveAuctionsCount === 0) {
      console.log(`Cancelling tournament ${tournament._id} due to unsuccessful auctions and no live auctions.`);
      await db.collection('tournaments').updateOne({ _id: tournament._id }, { $set: { status: 3 } });
      await refundTournamentWagers(tournamentWagersArray.map((wager) => wager._id));
      console.log(`Tournament ${tournament._id} cancelled and refunds processed.`);
    } else if (allAuctionsComplete && playerCount >= 3) {
      console.log(`All auctions are complete. Updating status for tournament ${tournament._id} to 2`);
      await db.collection('tournaments').updateOne({ _id: tournament._id }, { $set: { status: 2 } });
    } else {
      console.log(`Tournament ${tournament._id} is still active.`);
    }

    // Fetch the updated tournament and push its information to the array
    const updatedTournament = await db.collection('tournaments').findOne({ _id: tournament._id });
    if (updatedTournament) {
      updatedTournaments.push({ tournamentId: updatedTournament._id.toString(), status: updatedTournament.status });
      console.log(`Updated tournament:`, { tournamentId: updatedTournament._id.toString(), status: updatedTournament.status });
    }
  }

  return updatedTournaments;
}
