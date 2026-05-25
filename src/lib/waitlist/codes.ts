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

/**
 * Event-attendee referral code: <PREFIX>-V26 (or whatever suffix the event
 * provides). Used when a signup is gated by an event code so the attendee
 * gets a brandable, shareable code instead of a random 8-char string.
 *
 * `prefix` is derived from email (local-part) at the call site; we
 * sanitize here to uppercase + strip anything outside [A-Z0-9] so the
 * code stays URL-safe and human-readable. Falls back to a random 4-char
 * suffix if the email prefix is empty after cleaning (e.g. "+tag@x.com").
 */
export function generateEventReferralCode(emailLocalPart: string, suffix: string): string {
  const cleaned = emailLocalPart
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 10);
  const cleanedSuffix = suffix
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);
  const safePrefix = cleaned.length > 0 ? cleaned : generateReferralCode(4);
  const safeSuffix = cleanedSuffix.length > 0 ? cleanedSuffix : "VM";
  return `${safePrefix}-${safeSuffix}`;
}

export function hashIp(ip: string, salt: string): string {
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}
