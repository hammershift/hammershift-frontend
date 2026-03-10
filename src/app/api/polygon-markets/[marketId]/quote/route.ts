/**
 * GET /api/polygon-markets/[marketId]/quote
 *
 * Returns an AMM trade quote without executing the trade.
 *
 * Query params:
 *   outcome     - "YES" | "NO" (required)
 *   usdcAmount  - positive USD dollar amount (required)
 *   maxSlippage - decimal 0-1, default 0.05
 */

import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/lib/mongoose";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import { quoteTradeExact } from "@/lib/amm";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ marketId: string }> }
) {
  const { marketId } = await params;
  const { searchParams } = req.nextUrl;

  const outcome = searchParams.get("outcome");
  const usdcAmountStr = searchParams.get("usdcAmount");
  const maxSlippageStr = searchParams.get("maxSlippage") ?? "0.05";

  if (outcome !== "YES" && outcome !== "NO") {
    return NextResponse.json({ message: "outcome must be YES or NO" }, { status: 400 });
  }

  const usdcAmount = parseFloat(usdcAmountStr ?? "");
  if (isNaN(usdcAmount) || usdcAmount <= 0) {
    return NextResponse.json({ message: "usdcAmount must be a positive number" }, { status: 400 });
  }

  const maxSlippage = parseFloat(maxSlippageStr);
  if (isNaN(maxSlippage) || maxSlippage < 0 || maxSlippage > 1) {
    return NextResponse.json({ message: "maxSlippage must be between 0 and 1" }, { status: 400 });
  }

  let marketObjectId: ObjectId;
  try {
    marketObjectId = new ObjectId(marketId);
  } catch {
    return NextResponse.json({ message: "Invalid marketId" }, { status: 400 });
  }

  await connectToDB();
  const db = mongoose.connection.db!;

  const market = await db.collection("polygon_markets").findOne(
    { _id: marketObjectId },
    { projection: { yesPool: 1, noPool: 1, status: 1 } }
  );

  if (!market) {
    return NextResponse.json({ message: "Market not found" }, { status: 404 });
  }

  if (market.status !== "ACTIVE") {
    return NextResponse.json(
      { message: `Market is ${String(market.status).toLowerCase()} — trading is closed` },
      { status: 422 }
    );
  }

  const yesPool: number = market.yesPool ?? 50;
  const noPool: number = market.noPool ?? 50;
  const total = yesPool + noPool;

  try {
    const quote = quoteTradeExact({ yesPool, noPool }, outcome, usdcAmount, maxSlippage);
    return NextResponse.json({
      outcome,
      usdcAmount,
      sharesReceived: Math.round(quote.sharesReceived * 1_000_000) / 1_000_000,
      pricePerShare: Math.round(quote.pricePerShare * 10_000) / 10_000,
      fee: Math.round(quote.fee * 100) / 100,
      usdcAfterFee: Math.round(quote.usdcAfterFee * 100) / 100,
      newYesPrice: Math.round(quote.newYesPrice * 10_000) / 10_000,
      newNoPrice: Math.round(quote.newNoPrice * 10_000) / 10_000,
      slippagePct: Math.round(quote.slippagePct * 10_000) / 10_000,
      currentYesPrice: total > 0 ? Math.round((noPool / total) * 10_000) / 10_000 : 0.5,
      currentNoPrice: total > 0 ? Math.round((yesPool / total) * 10_000) / 10_000 : 0.5,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Quote calculation failed";
    return NextResponse.json({ message }, { status: 422 });
  }
}
