/**
 * GET /api/cron/settle-markets
 *
 * Settles all RESOLVED markets that have a winningOutcome set but have not
 * yet been settled (status !== 'SETTLED').
 *
 * Idempotency:
 *   - Only processes markets with status === 'RESOLVED' and winningOutcome set.
 *   - Only settles positions with status === 'OPEN' (not already SETTLED).
 *   - Uses findOneAndUpdate with status guard so double-runs are safe.
 *   - Market status is only flipped to 'SETTLED' after all positions are processed.
 *
 * Authorization:
 *   - Requires `x-cron-secret` header matching CRON_SECRET env var.
 *   - Safe to call from Vercel Cron, AWS EventBridge, or any authenticated caller.
 *
 * Payout formula:
 *   grossPayout = shares × $1.00
 *   fee         = grossPayout × 2%
 *   netPayout   = grossPayout - fee
 *
 * Settlement flow per market:
 *   1. Find all OPEN positions where outcome === winningOutcome
 *   2. For each position:
 *      a. Mark position SETTLED (findOneAndUpdate with OPEN guard = idempotent)
 *      b. Credit user wallet
 *      c. Record transaction audit entry
 *      d. Record fee accumulation entry
 *   3. Mark market SETTLED
 *   4. Accumulate platform fees into fee_ledger collection
 *
 * Error handling:
 *   - Individual position failures are caught and logged; settlement continues
 *     for remaining positions. The market is NOT marked SETTLED if any position
 *     failed — it will be retried on the next cron run.
 *   - This is intentionally conservative: partial settlement is never committed
 *     as complete.
 */

import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { calcSettlementPayout } from "@/lib/amm";
import { sendMarketResultEmail } from "@/lib/mail";
import { toSlug } from "@/lib/slug";
import { generateShortCode } from "@/lib/waitlist/codes";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Auth guard
// ---------------------------------------------------------------------------

function isAuthorized(req: Request): boolean {
  const secret = req.headers.get("x-cron-secret");
  return !!secret && secret === process.env.CRON_SECRET;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SettlementResult {
  marketId: string;
  winningOutcome: "YES" | "NO";
  positionsSettled: number;
  positionsFailed: number;
  totalNetPayout: number;
  totalFeeCollected: number;
  settled: boolean;
  mode: "normal" | "refund";
  reason?: string;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db(process.env.DB_NAME || undefined);
  const now = new Date();

  // Find all markets that are RESOLVED with a winningOutcome but not yet SETTLED
  const resolvedMarkets = await db
    .collection("polygon_markets")
    .find({
      status: "RESOLVED",
      winningOutcome: { $in: ["YES", "NO"] },
    })
    .toArray();

  if (resolvedMarkets.length === 0) {
    return NextResponse.json({ ok: true, marketsProcessed: 0, results: [] });
  }

  const results: SettlementResult[] = [];

  for (const market of resolvedMarkets) {
    const marketId = market._id as ObjectId;
    const winningOutcome = market.winningOutcome as "YES" | "NO";

    const result: SettlementResult = {
      marketId: marketId.toHexString(),
      winningOutcome,
      positionsSettled: 0,
      positionsFailed: 0,
      totalNetPayout: 0,
      totalFeeCollected: 0,
      settled: false,
      mode: "normal",
    };

    // ── 0. Calculate real money deposited on this market ─────────────────────
    // Only real user trades count — the virtual pool seed is NOT real money.
    const tradesAgg = await db
      .collection("polygon_trades")
      .aggregate([
        { $match: { marketId } },
        { $group: { _id: null, realDeposits: { $sum: "$usdcSpent" } } },
      ])
      .toArray();
    const realDeposits = tradesAgg[0]?.realDeposits ?? 0;

    // Find ALL open positions (winners and losers)
    const allOpenPositions = await db
      .collection("polygon_positions")
      .find({ marketId, status: "OPEN" })
      .toArray();

    const winningPositions = allOpenPositions.filter(
      (p) => p.outcome === winningOutcome
    );
    const losingPositions = allOpenPositions.filter(
      (p) => p.outcome !== winningOutcome
    );

    // Calculate total payout winners would need
    const totalWinnerShares = winningPositions.reduce(
      (sum, p) => sum + (p.shares ?? 0),
      0
    );
    const totalWinnerPayout = calcSettlementPayout(totalWinnerShares);

    // ── SOLVENCY CHECK ──────────────────────────────────────────────────────
    // If real deposits can't cover winner payouts, trigger refund mode.
    // This prevents paying winners with phantom seed money.
    const canCoverPayouts = realDeposits >= totalWinnerPayout.netPayout;

    if (!canCoverPayouts && realDeposits > 0) {
      // ── REFUND MODE ─────────────────────────────────────────────────────
      // Not enough on the losing side to pay winners.
      // Refund everyone their original totalCost (minus the 2% entry fee
      // which was already collected).
      result.mode = "refund";
      result.reason = `Insufficient liquidity: $${realDeposits.toFixed(2)} real deposits vs $${totalWinnerPayout.netPayout.toFixed(2)} needed for payouts`;

      console.warn(
        `settle-markets: REFUND MODE for market ${marketId.toHexString()} — ${result.reason}`
      );

      for (const position of allOpenPositions) {
        const positionId = position._id as ObjectId;
        const userId = position.userId as ObjectId;
        const refundAmount: number = position.totalCost ?? 0;

        if (refundAmount <= 0) {
          await db
            .collection("polygon_positions")
            .updateOne(
              { _id: positionId, status: "OPEN" },
              { $set: { status: "REFUNDED", settledAt: now, payout: 0, updatedAt: now } }
            )
            .catch(() => {});
          continue;
        }

        try {
          // Mark position REFUNDED
          const refundResult = await db
            .collection("polygon_positions")
            .findOneAndUpdate(
              { _id: positionId, status: "OPEN" },
              {
                $set: {
                  status: "REFUNDED",
                  settledAt: now,
                  payout: refundAmount,
                  refundReason: "insufficient_liquidity",
                  updatedAt: now,
                },
              },
              { returnDocument: "after" }
            );

          if (!refundResult) continue;

          // Credit back the original cost
          await db.collection("users").findOneAndUpdate(
            { _id: userId },
            {
              $inc: { balance: refundAmount },
              $set: { updatedAt: now },
            }
          );

          // Audit trail
          await db.collection("transactions").insertOne({
            userID: userId,
            transactionType: "refund",
            amount: refundAmount,
            type: "+",
            status: "success",
            marketId,
            positionId,
            refundReason: "insufficient_liquidity",
            transactionDate: now,
          });

          result.positionsSettled++;
          result.totalNetPayout += refundAmount;
        } catch (refundErr) {
          console.error(
            `settle-markets: refund failed for position ${positionId.toHexString()}:`,
            refundErr
          );
          result.positionsFailed++;
        }
      }
    } else if (realDeposits === 0) {
      // ── NO REAL TRADES — just close all positions with $0 payout ────────
      result.mode = "refund";
      result.reason = "No real trades on this market";

      await db.collection("polygon_positions").updateMany(
        { marketId, status: "OPEN" },
        { $set: { status: "SETTLED", settledAt: now, payout: 0, updatedAt: now } }
      );
    } else {
      // ── NORMAL SETTLEMENT — real deposits cover payouts ─────────────────
      result.mode = "normal";

      for (const position of winningPositions) {
        const positionId = position._id as ObjectId;
        const userId = position.userId as ObjectId;
        const shares: number = position.shares ?? 0;

        if (shares <= 0) {
          await db
            .collection("polygon_positions")
            .updateOne(
              { _id: positionId, status: "OPEN" },
              { $set: { status: "SETTLED", settledAt: now, payout: 0, updatedAt: now } }
            )
            .catch(() => {});
          continue;
        }

        const { grossPayout, fee, netPayout } = calcSettlementPayout(shares);

        try {
          // ── a. Mark position SETTLED (idempotent: OPEN guard) ─────────────
          const settleResult = await db
            .collection("polygon_positions")
            .findOneAndUpdate(
              { _id: positionId, status: "OPEN" },
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

          if (!settleResult) continue;

          // ── b. Credit user wallet (or virtualBalance for free play) ──────
          const positionIsVirtual = position.isVirtual === true;
          const creditField = positionIsVirtual ? "virtualBalance" : "balance";
          const incUpdate: Record<string, number> = { [creditField]: netPayout };
          if (positionIsVirtual) incUpdate.virtualWon = netPayout;

          const updatedUser = await db.collection("users").findOneAndUpdate(
            { _id: userId },
            {
              $inc: incUpdate,
              $set: { updatedAt: now },
            },
            { returnDocument: "after" }
          );

          // ── b1. Send result email to winner (non-blocking) ─────────────────
          const updatedUserDoc = updatedUser && "value" in updatedUser ? updatedUser.value : updatedUser;
          if (updatedUserDoc?.email) {
            try {
              await sendMarketResultEmail({
                to: updatedUserDoc.email as string,
                marketTitle: market.title ?? market.question ?? "a market",
                outcome: "won",
                amount: netPayout,
              });
            } catch (emailErr) {
              console.error(
                `settle-markets: result email failed for user ${userId.toHexString()}:`,
                emailErr
              );
            }
          }

          // ── c. Transaction audit record (skip for virtual) ─────────────────
          if (!positionIsVirtual) {
            await db.collection("transactions").insertOne({
              userID: userId,
              transactionType: "prediction_payout",
              amount: netPayout,
              type: "+",
              status: "success",
              marketId,
              positionId,
              grossPayout,
              settlementFee: fee,
              winningOutcome,
              transactionDate: now,
            });

            // ── d. Fee ledger entry ──────────────────────────────────────────
            await db.collection("fee_ledger").insertOne({
              type: "settlement_fee",
              marketId,
              userId,
              positionId,
              amount: fee,
              grossPayout,
              createdAt: now,
            });
          }

          result.positionsSettled++;
          result.totalNetPayout += netPayout;
          result.totalFeeCollected += fee;
        } catch (positionErr) {
          console.error(
            `settle-markets: failed to settle position ${positionId.toHexString()} in market ${marketId.toHexString()}:`,
            positionErr
          );
          result.positionsFailed++;
        }
      }
    }

    // ── 3. Mark losing positions as LOST (only in normal mode) ────────────────
    // In refund mode, all positions were already handled above.
    if (result.positionsFailed === 0 && result.mode === "normal") {
      await db.collection("polygon_positions").updateMany(
        { marketId, status: "OPEN" },
        { $set: { status: "LOST", settledAt: now, updatedAt: now } }
      );

      // ── 3a. Update streaks and award badges for winning users ──────────────
      // Collect distinct winning user IDs from the positions we just settled.
      const settledWinnerIds = winningPositions
        .filter((p) => (p.shares ?? 0) > 0)
        .map((p) => p.userId as ObjectId);

      const winnerSet = new Set(settledWinnerIds.map((id) => id.toHexString()));

      // Increment streak for each distinct winner
      for (const winnerId of settledWinnerIds) {
        try {
          // Upsert streak document — increment current_streak, update longest if needed
          const streakDoc = await db.collection("streaks").findOneAndUpdate(
            { user_id: winnerId },
            [
              {
                $set: {
                  current_streak: { $add: [{ $ifNull: ["$current_streak", 0] }, 1] },
                  longest_streak: {
                    $max: [
                      { $ifNull: ["$longest_streak", 0] },
                      { $add: [{ $ifNull: ["$current_streak", 0] }, 1] },
                    ],
                  },
                  last_prediction_date: now,
                  updatedAt: now,
                },
              },
            ],
            { upsert: true, returnDocument: "after" }
          );

          const currentStreak: number = (streakDoc as { current_streak?: number } | null)?.current_streak ?? 1;

          // Award FIRST_WIN badge if not already held
          const hasFirstWin = await db.collection("badges").findOne({
            user_id: winnerId,
            badge_type: "first_win",
          });
          if (!hasFirstWin) {
            await db.collection("badges").insertOne({
              user_id: winnerId,
              badge_type: "first_win",
              earned_at: now,
            });
          }

          // Award streak milestone badges if threshold reached and not already held
          const streakBadges: Array<{ threshold: number; badge_type: string }> = [
            { threshold: 3, badge_type: "hot_start" },
            { threshold: 7, badge_type: "on_fire" },
            { threshold: 14, badge_type: "unstoppable" },
            { threshold: 30, badge_type: "legend" },
          ];

          for (const { threshold, badge_type } of streakBadges) {
            if (currentStreak >= threshold) {
              const alreadyHas = await db.collection("badges").findOne({
                user_id: winnerId,
                badge_type,
              });
              if (!alreadyHas) {
                await db.collection("badges").insertOne({
                  user_id: winnerId,
                  badge_type,
                  earned_at: now,
                });
              }
            }
          }
        } catch (streakErr) {
          // Non-fatal — streak/badge failure must not block settlement
          console.error(
            `settle-markets: streak/badge update failed for user ${winnerId.toHexString()}:`,
            streakErr
          );
        }
      }

      // ── 3b. Reset streak for losing users ─────────────────────────────────
      // Find distinct losing user IDs from positions that were just marked LOST
      const losingPositions = await db
        .collection("polygon_positions")
        .find({ marketId, status: "LOST", settledAt: now })
        .project({ userId: 1 })
        .toArray();

      const loserIds = losingPositions
        .map((p) => p.userId as ObjectId)
        .filter((id) => !winnerSet.has(id.toHexString()));

      for (const loserId of loserIds) {
        try {
          await db.collection("streaks").updateOne(
            { user_id: loserId },
            { $set: { current_streak: 0, last_prediction_date: now, updatedAt: now } },
            { upsert: true }
          );
        } catch (streakErr) {
          console.error(
            `settle-markets: streak reset failed for user ${loserId.toHexString()}:`,
            streakErr
          );
        }
      }

      // ── 3c. Send prediction result emails to losing users (non-blocking) ────
      for (const loserId of loserIds) {
        try {
          const loserUser = await db
            .collection("users")
            .findOne({ _id: loserId }, { projection: { email: 1 } });
          if (loserUser?.email) {
            // Find how much the loser staked (sum of shares as proxy for amount lost)
            const loserPosition = losingPositions.find(
              (p) => (p.userId as ObjectId).toHexString() === loserId.toHexString()
            );
            const amountLost: number = loserPosition?.shares ?? 0;
            await sendMarketResultEmail({
              to: loserUser.email as string,
              marketTitle: market.title ?? market.question ?? "a market",
              outcome: "lost",
              amount: amountLost,
            });
          }
        } catch (emailErr) {
          console.error(
            `settle-markets: result email failed for losing user ${loserId.toHexString()}:`,
            emailErr
          );
        }
      }

      // ── 3d. Winner share cards (real-money wins ≥ $10 per user) ───────────
      // Aggregate per-user net payout for this market across ALL settled
      // winning real-money positions (not just ones settled in this run, so
      // retries after partial failures still pick up previously-settled wins).
      // Per-card dedupe via existence check on (userId, type: "winner",
      // payload.marketId) — winner cards have no unique index.
      try {
        const winnerAgg = await db
          .collection("polygon_positions")
          .aggregate<{ _id: ObjectId; totalPayout: number }>([
            {
              $match: {
                marketId,
                status: "SETTLED",
                outcome: winningOutcome,
                isVirtual: { $ne: true },
              },
            },
            {
              $group: {
                _id: "$userId",
                totalPayout: { $sum: "$payout" },
              },
            },
            { $match: { totalPayout: { $gte: 10 } } },
          ])
          .toArray();

        if (winnerAgg.length > 0) {
          const marketIdHex = marketId.toHexString();
          const marketTitle: string =
            (market.title as string | undefined) ??
            (market.question as string | undefined) ??
            "";
          const auctionTitle: string =
            (market.auction as { title?: string } | undefined)?.title ?? "";
          const marketSlug = auctionTitle ? toSlug(auctionTitle) : "";

          for (const agg of winnerAgg) {
            const winnerUserId = agg._id;
            try {
              // Dedupe: one winner card per (user, market).
              const existing = await db.collection("share_cards").findOne({
                userId: winnerUserId,
                type: "winner",
                "payload.marketId": marketIdHex,
              });
              if (existing) continue;

              const winnerUser = await db
                .collection("users")
                .findOne(
                  { _id: winnerUserId },
                  { projection: { username: 1, referralCode: 1 } },
                );
              const username: string =
                (winnerUser?.username as string | undefined) ?? "";
              if (!username) continue; // no username → skip card, not catastrophic
              const referralCode: string =
                (winnerUser?.referralCode as string | undefined) ?? "";

              // Generate unique shortCode with up to 5 collision retries.
              let shortCode = generateShortCode();
              for (let i = 0; i < 5; i++) {
                const taken = await db
                  .collection("share_cards")
                  .findOne({ shortCode }, { projection: { _id: 1 } });
                if (!taken) break;
                shortCode = generateShortCode();
              }

              await db.collection("share_cards").insertOne({
                userId: winnerUserId,
                type: "winner",
                payload: {
                  payout: agg.totalPayout,
                  pick: winningOutcome,
                  marketId: marketIdHex,
                  marketSlug,
                  marketTitle,
                  username,
                  referralCode,
                },
                shortCode,
                views: 0,
                signups: 0,
                createdAt: now,
                updatedAt: now,
              });
            } catch (cardErr) {
              // Per-user failure must not block other winner cards on same market.
              console.error(
                `settle-markets: winner share card failed for user ${winnerUserId.toHexString()} in market ${marketIdHex}:`,
                cardErr,
              );
            }
          }
        }
      } catch (winnerAggErr) {
        // Aggregation failure is non-fatal — settlement is already committed.
        console.error(
          `settle-markets: winner share card aggregation failed for market ${marketId.toHexString()}:`,
          winnerAggErr,
        );
      }
    }

    // ── 4. Mark market SETTLED only if zero failures ──────────────────────────
    // If any positions failed, leave market as RESOLVED so the next cron run
    // can retry the failed positions.
    if (result.positionsFailed === 0) {
      await db.collection("polygon_markets").updateOne(
        { _id: marketId, status: "RESOLVED" },
        {
          $set: {
            status: "SETTLED",
            settledAt: now,
            totalPayoutIssued: result.totalNetPayout,
            totalFeesCollected: result.totalFeeCollected,
            updatedAt: now,
          },
        }
      );
      result.settled = true;
    } else {
      console.error(
        `settle-markets: market ${marketId.toHexString()} left as RESOLVED due to ${result.positionsFailed} position failure(s)`
      );
    }

    results.push(result);
  }

  const totalSettled = results.filter((r) => r.settled).length;
  const totalFailed = results.filter((r) => !r.settled).length;

  return NextResponse.json({
    ok: true,
    marketsProcessed: resolvedMarkets.length,
    marketsSettled: totalSettled,
    marketsFailed: totalFailed,
    results,
  });
}
