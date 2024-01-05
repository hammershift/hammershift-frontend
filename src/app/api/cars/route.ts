import clientPromise from "@/lib/mongodb";
import connectToDB from "@/lib/mongoose";
import Auctions from "@/models/auction.model";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const auction_id = req.nextUrl.searchParams.get('auction_id');
    const offset = Number(req.nextUrl.searchParams.get('offset')) || 0;
    const limit = Number(req.nextUrl.searchParams.get('limit'));

    // api/cars?auction_id=213123 to get a single car
    if (auction_id) {
      const car = await db.collection('auctions').findOne({ $and: [{ auction_id: auction_id }, { isActive: true }] });
      return NextResponse.json(car);
    }
    // api/cars to get all cars
    const cars = await db.collection('auctions').find({ $and: [{ isActive: true }] }).limit(limit).skip(offset);

    const carsArray = await cars.toArray();

    return NextResponse.json({ total: carsArray.length, cars: carsArray });
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