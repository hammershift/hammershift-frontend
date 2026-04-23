import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongoose";
import { WaitlistEntry } from "@/models/waitlistEntry.model";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const code = (body.referralCode || "").toString().trim();
  if (!code) return NextResponse.json({ error: "referralCode required" }, { status: 400 });

  await connectToDB();
  const entry = await WaitlistEntry.findOne({ referralCode: code });
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (entry.verifiedAt) {
    return NextResponse.json({ verifiedAt: entry.verifiedAt, alreadyVerified: true });
  }
  entry.verifiedAt = new Date();
  await entry.save();
  return NextResponse.json({ verifiedAt: entry.verifiedAt });
}
