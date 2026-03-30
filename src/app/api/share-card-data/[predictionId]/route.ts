export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/lib/mongoose";
import GuessTheHammer from "@/models/guess_the_hammer.model";
import { Predictions } from "@/models/predictions.model";
import Wager from "@/models/wager";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ predictionId: string }> }
) {
  const { predictionId } = await params;
  await connectToDB();

  const type = request.nextUrl.searchParams.get("type") || "guess";

  let prediction: {
    carTitle: string;
    predictedPrice: number;
    actualPrice: number;
    accuracy: number;
    rank: number | null;
    totalParticipants: number | null;
  } | null = null;

  try {
    if (type === "guess") {
      const guess = await GuessTheHammer.findById(predictionId)
        .populate("auction", "title image")
        .lean();

      if (!guess) {
        return NextResponse.json({ success: false }, { status: 404 });
      }

      const g = guess as Record<string, unknown>;
      const auction = g.auction as Record<string, unknown> | null;
      const guessedPrice = (g.guessedPrice as number) || 0;
      const actualPrice = (g.actualPrice as number) || 0;

      const totalParticipants = auction
        ? await GuessTheHammer.countDocuments({
            auction: (auction as Record<string, unknown>)._id,
          })
        : 0;

      const accuracy =
        actualPrice > 0
          ? Math.max(
              0,
              (1 - Math.abs(guessedPrice - actualPrice) / actualPrice) * 100
            )
          : 0;

      prediction = {
        carTitle: (auction?.title as string) || "BaT Auction",
        predictedPrice: guessedPrice,
        actualPrice,
        accuracy: Math.round(accuracy * 10) / 10,
        rank: (g.rank as number) || null,
        totalParticipants,
      };
    } else if (type === "tournament") {
      const pred = await Predictions.findById(predictionId)
        .populate("auction_id", "title image")
        .lean();

      if (!pred) {
        return NextResponse.json({ success: false }, { status: 404 });
      }

      const p = pred as Record<string, unknown>;
      const auction = p.auction_id as Record<string, unknown> | null;
      const predictedPrice = (p.predictedPrice as number) || 0;
      const deltaFromActual = (p.delta_from_actual as number) || 0;
      const actualPrice = predictedPrice + deltaFromActual;

      const accuracy =
        actualPrice > 0
          ? Math.max(
              0,
              (1 - Math.abs(predictedPrice - actualPrice) / actualPrice) * 100
            )
          : 0;

      prediction = {
        carTitle: (auction?.title as string) || "Tournament Prediction",
        predictedPrice,
        actualPrice: actualPrice > 0 ? actualPrice : 0,
        accuracy: Math.round(accuracy * 10) / 10,
        rank: (p.rank as number) || null,
        totalParticipants: null,
      };
    } else {
      const wager = await Wager.findById(predictionId)
        .populate("auctionID", "title image sort")
        .lean();

      if (!wager) {
        return NextResponse.json({ success: false }, { status: 404 });
      }

      const w = wager as Record<string, unknown>;
      const auction = w.auctionID as Record<string, unknown> | null;
      const priceGuessed = (w.priceGuessed as number) || 0;
      const auctionSort = auction?.sort as Record<string, unknown> | undefined;
      const actualPrice = (auctionSort?.price as number) || 0;

      const accuracy =
        actualPrice > 0
          ? Math.max(
              0,
              (1 - Math.abs(priceGuessed - actualPrice) / actualPrice) * 100
            )
          : 0;

      prediction = {
        carTitle: (auction?.title as string) || "Prediction",
        predictedPrice: priceGuessed,
        actualPrice,
        accuracy: Math.round(accuracy * 10) / 10,
        rank: null,
        totalParticipants: null,
      };
    }
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }

  return NextResponse.json({ success: true, prediction });
}
