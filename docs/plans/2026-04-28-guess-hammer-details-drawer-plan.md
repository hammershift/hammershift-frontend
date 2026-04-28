# Guess the Hammer — Auction details drawer (implementation plan)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** add a right-slide auction details drawer to `/price_is_right`, triggered from a new `Details` button on each AuctionCard, so users can drill into car info before making a hammer-price guess without leaving the game flow.

**Architecture:** new client component `AuctionDetailsDrawer` built on the existing `Sheet` primitive (same pattern TradingDrawer uses). Renders gallery + quick-stats + highlights + description + BaT link, all from data already on the auction object the card has in props — zero new API or DB work. `GuessTheHammerClient` gets one new `useState<string | null>` to track the open drawer; the existing guess modal is untouched.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript 5.2, Tailwind 3, Radix UI Sheet primitive, Lucide icons, Playwright e2e. No new dependencies.

**Reference docs in repo:**
- Design: `docs/plans/2026-04-28-guess-hammer-details-drawer-design.md`
- Design tokens: see `CLAUDE.md` (`#0A0A1A`/`#13202D`/`#1E2A36`/`#E94560`/`#00D4AA`)
- Existing Sheet usage: `src/app/components/trading/TradingDrawer.tsx`
- Existing rich detail page (the "Open full page ↗" target): `src/app/(pages)/auction_details/page.tsx`
- Auction model: `src/models/auction.model.ts`

**Critical gotchas:**
- `auction.attributes` is a loose `Array<{key: string, value: unknown}>`. Key casing varies across scraper versions. Always read through `getAttribute()` helper, never index by position.
- `auction.description` can be `string[]` OR `unknown[]` with nested arrays for bullet groups. Helper handles both.
- Don't modify `AuctionCard.tsx` itself — Daily and tournaments use the same card and must stay byte-for-byte identical. Add the Details button at the `GuessTheHammerClient` callsite, OR pass a `showDetailsButton` prop and only set it true in Guess the Hammer.
- No `any` types (CLAUDE.md rule). Use `unknown` + narrow.
- All routes that fetch data need `export const dynamic = "force-dynamic"`. This task is client-only so doesn't apply.

---

## Phase 0 — Setup

### Task 0.1: Verify baseline

**Files:** none.

**Step 1: confirm clean state on the branch**

```bash
git status
```

Expected: clean tree on `feat/guess-hammer-details-drawer`. If not, surface to user.

**Step 2: typecheck baseline**

```bash
npx tsc --noEmit -p tsconfig.json
```

Expected: exit 0.

**Step 3: read the reference component**

Read `src/app/components/trading/TradingDrawer.tsx` end-to-end. Note:
- How it imports `Sheet` / `SheetContent` / `SheetHeader` / `SheetTitle`
- How it manages `open` / `onOpenChange`
- How sticky footer is composed
- Any a11y attributes used

This is your template.

**Step 4: read the existing guess modal**

Open `src/app/(pages)/price_is_right/GuessTheHammerClient.tsx`, find the existing inline modal (around lines 760-862 per the scout report). Note:
- How it's gated by state (`useState`)
- How "Make Your Guess" button currently triggers it
- The auction object shape passed in

You'll wire the drawer's "Make Your Guess →" footer button to whatever opens this modal.

No commit. Reconnaissance only.

---

## Phase 1 — Pure helpers

### Task 1.1: `auctionFields` helpers

**Files:**
- Create: `src/lib/auctionFields.ts`

**Step 1: Implement the helpers**

```ts
// src/lib/auctionFields.ts
//
// Read-only narrowing helpers for the loose auction document shape produced
// by the scraper. The `attributes` array's key casing varies across scraper
// versions, so always go through getAttribute() — never index by position.

export interface AuctionAttribute {
  key?: unknown;
  value?: unknown;
}

export interface AuctionLike {
  title?: unknown;
  image?: unknown;
  images_list?: unknown;
  attributes?: unknown;
  description?: unknown;
  listing_details?: unknown;
  page_url?: unknown;
  sort?: unknown;
}

function isAttr(v: unknown): v is AuctionAttribute {
  return typeof v === "object" && v !== null;
}

/**
 * Case-insensitive attribute lookup. Returns the first matching string value
 * or null if missing / non-string. Never throws on malformed shapes.
 */
export function getAttribute(auction: AuctionLike, key: string): string | null {
  const arr = auction.attributes;
  if (!Array.isArray(arr)) return null;
  const lower = key.toLowerCase();
  for (const raw of arr) {
    if (!isAttr(raw)) continue;
    const k = typeof raw.key === "string" ? raw.key.toLowerCase() : "";
    if (k === lower) {
      return typeof raw.value === "string" ? raw.value : null;
    }
  }
  return null;
}

export function getMileage(auction: AuctionLike): string | null {
  return getAttribute(auction, "mileage") ?? getAttribute(auction, "miles");
}

export function getLocation(auction: AuctionLike): string | null {
  return getAttribute(auction, "location");
}

export function getSeller(auction: AuctionLike): string | null {
  return getAttribute(auction, "seller");
}

export function getLot(auction: AuctionLike): string | null {
  return getAttribute(auction, "lot") ?? getAttribute(auction, "lot_number");
}

export interface GalleryImage {
  src: string;
}

/**
 * Returns gallery images (deduped, ordered). Falls back to [auction.image]
 * when images_list is missing or empty. Returns [] if neither is usable.
 */
export function getGallery(auction: AuctionLike): GalleryImage[] {
  const list = auction.images_list;
  const out: GalleryImage[] = [];
  if (Array.isArray(list)) {
    for (const item of list) {
      if (typeof item === "object" && item !== null) {
        const src = (item as { src?: unknown }).src;
        if (typeof src === "string" && src.length > 0) {
          out.push({ src });
        }
      }
    }
  }
  if (out.length === 0 && typeof auction.image === "string" && auction.image.length > 0) {
    out.push({ src: auction.image });
  }
  // dedupe by src
  const seen = new Set<string>();
  return out.filter((g) => (seen.has(g.src) ? false : (seen.add(g.src), true)));
}

/**
 * Description blocks. The scraper writes either:
 *   - string[] (paragraphs), or
 *   - Array<string | string[]> with nested arrays for bullet groups.
 * Returns a normalized form: { kind: "p", text } | { kind: "ul", items }.
 */
export type DescriptionBlock =
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] };

export function getDescriptionBlocks(auction: AuctionLike): DescriptionBlock[] {
  const desc = auction.description;
  if (!Array.isArray(desc)) return [];
  const out: DescriptionBlock[] = [];
  for (const block of desc) {
    if (typeof block === "string" && block.trim().length > 0) {
      out.push({ kind: "p", text: block });
    } else if (Array.isArray(block)) {
      const items = block.filter(
        (s): s is string => typeof s === "string" && s.trim().length > 0
      );
      if (items.length > 0) out.push({ kind: "ul", items });
    }
  }
  return out;
}

/**
 * Best-effort highlights — the scraper sometimes puts these in
 * listing_details, sometimes in attributes with key "highlights".
 * Returns string[] (empty if neither has usable content).
 */
export function getHighlights(auction: AuctionLike): string[] {
  const ld = auction.listing_details;
  if (Array.isArray(ld)) {
    return ld.filter(
      (s): s is string => typeof s === "string" && s.trim().length > 0
    );
  }
  const attr = getAttribute(auction, "highlights");
  if (attr) {
    return attr
      .split(/\r?\n|•|·/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }
  return [];
}

export function getBaTUrl(auction: AuctionLike): string | null {
  return typeof auction.page_url === "string" && auction.page_url.length > 0
    ? auction.page_url
    : null;
}

export interface AuctionStatusLite {
  currentBidUsd: number | null;
  deadline: Date | null;
}

export function getAuctionStatus(auction: AuctionLike): AuctionStatusLite {
  const sort = auction.sort;
  if (typeof sort !== "object" || sort === null) {
    return { currentBidUsd: null, deadline: null };
  }
  const s = sort as { price?: unknown; deadline?: unknown };
  const price = typeof s.price === "number" && Number.isFinite(s.price) ? s.price : null;
  let deadline: Date | null = null;
  if (s.deadline instanceof Date) deadline = s.deadline;
  else if (typeof s.deadline === "string") {
    const d = new Date(s.deadline);
    if (!isNaN(d.getTime())) deadline = d;
  }
  return { currentBidUsd: price, deadline };
}
```

**Step 2: typecheck**

```bash
npx tsc --noEmit -p tsconfig.json
```

Expected: exit 0.

**Step 3: commit**

```bash
git add src/lib/auctionFields.ts
git commit -m "feat(auction): typed helpers for loose auction fields"
```

---

## Phase 2 — Drawer component

### Task 2.1: AuctionDetailsDrawer skeleton

**Files:**
- Create: `src/app/components/price_is_right/AuctionDetailsDrawer.tsx`

**Step 1: Implement the drawer**

```tsx
// src/app/components/price_is_right/AuctionDetailsDrawer.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Info } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  type AuctionLike,
  getGallery,
  getMileage,
  getLocation,
  getSeller,
  getLot,
  getHighlights,
  getDescriptionBlocks,
  getBaTUrl,
  getAuctionStatus,
} from "@/lib/auctionFields";

const MAX_HIGHLIGHTS = 6;
const DESCRIPTION_PREVIEW_BLOCKS = 2;

interface Props {
  auction: (AuctionLike & { auction_id?: string; _id?: string }) | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Fired when the user clicks "Make Your Guess →". The parent should close
   * the drawer and open the existing guess modal for this auction.
   */
  onMakeGuess: () => void;
}

export default function AuctionDetailsDrawer({
  auction,
  open,
  onOpenChange,
  onMakeGuess,
}: Props) {
  const [showAllHighlights, setShowAllHighlights] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  if (!auction) return null;

  const gallery = getGallery(auction);
  const title = typeof auction.title === "string" ? auction.title : "Auction";
  const mileage = getMileage(auction);
  const location = getLocation(auction);
  const seller = getSeller(auction);
  const lot = getLot(auction);
  const highlights = getHighlights(auction);
  const descriptionBlocks = getDescriptionBlocks(auction);
  const batUrl = getBaTUrl(auction);
  const status = getAuctionStatus(auction);
  const fullPageId =
    (typeof auction.auction_id === "string" && auction.auction_id) ||
    (typeof auction._id === "string" && auction._id) ||
    "";

  const stats: Array<{ label: string; value: string }> = [];
  if (mileage) stats.push({ label: "Mileage", value: mileage });
  if (location) stats.push({ label: "Location", value: location });
  if (seller) stats.push({ label: "Seller", value: seller });
  if (lot) stats.push({ label: "Lot", value: `#${lot}` });

  const visibleHighlights = showAllHighlights
    ? highlights
    : highlights.slice(0, MAX_HIGHLIGHTS);

  const visibleDescription = descriptionExpanded
    ? descriptionBlocks
    : descriptionBlocks.slice(0, DESCRIPTION_PREVIEW_BLOCKS);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        data-testid="auction-details-drawer"
        className="w-full sm:max-w-[520px] bg-[#0A0A1A] border-l border-white/[0.08] p-0 flex flex-col"
      >
        <SheetHeader className="px-5 py-4 border-b border-white/[0.06]">
          <SheetTitle className="text-base font-semibold text-white flex items-center gap-2">
            <Info className="h-4 w-4 text-[#E94560]" aria-hidden />
            Auction details
          </SheetTitle>
          <SheetDescription className="sr-only">
            Vehicle photos, specs, highlights and description
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {gallery.length > 0 ? (
            <Gallery images={gallery} altBase={title} />
          ) : null}

          <div className="px-5 pt-4">
            <h2 className="text-lg md:text-xl font-bold text-white">{title}</h2>
          </div>

          {stats.length > 0 ? (
            <dl className="mt-4 mx-5 grid grid-cols-2 gap-x-4 gap-y-3 border-y border-white/[0.06] py-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="text-[11px] uppercase tracking-[0.15em] text-gray-500">
                    {s.label}
                  </dt>
                  <dd className="mt-1 font-mono text-sm text-white tabular-nums">
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}

          {highlights.length > 0 ? (
            <section className="mt-5 px-5">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500 mb-2">
                Highlights
              </h3>
              <ul className="space-y-1.5 text-sm text-gray-200">
                {visibleHighlights.map((h, i) => (
                  <li key={i} className="flex gap-2">
                    <span aria-hidden className="text-[#E94560] shrink-0">
                      •
                    </span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
              {highlights.length > MAX_HIGHLIGHTS ? (
                <button
                  type="button"
                  onClick={() => setShowAllHighlights((v) => !v)}
                  className="mt-2 text-xs text-[#E94560] hover:underline"
                >
                  {showAllHighlights ? "Show fewer" : `Show ${highlights.length - MAX_HIGHLIGHTS} more`}
                </button>
              ) : null}
            </section>
          ) : null}

          {descriptionBlocks.length > 0 ? (
            <section className="mt-5 px-5 pb-5">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500 mb-2">
                Description
              </h3>
              <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
                {visibleDescription.map((b, i) =>
                  b.kind === "p" ? (
                    <p key={i}>{b.text}</p>
                  ) : (
                    <ul key={i} className="list-disc pl-5 space-y-1">
                      {b.items.map((item, j) => (
                        <li key={j}>{item}</li>
                      ))}
                    </ul>
                  )
                )}
              </div>
              {descriptionBlocks.length > DESCRIPTION_PREVIEW_BLOCKS ? (
                <button
                  type="button"
                  onClick={() => setDescriptionExpanded((v) => !v)}
                  className="mt-2 text-xs text-[#E94560] hover:underline"
                >
                  {descriptionExpanded ? "Read less" : "Read more"}
                </button>
              ) : null}
            </section>
          ) : null}

          {batUrl ? (
            <div className="mx-5 my-4 pt-4 border-t border-white/[0.06]">
              <a
                href={batUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white"
              >
                View on Bring a Trailer
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
            </div>
          ) : null}
        </div>

        <div
          role="region"
          aria-label="Auction actions"
          className="border-t border-white/[0.06] bg-[#0A0A1A] px-5 py-4 space-y-3"
        >
          {status.currentBidUsd !== null || status.deadline !== null ? (
            <div className="flex items-center justify-between text-xs text-gray-400">
              {status.currentBidUsd !== null ? (
                <span className="font-mono tabular-nums text-white">
                  {`$${status.currentBidUsd.toLocaleString("en-US")}`}
                </span>
              ) : (
                <span />
              )}
              {status.deadline !== null ? (
                <span className="font-mono tabular-nums">
                  {formatTimeLeft(status.deadline)}
                </span>
              ) : null}
            </div>
          ) : null}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2">
            {fullPageId ? (
              <Link
                href={`/auction_details?id=${encodeURIComponent(fullPageId)}`}
                className="text-sm text-gray-300 hover:text-white border border-white/[0.08] rounded-lg px-3 py-2 text-center transition"
              >
                Open full page ↗
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onMakeGuess();
              }}
              className="rounded-lg bg-[#E94560] px-4 py-2 text-sm font-semibold text-white hover:bg-[#E94560]/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E94560] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A1A]"
            >
              Make Your Guess →
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Gallery({ images, altBase }: { images: Array<{ src: string }>; altBase: string }) {
  const [index, setIndex] = useState(0);
  const safeIndex = Math.min(Math.max(0, index), images.length - 1);
  const primary = images[safeIndex];
  return (
    <div>
      <div className="relative aspect-[16/9] bg-[#13202D]">
        <Image
          src={primary.src}
          alt={`${altBase} — photo ${safeIndex + 1} of ${images.length}`}
          fill
          sizes="(max-width: 640px) 100vw, 520px"
          className="object-cover"
          unoptimized
        />
      </div>
      {images.length > 1 ? (
        <div className="px-5 py-3 flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show photo ${i + 1} of ${images.length}`}
              aria-current={i === safeIndex}
              className={`relative shrink-0 w-16 h-12 rounded overflow-hidden border ${
                i === safeIndex
                  ? "border-[#E94560]"
                  : "border-white/[0.08] hover:border-white/[0.2]"
              } transition`}
            >
              <Image
                src={img.src}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
                unoptimized
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function formatTimeLeft(deadline: Date): string {
  const ms = deadline.getTime() - Date.now();
  if (ms <= 0) return "Ended";
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}
```

**Step 2: typecheck**

```bash
npx tsc --noEmit -p tsconfig.json
```

Expected: exit 0.

If you hit `Cannot find module '@/components/ui/sheet'` — verify the existing TradingDrawer's import path; the alias may be `@/app/components/ui/sheet`. Match whatever TradingDrawer uses.

**Step 3: commit**

```bash
git add src/app/components/price_is_right/AuctionDetailsDrawer.tsx
git commit -m "feat(price_is_right): AuctionDetailsDrawer component"
```

---

## Phase 3 — Integration into Guess the Hammer

### Task 3.1: Add Details button + drawer state

**Files:**
- Modify: `src/app/(pages)/price_is_right/GuessTheHammerClient.tsx`

**Step 1: Read the existing file**

Find the section that renders each AuctionCard. Note:
- The card array variable name (likely `auctions` or `cars`)
- How `auction_id` (or `_id`) is extracted
- Where the existing "Make Your Guess" button lives (per scout report, around lines 760-862 — but verify current line numbers)

**Step 2: Add imports + state**

At the top of the file:
```ts
import AuctionDetailsDrawer from "@/app/components/price_is_right/AuctionDetailsDrawer";
import { Info } from "lucide-react";
```

In the component body (near the existing `useState` calls):
```ts
const [detailsOpenId, setDetailsOpenId] = useState<string | null>(null);
const detailsAuction =
  detailsOpenId === null
    ? null
    : auctions.find(
        (a) =>
          (typeof a.auction_id === "string" && a.auction_id === detailsOpenId) ||
          (typeof a._id === "string" && a._id === detailsOpenId)
      ) ?? null;
```

(Substitute `auctions` with whatever the array variable is actually named.)

**Step 3: Add the Details button next to "Make Your Guess"**

In the per-card JSX, alongside the existing primary CTA:
```tsx
<button
  type="button"
  onClick={() =>
    setDetailsOpenId(
      typeof auction.auction_id === "string"
        ? auction.auction_id
        : (auction._id as string)
    )
  }
  aria-label={`View details for ${typeof auction.title === "string" ? auction.title : "auction"}`}
  className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-2 text-sm text-gray-300 hover:text-white hover:border-white/[0.2] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E94560]"
>
  <Info className="h-4 w-4" aria-hidden />
  Details
</button>
```

Place it BEFORE the existing "Make Your Guess" button so the primary CTA remains visually dominant on the right.

**Step 4: Mount the drawer once at the bottom of the component's return tree**

```tsx
<AuctionDetailsDrawer
  auction={detailsAuction}
  open={detailsOpenId !== null}
  onOpenChange={(o) => {
    if (!o) setDetailsOpenId(null);
  }}
  onMakeGuess={() => {
    if (detailsAuction) {
      // Whatever the existing "Make Your Guess" button does — call the same
      // handler. If it sets state like `setActiveGuess(auction)`, do that
      // here with `detailsAuction`. Match the existing pattern exactly.
      // ...
    }
  }}
/>
```

The exact `onMakeGuess` body depends on how the existing modal opens. If the current button does `setActiveGuess(auction)` then call `setActiveGuess(detailsAuction)`. Read the existing handler and mirror it.

**Step 5: typecheck**

```bash
npx tsc --noEmit -p tsconfig.json
```

Expected: exit 0.

**Step 6: visual smoke**

Start the dev server (`PORT=3010 LAUNCH_GATE_ENABLED=false npm run dev`), open `http://localhost:3010/price_is_right`, click `Details` on any card. Drawer should slide in from the right with title, gallery, stats. Click the X or press Esc — closes. Click `Make Your Guess →` — closes the drawer and the existing guess modal opens.

**Step 7: commit**

```bash
git add 'src/app/(pages)/price_is_right/GuessTheHammerClient.tsx'
git commit -m "feat(price_is_right): wire details button + drawer state into hub"
```

---

## Phase 4 — E2E spec

### Task 4.1: Playwright spec

**Files:**
- Create: `e2e/guess-the-hammer-drawer.spec.ts`

**Step 1: Write the spec**

```ts
// e2e/guess-the-hammer-drawer.spec.ts
import { test, expect } from "@playwright/test";

test.describe("guess the hammer — details drawer", () => {
  test("Details button opens drawer; drawer renders title + actions; close works", async ({
    page,
  }) => {
    await page.goto("/price_is_right");

    // Wait for the first card with a Details button to appear. If the page
    // requires auth or returns no auctions in this environment, skip.
    const detailsButton = page.getByRole("button", { name: /^view details/i }).first();
    if ((await detailsButton.count()) === 0) {
      test.skip(true, "No auctions on the page in this env");
    }

    await detailsButton.click();
    const drawer = page.getByTestId("auction-details-drawer");
    await expect(drawer).toBeVisible();

    // Title is present
    await expect(drawer.getByRole("heading", { level: 2 })).toBeVisible();

    // At least one quick-stat cell renders (Mileage, Location, Seller, or Lot)
    const statLabels = drawer.locator("dt");
    await expect(statLabels.first()).toBeVisible();

    // Footer actions are present
    await expect(drawer.getByRole("button", { name: /make your guess/i })).toBeVisible();

    // Close via Escape
    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
  });
});
```

**Step 2: Run the spec**

```bash
TEST_BASE_URL=http://localhost:3010 npx playwright test e2e/guess-the-hammer-drawer.spec.ts --project=desktop-chrome
```

Expected: 1 passed (or skipped cleanly if no auctions).

**Step 3: commit**

```bash
git add e2e/guess-the-hammer-drawer.spec.ts
git commit -m "test(price_is_right): e2e for auction details drawer"
```

---

## Phase 5 — Wrap up

### Task 5.1: Final smoke + PR

**Step 1: typecheck + lint**

```bash
npx tsc --noEmit -p tsconfig.json
npx eslint src/lib/auctionFields.ts src/app/components/price_is_right/AuctionDetailsDrawer.tsx 'src/app/(pages)/price_is_right/GuessTheHammerClient.tsx'
```

Both: exit 0.

**Step 2: visual smoke checklist**

Start dev server, sign in with the real founder cookie (or load `/price_is_right` if it doesn't require auth in this env). Verify:
- [ ] Details button visible on every card alongside Make Your Guess
- [ ] Click → drawer slides in from the right (desktop) / up from the bottom (mobile, simulate via DevTools)
- [ ] Gallery: thumbs swap the primary image; arrow keys focus thumbs (Sheet's default behaviour)
- [ ] Quick-stats render with mono numbers
- [ ] Highlights collapse to 6 items with "Show N more" link
- [ ] Description collapses with "Read more"
- [ ] BaT link opens in new tab
- [ ] Footer "Make Your Guess →" closes drawer + opens existing guess modal with the right auction
- [ ] Footer "Open full page ↗" navigates to /auction_details?id=...
- [ ] Esc, click-outside, X all close the drawer
- [ ] Drawer doesn't appear on /daily or /tournaments (only on /price_is_right)

**Step 3: open PR**

```bash
gh pr create --base main --head feat/guess-hammer-details-drawer \
  --title "feat(price_is_right): auction details drawer for guess the hammer" \
  --body-file .pr-body.md
```

PR body:
- Summary: drill-in path before guessing — drawer slide-in with gallery, stats, highlights, description, BaT link
- Out of scope: /daily, /tournaments, /auction_details (link target only)
- Test plan checklist from Step 2
- No env vars, no DB migrations, no API contract changes

**Step 4: merge**

After review, squash-merge.

---

## Non-goals (do not do)

- Do not modify the existing `AuctionCard` component shared with /daily and /tournaments. Add the Details button at the GuessTheHammerClient callsite, OR pass an explicit `showDetailsButton` prop and only set it true here.
- Do not modify the existing guess modal. The drawer hands off to it via `onMakeGuess`.
- Do not modify `/auction_details/page.tsx`. It's the deep-dive target only.
- Do not surface AI prediction in the drawer. User makes their own call.
- Do not add comments / discussion thread in the drawer.
- Do not add new env vars or DB migrations.
- Do not add backend routes — all data comes from the existing auction document already in the card's props.
