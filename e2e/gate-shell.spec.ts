import { test, expect } from "@playwright/test";

test.use({ storageState: { cookies: [], origins: [] } });

test("/ shows cold gate for logged-out user", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("gate-cold")).toBeVisible();
});
