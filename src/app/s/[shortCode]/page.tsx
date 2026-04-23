// src/app/s/[shortCode]/page.tsx
//
// Share-link unfurl page. Scrapers read the <meta> here; humans get redirected.
// - Unauth / not-invited → landing with ?ref=<referralCode>&from=<shortCode>
// - Invited → /markets/[slug] or /tournaments/[tournament_id] when the card
//   references one; else /app.
// - Increments share_cards.views fire-and-forget (never blocks redirect).
// - Fail-closed-quiet: any DB/auth error → redirect to "/" so scrapers never 500.

import { redirect } from "next/navigation";
import type { Metadata } from "next";
import clientPromise from "@/lib/mongodb";
import connectToDB from "@/lib/mongoose";
import Users from "@/models/user.model";
import { getAuthSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Payload = Record<string, unknown>;
type ShareCardType = "welcome" | "winner" | "tournament";

interface ShareCardLean {
  type: ShareCardType;
  payload: Payload;
  shortCode: string;
}

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" && v.length > 0 ? v : fallback;
}
function num(v: unknown, fallback = 0): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}
function asPayload(v: unknown): Payload {
  if (v && typeof v === "object") return v as Payload;
  return {};
}

async function getCard(shortCode: string): Promise<ShareCardLean | null> {
  try {
    const db = (await clientPromise).db(process.env.DB_NAME || undefined);
    const doc = await db.collection("share_cards").findOne({ shortCode });
    if (!doc) return null;
    const type = doc.type;
    if (type !== "welcome" && type !== "winner" && type !== "tournament") return null;
    return {
      type,
      payload: asPayload(doc.payload),
      shortCode: str(doc.shortCode, shortCode),
    };
  } catch (err) {
    console.error("[unfurl] getCard failed:", err);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ shortCode: string }>;
}): Promise<Metadata> {
  const { shortCode } = await params;
  const card = await getCard(shortCode);

  let title = "Velocity Markets — Invite-Only";
  let description = "Prediction markets for the internet. Invite-only beta.";

  if (card?.type === "winner") {
    const payout = Math.round(num(card.payload.payout, 0));
    title = `+$${payout.toLocaleString("en-US")} on Velocity Markets`;
    const mt = str(card.payload.marketTitle, "");
    if (mt) description = mt;
  } else if (card?.type === "tournament") {
    const placement = num(card.payload.placement, 0);
    title = `#${placement} on Velocity Markets`;
    const tn = str(card.payload.tournamentName, "");
    if (tn) description = tn;
  } else if (card?.type === "welcome") {
    const username = str(card.payload.username, "predictor");
    title = `@${username} is in. Velocity Markets — Invite-Only`;
  }

  const image = `/s/${shortCode}/opengraph-image`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

async function incrementViews(shortCode: string): Promise<void> {
  try {
    const db = (await clientPromise).db(process.env.DB_NAME || undefined);
    await db
      .collection("share_cards")
      .updateOne({ shortCode }, { $inc: { views: 1 } });
  } catch (err) {
    // Fire-and-forget — never break the redirect on a counter failure.
    console.warn("[unfurl] view increment failed:", err);
  }
}

async function userIsInvited(): Promise<boolean> {
  try {
    const session = await getAuthSession();
    const email = session?.user?.email;
    if (!email) return false;
    await connectToDB();
    const user = await Users.findOne({ email })
      .lean<{ isInvited?: boolean } | null>();
    return user?.isInvited === true;
  } catch (err) {
    console.warn("[unfurl] invited check failed:", err);
    return false;
  }
}

export default async function UnfurlPage({
  params,
}: {
  params: Promise<{ shortCode: string }>;
}) {
  const { shortCode } = await params;

  // Fire-and-forget counter before the redirect decision.
  await incrementViews(shortCode);

  const card = await getCard(shortCode);
  const invited = await userIsInvited();

  if (invited && card) {
    if (card.type === "winner") {
      const slug = str(card.payload.marketSlug, "");
      if (slug) redirect(`/markets/${encodeURIComponent(slug)}`);
      redirect("/app");
    }
    if (card.type === "tournament") {
      const tid = str(card.payload.tournamentId, "");
      if (tid) redirect(`/tournaments/${encodeURIComponent(tid)}`);
      redirect("/app");
    }
    // welcome or unknown → app
    redirect("/app");
  }

  // Uninvited visitor: attribute to inviter's referral code when we know it.
  const ref = card ? str(card.payload.referralCode, "") : "";
  const qs = new URLSearchParams();
  if (ref) qs.set("ref", ref);
  qs.set("from", shortCode);
  redirect(`/?${qs.toString()}`);
}
