import { test, expect } from "@playwright/test";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("cold gate signup form", () => {
  test.skip(
    process.env.LAUNCH_GATE_ENABLED !== "true",
    "Gate not enabled",
  );

  test("submits email and transitions inline to the dashboard", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("gate-signup-form")).toBeVisible();

    const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 10)}@example.com`;
    await page.getByLabel("Email address").fill(email);
    await page.getByRole("button", { name: "Join the waitlist" }).click();

    await expect(page.getByTestId("gate-waitlisted-inline")).toBeVisible();
    await expect(page.getByTestId("waitlist-dashboard")).toBeVisible({ timeout: 10_000 });
  });

  test("cookie rehydrates to waitlisted view on reload", async ({ page, request }) => {
    const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 10)}@example.com`;
    const r = await request.post("/api/waitlist/signup", { data: { email } });
    expect(r.ok()).toBeTruthy();
    const { referralCode } = (await r.json()) as { referralCode: string };

    await page.context().addCookies([
      {
        name: "vm_waitlist_code",
        value: referralCode,
        url: (process.env.TEST_BASE_URL || "http://localhost:3000"),
      },
    ]);
    await page.goto("/");
    await expect(page.getByTestId("gate-waitlisted")).toBeVisible();
  });
});
