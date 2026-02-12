import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongoose";
import { Predictions } from "@/models/predictions.model";
import Users from "@/models/user.model";
import Streak from "@/models/streak.model";
import type { PipelineStage } from "mongoose";

/**
 * GET /api/leaderboard
 *
 * Fetches leaderboard data with period filtering, pagination, and user stats.
 * Query params:
 * - period: 'weekly' | 'monthly' | 'alltime' (default: alltime)
 * - page: number (default: 1)
 * - limit: number (default: 50, max: 100)
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const period = searchParams.get("period") || "alltime";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const skip = (page - 1) * limit;

    // Get current user session
    const session = await getServerSession(authOptions);

    // Calculate period date range
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (period) {
      case "weekly":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case "monthly":
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "alltime":
      default:
        startDate = new Date(0); // Unix epoch
        break;
    }

    // Aggregate leaderboard data
    const leaderboardPipeline: PipelineStage[] = [
      {
        $match: {
          scored_at: { $gte: startDate, $lte: endDate },
          score: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: "$user.userId",
          total_score: { $sum: "$score" },
          predictions_count: { $sum: 1 },
          avg_accuracy: {
            $avg: {
              $cond: [
                { $eq: ["$delta_from_actual", null] },
                0,
                {
                  $max: [
                    0,
                    {
                      $subtract: [
                        100,
                        {
                          $multiply: [
                            {
                              $abs: {
                                $divide: [
                                  "$delta_from_actual",
                                  {
                                    $cond: [
                                      { $eq: ["$predictedPrice", 0] },
                                      1,
                                      "$predictedPrice",
                                    ],
                                  },
                                ],
                              },
                            },
                            100,
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          },
        },
      },
      {
        $sort: { total_score: -1 },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $lookup: {
          from: "streaks",
          localField: "_id",
          foreignField: "user_id",
          as: "streak",
        },
      },
      {
        $unwind: {
          path: "$streak",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          userId: "$_id",
          username: "$user.username",
          fullName: "$user.fullName",
          total_score: 1,
          predictions_count: 1,
          avg_accuracy: 1,
          current_streak: {
            $ifNull: ["$streak.current_streak", 0],
          },
        },
      },
    ];

    // Get all results to calculate ranks
    const allResults = await Predictions.aggregate(leaderboardPipeline);

    // Add ranks
    const rankedResults = allResults.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    // Paginate results
    const leaderboard = rankedResults.slice(skip, skip + limit);

    // Calculate period stats
    const periodStats = {
      total_participants: rankedResults.length,
      top_score: rankedResults.length > 0 ? rankedResults[0].total_score : 0,
      avg_score:
        rankedResults.length > 0
          ? rankedResults.reduce((sum, r) => sum + r.total_score, 0) /
            rankedResults.length
          : 0,
    };

    // Get current user stats if logged in
    let currentUserStats = null;
    if (session?.user?.id) {
      const userEntry = rankedResults.find(
        (r) => r.userId.toString() === session.user.id.toString()
      );
      if (userEntry) {
        currentUserStats = {
          rank: userEntry.rank,
          total_score: userEntry.total_score,
          predictions_count: userEntry.predictions_count,
          accuracy: userEntry.avg_accuracy,
          current_streak: userEntry.current_streak,
        };
      }
    }

    return NextResponse.json({
      leaderboard,
      periodStats,
      currentUserStats,
      page,
      limit,
      total: rankedResults.length,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
