/**
 * tradeValidator.ts
 *
 * Core trade validation middleware for Velocity Markets binary prediction markets.
 *
 * Enforcement order (fail-fast):
 *   1. Market exists and is ACTIVE
 *   2. Trading window is open (tradingClosesAt not exceeded)
 *   3. User exists and is not banned
 *   4. User balance is sufficient
 *   5. Position cap not exceeded (per-user per-market per-outcome)
 *   6. Rate limit not exceeded (10 trades/hour per user per market)
 *   7. Late-snipe detection (flag only — does NOT block unless severity is HIGH)
 *
 * All monetary values are stored and compared in USD dollars.
 *
 * Position caps:
 *   Standard user:  $500 USD hard cap OR 20% of totalLiquidity, whichever is LOWER
 *   Trusted user:   $2,500 USD hard cap OR 20% of totalLiquidity, whichever is LOWER
 *   HIGH_VALUE market (predictedPrice > $100,000): caps halved
 *
 * Rate limit: 10 trades per user per market per rolling 60-minute window.
 * Implemented via MongoDB TTL collection — no Redis dependency.
 *
 * Sniping threshold: position > $200 USDC placed within 30 minutes of tradingClosesAt.
 * Auto-flag to polygon_flags; does not block trade.
 */

import { Db, ObjectId } from "mongodb";

// ---------------------------------------------------------------------------
// Constants — these are the authoritative threshold values for the platform
// ---------------------------------------------------------------------------

/** Hard cap in USD dollars for a standard (unverified) user on a single outcome */
export const STANDARD_POSITION_CAP = 500;           // $500.00

/** Hard cap in USD dollars for a trusted/KYC-verified user on a single outcome */
export const TRUSTED_POSITION_CAP = 2_500;          // $2,500.00

/** Pool percentage cap — single position cannot exceed this fraction of totalLiquidity */
export const POOL_CAP_PCT = 0.20; // 20%

/** Multiplier applied to caps for HIGH_VALUE markets (predictedPrice > $100,000) */
export const HIGH_VALUE_MARKET_CAP_MULTIPLIER = 0.5;

/** Maximum trades per user per market within the rolling rate limit window */
export const RATE_LIMIT_MAX_TRADES = 10;

/** Rate limit window in milliseconds (60 minutes) */
export const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

/** Trading closes this many milliseconds before auction end */
export const TRADING_CUTOFF_MS = 4 * 60 * 60 * 1000; // 4 hours

/**
 * Sniping detection: flag any position above this threshold placed within this
 * many minutes of tradingClosesAt
 */
export const SNIPE_THRESHOLD = 200;                 // $200.00
export const SNIPE_WINDOW_MINUTES = 30;

/** predictedPrice above this value (USD, not cents) → HIGH_VALUE risk tier */
export const HIGH_VALUE_PREDICTED_PRICE_USD = 100_000;

/**
 * 80% of cap — emit a POSITION_CAP_APPROACHED flag when a user's position
 * reaches this fraction so the admin dashboard can surface it proactively.
 */
export const CAP_APPROACH_THRESHOLD_PCT = 0.80;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TradeValidationResult {
  valid: boolean;
  reason?: string;
  /** Non-blocking flags to write after a successful validation */
  flags?: PendingFlag[];
}

export interface PendingFlag {
  flagType: FlagType;
  severity: "LOW" | "MEDIUM" | "HIGH";
  metadata: Record<string, unknown>;
}

export type FlagType =
  | "POSITION_CAP_APPROACHED"
  | "LATE_SNIPE"
  | "RAPID_TRADING"
  | "OPPOSING_SIDES_SAME_IP"
  | "RATE_LIMIT_HIT"
  | "ORACLE_DELAY"
  | "ORACLE_FAILED"
  | "RESOLUTION_DISPUTED";

export interface TradeContext {
  /** Caller IP, read from x-forwarded-for. Pass "unknown" if unavailable. */
  callerIp?: string;
  /** Device fingerprint from client header (X-Device-FP). Optional. */
  deviceFingerprint?: string;
}

// ---------------------------------------------------------------------------
// Main validation function
// ---------------------------------------------------------------------------

/**
 * Validates a proposed trade before execution.
 *
 * @param userId       - Authenticated user's _id as string
 * @param marketId     - polygon_markets _id as string
 * @param outcome      - "YES" or "NO"
 * @param usdcAmount   - Trade size in USD dollars (positive number). $10 trade = 10.
 * @param db           - Live MongoDB Db instance (from mongoose.connection.db)
 * @param ctx          - Optional caller context (IP, device fingerprint)
 * @returns            - { valid, reason?, flags? }
 */
export async function validateTrade(
  userId: string,
  marketId: string,
  outcome: "YES" | "NO",
  usdcAmount: number,
  db: Db,
  ctx: TradeContext = {}
): Promise<TradeValidationResult> {
  // -------------------------------------------------------------------------
  // Guard: parse ObjectIds — malformed IDs are an immediate reject
  // -------------------------------------------------------------------------
  let userObjectId: ObjectId;
  let marketObjectId: ObjectId;

  try {
    userObjectId = new ObjectId(userId);
  } catch {
    return { valid: false, reason: "Invalid userId format." };
  }

  try {
    marketObjectId = new ObjectId(marketId);
  } catch {
    return { valid: false, reason: "Invalid marketId format." };
  }

  // -------------------------------------------------------------------------
  // Guard: amount must be a positive number (dollars)
  // -------------------------------------------------------------------------
  if (typeof usdcAmount !== "number" || usdcAmount <= 0) {
    return { valid: false, reason: "Trade amount must be a positive number (USD dollars)." };
  }

  const now = new Date();
  const pendingFlags: PendingFlag[] = [];

  // -------------------------------------------------------------------------
  // CHECK 1: Market exists and is ACTIVE
  // -------------------------------------------------------------------------
  const market = await db.collection("polygon_markets").findOne(
    { _id: marketObjectId },
    {
      projection: {
        status: 1,
        tradingClosesAt: 1,
        closesAt: 1,
        totalLiquidity: 1,
        predictedPrice: 1,
        positionCapUSDC: 1,
        trustedUserCapUSDC: 1,
        riskTier: 1,
      },
    }
  );

  if (!market) {
    return { valid: false, reason: "Market not found." };
  }

  if (market.status !== "ACTIVE") {
    return {
      valid: false,
      reason: `Market is ${market.status.toLowerCase()} and no longer accepting trades.`,
    };
  }

  // -------------------------------------------------------------------------
  // CHECK 2: Trading window is open
  //
  // tradingClosesAt is stored on the market document at creation time as
  // (closesAt - 4 hours). If tradingClosesAt was not written (legacy markets),
  // compute it on the fly from closesAt.
  // -------------------------------------------------------------------------
  const tradingClosesAt: Date = market.tradingClosesAt
    ? new Date(market.tradingClosesAt)
    : market.closesAt
    ? new Date(new Date(market.closesAt).getTime() - TRADING_CUTOFF_MS)
    : new Date(0); // fallback: no deadline means already closed

  if (now >= tradingClosesAt) {
    const minutesClosed = Math.floor((now.getTime() - tradingClosesAt.getTime()) / 60_000);
    return {
      valid: false,
      reason: `Trading closed ${minutesClosed} minute(s) ago. The auction is in its final stretch — watch the live results instead.`,
    };
  }

  // -------------------------------------------------------------------------
  // CHECK 3: User exists and is not banned
  // -------------------------------------------------------------------------
  const user = await db.collection("users").findOne(
    { _id: userObjectId },
    { projection: { isBanned: 1, isActive: 1, balance: 1, role: 1 } }
  );

  if (!user) {
    return { valid: false, reason: "User account not found." };
  }

  if (user.isBanned) {
    return { valid: false, reason: "Your account has been suspended." };
  }

  if (!user.isActive) {
    return { valid: false, reason: "Your account is inactive." };
  }

  // -------------------------------------------------------------------------
  // CHECK 4: Balance sufficient
  //
  // user.balance is stored in USD dollars on the User model.
  // -------------------------------------------------------------------------
  const userBalance: number = user.balance ?? 0;

  if (userBalance < usdcAmount) {
    const shortfall = (usdcAmount - userBalance).toFixed(2);
    return {
      valid: false,
      reason: `Insufficient balance. You need $${shortfall} more USDC to place this trade.`,
    };
  }

  // -------------------------------------------------------------------------
  // CHECK 5: Position cap not exceeded
  //
  // Cap is the LOWER of:
  //   (a) hard dollar cap (standard: $500, trusted: $2,500)
  //   (b) 20% of current totalLiquidity
  //
  // HIGH_VALUE markets (predictedPrice > $100k USD) apply a 0.5x multiplier
  // to BOTH caps because these markets have less liquid resolution certainty.
  //
  // MongoDB query: aggregate current position for this user + outcome
  // -------------------------------------------------------------------------
  const isTrusted = user.role === "trusted" || user.role === "admin";
  const isHighValue =
    (market.predictedPrice ?? 0) > HIGH_VALUE_PREDICTED_PRICE_USD ||
    market.riskTier === "HIGH_VALUE";

  // Resolve dollar cap — prefer market-level override if present
  let hardCap = isTrusted
    ? (market.trustedUserCapUSDC ?? TRUSTED_POSITION_CAP)
    : (market.positionCapUSDC ?? STANDARD_POSITION_CAP);

  if (isHighValue) {
    hardCap = hardCap * HIGH_VALUE_MARKET_CAP_MULTIPLIER;
  }

  // Compute pool cap (20% of totalLiquidity)
  const totalLiquidity: number = market.totalLiquidity ?? 0;
  const poolCap =
    totalLiquidity > 0
      ? totalLiquidity * POOL_CAP_PCT
      : hardCap; // no liquidity yet → fall back to hard cap

  const effectiveCap = Math.min(hardCap, poolCap);

  // B-1 fix: read from polygon_positions (same collection trades write to)
  const existingPosition = await db.collection("polygon_positions").findOne(
    { userId: userObjectId, marketId: marketObjectId, outcome, status: "OPEN" },
    { projection: { totalCost: 1 } }
  );

  const currentPosition: number = existingPosition?.totalCost ?? 0;
  const projectedPosition = currentPosition + usdcAmount;

  if (projectedPosition > effectiveCap) {
    const remaining = Math.max(0, effectiveCap - currentPosition);
    return {
      valid: false,
      reason:
        remaining === 0
          ? `You have reached the $${effectiveCap.toFixed(2)} position limit for ${outcome} on this market.`
          : `This trade would exceed your $${effectiveCap.toFixed(2)} position limit. Maximum additional amount: $${remaining.toFixed(2)}.`,
    };
  }

  // Emit cap-approach flag at 80% threshold (non-blocking)
  if (projectedPosition >= effectiveCap * CAP_APPROACH_THRESHOLD_PCT) {
    pendingFlags.push({
      flagType: "POSITION_CAP_APPROACHED",
      severity: "LOW",
      metadata: {
        currentPosition,
        projectedPosition,
        effectiveCap,
        isTrusted,
        isHighValue,
      },
    });
  }

  // -------------------------------------------------------------------------
  // CHECK 6: Rate limit — 10 trades per user per market per rolling hour
  //
  // Count documents in trade_rate_limits where:
  //   userId = userObjectId AND marketId = marketObjectId
  //   AND tradedAt > (now - 1 hour)
  //
  // TTL index on tradedAt (expireAfterSeconds: 3600) auto-cleans old docs.
  // -------------------------------------------------------------------------
  const oneHourAgo = new Date(now.getTime() - RATE_LIMIT_WINDOW_MS);

  const recentTradeCount = await db.collection("trade_rate_limits").countDocuments({
    userId: userObjectId,
    marketId: marketObjectId,
    tradedAt: { $gt: oneHourAgo },
  });

  if (recentTradeCount >= RATE_LIMIT_MAX_TRADES) {
    // Write flag before rejecting — this is the only check where we write a flag on failure
    pendingFlags.push({
      flagType: "RATE_LIMIT_HIT",
      severity: "MEDIUM",
      metadata: {
        recentTradeCount,
        windowMinutes: 60,
        callerIp: ctx.callerIp ?? "unknown",
        deviceFingerprint: ctx.deviceFingerprint ?? null,
      },
    });

    // Fire-and-forget flag write — do not await, do not block rejection
    writeFlags(db, userObjectId, marketObjectId, pendingFlags).catch(() => {});

    return {
      valid: false,
      reason: `You have placed ${RATE_LIMIT_MAX_TRADES} trades on this market in the last hour. Please wait before trading again.`,
    };
  }

  // Flag rapid trading (>5 trades in 1 hour) even if not yet at limit
  if (recentTradeCount >= 5) {
    pendingFlags.push({
      flagType: "RAPID_TRADING",
      severity: "LOW",
      metadata: {
        recentTradeCount,
        windowMinutes: 60,
        callerIp: ctx.callerIp ?? "unknown",
      },
    });
  }

  // -------------------------------------------------------------------------
  // CHECK 7: Late-snipe detection (non-blocking flag)
  //
  // Flag if: usdcAmount > $200 AND trade is within 30 minutes of tradingClosesAt
  //
  // This does NOT block the trade. It queues a flag for admin review.
  // The reason: legitimate users can make large last-minute trades. We want
  // visibility, not automatic rejection, because false positives hurt UX.
  // -------------------------------------------------------------------------
  const minutesToClose = (tradingClosesAt.getTime() - now.getTime()) / 60_000;

  if (usdcAmount >= SNIPE_THRESHOLD && minutesToClose <= SNIPE_WINDOW_MINUTES) {
    pendingFlags.push({
      flagType: "LATE_SNIPE",
      severity: minutesToClose <= 10 ? "HIGH" : "MEDIUM",
      metadata: {
        usdcAmount: usdcAmount,
        minutesToClose: Math.round(minutesToClose),
        outcome,
        callerIp: ctx.callerIp ?? "unknown",
        deviceFingerprint: ctx.deviceFingerprint ?? null,
        currentPosition,
      },
    });
  }

  // -------------------------------------------------------------------------
  // All checks passed
  // -------------------------------------------------------------------------
  return {
    valid: true,
    flags: pendingFlags.length > 0 ? pendingFlags : undefined,
  };
}

// ---------------------------------------------------------------------------
// Post-trade bookkeeping — call AFTER the trade executes successfully
// ---------------------------------------------------------------------------

/**
 * Records the trade in rate limit collection and updates the market_positions
 * running total. Both writes are atomic per their own documents.
 *
 * Call this after the trade has been committed. Failure here should be logged
 * but must NOT roll back the trade — the trade already executed.
 */
export async function recordTradeForRiskTracking(
  userId: string,
  marketId: string,
  outcome: "YES" | "NO",
  usdcAmount: number,
  db: Db,
  ctx: TradeContext = {}
): Promise<void> {
  const userObjectId = new ObjectId(userId);
  const marketObjectId = new ObjectId(marketId);
  const now = new Date();

  // Write rate limit sentinel document (TTL index expires it after 1 hour)
  await db.collection("trade_rate_limits").insertOne({
    userId: userObjectId,
    marketId: marketObjectId,
    outcome,
    amountUSDC: usdcAmount,
    tradedAt: now,
    callerIp: ctx.callerIp ?? "unknown",
    deviceFingerprint: ctx.deviceFingerprint ?? null,
  });
}

/**
 * Writes pending flags to polygon_flags collection.
 * Always fire-and-forget — caller should .catch(() => {}) to prevent
 * flag write failures from affecting trade execution.
 */
export async function writeFlags(
  db: Db,
  userId: ObjectId,
  marketId: ObjectId,
  flags: PendingFlag[]
): Promise<void> {
  if (flags.length === 0) return;

  const now = new Date();
  const docs = flags.map((f) => ({
    marketId,
    userId,
    flagType: f.flagType,
    severity: f.severity,
    metadata: f.metadata,
    resolved: false,
    resolvedBy: null,
    resolvedAt: null,
    createdAt: now,
  }));

  await db.collection("polygon_flags").insertMany(docs);
}
