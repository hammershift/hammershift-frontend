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
- Modify: `.env.local.example` (the repo's canonical env template)
- Modify: `amplify.yml` (preBuild echo block)
- Create: `src/types/svg.d.ts`

**Step 1: Append env vars to `.env.local.example` (at the bottom, under a new section header)**

```
# ============================================
# Invite-only launch
# ============================================
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
git add .env.local.example amplify.yml src/types/svg.d.ts
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
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
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
  models.WaitlistEntry || model<WaitlistEntryDoc>("WaitlistEntry", waitlistEntrySchema);
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
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
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
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
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
  models.ShareCard || model<ShareCardDoc>("ShareCard", shareCardSchema);
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
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
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
import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import nodemailer from "nodemailer";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(
    new Uint8Array(Buffer.from(a)),
    new Uint8Array(Buffer.from(b))
  );
}

export async function POST(req: Request) {
  const secret = req.headers.get("x-internal-secret") ?? "";
  const expected = process.env.INTERNAL_API_SECRET ?? "";
  if (!secret || !expected || !secureCompare(secret, expected)) {
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

  const rawToken = randomUUID().replace(/-/g, "");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const url = `${process.env.NEXTAUTH_URL}/api/auth/callback/email?email=${encodeURIComponent(email)}&token=${rawToken}`;

  // NextAuth's EmailProvider stores sha256(token + NEXTAUTH_SECRET) in the
  // verification_tokens collection and hashes the URL token the same way
  // before lookup on callback. The raw token must appear in the email URL,
  // but the hashed token is what gets persisted.
  const hashedToken = createHash("sha256")
    .update(`${rawToken}${process.env.NEXTAUTH_SECRET!}`)
    .digest("hex");

  const client = await clientPromise;
  const db = client.db(process.env.DB_NAME || undefined);
  await db.collection("verification_tokens").insertOne({
    identifier: email,
    token: hashedToken,
    expires,
  });

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

export async function GET() {
  await connectToDB();
  const [founding, waitlist] = await Promise.all([
    Users.countDocuments({ invitedVia: "founding" }),
    WaitlistEntry.countDocuments({ flaggedAt: null }),
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
    const user = await Users.findOne({ email: session.user.email })
      .lean<{ isInvited?: boolean } | null>();
    if (user?.isInvited) redirect("/app");
    return <GatePageClient mode="waitlisted" email={session.user.email} />;
  }
  return <GatePageClient mode="cold" />;
}
```

```tsx
// src/app/components/waitlist/GatePageClient.tsx
"use client";
interface Props { mode: "cold" | "waitlisted"; email?: string; }
export default function GatePageClient({ mode, email }: Props) {
  return (
    <section className="min-h-screen bg-[#0A0A1A] text-white flex items-center justify-center p-6">
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
    </section>
  );
}
```

**Step 2: E2E**

```ts
// e2e/gate-shell.spec.ts
import { test, expect } from "@playwright/test";

test.use({ storageState: { cookies: [], origins: [] } });

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

type CohortState = { claimed: number; cap: number };

function parseCohort(data: unknown): CohortState | null {
  if (typeof data !== "object" || data === null) return null;
  const d = data as Record<string, unknown>;
  if (typeof d.claimed !== "number" || typeof d.cap !== "number") return null;
  return { claimed: d.claimed, cap: d.cap };
}

export default function CohortCounter() {
  const [state, setState] = useState<CohortState | null>(null);
  useEffect(() => {
    fetch("/api/waitlist/cohort")
      .then((r) => r.json() as Promise<unknown>)
      .then((data) => setState(parseCohort(data)))
      .catch(() => {});
  }, []);
  if (!state) return null;
  const pct = Math.min(100, (state.claimed / state.cap) * 100);
  return (
    <div className="mt-3 text-sm" data-testid="cohort-counter">
      <div className="flex justify-between text-gray-400 mb-1">
        <span className="font-mono">{state.claimed}</span>
        <span className="font-mono">/ {state.cap} spots claimed</span>
      </div>
      <div
        role="progressbar"
        aria-label="Founding cohort spots claimed"
        aria-valuenow={state.claimed}
        aria-valuemin={0}
        aria-valuemax={state.cap}
        className="h-1 bg-[#1E2A36] rounded overflow-hidden"
      >
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

> Notes: (a) `revalidate` dropped — `force-dynamic` already opts the route out of fetch/data caches in Next 14, and `force-dynamic` is required for AWS Amplify deploys (see MEMORY.md). Same decision as Task 2.5 cohort route. (b) Wrapped in `try/catch` that returns `{ markets: [] }` on error — matches the waitlist surface's fail-closed-quiet pattern (`src/app/api/waitlist/signup/route.ts:83-86`). (c) `imageUrl` dropped from projection — was unused dead code per CLAUDE.md.

```ts
// src/app/api/waitlist/sample-markets/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = (await clientPromise).db(process.env.DB_NAME || undefined);
    const markets = await db
      .collection("polygon_markets")
      .find({ status: "OPEN", closesAt: { $gt: new Date() } })
      .sort({ totalVolume: -1 })
      .limit(4)
      .project({ title: 1, yesPrice: 1, noPrice: 1, closesAt: 1 })
      .toArray();
    return NextResponse.json({ markets });
  } catch (err) {
    console.error("waitlist/sample-markets:", err);
    return NextResponse.json({ markets: [] });
  }
}
```

**Step 2: Implement component**

> Note: `any` replaced with a typed `MarketCard[]` + `unknown`-narrowing parser (CLAUDE.md forbids `any`; mirrors CohortCounter's pattern). `aria-hidden="true"` added to the wrapper — cards are decorative (blurred, occluded, `pointer-events-none`) so they are hidden from assistive tech per WCAG 2.2 AA. The `data-testid` stays for Playwright.

```tsx
// src/app/components/waitlist/BlurredSampleCards.tsx
"use client";
import { useEffect, useState } from "react";

type MarketCard = {
  _id: string;
  title: string;
  yesPrice?: number;
  noPrice?: number;
};

function parseMarkets(data: unknown): MarketCard[] {
  if (typeof data !== "object" || data === null) return [];
  const d = data as Record<string, unknown>;
  if (!Array.isArray(d.markets)) return [];
  const out: MarketCard[] = [];
  for (const raw of d.markets) {
    if (typeof raw !== "object" || raw === null) continue;
    const m = raw as Record<string, unknown>;
    if (typeof m._id === "undefined") continue;
    out.push({
      _id: String(m._id),
      title: typeof m.title === "string" ? m.title : "",
      yesPrice: typeof m.yesPrice === "number" ? m.yesPrice : undefined,
      noPrice: typeof m.noPrice === "number" ? m.noPrice : undefined,
    });
  }
  return out;
}

export default function BlurredSampleCards() {
  const [markets, setMarkets] = useState<MarketCard[]>([]);
  useEffect(() => {
    fetch("/api/waitlist/sample-markets")
      .then((r) => r.json() as Promise<unknown>)
      .then((d) => setMarkets(parseMarkets(d)))
      .catch(() => {});
  }, []);
  if (!markets.length) return null;
  return (
    <div
      aria-hidden="true"
      className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-10 select-none pointer-events-none"
      data-testid="blurred-cards"
    >
      {markets.map((m) => (
        <div
          key={m._id}
          className="relative bg-[#13202D] border border-[#1E2A36] rounded-lg overflow-hidden"
        >
          <div className="aspect-video bg-gray-800" />
          <div className="p-3 blur-sm">
            <div className="text-xs text-gray-400 truncate">{m.title}</div>
            <div className="mt-2 flex gap-2 font-mono text-sm">
              <span className="text-[#00D4AA]">YES {Math.round((m.yesPrice ?? 0.5) * 100)}%</span>
              <span className="text-[#E94560]">NO {Math.round((m.noPrice ?? 0.5) * 100)}%</span>
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
- Modify: `src/app/styles/globals.css` (append `@keyframes ticker`)
- Modify: `src/app/components/waitlist/GatePageClient.tsx` (cold branch only)
- Modify: `e2e/gate-shell.spec.ts` (append ticker visibility test)

**Step 1: Implement route**

> Notes: (a) `revalidate = 300` dropped — `force-dynamic` already opts the route out of fetch/data caches in Next 14, and `force-dynamic` is required for AWS Amplify deploys (see MEMORY.md). Same decision as Task 2.5 cohort route and Task 3.4 sample-markets route. (b) `$match.status` changed from `"RESOLVED"` to `"SETTLED"` — verified by reading `src/app/api/cron/settle-markets/route.ts:255,272-275`: winning positions are written with `status: "SETTLED"`, `payout: netPayout`. Losing positions also get `"SETTLED"` with `payout: 0` (already excluded by `payout > 10`). Refunds use `"REFUNDED"`. `"RESOLVED"` is never written in this repo. (c) Wrapped in `try/catch` that returns `{ winners: [] }` on error — matches the waitlist surface's fail-closed-quiet pattern (`src/app/api/waitlist/signup/route.ts:83-86`).

```ts
// src/app/api/waitlist/recent-winners/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = (await clientPromise).db(process.env.DB_NAME || undefined);
    const rows = await db
      .collection("polygon_positions")
      .aggregate([
        { $match: { status: "SETTLED", payout: { $gt: 10 }, isVirtual: { $ne: true } } },
        { $sort: { settledAt: -1 } },
        { $limit: 20 },
        { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
        { $lookup: { from: "polygon_markets", localField: "marketId", foreignField: "_id", as: "market" } },
        {
          $project: {
            payout: 1,
            settledAt: 1,
            username: { $arrayElemAt: ["$user.username", 0] },
            marketTitle: { $arrayElemAt: ["$market.title", 0] },
          },
        },
      ])
      .toArray();
    return NextResponse.json({ winners: rows });
  } catch (err) {
    console.error("waitlist/recent-winners:", err);
    return NextResponse.json({ winners: [] });
  }
}
```

**Step 2: Implement component**

> Notes: (a) `any` replaced with typed `Winner[]` + `unknown`-narrowing parser (CLAUDE.md forbids `any`; mirrors CohortCounter / BlurredSampleCards). Parser defaults `username` to `"user"` when missing or blank, so the JSX drops the `{w.username || "user"}` fallback. (b) `motion-reduce:animate-none` added to the marquee — a continuous scroll violates WCAG 2.2 AA for users with `prefers-reduced-motion: reduce`; they see a static list instead. (c) `aria-label="Recent winners"` on the outer container and the visual `doubled` array replaced with two explicit maps — the first exposed to AT, the second `aria-hidden="true"` — so screen readers announce each winner once instead of twice.

```tsx
// src/app/components/waitlist/WinnersTicker.tsx
"use client";
import { useEffect, useState } from "react";

type Winner = { payout: number; username: string; marketTitle: string };

function parseWinners(data: unknown): Winner[] {
  if (typeof data !== "object" || data === null) return [];
  const d = data as Record<string, unknown>;
  if (!Array.isArray(d.winners)) return [];
  const out: Winner[] = [];
  for (const raw of d.winners) {
    if (typeof raw !== "object" || raw === null) continue;
    const w = raw as Record<string, unknown>;
    if (typeof w.payout !== "number") continue;
    out.push({
      payout: w.payout,
      username: typeof w.username === "string" && w.username ? w.username : "user",
      marketTitle: typeof w.marketTitle === "string" ? w.marketTitle : "",
    });
  }
  return out;
}

export default function WinnersTicker() {
  const [winners, setWinners] = useState<Winner[]>([]);
  useEffect(() => {
    fetch("/api/waitlist/recent-winners")
      .then((r) => r.json() as Promise<unknown>)
      .then((d) => setWinners(parseWinners(d)))
      .catch(() => {});
  }, []);
  if (!winners.length) return null;
  return (
    <div
      aria-label="Recent winners"
      className="overflow-hidden mt-12 py-4 border-y border-[#1E2A36]"
      data-testid="winners-ticker"
    >
      <div className="flex gap-8 animate-[ticker_60s_linear_infinite] motion-reduce:animate-none whitespace-nowrap">
        {winners.map((w, i) => (
          <div key={`a-${i}`} className="flex items-center gap-2 text-sm text-gray-300">
            <span className="text-[#00D4AA] font-mono">+${Math.round(w.payout)}</span>
            <span className="text-gray-500">{w.username} on</span>
            <span className="text-gray-300 truncate max-w-xs">{w.marketTitle}</span>
          </div>
        ))}
        {winners.map((w, i) => (
          <div
            key={`b-${i}`}
            aria-hidden="true"
            className="flex items-center gap-2 text-sm text-gray-300"
          >
            <span className="text-[#00D4AA] font-mono">+${Math.round(w.payout)}</span>
            <span className="text-gray-500">{w.username} on</span>
            <span className="text-gray-300 truncate max-w-xs">{w.marketTitle}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

Append to `src/app/styles/globals.css`:
```css
/* Winners ticker marquee — used by WinnersTicker.tsx */
@keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
```

**Step 3: E2E** — component returns `null` when the winners array is empty, so the testid is absent. The test probes the API first and skips when the staging DB has no settled winners > $10.

```ts
test("winners ticker renders when there are winners", async ({ page, request }) => {
  const r = await request.get("/api/waitlist/recent-winners");
  const body = await r.json();
  test.skip(!body.winners || body.winners.length === 0, "no settled winners in this db");
  await page.goto("/");
  await expect(page.getByTestId("winners-ticker")).toBeVisible();
});
```

**Step 4: Wire into `GatePageClient`** — mount below `<BlurredSampleCards />` inside `data-testid="gate-cold"` only. Waitlisted branch untouched.

**Step 5: Commit** `git commit -m "feat(gate): WinnersTicker marquee"`

---

### Task 3.6: `WaitlistDashboard` (logged-in + waitlisted)

**Files:**
- Create: `src/app/components/waitlist/WaitlistDashboard.tsx`
- Modify: `src/lib/auth.ts` (add `referralCode` + `isInvited` to JWT + session)
- Modify: `src/app/types/next-auth.d.ts` (extend `Session.user` + `JWT` module augmentation)
- Modify: `src/app/components/waitlist/GatePageClient.tsx` (extend Props, mount dashboard in waitlisted branch)
- Modify: `src/app/page.tsx` (widen lean generic, pass `referralCode` down)

> Notes: (a) Plan originally named `userTypes.ts` — the actual next-auth module augmentation lives in `src/app/types/next-auth.d.ts`. Corrected. (b) Because the `.d.ts` is extended, the session callback needs no `as boolean | undefined` / `as string | undefined` casts — dropped. (c) Plan's `useState<any>`-leaking fetch replaced with unknown+narrow parser (CLAUDE.md forbids `any`; mirrors CohortCounter, BlurredSampleCards, WinnersTicker). (d) Added `cancelled` flag to kill the post-unmount `setMe` race. (e) WCAG 2.2 AA: `<input>` and Copy `<button>` got `aria-label`s; button has `type="button"`; copy action swaps to "Copied" for 1.5s and announces via `aria-live="polite"` on a visually-hidden span. (f) `GatePageClient` waitlisted branch now renders `<WaitlistDashboard />` when `referralCode` is present, falling back to email-only text for legacy users without one. E2E for the dashboard lives in Task 5.3 (authenticated waitlisted session).

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

function parseMe(data: unknown): Me | null {
  if (typeof data !== "object" || data === null) return null;
  const d = data as Record<string, unknown>;
  if (typeof d.referralCode !== "string") return null;
  if (typeof d.position !== "number") return null;
  if (typeof d.verifiedReferrals !== "number") return null;
  if (typeof d.pendingReferrals !== "number") return null;
  return {
    referralCode: d.referralCode,
    position: d.position,
    verifiedReferrals: d.verifiedReferrals,
    pendingReferrals: d.pendingReferrals,
  };
}

export default function WaitlistDashboard({ referralCode }: { referralCode: string }) {
  const [me, setMe] = useState<Me | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchMe = () =>
      fetch(`/api/waitlist/me?referralCode=${referralCode}`)
        .then((r) => r.json() as Promise<unknown>)
        .then((d) => {
          if (!cancelled) setMe(parseMe(d));
        })
        .catch(() => {});
    fetchMe();
    const id = setInterval(fetchMe, 20_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [referralCode]);

  if (!me) return <div className="text-gray-400">Loading…</div>;

  const shareUrl =
    typeof window !== "undefined" ? `${window.location.origin}/?ref=${me.referralCode}` : "";

  const handleCopy = () => {
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {});
  };

  return (
    <div data-testid="waitlist-dashboard" className="max-w-xl">
      <div className="font-mono text-7xl text-[#E94560] mb-2">#{me.position}</div>
      <p className="text-gray-300 mb-6">Share to move up. Every verified friend = 10 spots closer.</p>
      <div className="flex gap-2 mb-4">
        <input
          readOnly
          value={shareUrl}
          aria-label="Your share link"
          className="flex-1 bg-[#13202D] border border-[#1E2A36] px-3 py-2 rounded text-sm font-mono"
        />
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy share link"
          className="bg-[#E94560] px-4 py-2 rounded text-sm font-semibold"
        >
          {copied ? "Copied" : "Copy"}
        </button>
        <span className="sr-only" aria-live="polite">
          {copied ? "Share link copied" : ""}
        </span>
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

**Step 2: Extend `src/app/types/next-auth.d.ts`** — add to BOTH `Session.user` and `JWT` interfaces:
```ts
isInvited?: boolean;
referralCode?: string;
```

**Step 3: Extend JWT + session callbacks in `src/lib/auth.ts`** — inside `if (dbUser) {` block of `jwt` add:
```ts
token.isInvited = dbUser.isInvited === true;
token.referralCode = dbUser.referralCode;
```

Session callback (no casts — types are augmented):
```ts
session.user.isInvited = token.isInvited;
session.user.referralCode = token.referralCode;
```

**Step 4: Mount inside `GatePageClient` waitlisted branch** — extend `Props` with `referralCode?: string`; when present render `<WaitlistDashboard referralCode={referralCode} />` inside `data-testid="gate-waitlisted"`, otherwise keep the existing email-only fallback for legacy users.

**Step 5: Pass `referralCode` from `src/app/page.tsx`** — widen the lean generic to include `referralCode?: string`, pass through to the waitlisted mount.

**Step 6: Commit** `git commit -m "feat(gate): WaitlistDashboard + session isInvited/referralCode"`

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

**Deploy note (race-safe idempotency):** ShareCard now has a partial unique index on `(userId, type)` filtered to `type: "welcome"`. Prod typically disables Mongoose `autoIndex`. Before traffic hits `/api/share/welcome`, run `ShareCard.syncIndexes()` or equivalent migration to build the index — otherwise concurrent POSTs can still double-create welcome cards.

**Implementation deviations from plan text (all approved):**
- Added `user.isInvited === true` guard on the share route (403 otherwise) — security hardening the plan omitted.
- Wrapped route in try/catch with fail-closed-quiet (500 on any unexpected error).
- On 11000 duplicate-key in `ShareCard.create`, re-read `(userId, type: "welcome")` and return its shortCode (race-safe idempotency).
- `parseWelcome(data: unknown)` narrow parser on the client — no `any` per CLAUDE.md.
- Modal guards `navigator.clipboard` for non-secure contexts, sets `vm_welcome_shown` on ALL exit paths (Copy, Start predicting, Not now, backdrop, Esc).
- Full WCAG 2.2 AA focus management: initial focus into dialog, Tab/Shift+Tab trap, focus restore to previously-focused element on dismiss, Esc + click-outside close.
- `next/image` with `unoptimized` (dynamic PNG) instead of raw `<img>` per global CLAUDE.md.
- `handleStart` is now just `dismiss()` — no `router.push("/app")` (modal is already mounted on /app; nav would be a no-op).
- `.lean<LeanUser>()` on user findById — skip full Mongoose hydration.

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

**Implementation deviations from plan text (all approved):**
- Drop `(token as any).isInvited` cast — `next-auth/jwt` `JWT` type is augmented with `isInvited?: boolean`, so `token?.isInvited === true` is type-safe.
- Allowlist broadened from plan: add `/api/stripe` (checkout/onramp), `/api/webhook` (Stripe webhook, external origin), `/api/cron` (header-authed), `/api/health`, `/api/og`. Drop `/legal`, `/privacy`, `/terms`, `/og` (routes don't exist). Add real legal routes `/privacy_policy` and `/terms_of_service`.
- Matcher broadened to also exclude fonts (`woff|woff2|ttf|otf|eot`), `css`, `js`, `map`, `txt`, `xml`, `json`, `webmanifest`, `gif` — protects `public/manifest.json`, `public/fonts/*`, static assets.
- `LAUNCH_GATE_ENABLED` normalized case-insensitively at module scope: `/^(1|true|on|yes)$/i`.
- Explicit `NEXTAUTH_SECRET` guard AFTER allowlist short-circuits (prevents phantom-gate on misconfig; allowlisted routes still work).
- `gated` param value preserves full original URL (`pathname + req.nextUrl.search`) so the gate landing can reconstruct `/markets?utm_source=x` after invite.
- E2E uses per-test inline `test.skip(condition, reason)` (idiomatic Playwright), and asserts `toHaveURL(/\/app(\?|$)/)` to lock in rewrite (not redirect) semantics. Does NOT assert the `gated` param — rewrite keeps the URL bar at the original path; `gated` only exists server-side.

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

**Implementation deviations (approved during build):**
- Removed `any` on card components — plan had `({ card }: any)`. Replaced with `{ payload: Record<string, unknown> }` + `str()` / `num()` / `getPayload()` narrow helpers. Reason: CLAUDE.md forbids `any`.
- `params` typed as `Promise<{ shortCode: string }>` + awaited. Reason: Next.js 15 params are async.
- Added `runtime = "nodejs"` explicitly. Reason: mongodb driver requires node runtime.
- Added explicit cache-control headers: success paths get `public, immutable, no-transform, max-age=300, s-maxage=86400, stale-while-revalidate=604800`; fallback gets `public, max-age=60`. Reason: scrapers cache aggressively; short browser TTL keeps own previews fresh; short fallback TTL lets a missing card become real quickly.
- TournamentCard accuracy: normalize fraction-or-percent payload, clamp to `[0, 100]`. Reason: defensive against bad payloads breaking layout.
- WinnerCard marketTitle: `whiteSpace: nowrap` + `textOverflow: ellipsis`. Reason: prevent overflow on long titles.
- E2E `TEST_BASE_URL` defaults to `http://localhost:3000` (not production). Reason: E2E should hit the dev/staging server by default; opt-in to prod.

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

**Implementation deviations (approved during build):**
- `params` typed as `Promise<...>` + awaited. Reason: Next.js 15 async params.
- No `any` anywhere — `str` / `num` / `asPayload` narrow helpers replace `(payload as any)?.foo`. Reason: CLAUDE.md rule.
- Routes corrected: `/markets/[slug]` + `/tournaments/[tournament_id]`, reading `marketSlug` and `tournamentId` from payload. Plan had `marketId`/`tournamentId` with wrong paths. Reason: verified actual routes on disk.
- Single Mongo round-trip: `findOneAndUpdate` with `returnDocument: "before"` reads the card AND `$inc`s `views` atomically. Wrapped in `React.cache()` so `generateMetadata` and the page share one DB call per request. Reason: eliminates the plan's separate `updateOne` + `findOne` pair.
- Card load and invited-check run in `Promise.all`. Reason: independent, no reason to serialize.
- All redirect branches use `return redirect(...)`. Reason: defensive — if a future refactor replaces `redirect()` with something that doesn't throw, control can't fall through.
- `shortCode` shape guard `/^[A-Za-z0-9_-]{4,32}$/` short-circuits bot probes before any Mongo call. Reason: cheap defense.
- `userIsInvited` and `loadShareCard` both wrapped in try/catch → return safe defaults. Reason: fail-closed-quiet — scrapers never 500.
- `runtime = "nodejs"` explicit. Reason: MongoDB driver requires node runtime.
- Added Twitter `summary_large_image` card tags; description differentiated per card type. Reason: spec called for OG only, but Twitter unfurl uses the same pattern.

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

**Implementation deviations (approved during build):**
- Raw MongoDB driver used (`db.collection("share_cards").insertOne`) — not Mongoose's `ShareCard.create`. Reason: consistent with the rest of `settle-markets/route.ts`, no `connectToDB()` required.
- Placed as `§3d` at the END of the `positionsFailed === 0 && mode === "normal"` block. Reason: only create cards for cleanly settled markets; runs after streak/email side-effects.
- Per-user aggregation via `polygon_positions.aggregate` on `{ status: "SETTLED", outcome: winningOutcome, isVirtual: { $ne: true } }` + `$group` by `userId` + `$match { totalPayout: { $gte: 10 } }`. Reason: one card per (user, market) regardless of how many winning positions; aggregation covers retries across multiple cron runs.
- Dedupe via `findOne({ userId, type: "winner", "payload.marketId": hex })` before insert. Reason: winner cards have no compound unique index.
- `marketSlug` derived from `toSlug(market.title)` — NOT `market.auction?.title`. Reason: `polygon_markets` has no nested `auction` subdoc at rest; `title` is denormalized from `auction.title` at market-creation time (see `cron/create-markets`), so `toSlug(market.title)` produces the same slug the `/markets/[slug]` reader resolves via `toSlug(m.auction.title)` post-lookup.
- shortCode insert wrapped in 5-attempt retry that regenerates on E11000 duplicate-key (and only when `keyPattern` is `shortCode`). Reason: schema-level unique index on shortCode means a race past the preflight check can still 11000; regenerate rather than permanently lose the card.
- Payout rounded to 2dp (`Math.round(x * 100) / 100`). Reason: cleaner payload, mirrors display rounding.
- No `any` — all driver reads narrowed via `as T | undefined ?? default`.
- Deferred: bulk find/insert N+1 optimization, aggregation short-circuit on empty, log on username-missing skip. Reason: matches existing sequential-per-user style in this file; winner counts are low at current scale.

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
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
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
