/**
 * Pricing Engine — server-side comparable-based price prediction.
 *
 * Replicates the scraper repo's pricing pipeline for use in market creation.
 * Uses statistical fallback only (no AI calls) for speed.
 */
import mongoose from "mongoose";

// ---------- Title Parser ----------

const KNOWN_MAKES = [
  "Aston Martin", "Alfa Romeo", "Mercedes-Benz", "Land Rover", "Rolls-Royce",
  "De Tomaso", "Austin-Healey", "Acura", "Audi", "Bentley", "BMW", "Bugatti",
  "Buick", "Cadillac", "Chevrolet", "Chrysler", "Datsun", "DeLorean", "Dodge",
  "Eagle", "Ferrari", "Fiat", "Ford", "Genesis", "GMC", "Honda", "Hummer",
  "Hyundai", "Infiniti", "Isuzu", "Jaguar", "Jeep", "Kia", "Lamborghini",
  "Lancia", "Lexus", "Lincoln", "Lotus", "Maserati", "Mazda", "McLaren",
  "Mercury", "Mini", "Mitsubishi", "Nissan", "Oldsmobile", "Opel", "Pagani",
  "Peugeot", "Plymouth", "Pontiac", "Porsche", "Ram", "Renault", "Saab",
  "Saturn", "Scion", "Shelby", "Subaru", "Suzuki", "Tesla", "Toyota",
  "Triumph", "Volkswagen", "Volvo",
];

const makesByLength = [...KNOWN_MAKES].sort((a, b) => b.length - a.length);
const makesPattern = new RegExp(
  `\\b(${makesByLength.map((m) => m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`,
  "i"
);

interface ParsedTitle {
  year: number | null;
  make: string | null;
  model: string | null;
  mileage: number | null;
  noReserve: boolean;
}

function parseBatTitle(title: string): ParsedTitle {
  if (!title) return { year: null, make: null, model: null, mileage: null, noReserve: false };

  const yearMatch = title.match(/\b(19[2-9]\d|20[0-2]\d)\b/);
  const year = yearMatch ? parseInt(yearMatch[1], 10) : null;

  let mileage: number | null = null;
  const kMileMatch = title.match(/(\d+)[kK]-[Mm]ile/);
  if (kMileMatch) {
    mileage = parseInt(kMileMatch[1], 10) * 1000;
  } else {
    const numMileMatch = title.match(/([\d,]+)-[Mm]ile/);
    if (numMileMatch) mileage = parseInt(numMileMatch[1].replace(/,/g, ""), 10);
  }

  const noReserve = /no reserve/i.test(title);
  const makeMatch = title.match(makesPattern);
  const make = makeMatch ? makeMatch[1] : null;

  let model: string | null = null;
  if (year != null && make) {
    const ymRegex = new RegExp(
      `${year}\\s+${make.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s+`, "i"
    );
    const ymMatch = title.match(ymRegex);
    if (ymMatch) {
      const after = title.slice(ymMatch.index! + ymMatch[0].length)
        .replace(/\bno reserve\b:?\s*/gi, "")
        .replace(/\b\d+[kK]-[Mm]ile\b/g, "")
        .replace(/\b[\d,]+-[Mm]ile\b/g, "")
        .replace(/\b\d-[Ss]peed\b/g, "")
        .replace(/\bmodified\b/gi, "")
        .trim();
      if (after) model = after.split(/\s+/)[0] || null;
    }
  }

  return { year, make, model, mileage, noReserve };
}

// ---------- Comparable Sales Query ----------

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

interface Comparable {
  salePrice: number;
  saleDate: Date | null;
  mileage: number | null;
  title: string;
}

async function findComparableSales(
  db: mongoose.mongo.Db,
  make: string,
  model: string,
  yearRange?: [number, number]
): Promise<Comparable[]> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 730); // 2 years

  const makeRegex = new RegExp(`^${escapeRegex(make)}$`, "i");
  const modelRegex = new RegExp(escapeRegex(model), "i");

  const query: Record<string, any> = {
    attributes: {
      $all: [
        { $elemMatch: { key: "make", value: makeRegex } },
        { $elemMatch: { key: "model", value: modelRegex } },
      ],
    },
    "sort.price": { $gt: 0 },
    "sort.deadline": { $gte: cutoff },
  };

  if (yearRange) {
    query.attributes.$all.push({
      $elemMatch: {
        key: "year",
        value: { $gte: String(yearRange[0]), $lte: String(yearRange[1]) },
      },
    });
  }

  const docs = await db.collection("auctions")
    .find(query)
    .sort({ "sort.deadline": -1 })
    .limit(50)
    .project({ title: 1, "sort.price": 1, "sort.deadline": 1 })
    .toArray();

  return docs.map((d) => {
    const titleStr = d.title || "";
    let mileage: number | null = null;
    const kM = titleStr.match(/(\d+)[kK]-[Mm]ile/);
    if (kM) mileage = parseInt(kM[1], 10) * 1000;
    else {
      const nM = titleStr.match(/([\d,]+)-[Mm]ile/);
      if (nM) mileage = parseInt(nM[1].replace(/,/g, ""), 10);
    }
    return {
      salePrice: d.sort?.price ?? 0,
      saleDate: d.sort?.deadline ?? null,
      mileage,
      title: titleStr,
    };
  });
}

// ---------- Comparable Stats ----------

function recencyWeight(daysSinceSale: number): number {
  return Math.exp((-0.693 * daysSinceSale) / 180);
}

function daysSince(date: Date | string): number {
  return Math.abs(Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24);
}

interface Stats {
  weightedMedian: number;
  weightedMean: number;
  stdDev: number;
  p25: number;
  p75: number;
  nComps: number;
}

function computeStats(comps: Comparable[]): Stats {
  const empty: Stats = { weightedMedian: 0, weightedMean: 0, stdDev: 0, p25: 0, p75: 0, nComps: 0 };
  const valid = comps.filter((c) => c.salePrice > 0);
  if (valid.length === 0) return empty;

  const weighted = valid.map((c) => {
    const days = c.saleDate ? daysSince(c.saleDate) : 365;
    return { price: c.salePrice, weight: recencyWeight(days) };
  });

  let totalWeight = 0, weightedSum = 0;
  for (const w of weighted) {
    weightedSum += w.price * w.weight;
    totalWeight += w.weight;
  }
  const weightedMean = totalWeight > 0 ? weightedSum / totalWeight : 0;

  const prices = valid.map((c) => c.salePrice);
  const mean = prices.reduce((s, p) => s + p, 0) / prices.length;
  const variance = prices.reduce((s, p) => s + (p - mean) ** 2, 0) / prices.length;
  const stdDev = Math.sqrt(variance);

  const sortedByPrice = [...weighted].sort((a, b) => a.price - b.price);
  const halfWeight = totalWeight / 2;
  let cumWeight = 0, weightedMedian = sortedByPrice[0].price;
  for (const item of sortedByPrice) {
    cumWeight += item.weight;
    if (cumWeight >= halfWeight) { weightedMedian = item.price; break; }
  }

  const sorted = [...prices].sort((a, b) => a - b);
  const pct = (p: number) => {
    if (sorted.length <= 1) return sorted[0] ?? 0;
    const idx = p * (sorted.length - 1);
    const lo = Math.floor(idx), hi = Math.ceil(idx), frac = idx - lo;
    return lo === hi ? sorted[lo] : sorted[lo] * (1 - frac) + sorted[hi] * frac;
  };

  return {
    weightedMedian: Math.round(weightedMedian),
    weightedMean: Math.round(weightedMean),
    stdDev: Math.round(stdDev),
    p25: Math.round(pct(0.25)),
    p75: Math.round(pct(0.75)),
    nComps: valid.length,
  };
}

// ---------- Line Price Calculation ----------

function roundToCleanNumber(price: number): number {
  if (price < 5_000) return Math.round(price / 50) * 50;
  if (price < 25_000) return Math.round(price / 250) * 250;
  if (price < 100_000) return Math.round(price / 500) * 500;
  if (price < 500_000) return Math.round(price / 1_000) * 1_000;
  return Math.round(price / 5_000) * 5_000;
}

// ---------- Public API ----------

export interface PricingResult {
  linePrice: number;
  confidence: "high" | "medium" | "low";
  comparablesUsed: number;
  priceRange: { low: number; high: number };
  manualReview: boolean;
}

/**
 * Compute a predicted line price for a BaT auction title.
 * Uses statistical comparable analysis — no AI calls.
 */
export async function computeLinePrice(title: string): Promise<PricingResult> {
  const fallback: PricingResult = {
    linePrice: 0, confidence: "low", comparablesUsed: 0,
    priceRange: { low: 0, high: 0 }, manualReview: true,
  };

  const parsed = parseBatTitle(title);
  if (!parsed.make || !parsed.model) return fallback;

  const db = mongoose.connection.db;
  if (!db) return fallback;

  // Find comps with year filter, then broaden if needed
  const yearRange: [number, number] | undefined = parsed.year
    ? [parsed.year - 5, parsed.year + 5] : undefined;
  let comps = await findComparableSales(db, parsed.make, parsed.model, yearRange);

  if (comps.length < 5) {
    const broader = await findComparableSales(db, parsed.make, parsed.model);
    if (broader.length > comps.length) comps = broader;
  }

  if (comps.length === 0) return fallback;

  const stats = computeStats(comps);

  // Statistical fallback: use weighted median as recommended price
  let recommended = stats.weightedMedian;
  let predictedLow = stats.p25;
  let predictedHigh = stats.p75;
  let confidence: "high" | "medium" | "low" =
    stats.nComps >= 10 ? "medium" : "low";
  if (stats.nComps >= 20 && stats.stdDev / stats.weightedMean < 0.3) confidence = "high";

  // Mileage adjustment
  if (parsed.mileage != null && recommended > 0) {
    const compMileages = comps.map((c) => c.mileage).filter((m): m is number => m != null && m > 0);
    if (compMileages.length > 0) {
      const sorted = [...compMileages].sort((a, b) => a - b);
      const medMileage = sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)];
      const factor = Math.max(0.7, Math.min(1.3, 1 + ((medMileage - parsed.mileage) / medMileage) * 0.3));
      recommended = Math.round(recommended * factor);
      predictedLow = Math.round(predictedLow * factor);
      predictedHigh = Math.round(predictedHigh * factor);
    }
  }

  // No-reserve boost
  if (parsed.noReserve && recommended > 0) {
    recommended = Math.round(recommended * 1.05);
    predictedLow = Math.round(predictedLow * 1.05);
    predictedHigh = Math.round(predictedHigh * 1.05);
  }

  // Engagement optimization: 0.95 YES bias
  let linePrice = recommended * 0.95;

  // Confidence adjustment
  if (confidence === "medium") linePrice *= 0.97;
  else if (confidence === "low" && stats.p25 > 0) linePrice = stats.p25 * 1.1;

  linePrice = roundToCleanNumber(linePrice);

  // Sanity check
  let manualReview = false;
  if (linePrice <= 0) manualReview = true;
  if (stats.weightedMedian > 0) {
    const ratio = linePrice / stats.weightedMedian;
    if (ratio < 0.4 || ratio > 1.6) manualReview = true;
  }
  if (stats.nComps < 3) manualReview = true;

  return {
    linePrice,
    confidence,
    comparablesUsed: stats.nComps,
    priceRange: { low: predictedLow, high: predictedHigh },
    manualReview,
  };
}
