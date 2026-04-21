---
title: Frontend ↔ Scraper Sync Audit
date: 2026-04-21
owner: rickdeaconx
scope: frontend-only (read-only inspection of scraper/admin behavior)
---

# Executive Summary

The site is out-of-sync with Bring a Trailer in **four distinct ways**, each with a
different root cause. Two are fixable in this repo. One needs a frontend workaround
until the scraper is fixed. One is an admin-side operational gap.

| # | Symptom | Root cause owner | Fixable here? |
|---|---------|------------------|---------------|
| 1 | 1,086 live auctions show on BaT but `isActive: false` in our DB | admin activation workflow | workaround only |
| 2 | 1,838 `polygon_markets` stuck in `TRADING_CLOSED`; only 51 ever `RESOLVED` | scraper not writing `finalPrice` | workaround only |
| 3 | Active tournaments ending today with no replacements until Thursday; 0 `free_play` tournaments | **frontend cron bug** | **YES** |
| 4 | Tournaments ended 2-3 weeks ago still `isActive: true`; settlement uses stale schema | **frontend cron bug + stale code path** | **YES** |

---

# Evidence Collected

All figures pulled from `/api/debug/system` and `/api/tournaments` at 2026-04-21 15:00 UTC.

## Scraper health
- `scraper_runs` collection reports **0 runs in last 24h, 0 in last 7d** → debug endpoint says `status: DOWN`
- BUT auctions are being inserted constantly: newest `createdAt: 2026-04-21T14:34:56Z` (minutes ago)
- **The scraper IS running. It is simply not logging to `scraper_runs`.** The debug endpoint's scraper-health panel is lying.

## Auctions (`auctions` collection)
- Total: **1,110**
- `liveOnBaT` (real deadline > now): **1,086**
- `isActive: true`: implicitly ~**24** (total minus live-unactivated)
- Sample of newest 30 live auctions: **0 of 30** have `isActive: true`. Every new auction ships with `isActive: false`.
- 14 of 30 live auctions have `sort.bids = 0`; 15 of 30 have `sort.price ∈ {$0, $1}` → scraper inserts the auction record but **does not update bid/price after creation** for a large share of records.
- All 30 have `statusAndPriceChecked: false` and `finalPrice: null` — scraper never closes them out.

## Markets (`polygon_markets` collection)
- Total: **2,301**
- `ACTIVE`: 412
- `TRADING_CLOSED`: **1,838** (79.9% of all markets)
- `RESOLVED`: **51** (2.2%)
- `closesInFuture`: 444 — 32 more than ACTIVE, meaning some closed/resolved markets still have future `closesAt` (inconsistent state)
- Root cause: `oracleResolver.ts` correctly waits for `finalPrice` and marks `ORACLE_FAILED` after 90 min of grace — but that failure flag is the terminal state. Resolution requires scraper-captured `finalPrice`, which scraper isn't writing.

## Tournaments (`tournaments` collection)
- Active standard tournaments: **2** (Porsche Showdown $25, American Classics $10)
- Both end **today** (2026-04-21). Created 2026-04-20 13:54 UTC by Monday's cron.
- Active free-play tournaments: **0**
- "Recent" tournaments (ended ≤30 days ago) still returning `isActive: true`: **5 of 5 sampled**, ended between 2026-04-02 and 2026-04-08 — **13-19 days stale**.
- `create-tournaments` cron schedule: Mon + Thu at 12:00 UTC. Next run: Thu 2026-04-24.
- **Gap:** from tonight (Apr 21) through Thursday = **~72 hours with zero active tournaments** unless a user-facing workaround or manual run fills it.

---

# Bucket A — Frontend bugs we can and should fix

## A1. `create-tournaments` cron never produces `free_play` tournaments
**File:** `src/app/api/cron/create-tournaments/route.ts`

The clustering code sets `buyInFee` based on `avgPrice` (lines that assign $5 / $15 / $25). The final `type` is `cluster.buyInFee > 0 ? "paid" : "free_play"` — but `buyInFee` is never 0, so `type` is always `"paid"`. Result: **0 free-play tournaments in DB.**

**Fix:** force the first cluster each run to `buyInFee: 0` (→ `free_play`), or add a dedicated free-play clustering strategy. PRD 11.4 assumes free tournaments exist.

## A2. Cron runs only twice a week → 72h tournament gaps
**File:** `.github/workflows/create-tournaments.yml` (schedule `0 12 * * 1,4`)

With `TARGET_TOURNAMENTS_PER_RUN = 3` (and the route actually produced 2 yesterday), we rely on each run's tournaments to span 3-4 days. When scraper auctions end early or tournament clustering picks short-deadline auctions, we run out.

**Fix options:**
- Add `Tue` and `Fri` to cron: `0 12 * * 1,2,4,5`
- Or bump `TARGET_TOURNAMENTS_PER_RUN` to 5 so each run buys more days
- Or trigger on-demand when `count_active < 3`

## A3. Ended tournaments never have `isActive` flipped to `false`
**File:** `src/app/api/tournamentWinner/route.ts` (the GitHub cron `settle-tournaments` calls this)

The route uses numeric `status` (1=active, 2=completed, 3=cancelled, 4=paid) — but the tournaments API and UI filter on the boolean `isActive`. The two are never kept in sync. Result: completed tournaments keep showing in the "active" list for weeks.

**Fix:** in the settlement route, when we set `status: 2` or `status: 4`, also set `isActive: false` and add `archivedAt: new Date()`.

## A4. `tournamentWinner` reads the old auction schema
Same file, lines 74-78 and 127-128. It parses `auction.attributes[]` (key/value array) for `price` and `status`. Current scraper writes `sort.price` and `sort.bids`; `attributes[]` is the legacy shape. For any tournament with modern-schema auctions, `finalSellingPrice` will be `0` → scoring breaks → no winners → tournament stuck in status 2 forever.

**Fix:** read `auction.sort?.price` first, fall back to `attributes[]` lookup for legacy records.

## A5. `/api/tournaments` returns 400 when called without `?type=`
**File:** `src/app/api/tournaments/route.ts`

Not a scraper-sync issue but surfaced during this audit. Calling the bare route returns `Invalid tournament type`. Any dashboard/debug consumer without an explicit type gets a 400. Consider defaulting to `active` (= `free` + `standard`) when `type` is missing.

---

# Bucket B — Frontend workarounds for scraper gaps

These are patches we *can* apply inside the frontend to make the site less broken while
the scraper repo is fixed separately.

## B1. Auto-escalate markets stuck in `TRADING_CLOSED > N hours`
Currently `oracleResolver.ts` flips them to `ORACLE_FAILED` after 90 min of grace.
With 1,838 markets stuck, admin review is unreachable. Options:
- Void (refund) markets that are `ORACLE_FAILED` for > 24h so users get their stake back instead of waiting forever.
- Surface a "Voided — refunded" banner on the market card so users don't think we stole their money.

## B2. Hide auctions with stale `sort.price`
If `sort.bids == 0` AND `sort.price <= 1` AND `createdAt > 12h ago`, the scraper likely
never followed up to populate real data. Either suppress the market from `/api/cars`
responses or badge it as "Awaiting data".

## B3. Admin-side activation queue (surface it in UI, don't replace it)
1,086 unactivated live auctions is operationally impossible to clear by hand. The
frontend owns PRD 4.x UI; we could add an admin view counting `isActive: false` backlog
and a bulk-activate button. **This is an admin-repo concern per CLAUDE.md** — flag it,
don't build it.

## B4. "No live tournaments" empty state
Between Apr 21 night and Apr 24 midday the tournaments page will be empty. Add an
empty-state component explaining "Next tournament starts Thursday at noon UTC" rather
than a blank list. Cheap win.

---

# Bucket C — Issues to flag to other repo owners (no changes here)

| Repo | Issue | Impact |
|------|-------|--------|
| **scraper** | `scraper_runs` collection not being written (every run should insert a document with `auctionsScraped`, `startedAt`, `completedAt`) | We can't monitor scraper health |
| **scraper** | Scraper inserts auction records with `sort.price=0/1` and `sort.bids=0`, then **never updates** those fields as BaT bidding happens | Users bid on markets where our "current price" is wrong |
| **scraper** | No `finalPrice` / `statusAndPriceChecked=true` write-back after auction ends on BaT | 1,838 markets can never resolve → 51 resolved out of 2,301 lifetime |
| **scraper** | `sort.deadline` is offset -24h from BaT's actual deadline and frontend compensates by adding 24h. Brittle. | High risk if scraper changes offset convention. Should store true `endTime` directly. |
| **admin** | 1,086 live auctions waiting for `isActive: true` flip. Either the activation UI is broken or nobody is working the queue. | Users see almost no auctions despite huge inventory |
| **admin** | Legacy `status` numeric field on tournaments is the system of record for `tournamentWinner.ts`, but new code uses `isActive`. Pick one. | Settlement broken for modern tournaments |

---

# Recommended next actions (ranked by impact / effort)

1. **Fix A1 + A2 + A3 together** (one PR). Free-play cron output + bi-weekly schedule + `isActive:false` on settle. Roughly 60 lines of code. Unblocks tournament UI this week.
2. **Add B4 empty state.** 15-minute change. Prevents tonight looking like a dead site.
3. **Add B1 void-after-24h logic** with user-facing "refunded" badge. Returns 1,838 users' stakes.
4. **File scraper-repo issue** copying Bucket C as an issue so upstream knows.
5. **Defer A4 fix** until scraper writes `finalPrice` — otherwise tournament settlement still won't work even with correct schema reads.

---

# Out of scope (explicitly not touched)

- BaT scraper repo — per CLAUDE.md, read-only.
- Admin/Backend repo — per CLAUDE.md, read-only.
- The `tournamentWinner` helper imports (`calculateTournamentScores`, `prizeDistributionTournament`) — not rewriting tournament math; only schema reads.
