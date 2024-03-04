import { calculateTournamentScores } from '@/helpers/calculateTournamentScores';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
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
  const client = await clientPromise;
  const db = client.db();

  const tournamentId = req.nextUrl.searchParams.get('tournament_id');

  if (!tournamentId) {
    return NextResponse.json({ message: 'Tournament ID is required' }, { status: 400 });
  }

  const tournamentWagersArray: TournamentWager[] = (await db
    .collection('tournament_wagers')
    .find({ tournamentID: new ObjectId(tournamentId) })
    .toArray()) as TournamentWager[];

  const auctionIDs = tournamentWagersArray.flatMap((wager) => wager.wagers.map((wager) => wager.auctionID));

  const auctions = await db
    .collection('auctions')
    .find({ _id: { $in: auctionIDs } })
    .toArray();

  const auctionsFormatted = auctions.map((auction) => ({
    _id: auction._id,
    finalSellingPrice: auction.attributes.find((attr: { key: string }) => attr.key === 'price')?.value || 0,
  }));

  const userWagers = tournamentWagersArray.map((wager) => ({
    userID: wager.user._id.toString(),
    username: wager.user.username,
    image: wager.user.image || '',
    wagers: wager.wagers,
  }));

  const tournamentResults = calculateTournamentScores(userWagers, auctionsFormatted);

  return NextResponse.json({ tournamentResults }, { status: 200 });
}
