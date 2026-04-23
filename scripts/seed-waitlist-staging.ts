/**
 * scripts/seed-waitlist-staging.ts
 *
 * One-shot staging/pre-launch seeder for the waitlist_entries collection.
 *
 * Creates 50 fake WaitlistEntry documents so cohort UI work (counter,
 * dashboard, tickers) has realistic data to render against.
 *
 * Safety:
 *   - Refuses to run when NODE_ENV === "production".
 *   - No-ops if waitlist_entries already has any documents.
 *   - Retries per-entry on E11000 referralCode collisions (up to 5 attempts).
 *
 * Run with:
 *   npm run db:seed-waitlist
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import connectToDB from "../src/lib/mongoose";
import { WaitlistEntry } from "../src/models/waitlistEntry.model";
import { generateReferralCode, hashIp } from "../src/lib/waitlist/codes";

async function main(): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Do not run against production");
  }

  await connectToDB();

  const existing = await WaitlistEntry.countDocuments();
  if (existing > 0) {
    console.log(`Already has ${existing} entries. Skipping.`);
    return process.exit(0);
  }

  const salt = process.env.WAITLIST_IP_SALT || "salt";
  const sources = ["twitter", "reddit", "email", "direct"];

  for (let i = 0; i < 50; i++) {
    // Retry only on E11000 for the referralCode unique index. Any other
    // error propagates so we don't silently swallow bugs in the write path.
    // Mirrors src/app/api/admin/bootstrap-founders/route.ts:45-79.
    let succeeded = false;
    for (let attempt = 0; attempt < 5 && !succeeded; attempt++) {
      const code = generateReferralCode();
      try {
        await WaitlistEntry.create({
          email: `seed-${i}-${Date.now()}@example.com`,
          referralCode: code,
          ipHash: hashIp(`10.0.0.${i}`, salt),
          verifiedAt: i % 3 === 0 ? new Date() : null,
          utm: { source: sources[i % 4] },
        });
        succeeded = true;
      } catch (writeErr) {
        const errCode = (writeErr as {
          code?: number;
          keyPattern?: Record<string, unknown>;
        }).code;
        const keyPattern = (writeErr as {
          code?: number;
          keyPattern?: Record<string, unknown>;
        }).keyPattern;
        if (
          errCode !== 11000 ||
          !keyPattern ||
          !("referralCode" in keyPattern)
        ) {
          throw writeErr;
        }
        // loop → regenerate referralCode
      }
    }
    if (!succeeded) {
      throw new Error(
        `seed-waitlist-staging: referralCode collision retries exhausted at i=${i}`
      );
    }
  }

  console.log("Seeded 50 entries");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
