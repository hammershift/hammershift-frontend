import type { APIRequestContext } from "@playwright/test";

export async function signupOnWaitlist(
  request: APIRequestContext,
  email?: string,
): Promise<{ email: string; referralCode: string; position: number }> {
  const e = email || `e2e-${Date.now()}-${Math.random()}@example.com`;
  const r = await request.post("/api/waitlist/signup", { data: { email: e } });
  const body = (await r.json()) as { referralCode: string; position: number };
  return { email: e, ...body };
}
