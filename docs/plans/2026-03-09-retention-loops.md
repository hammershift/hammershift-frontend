# Retention Loops — Daily Hammer & Leaderboard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build two retention features: a "Daily Hammer" price-guess widget (lead-gen + Privy auth hook) and a full `/leaderboard` page with social sharing.

**Architecture:** DailyHammer is a client component on the homepage. It shows a qualifying auction, captures a price guess, fires Privy login for unauthenticated users, and writes to a new `daily_guesses` MongoDB collection. The Leaderboard is a new route (`/leaderboard`) with a Server Component that aggregates `Predictions` data and renders a shadcn-style data table.

**Tech Stack:** Next.js 15 App Router, MongoDB (raw `mongoose.connection.db`), Privy (`usePrivy`), Tailwind CSS, TypeScript.

**Design tokens:** BG `#0A0A1A`, Accent `#E94560`, Success `#00D4AA`, Amber `#FFB547`. Monospace (JetBrains Mono) for prices.

---

### Task 1: Create the `daily_guesses` MongoDB collection + API route

**Files:**
- Create: `src/app/api/daily-guess/route.ts`

**Step 1: Create the POST endpoint**

```typescript
// src/app/api/daily-guess/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectToDB from '@/lib/mongoose';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { auctionId, guessedPrice } = body;

  if (!auctionId || typeof guessedPrice !== 'number' || guessedPrice <= 0) {
    return NextResponse.json({ error: 'Invalid guess' }, { status: 400 });
  }

  await connectToDB();
  const db = mongoose.connection.db!;

  // One guess per user per auction
  const existing = await db.collection('daily_guesses').findOne({
    userId: session.user.id ?? session.user.email,
    auctionId,
  });

  if (existing) {
    return NextResponse.json({ error: 'Already guessed for this auction' }, { status: 409 });
  }

  await db.collection('daily_guesses').insertOne({
    userId: session.user.id ?? session.user.email,
    userEmail: session.user.email,
    auctionId,
    guessedPrice,
    submittedAt: new Date(),
  });

  return NextResponse.json({ ok: true });
}
```

**Step 2: Commit**

```bash
git add src/app/api/daily-guess/route.ts
git commit -m "feat(HP3.1): daily-guess API route — POST guess to daily_guesses collection"
```

---

### Task 2: Create the DailyHammer widget component

**Files:**
- Create: `src/app/components/DailyHammer.tsx`

**Step 1: Create the component**

```tsx
// src/app/components/DailyHammer.tsx
'use client';

import { useState, useEffect } from 'react';
import CountdownInline from './CountdownInline';

interface DailyHammerProps {
  /** A qualifying auction object fetched server-side */
  auction: {
    auctionId: string;
    title: string;
    image: string | null;
    deadline: string | null;
  } | null;
}

export default function DailyHammer({ auction }: DailyHammerProps) {
  const [guess, setGuess] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Privy — graceful if not configured
  let login: (() => void) | null = null;
  let authenticated = false;
  try {
    const { usePrivy } = require('@privy-io/react-auth');
    const privy = usePrivy();
    login = privy.login;
    authenticated = privy.authenticated;
  } catch {
    // Privy not configured — fall back to NextAuth session check
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!auction) return;

    const parsed = parseFloat(guess.replace(/[^0-9.]/g, ''));
    if (isNaN(parsed) || parsed <= 0) {
      setError('Enter a valid price');
      return;
    }

    // Auth gate: fire Privy login if not authenticated
    if (!authenticated && login) {
      // Store pending guess in sessionStorage — user can submit after auth
      sessionStorage.setItem('pending_guess', JSON.stringify({ auctionId: auction.auctionId, guessedPrice: parsed }));
      login();
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/daily-guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auctionId: auction.auctionId, guessedPrice: parsed }),
      });

      if (res.status === 409) {
        setError('You already submitted a guess for this auction.');
        setSubmitted(true);
        return;
      }

      if (!res.ok) throw new Error('Failed');
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  // After Privy auth, submit the pending guess
  useEffect(() => {
    if (!authenticated) return;
    const pending = sessionStorage.getItem('pending_guess');
    if (!pending) return;
    sessionStorage.removeItem('pending_guess');
    const { auctionId, guessedPrice } = JSON.parse(pending);
    if (auction?.auctionId !== auctionId) return;
    fetch('/api/daily-guess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auctionId, guessedPrice }),
    }).then(() => setSubmitted(true)).catch(() => {});
  }, [authenticated]);

  if (!auction) return null;

  return (
    <section className="w-full bg-[#0F172A] border-t border-[#1E2A36] py-12">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-6 text-center">
          <p className="text-xs uppercase tracking-widest text-[#FFB547] mb-1">Daily Hammer</p>
          <h2 className="text-2xl font-bold text-white">What's it worth?</h2>
        </div>

        <div className="rounded-2xl overflow-hidden border border-[#1E2A36] bg-[#0A0A1A]">
          {auction.image && (
            <div className="relative h-56 w-full">
              <img src={auction.image} alt={auction.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A1A] via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-lg font-semibold text-white">{auction.title}</p>
                {auction.deadline && (
                  <p className="text-xs font-mono text-[#FFB547] mt-1">
                    Closes in: <CountdownInline deadline={auction.deadline} />
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="p-6">
            {submitted ? (
              <div className="text-center py-4">
                <p className="text-[#00D4AA] text-lg font-semibold">Guess submitted! ✓</p>
                <p className="text-gray-400 text-sm mt-1">Results after the auction closes.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-lg">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    placeholder="Guess the exact hammer price..."
                    className="w-full rounded-xl border border-[#1E2A36] bg-[#0F172A] pl-8 pr-4 py-4 font-mono text-xl text-white placeholder:text-gray-600 focus:border-[#E94560] focus:outline-none"
                  />
                </div>
                {error && <p className="text-[#E94560] text-sm">{error}</p>}
                <p className="text-xs text-gray-500 text-center">
                  Closest exact guess wins $50 in USDC trading credits.
                </p>
                <button
                  type="submit"
                  disabled={loading || !guess}
                  className="w-full rounded-xl bg-[#E94560] py-4 font-semibold text-white disabled:opacity-50 hover:bg-[#E94560]/90 transition-colors"
                >
                  {loading ? 'Submitting...' : 'Submit Guess →'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Wire DailyHammer into page.tsx**

In `src/app/page.tsx`, fetch one high-profile qualifying auction server-side and pass it to `<DailyHammer>`. Add this to `getHomePageData()` or inline in the Server Component:

```typescript
// Fetch one qualifying car for Daily Hammer
const QUALIFYING_MAKES_REGEX = /ferrari|lamborghini|corvette|mercedes|bmw|maserati|alfa romeo|mustang|porsche|camaro/i;

const dailyHammerAuction = await db.collection('auctions').findOne({
  isActive: true,
  'sort.deadline': { $gt: now },
  title: { $regex: QUALIFYING_MAKES_REGEX },
}, { projection: { _id: 1, auction_id: 1, title: 1, image: 1, 'sort.deadline': 1 } });

// Map to DailyHammer prop shape:
const dailyHammer = dailyHammerAuction ? {
  auctionId: dailyHammerAuction.auction_id ?? dailyHammerAuction._id.toString(),
  title: dailyHammerAuction.title,
  image: dailyHammerAuction.image ?? null,
  deadline: dailyHammerAuction.sort?.deadline?.toISOString() ?? null,
} : null;
```

Then in JSX, after the TrendingMarketsSection and before AuthorityBar:
```tsx
<DailyHammer auction={dailyHammer} />
```

**Step 3: Commit**

```bash
git add src/app/components/DailyHammer.tsx src/app/page.tsx
git commit -m "feat(HP3.1+HP3.2): DailyHammer widget — guess form, Privy auth hook, daily_guesses write"
```

---

### Task 3: Create the `/api/leaderboard` route

**Files:**
- Create: `src/app/api/leaderboard/route.ts`

**Step 1: Create the aggregation endpoint**

```typescript
// src/app/api/leaderboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDB from '@/lib/mongoose';
import mongoose from 'mongoose';
import { startOfWeek, startOfMonth } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const period = searchParams.get('period') ?? 'all'; // 'all' | 'week' | 'month'

  await connectToDB();
  const db = mongoose.connection.db!;

  const matchStage: Record<string, any> = {
    score: { $exists: true, $ne: null },
  };

  if (period === 'week') {
    matchStage.createdAt = { $gte: startOfWeek(new Date()) };
  } else if (period === 'month') {
    matchStage.createdAt = { $gte: startOfMonth(new Date()) };
  }

  const results = await db.collection('predictions').aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$user.userId',
        username: { $first: '$user.username' },
        userImage: { $first: '$user.userImage' },
        totalScore: { $sum: '$score' },
        totalPredictions: { $sum: 1 },
        wins: { $sum: { $cond: [{ $gt: ['$score', 0] }, 1, 0] } },
        streak: { $max: '$streak' },
      },
    },
    { $sort: { totalScore: -1 } },
    { $limit: 100 },
  ]).toArray();

  const ranked = results.map((r, i) => ({
    rank: i + 1,
    userId: r._id,
    username: r.username ?? 'Anonymous',
    userImage: r.userImage ?? null,
    totalScore: r.totalScore ?? 0,
    totalPredictions: r.totalPredictions ?? 0,
    winRate: r.totalPredictions > 0 ? Math.round((r.wins / r.totalPredictions) * 100) : 0,
    streak: r.streak ?? 0,
  }));

  return NextResponse.json(ranked);
}
```

**Step 2: Commit**

```bash
git add src/app/api/leaderboard/route.ts
git commit -m "feat(HP3.3): /api/leaderboard — aggregated rankings by score, period filter"
```

---

### Task 4: Build the `/leaderboard` page

**Files:**
- Create: `src/app/(pages)/leaderboard/page.tsx`

Note: There may already be a `leaderboard` or `leaderboards` directory. Read `src/app/(pages)/leaderboard/` first. If `page.tsx` exists, read it and extend it. If it does not exist, create it.

**Step 1: Check for existing leaderboard page**

```bash
ls src/app/\(pages\)/leaderboard/ 2>/dev/null || ls src/app/\(pages\)/leaderboards/ 2>/dev/null
```

**Step 2: Create (or replace) the page**

```tsx
// src/app/(pages)/leaderboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Trophy } from 'lucide-react';

type Period = 'all' | 'week' | 'month';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  userImage: string | null;
  totalScore: number;
  winRate: number;
  streak: number;
  totalPredictions: number;
}

const TABS: { label: string; value: Period }[] = [
  { label: 'All Time', value: 'all' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
];

function twitterShareUrl(entry: LeaderboardEntry): string {
  const text = encodeURIComponent(
    `I'm ranked #${entry.rank} on @VelocityMarkets with ${entry.totalScore.toLocaleString()} pts and a ${entry.winRate}% win rate 🏎️`
  );
  return `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent('https://velocity-markets.com/leaderboard')}`;
}

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>('all');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard?period=${period}`)
      .then((r) => r.json())
      .then((data) => { setEntries(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [period]);

  return (
    <main className="min-h-screen bg-[#0A0A1A] text-white pb-20">
      <div className="mx-auto max-w-4xl px-4 pt-12">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <Trophy className="h-7 w-7 text-[#FFB547]" />
          <h1 className="text-3xl font-bold">Leaderboard</h1>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setPeriod(tab.value)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                period === tab.value
                  ? 'bg-[#E94560] text-white'
                  : 'bg-[#0F172A] text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-xl overflow-hidden border border-[#1E2A36]">
          <table className="w-full">
            <thead className="bg-[#0F172A]">
              <tr className="text-xs uppercase tracking-wider text-gray-500">
                <th className="px-4 py-3 text-left">Rank</th>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-right font-mono">Score</th>
                <th className="px-4 py-3 text-right font-mono">Win %</th>
                <th className="px-4 py-3 text-right font-mono">Streak</th>
                <th className="px-4 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2A36]">
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="animate-pulse bg-[#0A0A1A]">
                    <td className="px-4 py-4"><div className="h-4 w-8 bg-[#1E2A36] rounded" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-32 bg-[#1E2A36] rounded" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-16 bg-[#1E2A36] rounded ml-auto" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-12 bg-[#1E2A36] rounded ml-auto" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-8 bg-[#1E2A36] rounded ml-auto" /></td>
                    <td className="px-4 py-4"></td>
                  </tr>
                ))
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    No predictions yet for this period.
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.userId} className="bg-[#0A0A1A] hover:bg-[#0F172A] transition-colors">
                    <td className="px-4 py-4">
                      <span className={`font-mono font-bold ${
                        entry.rank === 1 ? 'text-[#FFB547]' :
                        entry.rank === 2 ? 'text-gray-300' :
                        entry.rank === 3 ? 'text-amber-600' : 'text-gray-500'
                      }`}>
                        #{entry.rank}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {entry.userImage ? (
                          <img src={entry.userImage} alt="" className="h-8 w-8 rounded-full object-cover" />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-[#1E2A36] flex items-center justify-center text-xs text-gray-400">
                            {entry.username[0]?.toUpperCase()}
                          </div>
                        )}
                        <span className="text-sm font-medium text-white">{entry.username}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-sm text-[#00D4AA]">
                      {entry.totalScore.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-sm text-gray-300">
                      {entry.winRate}%
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-sm text-[#FFB547]">
                      {entry.streak > 0 ? `🔥${entry.streak}` : '—'}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <a
                        href={twitterShareUrl(entry)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-[#1E2A36] px-3 py-1 text-xs text-gray-400 hover:border-[#E94560] hover:text-[#E94560] transition-colors"
                      >
                        Share
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
```

**Step 3: Commit**

```bash
git add src/app/\(pages\)/leaderboard/page.tsx src/app/api/leaderboard/route.ts
git commit -m "feat(HP3.3): /leaderboard page — ranked table, period tabs, Share to X button"
```
