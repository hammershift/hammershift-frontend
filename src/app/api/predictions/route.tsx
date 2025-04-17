import connectToDB from "@/lib/mongoose";
import { Predictions } from "@/models/predictions.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectToDB();

    const car_id = req.nextUrl.searchParams.get("car_id");
    const prediction_type = req.nextUrl.searchParams.get("prediction_type");
    const username = req.nextUrl.searchParams.get("username");
    const latest = req.nextUrl.searchParams.get("latest");
    //get all predictions with the same car_id
    if (car_id) {
      const predictions = await Predictions.find({
        carId: car_id,
      });
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
        car_id: car_id,
        prediction_type: prediction_type,
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
    await connectToDB();
    const prediction = await req.json();

    const newPrediction = await Predictions.create(prediction);
    return NextResponse.json(newPrediction, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Internal server error" });
  }
}
