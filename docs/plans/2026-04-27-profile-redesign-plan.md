# Profile Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the tabbed `/profile` mega-page with a bento-grid hub, plus four spoke routes (predictions, tournaments, cards, settings). Adds one new API (`/api/profile/cards`) and a permanent home for share cards.

**Architecture:** Hub-and-spoke. `/profile` becomes a server-rendered bento page with a hero and 5 self-contained tiles fetching from existing APIs. Each tile shows an abridged view + "View all →" link to a dedicated spoke route. The single new endpoint reads `share_cards` collection by `userId`. No DB migrations, no env-var changes.

**Tech Stack:** Next.js 15 App Router, TypeScript 5.2, Tailwind 3.3, NextAuth 4.24, Mongoose 7.6, Radix UI, Lucide icons, JetBrains Mono for numbers, Inter for body. Playwright for e2e, Vitest for unit tests where useful.

**Reference docs in repo:**
- Design doc: `docs/plans/2026-04-27-profile-redesign-design.md`
- Design tokens: see `CLAUDE.md` (#0A0A1A bg, #13202D card, #1E2A36 border, #E94560 accent, #00D4AA success, #FFB547 amber)
- Existing components to reuse: `src/app/components/PredictionsCard.tsx`, `CompletedPredictionCard.tsx`, `BadgeDisplay.tsx`, `StreakIndicator.tsx`, `AnimatedCounter.tsx`
- Existing APIs: `/api/profile`, `/api/myPredictions`, `/api/wallet`, `/api/notifications/preferences`
- Hero photo: `public/images/gate/hero-sonoma-sunset.jpg` (already real JPEG after PR #349 fix)

**Critical gotchas (learned this session, do NOT regress):**
- **Satori (next/og):** every `<div>` with multiple children must declare `display: "flex"`. `<div>@{username}</div>` compiles to two children and crashes. Use template literals: `` <div>{`@${username}`}</div> ``
- **next/image assets:** if a `.jpg` or `.png` is actually WebP bytes (check with `file path/to/img.jpg`), Satori will throw `RangeError: Offset is outside the bounds of the DataView`. Re-encode with `sips -s format jpeg path --out path`. The hero + lockup were fixed in PR #349 — don't re-introduce WebPs.
- **API routes:** all need `export const dynamic = "force-dynamic";` to prevent Amplify build-time pre-rendering.
- **Auth:** `getServerSession(authOptions)` from `@/lib/auth`. Mongoose query: `await connectToDB()` then `Users.findOne({ email })`.

---

## Phase 0 — Setup

### Task 0.1: Verify baseline

**Files:** none modified

**Step 1: Confirm clean state on a fresh branch off origin/main**

```bash
git fetch origin
git checkout -b feat/profile-redesign origin/main
git status
```

Expected: clean working tree on new branch tracking `origin/main`.

**Step 2: Confirm typecheck passes before any changes**

```bash
npx tsc --noEmit -p tsconfig.json
```

Expected: exit 0, no errors. If errors exist, stop and surface to user — they're pre-existing and outside this scope.

**Step 3: Read existing `/profile` to understand reusable patterns**

Read `src/app/(pages)/profile/page.tsx` end-to-end. Note:
- Which existing components are imported
- Which APIs are called and how data is shaped
- The 5-tab structure (Overview, Predictions, Tournaments, Settings)

No commit. This is reconnaissance.

---

## Phase 1 — Hub bento page

The hero + 5 tiles. After this phase, `/profile` shows the new design but spokes are linked-but-not-yet-built (they 404 until phases 2–5 land).

### Task 1.1: ProfileHero component skeleton

**Files:**
- Create: `src/app/components/profile/ProfileHero.tsx`

**Purpose:** wide card spanning the page with photo backdrop, avatar, identity, stat stripe.

**Step 1: Write the failing e2e (visual-only smoke)**

Add to a new file `e2e/profile-hub.spec.ts`:

```ts
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
```

**Step 2: Run test to verify it fails (or skips cleanly)**

```bash
npx playwright test e2e/profile-hub.spec.ts
```

Expected: SKIP (no test cookie set in dev). That's fine — we want it to be runnable in staging where the cookie is provided.

**Step 3: Implement ProfileHero**

```tsx
// src/app/components/profile/ProfileHero.tsx
import Image from "next/image";
import Link from "next/link";

interface Props {
  displayName: string;
  handle: string;
  avatarUrl?: string;
  createdAt: Date | string;
  stats: {
    predictions: number;
    accuracyPct: number;
    streak: number;
    earningsUsd: number;
    rank: number | null;
  };
}

const HERO_BG = "/images/gate/hero-sonoma-sunset.jpg";

function fmtMonth(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((s) => s[0] ?? "").join("").toUpperCase() || "?";
}

export default function ProfileHero({ displayName, handle, avatarUrl, createdAt, stats }: Props) {
  return (
    <section
      data-testid="profile-hero"
      aria-label="Profile header"
      className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0A0A1A]"
    >
      <div className="absolute inset-0">
        <Image src={HERO_BG} alt="" fill priority sizes="100vw" className="object-cover opacity-25" />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, #0A0A1A 0%, rgba(10,10,26,0.85) 60%, rgba(10,10,26,0.5) 100%)",
          }}
        />
      </div>

      <div className="relative p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
          <div className="shrink-0">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={`${displayName} avatar`}
                width={96}
                height={96}
                className="rounded-full ring-2 ring-[#E94560]/40"
              />
            ) : (
              <div className="h-16 w-16 md:h-24 md:w-24 rounded-full bg-[#13202D] ring-2 ring-[#E94560]/40 flex items-center justify-center text-xl md:text-3xl font-bold text-white">
                {initials(displayName)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold text-white truncate">{displayName}</h1>
                <div className="mt-1 flex items-center gap-2 flex-wrap text-sm">
                  <span className="text-gray-300 font-mono">@{handle}</span>
                  <span aria-hidden className="text-gray-600">·</span>
                  <span className="inline-flex items-center font-mono uppercase tracking-[0.15em] text-xs px-2 py-0.5 rounded text-[#E94560] bg-[#E94560]/10 border border-[#E94560]/30">
                    Founding member
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-400">Founding member since {fmtMonth(createdAt)}</p>
              </div>
              <Link
                href="/profile/settings"
                className="shrink-0 text-sm text-gray-300 hover:text-white border border-white/[0.08] rounded-lg px-3 py-2 transition"
              >
                Edit profile →
              </Link>
            </div>
          </div>
        </div>

        <StatStripe stats={stats} />
      </div>
    </section>
  );
}

function StatStripe({ stats }: { stats: Props["stats"] }) {
  const cells = [
    { label: "Predictions", value: stats.predictions.toLocaleString() },
    { label: "Accuracy", value: `${Math.round(stats.accuracyPct)}%` },
    { label: "Streak", value: `${stats.streak}` },
    { label: "Earnings", value: `$${Math.round(stats.earningsUsd).toLocaleString()}` },
    { label: "Rank", value: stats.rank ? `#${stats.rank}` : "—" },
  ];
  return (
    <div
      data-testid="profile-stat-stripe"
      className="mt-6 md:mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-2 gap-y-4 border-t border-white/[0.06] pt-5"
    >
      {cells.map((c, i) => (
        <div
          key={c.label}
          className={`flex flex-col px-3 ${i > 0 ? "lg:border-l lg:border-white/[0.06]" : ""}`}
        >
          <span className="font-mono text-2xl md:text-3xl text-white tabular-nums">{c.value}</span>
          <span className="mt-1 text-[11px] uppercase tracking-[0.15em] text-gray-500">{c.label}</span>
        </div>
      ))}
    </div>
  );
}
```

**Step 4: Verify typecheck**

```bash
npx tsc --noEmit -p tsconfig.json
```

Expected: exit 0.

**Step 5: Commit**

```bash
git add src/app/components/profile/ProfileHero.tsx e2e/profile-hub.spec.ts
git commit -m "feat(profile): hero component with avatar, identity, stat stripe"
```

---

### Task 1.2: Hub page skeleton with hero

**Files:**
- Modify: `src/app/(pages)/profile/page.tsx` (full replace — back up first by reading)
- Create: `src/app/(pages)/profile/loading.tsx`

**Step 1: Read the current `src/app/(pages)/profile/page.tsx` for the API call patterns** (no edit yet)

**Step 2: Replace `src/app/(pages)/profile/page.tsx` with the new server-rendered hub**

```tsx
// src/app/(pages)/profile/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import connectToDB from "@/lib/mongoose";
import Users from "@/models/user.model";
import ProfileHero from "@/app/components/profile/ProfileHero";
import { fetchProfileSummary } from "@/lib/profile/summary";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profile · Velocity Markets" };

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/");

  await connectToDB();
  const user = await Users.findOne({ email: session.user.email })
    .lean<{ _id: string; name?: string; username?: string; image?: string; createdAt?: Date; isInvited?: boolean } | null>();
  if (!user || user.isInvited !== true) redirect("/");

  const summary = await fetchProfileSummary(String(user._id));

  return (
    <main className="mx-auto max-w-6xl px-4 md:px-6 py-6 md:py-10 space-y-6">
      <ProfileHero
        displayName={user.name || user.username || "Predictor"}
        handle={user.username || "predictor"}
        avatarUrl={user.image}
        createdAt={user.createdAt ?? new Date()}
        stats={summary.stats}
      />

      {/* Bento grid will be added in Task 1.3-1.7 */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-5" data-testid="profile-bento">
        {/* placeholder so e2e doesn't fail before tiles land */}
      </div>
    </main>
  );
}
```

**Step 3: Create `src/lib/profile/summary.ts` (server-only data fetcher)**

```ts
// src/lib/profile/summary.ts
//
// Server-only: aggregates per-user stats for the hub hero.
// Avoids HTTP round-trips by querying Mongo directly. The /api/profile
// HTTP route stays for client-side consumers.

import connectToDB from "@/lib/mongoose";
import { Predictions } from "@/models/prediction.model";
// Wallet model name varies — adjust import to match codebase
import Wallets from "@/models/wallet.model";

export interface ProfileSummary {
  stats: {
    predictions: number;
    accuracyPct: number;
    streak: number;
    earningsUsd: number;
    rank: number | null;
  };
}

export async function fetchProfileSummary(userId: string): Promise<ProfileSummary> {
  await connectToDB();

  const [predictionsCount, accuracyAgg, wallet] = await Promise.all([
    Predictions.countDocuments({ user: userId }),
    Predictions.aggregate([
      { $match: { user: userId, score: { $ne: null } } },
      { $group: { _id: null, avg: { $avg: "$score" } } },
    ]),
    Wallets.findOne({ user: userId }).select("totalWinningsUsd").lean<{ totalWinningsUsd?: number } | null>(),
  ]);

  return {
    stats: {
      predictions: predictionsCount,
      accuracyPct: Math.max(0, Math.min(100, Math.round(((accuracyAgg[0]?.avg as number | undefined) ?? 0) * 100))),
      streak: 0, // wired in Task 1.4
      earningsUsd: wallet?.totalWinningsUsd ?? 0,
      rank: null, // wired in Task 1.7
    },
  };
}
```

> **Note:** field names (`Predictions.score`, `Wallets.totalWinningsUsd`) are placeholders — verify by reading `src/models/prediction.model.ts` and `src/models/wallet.model.ts` and adjust before committing.

**Step 4: Typecheck + visual smoke**

```bash
npx tsc --noEmit -p tsconfig.json
npm run dev   # then load http://localhost:3000/profile while signed in as an invited user
```

Expected: hero renders. Below is the empty bento grid placeholder. Sign in cookie required.

**Step 5: Commit**

```bash
git add src/app/(pages)/profile/page.tsx src/lib/profile/summary.ts
git commit -m "feat(profile): hub page skeleton with hero + summary fetcher"
```

---

### Task 1.3: RecentPredictionsTile

**Files:**
- Create: `src/app/components/profile/RecentPredictionsTile.tsx`
- Modify: `src/app/(pages)/profile/page.tsx` (mount tile in bento)

**Step 1: Implement the tile component**

```tsx
// src/app/components/profile/RecentPredictionsTile.tsx
import Image from "next/image";
import Link from "next/link";

interface Pred {
  id: string;
  marketTitle: string;
  thumbUrl?: string;
  yourCall: string;
  status: "won" | "lost" | "pending";
}

interface Props {
  recent: Pred[];
  totalCount: number;
}

export default function RecentPredictionsTile({ recent, totalCount }: Props) {
  return (
    <section
      data-testid="tile-recent-predictions"
      className="md:col-span-4 rounded-2xl border border-white/[0.06] bg-[#13202D] p-5"
    >
      <header className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-gray-400">Recent predictions</h2>
        <Link href="/profile/predictions" className="text-sm text-[#E94560] hover:underline">
          View all {totalCount.toLocaleString()} →
        </Link>
      </header>
      {recent.length === 0 ? (
        <Empty />
      ) : (
        <ul className="divide-y divide-white/[0.06]">
          {recent.map((p) => (
            <li key={p.id} className="py-3 flex items-center gap-3">
              {p.thumbUrl ? (
                <Image src={p.thumbUrl} alt="" width={48} height={48} className="rounded-md object-cover w-12 h-12" />
              ) : (
                <div aria-hidden className="w-12 h-12 rounded-md bg-[#1E2A36]" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{p.marketTitle}</p>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{`Your call: ${p.yourCall}`}</p>
              </div>
              <StatusChip status={p.status} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function StatusChip({ status }: { status: Pred["status"] }) {
  const styles = {
    won: "text-[#00D4AA] bg-[#00D4AA]/10 border-[#00D4AA]/30",
    lost: "text-[#E94560] bg-[#E94560]/10 border-[#E94560]/30",
    pending: "text-[#FFB547] bg-[#FFB547]/10 border-[#FFB547]/30",
  } as const;
  const label = { won: "Won", lost: "Lost", pending: "Live" }[status];
  return (
    <span className={`text-xs font-mono uppercase tracking-wider px-2 py-1 rounded border ${styles[status]}`}>
      {label}
    </span>
  );
}

function Empty() {
  return (
    <div className="py-10 flex flex-col items-center text-center">
      <p className="text-gray-400 text-sm">No predictions yet</p>
      <Link href="/markets" className="mt-3 text-[#E94560] text-sm hover:underline">
        Make your first prediction →
      </Link>
    </div>
  );
}
```

**Step 2: Extend `summary.ts` to return recent predictions**

Add to `src/lib/profile/summary.ts`:

```ts
// add to ProfileSummary interface
recent: Array<{ id: string; marketTitle: string; thumbUrl?: string; yourCall: string; status: "won" | "lost" | "pending" }>;
```

In `fetchProfileSummary`, add a parallel query:

```ts
const recentRaw = await Predictions.find({ user: userId })
  .sort({ createdAt: -1 })
  .limit(3)
  .populate("auction", "title image_url")
  .lean();
```

Map `recentRaw` to the shape (status from `score` and `settled` fields — adjust based on actual model).

**Step 3: Mount tile in hub page**

In `src/app/(pages)/profile/page.tsx`, add inside the bento grid:

```tsx
<RecentPredictionsTile recent={summary.recent} totalCount={summary.stats.predictions} />
```

**Step 4: Typecheck + visual**

```bash
npx tsc --noEmit -p tsconfig.json
```

**Step 5: Commit**

```bash
git add src/app/components/profile/RecentPredictionsTile.tsx src/lib/profile/summary.ts src/app/(pages)/profile/page.tsx
git commit -m "feat(profile): recent predictions tile in bento"
```

---

### Task 1.4: StreakBadgesTile

**Files:**
- Create: `src/app/components/profile/StreakBadgesTile.tsx`
- Modify: `src/lib/profile/summary.ts` (add streak + 3 most-recent badges)
- Modify: `src/app/(pages)/profile/page.tsx`

**Implementation pattern:** flame icon from lucide-react, mono number for streak, 3 badge rows each with name + earned date. Empty state: "Predict 3 days to start a streak".

```tsx
// src/app/components/profile/StreakBadgesTile.tsx
import { Flame } from "lucide-react";

interface Badge { id: string; name: string; earnedAt: Date | string; }

interface Props { current: number; longest: number; badges: Badge[]; }

export default function StreakBadgesTile({ current, longest, badges }: Props) {
  return (
    <section data-testid="tile-streak-badges" className="md:col-span-2 rounded-2xl border border-white/[0.06] bg-[#13202D] p-5">
      <header className="flex items-center gap-2 mb-4">
        <Flame className="h-4 w-4 text-[#FFB547]" aria-hidden />
        <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-gray-400">Streak</h2>
      </header>
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-4xl text-white tabular-nums">{current}</span>
        <span className="text-sm text-gray-400">{`day${current === 1 ? "" : "s"}`}</span>
      </div>
      <p className="mt-1 text-xs text-gray-500">{`Longest: ${longest}`}</p>
      <hr className="my-4 border-white/[0.06]" />
      <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400 mb-2">Recent badges</h3>
      {badges.length === 0 ? (
        <p className="text-xs text-gray-500">No badges yet</p>
      ) : (
        <ul className="space-y-2">
          {badges.slice(0, 3).map((b) => (
            <li key={b.id} className="flex items-center justify-between text-sm">
              <span className="text-white">{b.name}</span>
              <span className="text-xs text-gray-500 font-mono">{fmtDate(b.earnedAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
```

Update `summary.ts` to query `Streaks` and `Badges` models. Use the existing model names from `src/models/`.

**Commit:** `feat(profile): streak + recent badges tile`

---

### Task 1.5: ShareCardsTile (placeholder data, full data after Phase 2)

**Files:**
- Create: `src/app/components/profile/ShareCardsTile.tsx`
- Modify: `src/app/(pages)/profile/page.tsx`

**Behavior:** horizontal scroll of up to 4 cards. Each card thumbnail is a 256×134 box that loads `/s/{shortCode}/opengraph-image`. Locked placeholders for unearned card types (winner, tournament). Hover-only Copy button per card.

```tsx
// src/app/components/profile/ShareCardsTile.tsx
"use client";
import Link from "next/link";
import { useState } from "react";

interface Card { id: string; type: "welcome" | "winner" | "tournament"; shortCode: string; createdAt: Date | string; }

interface Props { cards: Card[]; baseUrl: string; }

export default function ShareCardsTile({ cards, baseUrl }: Props) {
  const slots = [...cards];
  const types = new Set(cards.map((c) => c.type));
  if (!types.has("winner")) slots.push({ id: "lock-winner", type: "winner", shortCode: "", createdAt: "" });
  if (!types.has("tournament")) slots.push({ id: "lock-tournament", type: "tournament", shortCode: "", createdAt: "" });

  return (
    <section data-testid="tile-share-cards" className="md:col-span-6 rounded-2xl border border-white/[0.06] bg-[#13202D] p-5">
      <header className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-gray-400">Your share cards</h2>
        <Link href="/profile/cards" className="text-sm text-[#E94560] hover:underline">Open all →</Link>
      </header>
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 snap-x">
        {slots.slice(0, 4).map((c) => (
          <CardThumb key={c.id} card={c} baseUrl={baseUrl} />
        ))}
      </div>
    </section>
  );
}

function CardThumb({ card, baseUrl }: { card: Card; baseUrl: string }) {
  const [copied, setCopied] = useState(false);
  const isLocked = card.shortCode === "";
  const lockMsg = card.type === "winner" ? "Win a market to unlock" : "Top 10 a tournament to unlock";
  const url = `${baseUrl}/s/${card.shortCode}`;

  if (isLocked) {
    return (
      <div className="relative shrink-0 snap-start w-64 h-[134px] rounded-lg border border-dashed border-white/[0.12] bg-[#0A0A1A] flex items-center justify-center">
        <span className="text-xs text-gray-500 px-3 text-center">{lockMsg}</span>
      </div>
    );
  }

  return (
    <div className="group relative shrink-0 snap-start w-64 h-[134px] rounded-lg overflow-hidden border border-white/[0.06] bg-[#0A0A1A]">
      <img
        src={`/s/${card.shortCode}/opengraph-image`}
        alt={`${card.type} share card`}
        className="w-full h-full object-cover"
      />
      <button
        type="button"
        onClick={() => {
          navigator.clipboard?.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1200); });
        }}
        className="absolute bottom-1 right-1 rounded bg-black/70 px-2 py-1 text-[11px] font-mono text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
```

In `summary.ts`, query `share_cards` directly (limit 4, sort createdAt desc). Pass `baseUrl` from request headers (`x-forwarded-host` fallback to `process.env.NEXTAUTH_URL`).

**Commit:** `feat(profile): share cards tile with locked placeholders`

---

### Task 1.6: EarningsTile

**Files:**
- Create: `src/app/components/profile/EarningsTile.tsx`
- Modify: `src/lib/profile/summary.ts` (add 7-day earnings series)
- Modify: `src/app/(pages)/profile/page.tsx`

**Behavior:** big mono number `$N` in `text-[#00D4AA]`, "+$N this month" delta, 7-day sparkline using recharts `<AreaChart>`. CTA "Open wallet →" → `/my_wallet`.

Use `recharts` (already installed per session memory). Sparkline component:

```tsx
import { AreaChart, Area, ResponsiveContainer } from "recharts";

function Sparkline({ data }: { data: Array<{ d: string; v: number }> }) {
  return (
    <ResponsiveContainer width="100%" height={48}>
      <AreaChart data={data} margin={{ top: 4, bottom: 0, left: 0, right: 0 }}>
        <Area type="monotone" dataKey="v" stroke="#00D4AA" fill="#00D4AA" fillOpacity={0.18} strokeWidth={1.5} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
```

`summary.ts` aggregates `Transactions` by day for the last 7 days where `type === "winning"`.

**Commit:** `feat(profile): earnings tile with sparkline`

---

### Task 1.7: TournamentFinishesTile

**Files:**
- Create: `src/app/components/profile/TournamentFinishesTile.tsx`
- Modify: `src/lib/profile/summary.ts` (add `tournamentFinishes` query — top 3 by placement)
- Modify: `src/app/(pages)/profile/page.tsx`

**Behavior:** list of up to 3 finishes, format `#{placement} · {tournamentName} · {accuracy}%`. Mono placement number in amber (`#FFB547`). Empty state CTA links to `/tournaments`.

**Commit:** `feat(profile): tournament finishes tile`

---

### Task 1.8: Wire all tiles + remove legacy tab content from /profile

**Files:**
- Modify: `src/app/(pages)/profile/page.tsx` (final composition)

By this point, the legacy tabs (Overview / Predictions / Tournaments / Settings) inside the old page should already be replaced by the new bento. Confirm:

```bash
grep -nE "useState\(.tab.\)" src/app/(pages)/profile/page.tsx
```

Expected: no matches (the new page is server-rendered, no client-side tab state).

**Step:** type check, dev server smoke, commit.

```bash
npx tsc --noEmit -p tsconfig.json
git add src/app/\(pages\)/profile/page.tsx
git commit -m "feat(profile): hub bento page replaces tabbed mega-page"
```

---

## Phase 2 — Cards spoke + new API

### Task 2.1: GET /api/profile/cards

**Files:**
- Create: `src/app/api/profile/cards/route.ts`
- Create: `e2e/profile-cards-api.spec.ts`

**Step 1: Failing API test**

```ts
// e2e/profile-cards-api.spec.ts
import { test, expect } from "@playwright/test";

test("GET /api/profile/cards requires auth", async ({ request }) => {
  const r = await request.get("/api/profile/cards");
  expect([401, 403]).toContain(r.status());
});
```

```bash
npx playwright test e2e/profile-cards-api.spec.ts
```

Expected: PASS once route exists and is unauth-blocked.

**Step 2: Implement route**

```ts
// src/app/api/profile/cards/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ShareCard } from "@/models/shareCard.model";
import connectToDB from "@/lib/mongoose";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDB();
  const cards = await ShareCard.find({ userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .select("type shortCode payload createdAt views")
    .lean();

  return NextResponse.json({
    cards: cards.map((c) => ({
      id: String(c._id),
      type: c.type,
      shortCode: c.shortCode,
      payload: c.payload,
      createdAt: c.createdAt,
      views: c.views ?? 0,
    })),
  });
}
```

**Step 3: Run test**

```bash
npx playwright test e2e/profile-cards-api.spec.ts
```

Expected: PASS.

**Step 4: Commit**

```bash
git add src/app/api/profile/cards/route.ts e2e/profile-cards-api.spec.ts
git commit -m "feat(profile): GET /api/profile/cards"
```

---

### Task 2.2: /profile/cards spoke page

**Files:**
- Create: `src/app/(pages)/profile/cards/page.tsx`

**Behavior:** server-rendered gallery. Reads `share_cards` directly via Mongoose (avoids HTTP round-trip server-side). Renders all the user's cards in a grid with copy-link buttons and locked placeholders. Top: `← Profile` link.

```tsx
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ShareCard } from "@/models/shareCard.model";
import connectToDB from "@/lib/mongoose";

export const dynamic = "force-dynamic";
export const metadata = { title: "Share cards · Velocity Markets" };

export default async function CardsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) redirect("/");

  await connectToDB();
  const cards = await ShareCard.find({ userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return (
    <main className="mx-auto max-w-6xl px-4 md:px-6 py-6 md:py-10">
      <Link href="/profile" className="text-sm text-gray-400 hover:text-white">← Profile</Link>
      <h1 className="mt-4 text-2xl font-bold text-white">Your share cards</h1>
      <p className="mt-1 text-sm text-gray-400">Every card you&rsquo;ve earned. Copy a link to share.</p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <CardItem key={String(c._id)} shortCode={c.shortCode} type={c.type} createdAt={c.createdAt} />
        ))}
        <LockedItem type="winner" />
        <LockedItem type="tournament" />
      </div>
    </main>
  );
}

// CardItem and LockedItem omitted here — implement with same visual rules as ShareCardsTile,
// scaled to the larger grid (full thumbnail uses object-cover at 16:9).
```

**Commit:** `feat(profile): cards spoke gallery page`

---

### Task 2.3: Replace placeholder in ShareCardsTile with real data

If Task 1.5 wasn't already wired to real data via `summary.ts`, do it now: `summary.ts` queries `ShareCard.find({ userId }).limit(4)` and passes results into the tile.

**Commit:** `chore(profile): wire share cards tile to live data`

---

## Phase 3 — Predictions spoke

### Task 3.1: /profile/predictions extracted from old tab

**Files:**
- Create: `src/app/(pages)/profile/predictions/page.tsx`

**Behavior:** read the active/completed split logic from the old tabbed `/profile/page.tsx` (which is replaced by Task 1.8 — preserve the logic in this new file before deleting it). Render a top filter bar (All / Active / Completed) and paginated list using existing `PredictionsCard` and `CompletedPredictionCard` components. Top: `← Profile` link.

Use `searchParams` for filter + page (e.g. `?filter=active&page=2`). 20 per page.

**Commit:** `feat(profile): predictions spoke with filter + pagination`

---

## Phase 4 — Tournaments spoke

### Task 4.1: /profile/tournaments extracted from old tab

**Files:**
- Create: `src/app/(pages)/profile/tournaments/page.tsx`

Same pattern as predictions. Adds per-tournament accuracy + final placement column.

**Commit:** `feat(profile): tournaments spoke`

---

## Phase 5 — Settings spoke

### Task 5.1: /profile/settings page with stacked sections

**Files:**
- Create: `src/app/(pages)/profile/settings/page.tsx`
- Create: `src/app/components/profile/SettingsSection.tsx`

**Behavior:** server-rendered shell with client-component sections per concern. Each section is a card with its own Save button (no global save). Sections:

1. Profile (display name, bio) — `PATCH /api/profile`
2. Email preferences (4 toggles) — `PATCH /api/profile/email-preferences`
3. Notifications (3 toggles) — `PATCH /api/notifications/preferences`
4. Security (change password) — `POST /api/profile/change-password`
5. Data (export) — `GET /api/profile/export` (download)
6. Danger zone — delete account (Task 5.2)

Reuse existing form logic from old `/profile?tab=settings` content.

**Commit:** `feat(profile): settings spoke with per-section save`

### Task 5.2: Danger-zone confirm modal

**Files:**
- Create: `src/app/components/profile/DangerZone.tsx`

**Behavior:** `border border-[#E94560]/40` card containing only a "Delete account" button. On click, opens a modal that requires the user to type their @handle to enable the confirm button. POSTs to existing delete-account endpoint (verify route in `src/app/api`).

**Commit:** `feat(profile): danger-zone delete-account confirmation`

---

## Phase 6 — Wrap up

### Task 6.1: Final smoke test all routes

**Step 1: Visit each route while logged in**

- `/profile`
- `/profile/predictions`
- `/profile/tournaments`
- `/profile/cards`
- `/profile/settings`

Expected: all render, no console errors, no 404s.

**Step 2: Run all e2e specs**

```bash
LAUNCH_GATE_ENABLED=false npx playwright test e2e/profile-*.spec.ts
```

Expected: all pass (or skip cleanly when no auth cookie).

**Step 3: Typecheck + lint**

```bash
npx tsc --noEmit -p tsconfig.json
npm run lint -- --fix
```

**Step 4: Open PR**

```bash
gh pr create --base main --head feat/profile-redesign --title "feat(profile): bento hub + spoke routes + cards page" --body-file .pr-body.md
```

PR body checklist:
- [ ] Hub renders for invited users
- [ ] Each spoke renders standalone
- [ ] `/profile/cards` shows welcome card + locked placeholders
- [ ] Settings danger-zone requires @handle confirmation
- [ ] No regressions on `/app`, tournaments, wallet, markets

---

## Non-goals (do not do)

- Do not touch `/app`, tournaments, wallet, markets, leaderboard, or any other route outside `/profile/*`.
- Do not modify the `InvitedCelebrationModal` — it stays as-is.
- Do not add streak / badge new features; redesign uses what's already there.
- Do not add new env vars or DB migrations.
- Do not change the `/api/profile`, `/api/myPredictions`, or `/api/wallet` contracts.
