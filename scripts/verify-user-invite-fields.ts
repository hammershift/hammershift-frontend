import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import connectToDB from "../src/lib/mongoose";
import Users from "../src/models/user.model";

async function main() {
  await connectToDB();
  const schemaPaths = (Users.schema as any).paths;
  for (const field of ["isInvited", "invitedVia", "badges", "referralCode", "referredByCode"]) {
    if (!schemaPaths[field]) throw new Error(`missing schema path: ${field}`);
  }
  console.log("OK");
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
