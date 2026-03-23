/**
 * POST /api/cron/reprice-markets
 *
 * Re-prices all ACTIVE markets using the comparable-based pricing engine.
 * Intended as a one-time migration and can be re-run safely.
 */
import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongoose";
import mongoose from "mongoose";
import { computeLinePrice } from "@/lib/pricingEngine";

export const dynamic = "force-dynamic";

function isAuthorized(req: Request): boolean {
  const secret = req.headers.get("x-cron-secret");
  return secret === process.env.CRON_SECRET;
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDB();
  const db = mongoose.connection.db!;

  const markets = await db
    .collection("polygon_markets")
    .find({ status: "ACTIVE" })
    .toArray();

  const results: Array<{
    auctionId: string;
    title: string | null;
    oldPrice: number;
    newPrice: number;
    confidence: string;
    comps: number;
  }> = [];

  for (const market of markets) {
    const title = market.title;
    if (!title) {
      results.push({
        auctionId: market.auctionId,
        title: null,
        oldPrice: market.predictedPrice,
        newPrice: market.predictedPrice,
        confidence: "skip",
        comps: 0,
      });
      continue;
    }

    const pricing = await computeLinePrice(title);

    if (pricing.linePrice > 0) {
      await db.collection("polygon_markets").updateOne(
        { _id: market._id },
        {
          $set: {
            predictedPrice: pricing.linePrice,
            question: `Will this sell above $${pricing.linePrice.toLocaleString()}?`,
            updatedAt: new Date(),
          },
        }
      );
    }

    results.push({
      auctionId: market.auctionId,
      title,
      oldPrice: market.predictedPrice,
      newPrice: pricing.linePrice > 0 ? pricing.linePrice : market.predictedPrice,
      confidence: pricing.confidence,
      comps: pricing.comparablesUsed,
    });
  }

  return NextResponse.json({ ok: true, repriced: results.length, results });
}
