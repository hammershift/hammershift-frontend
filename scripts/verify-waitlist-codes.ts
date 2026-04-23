import { generateReferralCode, hashIp, generateShortCode } from "../src/lib/waitlist/codes";

function main() {
  const a = generateReferralCode();
  const b = generateReferralCode();
  if (a.length !== 8) throw new Error("referral code not 8 chars");
  if (a === b) throw new Error("codes should differ");
  const h1 = hashIp("1.2.3.4", "salt");
  const h2 = hashIp("1.2.3.4", "salt");
  const h3 = hashIp("1.2.3.5", "salt");
  if (h1 !== h2) throw new Error("same ip+salt should hash same");
  if (h1 === h3) throw new Error("different ip should hash different");
  if (h1.length !== 64) throw new Error("sha256 hex = 64");
  const s = generateShortCode();
  if (s.length !== 6) throw new Error("short code not 6 chars");
  console.log("OK");
}
main();
