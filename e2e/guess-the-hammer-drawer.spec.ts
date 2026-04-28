// e2e/guess-the-hammer-drawer.spec.ts
import { test, expect } from "@playwright/test";

test.describe("guess the hammer — details drawer", () => {
  test("Details button opens drawer; drawer renders title + actions; close works", async ({
    page,
  }) => {
    await page.goto("/price_is_right");

    // Wait for the first card with a Details button to appear. When run
    // against a seeded environment (E2E_HAS_DATA=1), require auctions to be
    // present and fail loudly if they aren't — otherwise this spec silently
    // green-skips in CI and rubber-stamps real regressions. In local dev or
    // anywhere without a seed, allow the skip.
    const detailsButton = page.getByRole("button", { name: /^view details/i }).first();
    const detailsCount = await detailsButton.count();
    if (detailsCount === 0) {
      const requireData = process.env.E2E_HAS_DATA === "1";
      if (requireData) {
        throw new Error(
          "E2E_HAS_DATA=1 but no auctions render on /price_is_right — seed required",
        );
      }
      test.skip(true, "No auctions on the page in this env");
    }

    await detailsButton.click();
    const drawer = page.getByTestId("auction-details-drawer");
    await expect(drawer).toBeVisible();

    // Title is present
    await expect(drawer.getByRole("heading", { level: 2 })).toBeVisible();

    // At least one quick-stat cell renders OR at least one highlight/description
    // section renders. (The spec doesn't guarantee any specific stat exists
    // for every auction, but at least one structured field should be present
    // when the projection forwards rich fields.)
    const sectionsPresent = await Promise.all([
      drawer.locator("dt").count(),
      drawer.locator('section h3:has-text("Highlights")').count(),
      drawer.locator('section h3:has-text("Description")').count(),
    ]);
    const totalSections = sectionsPresent.reduce((s, n) => s + n, 0);
    expect(totalSections).toBeGreaterThan(0);

    // Footer actions are present
    await expect(drawer.getByRole("button", { name: /make your guess/i })).toBeVisible();

    // Close via Escape
    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
  });
});
