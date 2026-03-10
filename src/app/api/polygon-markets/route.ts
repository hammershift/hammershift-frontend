import { Types } from "mongoose";
import connectToDB from "@/lib/mongoose";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function buildQuestion(predictedPrice: number): string {
  return "Will this sell above $" + predictedPrice.toLocaleString() + "?";
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

      // If the auction deadline has passed but the market is still ACTIVE, resolve it
      const auctionDeadline = auctionDoc?.sort?.deadline
        ? new Date(auctionDoc.sort.deadline)
        : null;
      const shouldResolve =
        market.status === "ACTIVE" &&
        auctionDeadline !== null &&
        auctionDeadline < now;
      const status = shouldResolve ? "RESOLVED" : market.status;

      return {
        _id: market._id,
        auctionId: market.auctionId,
        question: market.question ?? buildQuestion(market.predictedPrice ?? 0),
        status,
        yesPrice: market.yesPrice ?? 0.5,
        noPrice: market.noPrice ?? 0.5,
        totalVolume: market.totalVolume ?? 0,
        totalLiquidity: market.totalLiquidity ?? 0,
        predictedPrice: market.predictedPrice,
        winningOutcome: market.winningOutcome ?? null,
        resolvedAt: market.resolvedAt ?? (shouldResolve ? now : null),
        createdAt: market.createdAt,
        currentBid: auctionDoc?.sort?.price ?? null,
        auction,
        _shouldResolve: shouldResolve,
      };
    });

    // Persist any newly-resolved markets back to the DB (fire-and-forget)
    const toResolveIds = enriched
      .filter((m) => m._shouldResolve)
      .map((m) => m._id);
    if (toResolveIds.length > 0) {
      db.collection("polygon_markets")
        .updateMany(
          { _id: { $in: toResolveIds } },
          { $set: { status: "RESOLVED", resolvedAt: now, updatedAt: now } }
        )
        .catch(() => {}); // fire-and-forget, don't block response
    }

    // Strip internal flag before returning
    const output = enriched.map(({ _shouldResolve: _, ...rest }) => rest);

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
