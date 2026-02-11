# CLAUDE.md — Velocity Markets Frontend

## Full PRD Reference

The complete PRD is in `Velocity_Markets_PRD_v2.1.md` at this repo's root. Read it for full specifications, design tokens, scoring formulas, and event schemas. This CLAUDE.md is the scope filter — the PRD is the source of truth.

## Identity

You are working in the **Velocity Markets Frontend** repository.
This is one of three repos in the Velocity Markets platform. The others are:
- **Admin/Backend** (separate repo — DO NOT modify from here)
- **BaT Scraper** (separate repo — DO NOT modify from here)

## Stack

- **Framework:** Next.js 14.x (App Router) — upgrading from 13.5.6
- **Language:** TypeScript 5.2.2
- **Database:** MongoDB via Mongoose 7.6.6 (shared cluster with admin)
- **Auth:** NextAuth.js 4.24.5 (ONLY — better-auth is being removed)
- **Payments:** Stripe (@stripe/react-stripe-js)
- **Real-time:** Socket.IO client
- **Styling:** Tailwind CSS 3.3.x
- **UI Primitives:** Radix UI, Lucide React icons, Swiper (carousel)
- **Monitoring:** Sentry (configured)
- **Deployment:** Vercel

## Key Directories

```
src/
├── app/
│   ├── (pages)/           # Route groups: auction_details/, tournaments/, leaderboard/, profile/, etc.
│   ├── api/               # API routes (auth, predictions, tournaments, etc.)
│   ├── components/        # Shared UI components (REBUILD zone)
│   └── page.tsx           # Homepage
├── models/                # Mongoose models (User, Auction, Tournament, Prediction, Wager, Transaction, Wallet, Watchlist)
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities, DB connection, helpers
└── types/                 # TypeScript type definitions
```

## PRD Ownership

This repo owns the following PRD v2.1 sections:

| PRD Section | What To Do |
|-------------|-----------|
| 3. Auth Consolidation | Remove better-auth, consolidate on NextAuth |
| 4. UI/UX Redesign (ALL subsections) | Rebuild all page components and layouts |
| 5.1 Event Tracking (client-side) | Create useTrackEvent hook, add to pages |
| 5.2 Core Events (client triggers) | Wire auction_viewed, prediction_made on pages |
| 5.3 Email Campaigns | N/A — configured in Customer.io, not in this repo |
| 6. Scoring (v2 formula) | Add v2 scoring function alongside existing compute |
| 7.1 Streak Mechanics | Create streak model, streakManager utility, UI display |
| 7.2 Badge System | Create badge model, badge check logic, UI display |
| 9. Navigation & IA | Redesign nav, add new routes |
| 10.1–10.3 Implementation | All frontend tasks in phase tables |
| 11.1 CoWork: Auth Cleanup | Execute in this repo |
| 11.2 CoWork: Homepage | Execute in this repo |
| 11.3 CoWork: Event Tracking | Execute in this repo |
| 11.4 CoWork: Tournaments | Execute in this repo |
| 11.5 CoWork: Leaderboard + Streaks | Execute in this repo |

## PRD Sections NOT Owned (Do Not Touch)

- Section 8 (BaT Scraper Hardening) → Scraper repo
- Admin dashboard anything → Admin repo
- Customer.io campaign configuration → Done in Customer.io UI, not code
- Email HTML templates (11.6) → Generated as standalone HTML files, pasted into Customer.io

## Critical Rules

1. **Never delete existing Mongoose model fields.** Only ADD new fields per PRD Section 2.3.
2. **Never replace the existing tournament compute algorithm.** Add v2 scoring alongside it, controlled by `scoring_version` field.
3. **All new API routes** go in `src/app/api/`. Follow existing patterns for auth checks (getServerSession).
4. **All new models** go in `src/models/`. Follow existing Mongoose schema pattern with TypeScript interfaces.
5. **Design tokens are mandatory.** Use PRD Section 4.2 color values exactly. Primary BG: #0A0A1A, Accent: #E94560, Success: #00D4AA, Amber: #FFB547.
6. **Prices in JetBrains Mono.** All dollar amounts, scores, countdowns, percentages use monospace font.
7. **Mobile-first.** All components must be responsive. Tailwind breakpoints: sm/md/lg/xl.
8. **No better-auth imports.** If you see any, remove them. This auth system is being stripped.

## New Collections to Create (in this repo)

These Mongoose models don't exist yet. Create them in `src/models/`:

- `userEvent.model.ts` — event tracking (user_id, event_type, event_data, created_at with 90-day TTL)
- `leaderboardSnapshot.model.ts` — pre-computed rankings (period, user_id, rank, score, accuracy_pct)
- `streak.model.ts` — streak tracking (user_id unique, current_streak, longest_streak, last_prediction_date, freeze_tokens)
- `badge.model.ts` — achievements (user_id, badge_type enum, earned_at, metadata)
- `emailLog.model.ts` — email engagement (user_id, campaign_id, sent_at, opened_at, clicked_at)

## Environment Variables to Add

```
CUSTOMERIO_SITE_ID=
CUSTOMERIO_API_KEY=
POSTHOG_API_KEY=
POSTHOG_HOST=https://app.posthog.com
```

## Execution Order

When working through PRD tasks, follow this sequence:
1. Auth cleanup (remove better-auth) → PRD 11.1
2. Next.js upgrade (13.5.6 → 14.x) → PRD 11.1
3. Event tracking infrastructure → PRD 11.3
4. Homepage redesign → PRD 11.2
5. Auction detail page → PRD 4.4
6. Tournament extension → PRD 11.4
7. Leaderboard + Streaks → PRD 11.5
8. Profile/Dashboard → PRD 4.7
9. Results Recap page → PRD 4.8
10. Remaining polish tasks → PRD 10.3
