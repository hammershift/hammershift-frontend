/**
 * scripts/create-market-indexes.ts
 *
 * Run once (or on deploy) to create MongoDB indexes for prediction market collections.
 * Safe to run multiple times — MongoDB ignores createIndex calls for existing indexes.
 *
 * Run with:
 *   npx ts-node --project tsconfig.json scripts/create-market-indexes.ts
 */

import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI not set in .env.local");
  process.exit(1);
}

async function createIndexes() {
  const client = new MongoClient(uri!);
  await client.connect();
  const db = client.db(process.env.DB_NAME);

  console.log("Creating indexes...\n");

  // ── polygon_markets ────────────────────────────────────────────────────────
  await db.collection("polygon_markets").createIndexes([
    { key: { status: 1 }, name: "status_1" },
    { key: { auctionId: 1 }, name: "auctionId_1", unique: true },
    { key: { status: 1, closesAt: 1 }, name: "status_closesAt" },
    { key: { closesAt: 1, oracleStatus: 1 }, name: "closesAt_oracleStatus" },
  ]);
  console.log("polygon_markets: OK");

  // ── polygon_positions ──────────────────────────────────────────────────────
  await db.collection("polygon_positions").createIndexes([
    {
      key: { userId: 1, marketId: 1, outcome: 1, status: 1 },
      name: "userId_marketId_outcome_status",
      unique: true,
    },
    { key: { marketId: 1, outcome: 1, status: 1 }, name: "marketId_outcome_status" },
    { key: { userId: 1, status: 1 }, name: "userId_status" },
  ]);
  console.log("polygon_positions: OK");

  // ── polygon_trades ─────────────────────────────────────────────────────────
  await db.collection("polygon_trades").createIndexes([
    { key: { marketId: 1, createdAt: -1 }, name: "marketId_createdAt" },
    { key: { userId: 1, createdAt: -1 }, name: "userId_createdAt" },
  ]);
  console.log("polygon_trades: OK");

  // ── polygon_flags ──────────────────────────────────────────────────────────
  await db.collection("polygon_flags").createIndexes([
    { key: { resolved: 1, severity: 1, createdAt: -1 }, name: "resolved_severity_createdAt" },
    { key: { marketId: 1, resolved: 1 }, name: "marketId_resolved" },
  ]);
  console.log("polygon_flags: OK");

  // ── trade_rate_limits ──────────────────────────────────────────────────────
  // TTL index: auto-deletes documents after 3600 seconds (1 hour)
  await db.collection("trade_rate_limits").createIndexes([
    {
      key: { tradedAt: 1 },
      name: "tradedAt_ttl",
      expireAfterSeconds: 3600,
    },
    {
      key: { userId: 1, marketId: 1, tradedAt: 1 },
      name: "userId_marketId_tradedAt",
    },
  ]);
  console.log("trade_rate_limits (TTL + compound): OK");

  // ── fee_ledger ─────────────────────────────────────────────────────────────
  await db.collection("fee_ledger").createIndexes([
    { key: { marketId: 1, createdAt: -1 }, name: "marketId_createdAt" },
    { key: { createdAt: -1 }, name: "createdAt" },
  ]);
  console.log("fee_ledger: OK");

  await client.close();
  console.log("\nAll indexes created.");
}

createIndexes().catch((err) => {
  console.error("Index creation failed:", err);
  process.exit(1);
});
