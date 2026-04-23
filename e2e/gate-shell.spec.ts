import { test, expect } from "@playwright/test";

test.use({ storageState: { cookies: [], origins: [] } });

test("/ shows cold gate for logged-out user", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("gate-cold")).toBeVisible();
});

test("cohort counter renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("cohort-counter")).toBeVisible();
});

test("blurred sample cards render 4 items", async ({ page }) => {
  await page.goto("/");
  const cards = page.getByTestId("blurred-cards").locator("> div");
  await expect(cards).toHaveCount(4, { timeout: 5000 });
});
