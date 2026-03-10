import { Types } from "mongoose";
import connectToDB from "@/lib/mongoose";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const QUALIFYING_MAKES = [
  "ferrari", "lamborghini", "corvette", "mercedes", "bmw",
  "maserati", "alfa romeo", "mustang", "porsche", "camaro",
];

// Throttle auto-create to once per minute per Lambda container
let lastAutoCreate = 0;
const AUTO_CREATE_INTERVAL_MS = 60_000;

function buildQuestion(predictedPrice: number): string {
  return "Will this sell above $" + predictedPrice.toLocaleString() + "?";
}

async function autoCreateMissingMarkets(
  db: mongoose.mongo.Db,
  now: Date
) {
  try {
    // Find live qualifying auctions from scraper (deadline-based, no isActive flag)
    const liveAuctions = await db!
      .collection("auctions")
      .find({
        "sort.deadline": { $gt: now },
        $or: QUALIFYING_MAKES.map((make) => ({
          title: { $regex: make, $options: "i" },
        })),
      })
      .project({ _id: 1, auction_id: 1, title: 1, image: 1, "sort.price": 1, "sort.deadline": 1 })
      .toArray();

    for (const auction of liveAuctions) {
      const auctionId = auction.auction_id ?? auction._id.toString();
      const existing = await db!.collection("polygon_markets").findOne({ auctionId });
      if (existing) continue;
      const predictedPrice = auction.sort?.price ?? 0;
      await db!.collection("polygon_markets").insertOne({
        auctionId,
        question: `Will this sell above $${predictedPrice.toLocaleString()}?`,
        status: "ACTIVE",
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
        createdAt: now,
        updatedAt: now,
      });
    }
  } catch {
    // Non-critical — don't fail the main request
  }
}

function buildAuctionProjection(auctionDoc: Record<string, any> | null): {
  title: string | null;
  image: string | null;
  deadline: Date | null;
} {
  if (!auctionDoc) {
    return { title: null, image: null, deadline: null };
  }
  return {
    title: auctionDoc.title ?? null,
    image: auctionDoc.image ?? null,
    deadline: auctionDoc.sort?.deadline ?? null,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const statusParam = searchParams.get("status");

    await connectToDB();
    const db = mongoose.connection.db!;

    const now = new Date();

    // Auto-create markets for any live qualifying auctions not yet tracked (throttled)
    if (Date.now() - lastAutoCreate > AUTO_CREATE_INTERVAL_MS) {
      lastAutoCreate = Date.now();
      autoCreateMissingMarkets(db, now).catch(() => {});
    }

    const marketFilter: Record<string, any> = {};
    if (
      statusParam &&
      ["ACTIVE", "RESOLVED", "PENDING", "DISPUTED"].includes(statusParam)
    ) {
      marketFilter.status = statusParam;
    }
    // When fetching ACTIVE markets, only return ones whose auction hasn't closed
    if (marketFilter.status === "ACTIVE") {
      marketFilter.$or = [
        { closesAt: { $gt: now } },
        { closesAt: { $exists: false } },
      ];
    }

    const markets = await db
      .collection("polygon_markets")
      .find(marketFilter)
      .toArray();

    if (markets.length === 0) {
      return NextResponse.json([]);
    }

    // Collect all auctionIds and attempt lookup by both string _id and string auction_id
    const auctionIds = markets.map((m) => m.auctionId).filter(Boolean);

    // Attempt ObjectId cast for _id lookup — some auctionIds may be ObjectId strings
    const auctionObjectIds: Types.ObjectId[] = [];
    for (const id of auctionIds) {
      try {
        auctionObjectIds.push(new Types.ObjectId(id));
      } catch {
        // Not a valid ObjectId — skip for _id lookup
      }
    }

    const auctionDocs = await db
      .collection("auctions")
      .find({
        $or: [
          ...(auctionObjectIds.length > 0
            ? [{ _id: { $in: auctionObjectIds } }]
            : []),
          { auction_id: { $in: auctionIds } },
        ],
      })
      .project({ title: 1, image: 1, sort: 1, auction_id: 1 })
      .toArray();

    // Build lookup map: string _id → doc, and auction_id → doc
    const auctionMap = new Map<string, Record<string, any>>();
    for (const doc of auctionDocs) {
      auctionMap.set(doc._id.toString(), doc);
      if (doc.auction_id) {
        auctionMap.set(doc.auction_id, doc);
      }
    }

    const enriched = markets.map((market) => {
      const auctionDoc = auctionMap.get(market.auctionId) ?? null;
      const auction = buildAuctionProjection(auctionDoc);

      return {
        _id: market._id,
        auctionId: market.auctionId,
        question: market.question ?? buildQuestion(market.predictedPrice ?? 0),
        status: market.status,
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

    const output = enriched;

    // Sort: ACTIVE first, then by createdAt descending
    output.sort((a, b) => {
      if (a.status === "ACTIVE" && b.status !== "ACTIVE") return -1;
      if (a.status !== "ACTIVE" && b.status === "ACTIVE") return 1;
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return NextResponse.json(output);
  } catch (error) {
    console.error("GET /api/polygon-markets - Internal server error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
