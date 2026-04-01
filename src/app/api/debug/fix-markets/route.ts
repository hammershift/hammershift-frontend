export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongoose";
import mongoose from "mongoose";

const DAY_MS = 24 * 60 * 60 * 1000;

export async function GET() {
  await connectToDB();
  const db = mongoose.connection.db!;
  const now = new Date();

  // Find all markets that have a linked auction
  const markets = await db.collection("polygon_markets").find({}).toArray();

  let fixed = 0;
  let deleted = 0;

  for (const market of markets) {
    if (!market.auctionId) continue;

    // Look up the auction to get the real deadline
    let auction = await db.collection("auctions").findOne({ auction_id: market.auctionId });
    if (!auction) {
      try {
        auction = await db.collection("auctions").findOne({
          _id: new mongoose.Types.ObjectId(market.auctionId),
        });
      } catch { /* not an ObjectId */ }
    }

    if (!auction?.sort?.deadline) continue;

    // Compute correct closesAt (raw deadline + 24h)
    const correctClosesAt = new Date(new Date(auction.sort.deadline).getTime() + DAY_MS);
    const isStillLive = correctClosesAt > now;

    if (isStillLive) {
      // Re-activate with correct closesAt
      await db.collection("polygon_markets").updateOne(
        { _id: market._id },
        {
          $set: {
            closesAt: correctClosesAt,
            status: "ACTIVE",
            updatedAt: now,
          },
        }
      );
      fixed++;
    } else {
      // Market is legitimately expired — leave as-is
    }
  }

  return NextResponse.json({
    totalMarkets: markets.length,
    reactivated: fixed,
    message: `Fixed ${fixed} markets with corrected closesAt and ACTIVE status`,
  });
}
