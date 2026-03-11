/**
 * GET /api/users/me/positions
 *
 * Returns the authenticated user's prediction market positions.
 * Enriches each position with market question, status, and winning outcome.
 *
 * Query params:
 *   status - "OPEN" | "SETTLED" | "ALL" (default: "ALL")
 */

import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/lib/mongoose";
import mongoose from "mongoose";
import { getAuthSession } from "@/lib/auth";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?._id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user._id as string;
  let userObjectId: ObjectId;
  try {
    userObjectId = new ObjectId(userId);
  } catch {
    return NextResponse.json({ message: "Invalid user session" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const statusParam = searchParams.get("status") ?? "ALL";

  await connectToDB();
  const db = mongoose.connection.db!;

  const filter: Record<string, unknown> = { userId: userObjectId };
  if (statusParam !== "ALL" && ["OPEN", "SETTLED"].includes(statusParam)) {
    filter.status = statusParam;
  }

  const positions = await db
    .collection("polygon_positions")
    .find(filter)
    .sort({ updatedAt: -1 })
    .limit(200)
    .toArray();

  if (positions.length === 0) {
    return NextResponse.json([]);
  }

  // Enrich with market data
  const marketIdStrings = Array.from(new Set(positions.map((p) => p.marketId.toString())));
  const marketObjectIds = marketIdStrings.map((id) => new ObjectId(id));

  const markets = await db
    .collection("polygon_markets")
    .find({ _id: { $in: marketObjectIds } })
    .project({
      question: 1,
      status: 1,
      winningOutcome: 1,
      predictedPrice: 1,
      closesAt: 1,
      title: 1,
      imageUrl: 1,
    })
    .toArray();

  const marketMap = new Map(markets.map((m) => [m._id.toString(), m]));

  const enriched = positions.map((p) => {
    const market = marketMap.get(p.marketId.toString()) ?? null;
    const winningOutcome = market?.winningOutcome ?? null;
    const result = !winningOutcome
      ? "PENDING"
      : winningOutcome === p.outcome
      ? "WON"
      : "LOST";

    return {
      _id: p._id,
      marketId: p.marketId,
      outcome: p.outcome,
      shares: p.shares,
      totalCost: p.totalCost,
      avgCostBasis: p.avgCostBasis,
      status: p.status,
      payout: p.payout ?? null,
      grossPayout: p.grossPayout ?? null,
      settlementFee: p.settlementFee ?? null,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      settledAt: p.settledAt ?? null,
      result,
      market: market
        ? {
            question: market.question,
            status: market.status,
            winningOutcome: market.winningOutcome ?? null,
            predictedPrice: market.predictedPrice,
            closesAt: market.closesAt ?? null,
            title: market.title ?? null,
            imageUrl: market.imageUrl ?? null,
          }
        : null,
    };
  });

  return NextResponse.json(enriched);
}
