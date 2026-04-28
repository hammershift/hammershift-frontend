import { test, expect } from "@playwright/test";

test.describe("profile hub", () => {
  test("hero renders for an invited user", async ({ page }) => {
    test.skip(!process.env.TEST_INVITED_COOKIE, "Need TEST_INVITED_COOKIE for authed tests");
    await page.context().addCookies([
      { name: "next-auth.session-token", value: process.env.TEST_INVITED_COOKIE!, domain: "localhost", path: "/" },
    ]);
    await page.goto("/profile");
    await expect(page.getByTestId("profile-hero")).toBeVisible();
    await expect(page.getByTestId("profile-stat-stripe")).toBeVisible();
  });
});
