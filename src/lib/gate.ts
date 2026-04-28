// Shared gate-bypass predicate. Used by both middleware.ts and the
// gate page so the rules stay in lockstep.
//
// Bypass when EITHER:
//   - the user is invited (waitlist flow), OR
//   - the user has an admin/owner role (set by the admin app)
//
// Role check is case-insensitive because the codebase mixes lowercase
// ("admin", "trusted") and uppercase ("USER", "AGENT") values.

const PRIVILEGED_ROLES = new Set(["admin", "owner"]);

export function isRoleBypass(role: unknown): boolean {
  return typeof role === "string" && PRIVILEGED_ROLES.has(role.toLowerCase());
}

export function bypassesGate(token: { isInvited?: unknown; role?: unknown } | null | undefined): boolean {
  if (!token) return false;
  if (token.isInvited === true) return true;
  return isRoleBypass(token.role);
}
