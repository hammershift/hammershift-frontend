/**
 * amm.ts — Constant-Product Market Maker (CPMM) for binary prediction markets.
 *
 * Model: two reserves, yesPool and noPool, maintain the invariant k = yesPool × noPool.
 * Prices are derived from pool sizes: yesPrice = noPool / (yesPool + noPool).
 *
 * All monetary values are in USD cents internally to avoid floating-point drift.
 * Callers pass and receive regular decimal USD numbers; this module converts.
 *
 * Assumptions:
 *  - Each share resolves to exactly $1.00 if the holder wins.
 *  - A 2% platform fee is taken from the USDC input BEFORE AMM calculation.
 *  - Pool state is stored on the polygon_markets document (yesPool, noPool fields).
 *  - Minimum pool size at market creation: $50 each side ($100 total liquidity seed).
 */

export const PLATFORM_FEE_BPS = 200; // 2.00% in basis points
export const SETTLEMENT_FEE_BPS = 200; // 2.00% on winnings at settlement
export const MIN_POOL_SIZE_USD = 50; // each side
export const SHARE_RESOLUTION_VALUE = 1.0; // $1.00 per winning share

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PoolState {
  yesPool: number; // USD, total USDC in YES reserve
  noPool: number; // USD, total USDC in NO reserve
}

export interface TradeQuote {
  /** Shares the user receives (e.g. 12.45 YES shares). */
  sharesReceived: number;
  /** Effective price per share paid (usdcAfterFee / sharesReceived). */
  pricePerShare: number;
  /** Platform fee deducted before AMM calculation (USD). */
  fee: number;
  /** USDC amount entering the AMM after fee deduction. */
  usdcAfterFee: number;
  /** New pool state after this trade is applied. */
  newPool: PoolState;
  /** New YES price (0–1) after the trade. */
  newYesPrice: number;
  /** New NO price (0–1) after the trade. */
  newNoPrice: number;
  /** Slippage experienced: (effectivePrice - preTradePrice) / preTradePrice. */
  slippagePct: number;
}

// ---------------------------------------------------------------------------
// Core helpers
// ---------------------------------------------------------------------------

/**
 * Derive the YES price from current pool state.
 * yesPrice = noPool / (yesPool + noPool)
 * Intuition: if noPool is large, there's more capital betting NO,
 * which means YES is cheap (low probability).
 */
export function yesPrice(pool: PoolState): number {
  const total = pool.yesPool + pool.noPool;
  if (total === 0) return 0.5;
  return pool.noPool / total;
}

export function noPrice(pool: PoolState): number {
  return 1 - yesPrice(pool);
}

/**
 * CPMM buy calculation.
 *
 * When a user buys YES shares with `usdcIn` dollars:
 *  1. The USDC flows into the YES reserve: yesPool += usdcIn
 *  2. The invariant k = yesPool × noPool must be maintained.
 *  3. New noPool = k / newYesPool
 *  4. Shares received = old noPool - new noPool
 *     (user "extracts" NO-side liquidity as YES shares).
 *
 * This is equivalent to: sharesOut = noPool - k / (yesPool + usdcIn)
 *
 * @param pool      Current pool reserves
 * @param outcome   'YES' | 'NO'
 * @param usdcIn    USDC going into the pool (AFTER fee deduction)
 */
export function calcSharesOut(
  pool: PoolState,
  outcome: "YES" | "NO",
  usdcIn: number
): { sharesOut: number; newPool: PoolState } {
  const k = pool.yesPool * pool.noPool;

  if (outcome === "YES") {
    const newYesPool = pool.yesPool + usdcIn;
    const newNoPool = k / newYesPool;
    const sharesOut = pool.noPool - newNoPool;
    return {
      sharesOut,
      newPool: { yesPool: newYesPool, noPool: newNoPool },
    };
  } else {
    const newNoPool = pool.noPool + usdcIn;
    const newYesPool = k / newNoPool;
    const sharesOut = pool.yesPool - newYesPool;
    return {
      sharesOut,
      newPool: { yesPool: newYesPool, noPool: newNoPool },
    };
  }
}

/**
 * Full trade quote including fee, slippage, and projected new prices.
 *
 * @param pool          Current pool state
 * @param outcome       'YES' | 'NO'
 * @param usdcAmount    Total USDC the user wants to spend (including fee)
 * @param maxSlippage   Maximum acceptable slippage as a decimal (e.g. 0.05 = 5%)
 * @throws              Error if slippage exceeds maxSlippage
 */
export function quoteTradeExact(
  pool: PoolState,
  outcome: "YES" | "NO",
  usdcAmount: number,
  maxSlippage: number
): TradeQuote {
  if (usdcAmount <= 0) throw new Error("usdcAmount must be positive");
  if (pool.yesPool <= 0 || pool.noPool <= 0) {
    throw new Error("Pool must be initialized with positive reserves");
  }

  const preTradePriceYes = yesPrice(pool);
  const preTradePriceNo = noPrice(pool);
  const preTradePrice = outcome === "YES" ? preTradePriceYes : preTradePriceNo;

  // Deduct platform fee
  const fee = (usdcAmount * PLATFORM_FEE_BPS) / 10000;
  const usdcAfterFee = usdcAmount - fee;

  // Calculate shares received
  const { sharesOut, newPool } = calcSharesOut(pool, outcome, usdcAfterFee);

  if (sharesOut <= 0) {
    throw new Error("Trade would produce zero or negative shares — pool too small");
  }

  const pricePerShare = usdcAfterFee / sharesOut;

  // Slippage: how much worse than the pre-trade price did we pay?
  // A user paying more per share than the current price = positive slippage
  const slippagePct =
    preTradePrice > 0 ? (pricePerShare - preTradePrice) / preTradePrice : 0;

  if (slippagePct > maxSlippage) {
    throw new Error(
      `Slippage ${(slippagePct * 100).toFixed(2)}% exceeds max ${(maxSlippage * 100).toFixed(2)}%`
    );
  }

  const newYesPrice = yesPrice(newPool);
  const newNoPrice = noPrice(newPool);

  return {
    sharesReceived: sharesOut,
    pricePerShare,
    fee,
    usdcAfterFee,
    newPool,
    newYesPrice,
    newNoPrice,
    slippagePct,
  };
}

/**
 * Calculate settlement payout for a winning position.
 * Payout = shares × $1.00 × (1 - SETTLEMENT_FEE_BPS/10000)
 */
export function calcSettlementPayout(shares: number): {
  grossPayout: number;
  fee: number;
  netPayout: number;
} {
  const grossPayout = shares * SHARE_RESOLUTION_VALUE;
  const fee = (grossPayout * SETTLEMENT_FEE_BPS) / 10000;
  const netPayout = grossPayout - fee;
  return { grossPayout, fee, netPayout };
}
