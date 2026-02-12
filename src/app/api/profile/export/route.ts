import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongoose";
import Users from "@/models/user.model";
import { Predictions } from "@/models/predictions.model";
import Streak from "@/models/streak.model";
import Badge from "@/models/badge.model";

// Force dynamic rendering - do not pre-render at build time
export const dynamic = 'force-dynamic';

/**
 * GET /api/profile/export
 * Exports all user data as JSON file
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Fetch all user data
    const user = await Users.findById(session.user.id).lean() as any;
    const predictions = await Predictions.find({
      "user.userId": session.user.id,
    }).lean() as any[];
    const streak = await Streak.findOne({ user_id: session.user.id }).lean() as any;
    const badges = await Badge.find({ user_id: session.user.id }).lean() as any[];

    // Compile export data
    const exportData = {
      export_date: new Date().toISOString(),
      user_info: {
        username: user?.username,
        fullName: user?.fullName,
        email: user?.email,
        about: user?.about,
        created_at: user?.createdAt,
        rank_title: user?.rank_title,
        total_points: user?.total_points,
      },
      streak_data: streak,
      badges: badges,
      predictions: predictions.map((p) => ({
        auction_id: p.auction_id,
        predicted_price: p.predictedPrice,
        score: p.score,
        rank: p.rank,
        created_at: p.createdAt,
        scored_at: p.scored_at,
      })),
      statistics: {
        total_predictions: predictions.length,
        total_score: predictions.reduce((sum, p) => sum + (p.score || 0), 0),
        badges_earned: badges.length,
        current_streak: streak?.current_streak || 0,
        longest_streak: streak?.longest_streak || 0,
      },
    };

    // Return as downloadable JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="velocity-markets-data-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("Error exporting profile data:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
