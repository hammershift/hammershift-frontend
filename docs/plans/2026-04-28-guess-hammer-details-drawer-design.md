# Guess the Hammer — Auction details drawer (design)

**Goal:** give users an optional drill-in path to rich auction info before they make a hammer-price guess, without leaving the game flow. Guess the Hammer (`/price_is_right`) currently shows only thumbnail + title + bid + countdown at the moment of guessing — no path to year/make/model/mileage/description/gallery without navigating away to `/auction_details`.

**Out of scope:** `/daily`, `/tournaments`, `/auction_details`, the existing guess modal, the `AuctionCard` used outside Guess the Hammer. None of these change.

**Approach chosen:** right-slide details drawer triggered from a new `Details` button on each Guess the Hammer card. Mobile = bottom sheet. Reuses the existing `Sheet` primitive (same pattern TradingDrawer uses). The existing "Make Your Guess" CTA stays prominent; the drawer is a parallel surface, not a replacement.

---

## 1. Architecture & integration

```
/price_is_right (existing)
  └─ AuctionCard (existing, modified — only inside Guess the Hammer)
       ├─ image + title + bid + timer  ← unchanged
       ├─ "Details" button (new)        ← opens drawer
       └─ "Make Your Guess" CTA         ← unchanged
            ↓ (when clicked)
       Existing guess modal (unchanged)

  └─ AuctionDetailsDrawer (NEW)         ← right-slide on desktop, bottom-sheet on mobile
       └─ closes via X / Esc / outside-click;
          never replaces the guess modal — they coexist
```

**Trigger placement.** Add a `Details` button to the AuctionCard usage *inside* Guess the Hammer. Secondary visual weight — outline button next to the prominent "Make Your Guess" CTA, with a `Info` Lucide icon. Mobile: same row, smaller padding. The Details button only appears in the Guess the Hammer surface; Daily/tournament uses of the card stay byte-for-byte preserved.

**Component.** New `src/app/components/price_is_right/AuctionDetailsDrawer.tsx`, `"use client"`. Takes the same `auction` object the card already has, plus `open` and `onOpenChange`. Built on `@/components/ui/sheet` (already used by TradingDrawer — pattern parity).

**Data flow.** Zero new fetches. AuctionCard already has the full auction object in props (image, images_list, title, attributes, listing_details, page_url, sort.price, sort.deadline). The drawer renders directly from that. No new API route, no DB migration, no schema change.

**Hand-off back to guess.** Drawer footer has two buttons:
- `Make Your Guess →` — closes the drawer + opens the existing guess modal (whatever the card's existing CTA does)
- `Open full page ↗` — navigates to `/auction_details/[auction_id]` for the power-user deep-dive

---

## 2. Drawer content layout

```
┌─────────────────────────────────┐ ← sticky header (Sheet's built-in)
│ [×]  Auction details            │
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │
│  │   primary image (16:9)    │  │  ← ~40% drawer height
│  └───────────────────────────┘  │
│  [▢][▢][▢][▢][▢] →              │  ← thumb strip, click swaps
├─────────────────────────────────┤
│ 2018 Porsche 911 GT3 Touring    │  ← title (h2)
├─────────────────────────────────┤
│ MILEAGE   LOCATION   SELLER LOT │
│ 4,200 mi  Atlanta GA jdoe   #88 │  ← quick-stats row, font-mono
├─────────────────────────────────┤
│ HIGHLIGHTS                       │
│ • Manual transmission            │
│ • Original paint, no PPF         │
│ • Recent major service…  [more]  │  ← max 6 visible
├─────────────────────────────────┤
│ DESCRIPTION                      │
│ Lorem ipsum dolor sit amet…      │
│ [Read more]                      │  ← expand inline
├─────────────────────────────────┤
│ View on Bring a Trailer ↗        │  ← BaT link
└─────────────────────────────────┘
┌─────────────────────────────────┐ ← STICKY FOOTER
│ $42,500 · 03:21:14 left          │  ← current bid + countdown
│ [Open full page]  [Guess →]      │  ← buttons
└─────────────────────────────────┘
```

**Field sourcing (all from the existing auction object):**
- Title → `auction.title`
- Gallery → `auction.images_list[].src` (fallback to `auction.image`)
- Quick-stats → derived from `auction.attributes[]` (`key === "mileage"`, `"location"`, `"seller"`, `"lot"`) + `listing_details[]`
- Highlights → `listing_details[]` (filter for highlight-style entries) or an `attributes[]` highlight key
- Description → `auction.description[]` (handle nested array → bullet groups)
- BaT link → `auction.page_url`
- Bid + countdown → `auction.sort.price`, `auction.sort.deadline`

**Explicitly omitted (YAGNI):**
- AI prediction (don't bias the user's call)
- Comments / discussion (separate surface, would bloat drawer)
- Watchers / views / comments stats (not load-bearing for a price guess)
- Watchlist heart (wrong moment)

**Mobile.** Desktop = right-slide drawer ~520px wide; mobile = bottom-sheet up to 90vh. Gallery becomes a horizontal-scroll strip; everything else stacks. Sticky footer stays sticky on both.

---

## 3. Implementation specifics

**Files (all new or surgical):**

| File | Action | Purpose |
|---|---|---|
| `src/app/components/price_is_right/AuctionDetailsDrawer.tsx` | new (`"use client"`) | Drawer composed from existing Sheet primitive. ~250 LOC. |
| `src/app/components/price_is_right/AuctionGallery.tsx` | new (`"use client"`) | Image-swap state for the thumb strip. ~80 LOC. Could collapse into the drawer file if it stays simple — single-file by default, extract only if it grows. |
| `src/app/(pages)/price_is_right/GuessTheHammerClient.tsx` | modify | Add `Details` button + drawer state per card. No other behaviour change. |
| `src/lib/auctionFields.ts` | new (~60 LOC) | Tiny helpers: `getAttribute`, `getMileage`, `getLocation`, `getDescriptionBlocks` — narrow `unknown` → typed values from the loose `attributes[]` shape. Keeps the drawer JSX clean and gives one place to handle missing fields. |

**State on the page.** One `useState<string | null>(openCardId)` on `GuessTheHammerClient`. Clicking `Details` on any card sets it; the drawer reads card data from the existing array. `null` → drawer closed. Esc/×/outside-click → set null. No new prop drilling.

**Empty states.** Every section guards on missing data — no `images_list` → show single image; no attributes for a key → hide that quick-stat cell (no "—" placeholder); no description → hide the section entirely; no `listing_details` → hide highlights. The drawer never renders an empty section header.

**Accessibility.** The Sheet primitive already provides focus trap, Esc, restore-focus, scroll lock. Add:
- `aria-label="Auction details"` on the drawer
- `<h2>` title with stable id
- Image gallery `aria-label="Vehicle photo {n} of {total}"`
- Sticky footer `<div role="region" aria-label="Auction actions">`

**Tests.** One Playwright spec — `e2e/guess-the-hammer-drawer.spec.ts` — opens `/price_is_right`, clicks the first card's Details button, asserts `data-testid="auction-details-drawer"` is visible, asserts the title and at least one quick-stat cell render, dismisses, asserts the drawer closes.

**Risk.** The `attributes[]` array's shape varies across scraper versions (key casing, missing fields). The `auctionFields` helpers absorb that — drawer JSX never indexes into the array directly.

---

## 4. Build order, rollout, non-goals

**Build order (small enough that one PR is appropriate):**

1. `src/lib/auctionFields.ts` — pure helpers, easy to unit test
2. `src/app/components/price_is_right/AuctionDetailsDrawer.tsx` — composed against a mocked auction object first
3. Integration into `GuessTheHammerClient.tsx` — add Details button + drawer state
4. Playwright spec
5. Manual smoke on `/price_is_right` with real prod data via dev server

**Rollout.**
- Single feature branch → single PR → squash-merge → Amplify deploys (matches the established flow)
- No env vars, no DB migrations, no API contracts changed
- All visible changes confined to `/price_is_right` — Daily, tournaments, and `/auction_details` itself stay byte-for-byte identical

**Non-goals (explicit, won't drift):**
- The existing `/price_is_right` guess modal stays exactly as-is — the drawer is parallel
- `/daily` and `/tournaments` are not touched
- `/auction_details` is not modified — it's the deep-dive target via "Open full page ↗"
- No AI-prediction surfacing in the drawer (user makes their own call)
- No comment/discussion thread inside the drawer
