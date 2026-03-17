// src/app/api/cron/refresh-leaderboard/route.ts
//
// Cron route: pre-computes leaderboard snapshots for all three periods.
//
// Authorization: requires x-cron-secret header matching CRON_SECRET env var.
// Returns: { refreshed: true, counts: { weekly: N, monthly: N, alltime: N } }

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { Predictions } from "@/models/predictions.model";
import LeaderboardSnapshot from "@/models/leaderboardSnapshot.model";
import type { PipelineStage } from "mongoose";

export const dynamic = "force-dynamic";

function isAuthorized(req: Request): boolean {
  const secret = req.headers.get("x-cron-secret");
  return !!secret && secret === process.env.CRON_SECRET;
}

type Period = "weekly" | "monthly" | "alltime";

function getPeriodStartDate(period: Period): Date {
  const now = new Date();
  switch (period) {
    case "weekly": {
      const d = new Date(now);
      d.setDate(now.getDate() - 7);
      return d;
    }
    case "monthly": {
      const d = new Date(now);
      d.setMonth(now.getMonth() - 1);
      return d;
    }
    case "alltime":
    default:
      return new Date(0);
  }
}

async function buildSnapshotsForPeriod(period: Period): Promise<number> {
  const now = new Date();
  const startDate = getPeriodStartDate(period);

  const pipeline: PipelineStage[] = [
    {
      $match: {
        scored_at: { $gte: startDate, $lte: now },
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
  ];

  const results = await Predictions.aggregate(pipeline);

  if (results.length === 0) {
    // Delete stale snapshots even if no results this period
    await LeaderboardSnapshot.deleteMany({ period });
    return 0;
  }

  const snapshotAt = new Date();

  const snapshots = results.map((entry, index) => ({
    period,
    user_id: entry._id,
    rank: index + 1,
    score: entry.total_score,
    accuracy_pct: entry.avg_accuracy ?? 0,
    predictions_count: entry.predictions_count ?? 0,
    snapshot_at: snapshotAt,
  }));

  // Atomic replacement: delete old, insert fresh
  await LeaderboardSnapshot.deleteMany({ period });
  await LeaderboardSnapshot.insertMany(snapshots, { ordered: false });

  return snapshots.length;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const periods: Period[] = ["weekly", "monthly", "alltime"];
    const counts: Record<Period, number> = {
      weekly: 0,
      monthly: 0,
      alltime: 0,
    };

    for (const period of periods) {
      counts[period] = await buildSnapshotsForPeriod(period);
    }

    return NextResponse.json({
      refreshed: true,
      counts,
    });
  } catch (error) {
    console.error("Error refreshing leaderboard snapshots:", error);
    return NextResponse.json(
      { error: "Failed to refresh leaderboard snapshots" },
      { status: 500 }
    );
  }
}
