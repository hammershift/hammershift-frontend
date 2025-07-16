import connectToDB from "@/lib/mongoose";
import { Predictions } from "@/models/predictions.model";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/betterAuth";
import { headers } from "next/headers";
import { Types } from "mongoose";
export async function GET(req: NextRequest) {
  try {
    await connectToDB();

    const car_id = req.nextUrl.searchParams.get("car_id");
    const prediction_type = req.nextUrl.searchParams.get("prediction_type");
    const tournament_id = req.nextUrl.searchParams.get("tournament_id");
    const username = req.nextUrl.searchParams.get("username");
    const latest = req.nextUrl.searchParams.get("latest");
    //get all predictions with the same car_id
    if (car_id) {
      const predictions = await Predictions.find({
        auction_id: car_id,
      });
      return NextResponse.json(predictions);
    }

    if (tournament_id) {
      const predictions = await Predictions.find({
        tournament_id: tournament_id,
      }).sort({ createdAt: -1 });
      return NextResponse.json(predictions);
    }

    //get the user's latest submission (for success page)
    if (latest && username) {
      const latestPrediction = await Predictions.findOne({
        "user.username": username,
      }).sort({
        createdAt: -1,
      });
      return NextResponse.json(latestPrediction);
    }
    //get all predictions submitted by the same user for the specific car_id

    if (car_id && username) {
      const userPredictions = await Predictions.find({
        auction_id: car_id,
        predictionType: prediction_type,
        "user.username": username,
      });
      return NextResponse.json(userPredictions);
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Internal server error" });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 400 });
    }

    let prediction = await req.json();
    // const userId = Types.ObjectId.createFromHexString(prediction.user.userId);
    if (
      session.user.id !== prediction.user.userId ||
      session.user.username !== prediction.user.username
    ) {
      return NextResponse.json({ message: "User mismatch" }, { status: 400 });
    }
    await connectToDB();

    const newPrediction = await Predictions.create(prediction);
    return NextResponse.json(newPrediction, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Internal server error" });
  }
}
