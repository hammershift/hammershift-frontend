import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function buildQuestion(predictedPrice: number): string {
  const dollars = predictedPrice / 100;
  return "Will this sell above $" + dollars.toLocaleString() + "?";
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

    const client = await clientPromise;
    const db = client.db();

    const marketFilter: Record<string, any> = {};
    if (
      statusParam &&
      ["ACTIVE", "RESOLVED", "PENDING", "DISPUTED"].includes(statusParam)
    ) {
      marketFilter.status = statusParam;
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
    const auctionObjectIds: ObjectId[] = [];
    for (const id of auctionIds) {
      try {
        auctionObjectIds.push(new ObjectId(id));
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
      const auctionDoc =
        auctionMap.get(market.auctionId) ?? null;
      const auction = buildAuctionProjection(auctionDoc);

      return {
        _id: market._id,
        auctionId: market.auctionId,
        question: buildQuestion(market.predictedPrice ?? 0),
        status: market.status,
        yesPrice: market.yesPrice ?? 0.5,
        noPrice: market.noPrice ?? 0.5,
        totalVolume: market.totalVolume ?? 0,
        totalLiquidity: market.totalLiquidity ?? 0,
        predictedPrice: market.predictedPrice,
        winningOutcome: market.winningOutcome ?? null,
        resolvedAt: market.resolvedAt ?? null,
        createdAt: market.createdAt,
        auction,
      };
    });

    // Sort: ACTIVE first, then by createdAt descending
    enriched.sort((a, b) => {
      if (a.status === "ACTIVE" && b.status !== "ACTIVE") return -1;
      if (a.status !== "ACTIVE" && b.status === "ACTIVE") return 1;
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("GET /api/polygon-markets - Internal server error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
