import { test, expect } from "@playwright/test";

test("POST /api/waitlist/signup rejects disposable email", async ({ request }) => {
  const r = await request.post("/api/waitlist/signup", {
    data: { email: `junk-${Date.now()}@mailinator.com` },
  });
  expect(r.status()).toBe(400);
  const body = await r.json();
  expect(body.error).toMatch(/disposable/i);
});

test("POST /api/waitlist/signup creates entry with referral code", async ({ request }) => {
  const email = `e2e-${Date.now()}@example.com`;
  const r = await request.post("/api/waitlist/signup", { data: { email } });
  expect(r.status()).toBe(201);
  const body = await r.json();
  expect(body.referralCode).toMatch(/^[A-Z0-9]{8}$/);
  expect(body.position).toBeGreaterThan(0);
});

test("POST /api/waitlist/signup is case-insensitive dedupe", async ({ request }) => {
  const email = `e2e-dedupe-${Date.now()}@example.com`;
  const a = await request.post("/api/waitlist/signup", { data: { email } });
  expect(a.status()).toBe(201);
  const b = await request.post("/api/waitlist/signup", { data: { email: email.toUpperCase() } });
  expect(b.status()).toBe(200);
  const bodyB = await b.json();
  expect(bodyB.referralCode).toBe((await a.json()).referralCode);
});
