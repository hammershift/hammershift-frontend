# Market Factory Pipeline Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Auto-create `polygon_markets` documents for qualifying collector cars found by the scraper, every 15 minutes, with no human intervention.

**Architecture:** A Next.js API route (`/api/cron/create-markets`) queries the `auctions` MongoDB collection for qualifying cars (by make), checks for existing markets, and creates new ones. It is triggered on a schedule via `amplify.yml` or a lightweight cron. A second route (`/api/cron/resolve-markets`) closes markets when auctions finish.

**Tech Stack:** Next.js 14 App Router, MongoDB (raw `mongoose.connection.db`), TypeScript. No new npm packages required.

---

### Task 1: Create the Market Factory cron route

**Files:**
- Create: `src/app/api/cron/create-markets/route.ts`

**Step 1: Create the file with qualifying makes filter and GET handler**

```typescript
// src/app/api/cron/create-markets/route.ts
import { NextResponse } from 'next/server';
import connectToDB from '@/lib/mongoose';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

const QUALIFYING_MAKES = [
  'ferrari', 'lamborghini', 'corvette', 'mercedes', 'bmw',
  'maserati', 'alfa romeo', 'mustang', 'porsche', 'camaro',
];

// Simple secret to prevent public triggering. Set CRON_SECRET in Amplify env vars.
function isAuthorized(req: Request): boolean {
  const secret = req.headers.get('x-cron-secret');
  return secret === process.env.CRON_SECRET;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectToDB();
  const db = mongoose.connection.db!;

  const now = new Date();

  // 1. Find qualifying live auctions
  const qualifyingAuctions = await db.collection('auctions').find({
    isActive: true,
    'sort.deadline': { $gt: now },
    $or: QUALIFYING_MAKES.map((make) => ({
      title: { $regex: make, $options: 'i' },
    })),
  }).project({
    _id: 1,
    auction_id: 1,
    title: 1,
    image: 1,
    'sort.price': 1,
    'sort.deadline': 1,
  }).toArray();

  let created = 0;
  let skipped = 0;

  for (const auction of qualifyingAuctions) {
    const auctionId = auction.auction_id ?? auction._id.toString();

    // 2. Check if market already exists (idempotent)
    const existing = await db.collection('polygon_markets').findOne({ auctionId });
    if (existing) {
      skipped++;
      continue;
    }

    const predictedPrice = auction.sort?.price ?? 0;

    // 3. Create the market
    await db.collection('polygon_markets').insertOne({
      auctionId,
      question: `Will this sell above $${predictedPrice.toLocaleString()}?`,
      status: 'ACTIVE',
      yesPrice: 0.5,
      noPrice: 0.5,
      totalVolume: 0,
      totalLiquidity: 0,
      predictedPrice,
      winningOutcome: null,
      resolvedAt: null,
      closesAt: auction.sort?.deadline ?? null,
      imageUrl: auction.image ?? null,
      title: auction.title ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    created++;
  }

  return NextResponse.json({ ok: true, created, skipped, total: qualifyingAuctions.length });
}
```

**Step 2: Verify the route responds (manual curl test)**

```bash
# From frontend root, start dev server then:
curl -H "x-cron-secret: dev-secret" http://localhost:3000/api/cron/create-markets
# Expected: { "ok": true, "created": N, "skipped": M, "total": N+M }
```

**Step 3: Commit**

```bash
git add src/app/api/cron/create-markets/route.ts
git commit -m "feat: market factory cron — auto-create polygon_markets for qualifying cars"
```

---

### Task 2: Create the market resolver cron route

When an auction closes, resolve the corresponding market based on whether the final price was above or below `predictedPrice`.

**Files:**
- Create: `src/app/api/cron/resolve-markets/route.ts`

**Step 1: Create the resolver**

```typescript
// src/app/api/cron/resolve-markets/route.ts
import { NextResponse } from 'next/server';
import connectToDB from '@/lib/mongoose';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

function isAuthorized(req: Request): boolean {
  const secret = req.headers.get('x-cron-secret');
  return secret === process.env.CRON_SECRET;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectToDB();
  const db = mongoose.connection.db!;

  const now = new Date();

  // Find ACTIVE markets whose closesAt has passed
  const expiredMarkets = await db.collection('polygon_markets').find({
    status: 'ACTIVE',
    closesAt: { $lt: now },
  }).toArray();

  let resolved = 0;

  for (const market of expiredMarkets) {
    // Find the corresponding auction
    const auction = await db.collection('auctions').findOne({
      $or: [
        { auction_id: market.auctionId },
        { _id: (() => { try { return new mongoose.Types.ObjectId(market.auctionId); } catch { return null; } })() },
      ].filter(Boolean),
    });

    if (!auction) continue;

    const finalPrice = auction.sort?.price ?? 0;
    const winningOutcome = finalPrice > market.predictedPrice ? 'YES' : 'NO';

    await db.collection('polygon_markets').updateOne(
      { _id: market._id },
      {
        $set: {
          status: 'RESOLVED',
          winningOutcome,
          resolvedAt: now,
          updatedAt: now,
        },
      }
    );

    resolved++;
  }

  return NextResponse.json({ ok: true, resolved });
}
```

**Step 2: Commit**

```bash
git add src/app/api/cron/resolve-markets/route.ts
git commit -m "feat: market resolver cron — auto-resolve markets when auctions close"
```

---

### Task 3: Wire cron calls into amplify.yml preBuild

Markets need to be created/resolved on every deploy and then on a schedule. Add the cron trigger to `amplify.yml`.

**Files:**
- Modify: `amplify.yml`

**Step 1: Add CRON_SECRET to the env vars echo block and note in comments**

In `amplify.yml`, add to the preBuild echo block:
```yaml
- echo "CRON_SECRET=$CRON_SECRET" >> .env.production
```

**Step 2: Add a postBuild warm-up call**

```yaml
  postBuild:
    commands:
      - 'curl -s -H "x-cron-secret: $CRON_SECRET" "$NEXTAUTH_URL/api/cron/create-markets" || true'
      - 'curl -s -H "x-cron-secret: $CRON_SECRET" "$NEXTAUTH_URL/api/cron/resolve-markets" || true'
```

**Step 3: Add `CRON_SECRET` to Amplify environment variables in the AWS Console**

Set `CRON_SECRET` to any long random string (e.g. `openssl rand -hex 32`).

**Step 4: Commit**

```bash
git add amplify.yml
git commit -m "feat: wire market factory + resolver cron calls into Amplify postBuild"
```

---

### Task 4: Expose a `/api/markets/trending` endpoint for the homepage

The homepage Server Component needs the top 4 trending markets without modifying the existing `/api/polygon-markets` route.

**Files:**
- Create: `src/app/api/markets/trending/route.ts`

**Step 1: Create the endpoint**

```typescript
// src/app/api/markets/trending/route.ts
import { NextResponse } from 'next/server';
import connectToDB from '@/lib/mongoose';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET() {
  await connectToDB();
  const db = mongoose.connection.db!;

  const markets = await db.collection('polygon_markets')
    .find({ status: 'ACTIVE' })
    .sort({ totalVolume: -1 })
    .limit(4)
    .toArray();

  if (markets.length === 0) {
    return NextResponse.json([]);
  }

  // Enrich with auction image + title
  const auctionIds = markets.map((m) => m.auctionId).filter(Boolean);
  const auctionDocs = await db.collection('auctions').find({
    $or: [
      { auction_id: { $in: auctionIds } },
    ],
  }).project({ title: 1, image: 1, sort: 1, auction_id: 1 }).toArray();

  const auctionMap = new Map(auctionDocs.map((a) => [a.auction_id, a]));

  const enriched = markets.map((m) => {
    const auction = auctionMap.get(m.auctionId);
    return {
      _id: m._id.toString(),
      auctionId: m.auctionId,
      question: m.question,
      status: m.status,
      yesPrice: m.yesPrice ?? 0.5,
      noPrice: m.noPrice ?? 0.5,
      totalVolume: m.totalVolume ?? 0,
      predictedPrice: m.predictedPrice ?? 0,
      closesAt: m.closesAt ?? null,
      auction: {
        title: auction?.title ?? m.title ?? null,
        image: auction?.image ?? m.imageUrl ?? null,
        deadline: auction?.sort?.deadline ?? m.closesAt ?? null,
      },
    };
  });

  return NextResponse.json(enriched);
}
```

**Step 2: Verify endpoint returns data**

```bash
curl http://localhost:3000/api/markets/trending
# Expected: JSON array of up to 4 market objects
```

**Step 3: Commit**

```bash
git add src/app/api/markets/trending/route.ts
git commit -m "feat: /api/markets/trending — top 4 active markets by volume for homepage"
```
