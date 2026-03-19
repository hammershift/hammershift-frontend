import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { Predictions } from "@/models/predictions.model";
import type { PipelineStage } from "mongoose";

export const dynamic = "force-dynamic";

/**
 * GET /api/leaderboard/recent-activity
 *
 * Returns the 10 most recent predictions with basic context — used as a
 * fallback display when the leaderboard collection is empty (i.e., no
 * predictions have been scored yet and no snapshots exist).
 *
 * Response shape:
 * {
 *   activity: Array<{
 *     _id: string;
 *     username: string;
 *     predictedPrice: number;
 *     auctionTitle: string;
 *     auctionId: string;
 *     scored: boolean;
 *     score: number | null;
 *     createdAt: string;
 *   }>
 * }
 */
export async function GET() {
  try {
    await connectDB();

    const pipeline: PipelineStage[] = [
      {
        $match: {
          isActive: true,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $limit: 10,
      },
      {
        $lookup: {
          from: "auctions",
          localField: "auction_id",
          foreignField: "_id",
          as: "auction",
        },
      },
      {
        $unwind: {
          path: "$auction",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          username: "$user.username",
          predictedPrice: 1,
          auctionTitle: { $ifNull: ["$auction.title", "Auction"] },
          auctionId: "$auction_id",
          scored: { $cond: [{ $gt: ["$score", null] }, true, false] },
          score: { $ifNull: ["$score", null] },
          createdAt: 1,
        },
      },
    ];

    const activity = await Predictions.aggregate(pipeline);

    return NextResponse.json({ activity });
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent activity" },
      { status: 500 }
    );
  }
}
