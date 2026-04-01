// src/app/api/cron/create-tournaments/route.ts
//
// Autonomous tournament curator. Run 2x/week (Mon + Thu) via external cron.
// Scans upcoming auctions, clusters them into themed tournaments, creates them.
// Fully hands-off — no admin intervention needed.

import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongoose";
import Tournaments from "@/models/tournament.model";
import Auctions from "@/models/auction.model";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

// ── Config ──────────────────────────────────────────────────
const QUALIFYING_MAKES = [
  "ferrari", "lamborghini", "bugatti", "mclaren", "porsche",
  "corvette", "camaro", "mustang", "mercedes", "bmw",
  "alfa romeo", "fiat", "volvo", "pagani", "cobra",
];

const MIN_AUCTIONS_PER_TOURNAMENT = 3;
const MAX_AUCTIONS_PER_TOURNAMENT = 10;
const TARGET_TOURNAMENTS_PER_RUN = 3; // Aim for 3 tournaments per run (6/week if run 2x)
const LOOKAHEAD_DAYS = 7; // Scan auctions ending in the next 7 days

// Country of origin mapping for clustering
const COUNTRY_MAP: Record<string, string> = {
  ferrari: "Italian", lamborghini: "Italian", "alfa romeo": "Italian",
  fiat: "Italian", pagani: "Italian", bugatti: "French",
  mclaren: "British", porsche: "German", mercedes: "German", bmw: "German",
  corvette: "American", camaro: "American", mustang: "American", cobra: "American",
  volvo: "Swedish",
};

// Price tier boundaries
const PRICE_TIERS = [
  { label: "Budget Brawl", max: 50000 },
  { label: "Mid-Range Showdown", max: 150000 },
  { label: "Six-Figure Clash", max: 500000 },
  { label: "Million Dollar Lineup", max: Infinity },
];

// Tournament name templates
const THEME_NAMES: Record<string, string[]> = {
  make: [
    "{make} Showdown", "{make} Week", "Best of {make}",
    "{make} Battle Royale", "The {make} Challenge",
  ],
  country: [
    "{country} Legends", "{country} Power", "{country} Classics",
    "The {country} Collection", "{country} Icons",
  ],
  price: [
    "{tier}: Under ${max}", "{tier}", "The {tier}",
  ],
  era: [
    "{era} Classics", "The {era}", "Throwback: {era}",
  ],
  mixed: [
    "Weekly Showcase", "Collector's Pick", "Editor's Choice",
    "This Week's Best", "The Paddock",
  ],
};

// ── Auth ────────────────────────────────────────────────────
function isAuthorized(req: Request): boolean {
  const secret = req.headers.get("x-cron-secret");
  return secret === process.env.CRON_SECRET;
}

// ── Helpers ─────────────────────────────────────────────────
interface AuctionDoc {
  _id: mongoose.Types.ObjectId;
  title: string;
  image: string;
  sort?: { price?: number; deadline?: Date; bids?: number };
  attributes?: Array<{ key: string; value: string }>;
  prediction_count?: number;
}

function detectMake(title: string): string | null {
  const lower = title.toLowerCase();
  return QUALIFYING_MAKES.find((m) => lower.includes(m)) ?? null;
}

function detectYear(title: string): number | null {
  const match = title.match(/\b(19[4-9]\d|20[0-2]\d)\b/);
  return match ? parseInt(match[1]) : null;
}

function getEra(year: number): string | null {
  if (year < 1960) return "Pre-War & 50s";
  if (year < 1970) return "Swinging 60s";
  if (year < 1980) return "70s Muscle";
  if (year < 1990) return "80s Legends";
  if (year < 2000) return "90s Nostalgia";
  if (year < 2010) return "2000s Modern";
  return "2010s+";
}

function getPriceTier(price: number): { label: string; max: number } {
  return PRICE_TIERS.find((t) => price < t.max) ?? PRICE_TIERS[PRICE_TIERS.length - 1];
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateName(theme: string, vars: Record<string, string>): string {
  const templates = THEME_NAMES[theme] ?? THEME_NAMES.mixed;
  let name = pickRandom(templates);
  for (const [k, v] of Object.entries(vars)) {
    name = name.replace(`{${k}}`, v);
  }
  return name;
}

function capitalize(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Clustering Engine ───────────────────────────────────────
interface Cluster {
  theme: string;
  name: string;
  description: string;
  auctionIds: string[];
  score: number; // Higher = better tournament
  startTime: Date;
  endTime: Date;
  buyInFee: number;
}

function clusterAuctions(auctions: AuctionDoc[]): Cluster[] {
  const clusters: Cluster[] = [];
  const usedIds = new Set<string>();

  // Annotate auctions with metadata
  const annotated = auctions.map((a) => {
    const make = detectMake(a.title);
    const year = detectYear(a.title);
    const era = year ? getEra(year) : null;
    const country = make ? COUNTRY_MAP[make] ?? null : null;
    const price = a.sort?.price ?? 0;
    const priceTier = getPriceTier(price);
    const bids = a.sort?.bids ?? 0;
    const predictions = a.prediction_count ?? 0;
    // Excitement score: bids + predictions + price premium
    const excitement = bids * 2 + predictions * 3 + (price > 100000 ? 20 : price > 50000 ? 10 : 0);
    return { ...a, make, year, era, country, price, priceTier, excitement, bids, predictions };
  });

  // ── Strategy 1: Group by make (best clusters) ──
  const byMake = new Map<string, typeof annotated>();
  for (const a of annotated) {
    if (!a.make) continue;
    if (!byMake.has(a.make)) byMake.set(a.make, []);
    byMake.get(a.make)!.push(a);
  }
  for (const [make, group] of Array.from(byMake)) {
    if (group.length < MIN_AUCTIONS_PER_TOURNAMENT) continue;
    const sorted = group.sort((a, b) => b.excitement - a.excitement);
    const selected = sorted.slice(0, MAX_AUCTIONS_PER_TOURNAMENT);
    const earliest = new Date(Math.min(...selected.map((a) => new Date(a.sort?.deadline ?? 0).getTime())));
    const latest = new Date(Math.max(...selected.map((a) => new Date(a.sort?.deadline ?? 0).getTime())));
    const avgPrice = selected.reduce((s, a) => s + a.price, 0) / selected.length;
    clusters.push({
      theme: "make",
      name: generateName("make", { make: capitalize(make) }),
      description: `${selected.length} ${capitalize(make)} auctions ending this week. Predict the hammer price on each.`,
      auctionIds: selected.map((a) => a._id.toString()),
      score: selected.reduce((s, a) => s + a.excitement, 0) + selected.length * 5,
      startTime: new Date(), // Starts immediately
      endTime: latest,
      buyInFee: avgPrice > 100000 ? 25 : avgPrice > 50000 ? 15 : 5,
    });
  }

  // ── Strategy 2: Group by country of origin ──
  const byCountry = new Map<string, typeof annotated>();
  for (const a of annotated) {
    if (!a.country) continue;
    if (!byCountry.has(a.country)) byCountry.set(a.country, []);
    byCountry.get(a.country)!.push(a);
  }
  for (const [country, group] of Array.from(byCountry)) {
    if (group.length < MIN_AUCTIONS_PER_TOURNAMENT) continue;
    const sorted = group.sort((a, b) => b.excitement - a.excitement);
    const selected = sorted.slice(0, MAX_AUCTIONS_PER_TOURNAMENT);
    const latest = new Date(Math.max(...selected.map((a) => new Date(a.sort?.deadline ?? 0).getTime())));
    clusters.push({
      theme: "country",
      name: generateName("country", { country }),
      description: `${selected.length} ${country} cars going under the hammer. Who can predict closest?`,
      auctionIds: selected.map((a) => a._id.toString()),
      score: selected.reduce((s, a) => s + a.excitement, 0) + selected.length * 3,
      startTime: new Date(),
      endTime: latest,
      buyInFee: 10,
    });
  }

  // ── Strategy 3: Group by era ──
  const byEra = new Map<string, typeof annotated>();
  for (const a of annotated) {
    if (!a.era) continue;
    if (!byEra.has(a.era)) byEra.set(a.era, []);
    byEra.get(a.era)!.push(a);
  }
  for (const [era, group] of Array.from(byEra)) {
    if (group.length < MIN_AUCTIONS_PER_TOURNAMENT) continue;
    const sorted = group.sort((a, b) => b.excitement - a.excitement);
    const selected = sorted.slice(0, MAX_AUCTIONS_PER_TOURNAMENT);
    const latest = new Date(Math.max(...selected.map((a) => new Date(a.sort?.deadline ?? 0).getTime())));
    clusters.push({
      theme: "era",
      name: generateName("era", { era }),
      description: `${selected.length} cars from the ${era} era. Classic meets competition.`,
      auctionIds: selected.map((a) => a._id.toString()),
      score: selected.reduce((s, a) => s + a.excitement, 0) + selected.length * 2,
      startTime: new Date(),
      endTime: latest,
      buyInFee: 10,
    });
  }

  // ── Strategy 4: Group by price tier ──
  const byPrice = new Map<string, typeof annotated>();
  for (const a of annotated) {
    const key = a.priceTier.label;
    if (!byPrice.has(key)) byPrice.set(key, []);
    byPrice.get(key)!.push(a);
  }
  for (const [tier, group] of Array.from(byPrice)) {
    if (group.length < MIN_AUCTIONS_PER_TOURNAMENT) continue;
    const sorted = group.sort((a, b) => b.excitement - a.excitement);
    const selected = sorted.slice(0, MAX_AUCTIONS_PER_TOURNAMENT);
    const latest = new Date(Math.max(...selected.map((a) => new Date(a.sort?.deadline ?? 0).getTime())));
    const tierInfo = PRICE_TIERS.find((t) => t.label === tier)!;
    clusters.push({
      theme: "price",
      name: generateName("price", {
        tier,
        max: tierInfo.max === Infinity ? "1M+" : (tierInfo.max / 1000).toFixed(0) + "K",
      }),
      description: `${selected.length} auctions in the ${tier.toLowerCase()} price range.`,
      auctionIds: selected.map((a) => a._id.toString()),
      score: selected.reduce((s, a) => s + a.excitement, 0),
      startTime: new Date(),
      endTime: latest,
      buyInFee: tierInfo.max > 150000 ? 25 : 10,
    });
  }

  // ── Strategy 5: "Best of the Week" mixed grab-bag ──
  const topExcitement = [...annotated].sort((a, b) => b.excitement - a.excitement);
  if (topExcitement.length >= MIN_AUCTIONS_PER_TOURNAMENT) {
    const selected = topExcitement.slice(0, MAX_AUCTIONS_PER_TOURNAMENT);
    const latest = new Date(Math.max(...selected.map((a) => new Date(a.sort?.deadline ?? 0).getTime())));
    clusters.push({
      theme: "mixed",
      name: generateName("mixed", {}),
      description: `The ${selected.length} most exciting auctions ending this week.`,
      auctionIds: selected.map((a) => a._id.toString()),
      score: selected.reduce((s, a) => s + a.excitement, 0) + 50, // Bonus: always have a mixed
      startTime: new Date(),
      endTime: latest,
      buyInFee: 10,
    });
  }

  // ── Select best non-overlapping clusters ──
  clusters.sort((a, b) => b.score - a.score);
  const finalClusters: Cluster[] = [];

  for (const cluster of clusters) {
    if (finalClusters.length >= TARGET_TOURNAMENTS_PER_RUN) break;
    // Check overlap: no more than 30% of auctions shared with already-selected tournaments
    const overlapCount = cluster.auctionIds.filter((id) => usedIds.has(id)).length;
    if (overlapCount / cluster.auctionIds.length > 0.3) continue;
    finalClusters.push(cluster);
    for (const id of cluster.auctionIds) usedIds.add(id);
  }

  return finalClusters;
}

// ── Main Handler ────────────────────────────────────────────
export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDB();

    const now = new Date();
    const lookahead = new Date(now.getTime() + LOOKAHEAD_DAYS * 24 * 60 * 60 * 1000);

    // 1. Fetch upcoming qualifying auctions
    const auctions = await Auctions.find({
      "sort.deadline": { $gt: now, $lt: lookahead },
      $or: QUALIFYING_MAKES.map((make) => ({
        title: { $regex: make, $options: "i" },
      })),
    })
      .sort({ "sort.deadline": 1 })
      .lean() as AuctionDoc[];

    if (auctions.length < MIN_AUCTIONS_PER_TOURNAMENT) {
      return NextResponse.json({
        message: "Not enough qualifying auctions",
        auctionCount: auctions.length,
        created: 0,
      });
    }

    // 2. Check what tournaments already exist for this window (idempotency)
    const existingTournaments = await Tournaments.find({
      endTime: { $gt: now },
      isActive: true,
    }).lean();

    const existingAuctionIds = new Set(
      existingTournaments.flatMap((t: any) => t.auction_ids ?? [])
    );

    // Filter out auctions already in active tournaments
    const availableAuctions = auctions.filter(
      (a) => !existingAuctionIds.has(a._id.toString())
    );

    if (availableAuctions.length < MIN_AUCTIONS_PER_TOURNAMENT) {
      return NextResponse.json({
        message: "All qualifying auctions already in tournaments",
        auctionCount: auctions.length,
        alreadyAssigned: auctions.length - availableAuctions.length,
        created: 0,
      });
    }

    // 3. Cluster into tournaments
    const clusters = clusterAuctions(availableAuctions);

    if (clusters.length === 0) {
      return NextResponse.json({
        message: "No viable clusters found",
        auctionCount: availableAuctions.length,
        created: 0,
      });
    }

    // 4. Get next tournament_id
    const lastTournament = await Tournaments.findOne()
      .sort({ tournament_id: -1 })
      .select("tournament_id")
      .lean() as any;
    let nextId = (lastTournament?.tournament_id ?? 0) + 1;

    // 5. Create tournaments
    const created: Array<{ name: string; theme: string; auctions: number; buyIn: number }> = [];

    for (const cluster of clusters) {
      // Pick a banner image from the first auction
      const firstAuction = availableAuctions.find(
        (a) => a._id.toString() === cluster.auctionIds[0]
      );

      const tournament = new Tournaments({
        _id: new mongoose.Types.ObjectId(),
        tournament_id: nextId++,
        name: cluster.name,
        description: cluster.description,
        banner: firstAuction?.image ?? "",
        type: cluster.buyInFee > 0 ? "paid" : "free_play",
        prizePool: 0,
        buyInFee: cluster.buyInFee,
        isActive: true,
        startTime: cluster.startTime,
        endTime: cluster.endTime,
        auction_ids: cluster.auctionIds,
        users: [],
        maxUsers: 100,
        max_participants: 100,
        scoring_version: "v2",
        featured_image: firstAuction?.image ?? "",
        haveWinners: false,
        rakePercent: 10,
        calculatedPrizePool: 0,
      });

      await tournament.save();
      created.push({
        name: cluster.name,
        theme: cluster.theme,
        auctions: cluster.auctionIds.length,
        buyIn: cluster.buyInFee,
      });

      console.log(
        `[create-tournaments] Created: "${cluster.name}" (${cluster.theme}) — ${cluster.auctionIds.length} auctions, $${cluster.buyInFee} buy-in`
      );
    }

    return NextResponse.json({
      message: `Created ${created.length} tournaments`,
      created,
      availableAuctions: availableAuctions.length,
      existingActiveTournaments: existingTournaments.length,
    });
  } catch (error: any) {
    console.error("[create-tournaments] Error:", error);
    return NextResponse.json(
      { error: error.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}
