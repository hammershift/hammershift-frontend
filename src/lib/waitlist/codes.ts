import { createHash, randomBytes } from "node:crypto";

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // avoid 0/O/I/1/L confusion

export function generateReferralCode(length = 8): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

export function generateShortCode(length = 6): string {
  return generateReferralCode(length).toLowerCase();
}

export function hashIp(ip: string, salt: string): string {
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}
