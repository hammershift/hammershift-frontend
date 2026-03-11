/**
 * washTradeDetector.ts
 *
 * Wash trade and opposing-sides collusion detection.
 *
 * Approach:
 *   - Minimum time between consecutive trades by the same user on the same market: 60 seconds.
 *     This prevents programmatic ping-pong trading within a single account.
 *   - Opposing-sides detection: if two distinct user accounts share the same IP or
 *     device fingerprint AND have placed trades on opposite sides (YES/NO) of the same
 *     market within a 10-minute window, flag both accounts for manual review.
 *
 * Limitations explicitly acknowledged:
 *   - IP-based detection produces false positives for users behind NAT/VPN/shared networks.
 *   - Detection is FLAGGING only — auto-banning requires admin review.
 *   - Device fingerprint is client-supplied and can be spoofed; treat as a signal, not proof.
 *
 * This module is called from the trade API route AFTER validateTrade passes,
 * as a non-blocking parallel check.
 */

import { Db, ObjectId } from "mongodb";
import { writeFlags, PendingFlag } from "./tradeValidator";

/** Minimum seconds between trades from the same user on the same market */
export const MIN_TRADE_INTERVAL_SECONDS = 60;

/** Window in minutes for opposing-sides IP check */
export const OPPOSING_SIDES_WINDOW_MINUTES = 10;

/**
 * Checks if the user traded on this market too recently (same user, same market).
 * Uses trade_rate_limits collection — reads the most recent trade document.
 *
 * Returns { blocked: true, reason } if within the minimum interval.
 * Returns { blocked: false } otherwise.
 */
export async function checkMinimumTradeInterval(
  userId: string,
  marketId: string,
  db: Db
): Promise<{ blocked: boolean; reason?: string; secondsRemaining?: number }> {
  const userObjectId = new ObjectId(userId);
  const marketObjectId = new ObjectId(marketId);
  const cutoff = new Date(Date.now() - MIN_TRADE_INTERVAL_SECONDS * 1000);

  const recentTrade = await db.collection("trade_rate_limits").findOne(
    {
      userId: userObjectId,
      marketId: marketObjectId,
      tradedAt: { $gt: cutoff },
    },
    { sort: { tradedAt: -1 }, projection: { tradedAt: 1 } }
  );

  if (!recentTrade) {
    return { blocked: false };
  }

  const secondsRemaining = Math.ceil(
    (recentTrade.tradedAt.getTime() + MIN_TRADE_INTERVAL_SECONDS * 1000 - Date.now()) / 1000
  );

  return {
    blocked: true,
    reason: `You must wait ${secondsRemaining} second(s) before placing another trade on this market.`,
    secondsRemaining,
  };
}

/**
 * Detects opposing-sides trading by accounts sharing the same IP or device fingerprint.
 *
 * Queries trade_rate_limits for:
 *   1. Any trade on the opposite outcome of this market within the window
 *   2. From a different userId
 *   3. With a matching callerIp OR deviceFingerprint
 *
 * If found, flags BOTH the current user AND the detected counterpart.
 * This is fire-and-forget — never blocks the trade.
 */
export async function detectOpposingSidesCollusion(
  userId: string,
  marketId: string,
  outcome: "YES" | "NO",
  callerIp: string,
  deviceFingerprint: string | null,
  db: Db
): Promise<void> {
  if (callerIp === "unknown" && !deviceFingerprint) {
    // No identifying information — skip check
    return;
  }

  const userObjectId = new ObjectId(userId);
  const marketObjectId = new ObjectId(marketId);
  const oppositeOutcome: "YES" | "NO" = outcome === "YES" ? "NO" : "YES";
  const windowStart = new Date(Date.now() - OPPOSING_SIDES_WINDOW_MINUTES * 60 * 1000);

  // Build the IP/device match clause
  const identityClause: Record<string, unknown>[] = [];
  if (callerIp !== "unknown") {
    identityClause.push({ callerIp });
  }
  if (deviceFingerprint) {
    identityClause.push({ deviceFingerprint });
  }

  const counterpartTrade = await db.collection("trade_rate_limits").findOne({
    marketId: marketObjectId,
    outcome: oppositeOutcome,
    userId: { $ne: userObjectId },
    tradedAt: { $gt: windowStart },
    $or: identityClause,
  });

  if (!counterpartTrade) {
    return;
  }

  // Found a potential wash trade pair — flag both accounts
  const flags: PendingFlag[] = [
    {
      flagType: "OPPOSING_SIDES_SAME_IP",
      severity: "HIGH",
      metadata: {
        currentUserId: userId,
        counterpartUserId: counterpartTrade.userId.toString(),
        currentOutcome: outcome,
        counterpartOutcome: oppositeOutcome,
        matchedOn: callerIp !== "unknown" ? "ip" : "device_fingerprint",
        callerIp,
        deviceFingerprint,
        windowMinutes: OPPOSING_SIDES_WINDOW_MINUTES,
      },
    },
  ];

  // Write flag against the current user
  await writeFlags(db, userObjectId, marketObjectId, flags).catch(() => {});

  // Write flag against the counterpart user as well
  await writeFlags(
    db,
    counterpartTrade.userId as ObjectId,
    marketObjectId,
    flags
  ).catch(() => {});
}
