import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongoose";
import { WaitlistEntry } from "@/models/waitlistEntry.model";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("referralCode");
  if (!code) return NextResponse.json({ error: "referralCode required" }, { status: 400 });

  await connectToDB();
  const me = await WaitlistEntry.findOne({ referralCode: code });
  if (!me) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const verifiedReferrals = await WaitlistEntry.countDocuments({
    referredByCode: me.referralCode, verifiedAt: { $ne: null }, flaggedAt: null,
  });
  const pendingReferrals = await WaitlistEntry.countDocuments({
    referredByCode: me.referralCode, verifiedAt: null, flaggedAt: null,
  });
  const rawRank = 1 + await WaitlistEntry.countDocuments({
    invitedAt: null, createdAt: { $lt: me.createdAt },
  });
  const position = Math.max(1, rawRank - 10 * verifiedReferrals);

  return NextResponse.json({
    email: me.email,
    referralCode: me.referralCode,
    verifiedAt: me.verifiedAt,
    invitedAt: me.invitedAt,
    position,
    verifiedReferrals,
    pendingReferrals,
  });
}
