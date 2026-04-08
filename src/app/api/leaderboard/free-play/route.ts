import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongoose";
import Wager from "@/models/wager";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
  await connectToDB();

  const leaderboard = await Wager.aggregate([
    {
      $match: {
        isVirtual: true,
        isActive: false,
      },
    },
    {
      $group: {
        _id: "$user._id",
        displayName: { $first: "$user.fullName" },
        username: { $first: "$user.username" },
        totalPredictions: { $sum: 1 },
        totalVirtualWagered: { $sum: "$wagerAmount" },
        totalVirtualWon: {
          $sum: { $cond: [{ $gt: ["$prize", 0] }, "$prize", 0] },
        },
        wins: { $sum: { $cond: [{ $gt: ["$prize", 0] }, 1, 0] } },
      },
    },
    {
      $addFields: {
        virtualProfit: {
          $subtract: ["$totalVirtualWon", "$totalVirtualWagered"],
        },
        winRate: {
          $multiply: [
            {
              $divide: [
                "$wins",
                { $max: ["$totalPredictions", 1] },
              ],
            },
            100,
          ],
        },
      },
    },
    { $sort: { virtualProfit: -1 } },
    { $limit: 100 },
    {
      $project: {
        displayName: 1,
        username: 1,
        totalPredictions: 1,
        virtualProfit: 1,
        winRate: { $round: ["$winRate", 1] },
        totalVirtualWagered: 1,
        totalVirtualWon: 1,
      },
    },
  ]);

  return NextResponse.json({
    success: true,
    leaderboard: leaderboard.map((entry, index) => ({
      rank: index + 1,
      ...entry,
    })),
  });
  } catch (error) {
    console.error("Error fetching free-play leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch free-play leaderboard" },
      { status: 500 }
    );
  }
}
