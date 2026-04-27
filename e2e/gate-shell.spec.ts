import { test, expect } from "@playwright/test";

test.use({ storageState: { cookies: [], origins: [] } });

test("/ shows cold gate for logged-out user", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("gate-cold")).toBeVisible();
});

test("blurred sample cards render 4 items", async ({ page }) => {
  await page.goto("/");
  const cards = page.getByTestId("blurred-cards").locator("> div");
  await expect(cards).toHaveCount(4, { timeout: 5000 });
});

test("winners ticker renders when there are winners", async ({ page, request }) => {
  const r = await request.get("/api/waitlist/recent-winners");
  const body = await r.json();
  test.skip(!body.winners || body.winners.length === 0, "no settled winners in this db");
  await page.goto("/");
  await expect(page.getByTestId("winners-ticker")).toBeVisible();
});
