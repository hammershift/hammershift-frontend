import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import connectToDB from "../src/lib/mongoose";
import { WaitlistEntry } from "../src/models/waitlistEntry.model";

async function main() {
  await connectToDB();
  const email = `verify-${Date.now()}@example.com`;
  const entry = await WaitlistEntry.create({
    email,
    referralCode: `code${Date.now().toString(36)}`.slice(0, 8),
    ipHash: "deadbeef",
  });
  if (!entry._id) throw new Error("no _id");
  if (entry.verifiedAt !== null) throw new Error("verifiedAt should default null");
  if (entry.invitedAt !== null) throw new Error("invitedAt should default null");
  const dup = await WaitlistEntry.findOne({ email });
  if (!dup) throw new Error("lookup failed");
  await WaitlistEntry.deleteOne({ _id: entry._id });
  console.log("OK");
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
