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

test("POST /api/waitlist/verify marks verifiedAt", async ({ request }) => {
  const referrer = await (await request.post("/api/waitlist/signup", {
    data: { email: `ref-${Date.now()}@example.com` }
  })).json();
  const invitee = await (await request.post("/api/waitlist/signup", {
    data: { email: `inv-${Date.now()}@example.com`, referredByCode: referrer.referralCode }
  })).json();
  const v = await request.post("/api/waitlist/verify", {
    data: { referralCode: invitee.referralCode }
  });
  expect(v.status()).toBe(200);
  const body = await v.json();
  expect(body.verifiedAt).toBeTruthy();
});

test("GET /api/waitlist/me returns position+stats", async ({ request }) => {
  const s = await (await request.post("/api/waitlist/signup", {
    data: { email: `me-${Date.now()}@example.com` }
  })).json();
  const me = await request.get(`/api/waitlist/me?referralCode=${s.referralCode}`);
  expect(me.status()).toBe(200);
  const body = await me.json();
  expect(body.position).toBeGreaterThan(0);
  expect(body.verifiedReferrals).toBe(0);
  expect(body.pendingReferrals).toBe(0);
});

test("POST /api/waitlist/issue-magic-link requires x-internal-secret", async ({ request }) => {
  const r = await request.post("/api/waitlist/issue-magic-link", { data: { email: "x@example.com" } });
  expect(r.status()).toBe(401);
});
