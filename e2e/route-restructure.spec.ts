import { test, expect } from "@playwright/test";
test("homepage content lives at /app", async ({ page }) => {
  await page.goto("/app");
  await expect(page.locator("body")).toContainText(/Velocity|Market|Predict/i);
});
