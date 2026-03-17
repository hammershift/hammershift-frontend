import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongoose";
import { Predictions } from "@/models/predictions.model";
import LeaderboardSnapshot from "@/models/leaderboardSnapshot.model";
import Badge from "@/models/badge.model";
import type { PipelineStage, Types } from "mongoose";

/**
 * GET /api/leaderboard
 *
 * Fetches leaderboard data with period filtering, pagination, search, and user stats.
 * Query params:
 * - period: 'weekly' | 'monthly' | 'alltime' (default: alltime)
 * - page: number (default: 1)
 * - limit: number (default: 50, max: 100)
 * - search: string (optional, case-insensitive username filter)
 *
 * Fast path: if a fresh LeaderboardSnapshot exists (< 1 hour old), returns cached data.
 * Falls back to live aggregation if snapshots are stale or missing.
 * Response includes a `cached` boolean indicating which path was taken.
 */

const SNAPSHOT_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const period = searchParams.get("period") || "alltime";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const skip = (page - 1) * limit;
    const search = searchParams.get("search")?.trim() || "";

    // Get current user session
    const session = await getServerSession(authOptions);

    // -----------------------------------------------------------------------
    // FAST PATH: serve from LeaderboardSnapshot if fresh
    // -----------------------------------------------------------------------

    // Check freshness: find the newest snapshot for this period
    const newestSnapshot = await LeaderboardSnapshot.findOne({ period }).sort({
      snapshot_at: -1,
    });

    const snapshotAge = newestSnapshot
      ? Date.now() - new Date(newestSnapshot.snapshot_at).getTime()
      : Infinity;

    const isFresh = snapshotAge < SNAPSHOT_TTL_MS;

    if (isFresh && newestSnapshot) {
      // Build query against snapshots — join with users for username
      const snapshotPipeline: PipelineStage[] = [
        {
          $match: {
            period,
            snapshot_at: newestSnapshot.snapshot_at,
          },
        },
        {
          $sort: { rank: 1 },
        },
        {
          $lookup: {
            from: "users",
            localField: "user_id",
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
            localField: "user_id",
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
            _id: "$user_id",
            userId: "$user_id",
            username: "$user.username",
            fullName: "$user.fullName",
            rank: 1,
            total_score: "$score",
            predictions_count: 1,
            avg_accuracy: "$accuracy_pct",
            current_streak: {
              $ifNull: ["$streak.current_streak", 0],
            },
          },
        },
      ];

      // Apply search filter after user join
      if (search) {
        snapshotPipeline.push({
          $match: {
            username: { $regex: search, $options: "i" },
          },
        });
      }

      const allSnapshotResults = await LeaderboardSnapshot.aggregate(
        snapshotPipeline
      );

      const total = allSnapshotResults.length;
      const paginatedResults = allSnapshotResults.slice(skip, skip + limit);

      // Hydrate badges
      const userIds = paginatedResults.map((r) => r.userId);
      const badgeMap = await buildBadgeMap(userIds);

      const leaderboard = paginatedResults.map((entry) => ({
        ...entry,
        badges: badgeMap[entry.userId?.toString()] || [],
      }));

      const periodStats = {
        total_participants: total,
        top_score:
          allSnapshotResults.length > 0 ? allSnapshotResults[0].total_score : 0,
        avg_score:
          allSnapshotResults.length > 0
            ? allSnapshotResults.reduce((sum, r) => sum + r.total_score, 0) /
              allSnapshotResults.length
            : 0,
      };

      let currentUserStats = null;
      if (session?.user?.id) {
        const userEntry = allSnapshotResults.find(
          (r) => r.userId?.toString() === session.user.id.toString()
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
        total,
        cached: true,
      });
    }

    // -----------------------------------------------------------------------
    // LIVE PATH: fall back to aggregation when snapshots are stale or missing
    // -----------------------------------------------------------------------

    const now = new Date();
    let startDate: Date;
    const endDate: Date = now;

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
      // Apply search filter after user join so username is available
      ...(search
        ? ([
            {
              $match: {
                "user.username": { $regex: search, $options: "i" },
              },
            },
          ] as PipelineStage[])
        : []),
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

    // Get all results to calculate global ranks before paginating
    const allResults = await Predictions.aggregate(leaderboardPipeline);

    // Add ranks
    const rankedResults = allResults.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    const total = rankedResults.length;

    // Paginate after ranking
    const paginatedPage = rankedResults.slice(skip, skip + limit);

    // Hydrate badges for this page only
    const userIds = paginatedPage.map((r) => r.userId);
    const badgeMap = await buildBadgeMap(userIds);

    const leaderboard = paginatedPage.map((entry) => ({
      ...entry,
      badges: badgeMap[entry.userId?.toString()] || [],
    }));

    // Calculate period stats from the full (search-filtered) result set
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
        (r) => r.userId?.toString() === session.user.id.toString()
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
      total,
      cached: false,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// Badge hydration helper
// ---------------------------------------------------------------------------

interface BadgeEntry {
  badge_type: string;
  earned_at: Date;
}

/**
 * Fetches up to 3 most-recent badges per user for the given user IDs.
 * Uses a single DB query and groups results in memory.
 */
async function buildBadgeMap(
  userIds: (Types.ObjectId | string | undefined)[]
): Promise<Record<string, BadgeEntry[]>> {
  const validIds = userIds.filter(Boolean);
  if (validIds.length === 0) return {};

  const badges = await Badge.find(
    { user_id: { $in: validIds } },
    { user_id: 1, badge_type: 1, earned_at: 1 }
  )
    .sort({ earned_at: -1 })
    .lean();

  const map: Record<string, BadgeEntry[]> = {};

  for (const badge of badges) {
    const key = badge.user_id.toString();
    if (!map[key]) map[key] = [];
    if (map[key].length < 3) {
      map[key].push({
        badge_type: badge.badge_type,
        earned_at: badge.earned_at,
      });
    }
  }

  return map;
}
