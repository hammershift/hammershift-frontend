import connectToDB from "@/lib/mongoose";
import { Predictions } from "@/models/predictions.model";
import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { Types } from "mongoose";
export async function GET(req: NextRequest) {
  try {
    await connectToDB();

    // Accept both "car_id" (legacy) and "auction_id" (new)
    const car_id =
      req.nextUrl.searchParams.get("car_id") ||
      req.nextUrl.searchParams.get("auction_id");
    const prediction_type = req.nextUrl.searchParams.get("prediction_type");
    const tournament_id = req.nextUrl.searchParams.get("tournament_id");
    const username = req.nextUrl.searchParams.get("username");
    const latest = req.nextUrl.searchParams.get("latest");
    const limit = Number(req.nextUrl.searchParams.get("limit")) || 0;

    if (car_id && username) {
      const userPredictions = await Predictions.find({
        auction_id: car_id,
        predictionType: prediction_type,
        "user.username": username,
        tournament_id: { $exists: false },
      }).sort({ createdAt: -1 });
      return NextResponse.json(userPredictions);
    }

    if (car_id) {
      let query = Predictions.find({
        auction_id: car_id,
        tournament_id: { $exists: false },
      }).sort({ createdAt: -1 });
      if (limit > 0) query = query.limit(limit);
      const predictions = await query;
      return NextResponse.json(predictions);
    }

    if (tournament_id) {
      const predictions = await Predictions.find({
        tournament_id: tournament_id,
      }).sort({ createdAt: -1 });
      return NextResponse.json(predictions);
    }

    if (latest && username) {
      const latestPrediction = await Predictions.findOne({
        "user.username": username,
      }).sort({ createdAt: -1 });
      return NextResponse.json(latestPrediction);
    }

    return NextResponse.json([]);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    await connectToDB();

    // Always derive user identity from the verified session — never trust client payload.
    const newPrediction = await Predictions.create({
      ...body,
      user: {
        userId: session.user.id,
        username: session.user.username,
        fullName: session.user.name ?? session.user.username ?? "Anonymous",
        role: session.user.role ?? "user",
      },
    });
    return NextResponse.json(newPrediction, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
