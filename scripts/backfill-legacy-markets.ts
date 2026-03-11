/**
 * scripts/backfill-legacy-markets.ts
 *
 * One-time backfill for markets created before the pool/risk field fixes.
 *
 * Pass 1 — Pool fields (yesPool / noPool):
 *   Finds markets where yesPool or noPool is missing, null, or zero and sets
 *   them to the seeded default (50 / 50) so the trade route can bootstrap the
 *   AMM.  Fields are only written when they are absent or zero — existing,
 *   non-zero pool state is never overwritten.
 *
 * Pass 2 — Risk fields (tradingClosesAt / riskTier / positionCapUSDC / trustedUserCapUSDC):
 *   Finds ACTIVE markets where tradingClosesAt or positionCapUSDC is missing
 *   (these were created by autoCreateMissingMarkets before today's fix) and
 *   computes + applies the correct risk fields using the same logic as
 *   computeMarketRiskFields in src/lib/marketRiskSetup.ts.
 *
 * Run with:
 *   npm run db:backfill-markets
 *
 * Safe to run multiple times — each pass uses a targeted query so already-
 * patched documents are never touched again.
 */

import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// ---------------------------------------------------------------------------
// Inline risk computation — mirrors src/lib/marketRiskSetup.ts exactly.
// Inlined here to avoid ts-node module resolution issues with
// moduleResolution: "bundler" when importing from src/.
// ---------------------------------------------------------------------------

const TRADING_CUTOFF_MS = 4 * 60 * 60 * 1000; // 4 hours in ms
const HIGH_VALUE_PREDICTED_PRICE_USD = 100_000;
const STANDARD_POSITION_CAP = 500;             // $500 USD
const TRUSTED_POSITION_CAP = 2_500;            // $2,500 USD
const HIGH_VALUE_MARKET_CAP_MULTIPLIER = 0.5;

interface RiskFields {
  tradingClosesAt: Date | null;
  riskTier: "STANDARD" | "HIGH_VALUE";
  positionCapUSDC: number;
  trustedUserCapUSDC: number;
  oracleStatus: "PENDING";
  finalPrice: null;
  finalPriceSource: null;
  finalPriceCapturedAt: null;
}

function computeRiskFields(closesAt: Date | null, predictedPrice: number): RiskFields {
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

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI not set in .env.local");
  process.exit(1);
}

async function backfill(): Promise<void> {
  const client = new MongoClient(uri!);
  await client.connect();
  const db = client.db(process.env.DB_NAME);
  const col = db.collection("polygon_markets");

  console.log("Starting backfill for legacy polygon_markets documents...\n");

  // ── Pass 1: Pool fields ─────────────────────────────────────────────────
  //
  // Target markets where yesPool or noPool is absent, null, or 0.
  // We set yesPool, noPool, yesPrice, noPrice only when the value is falsy
  // (missing / null / 0).  The $or covers all three conditions for each field.
  //
  // Using updateMany is safe here because every matching document by
  // definition has no real pool state — they were never traded on.
  // ---------------------------------------------------------------------------

  const poolQuery = {
    $or: [
      { yesPool: { $exists: false } },
      { noPool:  { $exists: false } },
      { yesPool: null },
      { noPool:  null },
      { yesPool: 0 },
      { noPool:  0 },
    ],
  };

  // Count first so we can report accurately even if zero docs match
  const poolCount = await col.countDocuments(poolQuery);
  console.log(`Pass 1 — Pool fields: found ${poolCount} market(s) to patch.`);

  if (poolCount > 0) {
    const poolResult = await col.updateMany(poolQuery, {
      $set: {
        yesPool:  50,
        noPool:   50,
        yesPrice: 0.5,
        noPrice:  0.5,
      },
    });
    console.log(
      `Pass 1 — Pool fields: patched ${poolResult.modifiedCount} market(s) ` +
      `(yesPool=50, noPool=50, yesPrice=0.5, noPrice=0.5).`
    );
  } else {
    console.log("Pass 1 — Pool fields: nothing to patch.");
  }

  // ── Pass 2: Risk fields ─────────────────────────────────────────────────
  //
  // Target ACTIVE markets where tradingClosesAt or positionCapUSDC is absent.
  // These were created by autoCreateMissingMarkets before the risk-fields fix.
  //
  // We iterate document-by-document so computeRiskFields can use each
  // market's own closesAt and predictedPrice values.
  // ---------------------------------------------------------------------------

  const riskQuery = {
    status: "ACTIVE",
    $or: [
      { tradingClosesAt: { $exists: false } },
      { positionCapUSDC: { $exists: false } },
    ],
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const riskCursor = col.find<any>(riskQuery, {
    projection: { _id: 1, closesAt: 1, predictedPrice: 1 },
  });

  let riskTotal = 0;
  let riskPatched = 0;
  let riskSkipped = 0;

  for await (const doc of riskCursor) {
    riskTotal++;

    const closesAt: Date | null = doc.closesAt ? new Date(doc.closesAt) : null;
    const predictedPrice: number =
      typeof doc.predictedPrice === "number" ? doc.predictedPrice : 0;

    if (predictedPrice === 0) {
      // Cannot compute meaningful risk tier without a predicted price.
      // Log and skip; operator should inspect these manually.
      console.warn(
        `  [SKIP] Market ${String(doc._id)} has no predictedPrice — ` +
        `set it manually and re-run.`
      );
      riskSkipped++;
      continue;
    }

    const riskFields = computeRiskFields(closesAt, predictedPrice);

    await col.updateOne(
      { _id: doc._id },
      { $set: riskFields }
    );

    console.log(
      `  [PATCHED] Market ${String(doc._id)} — ` +
      `tier=${riskFields.riskTier}, ` +
      `tradingClosesAt=${riskFields.tradingClosesAt?.toISOString() ?? "null"}, ` +
      `positionCap=${riskFields.positionCapUSDC}`
    );
    riskPatched++;
  }

  console.log(
    `\nPass 2 — Risk fields: found ${riskTotal}, ` +
    `patched ${riskPatched}, skipped ${riskSkipped} (no predictedPrice).`
  );

  // ── Summary ─────────────────────────────────────────────────────────────
  console.log("\nBackfill complete.");
  console.log(`  Pool patches:   ${poolCount > 0 ? poolCount : 0}`);
  console.log(`  Risk patches:   ${riskPatched}`);
  if (riskSkipped > 0) {
    console.log(
      `  Skipped (no predictedPrice): ${riskSkipped} — inspect these manually.`
    );
  }

  await client.close();
}

backfill().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
