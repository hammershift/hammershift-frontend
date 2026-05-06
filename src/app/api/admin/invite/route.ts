import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDB from "@/lib/mongoose";
import Users from "@/models/user.model";
import { isRoleBypass } from "@/lib/gate";
import { generateReferralCode } from "@/lib/waitlist/codes";

export const dynamic = "force-dynamic";

interface RequestUser {
  role?: string;
  email?: string;
  isInvited?: boolean;
  referralCode?: string;
}

export async function POST(req: Request) {
  const session = (await getServerSession(authOptions)) as
    | { user?: RequestUser }
    | null;
  if (!isRoleBypass(session?.user?.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as { email?: unknown };
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  await connectToDB();
  const user = await Users.findOne({ email }).lean<RequestUser & {
    _id: unknown;
  } | null>();
  if (!user) {
    return NextResponse.json(
      { error: "User not found — they must sign up first" },
      { status: 404 }
    );
  }

  if (user.isInvited === true) {
    return NextResponse.json({
      ok: true,
      already_invited: true,
      email,
      referralCode: user.referralCode,
    });
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = user.referralCode ?? generateReferralCode();
    try {
      await Users.updateOne(
        { _id: user._id },
        {
          $set: {
            isInvited: true,
            invitedVia: "direct",
            referralCode: code,
          },
        }
      );
      return NextResponse.json({ ok: true, email, referralCode: code });
    } catch (err) {
      const e = err as { code?: number; keyPattern?: Record<string, unknown> };
      if (e.code !== 11000 || !e.keyPattern || !("referralCode" in e.keyPattern)) {
        throw err;
      }
    }
  }
  return NextResponse.json(
    { error: "Referral code collision retries exhausted" },
    { status: 500 }
  );
}
