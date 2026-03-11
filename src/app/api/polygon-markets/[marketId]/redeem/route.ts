/**
 * POST /api/polygon-markets/[marketId]/redeem
 *
 * Redeems the authenticated user's winning position.
 * Idempotent: findOneAndUpdate with { status: "OPEN" } guard prevents double-payout.
 *
 * Market must be RESOLVED or SETTLED with winningOutcome set.
 * User must have an OPEN position on the winning outcome.
 */

import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getAuthSession } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { calcSettlementPayout } from "@/lib/amm";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ marketId: string }> }
) {
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

  const { marketId } = await params;
  let marketObjectId: ObjectId;
  try {
    marketObjectId = new ObjectId(marketId);
  } catch {
    return NextResponse.json({ message: "Invalid marketId" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db();
  const now = new Date();

  const market = await db
    .collection("polygon_markets")
    .findOne({ _id: marketObjectId }, { projection: { status: 1, winningOutcome: 1 } });

  if (!market) {
    return NextResponse.json({ message: "Market not found" }, { status: 404 });
  }

  if (market.status !== "RESOLVED" && market.status !== "SETTLED") {
    return NextResponse.json(
      { message: "Market has not resolved yet — check back after the auction ends." },
      { status: 422 }
    );
  }

  if (!market.winningOutcome) {
    return NextResponse.json(
      { message: "Market outcome is pending oracle confirmation." },
      { status: 422 }
    );
  }

  const winningOutcome = market.winningOutcome as "YES" | "NO";
  const losingOutcome: "YES" | "NO" = winningOutcome === "YES" ? "NO" : "YES";

  // Find user's winning OPEN position
  const position = await db.collection("polygon_positions").findOne({
    userId: userObjectId,
    marketId: marketObjectId,
    outcome: winningOutcome,
    status: "OPEN",
  });

  if (!position) {
    // Check if they had a losing position for a better error message
    const losingPosition = await db.collection("polygon_positions").findOne({
      userId: userObjectId,
      marketId: marketObjectId,
      outcome: losingOutcome,
    });
    if (losingPosition) {
      return NextResponse.json(
        {
          message: `The market resolved ${winningOutcome}. Your ${losingOutcome} position did not win.`,
        },
        { status: 422 }
      );
    }
    return NextResponse.json(
      { message: "No winning position found for this market." },
      { status: 404 }
    );
  }

  const shares: number = position.shares ?? 0;
  if (shares <= 0) {
    return NextResponse.json({ message: "Position has zero shares." }, { status: 422 });
  }

  const { grossPayout, fee, netPayout } = calcSettlementPayout(shares);

  // Atomic: mark position SETTLED (OPEN guard prevents double-payout)
  const settled = await db.collection("polygon_positions").findOneAndUpdate(
    { _id: position._id, status: "OPEN" },
    {
      $set: {
        status: "SETTLED",
        settledAt: now,
        grossPayout,
        settlementFee: fee,
        payout: netPayout,
        updatedAt: now,
      },
    },
    { returnDocument: "after" }
  );

  if (!settled) {
    return NextResponse.json({ message: "Position already redeemed." }, { status: 409 });
  }

  // Credit user wallet
  await db.collection("users").updateOne(
    { _id: userObjectId },
    { $inc: { balance: netPayout }, $set: { updatedAt: now } }
  );

  // Transaction audit
  await db.collection("transactions").insertOne({
    userID: userObjectId,
    transactionType: "prediction_payout",
    amount: netPayout,
    type: "+",
    status: "success",
    marketId: marketObjectId,
    positionId: position._id,
    grossPayout,
    settlementFee: fee,
    winningOutcome,
    transactionDate: now,
  });

  // Fee ledger
  await db.collection("fee_ledger").insertOne({
    type: "settlement_fee",
    marketId: marketObjectId,
    userId: userObjectId,
    positionId: position._id,
    amount: fee,
    grossPayout,
    createdAt: now,
  });

  return NextResponse.json({
    ok: true,
    sharesRedeemed: shares,
    grossPayout: Math.round(grossPayout * 100) / 100,
    fee: Math.round(fee * 100) / 100,
    netPayout: Math.round(netPayout * 100) / 100,
  });
}
