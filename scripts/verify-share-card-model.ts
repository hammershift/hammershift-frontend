// scripts/verify-share-card-model.ts
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import connectToDB from "../src/lib/mongoose";
import { ShareCard } from "../src/models/shareCard.model";
import { Types } from "mongoose";

async function main() {
  await connectToDB();
  const card = await ShareCard.create({
    userId: new Types.ObjectId(),
    type: "welcome",
    payload: { username: "test" },
    shortCode: `t${Date.now().toString(36)}`.slice(0, 6),
  });
  if (card.views !== 0 || card.signups !== 0) throw new Error("counters should default 0");
  await ShareCard.deleteOne({ _id: card._id });
  console.log("OK");
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
