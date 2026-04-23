// src/app/s/[shortCode]/opengraph-image.tsx
//
// Next.js file-convention OG image route for share cards.
// Reads from the share_cards collection by shortCode and renders a
// type-specific 1200x630 PNG via next/og ImageResponse.
//
// Fail-closed-quiet: any DB error OR missing card OR unknown type
// renders the FallbackCard. External unfurlers (Slack, Twitter,
// iMessage) must never receive a 500 — a broken unfurl is cached
// by scrapers and permanently breaks sharing.

import { ImageResponse } from "next/og";
import clientPromise from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "Velocity Markets";
export const size = { width: 1200, height: 630 } as const;
export const contentType = "image/png";

// Cache at CDN for 1 day, allow stale-while-revalidate for a week.
// Scrapers (Slack, Twitter, iMessage) cache aggressively — a short max-age
// at the browser keeps our own previews fresh during dev.
const SUCCESS_CACHE =
  "public, immutable, no-transform, max-age=300, s-maxage=86400, stale-while-revalidate=604800";
// Fallback: short TTL so a missing card becomes a real card quickly once written.
const FALLBACK_CACHE = "public, max-age=60";

// ---------- Narrowing helpers ----------

type Payload = Record<string, unknown>;

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" && v.length > 0 ? v : fallback;
}

function num(v: unknown, fallback = 0): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function getPayload(v: unknown): Payload {
  if (v && typeof v === "object") return v as Payload;
  return {};
}

// ---------- Route handler ----------

export default async function OG({
  params,
}: {
  params: Promise<{ shortCode: string }>;
}) {
  const { shortCode } = await params;

  const success = { ...size, headers: { "Cache-Control": SUCCESS_CACHE } };
  const fallback = { ...size, headers: { "Cache-Control": FALLBACK_CACHE } };

  try {
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || undefined);
    const card = await db.collection("share_cards").findOne({ shortCode });

    if (!card) return new ImageResponse(<FallbackCard />, fallback);

    const payload = getPayload(card.payload);

    if (card.type === "welcome") {
      return new ImageResponse(<WelcomeCard payload={payload} />, success);
    }
    if (card.type === "winner") {
      return new ImageResponse(<WinnerCard payload={payload} />, success);
    }
    if (card.type === "tournament") {
      return new ImageResponse(<TournamentCard payload={payload} />, success);
    }
    return new ImageResponse(<FallbackCard />, fallback);
  } catch (err) {
    // Never 500 — a broken unfurl is cached and permanently breaks shares.
    console.error("[og-image] share_cards lookup failed:", err);
    return new ImageResponse(<FallbackCard />, fallback);
  }
}

// ---------- Card components ----------

function FallbackCard() {
  return (
    <div
      style={{
        display: "flex",
        width: 1200,
        height: 630,
        background: "#0A0A1A",
        color: "#fff",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <div style={{ fontSize: 32, color: "#E94560", letterSpacing: 2 }}>
        VELOCITY MARKETS
      </div>
      <div style={{ fontSize: 72, fontWeight: 800, marginTop: 20 }}>
        Invite-Only
      </div>
      <div style={{ fontSize: 24, color: "#9CA3AF", marginTop: 20 }}>
        velocity-markets.com
      </div>
    </div>
  );
}

function WelcomeCard({ payload }: { payload: Payload }) {
  const username = str(payload.username, "predictor");
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: 1200,
        height: 630,
        background: "#0A0A1A",
        color: "#fff",
        padding: 80,
      }}
    >
      <div style={{ fontSize: 32, color: "#E94560", letterSpacing: 2 }}>
        VELOCITY MARKETS
      </div>
      <div style={{ fontSize: 96, fontWeight: 800, marginTop: 40 }}>I&apos;m in.</div>
      <div style={{ fontSize: 40, color: "#9CA3AF", marginTop: 20 }}>
        @{username}
      </div>
      <div
        style={{
          marginTop: "auto",
          fontSize: 24,
          color: "#6B7280",
          display: "flex",
        }}
      >
        velocity-markets.com
      </div>
    </div>
  );
}

function WinnerCard({ payload }: { payload: Payload }) {
  const username = str(payload.username, "predictor");
  const payout = num(payload.payout, 0);
  const pick = str(payload.pick, "");
  const marketTitle = str(payload.marketTitle, "");
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: 1200,
        height: 630,
        background: "#0A0A1A",
        color: "#fff",
        padding: 80,
      }}
    >
      <div style={{ fontSize: 32, color: "#00D4AA", letterSpacing: 2 }}>
        WINNER
      </div>
      <div
        style={{
          fontSize: 140,
          fontWeight: 800,
          marginTop: 20,
          fontFamily: "monospace",
          color: "#00D4AA",
        }}
      >
        +${Math.round(payout).toLocaleString("en-US")}
      </div>
      <div style={{ fontSize: 36, marginTop: 20, display: "flex" }}>
        @{username}
        {pick ? ` called ${pick}` : ""}
      </div>
      {marketTitle ? (
        <div
          style={{
            fontSize: 28,
            color: "#9CA3AF",
            marginTop: 10,
            maxWidth: 1040,
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            display: "flex",
          }}
        >
          {marketTitle}
        </div>
      ) : null}
      <div
        style={{
          marginTop: "auto",
          fontSize: 24,
          color: "#6B7280",
          display: "flex",
        }}
      >
        velocity-markets.com
      </div>
    </div>
  );
}

function TournamentCard({ payload }: { payload: Payload }) {
  const username = str(payload.username, "predictor");
  const placement = num(payload.placement, 0);
  const accuracy = num(payload.accuracy, 0);
  const tournamentName = str(payload.tournamentName, "");
  // Payload may send fraction (0.73) or percentage (73). Normalize fraction→pct,
  // then clamp to [0, 100] so a bad payload can't break the card layout.
  const rawPct = accuracy <= 1 ? accuracy * 100 : accuracy;
  const accuracyPct = Math.max(0, Math.min(100, Math.round(rawPct)));
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: 1200,
        height: 630,
        background: "#0A0A1A",
        color: "#fff",
        padding: 80,
      }}
    >
      <div style={{ fontSize: 32, color: "#FFB547", letterSpacing: 2 }}>
        TOURNAMENT FINISH
      </div>
      <div
        style={{
          fontSize: 120,
          fontWeight: 800,
          marginTop: 20,
          fontFamily: "monospace",
          color: "#FFB547",
        }}
      >
        #{placement}
      </div>
      <div style={{ fontSize: 36, marginTop: 20, display: "flex" }}>
        @{username} · {accuracyPct}% accuracy
      </div>
      {tournamentName ? (
        <div
          style={{
            fontSize: 28,
            color: "#9CA3AF",
            marginTop: 10,
            display: "flex",
          }}
        >
          {tournamentName}
        </div>
      ) : null}
      <div
        style={{
          marginTop: "auto",
          fontSize: 24,
          color: "#6B7280",
          display: "flex",
        }}
      >
        velocity-markets.com
      </div>
    </div>
  );
}
