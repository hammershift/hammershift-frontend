# Velocity Markets Frontend - Complete Implementation Design

**Date:** February 11, 2026
**Version:** 2.1 - Calibrated to Actual Codebase
**Author:** Claude Code via Brainstorming Session
**Status:** Approved for Implementation

---

## Executive Summary

This design implements the complete Velocity Markets PRD v2.1 for the **frontend repository only**. The implementation is organized into 4 parallel workstreams covering all frontend-related features from the PRD. All designs are calibrated to the actual codebase with real file paths, existing models, and architectural patterns.

**Scope:** Frontend implementation only (excludes Admin/Backend repo and BaT Scraper repo work)

**Implementation Strategy:** 4 parallel workstreams executed simultaneously with minimal dependencies

---

## Workstream Overview

### **Workstream 1: Foundation & Infrastructure** (Critical Path)
- Auth cleanup (remove better-auth, consolidate on NextAuth)
- Next.js upgrade (13.5.6 → 14.x)
- Database model extensions (10 new fields across 5 models)
- 5 new MongoDB collections (events, leaderboard snapshots, streaks, badges, email logs)
- Event tracking system (API route + client hook + server utility)
- Customer.io + PostHog integration
- Email campaign setup (3 welcome emails, 5 transactional, 5 retention campaigns)

### **Workstream 2: UI Redesign & Core Pages** (High Visibility)
- Homepage complete redesign (hero, live auctions grid, leaderboard preview, game modes, how it works, CTA)
- Auction detail page overhaul (hero, 2-column layout, prediction input, community sidebar, similar results)
- Tournament hub redesign (filter bar, tournament cards, detail pages with live leaderboard)
- Leaderboard page (podium, full table, sidebar stats, period tabs, search, pinned user row)

### **Workstream 3: Gamification & Engagement** (Retention Features)
- Streak system (tracking, milestones, freeze tokens, UI indicators in nav + dashboard)
- Badge system (11 badges with earn conditions, progress tracking, display components)
- v2 scoring engine (new formula with 4 bonus modifiers, parallel to v1, tournament-selectable)
- Tournament extensions (v2 scoring integration, scoring orchestration, leaderboard compute)

### **Workstream 4: Growth & Reliability** (Polish & Scale)
- User dashboard/profile (tabs: overview, predictions history, tournament history, settings)
- Results recap page (shareable, SEO-optimized, social share buttons, score breakdown)
- Scraper hardening (health check API, validation layer, retry logic, Sentry alerts, stale cleanup cron)
- SEO infrastructure (meta tags, OG images, structured data, programmatic pages, sitemap)

---

## Design System Tokens

All UI components must use these exact values:

### Colors
- `--bg-primary`: `#0A0A1A` (Page backgrounds)
- `--bg-surface`: `#12122A` (Cards, panels)
- `--bg-elevated`: `#1A1A3E` (Hover states, dropdowns)
- `--accent-red`: `#E94560` (Primary CTAs, live indicators)
- `--accent-green`: `#00D4AA` (Success, positive deltas)
- `--accent-amber`: `#FFB547` (Urgency, streaks, warnings)
- `--text-primary`: `#FFFFFF` (Headings, primary text)
- `--text-secondary`: `#94A3B8` (Supporting text, labels)
- `--text-muted`: `#64748B` (Tertiary text, placeholders)
- `--border-default`: `#1E293B` (Card borders, dividers)
- `--border-active`: `#E94560` (Active/selected borders)

### Typography
- `--font-display`: Inter 700 (Headings)
- `--font-body`: Inter 400/500 (Body text)
- `--font-mono`: JetBrains Mono 500 (Prices, scores, countdowns, percentages)

### Spacing
- `--radius-card`: 12px
- `--radius-button`: 8px
- `--radius-badge`: 6px

---

## Workstream 1: Foundation & Infrastructure

### 1.1 Auth Cleanup & Framework Upgrade

**Goal:** Single auth provider (NextAuth), remove better-auth completely, upgrade Next.js to 14.x

**Tasks:**
1. Remove `better-auth` from `package.json`
2. Search all `src/` for better-auth imports, replace with NextAuth equivalents
3. Verify `src/app/api/auth/[...nextauth]/route.ts` is properly configured
4. Upgrade Next.js from 13.5.6 → 14.0.3
5. Update `next.config.js` for any breaking changes
6. Run `npm run build` and fix TypeScript errors
7. Test auth flows: signup, login, session persistence, logout, password reset

**Files Modified:**
- `package.json`
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/lib/auth.ts`
- `next.config.js`
- All components using auth hooks

---

### 1.2 Database Model Extensions

**Critical Rule:** NEVER delete or rename existing fields. Only ADD new fields with safe defaults.

#### Extend Existing Models:

**`src/models/user.model.ts`:**
```typescript
current_streak: { type: Number, default: 0 }
longest_streak: { type: Number, default: 0 }
last_prediction_at: { type: Date }
rank_title: { type: String, enum: ['Rookie', 'Contender', 'Expert', 'Master', 'Legend'] }
total_points: { type: Number, default: 0 }
email_preferences: {
  weekly_digest: { type: Boolean, default: true }
  auction_reminders: { type: Boolean, default: true }
  result_notifications: { type: Boolean, default: true }
  marketing: { type: Boolean, default: false }
}
```

**`src/models/auction.model.ts`:**
```typescript
prediction_count: { type: Number, default: 0 }
avg_predicted_price: { type: Number }
source_badge: { type: String, enum: ['bat', 'cab'], default: 'bat' }
status_display: { type: String }
```

**`src/models/tournament.model.ts`:**
```typescript
max_participants: { type: Number, default: null }
scoring_version: { type: String, enum: ['v1', 'v2'], default: 'v2' }
description: { type: String }
featured_image: { type: String }
```

**`src/models/prediction.model.ts`:**
```typescript
score: { type: Number }
rank: { type: Number }
delta_from_actual: { type: Number }
scored_at: { type: Date }
bonus_modifiers: {
  early_bird: { type: Boolean, default: false }
  streak_bonus: { type: Boolean, default: false }
  bullseye: { type: Boolean, default: false }
  tournament_multiplier: { type: Number, default: 1 }
}
tournament_id: { type: Schema.Types.ObjectId, ref: 'Tournament' }
```

#### Create New Models:

**`src/models/userEvent.model.ts`:**
```typescript
user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, indexed: true }
event_type: { type: String, required: true, indexed: true }
event_data: { type: Schema.Types.Mixed }
created_at: { type: Date, default: Date.now, expires: 7776000 } // 90-day TTL
```

**`src/models/leaderboardSnapshot.model.ts`:**
```typescript
period: { type: String, enum: ['weekly', 'monthly', 'alltime'], required: true, indexed: true }
user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, indexed: true }
rank: { type: Number, required: true, indexed: true }
score: { type: Number, required: true }
accuracy_pct: { type: Number }
predictions_count: { type: Number }
snapshot_at: { type: Date, default: Date.now }
// Compound index: { period: 1, rank: 1 }
```

**`src/models/streak.model.ts`:**
```typescript
user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true }
current_streak: { type: Number, default: 0 }
longest_streak: { type: Number, default: 0 }
last_prediction_date: { type: Date }
freeze_tokens: { type: Number, default: 0 }
```

**`src/models/badge.model.ts`:**
```typescript
user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, indexed: true }
badge_type: { type: String, enum: [BadgeTypes], required: true }
earned_at: { type: Date, default: Date.now }
metadata: { type: Schema.Types.Mixed }
```

**`src/models/emailLog.model.ts`:**
```typescript
user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, indexed: true }
campaign_id: { type: String, required: true }
sent_at: { type: Date, default: Date.now }
opened_at: { type: Date }
clicked_at: { type: Date }
```

**`src/models/scraperRun.model.ts`:**
```typescript
status: { type: String, enum: ['success', 'error', 'partial'], required: true }
auctions_found: { type: Number, default: 0 }
auctions_created: { type: Number, default: 0 }
auctions_updated: { type: Number, default: 0 }
auctions_failed: { type: Number, default: 0 }
error_message: { type: String }
error_stack: { type: String }
duration_ms: { type: Number, required: true }
created_at: { type: Date, default: Date.now }
// TTL index: 30 days
```

---

### 1.3 Event Tracking System

**Architecture:** Single API route → MongoDB → PostHog + Customer.io

#### API Route: `src/app/api/events/track/route.ts`
- POST handler
- Validates session (getServerSession)
- Writes to `user_events` collection
- Fires async to PostHog + Customer.io
- Rate limited: 100 req/15min per user

#### Client Hook: `src/hooks/useTrackEvent.ts`
```typescript
export const useTrackEvent = () => {
  const track = async (event_type: string, event_data?: object) => {
    await fetch('/api/events/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type, event_data })
    });
  };
  return track;
};
```

#### Server Utility: `src/lib/trackServerEvent.ts`
```typescript
export async function trackServerEvent(userId: string, event_type: string, event_data?: object) {
  await UserEvent.create({ user_id: userId, event_type, event_data });
  // Forward to Customer.io + PostHog
}
```

#### Core Events:
| Event | Trigger Point | Payload |
|-------|--------------|---------|
| `signup_completed` | NextAuth signIn callback | email, method |
| `auction_viewed` | Auction detail page mount | auction_id, referrer |
| `prediction_made` | POST /api/predictions | auction_id, predicted_price, tournament_id |
| `tournament_joined` | POST /api/tournaments/[id]/join | tournament_id |
| `auction_closed` | Scraper/cron | auction_id, hammer_price, prediction_count |
| `prediction_scored` | Tournament compute | prediction_id, score, rank, delta |
| `streak_updated` | After prediction scoring | current_streak, is_new_high |
| `badge_earned` | Badge check functions | badge_type, points_bonus |

#### Environment Variables:
```
CUSTOMERIO_SITE_ID=
CUSTOMERIO_API_KEY=
POSTHOG_API_KEY=
POSTHOG_HOST=https://app.posthog.com
```

---

### 1.4 Customer.io Campaign Setup

**Setup in Customer.io UI (no code):**

#### Welcome Series:
1. **Email 1 - Welcome D0** (immediate)
   - Trigger: `signup_completed`
   - Subject: "Welcome to Velocity Markets – Let's Go 🏁"
   - Content: Platform intro, featured auction, [Make Your First Prediction] CTA
   - Condition: Send only if prediction_made count = 0

2. **Email 2 - Nudge D2** (48h after signup)
   - Subject: "Your first auction is waiting"
   - Content: Social proof, 3 featured auctions
   - Condition: Send only if prediction_made count = 0

3. **Email 3 - Value D5** (5 days after signup)
   - Subject: "Here's what you're missing this week"
   - Content: Leaderboard preview, weekly stats, featured tournament
   - Condition: Send only if prediction_made count < 2

#### Transactional Emails:
- **Prediction Confirmation:** On `prediction_made` event
- **Auction Result:** On `prediction_scored` event (with score breakdown)
- **Tournament Confirmation:** On `tournament_joined` event

#### Retention Campaigns:
- **Weekly Digest:** Every Monday 9am ET (personalized stats + new auctions)
- **Auction Ending:** < 24h before close (for users who viewed but didn't predict)
- **Streak At Risk:** Daily 6pm ET (for users with streak ≥3 who haven't predicted today)
- **Reactivation D7:** No prediction in 7 days
- **Reactivation D14:** No prediction in 14 days

---

## Workstream 2: UI Redesign & Core Pages

### 2.1 Homepage Redesign

**File:** `src/app/page.tsx`

**Components to Create:**
- `src/app/components/Hero.tsx` - Hero section with headline, CTAs, activity ticker, featured auction card
- `src/app/components/ActivityTicker.tsx` - Animated horizontal scroll with live stats
- `src/app/components/FeaturedAuctionCard.tsx` - Large auction card with countdown
- `src/app/components/LiveAuctionsGrid.tsx` - Grid with filter bar
- `src/app/components/AuctionCard.tsx` - Reusable auction card (used everywhere)
- `src/app/components/CountdownTimer.tsx` - Color-coded countdown (green/amber/red)
- `src/app/components/LeaderboardPreview.tsx` - Top 10 with period tabs
- `src/app/components/AuctionCarousel.tsx` - Swiper carousel of auctions
- `src/app/components/GameModes.tsx` - 3 cards: Free Play, Tournaments, Guess the Hammer
- `src/app/components/HowItWorks.tsx` - 3-step flow with icons and connecting lines

**Data Fetching (Server Components):**
```typescript
// Activity ticker stats
const todayPredictions = await Prediction.countDocuments({ created_at: { $gte: startOfDay(new Date()) } });
const totalAuctionValue = await Auction.aggregate([{ $match: { status: 'active' } }, { $group: { _id: null, total: { $sum: '$current_bid' } } }]);
const activePredictors = await User.countDocuments({ last_prediction_at: { $gte: subDays(new Date(), 7) } });

// Featured auction
const featuredAuction = await Auction.findOne({ status: 'active' }).sort({ end_time: 1 });

// Live auctions
const liveAuctions = await Auction.find({ status: 'active' }).sort({ end_time: 1 }).limit(12);

// Leaderboard preview (MVP: real-time aggregation, Phase 2: leaderboard_snapshots)
const leaderboard = await Prediction.aggregate([
  { $match: { scored_at: { $gte: startOfWeek(new Date()) } } },
  { $group: { _id: '$user_id', score: { $sum: '$score' }, predictions_count: { $count: {} } }},
  { $sort: { score: -1 } },
  { $limit: 10 },
  { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } }
]);
```

---

### 2.2 Auction Detail Page

**File:** `src/app/(pages)/auction_details/[id]/page.tsx`

**Layout:**
- Full-width hero: Car image with gradient overlay, title, current bid, countdown, prediction count
- Two-column: Left (65%) = details, Right (35%) = prediction panel + community sidebar

**Components to Create:**
- `src/app/components/PredictionForm.tsx` - Price input with range slider, submit button
- `src/app/components/PriceDistributionChart.tsx` - Recharts histogram of predictions
- `src/app/components/LivePredictionFeed.tsx` - Socket.IO live feed of recent predictions

**Key Features:**
- Sticky prediction panel (locks 1h before close)
- Login prompt if not authenticated
- Show user's existing prediction if already submitted
- Similar results section (query by make + model, sorted by end_time desc)
- Image gallery with lightbox
- Specifications table from auction attributes

**Data Queries:**
```typescript
const auction = await Auction.findById(params.id);
const userPrediction = session ? await Prediction.findOne({ user_id: session.user.id, auction_id: params.id }) : null;
const similarAuctions = await Auction.find({ make: auction.make, model: auction.model, hammer_price: { $exists: true } }).sort({ end_time: -1 }).limit(10);
```

---

### 2.3 Tournament Hub & Detail Pages

**Hub:** `src/app/(pages)/tournaments/page.tsx`
- Filter bar: Status (Active/Upcoming/Completed), Type (Free/Paid), Sort dropdown
- Tournament cards grid (3 cols desktop, 1 col mobile)

**Detail:** `src/app/(pages)/tournaments/[id]/page.tsx`
- Hero: Tournament banner with info overlay
- Info bar: Prize pool, entry fee, participants, auction count, time remaining
- Two-column: Left (2/3) = auction list with prediction inputs, Right (1/3) = live leaderboard
- DQ warning if not all auctions predicted

**Component:** `src/app/components/TournamentCard.tsx`
- Badge overlay: LIVE/UPCOMING/FREE
- Stats grid: prize pool, entry fee, participants, auctions
- Countdown timer
- [Enter Tournament] CTA

**Leaderboard Query:**
```typescript
const leaderboard = await Prediction.aggregate([
  { $match: { tournament_id, score: { $exists: true } } },
  { $group: { _id: '$user_id', total_score: { $sum: '$score' }, predictions_made: { $count: {} } }},
  { $match: { predictions_made: tournament.auction_ids.length } }, // DQ rule
  { $sort: { total_score: -1 } },
  { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } }
]);
```

---

### 2.4 Leaderboard Page

**File:** `src/app/(pages)/leaderboard/page.tsx`

**Layout:**
- Period tabs: Weekly / Monthly / All-Time
- Top 3 podium cards (desktop only) with gold/silver/bronze styling
- Full leaderboard table (all ranks)
- Sidebar: Search filter, user stats card, period info card
- Pinned current user row at bottom if scrolled past rank 10

**Components:**
- `src/app/components/PodiumCard.tsx` - Special styling for top 3
- `src/app/components/LeaderboardRow.tsx` - Table row with rank, avatar, name, points, predictions, accuracy, trend arrow, streak indicator
- `src/app/components/RankingSparkline.tsx` - Recharts line chart for rank history

**Data Source:**
- **Phase 1:** Real-time aggregation on predictions collection
- **Phase 2:** Query `leaderboard_snapshots` collection for instant reads

**Features:**
- Username search
- Rank badges (gold/silver/bronze for top 3)
- Trend arrows (vs previous snapshot)
- Streak fire emoji if current_streak ≥ 3
- Accuracy progress bar
- Current user highlighted with [YOU] badge

---

## Workstream 3: Gamification & Engagement

### 3.1 Streak System

**Manager:** `src/lib/streakManager.ts`

**Core Function:** `updateStreak(userId: string)`
- Get or create streak document
- Case 1: Already predicted today → no change
- Case 2: Predicted yesterday → increment streak, check milestones
- Case 3: Gap > 1 day → use freeze token if available, else reset to 1
- Returns: `{ current_streak, is_new, milestone_reached?, milestone?, freeze_used?, streak_broken?, old_streak? }`

**Milestones:**
| Streak | Badge | Freeze Tokens |
|--------|-------|---------------|
| 3 | Hot Start | 0 |
| 7 | On Fire | 1 |
| 14 | Unstoppable | 0 |
| 30 | Legend | 3 |

**Integration:**
- Call `updateStreak(userId)` after every `prediction_scored` event
- Fire `streak_updated` event to Customer.io

**UI Components:**
- `src/app/components/StreakIndicator.tsx` - Nav bar indicator (fire emoji + count, color by streak level)
- `src/app/components/StreakDashboard.tsx` - Dashboard widget with current/longest/freeze tokens, progress to next milestone

**API Routes:**
- `GET /api/streak/[userId]` - Get streak data
- `POST /api/streak/freeze` - Manually use freeze token (future feature)

---

### 3.2 Badge System

**Manager:** `src/lib/badgeManager.ts`

**11 Badges:**
| Badge | Condition | Points Bonus |
|-------|-----------|-------------|
| First Prediction | First prediction_made | +50 |
| First Win | First score ≥ 900 | +100 |
| Hot Start | 3-day streak | +25 |
| On Fire | 7-day streak | +50 |
| Unstoppable | 14-day streak | +100 |
| Legend | 30-day streak | +200 |
| Tournament Rookie | First tournament entry | +50 |
| Tournament Champion | Finish #1 in tournament | +500 |
| Sharpshooter | 5 scores ≥ 900 | +200 |
| Centurion | 100 total predictions | +300 |
| Top 10 | Reach top 10 on leaderboard | +250 |

**Check Functions:**
- `checkFirstPrediction(userId)` - On prediction creation
- `checkFirstWin(userId, score)` - On prediction scoring
- `checkSharpshooter(userId)` - On prediction scoring
- `checkCenturion(userId)` - On prediction creation
- `checkTournamentRookie(userId)` - On tournament join
- `checkTournamentChampion(userId, tournamentId, rank)` - On tournament completion
- `checkTop10(userId, rank, period)` - On leaderboard snapshot
- `checkAllPredictionBadges(userId, predictionId)` - Runs all relevant checks

**UI Components:**
- `src/app/components/BadgeDisplay.tsx` - Single badge with tooltip
- `src/app/components/BadgeGrid.tsx` - All badges (earned + locked)
- `src/app/components/BadgeProgress.tsx` - Progress toward next badges

**API Routes:**
- `GET /api/badges/[userId]` - Get all user badges
- `GET /api/badges/[userId]/progress` - Get progress toward unearned badges

---

### 3.3 v2 Scoring Engine

**Critical Rule:** DO NOT replace existing v1 scoring. Add v2 alongside, controlled by `tournament.scoring_version`.

**Formula:**
```
base_score = max(0, 1000 × (1 - |predicted_price - actual_price| / actual_price))

Modifiers:
- Early Bird: +50 if prediction > 48h before close
- Streak Bonus: +25 if user streak ≥ 5
- Bullseye: +200 if within 1% of actual
- Tournament Multiplier: base × 1.5 if tournament_id exists

total_score = (base_score × tournament_multiplier) + early_bird + streak_bonus + bullseye
```

**Implementation:**
- `src/lib/scoringEngine.ts` - v2 scoring functions
- `src/lib/scoringEngineV1.ts` - Wrap existing v1 logic (preserve unchanged)
- `src/lib/tournamentScoring.ts` - Orchestration layer (selects v1 or v2 based on tournament.scoring_version)

**Key Functions:**
- `scoreV2(predictionId, actualPrice)` - Returns `{ base_score, bonuses, total_score, delta_from_actual, accuracy_pct }`
- `applyScoreToPrediction(predictionId, actualPrice)` - Scores and updates prediction document
- `scoreAllPredictionsForAuction(auctionId, actualPrice)` - Batch scoring on auction close
- `scoreTournamentAuction(tournamentId, auctionId, actualPrice)` - Uses correct version per tournament

**UI Component:**
- `src/app/components/ScoreBreakdown.tsx` - Visual breakdown showing base score, modifiers, total

**Integration:**
- Call from auction close handler (scraper or cron)
- After scoring, call `checkAllPredictionBadges` and `updateStreak`

---

## Workstream 4: Growth & Reliability

### 4.1 User Dashboard & Profile

**File:** `src/app/(pages)/profile/page.tsx`

**Tab Structure:**
1. **Overview** - Stats dashboard, streaks, badges, recent activity, performance charts
2. **Predictions** - Full history table with filters, search, pagination
3. **Tournament History** - Past tournaments with placement and stats
4. **Settings** - Profile info, avatar upload, email preferences, account actions

**Overview Layout:**
- Hero stats card: Rank, total points, predictions, accuracy
- Three columns: Streaks & badges (left), recent activity (middle), performance charts (right)

**Components:**
- `src/app/components/StreakDashboard.tsx` - Current/longest/freeze tokens
- `src/app/components/BadgeGrid.tsx` - All earned/locked badges
- `src/app/components/BadgeProgress.tsx` - Progress to next badges
- `src/app/components/ScoreDistributionChart.tsx` - Histogram of user's scores
- `src/app/components/AvatarUpload.tsx` - Image upload component

**Predictions Table:**
- Columns: Date, Auction, Your Prediction, Actual Price, Delta, Score, Result badge
- Filters: All / Scored / Pending / High Score (900+)
- Search by auction title
- Pagination

**Settings:**
- Profile: username, display name, about, avatar
- Email toggles: weekly_digest, auction_reminders, result_notifications, marketing
- Account actions: change password, sign out

---

### 4.2 Results Recap Page (NEW)

**Route:** `src/app/(pages)/results/[auction_id]/page.tsx`

**Purpose:**
- Shareable results page for social media
- SEO-optimized for "[Year] [Make] [Model] auction result" searches
- Entry point for organic traffic

**Layout:**
- Hero: Full-width car image, final price, prediction count
- User result card (if predicted): Your prediction, delta, score, percentile ranking, [Predict Next] + [Share] CTAs
- Prediction distribution chart: Histogram with actual price reference line
- Top 10 predictions leaderboard
- Auction details recap
- Social share buttons: Twitter, Facebook, Copy Link

**Components:**
- `src/app/components/PredictionDistribution.tsx` - Recharts histogram
- Social share buttons with pre-filled text

**SEO:**
- Dynamic metadata with OG images
- JSON-LD structured data (Product schema for open auctions, Article schema for results)
- Canonical URLs

**Meta Tags Example:**
```typescript
title: `${auction.year} ${auction.make} ${auction.model} Auction Result - $${auction.hammer_price.toLocaleString()}`
description: `See how the community predicted the final price. It sold for $${auction.hammer_price.toLocaleString()} on Bring a Trailer.`
openGraph: { images: [auction.image] }
```

---

### 4.3 Scraper Hardening

**Critical Rule:** DO NOT rebuild the scraper. Add hardening layers only.

#### Health Check API Route
**File:** `src/app/api/scraper/health/route.ts`

**Returns:**
```typescript
{
  status: 'healthy' | 'degraded' | 'down',
  last_successful_run: Date,
  auctions_scraped_today: number,
  active_auctions: number,
  error_count_24h: number,
  last_error: { message, timestamp },
  stale_auctions: number,
  uptime_pct_7d: number
}
```

**Status Logic:**
- `down`: No run in 48h
- `degraded`: errors_24h > 5 OR stale_auctions > 10 OR uptime < 95%
- `healthy`: Otherwise

#### Scraper Run Tracking
**Model:** `src/models/scraperRun.model.ts` - Tracks every scraper execution with status, counts, errors, duration

**Wrapper:** `src/lib/scraperWrapper.ts` - Wraps existing scraper function with tracking, error handling, Sentry reporting

#### Data Validation Layer
**File:** `src/lib/auctionValidator.ts` - Zod schema for auction data

**Integration:** Validate before MongoDB insert, reject invalid auctions, log to Sentry

#### Retry Logic
**File:** `src/lib/retryWithBackoff.ts` - Exponential backoff utility (3 retries, 1s base delay)

**Usage:** Wrap BaT page fetches

#### Stale Auction Cleanup
**Cron Route:** `src/app/api/cron/cleanup-stale/route.ts`
- Runs hourly (vercel.json config)
- Finds auctions with status='active' but end_time in past
- Marks as closed, triggers scoring if hammer_price exists

#### Alerting System
**File:** `src/lib/scraperAlerts.ts`
- Sends to Sentry (all alerts)
- Sends to Slack webhook (if configured)
- Sends email to admin (critical errors only)

**Alert Types:**
- `error`: Scraper completely failed
- `warning`: Partial failure (5+ auctions failed validation)
- `info`: Informational

#### External Monitoring
- Use Uptime Robot to ping `/api/scraper/health` every 5 minutes
- Alert if status !== 200 or response time > 5s

#### Admin Dashboard Widget
**Component:** `src/app/components/admin/ScraperHealthWidget.tsx`
- Shows health status, last run, uptime, active auctions, errors
- Warns about stale auctions
- Shows last error details
- Auto-refreshes every minute

---

### 4.4 SEO Infrastructure

#### Meta Tags System
**File:** `src/lib/seo.ts` - Helper functions for generating metadata

**Functions:**
- `generateAuctionMetadata(auction)` - For auction detail pages
- `generateResultsMetadata(auction)` - For results pages
- `generateLeaderboardMetadata(period)` - For leaderboard

**All pages include:**
- Title (optimized for search)
- Description
- Keywords
- OpenGraph tags
- Twitter Card tags
- Canonical URL

#### Structured Data (JSON-LD)
- **Auction pages:** Product schema with offers, brand, properties
- **Results pages:** Article schema with headline, image, author, publisher
- **Leaderboard:** ItemList schema with top 10 users

#### Dynamic OG Image Generation
**Route:** `src/app/api/og/auction/route.tsx`
- Uses `@vercel/og` (Vercel Edge Runtime)
- Generates 1200×630 image with car photo, title, current bid, prediction count
- Usage: `openGraph: { images: ['/api/og/auction?id=${auction._id}'] }`

#### Programmatic SEO Pages
**Route:** `src/app/(pages)/cars/[make]/[model]/page.tsx`
- Generate static pages for popular make/model combinations (3+ auctions)
- Shows active auctions + historical results table + average price
- Target keywords: "[Make] [Model] auction", "[Make] [Model] price"
- Generate top 100 combinations

**Data Query:**
```typescript
const makeModels = await Auction.aggregate([
  { $group: { _id: { make: '$make', model: '$model' }, count: { $sum: 1 } }},
  { $match: { count: { $gte: 3 } } },
  { $limit: 100 }
]);
```

#### Sitemap Generation
**File:** `src/app/sitemap.ts`
- Static pages (/, /auctions, /tournaments, /leaderboard, etc.)
- Auction detail pages (active + recent closed)
- Results pages (closed with hammer_price)
- Tournament pages (active)
- Make/model pages (top 50)

#### robots.txt
**File:** `src/app/robots.ts`
- Allow all pages except /api/, /admin/, /settings
- Sitemap reference

#### Performance Optimizations
- All images use `next/image` with lazy loading
- Font optimization: Inter (variable) + JetBrains Mono (local)
- Core Web Vitals targets:
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1

---

## Implementation Checklist by Workstream

### Workstream 1: Foundation & Infrastructure
- [ ] Remove better-auth from package.json
- [ ] Replace all better-auth imports with NextAuth
- [ ] Upgrade Next.js 13.5.6 → 14.x
- [ ] Extend user.model.ts with 6 new fields
- [ ] Extend auction.model.ts with 4 new fields
- [ ] Extend tournament.model.ts with 4 new fields
- [ ] Extend prediction.model.ts with 6 new fields
- [ ] Create userEvent.model.ts
- [ ] Create leaderboardSnapshot.model.ts
- [ ] Create streak.model.ts
- [ ] Create badge.model.ts
- [ ] Create emailLog.model.ts
- [ ] Create scraperRun.model.ts
- [ ] Create POST /api/events/track route
- [ ] Create useTrackEvent client hook
- [ ] Create trackServerEvent server utility
- [ ] Wire 8 core events (signup, auction_viewed, prediction_made, etc.)
- [ ] Set up Customer.io account + SPF/DKIM
- [ ] Build 3 Welcome Series emails in Customer.io
- [ ] Build 3 Transactional emails in Customer.io
- [ ] Build 5 Retention campaigns in Customer.io
- [ ] Set up PostHog account
- [ ] Add environment variables (Customer.io, PostHog)

### Workstream 2: UI Redesign & Core Pages
- [ ] Create Hero.tsx component
- [ ] Create ActivityTicker.tsx component
- [ ] Create FeaturedAuctionCard.tsx component
- [ ] Create LiveAuctionsGrid.tsx component
- [ ] Create AuctionCard.tsx component (reusable)
- [ ] Create CountdownTimer.tsx component
- [ ] Create LeaderboardPreview.tsx component
- [ ] Create AuctionCarousel.tsx component (Swiper)
- [ ] Create GameModes.tsx component
- [ ] Create HowItWorks.tsx component
- [ ] Redesign homepage (src/app/page.tsx)
- [ ] Create PredictionForm.tsx component
- [ ] Create PriceDistributionChart.tsx component (Recharts)
- [ ] Create LivePredictionFeed.tsx component (Socket.IO)
- [ ] Redesign auction detail page
- [ ] Create TournamentCard.tsx component
- [ ] Redesign tournament hub page
- [ ] Build tournament detail page with live leaderboard
- [ ] Create PodiumCard.tsx component
- [ ] Create LeaderboardRow.tsx component
- [ ] Create RankingSparkline.tsx component (Recharts)
- [ ] Redesign leaderboard page with tabs and search

### Workstream 3: Gamification & Engagement
- [ ] Create src/lib/streakManager.ts
- [ ] Implement updateStreak function with 4 cases
- [ ] Create StreakIndicator.tsx component (nav bar)
- [ ] Create StreakDashboard.tsx component
- [ ] Create GET /api/streak/[userId] route
- [ ] Create src/lib/badgeManager.ts
- [ ] Define 11 badge types and conditions
- [ ] Implement 7 badge check functions
- [ ] Create BadgeDisplay.tsx component
- [ ] Create BadgeGrid.tsx component
- [ ] Create BadgeProgress.tsx component
- [ ] Create GET /api/badges/[userId] route
- [ ] Create GET /api/badges/[userId]/progress route
- [ ] Create src/lib/scoringEngine.ts (v2)
- [ ] Implement scoreV2 function with 4 modifiers
- [ ] Create src/lib/scoringEngineV1.ts (wrap existing)
- [ ] Create src/lib/tournamentScoring.ts (orchestration)
- [ ] Create ScoreBreakdown.tsx component
- [ ] Integrate v2 scoring into auction close handler
- [ ] Add scoring_version selector in admin tournament form

### Workstream 4: Growth & Reliability
- [ ] Redesign profile page with 4 tabs
- [ ] Create overview tab with stats grid
- [ ] Create predictions history tab with table
- [ ] Create tournament history tab
- [ ] Create settings tab with email preferences
- [ ] Create AvatarUpload.tsx component
- [ ] Create ScoreDistributionChart.tsx component
- [ ] Create new route: /results/[auction_id]
- [ ] Build results recap page layout
- [ ] Create social share buttons
- [ ] Add dynamic OG image generation
- [ ] Create src/models/scraperRun.model.ts
- [ ] Create GET /api/scraper/health route
- [ ] Create src/lib/scraperWrapper.ts
- [ ] Create src/lib/auctionValidator.ts (Zod)
- [ ] Create src/lib/retryWithBackoff.ts
- [ ] Create POST /api/cron/cleanup-stale route
- [ ] Create src/lib/scraperAlerts.ts
- [ ] Add Sentry error tracking to scraper
- [ ] Create ScraperHealthWidget.tsx component
- [ ] Add vercel.json with cron config
- [ ] Create src/lib/seo.ts with metadata helpers
- [ ] Add JSON-LD structured data to auction pages
- [ ] Add JSON-LD to results pages
- [ ] Add JSON-LD to leaderboard
- [ ] Create /api/og/auction route for dynamic OG images
- [ ] Create /cars/[make]/[model] programmatic pages
- [ ] Create src/app/sitemap.ts
- [ ] Create src/app/robots.ts
- [ ] Optimize all images with next/image
- [ ] Add font optimization (Inter + JetBrains Mono)

---

## Dependencies Between Workstreams

**Critical Path:** Workstream 1 must complete database model extensions before other workstreams can use new fields.

**Parallelization Strategy:**
- **Phase 1 (Days 1-3):** Complete Workstream 1.1-1.2 (auth, models)
- **Phase 2 (Days 4-21):** Run Workstreams 1.3-1.4, 2, 3, 4 in parallel
  - Workstream 1.3-1.4 can proceed independently
  - Workstream 2 needs models from 1.2 but can start UI work
  - Workstream 3 needs models from 1.2 and event tracking from 1.3
  - Workstream 4 needs models from 1.2 but most work is independent

**Suggested Team Structure (if parallelizing across multiple agents/sessions):**
- Agent 1: Workstream 1 (Foundation) - runs first, then idle
- Agent 2: Workstream 2 (UI) - starts after 1.2 completes
- Agent 3: Workstream 3 (Gamification) - starts after 1.2 and 1.3 complete
- Agent 4: Workstream 4 (Growth) - starts after 1.2 completes

---

## Testing Strategy

### Unit Tests
- All utility functions (streakManager, badgeManager, scoringEngine, auctionValidator)
- API route handlers
- Badge check logic

### Integration Tests
- Event tracking flow (client → API → MongoDB → Customer.io)
- Scoring pipeline (prediction → scoring → streak → badges)
- Tournament leaderboard computation

### E2E Tests
- Signup → First prediction → Result email flow
- Tournament entry → Predict all auctions → View leaderboard
- Streak milestone → Badge earned → Email notification

### Manual Testing Checklist
- [ ] Auth flows work (signup, login, logout, password reset)
- [ ] Prediction submission works on auction detail page
- [ ] Countdown timers update correctly
- [ ] Leaderboard tabs switch correctly
- [ ] Streak indicator appears in nav bar
- [ ] Badges display correctly (earned + locked)
- [ ] Email preferences save correctly
- [ ] Social share buttons work
- [ ] OG images generate correctly
- [ ] Mobile responsive on all pages
- [ ] Scraper health check endpoint returns correct status

---

## Post-Implementation Verification

### Performance Metrics
- Lighthouse score > 90 on all pages
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1

### Functional Verification
- [ ] All 8 core events tracking to PostHog
- [ ] Customer.io campaigns sending emails
- [ ] Streak system updating on daily predictions
- [ ] Badges awarding correctly
- [ ] v2 scoring calculating with all modifiers
- [ ] Tournament leaderboards updating live
- [ ] Scraper health check returning accurate data
- [ ] Stale auction cleanup running hourly
- [ ] Sitemap generating all pages

### Data Validation
- [ ] No duplicate events in user_events collection
- [ ] Leaderboard snapshots refreshing on schedule
- [ ] Streak records accurate (no false resets)
- [ ] Badge awards match conditions
- [ ] Prediction scores match v2 formula
- [ ] Scraper run logs capturing all executions

---

## Rollout Plan

### Phase 1: Foundation (Week 1)
- Deploy Workstream 1 (auth cleanup, models, event tracking)
- Verify events flowing to PostHog and Customer.io
- Monitor for errors

### Phase 2: UI Refresh (Week 2)
- Deploy Workstream 2 (homepage, auction details, tournaments, leaderboard)
- A/B test new homepage vs old (if desired)
- Collect user feedback

### Phase 3: Gamification (Week 3)
- Deploy Workstream 3 (streaks, badges, v2 scoring)
- Announce new features via email campaign
- Monitor engagement metrics

### Phase 4: Polish (Week 4+)
- Deploy Workstream 4 (dashboard, results pages, scraper hardening, SEO)
- Submit sitemap to Google Search Console
- Monitor scraper health dashboard

---

## Success Metrics (90 Days Post-Launch)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time to First Prediction | < 3 min | PostHog: prediction_made - signup_completed |
| DAU/MAU Ratio | > 20% | PostHog daily/monthly actives |
| Predictions Per User Per Week | > 3 | MongoDB aggregation |
| Email Open Rate | > 35% | Customer.io reporting |
| D7 Retention | > 25% | PostHog cohorts |
| D30 Retention | > 12% | PostHog cohorts |
| Leaderboard Engagement | > 40% view weekly | PostHog: leaderboard_viewed |
| Scraper Uptime | > 99.5% | Health check API |

---

## Maintenance & Monitoring

### Daily Checks
- Scraper health dashboard (errors, stale auctions)
- Sentry error rate
- PostHog event volume

### Weekly Reviews
- Customer.io campaign performance
- Leaderboard snapshot accuracy
- User feedback from feedback form

### Monthly Audits
- Database query performance
- Image optimization opportunities
- SEO ranking changes
- Lighthouse scores

---

## Appendix: File Structure

```
src/
├── app/
│   ├── (pages)/
│   │   ├── auction_details/[id]/page.tsx (redesigned)
│   │   ├── tournaments/page.tsx (redesigned)
│   │   ├── tournaments/[id]/page.tsx (new detail page)
│   │   ├── leaderboard/page.tsx (redesigned)
│   │   ├── profile/page.tsx (redesigned)
│   │   ├── results/[auction_id]/page.tsx (NEW)
│   │   └── cars/[make]/[model]/page.tsx (NEW)
│   ├── api/
│   │   ├── events/track/route.ts (NEW)
│   │   ├── streak/[userId]/route.ts (NEW)
│   │   ├── badges/[userId]/route.ts (NEW)
│   │   ├── badges/[userId]/progress/route.ts (NEW)
│   │   ├── scraper/health/route.ts (NEW)
│   │   ├── cron/cleanup-stale/route.ts (NEW)
│   │   ├── og/auction/route.tsx (NEW)
│   │   └── admin/score-auction/route.ts (NEW)
│   ├── components/
│   │   ├── Hero.tsx (NEW)
│   │   ├── ActivityTicker.tsx (NEW)
│   │   ├── FeaturedAuctionCard.tsx (NEW)
│   │   ├── LiveAuctionsGrid.tsx (NEW)
│   │   ├── AuctionCard.tsx (NEW - reusable)
│   │   ├── CountdownTimer.tsx (NEW)
│   │   ├── LeaderboardPreview.tsx (NEW)
│   │   ├── AuctionCarousel.tsx (NEW)
│   │   ├── GameModes.tsx (redesigned)
│   │   ├── HowItWorks.tsx (redesigned)
│   │   ├── PredictionForm.tsx (NEW)
│   │   ├── PriceDistributionChart.tsx (NEW)
│   │   ├── LivePredictionFeed.tsx (NEW)
│   │   ├── TournamentCard.tsx (NEW)
│   │   ├── PodiumCard.tsx (NEW)
│   │   ├── LeaderboardRow.tsx (NEW)
│   │   ├── RankingSparkline.tsx (NEW)
│   │   ├── StreakIndicator.tsx (NEW)
│   │   ├── StreakDashboard.tsx (NEW)
│   │   ├── BadgeDisplay.tsx (NEW)
│   │   ├── BadgeGrid.tsx (NEW)
│   │   ├── BadgeProgress.tsx (NEW)
│   │   ├── ScoreBreakdown.tsx (NEW)
│   │   ├── ScoreDistributionChart.tsx (NEW)
│   │   ├── AvatarUpload.tsx (NEW)
│   │   └── admin/ScraperHealthWidget.tsx (NEW)
│   ├── page.tsx (redesigned homepage)
│   ├── sitemap.ts (NEW)
│   └── robots.ts (NEW)
├── hooks/
│   └── useTrackEvent.ts (NEW)
├── lib/
│   ├── seo.ts (NEW)
│   ├── streakManager.ts (NEW)
│   ├── badgeManager.ts (NEW)
│   ├── scoringEngine.ts (NEW - v2)
│   ├── scoringEngineV1.ts (NEW - wrap existing)
│   ├── tournamentScoring.ts (NEW)
│   ├── auctionValidator.ts (NEW)
│   ├── retryWithBackoff.ts (NEW)
│   ├── scraperWrapper.ts (NEW)
│   ├── scraperAlerts.ts (NEW)
│   └── trackServerEvent.ts (NEW)
└── models/
    ├── user.model.ts (EXTEND)
    ├── auction.model.ts (EXTEND)
    ├── tournament.model.ts (EXTEND)
    ├── prediction.model.ts (EXTEND)
    ├── userEvent.model.ts (NEW)
    ├── leaderboardSnapshot.model.ts (NEW)
    ├── streak.model.ts (NEW)
    ├── badge.model.ts (NEW)
    ├── emailLog.model.ts (NEW)
    └── scraperRun.model.ts (NEW)
```

---

## End of Design Document

**Status:** ✅ Design Complete - Ready for Implementation

**Next Steps:**
1. Create git worktree for isolated implementation
2. Generate detailed implementation plan with step-by-step tasks
3. Begin execution starting with Workstream 1 (Foundation)

**Estimated Implementation Time:** 4-6 weeks with parallel execution across workstreams

---

*Generated via Claude Code Brainstorming Session*
*Date: February 11, 2026*
