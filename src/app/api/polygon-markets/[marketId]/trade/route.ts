/**
 * POST /api/polygon-markets/[marketId]/trade
 *
 * Executes a binary prediction market trade using CPMM (constant-product AMM).
 *
 * Flow:
 *  1. Authenticate via NextAuth session
 *  2. Validate market exists and is ACTIVE (status only — pool read deferred to transaction)
 *  3. Validate user has sufficient balance
 *  4. Execute all DB writes atomically via MongoDB client session + transaction:
 *     a. Re-read pool state inside transaction (serializes concurrent access)
 *     b. Run AMM math with fresh pool state (including slippage guard)
 *     c. Debit user wallet (atomic findOneAndUpdate with balance check)
 *     d. Update pool reserves and market prices
 *     e. Upsert polygon_positions (add to existing position or create new)
 *     f. Insert polygon_trades record
 *     g. Insert transaction record (audit trail)
 *  5. Return trade receipt
 *
 * Atomicity strategy:
 *   MongoDB multi-document transactions require a replica set. If the cluster
 *   does not support sessions (standalone dev), we fall back to compensating
 *   writes with an explicit rollback sequence. The fallback is clearly marked.
 *
 * Race condition fix (B-7):
 *   Pool state is re-read WITH the MongoDB session inside the transaction
 *   boundary. This means the DB serializes concurrent trades — two concurrent
 *   requests cannot both read the same pool state and corrupt k = yesPool * noPool.
 *   The pre-transaction market load is kept only for status validation (404/422)
 *   so that we can return early before opening a session at all.
 *
 * Error handling:
 *   Any failure after wallet debit but before completion triggers a compensating
 *   credit back to the user's wallet and a failed-trade transaction record.
 */

import { NextRequest, NextResponse } from "next/server";
import { ObjectId, ClientSession } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { getAuthSession } from "@/lib/auth";
import { quoteTradeExact } from "@/lib/amm";
import {
  validateTrade,
  recordTradeForRiskTracking,
  writeFlags,
  TradeContext,
} from "@/lib/tradeValidator";
import {
  checkMinimumTradeInterval,
  detectOpposingSidesCollusion,
} from "@/lib/washTradeDetector";
import { getClientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

interface TradeRequestBody {
  outcome: "YES" | "NO";
  usdcAmount: number;
  maxSlippage: number;
}

function validateBody(body: unknown): TradeRequestBody {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Request body must be a JSON object");
  }
  const b = body as Record<string, unknown>;

  if (b.outcome !== "YES" && b.outcome !== "NO") {
    throw new ValidationError("outcome must be 'YES' or 'NO'");
  }
  if (typeof b.usdcAmount !== "number" || b.usdcAmount <= 0) {
    throw new ValidationError("usdcAmount must be a positive number");
  }
  if (b.usdcAmount < 1) {
    throw new ValidationError("Minimum trade size is $1.00");
  }
  if (b.usdcAmount > 10_000) {
    throw new ValidationError("Maximum single trade size is $10,000");
  }
  if (typeof b.maxSlippage !== "number" || b.maxSlippage < 0 || b.maxSlippage > 1) {
    throw new ValidationError("maxSlippage must be a number between 0 and 1");
  }

  return {
    outcome: b.outcome,
    usdcAmount: b.usdcAmount,
    maxSlippage: b.maxSlippage,
  };
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ marketId: string }> }
) {
  // ── 1. Auth ──────────────────────────────────────────────────────────────
  const session = await getAuthSession();
  if (!session?.user?._id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user._id as string;
  let userObjectId: ObjectId;
  try {
    userObjectId = new ObjectId(userId);
  } catch {
    return NextResponse.json({ message: "Invalid user ID in session" }, { status: 401 });
  }

  // ── 2. Parse params ───────────────────────────────────────────────────────
  const { marketId } = await params;
  let marketObjectId: ObjectId;
  try {
    marketObjectId = new ObjectId(marketId);
  } catch {
    return NextResponse.json({ message: "Invalid marketId format" }, { status: 400 });
  }

  // ── 3. Parse and validate body ────────────────────────────────────────────
  let body: TradeRequestBody;
  try {
    const raw = await req.json();
    body = validateBody(raw);
  } catch (err) {
    const message = err instanceof ValidationError ? err.message : "Invalid request body";
    return NextResponse.json({ message }, { status: 400 });
  }

  const { outcome, usdcAmount, maxSlippage } = body;

  const callerIp = getClientIp(req as unknown as Request);
  const deviceFingerprint = req.headers.get("x-device-fp") ?? null;
  const ctx: TradeContext = { callerIp, deviceFingerprint: deviceFingerprint ?? undefined };

  const client = await clientPromise;
  const db = client.db();

  // ── 3a. Minimum trade interval check (60 seconds) ─────────────────────────
  // Fast O(1) indexed check — runs before loading market or running AMM math.
  const intervalCheck = await checkMinimumTradeInterval(userId, marketId, db);
  if (intervalCheck.blocked) {
    return NextResponse.json({ message: intervalCheck.reason }, { status: 429 });
  }

  // ── 3b. Risk validation pipeline ─────────────────────────────────────────
  // Enforces: market ACTIVE, trading window, ban check, balance, position cap, rate limit.
  const riskCheck = await validateTrade(userId, marketId, outcome, usdcAmount, db, ctx);
  if (!riskCheck.valid) {
    return NextResponse.json({ message: riskCheck.reason }, { status: 422 });
  }

  // ── 4. Load market (status validation only) ───────────────────────────────
  // We only check existence and status here. Pool state is intentionally NOT
  // read at this point — it will be re-read inside the transaction to prevent
  // the AMM race condition (B-7). Reading pool here would give a stale snapshot
  // that could be overwritten by a concurrent trade before we commit.
  const market = await db
    .collection("polygon_markets")
    .findOne({ _id: marketObjectId }, { projection: { status: 1 } });

  if (!market) {
    return NextResponse.json({ message: "Market not found" }, { status: 404 });
  }
  if (market.status !== "ACTIVE") {
    return NextResponse.json(
      { message: `Market is not ACTIVE (current status: ${market.status})` },
      { status: 422 }
    );
  }

  // ── 5. Load user and check balance ────────────────────────────────────────
  const user = await db
    .collection("users")
    .findOne({ _id: userObjectId }, { projection: { balance: 1 } });

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }
  if (typeof user.balance !== "number" || user.balance < usdcAmount) {
    return NextResponse.json(
      {
        message: "Insufficient balance",
        required: usdcAmount,
        available: user.balance ?? 0,
      },
      { status: 422 }
    );
  }

  // ── 6. Atomic writes ──────────────────────────────────────────────────────
  // NOTE: AMM quote is computed INSIDE the transaction (or compensating writes)
  // after re-reading pool state. This is the B-7 race condition fix.
  const now = new Date();
  const tradeId = new ObjectId();

  // Attempt MongoDB multi-document transaction.
  // Falls back to sequential compensating writes if transactions are unsupported
  // (e.g., standalone MongoDB in local dev without a replica set).
  let dbSession: ClientSession | null = null;
  let walletDebited = false;
  // quote is populated by executeTradeWrites / executeCompensatingWrites
  let quote: ReturnType<typeof quoteTradeExact> | null = null;

  try {
    dbSession = client.startSession();

    try {
      await dbSession.withTransaction(async () => {
        quote = await executeTradeWrites(
          db,
          dbSession!,
          {
            tradeId,
            userObjectId,
            marketObjectId,
            marketId,
            userId,
            outcome,
            usdcAmount,
            maxSlippage,
            now,
          }
        );
      });
      walletDebited = true; // committed inside transaction — no manual rollback needed
    } catch (txErr) {
      // Transaction failed — MongoDB rolled back atomically. Re-throw.
      throw txErr;
    }
  } catch (sessionErr: unknown) {
    const errMsg = sessionErr instanceof Error ? sessionErr.message : String(sessionErr);

    // Slippage exceeded or pool not initialized — user-facing 422, not a 500.
    if (
      errMsg.includes("Slippage") ||
      errMsg.includes("zero or negative shares") ||
      errMsg.includes("not initialized")
    ) {
      return NextResponse.json({ message: errMsg }, { status: 422 });
    }

    // If the error is "Transaction numbers are only allowed on a replica set member"
    // we fall back to sequential compensating writes.
    const isNoReplicaSet =
      errMsg.includes("replica set") ||
      errMsg.includes("Transaction") ||
      errMsg.includes("sessions are not supported");

    if (!isNoReplicaSet) {
      // A real error — attempt rollback if wallet was debited
      if (walletDebited) {
        await compensatingCreditWallet(db, userObjectId, usdcAmount, tradeId, now);
      }
      console.error("POST /api/polygon-markets/[marketId]/trade - transaction error:", sessionErr);
      return NextResponse.json({ message: "Trade failed — please try again" }, { status: 500 });
    }

    // ── Fallback: compensating writes (no replica set) ──────────────────────
    try {
      quote = await executeCompensatingWrites(
        db,
        {
          tradeId,
          userObjectId,
          marketObjectId,
          marketId,
          userId,
          outcome,
          usdcAmount,
          maxSlippage,
          now,
        }
      );
    } catch (fallbackErr: unknown) {
      const fallbackMsg = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);

      // Slippage / pool errors from compensating path are also 422s
      if (
        fallbackMsg.includes("Slippage") ||
        fallbackMsg.includes("zero or negative shares") ||
        fallbackMsg.includes("not initialized")
      ) {
        return NextResponse.json({ message: fallbackMsg }, { status: 422 });
      }

      console.error(
        "POST /api/polygon-markets/[marketId]/trade - compensating write error:",
        fallbackErr
      );
      // If wallet was debited during compensating writes, attempt credit-back
      await compensatingCreditWallet(db, userObjectId, usdcAmount, tradeId, now).catch(() => {});
      return NextResponse.json(
        { message: "Trade failed during execution — funds have been returned if debited" },
        { status: 500 }
      );
    }
  } finally {
    if (dbSession) {
      await dbSession.endSession().catch(() => {});
    }
  }

  // Guard: quote must be set by this point (transaction or compensating path).
  if (!quote) {
    return NextResponse.json({ message: "Trade failed — quote unavailable" }, { status: 500 });
  }

  // ── 7. Post-trade risk bookkeeping (fire-and-forget) ─────────────────────
  // Record in rate limit collection and update market_positions running total.
  // Write any flags emitted during validation.
  // Run opposing-sides collusion check.
  // None of these failures roll back the committed trade.
  recordTradeForRiskTracking(userId, marketId, outcome, usdcAmount, db, ctx).catch(
    (err) => console.error("recordTradeForRiskTracking failed (non-fatal):", err)
  );

  if (riskCheck.flags && riskCheck.flags.length > 0) {
    writeFlags(db, userObjectId, marketObjectId, riskCheck.flags).catch(
      (err) => console.error("writeFlags failed (non-fatal):", err)
    );
  }

  detectOpposingSidesCollusion(
    userId,
    marketId,
    outcome,
    callerIp,
    deviceFingerprint,
    db
  ).catch((err) =>
    console.error("detectOpposingSidesCollusion failed (non-fatal):", err)
  );

  // ── 8. Return receipt ─────────────────────────────────────────────────────
  return NextResponse.json(
    {
      tradeId: tradeId.toHexString(),
      sharesReceived: round6(quote.sharesReceived),
      pricePerShare: round6(quote.pricePerShare),
      fee: round2(quote.fee),
      usdcSpent: round2(usdcAmount),
      outcome,
      newYesPrice: round4(quote.newYesPrice),
      newNoPrice: round4(quote.newNoPrice),
      slippagePct: round4(quote.slippagePct),
    },
    { status: 201 }
  );
}

// ---------------------------------------------------------------------------
// Write helpers
// ---------------------------------------------------------------------------

interface WriteParams {
  tradeId: ObjectId;
  userObjectId: ObjectId;
  marketObjectId: ObjectId;
  marketId: string;
  userId: string;
  outcome: "YES" | "NO";
  usdcAmount: number;
  maxSlippage: number;
  now: Date;
}

/**
 * Execute all trade writes inside a MongoDB transaction session.
 * The session is passed through to each collection write.
 *
 * Pool state is re-read WITH the session at the top of this function so that
 * the DB serializes concurrent reads — fixing the B-7 AMM race condition.
 * Returns the computed quote so the route handler can build the response.
 */
async function executeTradeWrites(
  db: ReturnType<typeof import("mongodb").MongoClient.prototype.db>,
  session: ClientSession,
  p: WriteParams
): Promise<ReturnType<typeof quoteTradeExact>> {
  const { tradeId, userObjectId, marketObjectId, marketId, userId, outcome, usdcAmount, maxSlippage, now } = p;

  // ── Re-read pool state inside the transaction (B-7 fix) ──────────────────
  // Using the session here means MongoDB holds a read lock on this document
  // within the transaction, preventing concurrent trades from corrupting k.
  const freshMarket = await db.collection("polygon_markets").findOne(
    { _id: marketObjectId, status: "ACTIVE" },
    { projection: { yesPool: 1, noPool: 1 }, session: session ?? undefined }
  );
  if (!freshMarket) {
    throw new Error("Market not found or no longer ACTIVE");
  }
  const poolYes = freshMarket.yesPool as number;
  const poolNo = freshMarket.noPool as number;
  if (!poolYes || !poolNo || poolYes <= 0 || poolNo <= 0) {
    throw new Error("Market pool is not initialized");
  }

  const quote = quoteTradeExact(
    { yesPool: poolYes, noPool: poolNo },
    outcome,
    usdcAmount,
    maxSlippage
  );

  // ── a. Debit wallet (atomic balance check + deduct) ──────────────────────
  const debitResult = await db.collection("users").findOneAndUpdate(
    {
      _id: userObjectId,
      balance: { $gte: usdcAmount }, // guard: only deduct if still sufficient
    },
    {
      $inc: { balance: -usdcAmount },
      $set: { updatedAt: now },
    },
    { session, returnDocument: "after" }
  );

  if (!debitResult) {
    throw new Error("Insufficient balance — concurrent debit detected");
  }

  // ── b. Update market pool and prices ─────────────────────────────────────
  await db.collection("polygon_markets").updateOne(
    { _id: marketObjectId },
    {
      $set: {
        yesPool: quote.newPool.yesPool,
        noPool: quote.newPool.noPool,
        yesPrice: quote.newYesPrice,
        noPrice: quote.newNoPrice,
        updatedAt: now,
      },
      $inc: {
        totalVolume: usdcAmount,
        totalLiquidity: quote.usdcAfterFee,
      },
    },
    { session }
  );

  // ── c. Upsert position ────────────────────────────────────────────────────
  // Uses MongoDB's $setOnInsert + $inc to do a true upsert:
  // - If position exists: add shares and recalculate avgCostBasis
  // - If new: set initial values
  // avgCostBasis update: weighted average of existing + new cost
  await db.collection("polygon_positions").updateOne(
    {
      userId: userObjectId,
      marketId: marketObjectId,
      outcome,
      status: "OPEN",
    },
    [
      // Aggregation pipeline update for weighted average calculation
      {
        $set: {
          userId: userObjectId,
          marketId: marketObjectId,
          outcome,
          status: "OPEN",
          shares: {
            $add: [{ $ifNull: ["$shares", 0] }, quote.sharesReceived],
          },
          totalCost: {
            $add: [{ $ifNull: ["$totalCost", 0] }, usdcAmount],
          },
          avgCostBasis: {
            $divide: [
              { $add: [{ $ifNull: ["$totalCost", 0] }, usdcAmount] },
              { $add: [{ $ifNull: ["$shares", 0] }, quote.sharesReceived] },
            ],
          },
          updatedAt: now,
          // createdAt: only set on insert (handled by separate update below)
        },
      },
    ],
    {
      upsert: true,
      session,
    }
  );

  // Set createdAt only on the initial insert (pipeline updates don't support $setOnInsert)
  // We do a separate update that's a no-op if createdAt is already set.
  await db.collection("polygon_positions").updateOne(
    {
      userId: userObjectId,
      marketId: marketObjectId,
      outcome,
      status: "OPEN",
      createdAt: { $exists: false },
    },
    { $set: { createdAt: now } },
    { session }
  );

  // ── d. Insert trade record ─────────────────────────────────────────────────
  await db.collection("polygon_trades").insertOne(
    {
      _id: tradeId,
      marketId: marketObjectId,
      userId: userObjectId,
      outcome,
      sharesTraded: quote.sharesReceived,
      pricePerShare: quote.pricePerShare,
      usdcSpent: usdcAmount,
      usdcAfterFee: quote.usdcAfterFee,
      fee: quote.fee,
      slippagePct: quote.slippagePct,
      txHash: null, // on-chain txHash — null for off-chain trades
      status: "FILLED",
      createdAt: now,
    },
    { session }
  );

  // ── e. Insert transaction audit record ────────────────────────────────────
  await db.collection("transactions").insertOne(
    {
      userID: userObjectId,
      transactionType: "prediction_buy",
      amount: usdcAmount,
      type: "-",
      status: "success",
      relatedTradeId: tradeId,
      marketId: marketObjectId,
      transactionDate: now,
    },
    { session }
  );

  return quote;
}

/**
 * Compensating writes fallback for environments without replica set support.
 * These are sequential and NOT atomic. If any step fails after wallet debit,
 * compensatingCreditWallet() is called by the caller.
 *
 * Pool state is re-read at the top of this function (same B-7 pattern as the
 * transactional path) so that callers cannot pass in a stale pre-computed quote.
 * Returns the computed quote so the route handler can build the response.
 */
async function executeCompensatingWrites(
  db: ReturnType<typeof import("mongodb").MongoClient.prototype.db>,
  p: WriteParams
): Promise<ReturnType<typeof quoteTradeExact>> {
  const { tradeId, userObjectId, marketObjectId, outcome, usdcAmount, maxSlippage, now } = p;

  // Re-read pool state (best-effort without a session — no true isolation here,
  // but still better than using a value read before this function was called).
  const freshMarket = await db.collection("polygon_markets").findOne(
    { _id: marketObjectId, status: "ACTIVE" },
    { projection: { yesPool: 1, noPool: 1 } }
  );
  if (!freshMarket) {
    throw new Error("Market not found or no longer ACTIVE");
  }
  const poolYes = freshMarket.yesPool as number;
  const poolNo = freshMarket.noPool as number;
  if (!poolYes || !poolNo || poolYes <= 0 || poolNo <= 0) {
    throw new Error("Market pool is not initialized");
  }

  const quote = quoteTradeExact(
    { yesPool: poolYes, noPool: poolNo },
    outcome,
    usdcAmount,
    maxSlippage
  );

  // a. Debit wallet
  const debitResult = await db.collection("users").findOneAndUpdate(
    { _id: userObjectId, balance: { $gte: usdcAmount } },
    { $inc: { balance: -usdcAmount }, $set: { updatedAt: now } },
    { returnDocument: "after" }
  );
  if (!debitResult) {
    throw new Error("Insufficient balance — concurrent debit detected");
  }

  // b. Update market pool
  await db.collection("polygon_markets").updateOne(
    { _id: marketObjectId },
    {
      $set: {
        yesPool: quote.newPool.yesPool,
        noPool: quote.newPool.noPool,
        yesPrice: quote.newYesPrice,
        noPrice: quote.newNoPrice,
        updatedAt: now,
      },
      $inc: { totalVolume: usdcAmount, totalLiquidity: quote.usdcAfterFee },
    }
  );

  // c. Upsert position
  await db.collection("polygon_positions").updateOne(
    { userId: userObjectId, marketId: marketObjectId, outcome, status: "OPEN" },
    [
      {
        $set: {
          userId: userObjectId,
          marketId: marketObjectId,
          outcome,
          status: "OPEN",
          shares: { $add: [{ $ifNull: ["$shares", 0] }, quote.sharesReceived] },
          totalCost: { $add: [{ $ifNull: ["$totalCost", 0] }, usdcAmount] },
          avgCostBasis: {
            $divide: [
              { $add: [{ $ifNull: ["$totalCost", 0] }, usdcAmount] },
              { $add: [{ $ifNull: ["$shares", 0] }, quote.sharesReceived] },
            ],
          },
          updatedAt: now,
        },
      },
    ],
    { upsert: true }
  );

  await db.collection("polygon_positions").updateOne(
    {
      userId: userObjectId,
      marketId: marketObjectId,
      outcome,
      status: "OPEN",
      createdAt: { $exists: false },
    },
    { $set: { createdAt: now } }
  );

  // d. Insert trade record
  await db.collection("polygon_trades").insertOne({
    _id: tradeId,
    marketId: marketObjectId,
    userId: userObjectId,
    outcome,
    sharesTraded: quote.sharesReceived,
    pricePerShare: quote.pricePerShare,
    usdcSpent: usdcAmount,
    usdcAfterFee: quote.usdcAfterFee,
    fee: quote.fee,
    slippagePct: quote.slippagePct,
    txHash: null,
    status: "FILLED",
    createdAt: now,
  });

  // e. Transaction audit
  await db.collection("transactions").insertOne({
    userID: userObjectId,
    transactionType: "prediction_buy",
    amount: usdcAmount,
    type: "-",
    status: "success",
    relatedTradeId: tradeId,
    marketId: marketObjectId,
    transactionDate: now,
  });

  return quote;
}

/**
 * Compensating credit: restore user balance if writes failed after wallet debit.
 * Also records a failed-trade transaction for the audit trail.
 */
async function compensatingCreditWallet(
  db: ReturnType<typeof import("mongodb").MongoClient.prototype.db>,
  userObjectId: ObjectId,
  amount: number,
  tradeId: ObjectId,
  now: Date
): Promise<void> {
  await db.collection("users").updateOne(
    { _id: userObjectId },
    { $inc: { balance: amount }, $set: { updatedAt: now } }
  );
  await db.collection("transactions").insertOne({
    userID: userObjectId,
    transactionType: "refund",
    amount,
    type: "+",
    status: "success",
    relatedTradeId: tradeId,
    note: "Auto-refund: trade execution failed after wallet debit",
    transactionDate: now,
  });
}

// ---------------------------------------------------------------------------
// Rounding helpers
// ---------------------------------------------------------------------------

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

function round6(n: number): number {
  return Math.round(n * 1_000_000) / 1_000_000;
}
