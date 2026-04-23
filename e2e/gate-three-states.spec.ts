import { test, expect } from "@playwright/test";
import { signupOnWaitlist } from "./helpers/fixtures";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("gate states", () => {
  test("state A: cold visitor sees hero + cohort + blurred", async ({ page }) => {
    test.skip(process.env.LAUNCH_GATE_ENABLED !== "true", "Gate not enabled");
    await page.goto("/");
    await expect(page.getByTestId("gate-cold")).toBeVisible();
    await expect(page.getByTestId("cohort-counter")).toBeVisible();
    await expect(page.getByTestId("blurred-cards")).toBeVisible();
  });

  test("state B: waitlisted user via API seed", async ({ request }) => {
    const { referralCode, position } = await signupOnWaitlist(request);
    const meRes = await request.get(
      `/api/waitlist/me?referralCode=${encodeURIComponent(referralCode)}`,
    );
    expect(meRes.ok()).toBeTruthy();
    const me = (await meRes.json()) as { position: number };
    expect(typeof me.position).toBe("number");
    expect(me.position).toBeGreaterThan(0);
    expect(me.position).toBe(position);
  });

  // state C (invited → /app) covered by middleware-gate.spec.ts with seeded founder account.
});
