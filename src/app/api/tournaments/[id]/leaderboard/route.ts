import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/lib/mongoose";
import Tournaments from "@/models/tournament.model";
import { Predictions } from "@/models/predictions.model";

export const dynamic = "force-dynamic";

interface LeaderboardEntry {
  user_id: string;
  username: string;
  fullName: string;
  rank: number;
  total_score: number;
  predictions_made: number;
  avg_accuracy: number;
  disqualified: boolean;
}

/**
 * GET /api/tournaments/[id]/leaderboard
 * Returns live leaderboard for a tournament
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDB();

    const tournament = await Tournaments.findById(params.id);

    if (!tournament) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 }
      );
    }

    // Aggregate predictions to calculate leaderboard
    const leaderboard = await Predictions.aggregate([
      {
        $match: {
          tournament_id: tournament._id,
          isActive: true
        }
      },
      {
        $group: {
          _id: "$user.userId",
          username: { $first: "$user.username" },
          fullName: { $first: "$user.fullName" },
          total_score: {
            $sum: {
              $cond: [
                { $ifNull: ["$score", false] },
                "$score",
                0
              ]
            }
          },
          predictions_made: { $sum: 1 },
          avg_accuracy: {
            $avg: {
              $cond: [
                { $ifNull: ["$bonus_modifiers.accuracy_pct", false] },
                "$bonus_modifiers.accuracy_pct",
                0
              ]
            }
          }
        }
      },
      {
        $sort: { total_score: -1 }
      }
    ]);

    // Add rank and disqualification status
    const requiredPredictions = tournament.auction_ids.length;
    const rankedLeaderboard: LeaderboardEntry[] = leaderboard.map((entry, index) => ({
      user_id: entry._id.toString(),
      username: entry.username || 'Unknown',
      fullName: entry.fullName || '',
      rank: index + 1,
      total_score: Math.round(entry.total_score * 100) / 100,
      predictions_made: entry.predictions_made,
      avg_accuracy: Math.round(entry.avg_accuracy * 100) / 100,
      disqualified: entry.predictions_made < requiredPredictions
    }));

    // Separate qualified and disqualified participants
    const qualified = rankedLeaderboard.filter(e => !e.disqualified);
    const disqualified = rankedLeaderboard.filter(e => e.disqualified);

    return NextResponse.json(
      {
        tournament_id: tournament._id,
        tournament_name: tournament.name,
        total_participants: tournament.users.length,
        required_predictions: requiredPredictions,
        qualified_count: qualified.length,
        disqualified_count: disqualified.length,
        leaderboard: qualified,
        disqualified: disqualified
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error fetching tournament leaderboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
