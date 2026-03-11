/**
 * oracleResolver.ts
 *
 * Oracle logic for final price verification and market resolution.
 *
 * Resolution protocol:
 *   1. Find ACTIVE markets where closesAt has passed
 *   2. For each market, check if the linked auction has finalPrice populated
 *   3. If finalPrice is present → resolve immediately
 *   4. If finalPrice is absent:
 *      a. If closesAt + ORACLE_GRACE_PERIOD_MS has NOT passed → skip (wait for scraper)
 *      b. If closesAt + ORACLE_GRACE_PERIOD_MS HAS passed → mark ORACLE_FAILED, flag admin
 *   5. HIGH_VALUE markets have an additional 30-minute manual review hold before resolving
 *
 * This module is called from /api/cron/resolve-markets.
 * It does NOT perform the payout calculation — that is a separate concern.
 *
 * Oracle provenance chain stored at resolution:
 *   finalPriceAtResolution  - the price used (from auction.finalPrice)
 *   finalPriceSource        - "scraper" | "manual_override"
 *   finalPriceCapturedAt    - when the scraper wrote it
 *   oracleStatus            - "CAPTURED" | "FAILED" | "MANUAL"
 */

import { Db, ObjectId } from "mongodb";

/** Time after closesAt before declaring oracle failure (90 minutes) */
export const ORACLE_GRACE_PERIOD_MS = 90 * 60 * 1000;

/**
 * Additional hold before resolving HIGH_VALUE markets to allow manual spot-check.
 * Admin can see the BaT URL on the auction document to verify.
 */
export const HIGH_VALUE_REVIEW_HOLD_MS = 30 * 60 * 1000;

export interface ResolutionResult {
  marketId: string;
  status: "resolved" | "waiting_for_price" | "oracle_failed" | "high_value_hold";
  winningOutcome?: "YES" | "NO";
  finalPrice?: number;
  reason?: string;
}

/**
 * Attempts to resolve a single expired market.
 * Returns a structured result without throwing — caller collects all results.
 */
export async function attemptMarketResolution(
  market: Record<string, unknown>,
  db: Db,
  now: Date
): Promise<ResolutionResult> {
  const marketId = (market._id as ObjectId).toString();
  const closesAt = market.closesAt ? new Date(market.closesAt as string | Date) : null;

  if (!closesAt) {
    return { marketId, status: "waiting_for_price", reason: "No closesAt on market." };
  }

  // HIGH_VALUE markets: hold for 30 minutes after close before auto-resolving
  if (
    market.riskTier === "HIGH_VALUE" &&
    now.getTime() < closesAt.getTime() + HIGH_VALUE_REVIEW_HOLD_MS
  ) {
    const holdRemainingMs = closesAt.getTime() + HIGH_VALUE_REVIEW_HOLD_MS - now.getTime();
    const holdRemainingMin = Math.ceil(holdRemainingMs / 60_000);
    return {
      marketId,
      status: "high_value_hold",
      reason: `HIGH_VALUE market — manual review hold. ${holdRemainingMin}min remaining.`,
    };
  }

  // Find the linked auction
  const auctionId = market.auctionId as string;
  let auctionObjectId: ObjectId | null = null;
  try {
    auctionObjectId = new ObjectId(auctionId);
  } catch {
    // Not a valid ObjectId
  }

  const orClauses: Record<string, unknown>[] = [{ auction_id: auctionId }];
  if (auctionObjectId) {
    orClauses.push({ _id: auctionObjectId });
  }

  const auction = await db.collection("auctions").findOne(
    { $or: orClauses },
    {
      projection: {
        finalPrice: 1,
        finalPriceSource: 1,
        finalPriceCapturedAt: 1,
        "sort.price": 1,
      },
    }
  );

  if (!auction) {
    return { marketId, status: "waiting_for_price", reason: "Auction document not found." };
  }

  // Case 1: finalPrice is present — this is the authoritative hammer price
  if (auction.finalPrice != null && auction.finalPrice > 0) {
    const finalPrice = auction.finalPrice as number;
    const predictedPrice = market.predictedPrice as number;
    const winningOutcome: "YES" | "NO" = finalPrice > predictedPrice ? "YES" : "NO";

    await db.collection("polygon_markets").updateOne(
      { _id: market._id as ObjectId },
      {
        $set: {
          status: "RESOLVED",
          winningOutcome,
          resolvedAt: now,
          finalPriceAtResolution: finalPrice,
          finalPriceSource: auction.finalPriceSource ?? "scraper",
          finalPriceCapturedAt: auction.finalPriceCapturedAt ?? now,
          oracleStatus: "CAPTURED",
          updatedAt: now,
        },
      }
    );

    return { marketId, status: "resolved", winningOutcome, finalPrice };
  }

  // Case 2: finalPrice absent — check grace period
  const gracePeriodExpiry = new Date(closesAt.getTime() + ORACLE_GRACE_PERIOD_MS);

  if (now < gracePeriodExpiry) {
    // Still within grace period — scraper may not have re-fetched yet
    const waitingMin = Math.ceil((gracePeriodExpiry.getTime() - now.getTime()) / 60_000);
    return {
      marketId,
      status: "waiting_for_price",
      reason: `Waiting for scraper to capture final price. Grace period: ${waitingMin}min remaining.`,
    };
  }

  // Case 3: Grace period expired, no finalPrice — oracle failure
  // Do NOT resolve. Write a flag and set oracleStatus so admin can take action.
  await db.collection("polygon_markets").updateOne(
    { _id: market._id as ObjectId },
    {
      $set: {
        oracleStatus: "FAILED",
        updatedAt: now,
      },
    }
  );

  await db.collection("polygon_flags").insertOne({
    marketId: market._id as ObjectId,
    userId: null,
    flagType: "ORACLE_FAILED",
    severity: "HIGH",
    metadata: {
      auctionId,
      closesAt: closesAt.toISOString(),
      gracePeriodExpiredAt: gracePeriodExpiry.toISOString(),
      lastKnownBid: auction["sort"]?.["price"] ?? null,
    },
    resolved: false,
    resolvedBy: null,
    resolvedAt: null,
    createdAt: now,
  });

  return {
    marketId,
    status: "oracle_failed",
    reason: "finalPrice not captured after 90-minute grace period. Manual resolution required.",
  };
}

/**
 * Resolves all expired ACTIVE markets.
 * Called by the cron route handler.
 *
 * @returns Summary of resolution attempts
 */
export async function resolveExpiredMarkets(db: Db): Promise<{
  resolved: number;
  waitingForPrice: number;
  oracleFailed: number;
  highValueHold: number;
  results: ResolutionResult[];
}> {
  const now = new Date();

  const expiredMarkets = await db
    .collection("polygon_markets")
    .find({
      status: { $in: ["ACTIVE", "TRADING_CLOSED"] },
      closesAt: { $lt: now },
      // Exclude markets already flagged as oracle-failed (admin handles those)
      oracleStatus: { $ne: "FAILED" },
    })
    .toArray();

  const results: ResolutionResult[] = [];

  for (const market of expiredMarkets) {
    const result = await attemptMarketResolution(
      market as Record<string, unknown>,
      db,
      now
    );
    results.push(result);
  }

  return {
    resolved: results.filter((r) => r.status === "resolved").length,
    waitingForPrice: results.filter((r) => r.status === "waiting_for_price").length,
    oracleFailed: results.filter((r) => r.status === "oracle_failed").length,
    highValueHold: results.filter((r) => r.status === "high_value_hold").length,
    results,
  };
}
