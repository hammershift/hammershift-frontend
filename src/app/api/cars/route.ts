import connectToDB from "@/lib/mongoose";
import Auctions from "@/models/auction.model";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    await connectToDB();
    const auction_id = req.nextUrl.searchParams.get('auction_id');
    const offset = Number(req.nextUrl.searchParams.get('offset')) || 0;
    const limit = Number(req.nextUrl.searchParams.get('limit'));

    // api/cars?auction_id=213123 to get a single car
    if (auction_id) {
      const car = await Auctions.findOne({ $and: [{ auction_id: auction_id }, { isActive: true }] });
      return NextResponse.json(car);
    }
    // api/cars to get all cars
    const cars = await Auctions.find({ $and: [{ isActive: true }] }).limit(limit).skip(offset);
    return NextResponse.json({ total: cars.length, cars: cars });
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Internal server error" });
  }
}


export async function PUT(req: NextRequest) {
  try {
    await connectToDB();
    const auction_id = req.nextUrl.searchParams.get('auction_id');
    const edits = await req.json();

    const editedAuction = await Auctions.findOneAndUpdate({ $and: [{ auction_id: auction_id }, { isActive: true }] }
      ,
      { $set: edits },
      { new: true }
    )

    return NextResponse.json(editedAuction, { status: 202 });
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Internal server error" });
  }
}