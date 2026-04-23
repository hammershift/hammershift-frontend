# Invite-Only Launch + Waitlist — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ship a Robinhood-style invite-only gate in front of Velocity Markets, with a referral-position waitlist and three viral share moments ("I'm in", winner receipt, tournament finish).

**Architecture:** One boolean gate (`users.isInvited`), one `middleware.ts`, one new collection (`waitlist_entries`). Current homepage content moves to `/app`; `/` becomes the gate. Admin repo (separate) owns approval + email send. Frontend owns signup, dashboard, share cards, and magic-link verification.

**Tech Stack:** Next.js 14 App Router, Mongoose + native MongoDB driver (shared with admin repo), NextAuth Email provider (magic link), Tailwind + design tokens from CLAUDE.md, Playwright for E2E, `nanoid`-style custom generator for short codes, Next `ImageResponse` for OG images.

**Source design doc:** `docs/plans/2026-04-22-invite-waitlist-launch-design.md`
**Admin repo brief:** `docs/plans/2026-04-22-invite-waitlist-admin-handoff.md`

---

## Parallelization map

Tasks within the same phase can run in parallel unless noted. Cross-phase dependencies are marked with `depends on`.

| Phase | Tasks | Can parallelize? | Depends on |
|---|---|---|---|
| 0. Setup | 0.1, 0.2 | yes | — |
| 1. Data layer | 1.1 – 1.6 | yes (6 workers) | Phase 0 |
| 2. APIs | 2.1 – 2.5 | yes (5 workers) | Phase 1 |
| 3. Gate UI | 3.1 – 3.8 | 3.3–3.7 parallel; 3.1 → 3.2 → 3.8 sequential | Phase 1 (not 2 for UI shells) |
| 4. Share cards | 4.1 – 4.5 | 4.1–4.2 parallel; 4.3–4.5 parallel after 4.1 | Phase 1 + 2.4 |
| 5. Migration + E2E | 5.1 – 5.4 | yes | Phases 2 + 3 |

**Testing note:** This repo has no unit-test runner — only Playwright E2E (`test:e2e`) and ad-hoc `ts-node` scripts. For each task we **either**:
- **UI / flow** → Playwright `.spec.ts` under `e2e/`
- **Model / utility / API** → a verification script under `scripts/verify-<name>.ts` run with `npx ts-node`

Both are TDD: write the script/spec FIRST, confirm it fails, then implement, then confirm it passes.

---

## Phase 0 — Setup

### Task 0.1: Add env vars + SVG type shim

**Files:**
- Modify: `.env.example`
- Modify: `amplify.yml` (preBuild echo block)
- Create: `src/types/svg.d.ts`

**Step 1: Add env vars to `.env.example`**

Append:
```
# Invite-only launch
LAUNCH_GATE_ENABLED=false
WAITLIST_IP_SALT=change-me-to-32-char-random
INTERNAL_API_SECRET=change-me
```

**Step 2: Wire them into `amplify.yml` preBuild (sibling of existing `echo "NEXTAUTH_SECRET..."` lines):**

```yaml
        - echo "LAUNCH_GATE_ENABLED=$LAUNCH_GATE_ENABLED" >> .env.production
        - echo "WAITLIST_IP_SALT=$WAITLIST_IP_SALT" >> .env.production
        - echo "INTERNAL_API_SECRET=$INTERNAL_API_SECRET" >> .env.production
```

**Step 3: Create `src/types/svg.d.ts` to unblock pre-existing typecheck noise:**

```ts
declare module "*.svg" {
  const content: string;
  export default content;
}
declare module "*.svg?url" {
  const url: string;
  export default url;
}
```

**Step 4: Verify typecheck baseline improves**

Run: `npx tsc --noEmit 2>&1 | head -40`
Expected: fewer SVG-related errors; no new errors introduced.

**Step 5: Commit**

```bash
git add .env.example amplify.yml src/types/svg.d.ts
git commit -m "chore: add LAUNCH_GATE_ENABLED + WAITLIST_IP_SALT env vars and SVG type shim"
```

---

### Task 0.2: Scaffold Playwright config + e2e directory

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/.gitkeep`

**Step 1: Write minimal Playwright config (matches existing `test:e2e` that uses `--project=desktop-chrome`)**

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop-chrome", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chrome", use: { ...devices["Pixel 7"] } },
  ],
});
```

**Step 2: Verify config parses**

Run: `npx playwright test --list`
Expected: "No tests found" or empty list (exit 0 or 1 is OK; just no parse errors).

**Step 3: Commit**

```bash
git add playwright.config.ts e2e/.gitkeep
git commit -m "chore: add Playwright config and e2e directory"
```

---

## Phase 1 — Data layer (6 parallel workers)

### Task 1.1: `WaitlistEntry` Mongoose model

**Files:**
- Create: `src/models/waitlistEntry.model.ts`
- Create: `scripts/verify-waitlist-entry-model.ts`

**Step 1: Verification script**

```ts
// scripts/verify-waitlist-entry-model.ts
import "dotenv/config";
import connectToDB from "../src/lib/mongoose";
import { WaitlistEntry } from "../src/models/waitlistEntry.model";

async function main() {
  await connectToDB();
  const email = `verify-${Date.now()}@example.com`;
  const entry = await WaitlistEntry.create({
    email,
    referralCode: `code${Date.now().toString(36)}`.slice(0, 8),
    ipHash: "deadbeef",
  });
  if (!entry._id) throw new Error("no _id");
  if (entry.verifiedAt !== null) throw new Error("verifiedAt should default null");
  if (entry.invitedAt !== null) throw new Error("invitedAt should default null");
  const dup = await WaitlistEntry.findOne({ email });
  if (!dup) throw new Error("lookup failed");
  await WaitlistEntry.deleteOne({ _id: entry._id });
  console.log("OK");
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
```

**Step 2: Run → fail**

Run: `npx ts-node --project tsconfig.json scripts/verify-waitlist-entry-model.ts`
Expected: `Cannot find module '../src/models/waitlistEntry.model'`.

**Step 3: Implement model**

```ts
// src/models/waitlistEntry.model.ts
import { Document, Schema, model, models, Types } from "mongoose";

export interface WaitlistEntryDoc extends Document {
  _id: Types.ObjectId;
  email: string;
  referralCode: string;
  referredByCode: string | null;
  verifiedAt: Date | null;
  invitedAt: Date | null;
  invitedBatchId: string | null;
  inviteEmailSentAt: Date | null;
  userId: Types.ObjectId | null;
  utm: { source?: string; medium?: string; campaign?: string };
  ipHash: string;
  flaggedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const waitlistEntrySchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, unique: true, index: true },
    referralCode: { type: String, required: true, unique: true, index: true },
    referredByCode: { type: String, default: null, index: true },
    verifiedAt: { type: Date, default: null },
    invitedAt: { type: Date, default: null },
    invitedBatchId: { type: String, default: null },
    inviteEmailSentAt: { type: Date, default: null },
    userId: { type: Schema.Types.ObjectId, default: null, ref: "User" },
    utm: {
      source: { type: String },
      medium: { type: String },
      campaign: { type: String },
    },
    ipHash: { type: String, required: true },
    flaggedAt: { type: Date, default: null },
  },
  { collection: "waitlist_entries", timestamps: true }
);

waitlistEntrySchema.index({ verifiedAt: 1, invitedAt: 1 });
waitlistEntrySchema.index({ invitedAt: 1, inviteEmailSentAt: 1 });

export const WaitlistEntry =
  (models.WaitlistEntry as ReturnType<typeof model<WaitlistEntryDoc>>) ||
  model<WaitlistEntryDoc>("WaitlistEntry", waitlistEntrySchema);
```

**Step 4: Run → OK**

**Step 5: Commit**

```bash
git add src/models/waitlistEntry.model.ts scripts/verify-waitlist-entry-model.ts
git commit -m "feat(waitlist): add WaitlistEntry model with indexes"
```

---

### Task 1.2: Add User model fields for invite gate

**Files:**
- Modify: `src/models/user.model.ts`
- Create: `scripts/verify-user-invite-fields.ts`

**Step 1: Verify script**

```ts
// scripts/verify-user-invite-fields.ts
import "dotenv/config";
import connectToDB from "../src/lib/mongoose";
import Users from "../src/models/user.model";

async function main() {
  await connectToDB();
  const schemaPaths = (Users.schema as any).paths;
  for (const field of ["isInvited", "invitedVia", "badges", "referralCode", "referredByCode"]) {
    if (!schemaPaths[field]) throw new Error(`missing schema path: ${field}`);
  }
  console.log("OK");
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
```

**Step 2: Run → fail** (`missing schema path: isInvited`)

**Step 3: Edit `src/models/user.model.ts`** — append fields to both the `User` interface AND `userSchema`:

Interface additions:
```ts
  isInvited?: boolean;
  invitedVia?: "founding" | "waitlist" | "direct";
  badges?: string[];
  referralCode?: string;
  referredByCode?: string | null;
```

Schema additions (before `createdAt`):
```ts
    isInvited: { type: Boolean, default: false, index: true },
    invitedVia: { type: String, enum: ["founding", "waitlist", "direct"], default: "waitlist" },
    badges: { type: [String], default: [] },
    referralCode: { type: String, unique: true, sparse: true },
    referredByCode: { type: String, default: null },
```

**Step 4: Run → OK**

**Step 5: Commit**

```bash
git add src/models/user.model.ts scripts/verify-user-invite-fields.ts
git commit -m "feat(waitlist): add isInvited/referralCode fields to User model"
```

---

### Task 1.3: `ShareCard` model

**Files:**
- Create: `src/models/shareCard.model.ts`
- Create: `scripts/verify-share-card-model.ts`

**Step 1: Verify script**

```ts
// scripts/verify-share-card-model.ts
import "dotenv/config";
import connectToDB from "../src/lib/mongoose";
import { ShareCard } from "../src/models/shareCard.model";
import { Types } from "mongoose";

async function main() {
  await connectToDB();
  const card = await ShareCard.create({
    userId: new Types.ObjectId(),
    type: "welcome",
    payload: { username: "test" },
    shortCode: `t${Date.now().toString(36)}`.slice(0, 6),
  });
  if (card.views !== 0 || card.signups !== 0) throw new Error("counters should default 0");
  await ShareCard.deleteOne({ _id: card._id });
  console.log("OK");
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
```

**Step 2: Run → fail**

**Step 3: Implement**

```ts
// src/models/shareCard.model.ts
import { Document, Schema, model, models, Types } from "mongoose";

export type ShareCardType = "welcome" | "winner" | "tournament";

export interface ShareCardDoc extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: ShareCardType;
  payload: Record<string, unknown>;
  shortCode: string;
  views: number;
  signups: number;
  createdAt: Date;
  updatedAt: Date;
}

const shareCardSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User", index: true },
    type: { type: String, required: true, enum: ["welcome", "winner", "tournament"] },
    payload: { type: Schema.Types.Mixed, required: true },
    shortCode: { type: String, required: true, unique: true, index: true },
    views: { type: Number, default: 0 },
    signups: { type: Number, default: 0 },
  },
  { collection: "share_cards", timestamps: true }
);

export const ShareCard =
  (models.ShareCard as ReturnType<typeof model<ShareCardDoc>>) ||
  model<ShareCardDoc>("ShareCard", shareCardSchema);
```

**Step 4: Run → OK**

**Step 5: Commit** `git commit -m "feat(waitlist): add ShareCard model"`

---

### Task 1.4: `referralCode` generator + `ipHash` utility

**Files:**
- Create: `src/lib/waitlist/codes.ts`
- Create: `scripts/verify-waitlist-codes.ts`

**Step 1: Verify script**

```ts
// scripts/verify-waitlist-codes.ts
import { generateReferralCode, hashIp, generateShortCode } from "../src/lib/waitlist/codes";

function main() {
  const a = generateReferralCode();
  const b = generateReferralCode();
  if (a.length !== 8) throw new Error("referral code not 8 chars");
  if (a === b) throw new Error("codes should differ");
  const h1 = hashIp("1.2.3.4", "salt");
  const h2 = hashIp("1.2.3.4", "salt");
  const h3 = hashIp("1.2.3.5", "salt");
  if (h1 !== h2) throw new Error("same ip+salt should hash same");
  if (h1 === h3) throw new Error("different ip should hash different");
  if (h1.length !== 64) throw new Error("sha256 hex = 64");
  const s = generateShortCode();
  if (s.length !== 6) throw new Error("short code not 6 chars");
  console.log("OK");
}
main();
```

**Step 2: Run → fail (module not found)**

**Step 3: Implement**

```ts
// src/lib/waitlist/codes.ts
import { createHash, randomBytes } from "node:crypto";

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // avoid 0/O/I/1/L confusion

export function generateReferralCode(length = 8): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

export function generateShortCode(length = 6): string {
  return generateReferralCode(length).toLowerCase();
}

export function hashIp(ip: string, salt: string): string {
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}
```

**Step 4: Run → OK**

**Step 5: Commit** `git commit -m "feat(waitlist): add referral code generator and IP hash utility"`

---

### Task 1.5: Disposable-email blocklist

**Files:**
- Create: `src/lib/waitlist/disposableDomains.ts`
- Create: `scripts/verify-disposable-domains.ts`

**Step 1: Verify script**

```ts
// scripts/verify-disposable-domains.ts
import { isDisposableEmail } from "../src/lib/waitlist/disposableDomains";
const cases: [string, boolean][] = [
  ["foo@mailinator.com", true],
  ["foo@guerrillamail.com", true],
  ["foo@tempmail.org", true],
  ["rick@gmail.com", false],
  ["Rick@Gmail.com", false],
  ["bad", true], // malformed → block
];
for (const [input, expected] of cases) {
  const got = isDisposableEmail(input);
  if (got !== expected) throw new Error(`${input}: expected ${expected}, got ${got}`);
}
console.log("OK");
```

**Step 2: Run → fail**

**Step 3: Implement**

```ts
// src/lib/waitlist/disposableDomains.ts
const DOMAINS = new Set([
  "mailinator.com","guerrillamail.com","tempmail.org","tempmail.com","10minutemail.com",
  "throwawaymail.com","yopmail.com","getairmail.com","fakeinbox.com","trashmail.com",
  "maildrop.cc","dispostable.com","mintemail.com","sharklasers.com","spam4.me",
  "temp-mail.org","tempr.email","mytemp.email","moakt.com","mohmal.com",
  "tmpmail.org","burnermail.io","getnada.com","inboxbear.com","emailondeck.com",
  "fakemail.net","fakemailgenerator.com","spambox.us","mailsac.com","mailcatch.com",
]);

export function isDisposableEmail(email: string): boolean {
  const lower = email.trim().toLowerCase();
  const at = lower.lastIndexOf("@");
  if (at <= 0 || at === lower.length - 1) return true;
  const domain = lower.slice(at + 1);
  return DOMAINS.has(domain);
}
```

**Step 4: Run → OK**

**Step 5: Commit** `git commit -m "feat(waitlist): add disposable-email blocklist"`

---

### Task 1.6: Rate limiter (MongoDB TTL-backed)

**Files:**
- Create: `src/lib/waitlist/rateLimit.ts`
- Create: `scripts/verify-rate-limit.ts`

**Step 1: Verify script**

```ts
// scripts/verify-rate-limit.ts
import "dotenv/config";
import { checkRateLimit } from "../src/lib/waitlist/rateLimit";

async function main() {
  const ipHash = `verify-${Date.now()}`;
  for (let i = 1; i <= 3; i++) {
    const r = await checkRateLimit(ipHash, "signup", { perHour: 3, perDay: 10 });
    if (!r.ok) throw new Error(`attempt ${i} should be allowed`);
  }
  const fourth = await checkRateLimit(ipHash, "signup", { perHour: 3, perDay: 10 });
  if (fourth.ok) throw new Error("4th attempt should be blocked");
  console.log("OK");
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
```

**Step 2: Run → fail**

**Step 3: Implement**

```ts
// src/lib/waitlist/rateLimit.ts
import clientPromise from "@/lib/mongodb";

export interface RateLimitOpts { perHour: number; perDay: number; }
export interface RateLimitResult { ok: boolean; retryAfterSec: number; count: number; }

export async function checkRateLimit(
  ipHash: string,
  bucket: string,
  opts: RateLimitOpts,
): Promise<RateLimitResult> {
  const client = await clientPromise;
  const db = client.db(process.env.DB_NAME || undefined);
  const col = db.collection("waitlist_rate_events");
  await col.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }).catch(() => {});
  const now = new Date();
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const hourCount = await col.countDocuments({ ipHash, bucket, at: { $gt: hourAgo } });
  if (hourCount >= opts.perHour) return { ok: false, retryAfterSec: 3600, count: hourCount };

  const dayCount = await col.countDocuments({ ipHash, bucket, at: { $gt: dayAgo } });
  if (dayCount >= opts.perDay) return { ok: false, retryAfterSec: 86400, count: dayCount };

  await col.insertOne({
    ipHash,
    bucket,
    at: now,
    expiresAt: new Date(now.getTime() + 25 * 60 * 60 * 1000),
  });
  return { ok: true, retryAfterSec: 0, count: hourCount + 1 };
}
```

**Step 4: Run → OK**

**Step 5: Commit** `git commit -m "feat(waitlist): add Mongo-backed rate limiter"`

---

## Phase 2 — APIs (5 parallel workers after Phase 1)

All API routes use this boilerplate:
```ts
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
```

### Task 2.1: `POST /api/waitlist/signup`

**Files:**
- Create: `src/app/api/waitlist/signup/route.ts`
- Create: `e2e/waitlist-signup.spec.ts`

**Step 1: Write failing Playwright spec**

```ts
// e2e/waitlist-signup.spec.ts
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
```

**Step 2: Run → fail** `npm run test:e2e -- waitlist-signup`

**Step 3: Implement route**

```ts
// src/app/api/waitlist/signup/route.ts
import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongoose";
import { WaitlistEntry } from "@/models/waitlistEntry.model";
import Users from "@/models/user.model";
import { generateReferralCode, hashIp } from "@/lib/waitlist/codes";
import { isDisposableEmail } from "@/lib/waitlist/disposableDomains";
import { checkRateLimit } from "@/lib/waitlist/rateLimit";

export const dynamic = "force-dynamic";

function getIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "0.0.0.0";
}

async function computePosition(entry: any): Promise<number> {
  const rawRank = 1 + await WaitlistEntry.countDocuments({
    invitedAt: null,
    createdAt: { $lt: entry.createdAt },
  });
  const bonus = 10 * await WaitlistEntry.countDocuments({
    referredByCode: entry.referralCode,
    verifiedAt: { $ne: null },
    flaggedAt: null,
  });
  return Math.max(1, rawRank - bonus);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawEmail = (body.email || "").toString().trim().toLowerCase();
    const referredByCode = body.referredByCode ? body.referredByCode.toString().trim() : null;
    const utm = body.utm || {};

    if (!rawEmail || !rawEmail.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (isDisposableEmail(rawEmail)) {
      return NextResponse.json({ error: "Disposable email domains not allowed" }, { status: 400 });
    }

    const salt = process.env.WAITLIST_IP_SALT || "default-salt";
    const ipHash = hashIp(getIp(req), salt);
    const rl = await checkRateLimit(ipHash, "signup", { perHour: 3, perDay: 10 });
    if (!rl.ok) {
      return NextResponse.json({ error: "Too many signups from this network" }, { status: 429 });
    }

    await connectToDB();

    const existingUser = await Users.findOne({ email: rawEmail }).lean();
    if (existingUser) {
      return NextResponse.json({ error: "You already have an account", hasAccount: true }, { status: 409 });
    }

    const existing = await WaitlistEntry.findOne({ email: rawEmail });
    if (existing) {
      const position = await computePosition(existing);
      return NextResponse.json({
        referralCode: existing.referralCode,
        verifiedAt: existing.verifiedAt,
        position,
        alreadyOnList: true,
      });
    }

    let code = generateReferralCode();
    for (let i = 0; i < 5 && (await WaitlistEntry.findOne({ referralCode: code })); i++) {
      code = generateReferralCode();
    }

    const entry = await WaitlistEntry.create({
      email: rawEmail,
      referralCode: code,
      referredByCode,
      ipHash,
      utm,
    });
    const position = await computePosition(entry);
    return NextResponse.json({ referralCode: code, position }, { status: 201 });
  } catch (err: any) {
    console.error("waitlist/signup:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
```

**Step 4: Run → pass**

**Step 5: Commit** `git commit -m "feat(waitlist): POST /api/waitlist/signup"`

---

### Task 2.2: `POST /api/waitlist/verify`

**Files:**
- Create: `src/app/api/waitlist/verify/route.ts`
- Add test to: `e2e/waitlist-signup.spec.ts`

**Step 1: Append failing test**

```ts
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
```

**Step 2: Run → fail**

**Step 3: Implement**

```ts
// src/app/api/waitlist/verify/route.ts
import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongoose";
import { WaitlistEntry } from "@/models/waitlistEntry.model";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const code = (body.referralCode || "").toString().trim();
  if (!code) return NextResponse.json({ error: "referralCode required" }, { status: 400 });

  await connectToDB();
  const entry = await WaitlistEntry.findOne({ referralCode: code });
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (entry.verifiedAt) {
    return NextResponse.json({ verifiedAt: entry.verifiedAt, alreadyVerified: true });
  }
  entry.verifiedAt = new Date();
  await entry.save();
  return NextResponse.json({ verifiedAt: entry.verifiedAt });
}
```

**Step 4: Run → pass**

**Step 5: Commit** `git commit -m "feat(waitlist): POST /api/waitlist/verify"`

---

### Task 2.3: `GET /api/waitlist/me`

**Files:**
- Create: `src/app/api/waitlist/me/route.ts`

**Step 1: Append failing test**

```ts
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
```

**Step 2: Run → fail**

**Step 3: Implement**

```ts
// src/app/api/waitlist/me/route.ts
import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongoose";
import { WaitlistEntry } from "@/models/waitlistEntry.model";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("referralCode");
  if (!code) return NextResponse.json({ error: "referralCode required" }, { status: 400 });

  await connectToDB();
  const me = await WaitlistEntry.findOne({ referralCode: code });
  if (!me) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const verifiedReferrals = await WaitlistEntry.countDocuments({
    referredByCode: me.referralCode, verifiedAt: { $ne: null }, flaggedAt: null,
  });
  const pendingReferrals = await WaitlistEntry.countDocuments({
    referredByCode: me.referralCode, verifiedAt: null, flaggedAt: null,
  });
  const rawRank = 1 + await WaitlistEntry.countDocuments({
    invitedAt: null, createdAt: { $lt: me.createdAt },
  });
  const position = Math.max(1, rawRank - 10 * verifiedReferrals);

  return NextResponse.json({
    email: me.email,
    referralCode: me.referralCode,
    verifiedAt: me.verifiedAt,
    invitedAt: me.invitedAt,
    position,
    verifiedReferrals,
    pendingReferrals,
  });
}
```

**Step 4: Run → pass**

**Step 5: Commit** `git commit -m "feat(waitlist): GET /api/waitlist/me"`

---

### Task 2.4: `POST /api/waitlist/issue-magic-link`

**Purpose:** Admin repo calls this after approval so the invitee can one-click sign in via NextAuth EmailProvider.

**Files:**
- Create: `src/app/api/waitlist/issue-magic-link/route.ts`

**Step 1: Append failing test**

```ts
test("POST /api/waitlist/issue-magic-link requires x-internal-secret", async ({ request }) => {
  const r = await request.post("/api/waitlist/issue-magic-link", { data: { email: "x@example.com" } });
  expect(r.status()).toBe(401);
});
```

**Step 2: Run → fail**

**Step 3: Implement**

```ts
// src/app/api/waitlist/issue-magic-link/route.ts
import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongoose";
import { WaitlistEntry } from "@/models/waitlistEntry.model";
import { randomUUID } from "node:crypto";
import nodemailer from "nodemailer";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const secret = req.headers.get("x-internal-secret");
  if (!secret || secret !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const email = (body.email || "").toString().trim().toLowerCase();
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

  await connectToDB();
  const entry = await WaitlistEntry.findOne({ email });
  if (!entry || !entry.invitedAt) {
    return NextResponse.json({ error: "Not approved" }, { status: 403 });
  }

  const token = randomUUID().replace(/-/g, "");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const url = `${process.env.NEXTAUTH_URL}/api/auth/callback/email?email=${encodeURIComponent(email)}&token=${token}`;

  const client = await clientPromise;
  const db = client.db(process.env.DB_NAME || undefined);
  await db.collection("verification_tokens").insertOne({ identifier: email, token, expires });

  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST!,
    port: parseInt(process.env.EMAIL_SERVER_PORT || "587", 10),
    auth: { user: process.env.EMAIL_SERVER_USER!, pass: process.env.EMAIL_SERVER_PASSWORD! },
  });
  await transport.sendMail({
    to: email,
    from: process.env.EMAIL_FROM!,
    subject: "You're in. Welcome to Velocity Markets.",
    html: renderInviteEmail(url),
    text: `Welcome to Velocity Markets. Click here to sign in: ${url}`,
  });

  await WaitlistEntry.updateOne({ _id: entry._id }, { $set: { inviteEmailSentAt: new Date() } });
  return NextResponse.json({ ok: true });
}

function renderInviteEmail(url: string): string {
  return `<!doctype html><html><body style="font-family:-apple-system,sans-serif;background:#0A0A1A;color:#fff;padding:32px">
    <h1 style="color:#E94560">You're in.</h1>
    <p>Welcome to Velocity Markets. Predict auction hammer prices. Win real money.</p>
    <p><a href="${url}" style="background:#E94560;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block">Claim your account</a></p>
    <p style="color:#888;font-size:12px">Link expires in 24 hours. If you didn't request this, ignore this email.</p>
  </body></html>`;
}
```

**Step 4: Run → pass**

**Step 5: Commit** `git commit -m "feat(waitlist): POST /api/waitlist/issue-magic-link (internal)"`

---

### Task 2.5: `GET /api/waitlist/cohort`

**Purpose:** Powers the "47 / 1,000 spots claimed" counter.

**Files:**
- Create: `src/app/api/waitlist/cohort/route.ts`

**Step 1: Append failing test**

```ts
test("GET /api/waitlist/cohort returns claimed + cap", async ({ request }) => {
  const r = await request.get("/api/waitlist/cohort");
  expect(r.status()).toBe(200);
  const body = await r.json();
  expect(typeof body.claimed).toBe("number");
  expect(body.cap).toBe(1000);
});
```

**Step 2: Run → fail**

**Step 3: Implement**

```ts
// src/app/api/waitlist/cohort/route.ts
import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongoose";
import { WaitlistEntry } from "@/models/waitlistEntry.model";
import Users from "@/models/user.model";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export async function GET() {
  await connectToDB();
  const [founding, waitlist] = await Promise.all([
    Users.countDocuments({ invitedVia: "founding" }),
    WaitlistEntry.countDocuments({}),
  ]);
  return NextResponse.json({ claimed: founding + waitlist, cap: 1000 });
}
```

**Step 4: Run → pass**

**Step 5: Commit** `git commit -m "feat(waitlist): GET /api/waitlist/cohort counter"`

---

## Phase 3 — Gate UI

### Task 3.1: Move current homepage content to `/app`

**Files:**
- Move: `src/app/page.tsx` → `src/app/app/page.tsx`

**Step 1: E2E**

```ts
// e2e/route-restructure.spec.ts
import { test, expect } from "@playwright/test";
test("homepage content lives at /app", async ({ page }) => {
  await page.goto("/app");
  await expect(page.locator("body")).toContainText(/Velocity|Market|Predict/i);
});
```

**Step 2: Run → fail (404 on /app)**

**Step 3: Move file**

```bash
mkdir -p src/app/app
git mv src/app/page.tsx src/app/app/page.tsx
```

**Step 4: Run → pass**

**Step 5: Commit** `git commit -m "refactor: move homepage content from / to /app"`

---

### Task 3.2: Scaffold new `/` gate page shell

**Files:**
- Create: `src/app/page.tsx`
- Create: `src/app/components/waitlist/GatePageClient.tsx`

**Step 1: Write page + client shell**

```tsx
// src/app/page.tsx
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import connectToDB from "@/lib/mongoose";
import Users from "@/models/user.model";
import GatePageClient from "./components/waitlist/GatePageClient";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getAuthSession();
  if (session?.user?.email) {
    await connectToDB();
    const user = await Users.findOne({ email: session.user.email }).lean();
    if (user?.isInvited) redirect("/app");
    return <GatePageClient mode="waitlisted" email={session.user.email} referralCode={user?.referralCode} />;
  }
  return <GatePageClient mode="cold" />;
}
```

```tsx
// src/app/components/waitlist/GatePageClient.tsx
"use client";
interface Props { mode: "cold" | "waitlisted"; email?: string; referralCode?: string; }
export default function GatePageClient({ mode, email }: Props) {
  return (
    <main className="min-h-screen bg-[#0A0A1A] text-white flex items-center justify-center p-6">
      <div className="max-w-3xl w-full">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Velocity Markets — <span className="text-[#E94560]">Invite-Only</span>
        </h1>
        <p className="text-lg text-gray-300 mb-8">
          Predict auction hammer prices. Win real money. Founding cohort closes at 1,000 predictors.
        </p>
        {mode === "cold" && <div data-testid="gate-cold">cold</div>}
        {mode === "waitlisted" && <div data-testid="gate-waitlisted">waitlisted as {email}</div>}
      </div>
    </main>
  );
}
```

**Step 2: E2E**

```ts
// e2e/gate-shell.spec.ts
import { test, expect } from "@playwright/test";
test("/ shows cold gate for logged-out user", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("gate-cold")).toBeVisible();
});
```

**Step 3: Run → pass**

**Step 4: Commit** `git commit -m "feat(gate): scaffold / gate page with 3 session modes"`

---

### Task 3.3: `CohortCounter` component

**Files:**
- Create: `src/app/components/waitlist/CohortCounter.tsx`

**Step 1: Implement**

```tsx
// src/app/components/waitlist/CohortCounter.tsx
"use client";
import { useEffect, useState } from "react";

export default function CohortCounter() {
  const [state, setState] = useState<{ claimed: number; cap: number } | null>(null);
  useEffect(() => {
    fetch("/api/waitlist/cohort").then((r) => r.json()).then(setState).catch(() => {});
  }, []);
  if (!state) return null;
  const pct = Math.min(100, (state.claimed / state.cap) * 100);
  return (
    <div className="mt-3 text-sm" data-testid="cohort-counter">
      <div className="flex justify-between text-gray-400 mb-1">
        <span className="font-mono">{state.claimed}</span>
        <span className="font-mono">/ {state.cap} spots claimed</span>
      </div>
      <div className="h-1 bg-[#1E2A36] rounded overflow-hidden">
        <div className="h-full bg-[#E94560] transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
```

**Step 2: Append to `gate-shell.spec.ts`**

```ts
test("cohort counter renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("cohort-counter")).toBeVisible();
});
```

**Step 3: Mount inside `GatePageClient` cold branch**

**Step 4: Commit** `git commit -m "feat(gate): CohortCounter with live /api/waitlist/cohort"`

---

### Task 3.4: `BlurredSampleCards` component

**Files:**
- Create: `src/app/components/waitlist/BlurredSampleCards.tsx`
- Create: `src/app/api/waitlist/sample-markets/route.ts`

**Step 1: Implement route**

```ts
// src/app/api/waitlist/sample-markets/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export async function GET() {
  const db = (await clientPromise).db(process.env.DB_NAME || undefined);
  const markets = await db.collection("polygon_markets")
    .find({ status: "OPEN", closesAt: { $gt: new Date() } })
    .sort({ totalVolume: -1 })
    .limit(4)
    .project({ title: 1, imageUrl: 1, yesPrice: 1, noPrice: 1, closesAt: 1 })
    .toArray();
  return NextResponse.json({ markets });
}
```

**Step 2: Implement component**

```tsx
// src/app/components/waitlist/BlurredSampleCards.tsx
"use client";
import { useEffect, useState } from "react";

export default function BlurredSampleCards() {
  const [markets, setMarkets] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/waitlist/sample-markets").then((r) => r.json()).then((d) => setMarkets(d.markets || []));
  }, []);
  if (!markets.length) return null;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-10 select-none pointer-events-none" data-testid="blurred-cards">
      {markets.map((m) => (
        <div key={m._id} className="relative bg-[#13202D] border border-[#1E2A36] rounded-lg overflow-hidden">
          <div className="aspect-video bg-gray-800" />
          <div className="p-3 blur-sm">
            <div className="text-xs text-gray-400 truncate">{m.title}</div>
            <div className="mt-2 flex gap-2 font-mono text-sm">
              <span className="text-[#00D4AA]">YES {Math.round((m.yesPrice || 0.5) * 100)}%</span>
              <span className="text-[#E94560]">NO {Math.round((m.noPrice || 0.5) * 100)}%</span>
            </div>
          </div>
          <div className="absolute inset-0 bg-[#0A0A1A]/40" />
        </div>
      ))}
    </div>
  );
}
```

**Step 3: E2E**

```ts
test("blurred sample cards render 4 items", async ({ page }) => {
  await page.goto("/");
  const cards = page.getByTestId("blurred-cards").locator("> div");
  await expect(cards).toHaveCount(4, { timeout: 5000 });
});
```

**Step 4: Wire into `GatePageClient`**

**Step 5: Commit** `git commit -m "feat(gate): BlurredSampleCards with 4 upcoming markets"`

---

### Task 3.5: `WinnersTicker` component

**Files:**
- Create: `src/app/components/waitlist/WinnersTicker.tsx`
- Create: `src/app/api/waitlist/recent-winners/route.ts`

**Step 1: Implement route**

```ts
// src/app/api/waitlist/recent-winners/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 300;

export async function GET() {
  const db = (await clientPromise).db(process.env.DB_NAME || undefined);
  const rows = await db.collection("polygon_positions")
    .aggregate([
      { $match: { status: "RESOLVED", payout: { $gt: 10 }, isVirtual: { $ne: true } } },
      { $sort: { settledAt: -1 } },
      { $limit: 20 },
      { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
      { $lookup: { from: "polygon_markets", localField: "marketId", foreignField: "_id", as: "market" } },
      { $project: {
        payout: 1, settledAt: 1,
        username: { $arrayElemAt: ["$user.username", 0] },
        marketTitle: { $arrayElemAt: ["$market.title", 0] },
      } },
    ]).toArray();
  return NextResponse.json({ winners: rows });
}
```

**Step 2: Implement component**

```tsx
// src/app/components/waitlist/WinnersTicker.tsx
"use client";
import { useEffect, useState } from "react";

export default function WinnersTicker() {
  const [winners, setWinners] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/waitlist/recent-winners").then((r) => r.json()).then((d) => setWinners(d.winners || []));
  }, []);
  if (!winners.length) return null;
  const doubled = [...winners, ...winners];
  return (
    <div className="overflow-hidden mt-12 py-4 border-y border-[#1E2A36]" data-testid="winners-ticker">
      <div className="flex gap-8 animate-[ticker_60s_linear_infinite] whitespace-nowrap">
        {doubled.map((w, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
            <span className="text-[#00D4AA] font-mono">+${Math.round(w.payout)}</span>
            <span className="text-gray-500">{w.username || "user"} on</span>
            <span className="text-gray-300 truncate max-w-xs">{w.marketTitle}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

Add to `src/app/styles/globals.css`:
```css
@keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
```

**Step 3: E2E** — `expect(page.getByTestId("winners-ticker")).toBeVisible()` (skip if zero winners in staging db)

**Step 4: Wire into `GatePageClient`**

**Step 5: Commit** `git commit -m "feat(gate): WinnersTicker marquee"`

---

### Task 3.6: `WaitlistDashboard` (logged-in + waitlisted)

**Files:**
- Create: `src/app/components/waitlist/WaitlistDashboard.tsx`
- Modify: `src/lib/auth.ts` (add `referralCode` + `isInvited` to JWT)
- Modify: `src/app/types/userTypes.ts` (extend session user type)

**Step 1: Implement component**

```tsx
// src/app/components/waitlist/WaitlistDashboard.tsx
"use client";
import { useEffect, useState } from "react";

interface Me {
  referralCode: string;
  position: number;
  verifiedReferrals: number;
  pendingReferrals: number;
}

export default function WaitlistDashboard({ referralCode }: { referralCode: string }) {
  const [me, setMe] = useState<Me | null>(null);
  useEffect(() => {
    const fetchMe = () => fetch(`/api/waitlist/me?referralCode=${referralCode}`).then((r) => r.json()).then(setMe).catch(() => {});
    fetchMe();
    const id = setInterval(fetchMe, 20_000);
    return () => clearInterval(id);
  }, [referralCode]);
  if (!me) return <div className="text-gray-400">Loading…</div>;

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/?ref=${me.referralCode}` : "";
  return (
    <div data-testid="waitlist-dashboard" className="max-w-xl">
      <div className="font-mono text-7xl text-[#E94560] mb-2">#{me.position}</div>
      <p className="text-gray-300 mb-6">Share to move up. Every verified friend = 10 spots closer.</p>
      <div className="flex gap-2 mb-4">
        <input readOnly value={shareUrl} className="flex-1 bg-[#13202D] border border-[#1E2A36] px-3 py-2 rounded text-sm font-mono" />
        <button
          onClick={() => navigator.clipboard.writeText(shareUrl)}
          className="bg-[#E94560] px-4 py-2 rounded text-sm font-semibold">Copy</button>
      </div>
      <div className="text-sm text-gray-400">
        <span className="text-[#00D4AA] font-mono">{me.verifiedReferrals} verified</span>
        <span className="mx-2">·</span>
        <span className="text-[#FFB547] font-mono">{me.pendingReferrals} pending</span>
      </div>
      {me.verifiedReferrals >= 10 && (
        <div className="mt-4 px-3 py-2 bg-[#FFB547]/10 border border-[#FFB547]/30 rounded text-sm">
          🏅 Early Predictor badge unlocked at invite time
        </div>
      )}
    </div>
  );
}
```

**Step 2: Extend JWT in `src/lib/auth.ts`** — inside `if (dbUser) {` block add:
```ts
token.isInvited = dbUser.isInvited === true;
token.referralCode = dbUser.referralCode;
```

Session callback add:
```ts
session.user.isInvited = token.isInvited as boolean | undefined;
session.user.referralCode = token.referralCode as string | undefined;
```

**Step 3: Mount inside `GatePageClient` waitlisted branch**

**Step 4: Commit** `git commit -m "feat(gate): WaitlistDashboard with 20s position polling"`

---

### Task 3.7: `InvitedCelebrationModal`

**Files:**
- Create: `src/app/components/waitlist/InvitedCelebrationModal.tsx`
- Create: `src/app/api/share/welcome/route.ts`

**Step 1: Implement share route**

```ts
// src/app/api/share/welcome/route.ts
import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import connectToDB from "@/lib/mongoose";
import Users from "@/models/user.model";
import { ShareCard } from "@/models/shareCard.model";
import { generateShortCode } from "@/lib/waitlist/codes";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await getAuthSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectToDB();
  const user = await Users.findOne({ email: session.user.email });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = await ShareCard.findOne({ userId: user._id, type: "welcome" });
  if (existing) return NextResponse.json({ shortCode: existing.shortCode });

  let shortCode = generateShortCode();
  for (let i = 0; i < 5 && (await ShareCard.findOne({ shortCode })); i++) shortCode = generateShortCode();

  const card = await ShareCard.create({
    userId: user._id,
    type: "welcome",
    payload: {
      username: user.username,
      badges: user.badges || [],
      referralCode: user.referralCode,
    },
    shortCode,
  });
  return NextResponse.json({ shortCode: card.shortCode });
}
```

**Step 2: Implement modal**

```tsx
// src/app/components/waitlist/InvitedCelebrationModal.tsx
"use client";
import { useEffect, useState } from "react";

export default function InvitedCelebrationModal() {
  const [shortCode, setShortCode] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("vm_welcome_shown") === "1") return;
    fetch("/api/share/welcome", { method: "POST" }).then((r) => r.json()).then((d) => {
      if (d.shortCode) setShortCode(d.shortCode);
    });
  }, []);
  if (!shortCode) return null;
  const shareUrl = `${window.location.origin}/s/${shortCode}`;
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" data-testid="invited-modal">
      <div className="bg-[#13202D] border border-[#1E2A36] rounded-xl p-8 max-w-md">
        <h2 className="text-3xl font-bold mb-2 text-[#E94560]">You're in.</h2>
        <p className="text-gray-300 mb-6">Tell the world. Here's your "I'm in" card:</p>
        <img src={`/s/${shortCode}/opengraph-image`} alt="Welcome" className="w-full rounded mb-4" />
        <div className="flex gap-2">
          <button onClick={() => navigator.clipboard.writeText(shareUrl)} className="flex-1 bg-[#E94560] py-2 rounded font-semibold">Copy link</button>
          <button onClick={() => { localStorage.setItem("vm_welcome_shown", "1"); location.href = "/app"; }} className="flex-1 bg-[#1E2A36] py-2 rounded">Start predicting →</button>
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Mount on `/app/page.tsx` top** (so it fires on first-visit post-approval)

**Step 4: Commit** `git commit -m "feat(gate): InvitedCelebrationModal + welcome share card"`

---

### Task 3.8: `middleware.ts` — the actual gate

**Files:**
- Create: `middleware.ts` (project root)

**Step 1: E2E**

```ts
// e2e/middleware-gate.spec.ts
import { test, expect } from "@playwright/test";

test.beforeAll(async () => {
  if (process.env.LAUNCH_GATE_ENABLED !== "true") test.skip();
});

test("logged-out hitting /app is rewritten to gate", async ({ page }) => {
  await page.goto("/app");
  await expect(page.getByTestId("gate-cold")).toBeVisible();
});

test("logged-out hitting /leaderboard is rewritten to gate", async ({ page }) => {
  await page.goto("/leaderboard");
  await expect(page.getByTestId("gate-cold")).toBeVisible();
});
```

**Step 2: Run → fail (no middleware yet)**

**Step 3: Implement middleware**

```ts
// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const ALLOW_PREFIXES = [
  "/api/auth",
  "/api/waitlist",
  "/api/share",
  "/s/",
  "/_next",
  "/favicon",
  "/robots.txt",
  "/sitemap.xml",
  "/og",
  "/legal",
  "/privacy",
  "/terms",
];

export async function middleware(req: NextRequest) {
  if (process.env.LAUNCH_GATE_ENABLED !== "true") return NextResponse.next();

  const { pathname } = req.nextUrl;
  if (pathname === "/") return NextResponse.next();
  for (const prefix of ALLOW_PREFIXES) {
    if (pathname.startsWith(prefix)) return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (token && (token as any).isInvited === true) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/";
  url.searchParams.set("gated", pathname);
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)",
  ],
};
```

**Step 4: Run with `LAUNCH_GATE_ENABLED=true npm run test:e2e -- middleware-gate` → pass**

**Step 5: Commit** `git commit -m "feat(gate): middleware.ts rewrites unauthorized paths to /"`

---

## Phase 4 — Share cards & viral

### Task 4.1: OG image route

**Files:**
- Create: `src/app/s/[shortCode]/opengraph-image.tsx`

**Step 1: Implement**

```tsx
// src/app/s/[shortCode]/opengraph-image.tsx
import { ImageResponse } from "next/og";
import clientPromise from "@/lib/mongodb";

export const runtime = "nodejs";
export const alt = "Velocity Markets";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG({ params }: { params: { shortCode: string } }) {
  const db = (await clientPromise).db(process.env.DB_NAME || undefined);
  const card = await db.collection("share_cards").findOne({ shortCode: params.shortCode });
  if (!card) return new ImageResponse(<FallbackCard />, size);
  if (card.type === "welcome") return new ImageResponse(<WelcomeCard card={card} />, size);
  if (card.type === "winner") return new ImageResponse(<WinnerCard card={card} />, size);
  if (card.type === "tournament") return new ImageResponse(<TournamentCard card={card} />, size);
  return new ImageResponse(<FallbackCard />, size);
}

function FallbackCard() {
  return <div style={{ display: "flex", width: 1200, height: 630, background: "#0A0A1A", color: "#fff", alignItems: "center", justifyContent: "center", fontSize: 72 }}>Velocity Markets</div>;
}
function WelcomeCard({ card }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", width: 1200, height: 630, background: "#0A0A1A", color: "#fff", padding: 80 }}>
      <div style={{ fontSize: 32, color: "#E94560" }}>VELOCITY MARKETS</div>
      <div style={{ fontSize: 96, fontWeight: 800, marginTop: 40 }}>I'm in.</div>
      <div style={{ fontSize: 40, color: "#9CA3AF", marginTop: 20 }}>@{card.payload?.username || "predictor"}</div>
      <div style={{ marginTop: "auto", fontSize: 24, color: "#6B7280" }}>velocity-markets.com</div>
    </div>
  );
}
function WinnerCard({ card }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", width: 1200, height: 630, background: "#0A0A1A", color: "#fff", padding: 80 }}>
      <div style={{ fontSize: 32, color: "#00D4AA" }}>WINNER</div>
      <div style={{ fontSize: 140, fontWeight: 800, marginTop: 20, fontFamily: "monospace" }}>+${Math.round(card.payload?.payout || 0)}</div>
      <div style={{ fontSize: 36, marginTop: 20 }}>@{card.payload?.username} called {card.payload?.pick}</div>
      <div style={{ fontSize: 28, color: "#9CA3AF", marginTop: 10 }}>{card.payload?.marketTitle}</div>
      <div style={{ marginTop: "auto", fontSize: 24, color: "#6B7280" }}>velocity-markets.com</div>
    </div>
  );
}
function TournamentCard({ card }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", width: 1200, height: 630, background: "#0A0A1A", color: "#fff", padding: 80 }}>
      <div style={{ fontSize: 32, color: "#FFB547" }}>TOURNAMENT FINISH</div>
      <div style={{ fontSize: 120, fontWeight: 800, marginTop: 20 }}>#{card.payload?.placement}</div>
      <div style={{ fontSize: 36, marginTop: 20 }}>@{card.payload?.username} · {Math.round((card.payload?.accuracy || 0) * 100)}% accuracy</div>
      <div style={{ fontSize: 28, color: "#9CA3AF", marginTop: 10 }}>{card.payload?.tournamentName}</div>
      <div style={{ marginTop: "auto", fontSize: 24, color: "#6B7280" }}>velocity-markets.com</div>
    </div>
  );
}
```

**Step 2: E2E**

```ts
// e2e/og-image.spec.ts
import { test, expect } from "@playwright/test";
test("opengraph-image returns PNG for any shortCode", async ({ request }) => {
  const r = await request.get("/s/abc123/opengraph-image");
  expect(r.status()).toBe(200);
  expect(r.headers()["content-type"]).toContain("image/png");
});
```

**Step 3: Commit** `git commit -m "feat(share): OG image route for share cards"`

---

### Task 4.2: `/s/[shortCode]/page.tsx` unfurl

**Files:**
- Create: `src/app/s/[shortCode]/page.tsx`

**Step 1: Implement**

```tsx
// src/app/s/[shortCode]/page.tsx
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import clientPromise from "@/lib/mongodb";
import { getAuthSession } from "@/lib/auth";
import connectToDB from "@/lib/mongoose";
import Users from "@/models/user.model";

export const dynamic = "force-dynamic";

async function getCard(shortCode: string) {
  const db = (await clientPromise).db(process.env.DB_NAME || undefined);
  return db.collection("share_cards").findOne({ shortCode });
}

export async function generateMetadata({ params }: { params: { shortCode: string } }): Promise<Metadata> {
  const card = await getCard(params.shortCode);
  const title = card?.type === "winner" ? `+$${Math.round((card.payload as any)?.payout || 0)} on Velocity Markets`
    : card?.type === "tournament" ? `#${(card.payload as any)?.placement} on Velocity Markets`
    : "Velocity Markets — Invite-Only";
  return {
    title,
    openGraph: { images: [`/s/${params.shortCode}/opengraph-image`] },
    twitter: { card: "summary_large_image", images: [`/s/${params.shortCode}/opengraph-image`] },
  };
}

export default async function UnfurlPage({ params }: { params: { shortCode: string } }) {
  const db = (await clientPromise).db(process.env.DB_NAME || undefined);
  await db.collection("share_cards").updateOne({ shortCode: params.shortCode }, { $inc: { views: 1 } });

  const card = await getCard(params.shortCode);
  const session = await getAuthSession();
  let isInvited = false;
  if (session?.user?.email) {
    await connectToDB();
    const user = await Users.findOne({ email: session.user.email }).lean();
    isInvited = (user as any)?.isInvited === true;
  }

  if (isInvited) {
    if (card?.type === "winner" && (card.payload as any)?.marketId) redirect(`/markets/${(card.payload as any).marketId}`);
    if (card?.type === "tournament" && (card.payload as any)?.tournamentId) redirect(`/tournaments/${(card.payload as any).tournamentId}`);
    redirect("/app");
  }

  const ref = (card?.payload as any)?.referralCode || "";
  redirect(`/?ref=${ref}&from=${params.shortCode}`);
}
```

**Step 2: Commit** `git commit -m "feat(share): /s/:shortCode unfurl redirect + view tracking"`

---

### Task 4.3: (Merged into 3.7 — welcome card creation handled by `/api/share/welcome`.) No-op task.

---

### Task 4.4: Winner card hook in `cron/settle-markets`

**Files:**
- Modify: `src/app/api/cron/settle-markets/route.ts`

**Step 1: Locate the block where a winning position is flipped to `RESOLVED` with payout > 0.**

**Step 2: Add side-effect** (for non-virtual wins ≥ $10):

```ts
if (!isVirtual && payout >= 10 && user) {
  const { ShareCard } = await import("@/models/shareCard.model");
  const { generateShortCode } = await import("@/lib/waitlist/codes");
  let shortCode = generateShortCode();
  for (let i = 0; i < 5 && (await ShareCard.findOne({ shortCode })); i++) shortCode = generateShortCode();
  await ShareCard.create({
    userId: user._id,
    type: "winner",
    payload: {
      payout,
      pick: position.outcome,
      marketId: market._id.toString(),
      marketTitle: market.title,
      username: user.username,
      referralCode: user.referralCode,
    },
    shortCode,
  }).catch((err: any) => console.error("winner share card:", err));
}
```

**Step 3: Commit** `git commit -m "feat(share): create winner share cards on settle"`

---

### Task 4.5: Tournament finish card

**Files:**
- Modify: wherever `computeTournamentResults`/finalize lives (audit before editing)

**Step 1: Locate finalization point**

Run: `rg -n "computeTournamentResults|finalizeTournament" src/ --type ts | head -20`

**Step 2: After final standings are written, for each top-10 placement create a ShareCard:**

```ts
const { ShareCard } = await import("@/models/shareCard.model");
const { generateShortCode } = await import("@/lib/waitlist/codes");
for (const p of standings.slice(0, 10)) {
  let shortCode = generateShortCode();
  for (let i = 0; i < 5 && (await ShareCard.findOne({ shortCode })); i++) shortCode = generateShortCode();
  await ShareCard.create({
    userId: p.userId,
    type: "tournament",
    payload: {
      placement: p.rank,
      accuracy: p.accuracy,
      tournamentId: tournament._id.toString(),
      tournamentName: tournament.name,
      username: p.username,
      referralCode: p.referralCode,
    },
    shortCode,
  }).catch(() => {});
}
```

**Step 3: Commit** `git commit -m "feat(share): tournament-finish share cards for top 10"`

---

## Phase 5 — Migration + launch

### Task 5.1: Founder bootstrap API

**Files:**
- Create: `src/app/api/admin/bootstrap-founders/route.ts`

**Step 1: Implement (idempotent, internal-secret guarded)**

```ts
// src/app/api/admin/bootstrap-founders/route.ts
import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongoose";
import Users from "@/models/user.model";
import { generateReferralCode } from "@/lib/waitlist/codes";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (req.headers.get("x-internal-secret") !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectToDB();
  const existing = await Users.countDocuments({ badges: "founder" });
  if (existing > 0) {
    return NextResponse.json({ error: "Already bootstrapped", founders: existing }, { status: 409 });
  }

  const users = await Users.find({}).lean();
  let updated = 0;
  for (const u of users) {
    let code = generateReferralCode();
    for (let i = 0; i < 5 && (await Users.findOne({ referralCode: code })); i++) code = generateReferralCode();
    await Users.updateOne({ _id: u._id }, {
      $set: { isInvited: true, invitedVia: "founding", badges: ["founder"], referralCode: code },
    });
    updated++;
  }
  return NextResponse.json({ ok: true, updated });
}
```

**Step 2: Commit** `git commit -m "feat(waitlist): founder bootstrap API (idempotent)"`

---

### Task 5.2: Staging seed script

**Files:**
- Create: `scripts/seed-waitlist-staging.ts`
- Modify: `package.json` (add script)

**Step 1: Implement**

```ts
// scripts/seed-waitlist-staging.ts
import "dotenv/config";
import connectToDB from "../src/lib/mongoose";
import { WaitlistEntry } from "../src/models/waitlistEntry.model";
import { generateReferralCode, hashIp } from "../src/lib/waitlist/codes";

async function main() {
  if (process.env.NODE_ENV === "production") throw new Error("Do not run against production");
  await connectToDB();
  const existing = await WaitlistEntry.countDocuments();
  if (existing > 0) { console.log(`Already has ${existing} entries. Skipping.`); return process.exit(0); }

  for (let i = 0; i < 50; i++) {
    const code = generateReferralCode();
    await WaitlistEntry.create({
      email: `seed-${i}-${Date.now()}@example.com`,
      referralCode: code,
      ipHash: hashIp(`10.0.0.${i}`, process.env.WAITLIST_IP_SALT || "salt"),
      verifiedAt: i % 3 === 0 ? new Date() : null,
      utm: { source: ["twitter", "reddit", "email", "direct"][i % 4] },
    });
  }
  console.log("Seeded 50 entries");
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
```

**Step 2: Add to package.json scripts:**
```json
"db:seed-waitlist": "ts-node --project tsconfig.json scripts/seed-waitlist-staging.ts"
```

**Step 3: Commit** `git commit -m "chore(waitlist): staging seed script (50 fake entries)"`

---

### Task 5.3: Playwright E2E — 3 gate states

**Files:**
- Create: `e2e/gate-three-states.spec.ts`
- Create: `e2e/helpers/fixtures.ts`

**Step 1: Implement fixture helper**

```ts
// e2e/helpers/fixtures.ts
import type { APIRequestContext } from "@playwright/test";

export async function signupOnWaitlist(request: APIRequestContext, email?: string) {
  const e = email || `e2e-${Date.now()}-${Math.random()}@example.com`;
  const r = await request.post("/api/waitlist/signup", { data: { email: e } });
  return { email: e, ...(await r.json()) };
}
```

**Step 2: Three-state tests**

```ts
// e2e/gate-three-states.spec.ts
import { test, expect } from "@playwright/test";
import { signupOnWaitlist } from "./helpers/fixtures";

test.describe("gate states", () => {
  test("state A: cold visitor sees hero + cohort + blurred", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("gate-cold")).toBeVisible();
    await expect(page.getByTestId("cohort-counter")).toBeVisible();
    await expect(page.getByTestId("blurred-cards")).toBeVisible();
  });

  test("state B: waitlisted user via API seed", async ({ request }) => {
    const { referralCode, position } = await signupOnWaitlist(request);
    const me = await (await request.get(`/api/waitlist/me?referralCode=${referralCode}`)).json();
    expect(me.position).toBe(position);
  });

  // state C (invited → /app) covered by middleware-gate.spec.ts with seeded founder account.
});
```

**Step 3: Commit** `git commit -m "test(waitlist): e2e for 3 gate states"`

---

### Task 5.4: Pre-launch smoke checklist

Manual, tracked in this document. Check each before flipping `LAUNCH_GATE_ENABLED=true`:

- [ ] `LAUNCH_GATE_ENABLED=false` in prod until T-0
- [ ] `WAITLIST_IP_SALT` set in Amplify env (32-char random)
- [ ] `INTERNAL_API_SECRET` shared with admin repo (rotation plan documented)
- [ ] `/api/admin/bootstrap-founders` runs cleanly in staging, refuses second run
- [ ] Staging: cold gate loads in < 2s, LCP < 2.5s (Playwright + `playwright` MCP audit)
- [ ] Staging: signup flow — email field accepts, disposable blocks, dupe dedupes gracefully
- [ ] Staging: verify flow bumps referrer's position by 10
- [ ] Staging: non-invited user hitting `/app` while `LAUNCH_GATE_ENABLED=true` gets rewritten to `/`
- [ ] Staging: OG image renders for a seeded share card (Playwright request check `image/png`)
- [ ] Legal pages still reachable (`/privacy`, `/terms`)
- [ ] Admin repo deployed with `/admin/waitlist/*` routes per handoff doc

---

## Rollback

```
# Amplify console → environment variables → set LAUNCH_GATE_ENABLED=false → redeploy
```

Middleware no-ops when disabled; existing users keep browsing. Data is preserved.

---

## Execution handoff

Plan complete and saved to `docs/plans/2026-04-22-invite-waitlist-launch-plan.md`. Two execution options:

1. **Subagent-Driven (this session)** — I dispatch a fresh subagent per task, review between tasks, fast iteration. Good for Phase 0 + Phase 1 (tight dependencies, lots of model work) and Phase 5 (migration/smoke).

2. **Parallel Session (separate)** — Open new sessions per phase in the worktree, batch execution with checkpoints. Good for Phase 2 + Phase 3 + Phase 4 once data layer lands (5–6 workers can fan out cleanly).

**Recommended:** Subagent-Driven through Phase 0–1, Parallel Sessions for Phase 2–4, Subagent-Driven again for Phase 5.

**Which approach?**
