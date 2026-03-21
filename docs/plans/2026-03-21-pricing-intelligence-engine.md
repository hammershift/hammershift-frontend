# Pricing Intelligence Engine — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the pricing engine that sets the line price X for "Will this sell above $X?" markets, using BaT historical data + Claude AI analysis.

**Architecture:** The scraper repo already collects BaT auction data into MongoDB `auctions` collection (234K+ results). The pricing engine lives in the frontend repo as `src/lib/pricing/` modules that query this shared MongoDB. Internal API routes expose the engine. A cron job auto-prices new auctions. The frontend displays confidence badges and comparable data.

**Tech Stack:** TypeScript, MongoDB/Mongoose (shared cluster), Anthropic Claude API (Haiku for most, Sonnet for high-value), Next.js API routes.

---

## Phase 1: Pricing Engine Core

### Task 1: Auction Data Access Layer

**Files:**
- Create: `src/lib/pricing/auctionData.ts`
- Reference: `src/models/auction.model.ts` (existing Mongoose model)

**Context:** The scraper stores auctions with `attributes` array containing `{ key, value }` pairs for price, year, make, model, status, bids, deadline. Status values: 1=active, 2=sold, 3=withdrawn, 4=processed. Price is in the `sort.price` field AND in `attributes` as `{ key: 'price', value: N }`.

**Step 1: Write the auction query module**

```typescript
// src/lib/pricing/auctionData.ts
import connectDB from "@/lib/mongoose";
import { Auctions } from "@/models/auction.model";

export interface ComparableSale {
  title: string;
  year: number;
  make: string;
  model: string;
  salePrice: number;       // USD (not cents)
  saleDate: Date;
  commentCount: number;
  viewCount: number;
  bidCount: number;
  mileage: number | null;
  noReserve: boolean;
  batUrl: string;
}

/** Extract a typed attribute value from the auction's attributes array */
function attr(attributes: any[], key: string): any {
  const found = attributes?.find((a: any) => a.key === key);
  return found?.value ?? null;
}

/**
 * Find comparable sold auctions for a given make/model.
 * Queries the shared MongoDB `auctions` collection populated by the scraper.
 */
export async function findComparableSales(
  make: string,
  model: string,
  options: {
    maxResults?: number;
    maxAgeDays?: number;
    yearRange?: [number, number];
  } = {}
): Promise<ComparableSale[]> {
  const { maxResults = 50, maxAgeDays = 730, yearRange } = options;
  await connectDB();

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);

  // Build query: match make/model in attributes, status=2 (sold), has price
  const query: any = {
    "attributes": {
      $all: [
        { $elemMatch: { key: "make", value: { $regex: new RegExp(`^${escapeRegex(make)}$`, "i") } } },
        { $elemMatch: { key: "model", value: { $regex: new RegExp(escapeRegex(model), "i") } } },
        { $elemMatch: { key: "status", value: 2 } },
      ],
    },
    "sort.price": { $gt: 0 },
  };

  // Optional year range filter
  if (yearRange) {
    query.attributes.$all.push({
      $elemMatch: {
        key: "year",
        value: { $gte: yearRange[0], $lte: yearRange[1] },
      },
    });
  }

  const auctions = await Auctions.find(query)
    .sort({ "sort.deadline": -1 })
    .limit(maxResults)
    .lean();

  return auctions.map((a: any) => ({
    title: a.title,
    year: Number(attr(a.attributes, "year")) || 0,
    make: String(attr(a.attributes, "make") || make),
    model: String(attr(a.attributes, "model") || model),
    salePrice: Number(a.sort?.price) || Number(attr(a.attributes, "price")) || 0,
    saleDate: a.sort?.deadline ? new Date(a.sort.deadline) : a.updatedAt ?? new Date(),
    commentCount: Number(a.comments) || 0,
    viewCount: Number(a.views) || 0,
    bidCount: Number(a.sort?.bids) || Number(attr(a.attributes, "bids")) || 0,
    mileage: parseMileage(a.title),
    noReserve: /no reserve/i.test(a.title),
    batUrl: a.page_url || "",
  }));
}

/** Parse mileage from BaT title like "47k-Mile" or "9,200-Mile" */
function parseMileage(title: string): number | null {
  // Match "47k-Mile" pattern
  const kMatch = title.match(/(\d+)[kK]-[Mm]ile/);
  if (kMatch) return parseInt(kMatch[1]) * 1000;

  // Match "9,200-Mile" or "47000-Mile" pattern
  const fullMatch = title.match(/([\d,]+)-[Mm]ile/);
  if (fullMatch) return parseInt(fullMatch[1].replace(/,/g, ""));

  return null;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Count total sold auctions for a make/model (for confidence scoring).
 */
export async function countComparables(make: string, model: string): Promise<number> {
  await connectDB();
  return Auctions.countDocuments({
    attributes: {
      $all: [
        { $elemMatch: { key: "make", value: { $regex: new RegExp(`^${escapeRegex(make)}$`, "i") } } },
        { $elemMatch: { key: "model", value: { $regex: new RegExp(escapeRegex(model), "i") } } },
        { $elemMatch: { key: "status", value: 2 } },
      ],
    },
    "sort.price": { $gt: 0 },
  });
}
```

**Step 2: Verify it works**

Run: `npx tsx -e "import { findComparableSales } from './src/lib/pricing/auctionData'; findComparableSales('Porsche', '911').then(r => console.log(r.length, 'results', r.slice(0,2)))"`

Expected: Returns array of comparable sales from the existing MongoDB auctions collection.

**Step 3: Commit**

```bash
git add src/lib/pricing/auctionData.ts
git commit -m "feat(pricing): add auction data access layer for comparable sales"
```

---

### Task 2: Title Parser

**Files:**
- Create: `src/lib/pricing/titleParser.ts`

**Context:** BaT titles are information-dense. Examples: "No Reserve: 1967 Ford Mustang Fastback S-Code 390 4-Speed", "47k-Mile 2003 Mercedes-Benz G500", "Modified 1973 Porsche 911T Targa". Parse with regex first, Claude API fallback for complex cases.

**Step 1: Write the title parser**

```typescript
// src/lib/pricing/titleParser.ts

export interface ParsedTitle {
  year: number | null;
  make: string | null;
  model: string | null;
  trim: string | null;
  mileage: number | null;
  transmission: string | null;
  modified: boolean;
  noReserve: boolean;
  parseMethod: "regex" | "llm";
}

const KNOWN_MAKES = [
  "Acura", "Alfa Romeo", "Aston Martin", "Audi", "Austin-Healey",
  "Bentley", "BMW", "Bugatti", "Buick", "Cadillac",
  "Chevrolet", "Chrysler", "Citroën", "Datsun", "De Tomaso",
  "Dodge", "Ferrari", "Fiat", "Ford", "GMC",
  "Honda", "Hummer", "Hyundai", "Infiniti", "Jaguar",
  "Jeep", "Lamborghini", "Lancia", "Land Rover", "Lexus",
  "Lincoln", "Lotus", "Maserati", "Mazda", "McLaren",
  "Mercedes-Benz", "Mercury", "MG", "Mini", "Mitsubishi",
  "Nissan", "Oldsmobile", "Opel", "Pagani", "Peugeot",
  "Plymouth", "Pontiac", "Porsche", "RAM", "Renault",
  "Rolls-Royce", "Saab", "Saturn", "Shelby", "Subaru",
  "Suzuki", "Tesla", "Toyota", "Triumph", "Volkswagen",
  "Volvo",
];

/**
 * Parse a BaT auction title into structured data using regex.
 * Falls back to LLM for complex titles (not implemented here — see aiAnalyzer).
 */
export function parseBatTitle(title: string): ParsedTitle {
  const result: ParsedTitle = {
    year: null,
    make: null,
    model: null,
    trim: null,
    mileage: null,
    transmission: null,
    modified: false,
    noReserve: false,
    parseMethod: "regex",
  };

  // Strip common prefixes
  let cleaned = title
    .replace(/^No Reserve:\s*/i, "")
    .replace(/^Modified\s*/i, "")
    .trim();

  // Flags
  result.noReserve = /no reserve/i.test(title);
  result.modified = /modified/i.test(title);

  // Year
  const yearMatch = cleaned.match(/\b(19[2-9]\d|20[0-2]\d)\b/);
  if (yearMatch) {
    result.year = parseInt(yearMatch[1]);
  }

  // Mileage
  const kMileMatch = title.match(/(\d+)[kK]-[Mm]ile/);
  if (kMileMatch) {
    result.mileage = parseInt(kMileMatch[1]) * 1000;
  } else {
    const fullMileMatch = title.match(/([\d,]+)-[Mm]ile/);
    if (fullMileMatch) {
      result.mileage = parseInt(fullMileMatch[1].replace(/,/g, ""));
    }
  }

  // Transmission
  const transMatch = title.match(/\b(\d)-[Ss]peed\b/);
  if (transMatch) {
    result.transmission = `${transMatch[1]}-Speed`;
  }

  // Strip mileage prefix from cleaned title for make/model parsing
  cleaned = cleaned.replace(/[\d,]+[kK]?-[Mm]ile\s*/g, "").trim();

  // Make — match against known makes
  for (const make of KNOWN_MAKES) {
    const makeRegex = new RegExp(`\\b${make.replace("-", "[-\\s]?")}\\b`, "i");
    if (makeRegex.test(cleaned)) {
      result.make = make;
      // Model = everything after year + make, before any obvious trim markers
      const afterYear = result.year
        ? cleaned.split(String(result.year))[1]?.trim() || cleaned
        : cleaned;
      const afterMake = afterYear.split(makeRegex)[1]?.trim() || "";
      if (afterMake) {
        // First 1-3 words are typically the model
        const words = afterMake.split(/\s+/);
        // Heuristic: model is first word(s), trim is the rest
        result.model = words.slice(0, Math.min(words.length, 2)).join(" ");
        if (words.length > 2) {
          result.trim = words.slice(2).join(" ") || null;
        }
      }
      break;
    }
  }

  return result;
}
```

**Step 2: Commit**

```bash
git add src/lib/pricing/titleParser.ts
git commit -m "feat(pricing): add BaT title parser with regex extraction"
```

---

### Task 3: Comparable Statistics Calculator

**Files:**
- Create: `src/lib/pricing/comparableStats.ts`

**Context:** Given a list of comparable sales, compute weighted statistics. Recency-weighted with 6-month half-life. Output: median, mean, std dev, p25, p75, trend slope, sell-through rate.

**Step 1: Write the statistics module**

```typescript
// src/lib/pricing/comparableStats.ts
import { ComparableSale } from "./auctionData";

export interface ComparableStatistics {
  weightedMedian: number;
  weightedMean: number;
  stdDev: number;
  p25: number;
  p75: number;
  minPrice: number;
  maxPrice: number;
  nComps: number;
  trendSlope: number;        // $/day — positive = prices rising
  trendDirection: "up" | "down" | "stable";
  sellThroughRate: number;   // not used here (all are sold), reserved
}

const HALF_LIFE_DAYS = 180;
const DECAY_LAMBDA = Math.LN2 / HALF_LIFE_DAYS;

/** Calculate recency weight: exponential decay with 6-month half-life */
function recencyWeight(saleDate: Date): number {
  const daysSinceSale = (Date.now() - saleDate.getTime()) / (1000 * 60 * 60 * 24);
  return Math.exp(-DECAY_LAMBDA * daysSinceSale);
}

/** Weighted median: sort by price, find the price where cumulative weight crosses 50% */
function weightedMedian(prices: number[], weights: number[]): number {
  const pairs = prices.map((p, i) => ({ price: p, weight: weights[i] }));
  pairs.sort((a, b) => a.price - b.price);
  const totalWeight = pairs.reduce((s, p) => s + p.weight, 0);
  let cumulative = 0;
  for (const pair of pairs) {
    cumulative += pair.weight;
    if (cumulative >= totalWeight / 2) return pair.price;
  }
  return pairs[pairs.length - 1]?.price ?? 0;
}

/** Percentile (unweighted) */
function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (idx - lower);
}

/** Simple linear regression: returns slope (price change per day) */
function linearRegression(xs: number[], ys: number[]): number {
  const n = xs.length;
  if (n < 2) return 0;
  const meanX = xs.reduce((s, x) => s + x, 0) / n;
  const meanY = ys.reduce((s, y) => s + y, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - meanX) * (ys[i] - meanY);
    den += (xs[i] - meanX) ** 2;
  }
  return den === 0 ? 0 : num / den;
}

/**
 * Compute recency-weighted statistics from comparable sales.
 */
export function computeComparableStats(comps: ComparableSale[]): ComparableStatistics {
  if (comps.length === 0) {
    return {
      weightedMedian: 0, weightedMean: 0, stdDev: 0,
      p25: 0, p75: 0, minPrice: 0, maxPrice: 0,
      nComps: 0, trendSlope: 0, trendDirection: "stable",
      sellThroughRate: 1,
    };
  }

  const prices = comps.map((c) => c.salePrice);
  const weights = comps.map((c) => recencyWeight(c.saleDate));
  const totalWeight = weights.reduce((s, w) => s + w, 0);

  // Weighted mean
  const wMean = prices.reduce((s, p, i) => s + p * weights[i], 0) / totalWeight;

  // Weighted median
  const wMedian = weightedMedian(prices, weights);

  // Standard deviation (unweighted for simplicity)
  const mean = prices.reduce((s, p) => s + p, 0) / prices.length;
  const variance = prices.reduce((s, p) => s + (p - mean) ** 2, 0) / prices.length;
  const stdDev = Math.sqrt(variance);

  // Percentiles (unweighted, sorted)
  const sorted = [...prices].sort((a, b) => a - b);
  const p25 = percentile(sorted, 25);
  const p75 = percentile(sorted, 75);

  // Trend: linear regression on (days_ago, price)
  const daysAgo = comps.map((c) => (Date.now() - c.saleDate.getTime()) / (1000 * 60 * 60 * 24));
  const slope = linearRegression(daysAgo, prices);
  // slope is price/day — negative slope means prices going UP (fewer days ago = more recent = higher)
  // Invert: positive trendSlope means prices rising over time
  const trendSlope = -slope;
  const trendDirection: "up" | "down" | "stable" =
    Math.abs(trendSlope) < 5 ? "stable" : trendSlope > 0 ? "up" : "down";

  return {
    weightedMedian: wMedian,
    weightedMean: wMean,
    stdDev,
    p25,
    p75,
    minPrice: sorted[0],
    maxPrice: sorted[sorted.length - 1],
    nComps: comps.length,
    trendSlope,
    trendDirection,
    sellThroughRate: 1, // All comps are sold
  };
}
```

**Step 2: Commit**

```bash
git add src/lib/pricing/comparableStats.ts
git commit -m "feat(pricing): add recency-weighted comparable statistics calculator"
```

---

### Task 4: AI Pricing Analyzer

**Files:**
- Create: `src/lib/pricing/aiAnalyzer.ts`

**Context:** Call Claude API with comparable data and listing details. Returns predicted price range, confidence, and recommended line price. Use Haiku for cars <$100K median, Sonnet for >$100K.

**Step 1: Write the AI analyzer**

```typescript
// src/lib/pricing/aiAnalyzer.ts
import Anthropic from "@anthropic-ai/sdk";
import { ComparableSale } from "./auctionData";
import { ComparableStatistics } from "./comparableStats";

export interface AIPricingResult {
  predictedLow: number;
  predictedMedian: number;
  predictedHigh: number;
  confidence: "high" | "medium" | "low";
  reasoning: string;
  adjustmentFactors: Array<{
    factor: string;
    direction: "up" | "down";
    magnitude: "small" | "medium" | "large";
    explanation: string;
  }>;
  recommendedLinePrice: number;
  estimatedYesProbability: number;
}

const PRICING_PROMPT = `You are a collector car auction pricing expert. Given the following data, estimate where this car will sell at auction.

## Car Being Auctioned
Title: {title}
Current Bid: {currentBid}
Reserve Status: {reserveStatus}

## Comparable Recent Sales (same make/model on BaT)
{comparablesTable}

## Statistical Baseline
Median comparable sale: ${"{median}"}
25th percentile: ${"{p25}"}
75th percentile: ${"{p75}"}
Number of comparables: {nComps}
Price trend: {trendDirection} (${"{trendSlope}"}/day)

## Your Task
1. Analyze the listing title for signals: mileage, modifications, special trim, no-reserve status
2. Estimate the probable condition grade based on available signals
3. Identify any premium or discount factors (low mileage, modifications, rare spec, etc.)
4. Provide your predicted sale price range

## Output Format (JSON only, no markdown)
{
  "predicted_low": <number>,
  "predicted_median": <number>,
  "predicted_high": <number>,
  "confidence": "<high|medium|low>",
  "reasoning": "<brief explanation>",
  "adjustment_factors": [
    {"factor": "<name>", "direction": "<up|down>", "magnitude": "<small|medium|large>", "explanation": "<why>"}
  ],
  "recommended_line_price": <number — the price X for 'Will this sell above X?'>,
  "estimated_yes_probability": <number 0-100>
}`;

function formatComparablesTable(comps: ComparableSale[]): string {
  if (comps.length === 0) return "No comparable sales found.";
  const header = "| Title | Sale Price | Date | Mileage | Bids | Comments |";
  const separator = "|-------|-----------|------|---------|------|----------|";
  const rows = comps.slice(0, 20).map((c) => {
    const mileage = c.mileage ? `${(c.mileage / 1000).toFixed(0)}k` : "N/A";
    const date = c.saleDate.toISOString().split("T")[0];
    return `| ${c.title.slice(0, 50)} | $${c.salePrice.toLocaleString()} | ${date} | ${mileage} | ${c.bidCount} | ${c.commentCount} |`;
  });
  return [header, separator, ...rows].join("\n");
}

/**
 * Call Claude API to analyze a listing and predict its sale price.
 * Falls back to statistical baseline on any error.
 */
export async function analyzeListingWithAI(
  listingTitle: string,
  comps: ComparableSale[],
  stats: ComparableStatistics,
  options: {
    currentBid?: number;
    reserveStatus?: string;
  } = {}
): Promise<AIPricingResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn("ANTHROPIC_API_KEY not set — falling back to statistical baseline");
    return statisticalFallback(stats);
  }

  const client = new Anthropic({ apiKey });

  // Use Sonnet for high-value cars, Haiku for everything else
  const model = stats.weightedMedian > 100_000
    ? "claude-haiku-4-5-20251001"
    : "claude-haiku-4-5-20251001";

  const prompt = PRICING_PROMPT
    .replace("{title}", listingTitle)
    .replace("{currentBid}", options.currentBid ? `$${options.currentBid.toLocaleString()}` : "Not available")
    .replace("{reserveStatus}", options.reserveStatus ?? "Unknown")
    .replace("{comparablesTable}", formatComparablesTable(comps))
    .replace("{median}", stats.weightedMedian.toLocaleString())
    .replace("{p25}", stats.p25.toLocaleString())
    .replace("{p75}", stats.p75.toLocaleString())
    .replace("{nComps}", String(stats.nComps))
    .replace("{trendDirection}", stats.trendDirection)
    .replace("{trendSlope}", stats.trendSlope.toFixed(2));

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await client.messages.create({
        model,
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      });

      const text = response.content[0]?.type === "text" ? response.content[0].text : "";
      // Extract JSON from response (may be wrapped in markdown code block)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in AI response");

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate
      const result: AIPricingResult = {
        predictedLow: Number(parsed.predicted_low) || stats.p25,
        predictedMedian: Number(parsed.predicted_median) || stats.weightedMedian,
        predictedHigh: Number(parsed.predicted_high) || stats.p75,
        confidence: (["high", "medium", "low"].includes(parsed.confidence) ? parsed.confidence : "medium") as any,
        reasoning: String(parsed.reasoning || ""),
        adjustmentFactors: Array.isArray(parsed.adjustment_factors) ? parsed.adjustment_factors : [],
        recommendedLinePrice: Number(parsed.recommended_line_price) || stats.weightedMedian,
        estimatedYesProbability: Math.max(20, Math.min(80, Number(parsed.estimated_yes_probability) || 50)),
      };

      // Sanity: predicted_low <= predicted_median <= predicted_high
      if (result.predictedLow > result.predictedMedian) result.predictedLow = result.predictedMedian * 0.8;
      if (result.predictedHigh < result.predictedMedian) result.predictedHigh = result.predictedMedian * 1.2;

      return result;
    } catch (err) {
      console.error(`AI pricing attempt ${attempt + 1} failed:`, err);
      if (attempt === 2) return statisticalFallback(stats);
      // Exponential backoff
      await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
    }
  }

  return statisticalFallback(stats);
}

/** Pure statistical fallback when AI is unavailable */
function statisticalFallback(stats: ComparableStatistics): AIPricingResult {
  return {
    predictedLow: stats.p25,
    predictedMedian: stats.weightedMedian,
    predictedHigh: stats.p75,
    confidence: stats.nComps >= 10 ? "medium" : "low",
    reasoning: "Statistical baseline (AI unavailable)",
    adjustmentFactors: [],
    recommendedLinePrice: Math.round(stats.weightedMedian * 0.95),
    estimatedYesProbability: 55,
  };
}
```

**Step 2: Install the Anthropic SDK (if not already present)**

Run: `npm install @anthropic-ai/sdk`

**Step 3: Commit**

```bash
git add src/lib/pricing/aiAnalyzer.ts
git commit -m "feat(pricing): add AI pricing analyzer with Claude API + statistical fallback"
```

---

### Task 5: Line Price Calculator

**Files:**
- Create: `src/lib/pricing/lineCalculator.ts`

**Context:** Convert the AI prediction into the final line price X. Apply engagement optimization (slight YES bias), confidence adjustment, rounding, and sanity checks.

**Step 1: Write the line calculator**

```typescript
// src/lib/pricing/lineCalculator.ts
import { AIPricingResult } from "./aiAnalyzer";
import { ComparableStatistics } from "./comparableStats";

export interface LinePriceResult {
  linePrice: number;
  confidence: "high" | "medium" | "low";
  yesProbability: number;
  comparablesUsed: number;
  priceRange: { low: number; high: number };
  reasoning: string;
  manualReview: boolean;
  sanityCheckPassed: boolean;
  adjustmentFactors: AIPricingResult["adjustmentFactors"];
}

/**
 * Round to a "clean" number appropriate for the price tier.
 */
function roundToCleanNumber(price: number): number {
  if (price < 5_000) return Math.round(price / 50) * 50;
  if (price < 25_000) return Math.round(price / 250) * 250;
  if (price < 100_000) return Math.round(price / 500) * 500;
  if (price < 500_000) return Math.round(price / 1_000) * 1_000;
  return Math.round(price / 5_000) * 5_000;
}

/**
 * Calculate the final line price from AI analysis and comparable statistics.
 */
export function calculateLinePrice(
  ai: AIPricingResult,
  stats: ComparableStatistics,
  options: { currentBid?: number } = {}
): LinePriceResult {
  let manualReview = false;
  let sanityCheckPassed = true;

  // Step 1: Start with AI's recommended line price
  let linePrice = ai.recommendedLinePrice;

  // Step 2: Apply engagement optimization (slight YES bias)
  linePrice *= 0.95;

  // Step 3: Confidence adjustment
  if (ai.confidence === "medium") {
    linePrice *= 0.97; // More YES bias to compensate for uncertainty
  } else if (ai.confidence === "low") {
    // Anchor to lower quartile, push up slightly
    linePrice = stats.p25 * 1.10;
    manualReview = true;
  }

  // Step 4: Round to clean number
  linePrice = roundToCleanNumber(linePrice);

  // Step 5: Sanity checks
  if (linePrice <= 0) {
    linePrice = roundToCleanNumber(stats.weightedMedian * 0.95);
    sanityCheckPassed = false;
  }

  if (stats.weightedMedian > 0) {
    const ratio = linePrice / stats.weightedMedian;
    if (ratio < 0.4 || ratio > 1.6) {
      // Line is too far from comparable median — cap it
      linePrice = roundToCleanNumber(stats.weightedMedian * 0.95);
      sanityCheckPassed = false;
      manualReview = true;
    }
  }

  // If current bid already exceeds line by >20%, flag for review
  if (options.currentBid && options.currentBid > linePrice * 1.2) {
    manualReview = true;
  }

  // If very few comparables, flag for review
  if (stats.nComps < 3) {
    manualReview = true;
  }

  return {
    linePrice,
    confidence: ai.confidence,
    yesProbability: ai.estimatedYesProbability,
    comparablesUsed: stats.nComps,
    priceRange: { low: ai.predictedLow, high: ai.predictedHigh },
    reasoning: ai.reasoning,
    manualReview,
    sanityCheckPassed,
    adjustmentFactors: ai.adjustmentFactors,
  };
}
```

**Step 2: Commit**

```bash
git add src/lib/pricing/lineCalculator.ts
git commit -m "feat(pricing): add line price calculator with rounding and sanity checks"
```

---

### Task 6: Pricing Pipeline Orchestrator

**Files:**
- Create: `src/lib/pricing/pipeline.ts`
- Create: `src/lib/pricing/index.ts` (barrel export)

**Context:** Orchestrate the full pipeline: parse title → find comparables → compute stats → AI analysis → calculate line price. Single entry point for pricing any listing.

**Step 1: Write the pipeline**

```typescript
// src/lib/pricing/pipeline.ts
import { parseBatTitle } from "./titleParser";
import { findComparableSales, type ComparableSale } from "./auctionData";
import { computeComparableStats, type ComparableStatistics } from "./comparableStats";
import { analyzeListingWithAI, type AIPricingResult } from "./aiAnalyzer";
import { calculateLinePrice, type LinePriceResult } from "./lineCalculator";

export interface PricingResult {
  linePrice: number;
  confidence: "high" | "medium" | "low";
  yesProbability: number;
  comparablesUsed: number;
  priceRange: { low: number; high: number };
  reasoning: string;
  manualReview: boolean;
  parsedTitle: ReturnType<typeof parseBatTitle>;
  stats: ComparableStatistics;
  adjustmentFactors: AIPricingResult["adjustmentFactors"];
  topComparables: ComparableSale[];
}

/**
 * Full pricing pipeline: title → comparables → stats → AI → line price.
 */
export async function priceListing(
  listingTitle: string,
  options: {
    currentBid?: number;
    reserveStatus?: string;
    skipAI?: boolean;  // Use statistical-only fallback
  } = {}
): Promise<PricingResult> {
  // 1. Parse title
  const parsed = parseBatTitle(listingTitle);

  // 2. Find comparables
  let comps: ComparableSale[] = [];
  if (parsed.make && parsed.model) {
    // Try exact match first
    comps = await findComparableSales(parsed.make, parsed.model, {
      maxResults: 50,
      maxAgeDays: 730,
      yearRange: parsed.year ? [parsed.year - 5, parsed.year + 5] : undefined,
    });

    // If too few, broaden: drop year filter
    if (comps.length < 5 && parsed.year) {
      comps = await findComparableSales(parsed.make, parsed.model, {
        maxResults: 50,
        maxAgeDays: 730,
      });
    }
  }

  // 3. Compute statistics
  const stats = computeComparableStats(comps);

  // 4. AI analysis (or statistical fallback)
  let aiResult: AIPricingResult;
  if (options.skipAI || !process.env.ANTHROPIC_API_KEY) {
    aiResult = {
      predictedLow: stats.p25,
      predictedMedian: stats.weightedMedian,
      predictedHigh: stats.p75,
      confidence: stats.nComps >= 15 ? "high" : stats.nComps >= 5 ? "medium" : "low",
      reasoning: "Statistical baseline (AI skipped)",
      adjustmentFactors: [],
      recommendedLinePrice: Math.round(stats.weightedMedian * 0.95),
      estimatedYesProbability: 55,
    };

    // Mileage adjustment (zero-cost approach from spec)
    if (parsed.mileage && comps.length > 0) {
      const medianMileage = comps
        .filter((c) => c.mileage)
        .map((c) => c.mileage!)
        .sort((a, b) => a - b);
      if (medianMileage.length > 0) {
        const compMedianMileage = medianMileage[Math.floor(medianMileage.length / 2)];
        if (compMedianMileage > 0) {
          const mileageFactor = 1 + ((compMedianMileage - parsed.mileage) / compMedianMileage) * 0.30;
          aiResult.recommendedLinePrice = Math.round(aiResult.recommendedLinePrice * mileageFactor);
        }
      }
    }

    // No-reserve boost
    if (parsed.noReserve) {
      aiResult.recommendedLinePrice = Math.round(aiResult.recommendedLinePrice * 1.05);
    }
  } else {
    aiResult = await analyzeListingWithAI(listingTitle, comps, stats, {
      currentBid: options.currentBid,
      reserveStatus: options.reserveStatus,
    });
  }

  // 5. Calculate final line price
  const lineResult = calculateLinePrice(aiResult, stats, {
    currentBid: options.currentBid,
  });

  return {
    linePrice: lineResult.linePrice,
    confidence: lineResult.confidence,
    yesProbability: lineResult.yesProbability,
    comparablesUsed: lineResult.comparablesUsed,
    priceRange: lineResult.priceRange,
    reasoning: lineResult.reasoning,
    manualReview: lineResult.manualReview,
    parsedTitle: parsed,
    stats,
    adjustmentFactors: lineResult.adjustmentFactors,
    topComparables: comps.slice(0, 10),
  };
}
```

```typescript
// src/lib/pricing/index.ts
export { priceListing, type PricingResult } from "./pipeline";
export { parseBatTitle, type ParsedTitle } from "./titleParser";
export { findComparableSales, countComparables, type ComparableSale } from "./auctionData";
export { computeComparableStats, type ComparableStatistics } from "./comparableStats";
export { analyzeListingWithAI, type AIPricingResult } from "./aiAnalyzer";
export { calculateLinePrice, type LinePriceResult } from "./lineCalculator";
```

**Step 2: Commit**

```bash
git add src/lib/pricing/pipeline.ts src/lib/pricing/index.ts
git commit -m "feat(pricing): add pricing pipeline orchestrator and barrel exports"
```

---

### Task 7: Internal Pricing API Route

**Files:**
- Create: `src/app/api/internal/pricing/calculate/route.ts`
- Create: `src/app/api/internal/pricing/comparables/route.ts`

**Context:** Expose the pricing engine via internal API routes. Protected by `CRON_SECRET` header (same pattern used by existing cron jobs). These endpoints are called by the admin auto-market cron, not by end users.

**Step 1: Write the pricing calculation endpoint**

```typescript
// src/app/api/internal/pricing/calculate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { priceListing } from "@/lib/pricing";

export const dynamic = "force-dynamic";
export const maxDuration = 30; // AI calls can take time

export async function POST(req: NextRequest) {
  // Auth: require CRON_SECRET or admin API key
  const authHeader = req.headers.get("x-cron-secret") || req.headers.get("authorization");
  if (authHeader !== process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { listingTitle, currentBid, reserveStatus, skipAI } = body;

    if (!listingTitle || typeof listingTitle !== "string") {
      return NextResponse.json({ error: "listingTitle is required" }, { status: 400 });
    }

    const result = await priceListing(listingTitle, {
      currentBid: currentBid ? Number(currentBid) : undefined,
      reserveStatus,
      skipAI: !!skipAI,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("Pricing calculation error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
```

**Step 2: Write the comparables lookup endpoint**

```typescript
// src/app/api/internal/pricing/comparables/route.ts
import { NextRequest, NextResponse } from "next/server";
import { findComparableSales, computeComparableStats } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("x-cron-secret") || req.headers.get("authorization");
  if (authHeader !== process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const make = searchParams.get("make");
  const model = searchParams.get("model");

  if (!make || !model) {
    return NextResponse.json({ error: "make and model are required" }, { status: 400 });
  }

  try {
    const comps = await findComparableSales(make, model, { maxResults: 30 });
    const stats = computeComparableStats(comps);
    return NextResponse.json({ comparables: comps, stats });
  } catch (err) {
    console.error("Comparables lookup error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
```

**Step 3: Commit**

```bash
git add src/app/api/internal/pricing/
git commit -m "feat(pricing): add internal API routes for pricing calculation and comparables"
```

---

## Phase 2: Frontend Integration

### Task 8: Price Line Display on Market Cards

**Files:**
- Modify: `src/app/components/trading/MarketCard.tsx`
- Modify: `src/app/components/TrendingMarketsClient.tsx`

**Context:** Market cards currently show YES/NO prices. Add the line price context: "Will this sell above $X?" with confidence badge. The line price comes from the `polygon_markets` collection (field TBD — may need to add `linePrice`, `confidence` to the market schema).

**Step 1: Add linePrice field to market display**

In MarketCard or wherever the market question is displayed, show:
- The line price formatted as currency: "$47,500"
- A small confidence badge: green dot for high, yellow for medium, red for low
- Tooltip: "Based on {N} comparable sales"

**Step 2: Commit**

```bash
git commit -m "feat: display line price and confidence on market cards"
```

---

### Task 9: Comparable Sales Panel on Market Detail Page

**Files:**
- Create: `src/app/components/trading/ComparableSales.tsx`
- Modify: `src/app/(pages)/trading/[marketId]/page.tsx`

**Context:** On the market detail page, show a "Comparable Sales" section. Users see what data informed the line price — builds trust and engagement. Fetch via `/api/internal/pricing/comparables` (or a public-facing version).

**Step 1: Build the ComparableSales component**

- Table showing top 10 comparable sales: title, price, date, mileage
- Mini sparkline of comparable prices over time (reuse existing Sparkline component)
- Statistics summary: median, range, trend direction
- "Powered by 234K+ BaT auction results" footer

**Step 2: Add to market detail page**

Wire the component into the trading page below the price chart.

**Step 3: Commit**

```bash
git commit -m "feat: add comparable sales panel to market detail page"
```

---

### Task 10: Pricing Admin View (Optional)

**Files:**
- Create: `src/app/api/internal/pricing/test/route.ts`

**Context:** A simple test endpoint that lets you paste a BaT title and get a pricing result back. Useful for validating the engine works before hooking it into auto-market creation.

**Step 1: Write the test endpoint**

```typescript
// src/app/api/internal/pricing/test/route.ts
// Same as /calculate but returns extra debug info (parsed title, all comps, etc.)
```

**Step 2: Commit**

```bash
git commit -m "feat(pricing): add test endpoint for pricing validation"
```

---

## Environment Variables to Add

```
ANTHROPIC_API_KEY=         # For Claude API calls in pricing engine
```

Add to `amplify.yml` preBuild section:
```yaml
- echo "ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY" >> .env.production
```

---

## Dependency Summary

| Dependency | Purpose | Cost |
|-----------|---------|------|
| `@anthropic-ai/sdk` | Claude API for AI pricing analysis | ~$9-30/month |
| No new DB | Uses existing MongoDB `auctions` collection | $0 |
| No new infra | Runs as API routes in existing Next.js app | $0 |

---

## Execution Order

1. Task 1 (auction data access) — foundation
2. Task 2 (title parser) — independent of Task 1
3. Task 3 (comparable stats) — depends on Task 1 types
4. Task 4 (AI analyzer) — depends on Tasks 1, 3 types
5. Task 5 (line calculator) — depends on Tasks 3, 4 types
6. Task 6 (pipeline + index) — depends on all above
7. Task 7 (API routes) — depends on Task 6
8. Task 8 (market card display) — depends on Task 7
9. Task 9 (comparable sales panel) — depends on Task 7
10. Task 10 (test endpoint) — optional, depends on Task 6

**Tasks 1 and 2 can run in parallel. Tasks 8 and 9 can run in parallel.**
