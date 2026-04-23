import { test, expect } from "@playwright/test";

test.use({ storageState: { cookies: [], origins: [] } });

test("logged-out hitting /app is rewritten to gate", async ({ page }) => {
  test.skip(process.env.LAUNCH_GATE_ENABLED !== "true", "Gate not enabled");
  await page.goto("/app");
  await expect(page.getByTestId("gate-cold")).toBeVisible();
});

test("logged-out hitting /leaderboard is rewritten to gate", async ({ page }) => {
  test.skip(process.env.LAUNCH_GATE_ENABLED !== "true", "Gate not enabled");
  await page.goto("/leaderboard");
  await expect(page.getByTestId("gate-cold")).toBeVisible();
});
