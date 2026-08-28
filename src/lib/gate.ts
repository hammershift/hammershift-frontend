// Shared gate-bypass predicate. Used by both middleware.ts and the
// gate page so the rules stay in lockstep.
//
// Bypass when ANY of:
//   - the user is invited (waitlist flow), OR
//   - the user has an admin/owner role (set by the admin app), OR
//   - the user's email is on the always-allow list (partners/VIPs).
//
// Role check is case-insensitive because the codebase mixes lowercase
// ("admin", "trusted") and uppercase ("USER", "AGENT") values.

const PRIVILEGED_ROLES = new Set(["admin", "owner"]);

// Emails that always pass the launch gate regardless of waitlist/invite
// state. Seeded so it works the instant this deploys — no env required.
// Extend without a code change via GATE_BYPASS_EMAILS (see below).
//
// NOTE: this is a GATE bypass only. It intentionally does NOT grant admin
// authorization — isRoleBypass (used by /admin routes) is left untouched.
const SEED_BYPASS_EMAILS = [
  "adam.rodnitzky@velocityinvitational.com",
];

function normalizeEmail(email: unknown): string | null {
  if (typeof email !== "string") return null;
  const trimmed = email.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : null;
}

// Built per-call (the set is tiny and this runs at most once per gated
// request) so a change to GATE_BYPASS_EMAILS takes effect without a
// process restart and tests can toggle the env var freely.
function bypassEmailSet(): Set<string> {
  const set = new Set<string>();
  for (const seed of SEED_BYPASS_EMAILS) {
    const n = normalizeEmail(seed);
    if (n) set.add(n);
  }
  // Comma / semicolon / whitespace separated — Amplify-friendly, mirrors
  // the delimited EVENT_CODES convention used elsewhere.
  for (const part of (process.env.GATE_BYPASS_EMAILS ?? "").split(/[\s,;]+/)) {
    const n = normalizeEmail(part);
    if (n) set.add(n);
  }
  return set;
}

export function isEmailBypass(email: unknown): boolean {
  const n = normalizeEmail(email);
  if (!n) return false;
  return bypassEmailSet().has(n);
}

export function isRoleBypass(role: unknown): boolean {
  return typeof role === "string" && PRIVILEGED_ROLES.has(role.toLowerCase());
}

export function bypassesGate(
  token: { isInvited?: unknown; role?: unknown; email?: unknown } | null | undefined
): boolean {
  if (!token) return false;
  if (token.isInvited === true) return true;
  if (isRoleBypass(token.role)) return true;
  return isEmailBypass(token.email);
}
