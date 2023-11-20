import connectToDB from "@/lib/mongoose";
import Cars from "@/models/car.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectToDB();
    const auction_id = req.nextUrl.searchParams.get('auction_id');
    const offset = Number(req.nextUrl.searchParams.get('offset')) || 0;
    const limit = Number(req.nextUrl.searchParams.get('limit')) || 12;

    if (auction_id) {
      const car = await Cars.findOne({ auction_id: auction_id });
      return Response.json(car);
    }
    const cars = await Cars.find().limit(limit).skip(offset);
    return Response.json(cars);
  } catch (error) {
    console.log(error);
  }
}