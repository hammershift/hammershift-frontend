import { calculateTournamentScores } from '@/helpers/calculateTournamentScores';
import prizeDistributionTournament from '@/helpers/prizeDistributionTournament';
import tournamentPrizeDistribution from '@/helpers/prizeDistributionTournament';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

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

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const tournamentId = req.nextUrl.searchParams.get('tournament_id');
    console.log(`Tournament ID:`, tournamentId);
    if (!tournamentId) {
      return NextResponse.json({ message: 'TournamentID is required' }, { status: 400 });
    }

    // fetch the tournament data to get the total pot amount
    const tournament = await db.collection('tournaments').findOne({ _id: new ObjectId(tournamentId) });
    console.log('Tournament Data:', tournament);
    if (!tournament) {
      return NextResponse.json({ message: 'Tournament not found' }, { status: 404 });
    }

    const tournamentWagersArray: TournamentWager[] = (await db
      .collection('tournament_wagers')
      .find({ tournamentID: new ObjectId(tournamentId) })
      .toArray()) as TournamentWager[];

    // console.log(`Tournament Wagers Array:`, tournamentWagersArray);

    const auctionIDs: ObjectId[] = tournamentWagersArray.flatMap((tournamentWager) => tournamentWager.wagers.map((wager) => wager.auctionID));
    console.log(`Auction IDs:`, auctionIDs);

    // fetch the auctions using the auctionIDs array
    const auctions = await db
      .collection('auctions')
      .find({ _id: { $in: auctionIDs } }, { projection: { _id: 1, 'attributes.key': 1, 'attributes.value': 1 } })
      .toArray();
    // console.log(`Auctions fetched:`, auctions);

    // map over the auctions to extract the status
    const auctionStatuses = auctions.map((auction) => {
      const statusAttribute = auction.attributes.find((attr: { key: string }) => attr.key === 'status');
      const status = statusAttribute ? statusAttribute.value : undefined;
      console.log(`Auction ID: ${auction._id}, Status: ${status}`);
      return {
        auctionID: auction._id,
        status: status,
      };
    });
    // console.log(`Auction Statuses:`, auctionStatuses);

    // check if there are at least two auctions with status of 3
    const unsuccessfulAuctionsCount = auctionStatuses.filter((auctionStatus) => auctionStatus.status === '3').length;
    console.log('Unsuccessful Auctions:', unsuccessfulAuctionsCount);

    // check if there are only two players who placed a buy-in
    const playerCount = tournamentWagersArray.length;
    console.log('Players:', playerCount);

    const totalPot = tournament.pot;
    console.log('Total Pot:', totalPot);

    if (unsuccessfulAuctionsCount >= 2 || playerCount < 3) {
      await db.collection('tournaments').updateOne({ _id: new ObjectId(tournamentId) }, { $set: { isActive: true } });
      // refund logic here later or maybe not
      return NextResponse.json({ message: 'Tournament canceled due to insufficient participants or unsuccessful auctions' }, { status: 200 });
    }

    const auctionsToProcess = auctions.map((auction) => ({
      _id: auction._id,
      finalSellingPrice: auction.attributes.find((attr: { key: string }) => attr.key === 'price')?.value || 0,
    }));

    const userWagers = tournamentWagersArray.map((tournamentWager) => ({
      userID: tournamentWager.user._id.toString(),
      wagers: tournamentWager.wagers.map((wager) => ({
        auctionID: wager.auctionID,
        priceGuessed: wager.priceGuessed,
      })),
    }));

    const tournamentResults = calculateTournamentScores(userWagers, auctionsToProcess);
    console.log('Tournament Results:', tournamentResults);

    // check if all auctions are complete and successful
    const allAuctionsComplete = auctionStatuses.every((auctionStatus) => auctionStatus.status === '2');
    if (allAuctionsComplete) {
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

      return NextResponse.json({ message: 'Tournament complete and prizes distributed' }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Tournament scores updated' }, { status: 200 });
    }
  } catch (error) {
    console.error('Error in POST tournamentWinner API:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
