# Prediction Market Production MVP — Bug Fix & Foundation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix 7 blocking bugs in the prediction market system and build the 6 missing API endpoints needed for production readiness.

**Architecture:** Off-chain CPMM binary prediction market. User balances and positions stored in MongoDB. Market lifecycle: ACTIVE → (oracle cron resolves with `winningOutcome`) → RESOLVED → (settle cron pays winners) → SETTLED. All monetary values are USD dollars throughout (fixing the cents-vs-dollars confusion is Task 5). The GET /api/polygon-markets route handles display only — it never writes resolution state to the DB.

**Tech Stack:** Next.js 14 App Router, TypeScript, MongoDB (via Mongoose for cron routes, MongoClient clientPromise for transaction-capable routes), NextAuth for auth, CPMM AMM in `src/lib/amm.ts`.

---

## Context: What was built and what is broken

Four parallel research agents wrote the prediction market engine. A QA agent audited the output and found 7 blocking bugs. This plan fixes them in order of safety (safest/most isolated first), then adds the missing endpoints.

### Blocking bugs to fix (in order)

| Bug | Location | Problem |
|-----|----------|---------|
| B-6 | `cron/resolve-markets/route.ts:19` | `secret === undefined` is `true` if CRON_SECRET unset → open to unauthenticated calls |
| B-5 | `admin/integrity-flags/route.ts:143` | `new ObjectId(resolvedBy)` throws 500 if resolvedBy is email/string |
| B-4 | `api/polygon-markets/route.ts:99-213` | Lazy resolver writes `RESOLVED` without `winningOutcome` → settle cron skips these markets |
| B-1 | `lib/tradeValidator.ts:281` | Position cap check reads `market_positions` but trades write to `polygon_positions` → caps never enforced |
| B-2 | `lib/tradeValidator.ts:234-286` | Validator treats `user.balance` (stored in dollars) as cents → balance check fails for all valid trades |
| B-3 | `cron/create-markets/route.ts` + auto-create | `yesPool`/`noPool` not written at creation → trade route silently falls back to `?? 50` |
| B-7 | `api/polygon-markets/[marketId]/trade/route.ts:164` | Pool state read before transaction start → concurrent trades corrupt the k invariant |

### Canonical monetary unit decision

**All monetary values in this codebase are stored in USD dollars (not cents).**

Evidence:
- `user.model.ts:40` — `balance: { type: Number, default: 0 }` (auth.ts initializes to `500`)
- `amm.ts` — `quoteTradeExact` accepts and returns dollars
- `settle-markets/route.ts` — credits `netPayout` (dollars) to `user.balance`
- `trade/route.ts` — body receives dollars, increments `totalVolume` by `usdcAmount` (dollars)

The QA agent named this "B-2": `tradeValidator.ts` is internally inconsistent — it labels everything "cents" and uses `STANDARD_POSITION_CAP_CENTS = 50_000` but the actual comparison is broken because `user.balance` is dollars. This plan standardizes the validator to use dollars throughout.

### TypeScript verification command

There is no formal test suite. After each task, run:

```bash
cd /Users/rickdeaconx/hammershift-frontend && npx tsc --noEmit 2>&1 | head -30
```

Expected: zero errors.

---

## Task 1: Fix B-6 — Cron auth guard missing null check

**Files:**
- Modify: `src/app/api/cron/resolve-markets/route.ts:18-20`

**Problem:** If `CRON_SECRET` env var is not set, `process.env.CRON_SECRET` is `undefined`. The check `secret === process.env.CRON_SECRET` becomes `undefined === undefined` which is `true`. Any request without the header passes auth.

**Step 1: Open the file and locate the isAuthorized function**

Current code at lines 18-21 of `src/app/api/cron/resolve-markets/route.ts`:
```typescript
function isAuthorized(req: Request): boolean {
  const secret = req.headers.get('x-cron-secret');
  return secret === process.env.CRON_SECRET;
}
```

**Step 2: Replace with guarded version**

Replace the function body:
```typescript
function isAuthorized(req: Request): boolean {
  const secret = req.headers.get('x-cron-secret');
  return !!secret && secret === process.env.CRON_SECRET;
}
```

The `!!secret` guard ensures that if `secret` is `null` (header absent) and `CRON_SECRET` is also `undefined`, the function returns `false` instead of `true`.

**Step 3: Verify TypeScript compiles**

```bash
cd /Users/rickdeaconx/hammershift-frontend && npx tsc --noEmit 2>&1 | head -20
```
Expected: no new errors.

**Step 4: Commit**

```bash
cd /Users/rickdeaconx/hammershift-frontend
git add src/app/api/cron/resolve-markets/route.ts
git commit -m "fix: guard cron auth against undefined CRON_SECRET env var"
```

---

## Task 2: Fix B-5 — ObjectId guard missing in integrity-flags PATCH

**Files:**
- Modify: `src/app/api/admin/integrity-flags/route.ts:138-148`

**Problem:** Line 143: `resolvedBy: new ObjectId(resolvedBy)` — `resolvedBy` comes from `body.resolvedBy ?? session.user.id ?? "unknown"`. If the session user ID is an email address, or if `resolvedBy` is the string `"unknown"`, `new ObjectId()` throws an unhandled exception → 500 response.

**Step 1: Locate the PATCH handler's update call**

Current code at line 138-148:
```typescript
const result = await db.collection("polygon_flags").findOneAndUpdate(
  { _id: flagObjectId, resolved: false },
  {
    $set: {
      resolved: true,
      resolvedBy: new ObjectId(resolvedBy),
      resolvedAt: new Date(),
    },
  },
  { returnDocument: "after" }
);
```

**Step 2: Replace with guarded ObjectId**

```typescript
// Attempt to cast resolvedBy to ObjectId; fall back to storing as string if not a valid hex ID
let resolvedByValue: ObjectId | string;
try {
  resolvedByValue = new ObjectId(resolvedBy);
} catch {
  resolvedByValue = resolvedBy; // store as string (e.g., email or "unknown")
}

const result = await db.collection("polygon_flags").findOneAndUpdate(
  { _id: flagObjectId, resolved: false },
  {
    $set: {
      resolved: true,
      resolvedBy: resolvedByValue,
      resolvedAt: new Date(),
    },
  },
  { returnDocument: "after" }
);
```

**Step 3: Verify TypeScript**

```bash
cd /Users/rickdeaconx/hammershift-frontend && npx tsc --noEmit 2>&1 | head -20
```

**Step 4: Commit**

```bash
git add src/app/api/admin/integrity-flags/route.ts
git commit -m "fix: guard ObjectId cast in integrity-flags PATCH resolvedBy field"
```

---

## Task 3: Fix B-4 — Remove DB writes from lazy resolver in polygon-markets GET

**Files:**
- Modify: `src/app/api/polygon-markets/route.ts`

**Problem:** The GET route has two places that write `status: "RESOLVED"` to the DB without setting `winningOutcome`:

1. Lines 99-108: `updateMany` that resolves ACTIVE markets whose `closesAt` has passed
2. Lines 203-213: Fire-and-forget `updateMany` that resolves markets detected as expired during enrichment

The settle cron (`/api/cron/settle-markets`) queries `{ status: "RESOLVED", winningOutcome: { $in: ["YES", "NO"] } }`. Markets resolved by the lazy resolver have `winningOutcome: null` and are **permanently skipped by the settle cron**. Winners never get paid.

**Why the lazy resolver exists:** It was added to hide ended markets from the ACTIVE tab. But the correct way to do this is to filter in the response, not write to the DB. Only the oracle cron (`/api/cron/resolve-markets`) should write `RESOLVED` + `winningOutcome`.

**Step 1: Remove the auto-resolve updateMany block**

Remove lines 97-108 entirely (the block that starts with `// Auto-resolve any ACTIVE markets whose closesAt has passed`):

```typescript
// DELETE THESE LINES:
// Auto-resolve any ACTIVE markets whose closesAt has passed (lazy resolver)
// Handle both BSON Date and ISO string stored values
await db.collection("polygon_markets").updateMany(
  {
    status: "ACTIVE",
    $or: [
      { closesAt: { $lt: now } },
      { closesAt: { $lt: now.toISOString() } },
    ],
  },
  { $set: { status: "RESOLVED", resolvedAt: now, updatedAt: now } }
);
```

**Step 2: Remove the fire-and-forget DB write block**

Remove lines 173-181 (the inline `shouldResolve` status override) and lines 202-213 (the fire-and-forget `updateMany`).

Change the enrichment map to keep the actual DB status, not compute a synthetic one:

```typescript
const enriched = markets.map((market) => {
  const auctionDoc = auctionMap.get(market.auctionId) ?? null;
  const auction = buildAuctionProjection(auctionDoc);

  return {
    _id: market._id,
    auctionId: market.auctionId,
    question: market.question ?? buildQuestion(market.predictedPrice ?? 0),
    status: market.status,  // ← use the actual DB status, not synthetic override
    yesPrice: market.yesPrice ?? 0.5,
    noPrice: market.noPrice ?? 0.5,
    totalVolume: market.totalVolume ?? 0,
    totalLiquidity: market.totalLiquidity ?? 0,
    predictedPrice: market.predictedPrice,
    winningOutcome: market.winningOutcome ?? null,
    resolvedAt: market.resolvedAt ?? null,
    createdAt: market.createdAt,
    currentBid: auctionDoc?.sort?.price ?? null,
    auction,
  };
});
```

**Step 3: Update the ACTIVE filter to exclude expired auctions at query time**

To keep ended markets off the ACTIVE tab without writing to the DB, tighten the query filter. The existing `marketFilter` for ACTIVE already filters on `closesAt > now`. This is sufficient — keep it.

**Step 4: Remove the toResolveIds block and the _shouldResolve stripping**

These are no longer needed once the enrichment map no longer sets `_shouldResolve`.

The final enriched output does not need stripping. Remove these lines:

```typescript
// DELETE THESE LINES:
const toResolveIds = enriched
  .filter((m) => m._shouldResolve)
  .map((m) => m._id);
if (toResolveIds.length > 0) {
  db.collection("polygon_markets")
    .updateMany(...)
    .catch(() => {});
}
const output = enriched.map(({ _shouldResolve: _, ...rest }) => rest);
```

Replace with:
```typescript
const output = enriched;
```

**Step 5: Verify TypeScript**

```bash
cd /Users/rickdeaconx/hammershift-frontend && npx tsc --noEmit 2>&1 | head -30
```

**Step 6: Commit**

```bash
git add src/app/api/polygon-markets/route.ts
git commit -m "fix: remove lazy resolver DB writes from GET route — oracle cron is sole resolver"
```

---

## Task 4: Fix B-1 — Unify market_positions → polygon_positions in tradeValidator.ts

**Files:**
- Modify: `src/lib/tradeValidator.ts:281` and `src/lib/tradeValidator.ts:439`

**Problem:** `validateTrade()` checks position caps by querying the `market_positions` collection (line 281). `recordTradeForRiskTracking()` writes positions to `market_positions` (line 439). But `trade/route.ts` writes positions to `polygon_positions` (inside `executeTradeWrites`). The result: the position cap enforcement always sees 0 for every user because the cap check and the actual position are in different collections.

**Step 1: Change the cap check collection (line ~281)**

Find this in `validateTrade`:
```typescript
const existingPosition = await db.collection("market_positions").findOne(
  { userId: userObjectId, marketId: marketObjectId, outcome },
  { projection: { totalUSDC: 1 } }
);
```

Change to:
```typescript
const existingPosition = await db.collection("polygon_positions").findOne(
  { userId: userObjectId, marketId: marketObjectId, outcome, status: "OPEN" },
  { projection: { totalCost: 1 } }
);
```

Note: `polygon_positions` stores the running cost as `totalCost` (set by the pipeline upsert in trade route), not `totalUSDC`. Update the reference below it too.

**Step 2: Update the position read field name**

Find:
```typescript
const currentPositionCents: number = existingPosition?.totalUSDC ?? 0;
```

Change to:
```typescript
const currentPositionDollars: number = existingPosition?.totalCost ?? 0;
```

(Rename the variable — you will fix the units in Task 5. For now just make the collection and field name correct.)

**Step 3: Change recordTradeForRiskTracking to not maintain a separate position collection**

The `recordTradeForRiskTracking` function in `tradeValidator.ts` also does an `updateOne` on `market_positions`. Since the trade route handles the position upsert in `polygon_positions`, this function should only write the rate limit sentinel — not maintain a separate positions table.

Find and remove this block from `recordTradeForRiskTracking`:

```typescript
// REMOVE THIS BLOCK:
// Upsert position running total
await db.collection("market_positions").updateOne(
  { userId: userObjectId, marketId: marketObjectId, outcome },
  {
    $inc: { totalUSDC: usdcAmount, tradeCount: 1 },
    $set: { lastTradeAt: now, updatedAt: now },
    $setOnInsert: { firstTradeAt: now },
  },
  { upsert: true }
);
```

The rate limit sentinel insert stays. The position upsert is removed from here (it's handled inside the trade transaction).

**Step 4: Verify TypeScript**

```bash
cd /Users/rickdeaconx/hammershift-frontend && npx tsc --noEmit 2>&1 | head -30
```

**Step 5: Commit**

```bash
git add src/lib/tradeValidator.ts
git commit -m "fix: unify position collection to polygon_positions throughout tradeValidator"
```

---

## Task 5: Fix B-2 — Standardize monetary units to dollars in tradeValidator.ts

**Files:**
- Modify: `src/lib/tradeValidator.ts` (constants + balance check + cap comparisons)
- Modify: `src/app/api/polygon-markets/[marketId]/trade/route.ts:139-158` (remove cents conversion)

**Problem:** `tradeValidator.ts` was written assuming "cents" but `user.balance` is stored in dollars (default 0, auth.ts sets to 500 meaning $500). The constants are labeled `_CENTS` but the comparisons break when `user.balance` is dollars. The trade route also converts `usdcAmount` to cents before passing to `validateTrade`, doubling the confusion.

**Decision:** Everything in dollars throughout. `usdcAmount` parameter to `validateTrade` is always dollars. Position caps are dollars. The rate-limit sentinel records `amountUSDC` in dollars.

**Step 1: Update constants in tradeValidator.ts**

Replace the constants block:

```typescript
// BEFORE:
export const STANDARD_POSITION_CAP_CENTS = 50_000; // $500.00
export const TRUSTED_POSITION_CAP_CENTS = 250_000; // $2,500.00
export const POOL_CAP_PCT = 0.20; // 20%
export const HIGH_VALUE_MARKET_CAP_MULTIPLIER = 0.5;
export const RATE_LIMIT_MAX_TRADES = 10;
export const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
export const TRADING_CUTOFF_MS = 4 * 60 * 60 * 1000;
export const SNIPE_THRESHOLD_CENTS = 20_000;  // $200.00
export const SNIPE_WINDOW_MINUTES = 30;
export const HIGH_VALUE_PREDICTED_PRICE_USD = 100_000;
export const CAP_APPROACH_THRESHOLD_PCT = 0.80;
```

```typescript
// AFTER:
export const STANDARD_POSITION_CAP = 500;           // $500.00
export const TRUSTED_POSITION_CAP = 2_500;          // $2,500.00
export const POOL_CAP_PCT = 0.20;                   // 20% of totalLiquidity
export const HIGH_VALUE_MARKET_CAP_MULTIPLIER = 0.5;
export const RATE_LIMIT_MAX_TRADES = 10;
export const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
export const TRADING_CUTOFF_MS = 4 * 60 * 60 * 1000;
export const SNIPE_THRESHOLD = 200;                 // $200.00
export const SNIPE_WINDOW_MINUTES = 30;
export const HIGH_VALUE_PREDICTED_PRICE_USD = 100_000;
export const CAP_APPROACH_THRESHOLD_PCT = 0.80;
```

**Step 2: Update validateTrade JSDoc parameter description**

Change:
```
 * @param usdcAmount   - Trade size in USDC cents (integer). $1 = 100.
```
To:
```
 * @param usdcAmount   - Trade size in USD dollars (positive number). $10 trade = 10.
```

**Step 3: Remove the "positive integer" guard for usdcAmount**

Change:
```typescript
if (!Number.isInteger(usdcAmount) || usdcAmount <= 0) {
  return { valid: false, reason: "Trade amount must be a positive integer (USDC cents)." };
}
```
To:
```typescript
if (typeof usdcAmount !== "number" || usdcAmount <= 0) {
  return { valid: false, reason: "Trade amount must be a positive number (USD dollars)." };
}
```

**Step 4: Fix the balance check**

Change:
```typescript
const userBalanceCents: number = user.balance ?? 0;
if (userBalanceCents < usdcAmount) {
  const shortfall = ((usdcAmount - userBalanceCents) / 100).toFixed(2);
  return {
    valid: false,
    reason: `Insufficient balance. You need $${shortfall} more USDC to place this trade.`,
  };
}
```
To:
```typescript
const userBalance: number = user.balance ?? 0;
if (userBalance < usdcAmount) {
  const shortfall = (usdcAmount - userBalance).toFixed(2);
  return {
    valid: false,
    reason: `Insufficient balance. You need $${shortfall} more USDC to place this trade.`,
  };
}
```

**Step 5: Fix the hard cap variables**

Change:
```typescript
let hardCapCents = isTrusted
  ? (market.trustedUserCapUSDC ?? TRUSTED_POSITION_CAP_CENTS)
  : (market.positionCapUSDC ?? STANDARD_POSITION_CAP_CENTS);
if (isHighValue) {
  hardCapCents = Math.floor(hardCapCents * HIGH_VALUE_MARKET_CAP_MULTIPLIER);
}
const totalLiquidity: number = market.totalLiquidity ?? 0;
const poolCapCents =
  totalLiquidity > 0
    ? Math.floor(totalLiquidity * POOL_CAP_PCT)
    : hardCapCents;
const effectiveCapCents = Math.min(hardCapCents, poolCapCents);
const existingPosition = ...
const currentPositionCents: number = existingPosition?.totalCost ?? 0;
const projectedPositionCents = currentPositionCents + usdcAmount;
if (projectedPositionCents > effectiveCapCents) {
  const remainingCents = Math.max(0, effectiveCapCents - currentPositionCents);
  const remainingDollars = (remainingCents / 100).toFixed(2);
  const capDollars = (effectiveCapCents / 100).toFixed(2);
  ...
}
if (projectedPositionCents >= effectiveCapCents * CAP_APPROACH_THRESHOLD_PCT) {
```
To (all in dollars):
```typescript
let hardCap = isTrusted
  ? (market.trustedUserCapUSDC ?? TRUSTED_POSITION_CAP)
  : (market.positionCapUSDC ?? STANDARD_POSITION_CAP);
if (isHighValue) {
  hardCap = hardCap * HIGH_VALUE_MARKET_CAP_MULTIPLIER;
}
const totalLiquidity: number = market.totalLiquidity ?? 0;
const poolCap =
  totalLiquidity > 0
    ? totalLiquidity * POOL_CAP_PCT
    : hardCap;
const effectiveCap = Math.min(hardCap, poolCap);
const existingPosition = await db.collection("polygon_positions").findOne(
  { userId: userObjectId, marketId: marketObjectId, outcome, status: "OPEN" },
  { projection: { totalCost: 1 } }
);
const currentPosition: number = existingPosition?.totalCost ?? 0;
const projectedPosition = currentPosition + usdcAmount;
if (projectedPosition > effectiveCap) {
  const remaining = Math.max(0, effectiveCap - currentPosition);
  return {
    valid: false,
    reason:
      remaining === 0
        ? `You have reached the $${effectiveCap.toFixed(2)} position limit for ${outcome} on this market.`
        : `This trade would exceed your $${effectiveCap.toFixed(2)} position limit. Maximum additional amount: $${remaining.toFixed(2)}.`,
  };
}
if (projectedPosition >= effectiveCap * CAP_APPROACH_THRESHOLD_PCT) {
```

**Step 6: Fix the cap-approach flag metadata**

Change:
```typescript
metadata: {
  currentPositionCents,
  projectedPositionCents,
  effectiveCapCents,
```
To:
```typescript
metadata: {
  currentPosition,
  projectedPosition,
  effectiveCap,
```

**Step 7: Fix the snipe check**

Change:
```typescript
if (usdcAmount >= SNIPE_THRESHOLD_CENTS && minutesToClose <= SNIPE_WINDOW_MINUTES) {
```
To:
```typescript
if (usdcAmount >= SNIPE_THRESHOLD && minutesToClose <= SNIPE_WINDOW_MINUTES) {
```

**Step 8: Update trade route — remove cents conversion**

In `src/app/api/polygon-markets/[marketId]/trade/route.ts`, find:
```typescript
const usdcAmountCents = Math.round(usdcAmount * 100);
```
And the call:
```typescript
const riskCheck = await validateTrade(userId, marketId, outcome, usdcAmountCents, db, ctx);
```

Remove the `usdcAmountCents` line. Change the `validateTrade` call:
```typescript
const riskCheck = await validateTrade(userId, marketId, outcome, usdcAmount, db, ctx);
```

Also update `recordTradeForRiskTracking` call:
```typescript
// BEFORE:
recordTradeForRiskTracking(userId, marketId, outcome, usdcAmountCents, db, ctx)
// AFTER:
recordTradeForRiskTracking(userId, marketId, outcome, usdcAmount, db, ctx)
```

**Step 9: Update marketRiskSetup.ts imports** (it imports the old constant names)

In `src/lib/marketRiskSetup.ts`, the imports from `tradeValidator` reference old constant names. Update:

```typescript
// BEFORE:
import {
  TRADING_CUTOFF_MS,
  HIGH_VALUE_PREDICTED_PRICE_USD,
  STANDARD_POSITION_CAP_CENTS,
  TRUSTED_POSITION_CAP_CENTS,
  HIGH_VALUE_MARKET_CAP_MULTIPLIER,
} from "./tradeValidator";
```

```typescript
// AFTER:
import {
  TRADING_CUTOFF_MS,
  HIGH_VALUE_PREDICTED_PRICE_USD,
  STANDARD_POSITION_CAP,
  TRUSTED_POSITION_CAP,
  HIGH_VALUE_MARKET_CAP_MULTIPLIER,
} from "./tradeValidator";
```

Then update usage in `computeMarketRiskFields`:

```typescript
// BEFORE:
const positionCapUSDC = isHighValue
  ? Math.floor(STANDARD_POSITION_CAP_CENTS * HIGH_VALUE_MARKET_CAP_MULTIPLIER)
  : STANDARD_POSITION_CAP_CENTS;

const trustedUserCapUSDC = isHighValue
  ? Math.floor(TRUSTED_POSITION_CAP_CENTS * HIGH_VALUE_MARKET_CAP_MULTIPLIER)
  : TRUSTED_POSITION_CAP_CENTS;
```

```typescript
// AFTER:
const positionCapUSDC = isHighValue
  ? STANDARD_POSITION_CAP * HIGH_VALUE_MARKET_CAP_MULTIPLIER
  : STANDARD_POSITION_CAP;

const trustedUserCapUSDC = isHighValue
  ? TRUSTED_POSITION_CAP * HIGH_VALUE_MARKET_CAP_MULTIPLIER
  : TRUSTED_POSITION_CAP;
```

**Step 10: Verify TypeScript — this is the biggest change, errors are expected initially**

```bash
cd /Users/rickdeaconx/hammershift-frontend && npx tsc --noEmit 2>&1 | head -50
```

Fix any type errors before proceeding.

**Step 11: Commit**

```bash
git add src/lib/tradeValidator.ts src/lib/marketRiskSetup.ts src/app/api/polygon-markets/\[marketId\]/trade/route.ts
git commit -m "fix: standardize monetary units to USD dollars throughout tradeValidator"
```

---

## Task 6: Fix B-3 — Write yesPool/noPool at market creation

**Files:**
- Modify: `src/app/api/cron/create-markets/route.ts:71-89`
- Modify: `src/app/api/polygon-markets/route.ts` (autoCreateMissingMarkets function)

**Problem:** Neither market creation path writes `yesPool` or `noPool`. The trade route falls back to `yesPool = market.yesPool ?? 50` silently. Markets created by the cron all share the same implicit $50/$50 initial pool, but this is never persisted — meaning concurrent trades can't rely on consistent pool state in the DB.

**The fix:** Write `yesPool: 50, noPool: 50` explicitly at creation in both paths. This makes the initial pool state visible in the DB and eliminates the silent fallback in the trade route.

**Step 1: Add pool fields to create-markets cron insertOne**

In `src/app/api/cron/create-markets/route.ts`, find the `insertOne` call and add pool fields:

```typescript
await db.collection('polygon_markets').insertOne({
  auctionId,
  question: `Will this sell above $${predictedPrice.toLocaleString()}?`,
  status: 'ACTIVE',
  yesPrice: 0.5,
  noPrice: 0.5,
  yesPool: 50,       // ← ADD
  noPool: 50,        // ← ADD
  totalVolume: 0,
  totalLiquidity: 0,
  predictedPrice,
  winningOutcome: null,
  resolvedAt: null,
  closesAt,
  imageUrl: auction.image ?? null,
  title: auction.title ?? null,
  ...riskFields,
  createdAt: now,
  updatedAt: now,
});
```

**Step 2: Add pool fields to auto-create in polygon-markets GET route**

In `src/app/api/polygon-markets/route.ts`, find the `insertOne` inside `autoCreateMissingMarkets` and add pool fields:

```typescript
await db!.collection("polygon_markets").insertOne({
  auctionId,
  question: `Will this sell above $${predictedPrice.toLocaleString()}?`,
  status: "ACTIVE",
  yesPrice: 0.5,
  noPrice: 0.5,
  yesPool: 50,       // ← ADD
  noPool: 50,        // ← ADD
  totalVolume: 0,
  totalLiquidity: 0,
  predictedPrice,
  winningOutcome: null,
  resolvedAt: null,
  closesAt: auction.sort?.deadline ?? null,
  imageUrl: auction.image ?? null,
  title: auction.title ?? null,
  createdAt: now,
  updatedAt: now,
});
```

Note: The auto-create path does NOT call `computeMarketRiskFields`. That is intentional for now — the risk fields are only set by the dedicated cron. The auto-create path is a fallback for when the cron hasn't run yet.

**Step 3: Remove the silent fallback in trade route (now that DB always has pool values)**

In `src/app/api/polygon-markets/[marketId]/trade/route.ts`, change:

```typescript
// BEFORE:
const yesPool: number = market.yesPool ?? 50;
const noPool: number = market.noPool ?? 50;

if (yesPool <= 0 || noPool <= 0) {
  return NextResponse.json(
    { message: "Market pool is not initialized" },
    { status: 500 }
  );
}
```

```typescript
// AFTER:
const yesPool: number | null = market.yesPool ?? null;
const noPool: number | null = market.noPool ?? null;

if (!yesPool || !noPool || yesPool <= 0 || noPool <= 0) {
  return NextResponse.json(
    { message: "Market pool is not initialized. Contact support." },
    { status: 500 }
  );
}
```

This keeps the error path but removes the silent `?? 50` fallback that was masking missing pool data.

**Step 4: Verify TypeScript**

```bash
cd /Users/rickdeaconx/hammershift-frontend && npx tsc --noEmit 2>&1 | head -20
```

**Step 5: Commit**

```bash
git add src/app/api/cron/create-markets/route.ts src/app/api/polygon-markets/route.ts src/app/api/polygon-markets/\[marketId\]/trade/route.ts
git commit -m "fix: write yesPool/noPool at market creation; remove silent pool fallback in trade route"
```

---

## Task 7: Fix B-7 — Read pool state inside transaction to prevent race condition

**Files:**
- Modify: `src/app/api/polygon-markets/[marketId]/trade/route.ts`

**Problem:** Pool state (`yesPool`, `noPool`) is loaded from the DB at line ~164, BEFORE the transaction starts. The AMM quote is computed from this snapshot. If two concurrent trades hit the same market simultaneously:

1. Trade A reads pool: `{yesPool: 50, noPool: 50}`
2. Trade B reads pool: `{yesPool: 50, noPool: 50}` (same snapshot — Trade A hasn't committed yet)
3. Trade A commits new pool: `{yesPool: 60, noPool: 41.67}`
4. Trade B commits new pool based on its OLD snapshot: `{yesPool: 60, noPool: 41.67}` (same values as A — WRONG)

The k invariant is broken. Both trades think they got the same shares but only one's pool update is correct.

**Fix:** Move the pool read and AMM quote computation inside the transaction. Read pool with the session, compute AMM, then write — all within the transaction so the DB serializes the reads.

**Step 1: Extract executeTradeWrites to accept usdcAmount and maxSlippage, returning quote**

The `executeTradeWrites` function currently accepts a pre-computed `quote`. Change it to compute the quote inside the transaction from a fresh pool read.

Modify the `WriteParams` interface:

```typescript
// BEFORE:
interface WriteParams {
  tradeId: ObjectId;
  userObjectId: ObjectId;
  marketObjectId: ObjectId;
  marketId: string;
  userId: string;
  outcome: "YES" | "NO";
  usdcAmount: number;
  quote: ReturnType<typeof quoteTradeExact>;
  now: Date;
}
```

```typescript
// AFTER:
interface WriteParams {
  tradeId: ObjectId;
  userObjectId: ObjectId;
  marketObjectId: ObjectId;
  marketId: string;
  userId: string;
  outcome: "YES" | "NO";
  usdcAmount: number;
  maxSlippage: number;  // ← ADD: used to compute quote inside transaction
  now: Date;
}
```

**Step 2: Move pool read + AMM quote into executeTradeWrites**

At the top of `executeTradeWrites`, add a fresh pool read before the wallet debit:

```typescript
async function executeTradeWrites(
  db: ReturnType<typeof import("mongodb").MongoClient.prototype.db>,
  session: ClientSession,
  p: WriteParams
): Promise<ReturnType<typeof quoteTradeExact>> {  // ← now returns the quote
  const { tradeId, userObjectId, marketObjectId, outcome, usdcAmount, maxSlippage, now } = p;

  // ── 0. Re-read pool state inside the transaction ─────────────────────────
  // This is the authoritative read. The pre-transaction market load is only used
  // for validation (status check, auth). Pool state MUST be read here to prevent
  // race conditions between concurrent trades.
  const freshMarket = await db.collection("polygon_markets").findOne(
    { _id: marketObjectId, status: "ACTIVE" },
    { projection: { yesPool: 1, noPool: 1, status: 1 }, session }
  );

  if (!freshMarket) {
    throw new Error("Market not found or no longer ACTIVE");
  }

  const yesPool: number = freshMarket.yesPool ?? 0;
  const noPool: number = freshMarket.noPool ?? 0;

  if (yesPool <= 0 || noPool <= 0) {
    throw new Error("Market pool is not initialized");
  }

  // Compute AMM quote from the transactionally-consistent pool state
  const quote = quoteTradeExact({ yesPool, noPool }, outcome, usdcAmount, maxSlippage);

  // ── a. Debit wallet ... (rest of existing code)
```

**Step 3: Update the pool update to use quote from fresh read**

The `$set` for pool values is already using `quote.newPool.yesPool` and `quote.newPool.noPool` — that stays correct. The quote is now computed from fresh pool data inside the transaction.

**Step 4: Remove the pre-transaction pool read and quote from the route handler**

In the route handler's main body, remove:

```typescript
// REMOVE THESE LINES (pre-transaction pool read):
const yesPool: number | null = market.yesPool ?? null;
const noPool: number | null = market.noPool ?? null;
if (!yesPool || !noPool || yesPool <= 0 || noPool <= 0) {
  return NextResponse.json(...);
}

// REMOVE (pre-transaction AMM quote):
let quote: ReturnType<typeof quoteTradeExact>;
try {
  quote = quoteTradeExact(
    { yesPool, noPool },
    outcome,
    usdcAmount,
    maxSlippage
  );
} catch (err) {
  const message = err instanceof Error ? err.message : "AMM calculation failed";
  return NextResponse.json({ message }, { status: 422 });
}
```

**Step 5: Update the transaction call to pass maxSlippage and capture returned quote**

```typescript
// BEFORE:
let dbSession: ClientSession | null = null;
let walletDebited = false;

try {
  dbSession = client.startSession();
  try {
    await dbSession.withTransaction(async () => {
      await executeTradeWrites(db, dbSession!, { tradeId, ..., quote, now });
    });
```

```typescript
// AFTER:
let dbSession: ClientSession | null = null;
let quote: ReturnType<typeof quoteTradeExact> | null = null;

try {
  dbSession = client.startSession();
  try {
    await dbSession.withTransaction(async () => {
      quote = await executeTradeWrites(db, dbSession!, {
        tradeId, userObjectId, marketObjectId, marketId,
        userId, outcome, usdcAmount, maxSlippage, now,
      });
    });
```

**Step 6: Handle the slippage error from inside the transaction**

The `quoteTradeExact` call inside `executeTradeWrites` can throw a slippage error. The transaction will catch it and abort. In the catch block in the route handler, detect slippage errors and return 422 instead of 500:

```typescript
} catch (txErr) {
  const txErrMsg = txErr instanceof Error ? txErr.message : String(txErr);
  if (txErrMsg.includes("Slippage") || txErrMsg.includes("zero or negative shares")) {
    return NextResponse.json({ message: txErrMsg }, { status: 422 });
  }
  throw txErr;
}
```

**Step 7: Update the response to use the returned quote**

```typescript
// The quote is now returned from executeTradeWrites; use it for the response
if (!quote) {
  return NextResponse.json({ message: "Trade failed — no quote available" }, { status: 500 });
}

return NextResponse.json(
  {
    tradeId: tradeId.toHexString(),
    sharesReceived: round6(quote.sharesReceived),
    // ... rest of response
  },
  { status: 201 }
);
```

**Step 8: Apply same fix to executeCompensatingWrites (fallback path)**

The compensating writes function also needs the pool re-read. Apply the same pattern: add pool read + AMM quote at the top of `executeCompensatingWrites`, return the quote.

**Step 9: Verify TypeScript**

```bash
cd /Users/rickdeaconx/hammershift-frontend && npx tsc --noEmit 2>&1 | head -30
```

**Step 10: Commit**

```bash
git add src/app/api/polygon-markets/\[marketId\]/trade/route.ts
git commit -m "fix: read pool state inside transaction to prevent AMM race condition"
```

---

## Task 8: Create MongoDB indexes for all prediction market collections

**Files:**
- Create: `scripts/create-market-indexes.ts`

**Why this is needed:** Without indexes, every trade validation does a full collection scan on `polygon_positions` (to check position caps) and on `trade_rate_limits` (to check rate limit). At scale this is slow and expensive. The TTL index on `trade_rate_limits` is also required for automatic cleanup.

**Step 1: Create the index script**

Create `scripts/create-market-indexes.ts`:

```typescript
/**
 * scripts/create-market-indexes.ts
 *
 * Run once (or on deploy) to create MongoDB indexes for prediction market collections.
 * Safe to run multiple times — MongoDB ignores createIndex calls for existing indexes.
 *
 * Run with:
 *   npx ts-node --project tsconfig.json scripts/create-market-indexes.ts
 *
 * Or from package.json:
 *   "db:indexes": "ts-node scripts/create-market-indexes.ts"
 */

import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI not set in .env.local");
  process.exit(1);
}

async function createIndexes() {
  const client = new MongoClient(uri!);
  await client.connect();
  const db = client.db(process.env.DB_NAME);

  console.log("Creating indexes...\n");

  // ── polygon_markets ────────────────────────────────────────────────────────
  await db.collection("polygon_markets").createIndexes([
    { key: { status: 1 }, name: "status_1" },
    { key: { auctionId: 1 }, name: "auctionId_1", unique: true },
    { key: { status: 1, closesAt: 1 }, name: "status_closesAt" },
    { key: { closesAt: 1, oracleStatus: 1 }, name: "closesAt_oracleStatus" },
  ]);
  console.log("✅ polygon_markets");

  // ── polygon_positions ──────────────────────────────────────────────────────
  await db.collection("polygon_positions").createIndexes([
    {
      key: { userId: 1, marketId: 1, outcome: 1, status: 1 },
      name: "userId_marketId_outcome_status",
      unique: true,
    },
    { key: { marketId: 1, outcome: 1, status: 1 }, name: "marketId_outcome_status" },
    { key: { userId: 1, status: 1 }, name: "userId_status" },
  ]);
  console.log("✅ polygon_positions");

  // ── polygon_trades ─────────────────────────────────────────────────────────
  await db.collection("polygon_trades").createIndexes([
    { key: { marketId: 1, createdAt: -1 }, name: "marketId_createdAt" },
    { key: { userId: 1, createdAt: -1 }, name: "userId_createdAt" },
  ]);
  console.log("✅ polygon_trades");

  // ── polygon_flags ──────────────────────────────────────────────────────────
  await db.collection("polygon_flags").createIndexes([
    { key: { resolved: 1, severity: 1, createdAt: -1 }, name: "resolved_severity_createdAt" },
    { key: { marketId: 1, resolved: 1 }, name: "marketId_resolved" },
  ]);
  console.log("✅ polygon_flags");

  // ── trade_rate_limits ──────────────────────────────────────────────────────
  // TTL index: MongoDB auto-deletes documents older than 3600 seconds (1 hour)
  await db.collection("trade_rate_limits").createIndexes([
    {
      key: { tradedAt: 1 },
      name: "tradedAt_ttl",
      expireAfterSeconds: 3600,
    },
    {
      key: { userId: 1, marketId: 1, tradedAt: 1 },
      name: "userId_marketId_tradedAt",
    },
  ]);
  console.log("✅ trade_rate_limits (TTL + compound)");

  // ── fee_ledger ─────────────────────────────────────────────────────────────
  await db.collection("fee_ledger").createIndexes([
    { key: { marketId: 1, createdAt: -1 }, name: "marketId_createdAt" },
    { key: { createdAt: -1 }, name: "createdAt" },
  ]);
  console.log("✅ fee_ledger");

  await client.close();
  console.log("\nAll indexes created.");
}

createIndexes().catch((err) => {
  console.error("Index creation failed:", err);
  process.exit(1);
});
```

**Step 2: Add the script to package.json**

In `package.json`, add to the `scripts` section:
```json
"db:indexes": "ts-node --project tsconfig.json scripts/create-market-indexes.ts"
```

**Step 3: Run the script to create indexes**

```bash
cd /Users/rickdeaconx/hammershift-frontend && npx ts-node --project tsconfig.json scripts/create-market-indexes.ts
```

Expected output:
```
Creating indexes...

✅ polygon_markets
✅ polygon_positions
✅ polygon_trades
✅ polygon_flags
✅ trade_rate_limits (TTL + compound)
✅ fee_ledger

All indexes created.
```

**Step 4: Commit**

```bash
git add scripts/create-market-indexes.ts package.json
git commit -m "feat: add MongoDB index script for all prediction market collections"
```

---

## Task 9: Add GET /api/polygon-markets/[marketId]/quote — AMM preview

**Files:**
- Create: `src/app/api/polygon-markets/[marketId]/quote/route.ts`

**Purpose:** Returns a trade preview (shares, price, fee, slippage) without executing the trade. Used by the TradingDrawer UI to show the user what they'll get before they confirm.

**Step 1: Create the route file**

```typescript
/**
 * GET /api/polygon-markets/[marketId]/quote
 *
 * Returns an AMM trade quote for the given market, outcome, and USDC amount.
 * Does NOT execute the trade or modify any state.
 *
 * Query params:
 *   outcome     - "YES" | "NO" (required)
 *   usdcAmount  - positive number in USD dollars (required)
 *   maxSlippage - decimal 0-1, default 0.05 (5%)
 */

import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/lib/mongoose";
import mongoose from "mongoose";
import { quoteTradeExact } from "@/lib/amm";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ marketId: string }> }
) {
  const { marketId } = await params;

  const { searchParams } = req.nextUrl;
  const outcome = searchParams.get("outcome");
  const usdcAmountStr = searchParams.get("usdcAmount");
  const maxSlippageStr = searchParams.get("maxSlippage") ?? "0.05";

  if (outcome !== "YES" && outcome !== "NO") {
    return NextResponse.json({ message: "outcome must be YES or NO" }, { status: 400 });
  }

  const usdcAmount = parseFloat(usdcAmountStr ?? "");
  if (isNaN(usdcAmount) || usdcAmount <= 0) {
    return NextResponse.json({ message: "usdcAmount must be a positive number" }, { status: 400 });
  }

  const maxSlippage = parseFloat(maxSlippageStr);
  if (isNaN(maxSlippage) || maxSlippage < 0 || maxSlippage > 1) {
    return NextResponse.json({ message: "maxSlippage must be between 0 and 1" }, { status: 400 });
  }

  await connectToDB();
  const db = mongoose.connection.db!;

  let marketObjectId: import("mongodb").ObjectId;
  try {
    marketObjectId = new (await import("mongodb")).ObjectId(marketId);
  } catch {
    return NextResponse.json({ message: "Invalid marketId" }, { status: 400 });
  }

  const market = await db.collection("polygon_markets").findOne(
    { _id: marketObjectId },
    { projection: { yesPool: 1, noPool: 1, status: 1, tradingClosesAt: 1, closesAt: 1 } }
  );

  if (!market) {
    return NextResponse.json({ message: "Market not found" }, { status: 404 });
  }

  if (market.status !== "ACTIVE") {
    return NextResponse.json(
      { message: `Market is ${market.status.toLowerCase()} — trading is closed` },
      { status: 422 }
    );
  }

  const yesPool: number = market.yesPool ?? 50;
  const noPool: number = market.noPool ?? 50;

  try {
    const quote = quoteTradeExact({ yesPool, noPool }, outcome, usdcAmount, maxSlippage);
    return NextResponse.json({
      outcome,
      usdcAmount,
      sharesReceived: Math.round(quote.sharesReceived * 1_000_000) / 1_000_000,
      pricePerShare: Math.round(quote.pricePerShare * 10_000) / 10_000,
      fee: Math.round(quote.fee * 100) / 100,
      usdcAfterFee: Math.round(quote.usdcAfterFee * 100) / 100,
      newYesPrice: Math.round(quote.newYesPrice * 10_000) / 10_000,
      newNoPrice: Math.round(quote.newNoPrice * 10_000) / 10_000,
      slippagePct: Math.round(quote.slippagePct * 10_000) / 10_000,
      currentYesPrice: Math.round((noPool / (yesPool + noPool)) * 10_000) / 10_000,
      currentNoPrice: Math.round((yesPool / (yesPool + noPool)) * 10_000) / 10_000,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Quote failed";
    return NextResponse.json({ message }, { status: 422 });
  }
}
```

**Step 2: Verify TypeScript**

```bash
cd /Users/rickdeaconx/hammershift-frontend && npx tsc --noEmit 2>&1 | head -20
```

**Step 3: Test manually**

```bash
curl "http://localhost:3000/api/polygon-markets/MARKET_ID_HERE/quote?outcome=YES&usdcAmount=10"
```

Expected: JSON with `sharesReceived`, `pricePerShare`, `fee`, etc.

**Step 4: Commit**

```bash
git add src/app/api/polygon-markets/\[marketId\]/quote/route.ts
git commit -m "feat: add AMM quote endpoint for trade preview"
```

---

## Task 10: Add GET /api/polygon-markets/[marketId]/positions — positions for a market

**Files:**
- Create: `src/app/api/polygon-markets/[marketId]/positions/route.ts`

**Purpose:** Returns all open positions for a given market. Used in the admin integrity dashboard and optionally in a public "leaderboard for this market" view.

**Step 1: Create the route file**

```typescript
/**
 * GET /api/polygon-markets/[marketId]/positions
 *
 * Returns all positions (OPEN or SETTLED) for the given market.
 * Requires admin session to see userId details.
 * Public access returns aggregate totals only (no PII).
 *
 * Query params:
 *   status - "OPEN" | "SETTLED" | "ALL" (default: "OPEN")
 */

import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/lib/mongoose";
import mongoose from "mongoose";
import { getAuthSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ marketId: string }> }
) {
  const { marketId } = await params;
  const { searchParams } = req.nextUrl;
  const statusParam = searchParams.get("status") ?? "OPEN";
  const session = await getAuthSession();
  const isAdmin = ["admin", "superadmin"].includes(
    (session?.user as { role?: string })?.role ?? ""
  );

  await connectToDB();
  const db = mongoose.connection.db!;

  let marketObjectId: import("mongodb").ObjectId;
  try {
    marketObjectId = new (await import("mongodb")).ObjectId(marketId);
  } catch {
    return NextResponse.json({ message: "Invalid marketId" }, { status: 400 });
  }

  const filter: Record<string, unknown> = { marketId: marketObjectId };
  if (statusParam !== "ALL") {
    const validStatuses = ["OPEN", "SETTLED"];
    if (validStatuses.includes(statusParam)) {
      filter.status = statusParam;
    }
  }

  const positions = await db
    .collection("polygon_positions")
    .find(filter)
    .sort({ totalCost: -1 })
    .limit(200)
    .toArray();

  if (!isAdmin) {
    // Strip userId from public response
    return NextResponse.json(
      positions.map((p) => ({
        outcome: p.outcome,
        shares: p.shares,
        totalCost: p.totalCost,
        avgCostBasis: p.avgCostBasis,
        status: p.status,
        payout: p.payout ?? null,
      }))
    );
  }

  return NextResponse.json(positions);
}
```

**Step 2: Verify TypeScript**

```bash
cd /Users/rickdeaconx/hammershift-frontend && npx tsc --noEmit 2>&1 | head -20
```

**Step 3: Commit**

```bash
git add src/app/api/polygon-markets/\[marketId\]/positions/route.ts
git commit -m "feat: add market positions endpoint"
```

---

## Task 11: Add GET /api/users/me/positions — current user's positions

**Files:**
- Create: `src/app/api/users/me/positions/route.ts`

**Purpose:** Returns the authenticated user's prediction positions across all markets. Used in the profile page and portfolio view.

**Step 1: Create the route file**

```typescript
/**
 * GET /api/users/me/positions
 *
 * Returns the authenticated user's prediction market positions.
 * Enriches each position with market question, status, and winning outcome.
 *
 * Query params:
 *   status - "OPEN" | "SETTLED" | "ALL" (default: "ALL")
 */

import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/lib/mongoose";
import mongoose from "mongoose";
import { getAuthSession } from "@/lib/auth";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?._id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user._id as string;
  let userObjectId: ObjectId;
  try {
    userObjectId = new ObjectId(userId);
  } catch {
    return NextResponse.json({ message: "Invalid user session" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const statusParam = searchParams.get("status") ?? "ALL";

  await connectToDB();
  const db = mongoose.connection.db!;

  const filter: Record<string, unknown> = { userId: userObjectId };
  if (statusParam !== "ALL" && ["OPEN", "SETTLED"].includes(statusParam)) {
    filter.status = statusParam;
  }

  const positions = await db
    .collection("polygon_positions")
    .find(filter)
    .sort({ updatedAt: -1 })
    .limit(200)
    .toArray();

  if (positions.length === 0) {
    return NextResponse.json([]);
  }

  // Enrich with market data
  const marketIds = [...new Set(positions.map((p) => p.marketId.toString()))];
  const marketObjectIds = marketIds.map((id) => new ObjectId(id));

  const markets = await db
    .collection("polygon_markets")
    .find({ _id: { $in: marketObjectIds } })
    .project({ question: 1, status: 1, winningOutcome: 1, predictedPrice: 1, closesAt: 1, title: 1, imageUrl: 1 })
    .toArray();

  const marketMap = new Map(markets.map((m) => [m._id.toString(), m]));

  const enriched = positions.map((p) => {
    const market = marketMap.get(p.marketId.toString()) ?? null;
    const isWinner =
      market?.winningOutcome && market.winningOutcome === p.outcome;
    const isLoser =
      market?.winningOutcome && market.winningOutcome !== p.outcome;

    return {
      _id: p._id,
      marketId: p.marketId,
      outcome: p.outcome,
      shares: p.shares,
      totalCost: p.totalCost,
      avgCostBasis: p.avgCostBasis,
      status: p.status,
      payout: p.payout ?? null,
      grossPayout: p.grossPayout ?? null,
      settlementFee: p.settlementFee ?? null,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      settledAt: p.settledAt ?? null,
      market: market
        ? {
            question: market.question,
            status: market.status,
            winningOutcome: market.winningOutcome ?? null,
            predictedPrice: market.predictedPrice,
            closesAt: market.closesAt ?? null,
            title: market.title ?? null,
            imageUrl: market.imageUrl ?? null,
          }
        : null,
      result: isWinner ? "WON" : isLoser ? "LOST" : "PENDING",
    };
  });

  return NextResponse.json(enriched);
}
```

**Step 2: Verify TypeScript**

```bash
cd /Users/rickdeaconx/hammershift-frontend && npx tsc --noEmit 2>&1 | head -20
```

**Step 3: Commit**

```bash
git add src/app/api/users/me/positions/route.ts
git commit -m "feat: add user positions endpoint for portfolio view"
```

---

## Task 12: Add POST /api/polygon-markets/[marketId]/redeem — claim winnings

**Files:**
- Create: `src/app/api/polygon-markets/[marketId]/redeem/route.ts`

**Purpose:** Allows a user to manually trigger redemption of their winning position. The settle cron handles bulk settlement, but users should also be able to claim immediately after a market resolves. This is idempotent — the OPEN guard on positions prevents double-payout.

**Step 1: Create the route file**

```typescript
/**
 * POST /api/polygon-markets/[marketId]/redeem
 *
 * Redeems the authenticated user's winning position for the given market.
 * Idempotent: uses findOneAndUpdate with { status: "OPEN" } guard.
 *
 * The market must be RESOLVED with a winningOutcome set.
 * The user must have an OPEN position on the winning outcome.
 *
 * Returns: { payout, sharesRedeemed, fee }
 */

import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getAuthSession } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { calcSettlementPayout } from "@/lib/amm";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ marketId: string }> }
) {
  const session = await getAuthSession();
  if (!session?.user?._id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user._id as string;
  let userObjectId: ObjectId;
  try {
    userObjectId = new ObjectId(userId);
  } catch {
    return NextResponse.json({ message: "Invalid user session" }, { status: 401 });
  }

  const { marketId } = await params;
  let marketObjectId: ObjectId;
  try {
    marketObjectId = new ObjectId(marketId);
  } catch {
    return NextResponse.json({ message: "Invalid marketId" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db();
  const now = new Date();

  // Load market — must be RESOLVED with winningOutcome
  const market = await db
    .collection("polygon_markets")
    .findOne({ _id: marketObjectId }, { projection: { status: 1, winningOutcome: 1 } });

  if (!market) {
    return NextResponse.json({ message: "Market not found" }, { status: 404 });
  }

  if (market.status !== "RESOLVED" && market.status !== "SETTLED") {
    return NextResponse.json(
      { message: "Market has not resolved yet — check back after the auction ends." },
      { status: 422 }
    );
  }

  if (!market.winningOutcome) {
    return NextResponse.json(
      { message: "Market outcome is pending oracle confirmation." },
      { status: 422 }
    );
  }

  const winningOutcome = market.winningOutcome as "YES" | "NO";

  // Find user's winning OPEN position
  const position = await db.collection("polygon_positions").findOne({
    userId: userObjectId,
    marketId: marketObjectId,
    outcome: winningOutcome,
    status: "OPEN",
  });

  if (!position) {
    // Check if they had a losing position
    const losingPosition = await db.collection("polygon_positions").findOne({
      userId: userObjectId,
      marketId: marketObjectId,
      outcome: winningOutcome === "YES" ? "NO" : "YES",
    });
    if (losingPosition) {
      return NextResponse.json(
        { message: `The market resolved ${winningOutcome}. Your ${losingPosition.outcome} position did not win.` },
        { status: 422 }
      );
    }
    return NextResponse.json(
      { message: "No winning position found for this market." },
      { status: 404 }
    );
  }

  const shares: number = position.shares ?? 0;
  if (shares <= 0) {
    return NextResponse.json({ message: "Position has zero shares." }, { status: 422 });
  }

  const { grossPayout, fee, netPayout } = calcSettlementPayout(shares);

  // Atomic: mark position SETTLED (OPEN guard prevents double-payout)
  const settled = await db.collection("polygon_positions").findOneAndUpdate(
    { _id: position._id, status: "OPEN" },
    {
      $set: {
        status: "SETTLED",
        settledAt: now,
        grossPayout,
        settlementFee: fee,
        payout: netPayout,
        updatedAt: now,
      },
    },
    { returnDocument: "after" }
  );

  if (!settled) {
    return NextResponse.json(
      { message: "Position already redeemed." },
      { status: 409 }
    );
  }

  // Credit user wallet
  await db.collection("users").updateOne(
    { _id: userObjectId },
    { $inc: { balance: netPayout }, $set: { updatedAt: now } }
  );

  // Transaction audit
  await db.collection("transactions").insertOne({
    userID: userObjectId,
    transactionType: "prediction_payout",
    amount: netPayout,
    type: "+",
    status: "success",
    marketId: marketObjectId,
    positionId: position._id,
    grossPayout,
    settlementFee: fee,
    winningOutcome,
    transactionDate: now,
  });

  // Fee ledger
  await db.collection("fee_ledger").insertOne({
    type: "settlement_fee",
    marketId: marketObjectId,
    userId: userObjectId,
    positionId: position._id,
    amount: fee,
    grossPayout,
    createdAt: now,
  });

  return NextResponse.json({
    ok: true,
    sharesRedeemed: shares,
    grossPayout: Math.round(grossPayout * 100) / 100,
    fee: Math.round(fee * 100) / 100,
    netPayout: Math.round(netPayout * 100) / 100,
    newBalance: null, // client should refetch balance
  });
}
```

**Step 2: Verify TypeScript**

```bash
cd /Users/rickdeaconx/hammershift-frontend && npx tsc --noEmit 2>&1 | head -20
```

**Step 3: Commit**

```bash
git add src/app/api/polygon-markets/\[marketId\]/redeem/route.ts
git commit -m "feat: add position redeem endpoint for manual settlement"
```

---

## Task 13: Add GET /api/cron/close-trading — mark tradingClosesAt markets as TRADING_CLOSED

**Files:**
- Create: `src/app/api/cron/close-trading/route.ts`

**Purpose:** Runs every 30 minutes. Finds ACTIVE markets whose `tradingClosesAt` has passed and sets `status: "TRADING_CLOSED"`. This prevents new trades while the auction is in its final 4 hours. The oracle cron then resolves `TRADING_CLOSED` markets after the auction ends.

**Why needed:** Without this cron, the trading window is only enforced at trade validation time. If a market doesn't get a validation call, it stays ACTIVE in the DB and appears tradeable to the UI.

**Step 1: Create the route file**

```typescript
/**
 * GET /api/cron/close-trading
 *
 * Closes the trading window for markets where tradingClosesAt has passed.
 * Run every 30 minutes via cron.
 *
 * Sets status from ACTIVE → TRADING_CLOSED.
 * Does NOT resolve markets — that is the oracle cron's job.
 *
 * Authorization: x-cron-secret header required.
 */

import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongoose";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

function isAuthorized(req: Request): boolean {
  const secret = req.headers.get("x-cron-secret");
  return !!secret && secret === process.env.CRON_SECRET;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDB();
  const db = mongoose.connection.db!;
  const now = new Date();

  // Find ACTIVE markets whose trading window has closed
  const result = await db.collection("polygon_markets").updateMany(
    {
      status: "ACTIVE",
      tradingClosesAt: { $lte: now },
    },
    {
      $set: {
        status: "TRADING_CLOSED",
        updatedAt: now,
      },
    }
  );

  return NextResponse.json({
    ok: true,
    marketsClosed: result.modifiedCount,
    checkedAt: now.toISOString(),
  });
}
```

**Step 2: Update oracleResolver.ts to also resolve TRADING_CLOSED markets**

The oracle resolver currently only looks for `status: "ACTIVE"`. TRADING_CLOSED markets also need to be resolved once their auction finalPrice is available. Update `resolveExpiredMarkets` in `src/lib/oracleResolver.ts`:

```typescript
// BEFORE:
const expiredMarkets = await db
  .collection("polygon_markets")
  .find({
    status: "ACTIVE",
    closesAt: { $lt: now },
    oracleStatus: { $ne: "FAILED" },
  })
  .toArray();
```

```typescript
// AFTER:
const expiredMarkets = await db
  .collection("polygon_markets")
  .find({
    status: { $in: ["ACTIVE", "TRADING_CLOSED"] },
    closesAt: { $lt: now },
    oracleStatus: { $ne: "FAILED" },
  })
  .toArray();
```

**Step 3: Update tradeValidator.ts to also reject TRADING_CLOSED markets**

In `validateTrade`, the status check already handles this:
```typescript
if (market.status !== "ACTIVE") {
  return {
    valid: false,
    reason: `Market is ${market.status.toLowerCase()} and no longer accepting trades.`,
  };
}
```

`TRADING_CLOSED` !== `"ACTIVE"` so this correctly rejects trades. No change needed.

**Step 4: Verify TypeScript**

```bash
cd /Users/rickdeaconx/hammershift-frontend && npx tsc --noEmit 2>&1 | head -20
```

**Step 5: Commit**

```bash
git add src/app/api/cron/close-trading/route.ts src/lib/oracleResolver.ts
git commit -m "feat: add close-trading cron to transition ACTIVE → TRADING_CLOSED at 4h before auction end"
```

---

## Task 14: Connect TradingDrawer to the real trade API

**Files:**
- Read first: `src/app/components/trading/TradingDrawer.tsx`
- Modify: `src/app/components/trading/TradingDrawer.tsx` (trade submission handler)

**Purpose:** The TradingDrawer currently submits trades to a legacy endpoint or shows a mock. This task wires it to `POST /api/polygon-markets/[marketId]/trade` and fetches a live quote from `GET /api/polygon-markets/[marketId]/quote` before trade submission.

**Step 1: Read TradingDrawer to understand current structure**

```bash
cat /Users/rickdeaconx/hammershift-frontend/src/app/components/trading/TradingDrawer.tsx
```

**Step 2: Add quote preview state**

In the TradingDrawer component, add state for the quote:

```typescript
const [quote, setQuote] = useState<{
  sharesReceived: number;
  pricePerShare: number;
  fee: number;
  newYesPrice: number;
  newNoPrice: number;
  slippagePct: number;
} | null>(null);
const [quoteLoading, setQuoteLoading] = useState(false);
```

**Step 3: Add fetchQuote function**

```typescript
const fetchQuote = useCallback(
  async (amount: number) => {
    if (!market?._id || amount <= 0) {
      setQuote(null);
      return;
    }
    setQuoteLoading(true);
    try {
      const res = await fetch(
        `/api/polygon-markets/${market._id}/quote?outcome=${selectedSide}&usdcAmount=${amount}&maxSlippage=0.05`
      );
      if (res.ok) {
        setQuote(await res.json());
      } else {
        setQuote(null);
      }
    } catch {
      setQuote(null);
    } finally {
      setQuoteLoading(false);
    }
  },
  [market?._id, selectedSide]
);
```

**Step 4: Trigger fetchQuote on amount change**

Add a `useEffect` that calls `fetchQuote` when the trade amount changes (debounced by 300ms):

```typescript
useEffect(() => {
  const t = setTimeout(() => fetchQuote(tradeAmount), 300);
  return () => clearTimeout(t);
}, [tradeAmount, fetchQuote]);
```

**Step 5: Update the submit handler to call the real trade API**

```typescript
async function handleSubmit() {
  if (!session?.user) {
    // Trigger login — user must be authenticated to trade
    // If using NextAuth: redirect to /api/auth/signin
    router.push("/api/auth/signin");
    return;
  }

  if (!market?._id) return;

  setSubmitting(true);
  setError(null);

  try {
    const res = await fetch(`/api/polygon-markets/${market._id}/trade`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        outcome: selectedSide,
        usdcAmount: tradeAmount,
        maxSlippage: 0.05,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message ?? "Trade failed. Please try again.");
      return;
    }

    // Trade succeeded
    setTradeReceipt(data);
    setView("receipt");
  } catch {
    setError("Network error — please check your connection and try again.");
  } finally {
    setSubmitting(false);
  }
}
```

**Step 6: Display quote in the UI**

Add a quote preview section that shows when quote is loaded:

```tsx
{quote && !quoteLoading && (
  <div className="rounded-lg bg-[#1A2233] p-3 text-xs space-y-1 font-mono">
    <div className="flex justify-between">
      <span className="text-gray-400">Shares</span>
      <span className="text-white">{quote.sharesReceived.toFixed(2)}</span>
    </div>
    <div className="flex justify-between">
      <span className="text-gray-400">Price per share</span>
      <span className="text-white">{(quote.pricePerShare * 100).toFixed(1)}¢</span>
    </div>
    <div className="flex justify-between">
      <span className="text-gray-400">Platform fee (2%)</span>
      <span className="text-[#E94560]">-${quote.fee.toFixed(2)}</span>
    </div>
    <div className="flex justify-between">
      <span className="text-gray-400">Slippage</span>
      <span className={quote.slippagePct > 0.02 ? "text-[#E94560]" : "text-[#00D4AA]"}>
        {(quote.slippagePct * 100).toFixed(2)}%
      </span>
    </div>
  </div>
)}
```

**Note:** The exact implementation depends on the current TradingDrawer structure. Read the file first (Step 1), then apply these patterns in a way that fits the existing component architecture. Do not rewrite the component — only add the quote fetching and update the submit handler.

**Step 7: Verify TypeScript**

```bash
cd /Users/rickdeaconx/hammershift-frontend && npx tsc --noEmit 2>&1 | head -20
```

**Step 8: Verify build**

```bash
cd /Users/rickdeaconx/hammershift-frontend && npm run build 2>&1 | tail -20
```

**Step 9: Commit**

```bash
git add src/app/components/trading/TradingDrawer.tsx
git commit -m "feat: connect TradingDrawer to real trade API with live AMM quote preview"
```

---

## Summary: Cron Schedule

After all tasks are complete, configure these crons in your deployment (AWS Amplify or Vercel `vercel.json`):

| Endpoint | Schedule | Purpose |
|----------|----------|---------|
| `/api/cron/create-markets` | Every 30 min | Create markets for new qualifying auctions |
| `/api/cron/close-trading` | Every 30 min | Close trading 4h before auction end |
| `/api/cron/resolve-markets` | Every 30 min | Oracle resolution after auction ends |
| `/api/cron/settle-markets` | Every hour | Pay winners of RESOLVED markets |

All require `x-cron-secret` header with `CRON_SECRET` env var value.

## Completion Checklist

- [ ] B-6: Auth guard fixed in resolve-markets
- [ ] B-5: ObjectId guard fixed in integrity-flags PATCH
- [ ] B-4: Lazy resolver DB writes removed from polygon-markets GET
- [ ] B-1: Position collection unified to polygon_positions
- [ ] B-2: Monetary units standardized to dollars throughout
- [ ] B-3: yesPool/noPool written at market creation (both paths)
- [ ] B-7: Pool state read inside transaction
- [ ] DB indexes created and verified
- [ ] Quote endpoint live
- [ ] Market positions endpoint live
- [ ] User positions endpoint live
- [ ] Redeem endpoint live
- [ ] Close-trading cron live
- [ ] TradingDrawer wired to real trade API
