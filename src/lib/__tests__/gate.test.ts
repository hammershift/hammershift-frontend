import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { isEmailBypass, isRoleBypass, bypassesGate } from "../gate";

// Seeded partner/VIP account — must bypass the launch gate with zero env
// configuration so it works the moment the code deploys.
const ADAM = "adam.rodnitzky@velocityinvitational.com";

describe("isEmailBypass", () => {
  const saved = process.env.GATE_BYPASS_EMAILS;

  beforeEach(() => {
    delete process.env.GATE_BYPASS_EMAILS;
  });

  afterEach(() => {
    if (saved === undefined) delete process.env.GATE_BYPASS_EMAILS;
    else process.env.GATE_BYPASS_EMAILS = saved;
  });

  it("returns true for the seeded address without any env var", () => {
    expect(isEmailBypass(ADAM)).toBe(true);
  });

  it("is case-insensitive and trims surrounding whitespace", () => {
    expect(isEmailBypass("  ADAM.Rodnitzky@VelocityInvitational.com  ")).toBe(true);
  });

  it("returns false for a non-listed email", () => {
    expect(isEmailBypass("stranger@example.com")).toBe(false);
  });

  it("returns false for empty / non-string input", () => {
    expect(isEmailBypass("")).toBe(false);
    expect(isEmailBypass("   ")).toBe(false);
    expect(isEmailBypass(null)).toBe(false);
    expect(isEmailBypass(undefined)).toBe(false);
    expect(isEmailBypass(123)).toBe(false);
  });

  it("honors GATE_BYPASS_EMAILS (comma / space / semicolon separated)", () => {
    process.env.GATE_BYPASS_EMAILS = "vip1@example.com, vip2@example.com; vip3@example.com";
    expect(isEmailBypass("vip1@example.com")).toBe(true);
    expect(isEmailBypass("VIP2@example.com")).toBe(true);
    expect(isEmailBypass("vip3@example.com")).toBe(true);
    expect(isEmailBypass("nope@example.com")).toBe(false);
  });

  it("keeps the seeded address even when the env var is set to others", () => {
    process.env.GATE_BYPASS_EMAILS = "vip1@example.com";
    expect(isEmailBypass(ADAM)).toBe(true);
  });
});

describe("bypassesGate — email allowlist path", () => {
  const saved = process.env.GATE_BYPASS_EMAILS;

  beforeEach(() => {
    delete process.env.GATE_BYPASS_EMAILS;
  });

  afterEach(() => {
    if (saved === undefined) delete process.env.GATE_BYPASS_EMAILS;
    else process.env.GATE_BYPASS_EMAILS = saved;
  });

  it("passes an allowlisted email even when not invited and roleless", () => {
    expect(bypassesGate({ email: ADAM })).toBe(true);
    expect(bypassesGate({ email: ADAM, isInvited: false, role: "user" })).toBe(true);
  });

  it("still gates a random authenticated email", () => {
    expect(bypassesGate({ email: "stranger@example.com" })).toBe(false);
  });

  it("still passes invited users and privileged roles (unchanged behavior)", () => {
    expect(bypassesGate({ isInvited: true })).toBe(true);
    expect(bypassesGate({ role: "admin" })).toBe(true);
    expect(bypassesGate({ role: "OWNER" })).toBe(true);
  });

  it("returns false for an empty / missing token", () => {
    expect(bypassesGate(null)).toBe(false);
    expect(bypassesGate(undefined)).toBe(false);
    expect(bypassesGate({})).toBe(false);
  });
});

describe("isRoleBypass is NOT widened by the email allowlist", () => {
  it("does not grant admin authorization to an allowlisted email", () => {
    // The gate bypass must never leak into admin authz: Adam sees the app,
    // but is not an admin/owner.
    expect(isRoleBypass(ADAM)).toBe(false);
    expect(isRoleBypass("user")).toBe(false);
    expect(isRoleBypass("admin")).toBe(true);
    expect(isRoleBypass("owner")).toBe(true);
  });
});
