/**
 * marketRiskSetup.ts
 *
 * Utilities called at market creation time to compute and persist risk fields.
 *
 * Called by:
 *   - /api/cron/create-markets
 *   - /api/polygon-markets (auto-create path)
 *
 * Fields written to polygon_markets at creation:
 *   - tradingClosesAt    (closesAt minus 4 hours)
 *   - riskTier           ("HIGH_VALUE" if predictedPrice > $100k, else "STANDARD")
 *   - positionCapUSDC    (500_00 cents for STANDARD, 250_00 for HIGH_VALUE)
 *   - trustedUserCapUSDC (250_000 cents for STANDARD, 125_000 for HIGH_VALUE)
 *   - oracleStatus       ("PENDING")
 */

import {
  TRADING_CUTOFF_MS,
  HIGH_VALUE_PREDICTED_PRICE_USD,
  STANDARD_POSITION_CAP,
  TRUSTED_POSITION_CAP,
  HIGH_VALUE_MARKET_CAP_MULTIPLIER,
} from "./tradeValidator";

export interface MarketRiskFields {
  tradingClosesAt: Date | null;
  riskTier: "STANDARD" | "HIGH_VALUE";
  positionCapUSDC: number;
  trustedUserCapUSDC: number;
  oracleStatus: "PENDING";
  finalPrice: null;
  finalPriceSource: null;
  finalPriceCapturedAt: null;
}

/**
 * Computes risk fields for a new market.
 *
 * @param closesAt       - The auction's deadline (Date) as stored in sort.deadline
 * @param predictedPrice - The threshold price in USD (not cents)
 */
export function computeMarketRiskFields(
  closesAt: Date | null,
  predictedPrice: number
): MarketRiskFields {
  const tradingClosesAt = closesAt
    ? new Date(closesAt.getTime() - TRADING_CUTOFF_MS)
    : null;

  const isHighValue = predictedPrice > HIGH_VALUE_PREDICTED_PRICE_USD;
  const riskTier: "STANDARD" | "HIGH_VALUE" = isHighValue ? "HIGH_VALUE" : "STANDARD";

  const positionCapUSDC = isHighValue
    ? STANDARD_POSITION_CAP * HIGH_VALUE_MARKET_CAP_MULTIPLIER
    : STANDARD_POSITION_CAP;

  const trustedUserCapUSDC = isHighValue
    ? TRUSTED_POSITION_CAP * HIGH_VALUE_MARKET_CAP_MULTIPLIER
    : TRUSTED_POSITION_CAP;

  return {
    tradingClosesAt,
    riskTier,
    positionCapUSDC,
    trustedUserCapUSDC,
    oracleStatus: "PENDING",
    finalPrice: null,
    finalPriceSource: null,
    finalPriceCapturedAt: null,
  };
}
