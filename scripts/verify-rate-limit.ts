// scripts/verify-rate-limit.ts
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { checkRateLimit } from "../src/lib/waitlist/rateLimit";

async function main() {
  const ipHash = `verify-${Date.now()}`;
  for (let i = 1; i <= 3; i++) {
    const r = await checkRateLimit(ipHash, "signup", { perHour: 3, perDay: 10 });
    if (!r.ok) throw new Error(`attempt ${i} should be allowed`);
  }
  const fourth = await checkRateLimit(ipHash, "signup", { perHour: 3, perDay: 10 });
  if (fourth.ok) throw new Error("4th attempt should be blocked");
  console.log("OK");
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
