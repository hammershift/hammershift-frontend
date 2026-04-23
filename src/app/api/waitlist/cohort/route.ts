import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongoose";
import { WaitlistEntry } from "@/models/waitlistEntry.model";
import Users from "@/models/user.model";

export const dynamic = "force-dynamic";

export async function GET() {
  await connectToDB();
  const [founding, waitlist] = await Promise.all([
    Users.countDocuments({ invitedVia: "founding" }),
    WaitlistEntry.countDocuments({ flaggedAt: null }),
  ]);
  return NextResponse.json({ claimed: founding + waitlist, cap: 1000 });
}
