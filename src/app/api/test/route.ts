import { processTournamentWinners } from '@/helpers/processTournamentWinners';
import { updateTournamentScores } from '@/helpers/updateTournamentScores';
import { updateTournamentStatus } from '@/helpers/updateTournamentStatus';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    // update the status of all active tournaments
    await updateTournamentStatus();

    // Process tournaments with status 1 (active)
    const activeTournaments = await db.collection('tournaments').find({ status: 1 }).toArray();
    for (const tournament of activeTournaments) {
      await updateTournamentScores(tournament._id.toString());
      console.log(`Scores updated for tournament ${tournament._id}`);
    }

    // Process tournaments with status 2 (ready for winners processing)
    const readyTournaments = await db.collection('tournaments').find({ status: 2 }).toArray();
    for (const tournament of readyTournaments) {
      await processTournamentWinners(tournament._id.toString());
      console.log(`Winners processed for tournament ${tournament._id}`);
    }

    return NextResponse.json({ message: 'Tournaments processed' }, { status: 200 });
  } catch (error) {
    console.error('Error in POST API:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
