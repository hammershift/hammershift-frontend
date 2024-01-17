import { NextRequest, NextResponse } from 'next/server';
import prizeDistribution from '@/helpers/prizeDistribution';

export async function POST(req: NextRequest) {
  try {
    const { wagers, finalSellingPrice, totalPot } = await req.json();

    const winners = prizeDistribution(wagers, finalSellingPrice, totalPot);

    return NextResponse.json({ winners });
  } catch (error) {
    console.error('Error in testPrizeDistribution:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
