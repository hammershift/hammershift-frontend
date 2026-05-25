import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { resolveEventCode, __resetEventCodeCache } from "../eventCodes";
import { generateEventReferralCode } from "../codes";

describe("resolveEventCode", () => {
  const savedEnv = process.env.EVENT_CODES_JSON;

  beforeEach(() => {
    __resetEventCodeCache();
  });

  afterEach(() => {
    process.env.EVENT_CODES_JSON = savedEnv;
    __resetEventCodeCache();
  });

  it("returns null when env var is unset", () => {
    delete process.env.EVENT_CODES_JSON;
    expect(resolveEventCode("velocity26")).toBeNull();
  });

  it("matches the configured code case-insensitively", () => {
    process.env.EVENT_CODES_JSON = JSON.stringify({
      velocity26: "sonoma_invitational",
    });
    expect(resolveEventCode("velocity26")).toBe("sonoma_invitational");
    expect(resolveEventCode("VELOCITY26")).toBe("sonoma_invitational");
    expect(resolveEventCode("Velocity26")).toBe("sonoma_invitational");
    expect(resolveEventCode("  velocity26  ")).toBe("sonoma_invitational");
  });

  it("returns null for unknown codes", () => {
    process.env.EVENT_CODES_JSON = JSON.stringify({ velocity26: "sonoma" });
    expect(resolveEventCode("nopenope")).toBeNull();
    expect(resolveEventCode("")).toBeNull();
  });

  it("survives malformed env var without throwing", () => {
    process.env.EVENT_CODES_JSON = "{not valid json";
    expect(resolveEventCode("velocity26")).toBeNull();
  });

  it("ignores non-string values in the env map", () => {
    process.env.EVENT_CODES_JSON = JSON.stringify({
      velocity26: 42,
      goodone: "ok",
    });
    expect(resolveEventCode("velocity26")).toBeNull();
    expect(resolveEventCode("goodone")).toBe("ok");
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
