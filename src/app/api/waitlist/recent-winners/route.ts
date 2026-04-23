import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = (await clientPromise).db(process.env.DB_NAME || undefined);
    const rows = await db
      .collection("polygon_positions")
      .aggregate([
        { $match: { status: "SETTLED", payout: { $gt: 10 }, isVirtual: { $ne: true } } },
        { $sort: { settledAt: -1 } },
        { $limit: 20 },
        { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
        { $lookup: { from: "polygon_markets", localField: "marketId", foreignField: "_id", as: "market" } },
        {
          $project: {
            payout: 1,
            settledAt: 1,
            username: { $arrayElemAt: ["$user.username", 0] },
            marketTitle: { $arrayElemAt: ["$market.title", 0] },
          },
        },
      ])
      .toArray();
    return NextResponse.json({ winners: rows });
  } catch (err) {
    console.error("waitlist/recent-winners:", err);
    return NextResponse.json({ winners: [] });
  }
}
