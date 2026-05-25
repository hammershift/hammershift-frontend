import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { resolveEventCode, __resetEventCodeCache } from "../eventCodes";
import { generateEventReferralCode } from "../codes";

describe("resolveEventCode", () => {
  const savedJson = process.env.EVENT_CODES_JSON;
  const savedDelim = process.env.EVENT_CODES;

  beforeEach(() => {
    delete process.env.EVENT_CODES_JSON;
    delete process.env.EVENT_CODES;
    __resetEventCodeCache();
  });

  afterEach(() => {
    process.env.EVENT_CODES_JSON = savedJson;
    process.env.EVENT_CODES = savedDelim;
    __resetEventCodeCache();
  });

  it("returns null when both env vars are unset", () => {
    expect(resolveEventCode("velocity26")).toBeNull();
  });

  // ── Delimited format (EVENT_CODES) — production / Amplify-friendly ─────
  it("parses single-code delimited format", () => {
    process.env.EVENT_CODES = "velocity26:sonoma_invitational";
    expect(resolveEventCode("velocity26")).toBe("sonoma_invitational");
  });

  it("parses multi-code delimited format", () => {
    process.env.EVENT_CODES = "velocity26:sonoma,goodwood26:goodwood_revival";
    expect(resolveEventCode("velocity26")).toBe("sonoma");
    expect(resolveEventCode("goodwood26")).toBe("goodwood_revival");
  });

  it("trims whitespace around delimited keys and values", () => {
    process.env.EVENT_CODES = "  velocity26  :  sonoma_invitational  ";
    expect(resolveEventCode("velocity26")).toBe("sonoma_invitational");
  });

  it("matches delimited code case-insensitively", () => {
    process.env.EVENT_CODES = "velocity26:sonoma";
    expect(resolveEventCode("VELOCITY26")).toBe("sonoma");
    expect(resolveEventCode("Velocity26")).toBe("sonoma");
  });

  it("skips malformed delimited pairs without throwing", () => {
    process.env.EVENT_CODES = "broken,velocity26:sonoma,:nope,onlykey:";
    expect(resolveEventCode("velocity26")).toBe("sonoma");
    expect(resolveEventCode("broken")).toBeNull();
    expect(resolveEventCode("onlykey")).toBeNull();
  });

  // ── JSON format (EVENT_CODES_JSON) — dev/local convenience ─────────────
  it("matches the JSON-configured code case-insensitively", () => {
    process.env.EVENT_CODES_JSON = JSON.stringify({
      velocity26: "sonoma_invitational",
    });
    expect(resolveEventCode("velocity26")).toBe("sonoma_invitational");
    expect(resolveEventCode("VELOCITY26")).toBe("sonoma_invitational");
    expect(resolveEventCode("  velocity26  ")).toBe("sonoma_invitational");
  });

  it("returns null for unknown codes", () => {
    process.env.EVENT_CODES_JSON = JSON.stringify({ velocity26: "sonoma" });
    expect(resolveEventCode("nopenope")).toBeNull();
    expect(resolveEventCode("")).toBeNull();
  });

  it("survives malformed JSON env var without throwing", () => {
    process.env.EVENT_CODES_JSON = "{not valid json";
    expect(resolveEventCode("velocity26")).toBeNull();
  });

  it("ignores non-string values in the JSON map", () => {
    process.env.EVENT_CODES_JSON = JSON.stringify({
      velocity26: 42,
      goodone: "ok",
    });
    expect(resolveEventCode("velocity26")).toBeNull();
    expect(resolveEventCode("goodone")).toBe("ok");
  });

  // ── Merge semantics ────────────────────────────────────────────────────
  it("EVENT_CODES overrides EVENT_CODES_JSON for the same key", () => {
    process.env.EVENT_CODES_JSON = JSON.stringify({ velocity26: "jsonsrc" });
    process.env.EVENT_CODES = "velocity26:delimitedsrc";
    expect(resolveEventCode("velocity26")).toBe("delimitedsrc");
  });

  it("merges entries when keys are disjoint", () => {
    process.env.EVENT_CODES_JSON = JSON.stringify({ jsoncode: "jsonsrc" });
    process.env.EVENT_CODES = "delimcode:delimsrc";
    expect(resolveEventCode("jsoncode")).toBe("jsonsrc");
    expect(resolveEventCode("delimcode")).toBe("delimsrc");
  });
});

describe("generateEventReferralCode", () => {
  it("produces UPPERCASE-prefix-SUFFIX", () => {
    expect(generateEventReferralCode("jake", "V26")).toBe("JAKE-V26");
  });

  it("strips non-alphanumeric characters from email local-part", () => {
    // "jake.smith+test" -> "jakesmithtest" (13 chars) -> sliced to 10 -> JAKESMITHT
    expect(generateEventReferralCode("jake.smith+test", "V26")).toBe(
      "JAKESMITHT-V26"
    );
  });

  it("caps prefix at 10 chars", () => {
    expect(generateEventReferralCode("aReallyLongNameHere", "V26")).toBe(
      "AREALLYLON-V26"
    );
  });

  it("falls back to random prefix when email local-part is empty after cleaning", () => {
    const code = generateEventReferralCode("+++", "V26");
    expect(code.endsWith("-V26")).toBe(true);
    const prefix = code.split("-")[0];
    expect(prefix).toMatch(/^[A-Z0-9]+$/);
    expect(prefix.length).toBeGreaterThan(0);
  });

  it("falls back to VM suffix when given garbage suffix", () => {
    expect(generateEventReferralCode("jake", "@@@")).toBe("JAKE-VM");
  });
});
