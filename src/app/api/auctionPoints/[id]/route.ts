import connectToDB from "@/lib/mongoose";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import AuctionPoints from "@/models/auction_points";
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDB();

    const userPoints = await AuctionPoints.find({
      userID: params.id,
    });
    if (!userPoints) {
      //user has no points, return 0
      return NextResponse.json({ total: 0 }, { status: 200 });
    }
    const sum = userPoints.reduce((acc, curr) => acc + curr.points, 0);
    return NextResponse.json({ total: sum }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user points:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
