export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDB from "@/lib/mongoose";
import mongoose from "mongoose";

export async function GET() {
  await connectToDB();
  const db = mongoose.connection.db!;
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;

  const pipeline = [
    { $match: { status: { $in: ["graded", "paid"] }, actualPrice: { $gt: 0 } } },
    {
      $group: {
        _id: "$user",
        totalGames: { $sum: 1 },
        avgAccuracy: {
          $avg: {
            $multiply: [
              { $subtract: [1, { $divide: ["$penalizedError", "$actualPrice"] }] },
              100,
            ],
          },
        },
        totalWinnings: { $sum: "$prizePaid" },
      },
    },
    { $match: { avgAccuracy: { $gt: 0 } } },
    { $sort: { avgAccuracy: -1 } },
    { $limit: 100 },
  ];

  const leaderboard = await db.collection("guesstehammers").aggregate(pipeline).toArray();

  // Fetch user details
  const userIds = leaderboard.map((e) => e._id);
  const users = await db.collection("users")
    .find({ _id: { $in: userIds } })
    .project({ username: 1, fullName: 1, image: 1 })
    .toArray();
  const userMap = new Map(users.map((u) => [u._id.toHexString(), u]));

  const results = leaderboard.map((entry, i) => {
    const user = userMap.get(entry._id.toHexString());
    return {
      rank: i + 1,
      userId: entry._id.toHexString(),
      displayName: (user as any)?.username || (user as any)?.fullName || "Anonymous",
      image: (user as any)?.image ?? null,
      totalGames: entry.totalGames,
      avgAccuracy: Math.round(entry.avgAccuracy * 10) / 10,
      totalWinnings: Math.round(entry.totalWinnings * 100) / 100,
      isCurrentUser: currentUserId === entry._id.toHexString(),
    };
  });

  // Find current user's rank if not in top 100
  let myRank = null;
  if (currentUserId && !results.find((r) => r.isCurrentUser)) {
    const myStats = await db.collection("guesstehammers").aggregate([
      { $match: { user: new mongoose.Types.ObjectId(currentUserId), status: { $in: ["graded", "paid"] }, actualPrice: { $gt: 0 } } },
      {
        $group: {
          _id: "$user",
          totalGames: { $sum: 1 },
          avgAccuracy: { $avg: { $multiply: [{ $subtract: [1, { $divide: ["$penalizedError", "$actualPrice"] }] }, 100] } },
          totalWinnings: { $sum: "$prizePaid" },
        },
      },
    ]).toArray();

    if (myStats.length > 0) {
      const myAccuracy = myStats[0].avgAccuracy;
      const betterCount = await db.collection("guesstehammers").aggregate([
        { $match: { status: { $in: ["graded", "paid"] }, actualPrice: { $gt: 0 } } },
        { $group: { _id: "$user", avgAccuracy: { $avg: { $multiply: [{ $subtract: [1, { $divide: ["$penalizedError", "$actualPrice"] }] }, 100] } } } },
        { $match: { avgAccuracy: { $gt: myAccuracy } } },
        { $count: "count" },
      ]).toArray();

      myRank = {
        rank: (betterCount[0]?.count ?? 0) + 1,
        totalGames: myStats[0].totalGames,
        avgAccuracy: Math.round(myStats[0].avgAccuracy * 10) / 10,
        totalWinnings: Math.round(myStats[0].totalWinnings * 100) / 100,
      };
    }
  }

  return NextResponse.json({ leaderboard: results, myRank });
}
