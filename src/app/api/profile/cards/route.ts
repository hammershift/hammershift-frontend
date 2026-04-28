import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Types } from "mongoose";
import { authOptions } from "@/lib/auth";
import { ShareCard } from "@/models/shareCard.model";
import Users from "@/models/user.model";
import connectToDB from "@/lib/mongoose";

export const dynamic = "force-dynamic";

type ShareCardType = "welcome" | "winner" | "tournament";

interface CardResponse {
  id: string;
  type: ShareCardType;
  shortCode: string;
  createdAt: string;
  views: number;
}

interface ShareCardLean {
  _id: Types.ObjectId;
  type: ShareCardType;
  shortCode: string;
  views?: number;
  createdAt: Date;
}

/**
 * GET /api/profile/cards
 *
 * Returns the authenticated user's share cards, newest first, capped at 50.
 * Used by the /profile/cards spoke page (and any future card-management
 * surfaces). Auth is required and the user must be invited — anonymous or
 * non-invited callers get a 401. Gate parity with the spoke page is
 * intentional: a non-invited user with legacy cards in the DB must not be
 * able to read them via this endpoint.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  // session.user.id is the canonical path on this codebase (set in
  // authOptions.callbacks.session as `session.user.id = token._id`).
  // _id is also populated as a defensive fallback.
  const userId = session?.user?.id ?? session?.user?._id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDB();

  // Gate parity with the spoke page: invited users only.
  const user = await Users.findById(userId)
    .select("isInvited")
    .lean<{ isInvited?: boolean } | null>();
  if (!user || user.isInvited !== true) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cards = await ShareCard.find({ userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .select("type shortCode createdAt views")
    .lean<ShareCardLean[]>();

  const out: CardResponse[] = cards.map((c) => ({
    id: String(c._id),
    type: c.type,
    shortCode: c.shortCode,
    createdAt: c.createdAt.toISOString(),
    views: typeof c.views === "number" ? c.views : 0,
  }));

  return NextResponse.json({ cards: out });
}
