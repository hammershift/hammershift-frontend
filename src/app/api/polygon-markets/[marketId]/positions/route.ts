/**
 * GET /api/polygon-markets/[marketId]/positions
 *
 * Returns positions for the given market.
 * Admins see full position data including userId.
 * Public callers see aggregate data only (no PII).
 *
 * Query params:
 *   status - "OPEN" | "SETTLED" | "ALL" (default: "OPEN")
 */

import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/lib/mongoose";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import { getAuthSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ marketId: string }> }
) {
  const { marketId } = await params;
  const { searchParams } = req.nextUrl;
  const statusParam = searchParams.get("status") ?? "OPEN";

  const session = await getAuthSession();
  const isAdmin = ["admin", "superadmin"].includes(
    (session?.user as { role?: string } | undefined)?.role ?? ""
  );

  let marketObjectId: ObjectId;
  try {
    marketObjectId = new ObjectId(marketId);
  } catch {
    return NextResponse.json({ message: "Invalid marketId" }, { status: 400 });
  }

  await connectToDB();
  const db = mongoose.connection.db!;

  const filter: Record<string, unknown> = { marketId: marketObjectId };
  const validStatuses = ["OPEN", "SETTLED"];
  if (statusParam !== "ALL" && validStatuses.includes(statusParam)) {
    filter.status = statusParam;
  }

  const positions = await db
    .collection("polygon_positions")
    .find(filter)
    .sort({ totalCost: -1 })
    .limit(200)
    .toArray();

  if (!isAdmin) {
    return NextResponse.json(
      positions.map((p) => ({
        outcome: p.outcome,
        shares: p.shares,
        totalCost: p.totalCost,
        avgCostBasis: p.avgCostBasis,
        status: p.status,
        payout: p.payout ?? null,
      }))
    );
  }

  return NextResponse.json(positions);
}
