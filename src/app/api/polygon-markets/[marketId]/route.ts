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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ marketId: string }> }
) {
  try {
    const { marketId } = await params;

    let marketObjectId: Types.ObjectId;
    try {
      marketObjectId = new Types.ObjectId(marketId);
    } catch {
      return NextResponse.json(
        { message: "Invalid marketId format" },
        { status: 400 }
      );
    }

    await connectToDB();
    const db = mongoose.connection.db!;

    const market = await db
      .collection("polygon_markets")
      .findOne({ _id: marketObjectId });

    if (!market) {
      return NextResponse.json(
        { message: "Market not found" },
        { status: 404 }
      );
    }

    // Attempt auction join by ObjectId _id first, then fall back to auction_id string
    let auctionDoc: Record<string, any> | null = null;

    if (market.auctionId) {
      // Try as ObjectId
      try {
        const auctionObjectId = new Types.ObjectId(market.auctionId);
        auctionDoc = await db
          .collection("auctions")
          .findOne(
            { _id: auctionObjectId },
            { projection: { title: 1, image: 1, sort: 1, auction_id: 1 } }
          );
      } catch {
        // Not a valid ObjectId — fall through to string match
      }

      // Fall back to auction_id string match if ObjectId lookup failed
      if (!auctionDoc) {
        auctionDoc = await db
          .collection("auctions")
          .findOne(
            { auction_id: market.auctionId },
            { projection: { title: 1, image: 1, sort: 1, auction_id: 1 } }
          );
      }
    }

    const auction = buildAuctionProjection(auctionDoc);

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error(
      "GET /api/polygon-markets/[marketId] - Internal server error:",
      error
    );
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
