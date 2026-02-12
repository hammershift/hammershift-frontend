import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongoose";
import Users from "@/models/user.model";
import { Predictions } from "@/models/predictions.model";
import Streak from "@/models/streak.model";
import Badge from "@/models/badge.model";

/**
 * GET /api/profile
 * Fetches complete user profile data including stats, badges, and streaks
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Fetch user data
    const user = await Users.findById(session.user.id)
      .select(
        "username fullName email about createdAt rank_title total_points email_preferences"
      )
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch streak data
    const streak = await Streak.findOne({ user_id: session.user.id }).lean();

    // Fetch badges
    const badges = await Badge.find({ user_id: session.user.id })
      .sort({ earned_at: -1 })
      .lean();

    // Calculate accuracy
    const accuracyAgg = await Predictions.aggregate([
      {
        $match: {
          "user.userId": session.user.id,
          score: { $exists: true, $ne: null },
          delta_from_actual: { $ne: null },
        },
      },
      {
        $group: {
          _id: null,
          avg_accuracy: {
            $avg: {
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
          },
        },
      },
    ]);

    const accuracy =
      accuracyAgg.length > 0 ? accuracyAgg[0].avg_accuracy : 0;

    // Get user rank (simplified - you may want to cache this)
    const allUsers = await Predictions.aggregate([
      {
        $match: {
          score: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: "$user.userId",
          total_score: { $sum: "$score" },
        },
      },
      {
        $sort: { total_score: -1 },
      },
    ]);

    const rank =
      allUsers.findIndex(
        (u) => u._id.toString() === session.user.id.toString()
      ) + 1;

    return NextResponse.json({
      user,
      streak,
      badges,
      accuracy,
      rank,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/profile
 * Updates user profile information
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { fullName, about } = body;

    await connectDB();

    const updateData: any = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (about !== undefined) updateData.about = about;

    const updatedUser = await Users.findByIdAndUpdate(
      session.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select("username fullName about");

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
