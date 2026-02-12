import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDB from "@/lib/mongoose";
import { Predictions } from "@/models/predictions.model";
import Tournaments from "@/models/tournament.model";
import Auctions from "@/models/auction.model";

export const dynamic = "force-dynamic";

interface BatchPredictionItem {
  auction_id: string;
  tournament_id: string;
  predictedPrice: number;
  predictionType: string;
}

/**
 * POST /api/predictions/batch
 * Submit multiple predictions at once (primarily for tournaments)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { predictions } = body as { predictions: BatchPredictionItem[] };

    if (!predictions || !Array.isArray(predictions) || predictions.length === 0) {
      return NextResponse.json(
        { error: "Invalid predictions data" },
        { status: 400 }
      );
    }

    await connectToDB();

    // Validate all predictions are for the same tournament (if tournament_id exists)
    const tournamentIds = new Set(predictions.map(p => p.tournament_id).filter(Boolean));
    if (tournamentIds.size > 1) {
      return NextResponse.json(
        { error: "All predictions must be for the same tournament" },
        { status: 400 }
      );
    }

    const tournamentId = predictions[0].tournament_id;

    // If tournament predictions, validate tournament and user participation
    if (tournamentId) {
      const tournament = await Tournaments.findById(tournamentId);

      if (!tournament) {
        return NextResponse.json(
          { error: "Tournament not found" },
          { status: 404 }
        );
      }

      // Check if user has joined tournament
      const hasJoined = tournament.users.some(
        (u: any) => u.userId.toString() === session.user.id
      );

      if (!hasJoined) {
        return NextResponse.json(
          { error: "You must join the tournament before making predictions" },
          { status: 400 }
        );
      }

      // Check if user already has predictions for this tournament
      const existingPredictions = await Predictions.find({
        tournament_id: tournamentId,
        "user.userId": session.user.id
      });

      if (existingPredictions.length > 0) {
        return NextResponse.json(
          { error: "You have already submitted predictions for this tournament" },
          { status: 400 }
        );
      }

      // Validate all auctions are part of tournament
      const validAuctions = predictions.every(p =>
        tournament.auction_ids.includes(p.auction_id)
      );

      if (!validAuctions) {
        return NextResponse.json(
          { error: "All auctions must be part of the tournament" },
          { status: 400 }
        );
      }

      // Check if all required auctions are predicted
      if (predictions.length !== tournament.auction_ids.length) {
        return NextResponse.json(
          { error: `You must predict all ${tournament.auction_ids.length} auctions to qualify` },
          { status: 400 }
        );
      }
    }

    // Check for duplicate predicted prices within same auction
    for (const prediction of predictions) {
      const existingWithSamePrice = await Predictions.findOne({
        auction_id: prediction.auction_id,
        tournament_id: prediction.tournament_id,
        predictedPrice: prediction.predictedPrice,
        isActive: true
      });

      if (existingWithSamePrice) {
        return NextResponse.json(
          {
            error: `Price $${prediction.predictedPrice} is already taken for one of the auctions. Please choose different prices.`,
            auction_id: prediction.auction_id
          },
          { status: 400 }
        );
      }
    }

    // Create prediction documents
    const predictionDocs = predictions.map((p) => ({
      auction_id: p.auction_id,
      tournament_id: p.tournament_id,
      predictedPrice: p.predictedPrice,
      predictionType: p.predictionType,
      user: {
        userId: session.user.id,
        fullName: session.user.name || '',
        username: session.user.username || session.user.email?.split('@')[0] || '',
        role: session.user.role || 'USER'
      },
      isActive: true
    }));

    const createdPredictions = await Predictions.insertMany(predictionDocs);

    return NextResponse.json(
      {
        success: true,
        message: `Successfully created ${createdPredictions.length} predictions`,
        count: createdPredictions.length,
        predictions: createdPredictions
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error creating batch predictions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
