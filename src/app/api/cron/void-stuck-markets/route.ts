/**
 * GET /api/cron/void-stuck-markets
 *
 * Markets stuck in oracleStatus:"FAILED" for > STUCK_THRESHOLD_HOURS with no
 * resolution are voided and all open positions are refunded at cost.
 *
 * Why this exists: the scraper is currently not writing finalPrice back to
 * auction documents, so oracleResolver.ts keeps flagging expired markets as
 * ORACLE_FAILED. Without this pass, user stakes sit trapped in RESOLVED-but-
 * not-settled state forever. This route is the safety net: refund everyone
 * their totalCost after a fixed wait.
 *
 * Idempotency: markets already at status "VOIDED" are skipped. Positions are
 * moved from OPEN → REFUNDED with an OPEN guard so double-runs are safe.
 *
 * Auth: x-cron-secret header must equal CRON_SECRET env var.
 */

import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

const STUCK_THRESHOLD_HOURS = 24;
const STUCK_THRESHOLD_MS = STUCK_THRESHOLD_HOURS * 60 * 60 * 1000;

// Amplify SSR Lambda times out near 30s. Cap both the batch size and the
// wall-clock budget so the handler always returns a clean 200 — the cron
// runs every 6h, so any leftover markets get picked up on the next pass.
// The handler is fully idempotent (OPEN guards on positions, VOIDED skip
// on markets), so stopping mid-batch is safe.
const MAX_MARKETS_PER_RUN = 25;
const TIME_BUDGET_MS = 22_000;

function isAuthorized(req: Request): boolean {
  const secret = req.headers.get("x-cron-secret");
  return !!secret && secret === process.env.CRON_SECRET;
}

interface VoidResult {
  marketId: string;
  positionsRefunded: number;
  positionsFailed: number;
  totalRefunded: number;
  voided: boolean;
  reason: string;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Wrap the entire handler so any throw from clientPromise resolution,
  // a Mongo query, or downstream logic produces a JSON 500 with a real
  // detail string — not a generic empty-body 500 from Next.js. Without
  // this, transient Atlas errors (replica-set election, idle-disconnect)
  // surface to the cron as opaque 500s that block the workflow.
  try {
    return await runVoidStuckMarkets();
  } catch (err) {
    console.error("void-stuck-markets: handler threw:", err);
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, error: "Internal server error", detail },
      { status: 500 }
    );
  }
}

async function runVoidStuckMarkets(): Promise<NextResponse> {
  const client = await clientPromise;
  const db = client.db(process.env.DB_NAME || undefined);
  const now = new Date();
  const cutoff = new Date(now.getTime() - STUCK_THRESHOLD_MS);
  const runStart = Date.now();

  const stuckMarkets = await db
    .collection("polygon_markets")
    .find({
      oracleStatus: "FAILED",
      closesAt: { $lt: cutoff },
      status: { $nin: ["VOIDED", "SETTLED"] },
    })
    .limit(MAX_MARKETS_PER_RUN)
    .toArray();

  if (stuckMarkets.length === 0) {
    return NextResponse.json({ ok: true, marketsProcessed: 0, results: [] });
  }

  const results: VoidResult[] = [];
  let budgetHit = false;

  for (const market of stuckMarkets) {
    if (Date.now() - runStart > TIME_BUDGET_MS) {
      budgetHit = true;
      console.warn(
        `void-stuck-markets: time budget hit after ${results.length} markets — deferring ${
          stuckMarkets.length - results.length
        } to next run`
      );
      break;
    }
    const marketId = market._id as ObjectId;
    const result: VoidResult = {
      marketId: marketId.toHexString(),
      positionsRefunded: 0,
      positionsFailed: 0,
      totalRefunded: 0,
      voided: false,
      reason: `Oracle failed > ${STUCK_THRESHOLD_HOURS}h — voided and refunded.`,
    };

    const openPositions = await db
      .collection("polygon_positions")
      .find({ marketId, status: "OPEN" })
      .toArray();

    let truncatedMidMarket = false;
    for (const position of openPositions) {
      if (Date.now() - runStart > TIME_BUDGET_MS) {
        truncatedMidMarket = true;
        budgetHit = true;
        break;
      }
      const positionId = position._id as ObjectId;
      const userId = position.userId as ObjectId;
      const refundAmount: number = position.totalCost ?? 0;
      const isVirtual = position.isVirtual === true;

      if (refundAmount <= 0) {
        await db
          .collection("polygon_positions")
          .updateOne(
            { _id: positionId, status: "OPEN" },
            { $set: { status: "REFUNDED", settledAt: now, payout: 0, refundReason: "oracle_failed_timeout", updatedAt: now } }
          )
          .catch(() => {});
        continue;
      }

      try {
        const refundResult = await db
          .collection("polygon_positions")
          .findOneAndUpdate(
            { _id: positionId, status: "OPEN" },
            {
              $set: {
                status: "REFUNDED",
                settledAt: now,
                payout: refundAmount,
                refundReason: "oracle_failed_timeout",
                updatedAt: now,
              },
            },
            { returnDocument: "after" }
          );

        if (!refundResult) continue;

        // Virtual (free-play) positions refund to virtualBalance; real to balance.
        const creditField = isVirtual ? "virtualBalance" : "balance";
        await db.collection("users").findOneAndUpdate(
          { _id: userId },
          { $inc: { [creditField]: refundAmount }, $set: { updatedAt: now } }
        );

        if (!isVirtual) {
          await db.collection("transactions").insertOne({
            userID: userId,
            transactionType: "refund",
            amount: refundAmount,
            type: "+",
            status: "success",
            marketId,
            positionId,
            refundReason: "oracle_failed_timeout",
            transactionDate: now,
          });
        }

        result.positionsRefunded++;
        result.totalRefunded += refundAmount;
      } catch (err) {
        console.error(
          `void-stuck-markets: refund failed for position ${positionId.toHexString()}:`,
          err
        );
        result.positionsFailed++;
      }
    }

    if (result.positionsFailed === 0 && !truncatedMidMarket) {
      await db.collection("polygon_markets").updateOne(
        { _id: marketId },
        {
          $set: {
            status: "VOIDED",
            voidedAt: now,
            voidReason: "oracle_failed_timeout",
            totalPayoutIssued: result.totalRefunded,
            updatedAt: now,
          },
        }
      );
      result.voided = true;

      // Mark the corresponding polygon_flags ORACLE_FAILED entry as resolved
      // so admin view doesn't keep showing it as an open action item.
      await db.collection("polygon_flags").updateMany(
        { marketId, flagType: "ORACLE_FAILED", resolved: false },
        {
          $set: {
            resolved: true,
            resolvedBy: null,
            resolvedAt: now,
            resolutionNote: "Auto-voided by cron — positions refunded at cost.",
          },
        }
      );
    } else {
      console.error(
        `void-stuck-markets: market ${marketId.toHexString()} left unvoided — ${result.positionsFailed} refund failure(s)`
      );
    }

    results.push(result);
  }

  return NextResponse.json({
    ok: true,
    marketsProcessed: results.length,
    marketsQueued: stuckMarkets.length,
    marketsVoided: results.filter((r) => r.voided).length,
    totalRefunded: results.reduce((s, r) => s + r.totalRefunded, 0),
    budgetHit,
    durationMs: Date.now() - runStart,
    results,
  });
}
