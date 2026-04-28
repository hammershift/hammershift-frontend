# Profile Redesign — Design Doc

**Goal:** replace the tabbed `/profile` mega-page with a bento-grid hub that establishes founding-member identity and surfaces a permanent home for share cards. Out of scope: `/app`, tournaments, wallet, markets, leaderboard, and every other authenticated route.

**Approach chosen:** Profile + Bento (hub-and-spoke). Identity-first hero on top, bento grid of self-contained cards beneath. Each tile shows an abridged view; "View all →" links into a dedicated spoke route for the archive.

---

## 1. Information architecture

```
/profile                  ← bento hub (the redesign target)
├── /profile/predictions  ← full predictions history (was a tab)
├── /profile/tournaments  ← full tournament history (was a tab)
├── /profile/cards        ← share-card gallery (NEW surface)
└── /profile/settings     ← settings (was a tab)
```

**Why hub-and-spoke instead of tabs:**
- Tabs hide everything below the fold; bento shows the entire user identity in one scroll.
- Each tile renders 3–5 items max → page stays fast and balanced.
- Each spoke is a real URL → shareable, bookmarkable, browser-back works.
- Settings gets its own page so destructive actions (delete account, change password) aren't co-located with the dopamine surface.

**Hub vs spoke responsibilities:**

| Hub tile | Spoke route | Spoke adds |
|----------|-------------|------------|
| Stats stripe | (hub-only) | n/a |
| Recent predictions (3) | `/profile/predictions` | Active/completed toggle, filter, paginated archive |
| Streak + 3 badges | (hub-only) | n/a |
| Share cards (latest 4) | `/profile/cards` | All cards, copy-link UI per card, locked placeholders |
| Earnings summary | `/my_wallet` *(existing, untouched)* | We just link to the existing wallet page |
| Tournament finishes (3) | `/profile/tournaments` | Per-tournament breakdown, archive |

The existing `/profile/page.tsx` (tabbed) gets fully replaced by the bento hub in step 1 of the build. No legacy code remains after step 5.

---

## 2. Profile hero (header)

A wide card spanning page width, visually consistent with the gate page so the user feels they walked from the gate into "their" space.

**Composition:**
- **Photo backdrop:** the same Sonoma sunset image used on the gate, at ~25% opacity with `linear-gradient(90deg, #0A0A1A 0%, rgba(10,10,26,0.85) 60%, rgba(10,10,26,0.5) 100%)` overlay. Establishes continuity from gate → profile.
- **Avatar:** circular, 96px desktop / 64px mobile. NextAuth `image` if present, else initials on `#13202D` with `#E94560` ring.
- **Identity row:** display name (Inter 28/32 bold), `@handle · FOUNDING MEMBER` pill (mono, red text on `bg-[#E94560]/10`, border `#E94560/30`).
- **Subtitle:** "Founding member since {createdAt formatted Apr 2026}" in `text-gray-400`.
- **Edit shortcut:** top-right button → `/profile/settings`.
- **Stat stripe:** 5 cells — predictions count · accuracy % · current streak · earnings · rank. JetBrains Mono number (32px), uppercase label (11px, tracking-[0.15em], `text-gray-500`). Divider `border-l border-white/[0.06]` between cells.

**Data sources (all already exist):**
- `GET /api/profile` → rank, accuracy %, predictions count, streak, createdAt, badges
- `GET /api/wallet` → earnings (sum of paid winning transactions)

**Mobile:** avatar moves above identity row. Stat stripe becomes 2×3 grid (drop the 5th if needed, or wrap to 2 lines of 3 then 2).

---

## 3. The bento grid

5 tiles, no settings tile (the hero's "Edit profile →" handles that). Layout uses a 6-column responsive grid:

```
Desktop (lg):
┌──────────────────────────────┬──────────────────────┐
│  Recent predictions (4 cols) │  Streak + badges     │  Row 1
│                              │  (2 cols)            │
├──────────────────────────────┴──────────────────────┤
│  Share cards (6 cols, full width)                   │  Row 2
├──────────────────────┬──────────────────────────────┤
│  Earnings (2 cols)   │  Tournament finishes (4)     │  Row 3
└──────────────────────┴──────────────────────────────┘

Tablet (md): 1 col stack except share-cards stays wide
Mobile:      single column
```

**Tile content:**

| Tile | Renders | Empty state | Footer link |
|------|---------|-------------|-------------|
| **Recent predictions** | 3 most-recent rows: car thumbnail · market title · your call · result chip (won/lost/pending) | "Make your first prediction" CTA → `/markets` | View all → `/profile/predictions` |
| **Streak + badges** | Flame icon · current streak (mono, large) · "Longest: N" · 3 most recent badges with earned-date | "Predict 3 days to start a streak" | (inline only) |
| **Share cards** | Horizontal scroll of mini-card thumbnails (256×134, 16:9 OG ratio). Welcome card always at the front. Locked placeholders for unearned types: "Win a market", "Top 10 a tournament". Hover reveals Copy link button. | (always at least 1 — welcome) | Open all → `/profile/cards` |
| **Earnings** | Big mono number `$1,420` (text-[#00D4AA]) · "+$340 this month" delta · 7-day sparkline (recharts area) | "$0 — predict to earn" | Open wallet → `/my_wallet` |
| **Tournament finishes** | Top 3 by placement: `#3 · March Madness · 84%`. Mono placement, amber accent (`#FFB547`) | "No finishes yet — join a tournament" | View all → `/profile/tournaments` |

**Visual rules carried from gate:**
- Card surface: `bg-[#13202D] border border-white/[0.06] rounded-2xl p-5`
- Numbers in JetBrains Mono
- Hover lift: `transition shadow-[0_0_0_1px_rgba(233,69,96,0.4)]`
- All footer links: `text-[#E94560] text-sm hover:underline` with `→` glyph

**YAGNI cut:** dropped the "Settings" tile — it's already the hero CTA. Two entry points to settings on the same page is noise.

---

## 4. Spoke pages

Three of the four spokes are "lift the existing tab content into a standalone route + add a back link." One is genuinely new.

### `/profile/predictions`
Extracted from current Predictions tab. Active/Completed toggle, list of `PredictionsCard` / `CompletedPredictionCard`. Adds: pagination (20/page), filter by mode (free-play / tournament), search by market title. Top of page: `← Profile` link.

### `/profile/tournaments`
Same treatment for the Tournaments tab. Adds: per-tournament accuracy + final placement column. Same `← Profile` link.

### `/profile/cards` (new)
Gallery of the user's share cards:

```
┌─────────────────────────────────────────────────┐
│   Welcome    Win #1    Win #2    Tournament    │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐       │
│  │ OG   │  │ OG   │  │ OG   │  │locked│       │
│  │ thumb│  │ thumb│  │ thumb│  │      │       │
│  └──────┘  └──────┘  └──────┘  └──────┘       │
│   Welcome   +$420     +$1,200   ?              │
│   Apr 27    Apr 29    May 02    —              │
│   [copy]    [copy]    [copy]                   │
└─────────────────────────────────────────────────┘
```

Each tile renders the live OG image at 400×210 (`/s/{shortCode}/opengraph-image`), shows type label + date + copy-link button. Locked placeholders for unearned card types render with grayscale + dashed border + "Win a market to unlock" / "Top 10 a tournament to unlock" microcopy.

### `/profile/settings`
Extracted from current Settings tab. Stacked sections, each in its own card with a per-section Save button (no global save → reduces fear of accidental changes):

1. **Profile** — display name, bio
2. **Email preferences** — existing 4 toggles
3. **Notifications** — existing 3 toggles
4. **Security** — change password
5. **Data** — export data (JSON/CSV)
6. **Danger zone** — delete account, `border border-[#E94560]/40` card with confirm-text-input modal

Top of every spoke: `← Profile` link, breadcrumb-style.

---

## 5. Data flow + new API

**Only new endpoint needed:**

```
GET /api/profile/cards          (authenticated)
→ { cards: [{ id, type, shortCode, payload, createdAt, views }] }
  sorted createdAt desc, limit 50
```

Reads from existing `share_cards` collection. No schema change. Auth via `getAuthSession()` + `userId` filter. Used by both the hub bento tile (latest 4) and the `/profile/cards` spoke (full list).

**Existing endpoints reused:** `/api/profile`, `/api/myPredictions`, `/api/myPredictions?tournament=true`, `/api/wallet`, `/api/notifications/preferences`, `/api/profile/email-preferences`, `/api/profile/change-password`, `/api/profile/export`.

---

## 6. Build order, risk, rollout

**Build order (ships visible value early, lowest-risk last):**

1. **Hub page** (`/profile/page.tsx`) — replace tabbed mega-page with bento. Reuses existing APIs. Highest-impact change, lands first.
2. **Cards spoke + API** (`/profile/cards/page.tsx` + `GET /api/profile/cards`) — the new surface.
3. **Predictions spoke** (`/profile/predictions/page.tsx`) — extract Predictions tab.
4. **Tournaments spoke** (`/profile/tournaments/page.tsx`) — extract Tournaments tab.
5. **Settings spoke** (`/profile/settings/page.tsx`) — extract Settings tab; restructure into stacked cards with per-section save + danger-zone confirmation modal.

After step 5, the old tabbed `/profile/page.tsx` is fully replaced. No legacy code remains.

**Risk + rollout:**
- All surfaces isolated to `/profile/*` — won't touch `/app`, tournaments, wallet, markets per scope.
- Single feature branch → single PR → squash merge → Amplify deploys (matches established flow).
- E2E: one happy-path Playwright spec per route (hits page, asserts key test ID).
- No DB migrations, no env-var changes, no contract breaks for existing consumers.

**Out of scope (explicit):**
- `InvitedCelebrationModal` stays — first-login moment is still special. The cards page is for revisiting, not replacing the celebration.
- No streak / badge system additions; redesign uses what's already there.
- Performance budgets unchanged (LCP < 2.5s, CLS < 0.1).
