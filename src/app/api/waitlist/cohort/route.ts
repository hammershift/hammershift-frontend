import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongoose";
import { WaitlistEntry } from "@/models/waitlistEntry.model";
import Users from "@/models/user.model";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export async function GET() {
  await connectToDB();
  const [founding, waitlist] = await Promise.all([
    Users.countDocuments({ invitedVia: "founding" }),
    WaitlistEntry.countDocuments({}),
  ]);
  return NextResponse.json({ claimed: founding + waitlist, cap: 1000 });
}
