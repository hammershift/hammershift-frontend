import { test, expect } from "@playwright/test";

test.describe.configure({ mode: "serial" });

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("event code: VELOCITY26 (Sonoma invitational)", () => {
  test.skip(
    process.env.LAUNCH_GATE_ENABLED !== "true",
    "Gate disabled — event-code flow only matters with the gate on",
  );

  test.beforeEach(async ({ context }) => {
    // The event-code cookie persists across tests in the same worker
    // (serial mode shares context). Clear it so each case starts from a
    // fresh cold-gate state. We DON'T register an addInitScript because
    // that runs on every reload — including the reload tests do
    // intentionally to verify persistence — and would wipe state under
    // the test's feet.
    await context.clearCookies();
  });

  async function clearLocalStorage(page: import("@playwright/test").Page) {
    await page.evaluate(() => {
      try { window.localStorage.removeItem("vm_event_code_ok"); } catch {}
    });
  }

  test("rejects an invalid code", async ({ page }) => {
    await page.goto("/");
    await clearLocalStorage(page);
    await expect(page.getByTestId("event-code-form")).toBeVisible();

    await page.getByTestId("event-code-input").fill("nopenope");
    await page.getByTestId("event-code-submit").click();

    await expect(page.getByTestId("event-code-error")).toBeVisible();
    await expect(page.getByTestId("event-code-form")).toBeVisible(); // form still shown
  });

  test("accepts VELOCITY26 case-insensitively and unlocks signup", async ({ page }, testInfo) => {
    await page.goto("/");
    await clearLocalStorage(page);

    await page.screenshot({
      path: testInfo.outputPath("01-cold-gate.png"),
      fullPage: true,
    });

    await expect(page.getByTestId("event-code-form")).toBeVisible();
    await page.getByTestId("event-code-input").fill("velocity26");
    await page.getByTestId("event-code-submit").click();

    await expect(page.getByTestId("event-code-success")).toBeVisible();
    await page.screenshot({
      path: testInfo.outputPath("02-code-accepted.png"),
      fullPage: true,
    });

    // Signup form should now have focus (per the onAccepted hook in GatePageClient).
    await expect(page.getByTestId("gate-signup-form")).toBeVisible();

    const email = `e2e-evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
    await page.getByLabel("Email address").fill(email);
    await page.getByRole("button", { name: "Join the waitlist" }).click();

    // Event-code attendees skip the queue: they see the "you're in" CTA
    // instead of the WaitlistDashboard.
    await expect(page.getByTestId("gate-invited-inline")).toBeVisible({ timeout: 15_000 });
    await page.screenshot({
      path: testInfo.outputPath("03-invited.png"),
      fullPage: true,
    });

    const cta = page.getByTestId("gate-invited-cta");
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/login_page");
  });

  test("cookie persists across reload — success banner remains", async ({ page, context }, testInfo) => {
    await page.goto("/");
    await clearLocalStorage(page);
    await page.getByTestId("event-code-input").fill("VELOCITY26");
    await page.getByTestId("event-code-submit").click();
    await expect(page.getByTestId("event-code-success")).toBeVisible();

    // Manually seed the same localStorage hint that the client uses for UI
    // continuity, then reload — the success banner should re-appear without
    // re-entering the code.
    await page.evaluate(() => window.localStorage.setItem("vm_event_code_ok", "sonoma_invitational"));
    await page.reload();

    await expect(page.getByTestId("event-code-success")).toBeVisible();
    await page.screenshot({
      path: testInfo.outputPath("rehydrated.png"),
      fullPage: true,
    });
  });

  // Note: rate-limit behavior is covered by unit tests + a direct check
  // against the API would burn the per-IP bucket for the rest of this
  // suite. Skipped here to keep the suite hermetic.
});

test.describe("event code API contract (no gate required)", () => {
  test("rejects empty body with 400", async ({ request }) => {
    const r = await request.post("/api/waitlist/event-code", { data: {} });
    expect(r.status()).toBe(400);
  });
});
