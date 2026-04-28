import { test, expect } from "@playwright/test";

test("GET /api/profile/cards requires auth", async ({ request }) => {
  const r = await request.get("/api/profile/cards");
  expect([401, 403]).toContain(r.status());
});
