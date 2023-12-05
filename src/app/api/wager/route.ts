import { NextRequest, NextResponse } from 'next/server';
import { Wager } from '@/models/wager';
import connectToDB from '@/lib/mongoose';


export async function POST(req: NextRequest) {
  await connectToDB();
  try {
    const { auctionID, priceGuessed, wagerAmount } = await req.json();

    const newWager = {
      auctionID: auctionID,
      priceGuessed: priceGuessed,
      wagerAmount: wagerAmount,
    };

    await Wager.create(newWager);

    return NextResponse.json({ message: 'Wager created usccessfully' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Internal Sever Error" }, { status: 500 });
  }
}
