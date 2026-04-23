import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongoose";
import { WaitlistEntry } from "@/models/waitlistEntry.model";
import Users from "@/models/user.model";
import { generateReferralCode, hashIp } from "@/lib/waitlist/codes";
import { isDisposableEmail } from "@/lib/waitlist/disposableDomains";
import { checkRateLimit } from "@/lib/waitlist/rateLimit";

export const dynamic = "force-dynamic";

function getIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "0.0.0.0";
}

async function computePosition(entry: any): Promise<number> {
  const rawRank = 1 + await WaitlistEntry.countDocuments({
    invitedAt: null,
    createdAt: { $lt: entry.createdAt },
  });
  const bonus = 10 * await WaitlistEntry.countDocuments({
    referredByCode: entry.referralCode,
    verifiedAt: { $ne: null },
    flaggedAt: null,
  });
  return Math.max(1, rawRank - bonus);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawEmail = (body.email || "").toString().trim().toLowerCase();
    const referredByCode = body.referredByCode ? body.referredByCode.toString().trim() : null;
    const utm = body.utm || {};

    if (!rawEmail || !rawEmail.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (isDisposableEmail(rawEmail)) {
      return NextResponse.json({ error: "Disposable email domains not allowed" }, { status: 400 });
    }

    const salt = process.env.WAITLIST_IP_SALT || "default-salt";
    const ipHash = hashIp(getIp(req), salt);
    const rl = await checkRateLimit(ipHash, "signup", { perHour: 3, perDay: 10 });
    if (!rl.ok) {
      return NextResponse.json({ error: "Too many signups from this network" }, { status: 429 });
    }

    await connectToDB();

    const existingUser = await Users.findOne({ email: rawEmail }).lean();
    if (existingUser) {
      return NextResponse.json({ error: "You already have an account", hasAccount: true }, { status: 409 });
    }

    const existing = await WaitlistEntry.findOne({ email: rawEmail });
    if (existing) {
      const position = await computePosition(existing);
      return NextResponse.json({
        referralCode: existing.referralCode,
        verifiedAt: existing.verifiedAt,
        position,
        alreadyOnList: true,
      });
    }

    let code = generateReferralCode();
    for (let i = 0; i < 5 && (await WaitlistEntry.findOne({ referralCode: code })); i++) {
      code = generateReferralCode();
    }

    const entry = await WaitlistEntry.create({
      email: rawEmail,
      referralCode: code,
      referredByCode,
      ipHash,
      utm,
    });
    const position = await computePosition(entry);
    return NextResponse.json({ referralCode: code, position }, { status: 201 });
  } catch (err: any) {
    console.error("waitlist/signup:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
