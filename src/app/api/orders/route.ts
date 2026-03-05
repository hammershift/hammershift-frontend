import clientPromise from "@/lib/mongodb";
import { getAuthSession } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const marketId = searchParams.get("marketId");
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");

    const filter: Record<string, any> = {};

    if (marketId) {
      filter.marketId = marketId;
    }
    if (status) {
      filter.status = status;
    }
    if (userId) {
      // userId may be an ObjectId string — store as ObjectId in DB per admin schema
      try {
        filter.userId = new ObjectId(userId);
      } catch {
        return NextResponse.json(
          { message: "Invalid userId format" },
          { status: 400 }
        );
      }
    }

    const client = await clientPromise;
    const db = client.db();

    const orders = await db
      .collection("polygon_orders")
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(orders);
  } catch (error) {
    console.error("GET /api/orders - Internal server error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user._id as string;
    if (!userId) {
      return NextResponse.json(
        { message: "User ID not found in session" },
        { status: 401 }
      );
    }

    let body: {
      marketId?: string;
      side?: string;
      outcome?: string;
      price?: number;
      quantity?: number;
    };

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { marketId, side, outcome, price, quantity } = body;

    // Required field validation
    if (!marketId || typeof marketId !== "string" || marketId.trim() === "") {
      return NextResponse.json(
        { message: "marketId is required" },
        { status: 400 }
      );
    }
    if (side !== "BUY" && side !== "SELL") {
      return NextResponse.json(
        { message: "side must be 'BUY' or 'SELL'" },
        { status: 400 }
      );
    }
    if (outcome !== "YES" && outcome !== "NO") {
      return NextResponse.json(
        { message: "outcome must be 'YES' or 'NO'" },
        { status: 400 }
      );
    }
    if (typeof price !== "number" || price < 0.01 || price > 0.99) {
      return NextResponse.json(
        { message: "price must be a number between 0.01 and 0.99" },
        { status: 400 }
      );
    }
    if (typeof quantity !== "number" || quantity <= 0) {
      return NextResponse.json(
        { message: "quantity must be a positive number" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Validate market exists and is ACTIVE
    let marketObjectId: ObjectId;
    try {
      marketObjectId = new ObjectId(marketId);
    } catch {
      return NextResponse.json(
        { message: "Invalid marketId format" },
        { status: 400 }
      );
    }

    const market = await db
      .collection("polygon_markets")
      .findOne({ _id: marketObjectId });

    if (!market) {
      return NextResponse.json(
        { message: "Market not found" },
        { status: 404 }
      );
    }
    if (market.status !== "ACTIVE") {
      return NextResponse.json(
        { message: "Market is not ACTIVE" },
        { status: 422 }
      );
    }

    // Build order document matching the polygon_orders schema shape
    const userObjectId = new ObjectId(userId);
    const now = new Date();

    const orderDoc = {
      marketId,
      auctionId: market.auctionId ?? "",
      userId: userObjectId,
      walletAddress: "",          // Caller may update via a separate wallet-link flow
      side,
      outcome,
      price,
      size: quantity,
      remainingSize: quantity,
      status: "OPEN" as const,
      orderType: "LIMIT" as const,
      timeInForce: "GTC" as const,
      postOnly: false,
      triggered: false,
      makerFee: 0,
      takerFee: 0,
      filledQuantity: 0,          // Convenience field for callers
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection("polygon_orders").insertOne(orderDoc);

    return NextResponse.json(
      { ...orderDoc, _id: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/orders - Internal server error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
