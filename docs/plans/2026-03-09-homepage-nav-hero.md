# Homepage Pivot — Nav & Hero Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the Velocity Markets homepage and navbar to look like a premium collector-car prediction exchange, not a fantasy sports site.

**Architecture:** Refactor `src/app/page.tsx` (Server Component) to fetch trending markets and render new layout sections. Refactor `src/app/components/Navbar.tsx` to remove dead links and add wallet balance. Add a new `LiveTicker` client component for the Framer Motion marquee. Add an `AuthorityBar` component.

**Tech Stack:** Next.js 15 App Router, Framer Motion (already installed — check `package.json`), Tailwind CSS, TypeScript.

**Design tokens (mandatory — use exactly):**
- Primary BG: `#0A0A1A`
- Hero BG: `#0F172A` (slate-900)
- Accent: `#E94560`
- Success: `#00D4AA`
- Amber: `#FFB547`
- Monospace font: JetBrains Mono for prices/countdowns

---

### Task 1: Refactor the Navbar

Remove "Free Play", "Tournaments", "Guess the Hammer", all "Coming Soon" text. New nav: Logo | Markets | Leaderboard || Wallet Balance | Profile/Auth.

**Files:**
- Modify: `src/app/components/Navbar.tsx`

**Step 1: Read the full current Navbar.tsx to understand its structure**

Read `src/app/components/Navbar.tsx` completely before editing.

**Step 2: Replace the navBarList and nav links**

Find the `navBarList` array and replace it:
```typescript
const navBarList = [
  { title: 'Markets', urlString: 'markets' },
  { title: 'Leaderboard', urlString: 'leaderboard' },
];
```

**Step 3: Remove all "Coming Soon" badges/text**

Search for "Coming Soon" strings in Navbar.tsx and delete the entire containing element. Do not replace with anything.

**Step 4: Add wallet balance display in the nav**

In the authenticated section of the navbar (where wallet/account info appears), add a USDC balance display. Import `useVelocityAuth` (already exists at `src/hooks/useVelocityAuth.ts`) and render:
```tsx
{embeddedWalletAddress && walletBalance !== null && (
  <span className="font-mono text-sm text-[#00D4AA]">
    ${walletBalance.toFixed(2)} USDC
  </span>
)}
```

**Step 5: Commit**

```bash
git add src/app/components/Navbar.tsx
git commit -m "feat(HP1.1): refactor navbar — Markets + Leaderboard only, remove dead links"
```

---

### Task 2: Create the LiveTicker component

An infinite horizontal marquee showing recent trades and shifting odds.

**Files:**
- Create: `src/app/components/LiveTicker.tsx`

**Step 1: Check if framer-motion is installed**

```bash
cat package.json | grep framer-motion
```

If not present, install it:
```bash
npm install framer-motion
```

**Step 2: Create the component**

```tsx
// src/app/components/LiveTicker.tsx
'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface TickerItem {
  label: string;
  price: string;
  change: string;
  positive: boolean;
}

const MOCK_ITEMS: TickerItem[] = [
  { label: '🏎️ 1989 Porsche 911', price: 'YES 72¢', change: '+5%', positive: true },
  { label: '🚗 2003 Ferrari 360', price: 'NO 41¢', change: '-3%', positive: false },
  { label: '🏁 1967 Corvette Stingray', price: 'YES 58¢', change: '+2%', positive: true },
  { label: '🚙 2008 BMW M3', price: 'YES 65¢', change: '+8%', positive: true },
  { label: '🏎️ 2001 Lamborghini Diablo', price: 'NO 39¢', change: '-6%', positive: false },
  { label: '🚗 1972 Mercedes 450SL', price: 'YES 71¢', change: '+4%', positive: true },
  { label: '🏁 2010 Porsche Cayman S', price: 'YES 54¢', change: '+1%', positive: true },
  { label: '🚙 1969 Mustang Mach 1', price: 'YES 68¢', change: '+9%', positive: true },
];

export default function LiveTicker() {
  const [items, setItems] = useState<TickerItem[]>(MOCK_ITEMS);

  // Try to enrich with real market data
  useEffect(() => {
    fetch('/api/markets/trending')
      .then((r) => r.json())
      .then((markets: any[]) => {
        if (!markets?.length) return;
        const real: TickerItem[] = markets.map((m) => ({
          label: `🏎️ ${m.auction?.title ?? 'Market'}`,
          price: `YES ${Math.round(m.yesPrice * 100)}¢`,
          change: '+' + (Math.random() * 10).toFixed(0) + '%',
          positive: true,
        }));
        setItems([...real, ...MOCK_ITEMS].slice(0, 12));
      })
      .catch(() => {});
  }, []);

  // Duplicate for seamless loop
  const doubled = [...items, ...items];

  return (
    <div className="w-full overflow-hidden bg-[#0F172A] border-b border-[#1E2A36] py-2">
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">{item.label}:</span>
            <span className="font-mono font-semibold text-white">{item.price}</span>
            <span className={`font-mono text-xs ${item.positive ? 'text-[#00D4AA]' : 'text-[#E94560]'}`}>
              {item.change}
            </span>
            <span className="text-[#1E2A36]">|</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add src/app/components/LiveTicker.tsx
git commit -m "feat(HP1.2): LiveTicker — Framer Motion marquee with real + mock trade data"
```

---

### Task 3: Create the AuthorityBar component

Replaces the "0 predictions / 0 players" stats with auction house logos.

**Files:**
- Create: `src/app/components/AuthorityBar.tsx`

**Step 1: Create the component**

```tsx
// src/app/components/AuthorityBar.tsx
export default function AuthorityBar() {
  const houses = [
    { name: 'Bring a Trailer', abbr: 'BaT' },
    { name: 'RM Sotheby\'s', abbr: 'RM' },
    { name: 'Mecum', abbr: 'MECUM' },
    { name: 'Gooding & Company', abbr: 'GOODING' },
  ];

  return (
    <div className="w-full border-t border-[#1E2A36] bg-[#0A0A1A] py-6">
      <div className="mx-auto max-w-5xl px-4">
        <p className="mb-4 text-center text-xs uppercase tracking-widest text-gray-600">
          Auction data sourced from
        </p>
        <div className="flex items-center justify-center gap-10 flex-wrap">
          {houses.map((h) => (
            <span
              key={h.abbr}
              className="font-mono text-sm font-bold tracking-wider text-gray-600 opacity-60"
            >
              {h.abbr}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/components/AuthorityBar.tsx
git commit -m "feat(HP1.3): AuthorityBar — replace zero-stats with auction house trust signals"
```

---

### Task 4: Create the TrendingMarketsSection server component

Fetches top 4 active markets server-side and renders them with YES/NO buttons wired to TradingDrawer.

**Files:**
- Create: `src/app/components/TrendingMarketsSection.tsx`

**Step 1: Create the server component wrapper + client card**

```tsx
// src/app/components/TrendingMarketsSection.tsx
import TrendingMarketsClient from './TrendingMarketsClient';

async function fetchTrendingMarkets() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/markets/trending`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function TrendingMarketsSection() {
  const markets = await fetchTrendingMarkets();
  return <TrendingMarketsClient markets={markets} />;
}
```

**Step 2: Create the client component with TradingDrawer integration**

```tsx
// src/app/components/TrendingMarketsClient.tsx
'use client';

import { useState } from 'react';
import TradingDrawer from './trading/TradingDrawer';
import { usePrivy } from '@privy-io/react-auth';
import Image from 'next/image';
import CountdownInline from './CountdownInline';

interface Market {
  _id: string;
  auctionId: string;
  question: string;
  yesPrice: number;
  noPrice: number;
  totalVolume: number;
  auction: { title: string | null; image: string | null; deadline: string | null };
}

interface Props {
  markets: Market[];
}

export default function TrendingMarketsClient({ markets }: Props) {
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [selectedOutcome, setSelectedOutcome] = useState<'YES' | 'NO'>('YES');
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Privy may not be available if env var is unset — handle gracefully
  let login: (() => void) | null = null;
  let authenticated = false;
  try {
    const privy = usePrivy();
    login = privy.login;
    authenticated = privy.authenticated;
  } catch {
    // Privy not configured
  }

  function handleTrade(market: Market, outcome: 'YES' | 'NO') {
    if (!authenticated && login) {
      login();
      return;
    }
    setSelectedMarket(market);
    setSelectedOutcome(outcome);
    setDrawerOpen(true);
  }

  if (!markets.length) {
    return (
      <div className="text-center py-12 text-gray-500 text-sm">
        No active markets yet — check back soon.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {markets.map((market) => (
          <div
            key={market._id}
            className="rounded-xl overflow-hidden border border-[#1E2A36] bg-[#0F172A] flex flex-col"
          >
            {market.auction.image && (
              <div className="relative h-40 w-full bg-gray-900">
                <img
                  src={market.auction.image}
                  alt={market.auction.title ?? ''}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent" />
              </div>
            )}
            <div className="flex flex-col flex-1 p-4 gap-3">
              <p className="text-sm font-medium text-white leading-snug line-clamp-2">
                {market.auction.title ?? market.question}
              </p>
              <p className="text-xs text-gray-500 line-clamp-2">{market.question}</p>
              {market.auction.deadline && (
                <p className="text-xs font-mono text-[#FFB547]">
                  <CountdownInline deadline={market.auction.deadline} />
                </p>
              )}
              <div className="flex gap-2 mt-auto">
                <button
                  onClick={() => handleTrade(market, 'YES')}
                  className="flex-1 rounded-lg bg-[#00D4AA]/10 border border-[#00D4AA]/30 py-2 text-sm font-mono font-semibold text-[#00D4AA] hover:bg-[#00D4AA]/20 transition-colors"
                >
                  YES {Math.round(market.yesPrice * 100)}¢
                </button>
                <button
                  onClick={() => handleTrade(market, 'NO')}
                  className="flex-1 rounded-lg bg-[#E94560]/10 border border-[#E94560]/30 py-2 text-sm font-mono font-semibold text-[#E94560] hover:bg-[#E94560]/20 transition-colors"
                >
                  NO {Math.round(market.noPrice * 100)}¢
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedMarket && (
        <TradingDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          marketId={selectedMarket._id}
          auctionId={selectedMarket.auctionId}
          initialOutcome={selectedOutcome}
        />
      )}
    </>
  );
}
```

**Step 3: Read the TradingDrawer props signature**

Before writing the above, read `src/app/components/trading/TradingDrawer.tsx` to verify the exact prop names (`open`, `onClose`, `marketId`, `auctionId`, `initialOutcome`). Adjust the TrendingMarketsClient code to match the actual props.

**Step 4: Commit**

```bash
git add src/app/components/TrendingMarketsSection.tsx src/app/components/TrendingMarketsClient.tsx
git commit -m "feat(HP2.2+HP2.3): TrendingMarketsSection — server fetch + YES/NO trade buttons"
```

---

### Task 5: Rebuild page.tsx — wire everything together

Replace the homepage content with the new layout.

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Read the full current page.tsx first**

Read `src/app/page.tsx` completely to understand all imports and the existing JSX structure before editing.

**Step 2: Replace the page with the new layout**

The new `page.tsx` keeps the `export const dynamic = 'force-dynamic'` directive and `getServerSession` call but strips the old stats queries. Replace the JSX return with:

```tsx
import LiveTicker from './components/LiveTicker';
import TrendingMarketsSection from './components/TrendingMarketsSection';
import AuthorityBar from './components/AuthorityBar';
// Keep existing imports for getServerSession, authOptions

export default async function Home() {
  // Keep session check for wallet balance in navbar
  const session = await getServerSession(authOptions);

  return (
    <main className="min-h-screen bg-[#0A0A1A] text-white">
      {/* Live Activity Ticker */}
      <LiveTicker />

      {/* Hero Section */}
      <section className="relative flex h-[45vh] items-center justify-center overflow-hidden bg-[#0F172A]">
        {/* Background image — use a dark automotive photo */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1580274455191-1c62238fa333?auto=format&fit=crop&w=1920&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/40 via-transparent to-[#0A0A1A]" />

        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <h1 className="mb-3 text-5xl font-bold tracking-tight text-white md:text-6xl">
            Trade on the Hammer Price.
          </h1>
          <p className="text-lg text-gray-300 md:text-xl">
            The prediction market for collector car auctions.
          </p>
          <a
            href="/markets"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#E94560] px-6 py-3 text-sm font-semibold text-white hover:bg-[#E94560]/90 transition-colors"
          >
            Browse Markets →
          </a>
        </div>
      </section>

      {/* Trending Markets — overlaps hero bottom */}
      <section className="relative z-10 -mt-12 mx-auto max-w-6xl px-4 pb-16">
        <h2 className="mb-6 text-lg font-semibold text-gray-300">
          Trending Markets
        </h2>
        <TrendingMarketsSection />
      </section>

      {/* Authority Bar */}
      <AuthorityBar />
    </main>
  );
}
```

**Step 3: Remove old imports that are no longer used**

After replacing the JSX, remove any import lines that are now unused (CountdownTimer, HowItWorks, LiveAuctionsSection, Badge, Card, etc.). Run the build to catch unused import errors:

```bash
npm run build 2>&1 | grep "error TS\|Error:" | head -20
```

Fix any TypeScript errors before committing.

**Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat(HP2.1): homepage pivot — exchange hero, trending markets, authority bar"
```
