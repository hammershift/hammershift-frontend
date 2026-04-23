import { test, expect } from "@playwright/test";

const BASE = process.env.TEST_BASE_URL || "http://localhost:3000";

// The share-card OG route must fail-closed-quiet: even when the shortCode
// doesn't exist in the DB, it returns the FallbackCard as a 200 image/png.
// External scrapers (Slack, Twitter, iMessage) cache 500s and permanently
// break unfurls — a 200 fallback is the only acceptable outcome.
test.describe("Share OG image route", () => {
  test("opengraph-image returns PNG for a nonexistent shortCode", async ({
    request,
  }) => {
    const r = await request.get(`${BASE}/s/nonexistent-abc123/opengraph-image`);
    expect(r.status()).toBe(200);
    expect(r.headers()["content-type"]).toContain("image/png");
  });

  test("opengraph-image returns PNG for a random shortCode", async ({
    request,
  }) => {
    const r = await request.get(
      `${BASE}/s/${Math.random().toString(36).slice(2, 10)}/opengraph-image`,
    );
    expect(r.status()).toBe(200);
    expect(r.headers()["content-type"]).toContain("image/png");
  });
});
