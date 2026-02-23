# Velocity Markets — Top 10 ROI Features Design

**Date:** February 23, 2026
**Scope:** Top 10 highest-ROI features across acquisition → activation → retention → monetization
**Approach:** Option C — One design doc, two execution tracks
**Status:** Approved for implementation planning

---

## Execution Strategy

### Two-Track Split

```
Track 1 — Frontend Only (build now)         Track 2 — Needs Backend (design + stub)
──────────────────────────────────────       ──────────────────────────────────────────
1. Sort fix + Live/Ending Soon tabs          6.  Guest mode (auth flow + localStorage)
2. Daily slate + featured car                7.  Wallet / ACH redesign
3. Streak UI + daily challenge badge         8.  Auction close notifications
4. Shareable prediction card                 9.  Ladder tiers (tournament lobby)
5. Market page comps + price chart           10. Analytics event additions
```

### Stack Additions Required
- `recharts` — price distribution histogram (Track 1, item 5)
- `next/og` (`ImageResponse`) — shareable prediction card (Track 1, item 4)
- No new MongoDB models required — extends existing `streak`, `badge`, `prediction`, `auction`

### Constraints
- No breaking changes to existing auth, models, or API routes
- Design system: `#0A0A1A` bg, `#E94560` accent, `#00D4AA` success, `#FFB547` amber, JetBrains Mono for all numbers
- Mobile-first, all components responsive

---

## Track 1: Frontend-Only Features

### 1. Sort Fix + Live/Ending Soon Tabs

**Goal:** Default sort shows live auctions, never ended ones first. Remove "dead site" signal.

**Files changed:**
- `src/app/(pages)/free_play/page.tsx` — change default `status` param to `"ending_soon"`. Add tab bar.
- `src/app/api/cars/route.ts` — add `"starting_soon"` status (deadline > now + 24h).

**Tab bar UI:**
```
[ Live Now (12) ] [ Ending Soon (8) ] [ Starting Soon (5) ] [ Ended ]
```
- Active tab: `#E94560` bottom border
- Counts fetched via `GET /api/cars?status=<tab>&limit=0` (count only)
- Ended tab: always last, never default
- URL reflects active tab: `?status=live_now` for shareability

**API change — new `starting_soon` status:**
```typescript
"starting_soon": sort.deadline > new Date(Date.now() + 24 * 60 * 60 * 1000)
```

---

### 2. Daily Slate + Featured Car

**Goal:** Give users a clear daily action. One headline car. Everything else below the fold.

**Files changed:**
- `src/app/page.tsx` — restructure hero: single featured car, single CTA button
- `src/app/(pages)/daily/page.tsx` — new page: auctions closing within 24h
- `src/app/components/DailySlate.tsx` — new component used by both homepage and daily page

**Homepage hero restructure:**
```
┌─────────────────────────────────────────┐
│  [Car image — full width hero]           │
│  1987 Ferrari F40                        │
│  Current bid: $2,400,000  Ends: 4h 22m  │
│                                          │
│  [ Make Your Pick → ]                    │
│                                          │
│  ──── Today's 14 auctions ────           │
│  [card] [card] [card] [card] ...         │
└─────────────────────────────────────────┘
```

**Featured car selection (server-side):**
```typescript
Auctions.findOne({
  isActive: true,
  "sort.deadline": { $gt: now, $lt: now + 48h },
}).sort({ prediction_count: -1 }) // most social proof
```

**Daily slate page (`/daily`):**
- Header: "Today's Slate — [N] auctions closing in the next 24 hours"
- Grid of AuctionCards sorted by deadline ascending
- "No picks today" empty state with "Browse all auctions" CTA

---

### 3. Streak UI + Daily Challenge Badge

**Goal:** Drive daily habit. Extend existing streak system with visible daily challenge.

**Files changed:**
- `src/app/components/DailyChallenge.tsx` — new component
- `src/app/(pages)/profile/page.tsx` — add DailyChallenge to Overview tab
- `src/app/components/navbar.tsx` — add daily challenge indicator (dot/badge) if challenge incomplete

**DailyChallenge component:**
- Hardcoded weekly challenge rotation (no backend needed):
  ```typescript
  const CHALLENGES = [
    { id: 'pick_3', label: 'Make 3 picks today', target: 3, metric: 'picks_today' },
    { id: 'within_5pct', label: 'Hit within 5% on any car', target: 1, metric: 'accurate_picks_today' },
    { id: 'new_make', label: 'Pick a make you\'ve never picked', target: 1, metric: 'new_make_today' },
  ]
  // Rotate by day of week: CHALLENGES[dayOfWeek % CHALLENGES.length]
  ```
- Progress: checks `/api/myPredictions?since=today` count
- Reward: badge XP popup on completion, updates `Badge` collection via `/api/events/track`

**UI:**
```
┌──────────────────────────────────┐
│ 🎯 Daily Challenge               │
│ Make 3 picks today               │
│ ████████░░  2 / 3                │
│ Reward: +50 XP + Hot Streak badge│
└──────────────────────────────────┘
```

---

### 4. Shareable Prediction Card

**Goal:** Social sharing drives top-of-funnel acquisition.

**Files changed:**
- `src/app/api/share/prediction/route.ts` — new OG image route
- `src/app/components/ShareCard.tsx` — share button + modal
- `src/app/(pages)/auctions/car_view_page/[id]/page.tsx` — add ShareCard after prediction submit

**OG image route:**
```typescript
// GET /api/share/prediction?predictionId=xxx
// Returns: PNG image via ImageResponse (next/og)
export async function GET(req: NextRequest) {
  const { predictionId } = params
  const prediction = await Predictions.findById(predictionId).populate('auction')
  return new ImageResponse(<ShareCardTemplate prediction={prediction} />, { width: 1200, height: 630 })
}
```

**Card design (1200×630):**
```
┌─────────────────────────────────────────────────────┐
│ [Blurred car image background]                       │
│                                                      │
│  velocity-markets.com                    🏎️          │
│                                                      │
│  I picked:                                           │
│  1987 Ferrari F40                                    │
│  $2,450,000                                          │
│                                                      │
│  Currently ranked #7 of 142 predictions              │
└─────────────────────────────────────────────────────┘
```

**ShareCard component — user-facing:**
- Appears after prediction submitted (not before)
- Buttons: Copy link | 𝕏 Twitter | Native share (mobile)
- Link: `velocity-markets.com/auctions/[id]?ref=share&predictionId=[id]`

---

### 5. Market Page Comps + Price Distribution

**Goal:** Reduce pick anxiety. Show data that makes the prediction feel informed.

**Files changed:**
- `src/app/(pages)/auctions/car_view_page/[id]/page.tsx` — new "Market Data" section
- `src/app/components/PriceDistribution.tsx` — new chart component
- `src/app/components/CompsTable.tsx` — new comps component
- `src/app/api/auctions/[id]/comps/route.ts` — new API route (frontend-implementable)

**Comps API (no backend dependency — pure MongoDB aggregate):**
```typescript
// GET /api/auctions/[id]/comps
// Returns last 5 closed auctions, same make, similar year (±5yr)
Auctions.find({
  isActive: false,
  attributes: { $elemMatch: { key: "make", value: auctionMake } },
  attributes: { $elemMatch: { key: "year", value: { $gte: year - 5, $lte: year + 5 } } },
  "sort.deadline": { $lt: new Date() }
}).sort({ "sort.deadline": -1 }).limit(5)
```

**PriceDistribution component:**
- Recharts `BarChart` — buckets of $25k width
- Shaded "consensus zone" = P25–P75 of all predictions
- Vertical line = user's pick (after submission)
- Y-axis: prediction count. X-axis: price (formatted as $Xk / $XM)

**CompsTable component:**
```
Recent Sales — 1987 Ferrari
─────────────────────────────────────────────
1989 F40   $2,310,000   Jan 2026   -6% vs this
1986 F40   $2,600,000   Dec 2025   +6% vs this
1988 F40   $1,950,000   Nov 2025  -20% vs this
```

**Layout in auction detail page:**
```
[Prediction Form]          [Market Data]
                           [PriceDistribution chart]
                           [CompsTable]
                           [Comment thread — existing]
```

---

## Track 2: Frontend Stubs + Backend API Contracts

### 6. Guest Mode — First Pick Before Signup

**Frontend implementation:**
- Remove auth gate from prediction form in `free_play` and `car_view_page`
- Allow up to 3 picks stored in `localStorage` as:
  ```typescript
  interface GuestPrediction {
    auctionId: string
    predictedPrice: number
    timestamp: number
  }
  // localStorage key: 'vm_guest_predictions'
  ```
- After 3rd pick OR on "View my results" click: show signup modal
  - Header: "Save your picks + see how you rank"
  - Google / Email signup options
- On signup completion: call `POST /api/guest/migrate`

**Backend API contract:**
```
POST /api/guest/migrate
Headers: Authorization (NextAuth session)
Body: {
  predictions: Array<{
    auctionId: string
    predictedPrice: number
  }>
}
Returns: {
  migrated: number     // how many were saved
  skipped: number      // duplicates ignored
}
```

**Frontend stub:** Button shows loading state, on error shows "Picks saved — log in anytime to see results."

---

### 7. Wallet / ACH Redesign

**Frontend implementation:**
- `src/app/(pages)/my_wallet/page.tsx` — restructure deposit section:
  - ACH shown as **primary** option for users with `deposit_count > 1`
  - Tooltip: "Save 2–3% with bank transfer"
  - Card shown as secondary / "Pay with card instead"
  - "Available to withdraw on [date]" prominently below balance for ACH holds
- First-time users: card is primary (lower friction)
- `src/app/components/ACHDepositForm.tsx` — new stub component:
  - Fields: routing number, account number, account type (checking/savings)
  - On submit: calls `POST /api/wallet/deposit/ach` (backend to implement)
  - Shows loading state + "Your funds will be available in 3–5 business days"

**Backend API contracts:**
```
POST /api/wallet/deposit/ach
Body: { amount: number, routingNumber: string, accountNumber: string, accountType: 'checking' | 'savings' }
Returns: { transactionId: string, status: 'pending', availableDate: string }

GET /api/wallet/ach-status
Returns: { isLinked: boolean, lastFour: string | null, preferredMethod: 'ach' | 'card' }

PATCH /api/wallet/preferred-method
Body: { method: 'ach' | 'card' }
Returns: { success: boolean }
```

---

### 8. Auction Close Notifications

**Frontend implementation:**
- `src/app/(pages)/profile/page.tsx` Settings tab — extend existing notification prefs section:
  ```
  Notifications
  ─────────────────────────────────────
  ☑ Email: Auction closes in 30 min
  ☑ Email: You dropped in rank
  ☐ Push: Auction closes in 30 min      [Enable browser notifications]
  ☐ SMS: Auction closes in 30 min       [Add phone number]
  ```
- Push subscription: `navigator.serviceWorker` + `PushManager.subscribe()`
  - On "Enable browser notifications" click → request permission → subscribe → POST token to backend
- SMS: Phone number input field → backend validates + stores

**Backend API contracts:**
```
POST /api/notifications/push/subscribe
Body: { subscription: PushSubscription }  // Web Push API object
Returns: { success: boolean }

PATCH /api/notifications/preferences
Body: {
  email_30min: boolean
  email_rank_drop: boolean
  push_30min: boolean
  sms_30min: boolean
  phone: string | null
}
Returns: { success: boolean }

GET /api/notifications/preferences
Returns: current preferences object matching above shape
```

---

### 9. Ladder Tiers (Tournament Lobby)

**Frontend implementation:**
- `src/app/(pages)/tournaments/page.tsx` — add "My Tier" sidebar card:
  ```
  ┌──────────────────────┐
  │ 🥈 Silver Tier        │
  │ ████████░░  80/100pts │
  │ 20 pts to Gold        │
  │ Qualifier: Thu 8pm    │
  └──────────────────────┘
  ```
- `src/app/components/LadderProgress.tsx` — tier ladder visual (Rookie → Silver → Gold → Pro)
- Tournament cards: show tier badge + padlock icon for locked tiers
- `src/app/(pages)/tournaments/ladder/page.tsx` — new page: full ladder standings + schedule

**Tier definitions (hardcoded frontend, matches backend logic):**
```typescript
const TIERS = [
  { id: 'rookie',  label: 'Rookie',  color: '#94A3B8', minPoints: 0    },
  { id: 'silver',  label: 'Silver',  color: '#C0C0C0', minPoints: 100  },
  { id: 'gold',    label: 'Gold',    color: '#FFB547', minPoints: 300  },
  { id: 'pro',     label: 'Pro',     color: '#E94560', minPoints: 750  },
]
```

**Backend API contracts:**
```
GET /api/tournaments/ladder/me
Returns: {
  tier: 'rookie' | 'silver' | 'gold' | 'pro'
  points: number
  rank: number              // rank within tier
  nextTierThreshold: number
  qualificationWindow: {
    required: number        // tourneys needed in last 14 days
    completed: number
  }
}

GET /api/tournaments/schedule
Returns: Array<{
  id: string
  tier: string
  type: 'qualifier' | 'final' | 'playoff'
  startDate: string
  prizePool: number
  filledSpots: number
  totalSpots: number
}>
```

---

### 10. Analytics Event Additions

**Frontend implementation (extends existing `useTrackEvent` hook):**

New events to add at call sites:
```typescript
// Funnel events
track('deposit_started',          { method: 'ach' | 'card', amount })
track('deposit_completed',        { method, amount, transactionId })
track('pick_submitted_guest',     { auctionId, predictedPrice })
track('signup_from_guest_gate',   { picksCount })
track('tournament_joined',        { tournamentId, tier, entryFee })

// Engagement events
track('share_card_opened',        { auctionId, predictionId })
track('share_card_shared',        { platform: 'twitter' | 'copy' | 'native' })
track('notification_opted_in',    { channel: 'push' | 'sms' | 'email' })
track('daily_challenge_completed',{ challengeId, xpEarned })
track('ladder_page_viewed',       { currentTier })
```

**Backend API contract (admin dashboard):**
```
GET /api/analytics/funnel (admin only, NEXTAUTH role check)
Returns: {
  signupToFirstPick: number      // percentage
  pickToDeposit: number          // percentage
  weeklyActiveUsers: number
  entriesPerUserPerWeek: number
  depositConversionByRail: { ach: number, card: number }
  tournamentFillRate: number     // avg % seats filled
  tierChurnRate: { rookie: n, silver: n, gold: n, pro: n }
}

Query params: ?period=7d|30d|90d
```

---

## File Change Summary

### New Files (Track 1)
| File | Purpose |
|------|---------|
| `src/app/(pages)/daily/page.tsx` | Daily slate page |
| `src/app/components/DailySlate.tsx` | Slate grid component |
| `src/app/components/DailyChallenge.tsx` | Daily challenge card |
| `src/app/components/ShareCard.tsx` | Prediction share button + modal |
| `src/app/components/PriceDistribution.tsx` | Recharts histogram |
| `src/app/components/CompsTable.tsx` | Comparable sales table |
| `src/app/api/share/prediction/route.ts` | OG image generation |
| `src/app/api/auctions/[id]/comps/route.ts` | Comps query |

### New Files (Track 2 stubs)
| File | Purpose |
|------|---------|
| `src/app/components/ACHDepositForm.tsx` | ACH deposit form (stub) |
| `src/app/components/LadderProgress.tsx` | Tier ladder visual |
| `src/app/(pages)/tournaments/ladder/page.tsx` | Full ladder page |

### Modified Files
| File | Change |
|------|--------|
| `src/app/page.tsx` | Hero restructure, featured car, daily slate section |
| `src/app/(pages)/free_play/page.tsx` | Default sort + tab bar |
| `src/app/api/cars/route.ts` | Add `starting_soon` status |
| `src/app/(pages)/auctions/car_view_page/[id]/page.tsx` | Add comps + distribution + share card |
| `src/app/(pages)/profile/page.tsx` | DailyChallenge card + notification prefs |
| `src/app/(pages)/tournaments/page.tsx` | Tier sidebar + schedule |
| `src/app/(pages)/my_wallet/page.tsx` | ACH-first deposit redesign |

### Dependencies to Add
```bash
npm install recharts
# next/og is already bundled with Next.js 14
```

---

## Success Metrics

| Feature | Metric | Target |
|---------|--------|--------|
| Sort fix + tabs | Bounce rate on free_play | -20% |
| Daily slate | DAU/MAU ratio | +15% |
| Guest mode | Signup conversion from guest | >30% |
| Share card | Referral signups | >5% of new signups |
| Comps + chart | Prediction submission rate | +25% |
| Streaks + challenge | D7 retention | +10% |
| Wallet/ACH | ACH adoption for repeat users | >40% |
| Ladder | Entries/user/week | 4 → 6 |
| Notifications | D30 retention | +8% |
| Analytics | Time to insight on funnel | <1 day |
