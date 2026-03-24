export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongoose";
import mongoose from "mongoose";

export async function GET(request: Request) {
  // Auth check
  const secret = request.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDB();
  const db = mongoose.connection.db!;

  const results = {
    healthy: true,
    timestamp: new Date().toISOString(),
    marketReconciliation: {
      total: 0,
      passed: 0,
      failed: 0,
      failures: [] as Array<{
        marketId: string;
        question: string;
        totalIn: number;
        totalPayouts: number;
        totalFees: number;
        discrepancy: number;
      }>,
    },
    walletReconciliation: {
      totalBalances: 0,
      totalCredits: 0,
      totalDebits: 0,
      discrepancy: 0,
      passed: true,
    },
    positionIntegrity: {
      orphanedOpenPositions: 0,
      negativeSharePositions: 0,
      duplicatePositions: 0,
      passed: true,
    },
  };

  try {
    // ── 1. Per-market reconciliation ──
    const settledMarkets = await db
      .collection("polygon_markets")
      .find({ status: "SETTLED" })
      .toArray();

    results.marketReconciliation.total = settledMarkets.length;

    for (const market of settledMarkets) {
      const marketId = market._id;

      // Total money in: sum of all trade amounts
      const tradesAgg = await db
        .collection("polygon_trades")
        .aggregate([
          { $match: { marketId } },
          { $group: { _id: null, totalIn: { $sum: "$usdcAmount" } } },
        ])
        .toArray();
      const totalIn = tradesAgg[0]?.totalIn ?? 0;

      // Total payouts: sum of netPayout on SETTLED positions
      const payoutsAgg = await db
        .collection("polygon_positions")
        .aggregate([
          { $match: { marketId, status: "SETTLED" } },
          { $group: { _id: null, totalPayouts: { $sum: "$payout" } } },
        ])
        .toArray();
      const totalPayouts = payoutsAgg[0]?.totalPayouts ?? 0;

      // Total fees from fee_ledger
      const feesAgg = await db
        .collection("fee_ledger")
        .aggregate([
          { $match: { marketId } },
          { $group: { _id: null, totalFees: { $sum: "$amount" } } },
        ])
        .toArray();
      const totalFees = feesAgg[0]?.totalFees ?? 0;

      // Reconcile: totalIn should >= totalPayouts + totalFees (within tolerance)
      // The seed liquidity means totalIn can be less than payouts in edge cases
      const discrepancy = totalPayouts + totalFees - totalIn;

      if (Math.abs(discrepancy) > 0.01 && totalIn > 0) {
        // Only flag if money appeared from nowhere (positive discrepancy beyond seed)
        const seedLiquidity =
          (market.initialYesPool ?? 50) + (market.initialNoPool ?? 50);
        if (discrepancy > seedLiquidity + 0.01) {
          results.marketReconciliation.failed++;
          results.marketReconciliation.failures.push({
            marketId: marketId.toString(),
            question: market.question?.slice(0, 80) ?? "Unknown",
            totalIn,
            totalPayouts,
            totalFees,
            discrepancy,
          });
          results.healthy = false;
        } else {
          results.marketReconciliation.passed++;
        }
      } else {
        results.marketReconciliation.passed++;
      }
    }

    // ── 2. Wallet reconciliation ──
    const walletAgg = await db
      .collection("wallets")
      .aggregate([
        { $group: { _id: null, total: { $sum: "$balance" } } },
      ])
      .toArray();
    results.walletReconciliation.totalBalances = walletAgg[0]?.total ?? 0;

    const creditsAgg = await db
      .collection("transactions")
      .aggregate([
        { $match: { type: "+", status: "success" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ])
      .toArray();
    results.walletReconciliation.totalCredits = creditsAgg[0]?.total ?? 0;

    const debitsAgg = await db
      .collection("transactions")
      .aggregate([
        { $match: { type: "-", status: "success" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ])
      .toArray();
    results.walletReconciliation.totalDebits = debitsAgg[0]?.total ?? 0;

    const expectedBalance =
      results.walletReconciliation.totalCredits -
      results.walletReconciliation.totalDebits;
    results.walletReconciliation.discrepancy =
      Math.round(
        (results.walletReconciliation.totalBalances - expectedBalance) * 100
      ) / 100;

    if (Math.abs(results.walletReconciliation.discrepancy) > 1) {
      results.walletReconciliation.passed = false;
      results.healthy = false;
    }

    // ── 3. Position integrity ──
    // Open positions on settled markets
    const settledMarketIds = settledMarkets.map((m) => m._id);
    if (settledMarketIds.length > 0) {
      results.positionIntegrity.orphanedOpenPositions = await db
        .collection("polygon_positions")
        .countDocuments({
          marketId: { $in: settledMarketIds },
          status: "OPEN",
        });
    }

    // Negative shares
    results.positionIntegrity.negativeSharePositions = await db
      .collection("polygon_positions")
      .countDocuments({ shares: { $lt: 0 } });

    // Duplicate positions (same user + market + outcome)
    const dupeAgg = await db
      .collection("polygon_positions")
      .aggregate([
        {
          $group: {
            _id: { userId: "$userId", marketId: "$marketId", outcome: "$outcome" },
            count: { $sum: 1 },
          },
        },
        { $match: { count: { $gt: 1 } } },
        { $count: "total" },
      ])
      .toArray();
    results.positionIntegrity.duplicatePositions = dupeAgg[0]?.total ?? 0;

    if (
      results.positionIntegrity.orphanedOpenPositions > 0 ||
      results.positionIntegrity.negativeSharePositions > 0 ||
      results.positionIntegrity.duplicatePositions > 0
    ) {
      results.positionIntegrity.passed = false;
      results.healthy = false;
    }

    return NextResponse.json(results);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Reconciliation failed", details: message },
      { status: 500 }
    );
  }
}
