# Top 10 ROI Features — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the 10 highest-ROI product features across acquisition, activation, retention, and monetization — split into two parallel execution tracks.

**Architecture:** Track 1 is pure frontend (no backend changes needed). Track 2 builds frontend stubs with loading/error states that call backend endpoints (defined in `docs/plans/2026-02-23-backend-api-contracts.md`). Both tracks can run simultaneously in separate worktrees.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, MongoDB/Mongoose, NextAuth, recharts (install required), next/og (bundled)

---

## TRACK 1 — Frontend Only (build now)

*No backend dependencies. All 5 tasks can be executed independently.*

---

### Task 1: Sort Fix + Live/Ending Soon Tabs

**Files:**
- Modify: `src/app/(pages)/free_play/page.tsx`
- Modify: `src/app/api/cars/route.ts`
- Modify: `src/lib/data.ts`

**Step 1: Add `starting_soon` status to the API route**

Open `src/app/api/cars/route.ts`. The `query` object currently handles `active` and `ending_soon` deadlines. Add `starting_soon`:

```typescript
// In the query object (around line 103), replace the deadline logic:
"sort.deadline":
  status === "active" || status === "ending_soon"
    ? { $gt: new Date() }
    : status === "starting_soon"
    ? { $gt: new Date(Date.now() + 24 * 60 * 60 * 1000) }
    : { $lt: new Date() },
```

Also update the sort options:
```typescript
const options = {
  offset: offset,
  limit: limit,
  sort:
    status === "ending_soon"
      ? { "sort.deadline": 1 }
      : status === "starting_soon"
      ? { "sort.deadline": 1 }
      : { "sort.deadline": -1 },
};
```

**Step 2: Add tab bar UI to `free_play/page.tsx`**

The file has a `Filters` interface and `filters` state. Change the default status to `"ending_soon"`:

```typescript
const [filters, setFilters] = useState<Filters>({
  make: "all",
  priceRange: "0",
  status: "ending_soon",  // was "active"
});
```

Add a `TabBar` section above the filter dropdowns. Find the return JSX and add this after the page title:

```tsx
{/* Tab bar */}
<div className="flex overflow-x-auto border-b border-[#1E2A36] mb-6">
  {(["ending_soon", "active", "started_soon", "ended"] as const).map((tab) => (
    <button
      key={tab}
      onClick={() => setFilters((f) => ({ ...f, status: tab }))}
      className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
        filters.status === tab
          ? "border-b-2 border-[#E94560] text-white"
          : "text-gray-400 hover:text-white"
      }`}
    >
      {tab === "ending_soon" && "Ending Soon"}
      {tab === "active" && "Live Now"}
      {tab === "started_soon" && "Starting Soon"}
      {tab === "ended" && "Ended"}
    </button>
  ))}
</div>
```

Note: `status` type in your `Filters` interface will need to include `"started_soon"`. Update the type:
```typescript
interface Filters {
  make: string;
  priceRange: string;
  status: "active" | "ending_soon" | "started_soon" | "ended";
}
```

**Step 3: Verify manually**

Run: `npm run dev`

1. Navigate to `/free_play`
2. Confirm "Ending Soon" tab is active by default
3. Click each tab — confirm the auction list changes
4. Confirm no TypeScript errors: `npx tsc --noEmit`

**Step 4: Commit**

```bash
git add src/app/api/cars/route.ts src/app/(pages)/free_play/page.tsx
git commit -m "feat: add sort fix and live/ending-soon tabs to free play"
```

---

### Task 2: Daily Slate + Featured Car

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/app/(pages)/daily/page.tsx`
- Create: `src/app/components/DailySlate.tsx`

**Step 1: Create `DailySlate.tsx` component**

```tsx
// src/app/components/DailySlate.tsx
"use client";

import { Car } from "@/models/auction.model";
import Link from "next/link";
import AuctionCard from "./AuctionCard"; // use existing card component

interface DailySlateProps {
  auctions: Car[];
}

export function DailySlate({ auctions }: DailySlateProps) {
  if (auctions.length === 0) {
    return (
      <div className="rounded-lg border border-[#1E2A36] bg-[#13202D] p-12 text-center">
        <p className="text-gray-400 mb-4">No auctions closing in the next 24 hours.</p>
        <Link href="/free_play" className="text-[#E94560] underline text-sm">
          Browse all auctions
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4">
        {"Today's Slate — "}
        <span className="text-[#E94560]">{auctions.length}</span>
        {" auctions closing in the next 24 hours"}
      </h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {auctions.map((car) => (
          <AuctionCard key={car._id} car={car} />
        ))}
      </div>
    </div>
  );
}
```

Check what the existing `AuctionCard` component is named by running:
```bash
ls src/app/components/ | grep -i auction
ls src/app/components/ | grep -i card
```
Use the correct import name for whatever card component renders auction tiles.

**Step 2: Create `/daily` page**

```tsx
// src/app/(pages)/daily/page.tsx
import { connectToDB } from "@/lib/mongoose";
import Auctions from "@/models/auction.model";
import { DailySlate } from "@/app/components/DailySlate";

export const dynamic = "force-dynamic";

async function getDailyAuctions() {
  await connectToDB();
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const auctions = await Auctions.find({
    isActive: true,
    "sort.deadline": { $gt: now, $lt: in24h },
  })
    .sort({ "sort.deadline": 1 })
    .lean()
    .exec();
  return JSON.parse(JSON.stringify(auctions));
}

export default async function DailyPage() {
  const auctions = await getDailyAuctions();

  return (
    <main className="min-h-screen bg-[#0A0A1A] px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">{"Today's Slate"}</h1>
        <p className="text-gray-400 mb-8">
          Auctions closing in the next 24 hours
        </p>
        <DailySlate auctions={auctions} />
      </div>
    </main>
  );
}
```

**Step 3: Add featured car to homepage**

Open `src/app/page.tsx`. Add a server-side featured car query at the top of the page component (alongside existing queries):

```typescript
// Add alongside existing data fetches
const featuredCar = await Auctions.findOne({
  isActive: true,
  "sort.deadline": { $gt: now, $lt: new Date(now.getTime() + 48 * 60 * 60 * 1000) },
})
  .sort({ prediction_count: -1 })
  .lean()
  .exec();
```

Add a hero section above the existing grid (find where main content starts):

```tsx
{featuredCar && (
  <section className="mb-12">
    <div className="relative rounded-xl overflow-hidden">
      <img
        src={featuredCar.image}
        alt={featuredCar.title}
        className="w-full h-64 md:h-96 object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A1A] via-[#0A0A1A]/60 to-transparent" />
      <div className="absolute bottom-0 left-0 p-6">
        <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">
          {featuredCar.title}
        </h2>
        <p className="text-gray-300 mb-4 font-mono">
          {featuredCar.sort?.deadline
            ? `Ends ${new Date(featuredCar.sort.deadline).toLocaleString()}`
            : "Ending soon"}
        </p>
        <Link
          href={`/auctions/car_view_page/${featuredCar._id}`}
          className="inline-block bg-[#E94560] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#E94560]/90 transition-colors"
        >
          Make Your Pick →
        </Link>
      </div>
    </div>
  </section>
)}
```

**Step 4: Verify**

```bash
npx tsc --noEmit
```
Navigate to `/` and `/daily` in dev server and confirm no crashes.

**Step 5: Commit**

```bash
git add src/app/components/DailySlate.tsx src/app/(pages)/daily/page.tsx src/app/page.tsx
git commit -m "feat: add daily slate page and featured car hero on homepage"
```

---

### Task 3: Streak UI + Daily Challenge Badge

**Files:**
- Create: `src/app/components/DailyChallenge.tsx`
- Modify: `src/app/(pages)/profile/page.tsx`

**Step 1: Create `DailyChallenge.tsx`**

```tsx
// src/app/components/DailyChallenge.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const CHALLENGES = [
  { id: "pick_3", label: "Make 3 picks today", target: 3, metric: "picks_today" },
  { id: "within_5pct", label: "Hit within 5% on any car", target: 1, metric: "accurate_picks_today" },
  { id: "new_make", label: "Pick a make you've never picked", target: 1, metric: "new_make_today" },
  { id: "pick_2", label: "Make 2 picks today", target: 2, metric: "picks_today" },
  { id: "tournament", label: "Enter a tournament today", target: 1, metric: "tournaments_today" },
  { id: "pick_5", label: "Make 5 picks today", target: 5, metric: "picks_today" },
  { id: "pick_1", label: "Make your first pick today", target: 1, metric: "picks_today" },
] as const;

function getTodayChallenge() {
  const dayOfWeek = new Date().getDay();
  return CHALLENGES[dayOfWeek % CHALLENGES.length];
}

export function DailyChallenge() {
  const { data: session } = useSession();
  const [todayPickCount, setTodayPickCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const challenge = getTodayChallenge();

  useEffect(() => {
    if (!session?.user) {
      setLoading(false);
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    fetch(`/api/myPredictions?since=${today.toISOString()}`)
      .then((r) => r.json())
      .then((data) => {
        setTodayPickCount(Array.isArray(data) ? data.length : 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session]);

  const progress = Math.min(todayPickCount, challenge.target);
  const completed = progress >= challenge.target;
  const pct = Math.round((progress / challenge.target) * 100);

  if (loading) return null;

  return (
    <div className="rounded-lg border border-[#1E2A36] bg-[#13202D] p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-[#FFB547]">Daily Challenge</span>
        {completed && (
          <span className="text-xs bg-[#00D4AA]/20 text-[#00D4AA] px-2 py-1 rounded-full">
            Complete!
          </span>
        )}
      </div>
      <p className="text-white font-medium mb-3">{challenge.label}</p>
      <div className="w-full bg-[#0A0A1A] rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full transition-all ${
            completed ? "bg-[#00D4AA]" : "bg-[#E94560]"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-sm text-gray-400 font-mono">
        {progress} / {challenge.target}
      </p>
    </div>
  );
}
```

**Step 2: Add to profile page**

Open `src/app/(pages)/profile/page.tsx`. Find the "Overview" tab section and add the `DailyChallenge` component near the top of that tab's content:

```tsx
import { DailyChallenge } from "@/app/components/DailyChallenge";

// Inside the Overview tab JSX, before existing stats cards:
<DailyChallenge />
```

**Step 3: Verify TypeScript and dev server**

```bash
npx tsc --noEmit
```
Navigate to `/profile` and confirm the challenge card renders.

**Step 4: Commit**

```bash
git add src/app/components/DailyChallenge.tsx src/app/(pages)/profile/page.tsx
git commit -m "feat: add daily challenge card to profile page"
```

---

### Task 4: Shareable Prediction Card

**Files:**
- Create: `src/app/api/share/prediction/route.ts`
- Create: `src/app/components/ShareCard.tsx`
- Modify: `src/app/(pages)/auctions/car_view_page/[id]/page.tsx`

**Step 1: Install `@vercel/og` if not present**

Check `package.json` for `@vercel/og`. If missing:
```bash
npm install @vercel/og
```
If Next.js 14 is installed, `next/og` is bundled — use that instead.

**Step 2: Create OG image route**

```typescript
// src/app/api/share/prediction/route.ts
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import connectToDB from "@/lib/mongoose";
import Predictions from "@/models/prediction.model";
import Auctions from "@/models/auction.model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const USDollar = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export async function GET(req: NextRequest) {
  try {
    const predictionId = req.nextUrl.searchParams.get("predictionId");
    if (!predictionId) {
      return new Response("Missing predictionId", { status: 400 });
    }

    await connectToDB();
    const prediction = await Predictions.findById(predictionId).lean().exec();
    if (!prediction) {
      return new Response("Prediction not found", { status: 404 });
    }

    const auction = await Auctions.findById(prediction.auction_id).lean().exec();
    const auctionTitle = (auction as any)?.title ?? "Classic Car Auction";
    const imageUrl = (auction as any)?.image ?? "";
    const predictedPrice = USDollar.format(prediction.predictedPrice);

    return new ImageResponse(
      (
        <div
          style={{
            width: "1200px",
            height: "630px",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#0A0A1A",
            fontFamily: "sans-serif",
            position: "relative",
          }}
        >
          {imageUrl && (
            <img
              src={imageUrl}
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: 0.3,
              }}
            />
          )}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, #0A0A1A 60%, transparent)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "60px",
              left: "60px",
              right: "60px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span style={{ color: "#9ca3af", fontSize: "18px", marginBottom: "8px" }}>
              velocity-markets.com
            </span>
            <span style={{ color: "#9ca3af", fontSize: "20px", marginBottom: "8px" }}>
              I picked:
            </span>
            <span style={{ color: "white", fontSize: "40px", fontWeight: "bold", marginBottom: "12px" }}>
              {auctionTitle}
            </span>
            <span
              style={{
                color: "#E94560",
                fontSize: "52px",
                fontWeight: "bold",
                fontFamily: "monospace",
              }}
            >
              {predictedPrice}
            </span>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch (err) {
    console.error(err);
    return new Response("Failed to generate image", { status: 500 });
  }
}
```

**Step 3: Create `ShareCard.tsx` client component**

```tsx
// src/app/components/ShareCard.tsx
"use client";

import { useState } from "react";

interface ShareCardProps {
  predictionId: string;
  auctionId: string;
  auctionTitle: string;
}

export function ShareCard({ predictionId, auctionId, auctionTitle }: ShareCardProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/auctions/car_view_page/${auctionId}?ref=share&predictionId=${predictionId}`;
  const ogImageUrl = `/api/share/prediction?predictionId=${predictionId}`;
  const tweetText = encodeURIComponent(
    `I just made my prediction on ${auctionTitle} at Velocity Markets! ${shareUrl}`
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: auctionTitle, url: shareUrl });
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="mt-4 w-full bg-[#1E2A36] text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-[#2C3A4A] transition-colors"
      >
        Share My Pick
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#13202D] rounded-xl border border-[#1E2A36] p-6 w-full max-w-md mx-4">
            <h3 className="text-white font-bold text-lg mb-4">Share Your Pick</h3>
            <img
              src={ogImageUrl}
              alt="Share preview"
              className="w-full rounded-lg mb-4 border border-[#1E2A36]"
            />
            <div className="flex gap-3">
              <button
                onClick={handleCopy}
                className="flex-1 bg-[#1E2A36] text-white py-2 px-4 rounded-lg text-sm hover:bg-[#2C3A4A] transition-colors"
              >
                {copied ? "Copied!" : "Copy Link"}
              </button>
              <a
                href={`https://twitter.com/intent/tweet?text=${tweetText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-black text-white py-2 px-4 rounded-lg text-sm text-center hover:bg-gray-900 transition-colors"
              >
                Post on 𝕏
              </a>
              {typeof navigator !== "undefined" && navigator.share && (
                <button
                  onClick={handleNativeShare}
                  className="flex-1 bg-[#E94560] text-white py-2 px-4 rounded-lg text-sm hover:bg-[#E94560]/90 transition-colors"
                >
                  Share
                </button>
              )}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="mt-4 w-full text-gray-400 text-sm hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
```

**Step 4: Add ShareCard to auction detail page**

Open `src/app/(pages)/auctions/car_view_page/[id]/page.tsx`.

Find where `userPrediction` is rendered (the "Already predicted" state). After it renders the prediction, add:

```tsx
import { ShareCard } from "@/app/components/ShareCard";

// Where the user's existing prediction is shown:
{userPrediction && (
  <>
    {/* existing prediction display */}
    <ShareCard
      predictionId={String(userPrediction._id)}
      auctionId={String(auction._id)}
      auctionTitle={auction.title}
    />
  </>
)}
```

**Step 5: Verify**

```bash
npx tsc --noEmit
```
Submit a prediction in dev, confirm "Share My Pick" button appears. Open the modal. Click "Copy Link".

**Step 6: Commit**

```bash
git add src/app/api/share/prediction/route.ts src/app/components/ShareCard.tsx src/app/(pages)/auctions/car_view_page/[id]/page.tsx
git commit -m "feat: add shareable prediction card with OG image"
```

---

### Task 5: Market Page Comps + Price Distribution Chart

**Files:**
- Create: `src/app/api/auctions/[id]/comps/route.ts`
- Create: `src/app/components/PriceDistribution.tsx`
- Create: `src/app/components/CompsTable.tsx`
- Modify: `src/app/(pages)/auctions/car_view_page/[id]/page.tsx`

**Step 1: Install recharts**

```bash
npm install recharts
npm install --save-dev @types/recharts 2>/dev/null || true
```

**Step 2: Create comps API route**

```typescript
// src/app/api/auctions/[id]/comps/route.ts
import connectToDB from "@/lib/mongoose";
import Auctions from "@/models/auction.model";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getAttrValue(attributes: any[], key: string) {
  return attributes?.find((a: any) => a.key === key)?.value;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDB();
    const auction = await Auctions.findById(params.id).lean().exec();
    if (!auction) {
      return NextResponse.json({ error: "Auction not found" }, { status: 404 });
    }

    const make = getAttrValue((auction as any).attributes, "make");
    const year = Number(getAttrValue((auction as any).attributes, "year") ?? 0);

    if (!make) {
      return NextResponse.json({ comps: [] });
    }

    const comps = await Auctions.find({
      isActive: false,
      attributes: { $elemMatch: { key: "make", value: make } },
      ...(year > 0 && {
        attributes: {
          $elemMatch: {
            key: "year",
            value: { $gte: year - 5, $lte: year + 5 },
          },
        },
      }),
      "sort.deadline": { $lt: new Date() },
      "sort.price": { $gt: 0 },
    })
      .sort({ "sort.deadline": -1 })
      .limit(5)
      .lean()
      .exec();

    return NextResponse.json({ comps: JSON.parse(JSON.stringify(comps)) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

**Step 3: Create `PriceDistribution.tsx`**

```tsx
// src/app/components/PriceDistribution.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";

interface PriceDistributionProps {
  predictions: number[];       // all predicted prices for this auction
  userPrediction?: number;     // user's own pick (shown as vertical line)
}

function buildBuckets(predictions: number[], bucketSize = 25000) {
  if (!predictions.length) return [];
  const min = Math.floor(Math.min(...predictions) / bucketSize) * bucketSize;
  const max = Math.ceil(Math.max(...predictions) / bucketSize) * bucketSize;
  const buckets: { label: string; count: number; start: number }[] = [];
  for (let s = min; s < max; s += bucketSize) {
    const count = predictions.filter((p) => p >= s && p < s + bucketSize).length;
    const label =
      s >= 1_000_000
        ? `$${(s / 1_000_000).toFixed(1)}M`
        : `$${(s / 1000).toFixed(0)}k`;
    buckets.push({ label, count, start: s });
  }
  return buckets;
}

function percentile(sorted: number[], pct: number) {
  const idx = Math.floor((pct / 100) * sorted.length);
  return sorted[Math.min(idx, sorted.length - 1)];
}

export function PriceDistribution({
  predictions,
  userPrediction,
}: PriceDistributionProps) {
  if (!predictions.length) {
    return (
      <p className="text-gray-400 text-sm">No predictions yet — be the first!</p>
    );
  }

  const sorted = [...predictions].sort((a, b) => a - b);
  const p25 = percentile(sorted, 25);
  const p75 = percentile(sorted, 75);
  const buckets = buildBuckets(predictions);

  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
        Prediction Distribution
      </h4>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={buckets} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="label"
            tick={{ fill: "#9ca3af", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              backgroundColor: "#13202D",
              border: "1px solid #1E2A36",
              color: "white",
              fontSize: 12,
            }}
            formatter={(value: number) => [`${value} predictions`, ""]}
          />
          <Bar dataKey="count" radius={[3, 3, 0, 0]}>
            {buckets.map((b) => (
              <Cell
                key={b.start}
                fill={
                  b.start >= p25 && b.start < p75 ? "#E94560" : "#1E2A36"
                }
              />
            ))}
          </Bar>
          {userPrediction && (
            <ReferenceLine
              x={
                buckets.find(
                  (b) =>
                    userPrediction >= b.start &&
                    userPrediction < b.start + 25000
                )?.label
              }
              stroke="#00D4AA"
              strokeWidth={2}
              label={{
                value: "You",
                fill: "#00D4AA",
                fontSize: 11,
              }}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-500 mt-1">
        Red = consensus zone (middle 50% of predictions)
      </p>
    </div>
  );
}
```

**Step 4: Create `CompsTable.tsx`**

```tsx
// src/app/components/CompsTable.tsx
"use client";

import { useEffect, useState } from "react";

interface Comp {
  _id: string;
  title: string;
  sort: { price: number; deadline: string };
}

interface CompsTableProps {
  auctionId: string;
  currentBid?: number;
}

const USDollar = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function CompsTable({ auctionId, currentBid }: CompsTableProps) {
  const [comps, setComps] = useState<Comp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/auctions/${auctionId}/comps`)
      .then((r) => r.json())
      .then((data) => setComps(data.comps ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [auctionId]);

  if (loading) return <p className="text-gray-400 text-sm">Loading comps…</p>;
  if (!comps.length) return <p className="text-gray-400 text-sm">No comparable sales found.</p>;

  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
        Recent Sales
      </h4>
      <div className="space-y-2">
        {comps.map((comp) => {
          const price = comp.sort?.price ?? 0;
          const diff = currentBid && currentBid > 0
            ? Math.round(((price - currentBid) / currentBid) * 100)
            : null;
          return (
            <div
              key={comp._id}
              className="flex items-center justify-between text-sm py-2 border-b border-[#1E2A36] last:border-0"
            >
              <span className="text-gray-300 truncate mr-4">{comp.title}</span>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono text-white">{USDollar.format(price)}</span>
                {diff !== null && (
                  <span
                    className={`font-mono text-xs ${
                      diff >= 0 ? "text-[#00D4AA]" : "text-[#E94560]"
                    }`}
                  >
                    {diff >= 0 ? "+" : ""}
                    {diff}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

**Step 5: Add Market Data section to auction detail page**

Open `src/app/(pages)/auctions/car_view_page/[id]/page.tsx`.

In the server-side `getAuctionData` function, add a query for all predicted prices:

```typescript
// Add to getAuctionData
const allPredictions = await Predictions.find(
  { auction_id: auctionId },
  { predictedPrice: 1 }
)
  .lean()
  .exec();
const predictedPrices = allPredictions.map((p: any) => p.predictedPrice);
```

Then in the JSX, add the Market Data section alongside (not inside) the prediction form. After the right column's prediction form, add:

```tsx
import { PriceDistribution } from "@/app/components/PriceDistribution";
import { CompsTable } from "@/app/components/CompsTable";

// After prediction form section, in the right column or below:
<div className="rounded-lg border border-[#1E2A36] bg-[#13202D] p-5 space-y-6">
  <h3 className="text-white font-semibold">Market Data</h3>
  <PriceDistribution
    predictions={predictedPrices}
    userPrediction={userPrediction?.predictedPrice}
  />
  <CompsTable
    auctionId={String(auction._id)}
    currentBid={auction.sort?.price}
  />
</div>
```

**Step 6: Verify**

```bash
npx tsc --noEmit
```
Open an auction page in dev. Confirm comps table loads and histogram renders.

**Step 7: Commit**

```bash
git add src/app/api/auctions/ src/app/components/PriceDistribution.tsx src/app/components/CompsTable.tsx src/app/(pages)/auctions/car_view_page/[id]/page.tsx
git commit -m "feat: add market comps table and price distribution chart"
```

---

## TRACK 2 — Stubs + Backend API Contracts

*Frontend builds with loading/error states. Backend calls fire but gracefully degrade.*

---

### Task 6: Guest Mode — First Pick Before Signup

**Files:**
- Modify: `src/app/(pages)/auctions/car_view_page/[id]/page.tsx` (remove auth gate from prediction form)
- Modify: `src/app/components/PredictionFormClient.tsx` (or wherever the form lives — check file)
- Create: `src/app/api/guest/migrate/route.ts`

**Step 1: Locate the prediction form component**

```bash
grep -r "Sign In" src/app/components/ --include="*.tsx" -l
grep -r "PredictionForm" src/app/ --include="*.tsx" -l
```

Find the exact component that gates the prediction form behind auth.

**Step 2: Add guest localStorage prediction saving**

In the prediction form component, add guest logic before the auth check:

```tsx
// At the top of the component file, add helper:
const GUEST_KEY = "vm_guest_predictions";

function saveGuestPrediction(auctionId: string, predictedPrice: number) {
  const existing = JSON.parse(localStorage.getItem(GUEST_KEY) ?? "[]");
  const updated = [
    ...existing.filter((p: any) => p.auctionId !== auctionId),
    { auctionId, predictedPrice, timestamp: Date.now() },
  ];
  localStorage.setItem(GUEST_KEY, JSON.stringify(updated));
  return updated.length;
}

function getGuestPredictions() {
  return JSON.parse(localStorage.getItem(GUEST_KEY) ?? "[]");
}
```

In the form's submit handler, if no session, save to localStorage instead:

```tsx
const handleGuestSubmit = (price: number) => {
  const count = saveGuestPrediction(auctionId, price);
  setGuestSubmitted(true);
  if (count >= 3) {
    setShowSignupModal(true);
  }
};
```

Add `guestSubmitted` and `showSignupModal` state:
```tsx
const [guestSubmitted, setGuestSubmitted] = useState(false);
const [showSignupModal, setShowSignupModal] = useState(false);
```

**Step 3: Add signup modal**

```tsx
{showSignupModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
    <div className="bg-[#13202D] rounded-xl border border-[#1E2A36] p-6 w-full max-w-sm mx-4">
      <h3 className="text-white font-bold text-xl mb-2">Save your picks</h3>
      <p className="text-gray-400 text-sm mb-6">
        Create a free account to save your predictions and see how you rank.
      </p>
      <a
        href="/api/auth/signin"
        className="block w-full bg-[#E94560] text-white py-3 px-4 rounded-lg text-center font-semibold mb-3 hover:bg-[#E94560]/90"
      >
        Sign in with Google
      </a>
      <button
        onClick={() => setShowSignupModal(false)}
        className="w-full text-gray-400 text-sm hover:text-white"
      >
        Continue as guest
      </button>
    </div>
  </div>
)}
```

**Step 4: Create stub migration endpoint**

```typescript
// src/app/api/guest/migrate/route.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Stub: backend team to implement prediction saving
  // For now, return a success response so frontend can handle it
  const body = await req.json();
  const count = Array.isArray(body?.predictions) ? body.predictions.length : 0;

  return NextResponse.json({
    migrated: 0,     // backend will implement actual saving
    skipped: count,
    message: "Migration endpoint not yet implemented — backend pending",
  });
}
```

**Step 5: Call migrate on signin**

In `src/app/(pages)/profile/page.tsx` or the auth callback, after signin, check for guest predictions and call migrate:

```typescript
// In a useEffect that runs after session loads:
useEffect(() => {
  if (!session?.user) return;
  const guestPredictions = JSON.parse(
    localStorage.getItem("vm_guest_predictions") ?? "[]"
  );
  if (!guestPredictions.length) return;

  fetch("/api/guest/migrate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ predictions: guestPredictions }),
  })
    .then((r) => r.json())
    .then(() => {
      localStorage.removeItem("vm_guest_predictions");
    })
    .catch(() => {
      // Silent fail — picks saved locally, backend can be retried
    });
}, [session]);
```

**Step 6: Verify**

```bash
npx tsc --noEmit
```
In dev, log out and submit a prediction. Confirm it's saved to localStorage. Confirm modal appears after 3 picks.

**Step 7: Commit**

```bash
git add src/app/api/guest/ src/app/components/PredictionFormClient.tsx src/app/(pages)/profile/page.tsx
git commit -m "feat: add guest mode with localStorage picks and signup modal"
```

---

### Task 7: Wallet / ACH Redesign

**Files:**
- Create: `src/app/components/ACHDepositForm.tsx`
- Modify: `src/app/(pages)/my_wallet/page.tsx`

**Step 1: Create `ACHDepositForm.tsx`**

```tsx
// src/app/components/ACHDepositForm.tsx
"use client";

import { useState } from "react";

interface ACHDepositFormProps {
  onSuccess?: (transactionId: string) => void;
  onCancel?: () => void;
}

export function ACHDepositForm({ onSuccess, onCancel }: ACHDepositFormProps) {
  const [amount, setAmount] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountType, setAccountType] = useState<"checking" | "savings">("checking");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const amountCents = Math.round(parseFloat(amount) * 100);
    if (!amountCents || amountCents < 100) {
      setError("Minimum deposit is $1.00");
      return;
    }
    if (routingNumber.length !== 9) {
      setError("Routing number must be 9 digits");
      return;
    }
    if (accountNumber.length < 4) {
      setError("Please enter a valid account number");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/wallet/deposit/ach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountCents,
          routingNumber,
          accountNumber,
          accountType,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Deposit failed. Please try again.");
        return;
      }
      setSuccess(true);
      onSuccess?.(data.transactionId);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-6">
        <p className="text-[#00D4AA] font-semibold text-lg mb-2">Transfer initiated!</p>
        <p className="text-gray-400 text-sm">
          Your funds will be available in 3–5 business days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm text-gray-400 block mb-1">Amount ($)</label>
        <input
          type="number"
          min="1"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-[#0A0A1A] border border-[#1E2A36] rounded-lg px-3 py-2 text-white font-mono"
          placeholder="100.00"
          required
        />
      </div>
      <div>
        <label className="text-sm text-gray-400 block mb-1">Routing Number</label>
        <input
          type="text"
          maxLength={9}
          value={routingNumber}
          onChange={(e) => setRoutingNumber(e.target.value.replace(/\D/g, ""))}
          className="w-full bg-[#0A0A1A] border border-[#1E2A36] rounded-lg px-3 py-2 text-white font-mono"
          placeholder="9 digits"
          required
        />
      </div>
      <div>
        <label className="text-sm text-gray-400 block mb-1">Account Number</label>
        <input
          type="text"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
          className="w-full bg-[#0A0A1A] border border-[#1E2A36] rounded-lg px-3 py-2 text-white font-mono"
          placeholder="Account number"
          required
        />
      </div>
      <div>
        <label className="text-sm text-gray-400 block mb-1">Account Type</label>
        <select
          value={accountType}
          onChange={(e) => setAccountType(e.target.value as "checking" | "savings")}
          className="w-full bg-[#0A0A1A] border border-[#1E2A36] rounded-lg px-3 py-2 text-white"
        >
          <option value="checking">Checking</option>
          <option value="savings">Savings</option>
        </select>
      </div>
      {error && <p className="text-[#E94560] text-sm">{error}</p>}
      <p className="text-xs text-gray-500">
        Save 2–3% vs card. Funds available in 3–5 business days.
      </p>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-[#E94560] text-white py-2 px-4 rounded-lg font-semibold disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Deposit via Bank Transfer"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-[#1E2A36] text-white py-2 px-4 rounded-lg"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
```

**Step 2: Update wallet page**

Open `src/app/(pages)/my_wallet/page.tsx`. Add a "Bank Transfer" option alongside the existing "Add Funds" button.

Find the deposit section and add:

```tsx
import { ACHDepositForm } from "@/app/components/ACHDepositForm";

// Add state:
const [showACHForm, setShowACHForm] = useState(false);

// In the deposit section JSX, add ACH option:
<div className="rounded-lg border border-[#1E2A36] bg-[#13202D] p-5 mb-4">
  <div className="flex items-center justify-between mb-3">
    <div>
      <h4 className="text-white font-medium">Bank Transfer (ACH)</h4>
      <p className="text-xs text-[#00D4AA]">Save 2–3% vs card</p>
    </div>
    <button
      onClick={() => setShowACHForm(!showACHForm)}
      className="text-sm bg-[#0A0A1A] border border-[#1E2A36] text-white px-3 py-1.5 rounded-lg"
    >
      {showACHForm ? "Cancel" : "Deposit"}
    </button>
  </div>
  {showACHForm && (
    <ACHDepositForm
      onSuccess={() => {
        setShowACHForm(false);
        setTimeout(() => window.location.reload(), 2000);
      }}
      onCancel={() => setShowACHForm(false)}
    />
  )}
</div>

{/* Existing card deposit button below */}
<button
  onClick={() => setIsPaymentModalOpen(true)}
  className="text-sm text-gray-400 underline"
>
  Pay with card instead
</button>
```

**Step 3: Verify**

```bash
npx tsc --noEmit
```
Navigate to `/my_wallet`. Confirm ACH form renders. Submit with bad routing number — confirm error message.

**Step 4: Commit**

```bash
git add src/app/components/ACHDepositForm.tsx src/app/(pages)/my_wallet/page.tsx
git commit -m "feat: add ACH deposit form stub to wallet page"
```

---

### Task 8: Auction Close Notifications

**Files:**
- Modify: `src/app/(pages)/profile/page.tsx`

**Step 1: Add notification preferences section to profile Settings tab**

Find the Settings tab in profile page. Add this component inline:

```tsx
// src/app/(pages)/profile/page.tsx — inside Settings tab

const [notifPrefs, setNotifPrefs] = useState({
  email_30min: true,
  email_rank_drop: true,
  push_30min: false,
  sms_30min: false,
  phone: null as string | null,
});
const [notifLoading, setNotifLoading] = useState(false);
const [notifSaved, setNotifSaved] = useState(false);

// Load on mount
useEffect(() => {
  fetch("/api/notifications/preferences")
    .then((r) => r.json())
    .then((data) => {
      if (data && !data.error) setNotifPrefs(data);
    })
    .catch(() => {}); // graceful stub
}, []);

const saveNotifPrefs = async () => {
  setNotifLoading(true);
  await fetch("/api/notifications/preferences", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(notifPrefs),
  }).catch(() => {});
  setNotifLoading(false);
  setNotifSaved(true);
  setTimeout(() => setNotifSaved(false), 2000);
};

const enablePushNotifications = async () => {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return;
  // Stub: real VAPID key needed from backend
  setNotifPrefs((p) => ({ ...p, push_30min: true }));
};
```

In the Settings tab JSX:
```tsx
<div className="rounded-lg border border-[#1E2A36] bg-[#13202D] p-5">
  <h3 className="text-white font-semibold mb-4">Notifications</h3>
  <div className="space-y-3">
    {[
      { key: "email_30min", label: "Email when auction closes in 30 min" },
      { key: "email_rank_drop", label: "Email when you drop in rank" },
    ].map(({ key, label }) => (
      <label key={key} className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={notifPrefs[key as keyof typeof notifPrefs] as boolean}
          onChange={(e) =>
            setNotifPrefs((p) => ({ ...p, [key]: e.target.checked }))
          }
          className="accent-[#E94560]"
        />
        <span className="text-gray-300 text-sm">{label}</span>
      </label>
    ))}
    <div className="flex items-center gap-3">
      <input
        type="checkbox"
        checked={notifPrefs.push_30min}
        onChange={() => enablePushNotifications()}
        className="accent-[#E94560]"
      />
      <span className="text-gray-300 text-sm">
        Push: Auction closes in 30 min
      </span>
      {!notifPrefs.push_30min && (
        <span className="text-xs text-[#FFB547]">
          (requires browser permission)
        </span>
      )}
    </div>
  </div>
  <button
    onClick={saveNotifPrefs}
    disabled={notifLoading}
    className="mt-4 bg-[#E94560] text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
  >
    {notifSaved ? "Saved!" : notifLoading ? "Saving…" : "Save Preferences"}
  </button>
</div>
```

**Step 2: Verify**

```bash
npx tsc --noEmit
```
Navigate to profile > Settings. Confirm notification section renders. Toggle checkboxes. Click save — confirm it fires the API (404 is fine for now, stub pending backend).

**Step 3: Commit**

```bash
git add src/app/(pages)/profile/page.tsx
git commit -m "feat: add notification preferences UI to profile settings (backend stub)"
```

---

### Task 9: Ladder Tiers (Tournament Lobby)

**Files:**
- Create: `src/app/components/LadderProgress.tsx`
- Create: `src/app/(pages)/tournaments/ladder/page.tsx`
- Modify: `src/app/(pages)/tournaments/page.tsx`

**Step 1: Create `LadderProgress.tsx`**

```tsx
// src/app/components/LadderProgress.tsx
"use client";

export const TIERS = [
  { id: "rookie", label: "Rookie", color: "#94A3B8", minPoints: 0 },
  { id: "silver", label: "Silver", color: "#C0C0C0", minPoints: 100 },
  { id: "gold", label: "Gold", color: "#FFB547", minPoints: 300 },
  { id: "pro", label: "Pro", color: "#E94560", minPoints: 750 },
] as const;

interface LadderData {
  tier: "rookie" | "silver" | "gold" | "pro";
  points: number;
  rank: number;
  nextTierThreshold: number;
}

interface LadderProgressProps {
  data: LadderData | null;
}

export function LadderProgress({ data }: LadderProgressProps) {
  if (!data) {
    return (
      <div className="rounded-lg border border-[#1E2A36] bg-[#13202D] p-5 animate-pulse">
        <div className="h-4 bg-[#1E2A36] rounded w-1/2 mb-3" />
        <div className="h-2 bg-[#1E2A36] rounded w-full" />
      </div>
    );
  }

  const currentTier = TIERS.find((t) => t.id === data.tier) ?? TIERS[0];
  const nextTier = TIERS[TIERS.indexOf(currentTier) + 1];
  const pct = nextTier
    ? Math.min(
        Math.round(
          ((data.points - currentTier.minPoints) /
            (nextTier.minPoints - currentTier.minPoints)) *
            100
        ),
        100
      )
    : 100;

  return (
    <div className="rounded-lg border border-[#1E2A36] bg-[#13202D] p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-white" style={{ color: currentTier.color }}>
          {currentTier.label} Tier
        </span>
        <span className="text-xs text-gray-400 font-mono">#{data.rank}</span>
      </div>
      <div className="w-full bg-[#0A0A1A] rounded-full h-2 mb-2">
        <div
          className="h-2 rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: currentTier.color }}
        />
      </div>
      <div className="flex justify-between text-xs font-mono text-gray-400">
        <span>{data.points} pts</span>
        {nextTier && <span>{nextTier.minPoints - data.points} to {nextTier.label}</span>}
        {!nextTier && <span>Max tier</span>}
      </div>
    </div>
  );
}
```

**Step 2: Create ladder page**

```tsx
// src/app/(pages)/tournaments/ladder/page.tsx
"use client";

import { useEffect, useState } from "react";
import { LadderProgress, TIERS } from "@/app/components/LadderProgress";
import Link from "next/link";

export default function LadderPage() {
  const [ladderData, setLadderData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/tournaments/ladder/me")
      .then((r) => r.json())
      .then(setLadderData)
      .catch(() => {});
  }, []);

  return (
    <main className="min-h-screen bg-[#0A0A1A] px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/tournaments" className="text-gray-400 hover:text-white text-sm">
            ← Tournaments
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Ladder</h1>
        <p className="text-gray-400 mb-8">
          Compete in tier qualifiers to climb the ladder and unlock bigger prizes.
        </p>
        <LadderProgress data={ladderData} />

        <div className="mt-8">
          <h2 className="text-xl font-bold text-white mb-4">Tier Breakdown</h2>
          <div className="space-y-3">
            {TIERS.map((tier) => (
              <div
                key={tier.id}
                className="flex items-center justify-between rounded-lg border border-[#1E2A36] bg-[#13202D] p-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: tier.color }}
                  />
                  <span className="text-white font-medium">{tier.label}</span>
                </div>
                <span className="text-gray-400 text-sm font-mono">
                  {tier.minPoints}+ pts
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
```

**Step 3: Add tier sidebar card to tournaments page**

Open `src/app/(pages)/tournaments/page.tsx`. Add ladder data fetch and sidebar card.

In `useEffect` where tournaments load, add:
```typescript
// Alongside tournament fetch:
fetch("/api/tournaments/ladder/me")
  .then((r) => r.json())
  .then((data) => { if (!data.error) setLadderData(data); })
  .catch(() => {});
```

Add `ladderData` state:
```typescript
const [ladderData, setLadderData] = useState<any>(null);
```

Add the tier card above or alongside the tournament grid:
```tsx
import { LadderProgress } from "@/app/components/LadderProgress";
import Link from "next/link";

// Add to sidebar or top of page:
<div className="mb-6">
  <div className="flex items-center justify-between mb-2">
    <h3 className="text-white font-semibold">My Tier</h3>
    <Link href="/tournaments/ladder" className="text-[#E94560] text-xs hover:underline">
      View ladder →
    </Link>
  </div>
  <LadderProgress data={ladderData} />
</div>
```

**Step 4: Verify**

```bash
npx tsc --noEmit
```
Navigate to `/tournaments`. Confirm ladder card renders (loading state is fine — backend pending). Navigate to `/tournaments/ladder`. Confirm page renders.

**Step 5: Commit**

```bash
git add src/app/components/LadderProgress.tsx src/app/(pages)/tournaments/ladder/page.tsx src/app/(pages)/tournaments/page.tsx
git commit -m "feat: add ladder tier progress UI and tournament lobby sidebar"
```

---

### Task 10: Analytics Event Additions

**Files:**
- Modify: each component from tasks 6–9 to add `useTrackEvent` calls

**Step 1: Confirm `useTrackEvent` hook exists and path**

```bash
grep -r "useTrackEvent" src/hooks/ --include="*.ts" -l
grep -r "useTrackEvent" src/ --include="*.ts" -l
grep -r "useTrackEvent" src/ --include="*.tsx" -l
```

Find the exact import path.

**Step 2: Add events to each stub component**

In `ACHDepositForm.tsx`, after deposit starts and completes:
```typescript
import { useTrackEvent } from "@/hooks/useTrackEvent"; // adjust path

const track = useTrackEvent();

// On form submit:
track("deposit_started", { method: "ach", amount: amountCents });

// On success:
track("deposit_completed", { method: "ach", amount: amountCents, transactionId: data.transactionId });
```

In `ShareCard.tsx`:
```typescript
const track = useTrackEvent();

// On modal open:
track("share_card_opened", { auctionId, predictionId });

// On copy:
track("share_card_shared", { platform: "copy" });

// On Twitter click:
track("share_card_shared", { platform: "twitter" });

// On native share:
track("share_card_shared", { platform: "native" });
```

In `DailyChallenge.tsx`, when progress reaches target:
```typescript
const track = useTrackEvent();

useEffect(() => {
  if (completed) {
    track("daily_challenge_completed", { challengeId: challenge.id, xpEarned: 50 });
  }
}, [completed]);
```

In the guest prediction form, on guest submit:
```typescript
track("pick_submitted_guest", { auctionId, predictedPrice });
```

On signup modal CTA click:
```typescript
track("signup_from_guest_gate", { picksCount: getGuestPredictions().length });
```

In notification prefs, when push opted in:
```typescript
track("notification_opted_in", { channel: "push" });
```

In ladder page on mount:
```typescript
const track = useTrackEvent();
useEffect(() => {
  if (ladderData?.tier) track("ladder_page_viewed", { currentTier: ladderData.tier });
}, [ladderData]);
```

**Step 3: Verify all event calls compile**

```bash
npx tsc --noEmit
```
Fix any type errors.

**Step 4: Commit**

```bash
git add src/app/components/ src/app/(pages)/
git commit -m "feat: add analytics event tracking across all new components"
```

---

## Final Verification

After all tasks are complete:

```bash
# Type check
npx tsc --noEmit

# Build check
npm run build

# Manual smoke test (run dev server)
npm run dev
```

Verify these routes load without errors:
- `/` — homepage with featured car hero
- `/free_play` — tabs work, default is Ending Soon
- `/daily` — daily slate renders
- `/auctions/car_view_page/[any-id]` — comps table + distribution chart load
- `/profile` — daily challenge card visible in Overview tab
- `/my_wallet` — ACH form visible
- `/tournaments` — ladder progress card visible
- `/tournaments/ladder` — tier breakdown renders

---

## Dependencies Checklist

```bash
npm install recharts
# next/og is included in Next.js 14 — no install needed
```

---

## Backend Handoff

Backend contracts are in: `docs/plans/2026-02-23-backend-api-contracts.md`

Endpoints the frontend stubs are calling (all return 404 until backend implements):
- `POST /api/guest/migrate`
- `POST /api/wallet/deposit/ach`
- `GET  /api/wallet/ach-status`
- `PATCH /api/wallet/preferred-method`
- `POST /api/notifications/push/subscribe`
- `GET  /api/notifications/preferences`
- `PATCH /api/notifications/preferences`
- `GET  /api/tournaments/ladder/me`
- `GET  /api/tournaments/schedule`
- `GET  /api/analytics/funnel`
