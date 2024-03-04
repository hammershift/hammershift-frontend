import { calculateTournamentScores } from "@/helpers/calculateTournamentScores";
import clientPromise from "@/lib/mongodb";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userWagers, auctions } = await req.json();

    if (!userWagers || !auctions) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const tournamentResults = calculateTournamentScores(userWagers, auctions);
    return NextResponse.json({ tournamentResults });
  } catch (error) {
    console.error("Error in calculateTournamentScores:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = await client.db();
    const limit = Number(req.nextUrl.searchParams.get("limit"));
    const tournament_id = req.nextUrl.searchParams.get("tournament_id");

    if (tournament_id) {
      const tournamentPoints = await db
        .collection("tournament_points")
        .find({
          $and: [{ tournamentID: new mongoose.Types.ObjectId(tournament_id) }],
        })
        .limit(limit) // Correct placement of limit method
        .toArray();

      return NextResponse.json(tournamentPoints);
    }

    const tournamentPoints = await db
      .collection("tournament_points")
      .find()
      .limit(limit) // Correct placement of limit method
      .toArray();

    return NextResponse.json({
      total: tournamentPoints.length,
      tournament_points: tournamentPoints,
    });
  } catch {
    return NextResponse.json(
      { message: "Cannot find tournament_points" },
      { status:  404 }
    );
  }
}