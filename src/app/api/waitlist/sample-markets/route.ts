import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = (await clientPromise).db(process.env.DB_NAME || undefined);
  const markets = await db
    .collection("polygon_markets")
    .find({ status: "OPEN", closesAt: { $gt: new Date() } })
    .sort({ totalVolume: -1 })
    .limit(4)
    .project({ title: 1, imageUrl: 1, yesPrice: 1, noPrice: 1, closesAt: 1 })
    .toArray();
  return NextResponse.json({ markets });
}
