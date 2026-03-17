/**
 * scripts/backfill-contract-address.ts
 *
 * One-time backfill: sets contractAddress and onChainMarketId on every
 * polygon_markets document that is missing either field.
 *
 * - contractAddress  — the deployed VelocityMarkets contract (from env)
 * - onChainMarketId  — keccak256(utf8(auctionId)), the bytes32 key used on-chain
 *
 * Run with:
 *   npm run db:backfill-contract
 *
 * Safe to run multiple times — the query only targets documents where
 * contractAddress is null or absent, so already-patched rows are skipped.
 */

import { MongoClient } from "mongodb";
import { keccak256, stringToBytes } from "viem";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI not set in .env.local");
  process.exit(1);
}

const contractAddress = process.env.VELOCITY_MARKETS_CONTRACT ?? null;
if (!contractAddress) {
  console.warn(
    "WARNING: VELOCITY_MARKETS_CONTRACT is not set — contractAddress will be written as null."
  );
}

async function backfill(): Promise<void> {
  const client = new MongoClient(uri!);
  await client.connect();
  const db = client.db(process.env.DB_NAME);
  const col = db.collection("polygon_markets");

  console.log("Starting contract-address backfill for polygon_markets...\n");
  console.log(`  contractAddress  : ${contractAddress ?? "(null)"}`);
  console.log(`  chain            : Polygon Amoy (80002)\n`);

  // Target documents where contractAddress is null or entirely absent.
  // onChainMarketId is always recomputed per-document from auctionId.
  const query = {
    $or: [
      { contractAddress: { $exists: false } },
      { contractAddress: null },
    ],
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cursor = col.find<any>(query, {
    projection: { _id: 1, auctionId: 1 },
  });

  let total = 0;
  let patched = 0;
  let skipped = 0;

  for await (const doc of cursor) {
    total++;

    const auctionId: string | undefined = doc.auctionId;
    if (!auctionId) {
      console.warn(
        `  [SKIP] Document ${String(doc._id)} has no auctionId — inspect manually.`
      );
      skipped++;
      continue;
    }

    const onChainMarketId = keccak256(stringToBytes(auctionId));

    await col.updateOne(
      { _id: doc._id },
      {
        $set: {
          contractAddress,
          onChainMarketId,
        },
      }
    );

    console.log(
      `  [PATCHED] ${String(doc._id)} — auctionId=${auctionId} → onChainMarketId=${onChainMarketId}`
    );
    patched++;
  }

  console.log(
    `\nBackfill complete: found=${total}, patched=${patched}, skipped=${skipped} (no auctionId).`
  );

  await client.close();
}

backfill().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
