import connectToDB from "@/lib/mongoose";
import { Predictions } from "@/models/predictions.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectToDB();

    const car_id = req.nextUrl.searchParams.get("car_id");

    if (car_id) {
      const predictions = await Predictions.find({
        car_id: car_id,
      });
      return NextResponse.json(predictions);
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Internal server error" });
  }
}
