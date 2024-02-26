import { calculateTournamentScores } from '@/helpers/calculateTournamentScores';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { userWagers, auctions } = await req.json();

    if (!userWagers || !auctions) {
      return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
    }

    const tournamentResults = calculateTournamentScores(userWagers, auctions);
    return NextResponse.json({ tournamentResults });
  } catch (error) {
    console.error('Error in calculateTournamentScores:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
