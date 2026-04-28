import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Types } from "mongoose";
import { authOptions } from "@/lib/auth";
import { ShareCard } from "@/models/shareCard.model";
import connectToDB from "@/lib/mongoose";

export const dynamic = "force-dynamic";

type ShareCardType = "welcome" | "winner" | "tournament";

interface CardResponse {
  id: string;
  type: ShareCardType;
  shortCode: string;
  payload: Record<string, unknown>;
  createdAt: Date;
  views: number;
}

interface ShareCardLean {
  _id: Types.ObjectId;
  type: ShareCardType;
  shortCode: string;
  payload?: Record<string, unknown>;
  views?: number;
  createdAt: Date;
}

/**
 * GET /api/profile/cards
 *
 * Returns the authenticated user's share cards, newest first, capped at 50.
 * Used by the /profile/cards spoke page (and any future card-management
 * surfaces). Auth is required — anonymous callers get a 401.
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

  const cards = await ShareCard.find({ userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .select("type shortCode payload createdAt views")
    .lean<ShareCardLean[]>();

  const out: CardResponse[] = cards.map((c) => ({
    id: String(c._id),
    type: c.type,
    shortCode: c.shortCode,
    payload: c.payload ?? {},
    createdAt: c.createdAt,
    views: typeof c.views === "number" ? c.views : 0,
  }));

  return NextResponse.json({ cards: out });
}
