# Homepage Pivot Design — Velocity Markets

**Goal:** Transform the static homepage into a live prediction market exchange for collector cars.

**Architecture:** Four parallel workstreams. Each is independent and can ship without blocking the others.

---

## System Architecture

```
[Scraper] → MongoDB auctions
                ↓
         [Market Factory Cron]  ← /api/cron/create-markets, runs every 15 min
                ↓
         MongoDB polygon_markets
                ↓
         [Homepage Server Component]
                ↓
         Trending Markets → TradingDrawer → Privy auth → Biconomy gasless trade
```

**Existing:** Scraper, `PolygonMarket` model, `TradingDrawer`, Privy, Biconomy.
**New:** Market Factory cron, homepage pivot, live ticker, onboarding modal, leaderboard, Daily Hammer.

---

## Agent 1: Market Factory Pipeline

**File:** `src/app/api/cron/create-markets/route.ts`

**Qualifying makes:** Ferrari, Lamborghini, Corvette, Mercedes, BMW, Maserati, Alfa Romeo, Mustang, Porsche, Camaro.

**Logic (runs every 15 minutes):**
1. Query `auctions` where `make` matches the filter list and `closing_date > now`.
2. For each result, check whether a `PolygonMarket` with that `auctionId` already exists.
3. If not, create a market:
   - `question`: `"Will the {year} {make} {model} sell above estimate?"`
   - `yesPrice: 0.50`, `noPrice: 0.50`
   - `status: 'open'`
   - `closesAt`: auction closing date
   - `imageUrl`, `title`, `make`, `model`, `year` copied from the auction doc
4. Auto-close and resolve when the auction's `status` becomes `sold`.

**Constraint:** Idempotent. A `findOne` check before creation prevents duplicates.

**New model:** `dailyGuess` collection: `{ userId, auctionId, guessedPrice, submittedAt }`.

---

## Agent 2: Homepage Pivot (HP1 + HP2)

### Navigation (HP1.1)

Remove: `Free Play`, `Tournaments`, `Guess the Hammer`, all "Coming Soon" text.

New nav: `[Logo] | Markets | Leaderboard || [Wallet Balance (USDC)] | [Profile/Auth]`

### Live Activity Ticker (HP1.2)

Framer Motion infinite marquee directly below nav. Displays recent trades and shifting odds:
`🏎️ 1989 Porsche 911: YES 72¢ (+5%)`

Feed: last 20 trades from `polygon_markets` + `trades` collection. Loops continuously.

### Authority Bar (HP1.3)

Replaces the "0 predictions / 0 active players" section. Shows grayscale SVG logos: Bring a Trailer, RM Sotheby's, Mecum. No numbers.

### Hero Section (HP2.1)

Height: `h-[45vh]`. Background: cinematic dark automotive photography at 0.6 opacity over `#0F172A`.

- H1: `"Trade on the Hammer Price."`
- H2: `"The prediction market for collector car auctions."`
- CTA: `[Browse Markets →]`

### Trending Markets (HP2.2 + HP2.3)

Server Component. Fetches top 4 open `PolygonMarket` docs sorted by `volumeUsd desc`. Renders below the hero with `-mt-12` overlap.

Each card: reuses `MarketCard` from `/markets`. YES/NO buttons open the existing `TradingDrawer`. Unauthenticated click fires Privy `login()`.

**Full page layout:**
```
NAV
LIVE TICKER
HERO [45vh]
  └── TRENDING MARKETS [-mt-12 overlap]
DAILY HAMMER WIDGET
AUTHORITY BAR
```

---

## Agent 3: Retention Loops (HP3)

### Daily Hammer Widget (HP3.1 + HP3.2)

Standalone component below Trending Markets. Displays one high-profile qualifying auction.

UI:
- Full-width car image
- Car title + live countdown to auction close
- Large numeric input: `[Guess the exact hammer price...]`
- Microcopy: `"Closest exact guess wins $50 in USDC trading credits."`
- CTA: `[Submit Guess →]`

Auth hook: unauthenticated submit fires Privy invisible signup (email capture + wallet creation), then records the guess. Authenticated users submit directly. Guess stored in `dailyGuess` collection.

### Leaderboard Page (HP3.3)

Route: `/leaderboard`

shadcn/ui data table. Columns: `Rank | User | All-Time Profit | Win Streak | Total Volume`

Tabs: `All Time` / `This Week` / `This Month`

Each row: `[Share to X]` button → prefilled tweet: `"I'm ranked #{rank} on @VelocityMarkets with ${profit} profit 🏎️"`

Data source: aggregate from existing `Prediction` + `Wallet` models via `/api/leaderboard` route.

---

## Agent 4: Onboarding Modal

**Trigger:** First visit. Check `localStorage` for `vm_onboarded` flag. Modal renders over the homepage; does not block navigation.

**Step 1 — What is Velocity Markets?**
> "Trade YES/NO on whether collector cars sell above their estimate. Real auctions. Real money."

**Step 2 — How do trades work?**
> "Buy YES or NO shares in USDC. Shares resolve to $1 if correct, $0 if wrong. No gas fees."

**Step 3 — Get started free**
> "Create your wallet in seconds. No seed phrases. Just email."
> CTA: `[Connect with Email →]` | `[Skip]`

Step 3 CTA fires Privy `login()`. Both completing auth and clicking Skip set `vm_onboarded = true` in localStorage and close the modal.

---

## Design Tokens (mandatory)

| Token | Value |
|-------|-------|
| Primary BG | `#0A0A1A` |
| Hero BG | `#0F172A` (slate-900) |
| Accent | `#E94560` |
| Success | `#00D4AA` |
| Amber | `#FFB547` |
| Monospace font | JetBrains Mono (prices, scores, countdowns) |
| Hero photo opacity | `0.6` |

---

## What Does Not Change

- Existing `TradingDrawer` component
- Existing `PolygonMarket` Mongoose model fields (add only)
- `/markets` page
- Privy + Biconomy wiring
- NextAuth session handling
