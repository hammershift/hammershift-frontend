import clientPromise from "@/lib/mongodb";
import connectToDB from "@/lib/mongoose";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import AuctionPoints from "@/models/auction_points";
export async function GET(req: NextRequest) {
  try {
    // const client = await clientPromise;
    // const db = client.db();
    await connectToDB();
    const limit = Number(req.nextUrl.searchParams.get("limit"));

    const leaderboardData = await AuctionPoints.aggregate([
      {
        $group: {
          _id: "$user.userId",
          totalPoints: { $sum: "$points" },
          totalPredictions: { $sum: 1 },
          user: { $first: "$user" },
          image: { $first: "$image" },
          auctions: {
            $push: {
              auction_id: "$auction_id",
              points: "$points",
              rank: "$rank",
            },
          },
        },
      },
      { $sort: { totalPoints: -1 } },
      { $limit: limit },
    ]);

    return NextResponse.json(leaderboardData);
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const { userID, auctionID, points } = await req.json();

    const updateResult = await db.collection("auction_points").updateOne(
      {
        userID: new mongoose.Types.ObjectId(userID),
        auctionID: new mongoose.Types.ObjectId(auctionID),
      },
      {
        $set: { points },
      }
    );

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { message: "No changes made or item not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ message: "Points updated successfully" });
  } catch (error) {
    console.error("Error updating auction points:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
