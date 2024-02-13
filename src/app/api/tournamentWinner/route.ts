import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

interface TournamentWager {
  _id: ObjectId;
  tournamentID: ObjectId;
  wagers: Array<{
    auctionID: ObjectId;
    priceGuessed: number;
  }>;
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

    const tournamentWagersArray: TournamentWager[] = (await db
      .collection('tournament_wagers')
      .find({ tournamentID: new ObjectId(tournamentId) })
      .toArray()) as TournamentWager[];

    console.log(`Tournament Wagers Array:`, tournamentWagersArray);

    const auctionIDs: ObjectId[] = tournamentWagersArray.flatMap((tournamentWager) => tournamentWager.wagers.map((wager) => wager.auctionID));
    console.log(`Auction IDs:`, auctionIDs);

    // fetch the auctions using the auctionIDs array
    const auctions = await db
      .collection('auctions')
      .find({ _id: { $in: auctionIDs } }, { projection: { _id: 1, 'attributes.key': 1, 'attributes.value': 1 } })
      .toArray();
    console.log(`Auctions fetched:`, auctions);

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
    console.log(`Auction Statuses:`, auctionStatuses);

    return NextResponse.json({ message: 'Tournament processed' }, { status: 200 });
  } catch (error) {
    console.error('Error in POST tournamentWinner API:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
