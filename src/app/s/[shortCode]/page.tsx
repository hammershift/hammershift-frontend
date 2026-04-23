// src/app/s/[shortCode]/page.tsx
//
// Share-link unfurl page. Scrapers read the <meta> here; humans get redirected.
// - Unauth / not-invited → landing with ?ref=<referralCode>&from=<shortCode>
// - Invited → /markets/[slug] or /tournaments/[tournament_id] when the card
//   references one; else /app.
// - `loadShareCard` reads + increments share_cards.views in one round-trip,
//   wrapped in React.cache() so generateMetadata and the page share one call.
// - Fail-closed-quiet: any DB/auth error → fall back to landing redirect.

import { cache } from "react";
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

// shortCodes are issued by nanoid(10) → URL-safe charset. Reject anything
// that doesn't match before we touch Mongo — short-circuits bot probes for
// `/s/../../etc/passwd` and similar garbage.
const SHORT_CODE_RE = /^[A-Za-z0-9_-]{4,32}$/;

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

// Single Mongo round-trip: atomically read the card and bump views.
// Wrapped in React.cache() so generateMetadata + the page component
// share exactly one DB call per request (and views increments once).
const loadShareCard = cache(
  async (shortCode: string): Promise<ShareCardLean | null> => {
    if (!SHORT_CODE_RE.test(shortCode)) return null;
    try {
      const db = (await clientPromise).db(process.env.DB_NAME || undefined);
      const result = await db
        .collection("share_cards")
        .findOneAndUpdate(
          { shortCode },
          { $inc: { views: 1 } },
          { returnDocument: "before" },
        );
      const doc = result?.value;
      if (!doc) return null;
      const type = doc.type;
      if (type !== "welcome" && type !== "winner" && type !== "tournament") {
        return null;
      }
      return {
        type,
        payload: asPayload(doc.payload),
        shortCode,
      };
    } catch (err) {
      console.warn("[unfurl] card load failed:", err);
      return null;
    }
  },
);

async function userIsInvited(): Promise<boolean> {
  try {
    const session = await getAuthSession();
    const email = session?.user?.email;
    if (!email) return false;
    await connectToDB();
    const user = await Users.findOne({ email }).lean<{
      isInvited?: boolean;
    } | null>();
    return user?.isInvited === true;
  } catch (err) {
    console.warn("[unfurl] invited check failed:", err);
    return false;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ shortCode: string }>;
}): Promise<Metadata> {
  const { shortCode } = await params;
  const card = await loadShareCard(shortCode);

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

export default async function UnfurlPage({
  params,
}: {
  params: Promise<{ shortCode: string }>;
}) {
  const { shortCode } = await params;

  // Independent — run in parallel.
  const [card, invited] = await Promise.all([
    loadShareCard(shortCode),
    userIsInvited(),
  ]);

  if (invited && card) {
    if (card.type === "winner") {
      const slug = str(card.payload.marketSlug, "");
      return redirect(slug ? `/markets/${encodeURIComponent(slug)}` : "/app");
    }
    if (card.type === "tournament") {
      const tid = str(card.payload.tournamentId, "");
      return redirect(
        tid ? `/tournaments/${encodeURIComponent(tid)}` : "/app",
      );
    }
    return redirect("/app");
  }

  // Uninvited visitor: attribute to inviter's referral code when we know it.
  const ref = card ? str(card.payload.referralCode, "") : "";
  const qs = new URLSearchParams();
  if (ref) qs.set("ref", ref);
  qs.set("from", shortCode);
  return redirect(`/?${qs.toString()}`);
}
