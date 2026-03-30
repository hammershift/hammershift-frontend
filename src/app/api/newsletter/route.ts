export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/lib/mongoose";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  await connectToDB();

  const db = mongoose.connection.db;
  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
  }

  await db.collection("newsletter_subscribers").updateOne(
    { email: email.toLowerCase() },
    { $set: { email: email.toLowerCase(), subscribedAt: new Date() } },
    { upsert: true }
  );

  return NextResponse.json({ success: true });
}
