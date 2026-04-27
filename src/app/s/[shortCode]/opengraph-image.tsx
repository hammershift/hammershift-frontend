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
//
// Satori (the renderer behind next/og) requires every <div> with
// more than one child node to declare display:"flex" or display:"none".
// `<div>@{name}</div>` compiles to two children ("@" and {name}) and
// throws. To stay safe, every div in this file has an explicit display
// AND text-bearing leaves use template literals so they hold a single
// string child.

import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import clientPromise from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "Velocity Markets";
export const size = { width: 1200, height: 630 } as const;
export const contentType = "image/png";

// Cache at CDN for 1 day, allow stale-while-revalidate for a week.
const SUCCESS_CACHE =
  "public, immutable, no-transform, max-age=300, s-maxage=86400, stale-while-revalidate=604800";
// Fallback: short TTL so a missing card becomes a real card quickly once written.
const FALLBACK_CACHE = "public, max-age=60";

// ---------- Asset loading (cached at module init) ----------

function loadDataUri(relativePath: string, mime: string): string | null {
  try {
    const abs = path.join(process.cwd(), "public", relativePath);
    const buf = fs.readFileSync(abs);
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch (err) {
    console.warn(`[og-image] failed to load ${relativePath}:`, err);
    return null;
  }
}

const HERO_BG_URI = loadDataUri("images/gate/hero-sonoma-sunset.jpg", "image/jpeg");
const LOCKUP_URI = loadDataUri("images/brand/velocity-lockup-white.png", "image/png");

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
    console.error("[og-image] share_cards lookup failed:", err);
    return new ImageResponse(<FallbackCard />, fallback);
  }
}

// ---------- Card components ----------

const SHELL_STYLE = {
  display: "flex",
  flexDirection: "column" as const,
  position: "relative" as const,
  width: 1200,
  height: 630,
  background: "#0A0A1A",
  color: "#fff",
  overflow: "hidden" as const,
};

function HeroBackground({ opacity = 0.45 }: { opacity?: number }) {
  if (!HERO_BG_URI) return null;
  return (
    <div
      style={{
        display: "flex",
        position: "absolute",
        top: 0,
        left: 0,
        width: 1200,
        height: 630,
      }}
    >
      <img
        src={HERO_BG_URI}
        width={1200}
        height={630}
        style={{ objectFit: "cover", opacity }}
        alt=""
      />
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 0,
          left: 0,
          width: 1200,
          height: 630,
          background:
            "linear-gradient(90deg, #0A0A1A 0%, rgba(10,10,26,0.85) 55%, rgba(10,10,26,0.55) 100%)",
        }}
      />
    </div>
  );
}

function BrandLockup() {
  if (!LOCKUP_URI) {
    return (
      <div
        style={{
          display: "flex",
          fontSize: 28,
          color: "#E94560",
          letterSpacing: 3,
          fontWeight: 700,
        }}
      >
        VELOCITY
      </div>
    );
  }
  return (
    <div style={{ display: "flex" }}>
      <img src={LOCKUP_URI} width={180} height={40} alt="Velocity" />
    </div>
  );
}

function FallbackCard() {
  return (
    <div style={SHELL_STYLE}>
      <HeroBackground opacity={0.35} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: 80,
          width: 1200,
          height: 630,
          position: "relative",
          justifyContent: "space-between",
        }}
      >
        <BrandLockup />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", fontSize: 88, fontWeight: 800, lineHeight: 1 }}>
            Beat the auction.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 88,
              fontWeight: 800,
              lineHeight: 1,
              color: "#E94560",
              marginTop: 12,
            }}
          >
            Win real money.
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 24, color: "#9CA3AF" }}>
          velocity-markets.com
        </div>
      </div>
    </div>
  );
}

function WelcomeCard({ payload }: { payload: Payload }) {
  const username = str(payload.username, "predictor");
  const handle = `@${username}`;
  return (
    <div style={SHELL_STYLE}>
      <HeroBackground opacity={0.4} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: 80,
          width: 1200,
          height: 630,
          position: "relative",
          justifyContent: "space-between",
        }}
      >
        <BrandLockup />

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              color: "#E94560",
              letterSpacing: 6,
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            Founding member
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 200,
              fontWeight: 800,
              lineHeight: 0.95,
              marginTop: 24,
              letterSpacing: -4,
            }}
          >
            I&apos;m in.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 44,
              color: "#fff",
              marginTop: 28,
              fontWeight: 600,
            }}
          >
            {handle}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div style={{ display: "flex", fontSize: 24, color: "#9CA3AF" }}>
            velocity-markets.com
          </div>
          <div style={{ display: "flex", fontSize: 22, color: "#6B7280" }}>
            Predict car auction prices. Win real money.
          </div>
        </div>
      </div>
    </div>
  );
}

function WinnerCard({ payload }: { payload: Payload }) {
  const username = str(payload.username, "predictor");
  const payout = num(payload.payout, 0);
  const pick = str(payload.pick, "");
  const marketTitle = str(payload.marketTitle, "");
  const handleLine = pick
    ? `@${username} called ${pick}`
    : `@${username}`;
  const payoutLabel = `+$${Math.round(payout).toLocaleString("en-US")}`;
  return (
    <div style={SHELL_STYLE}>
      <HeroBackground opacity={0.3} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: 80,
          width: 1200,
          height: 630,
          position: "relative",
          justifyContent: "space-between",
        }}
      >
        <BrandLockup />

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              color: "#00D4AA",
              letterSpacing: 6,
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            Winner
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 168,
              fontWeight: 800,
              lineHeight: 0.95,
              marginTop: 16,
              fontFamily: "monospace",
              color: "#00D4AA",
              letterSpacing: -4,
            }}
          >
            {payoutLabel}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 36,
              marginTop: 24,
              color: "#fff",
              fontWeight: 600,
            }}
          >
            {handleLine}
          </div>
          {marketTitle ? (
            <div
              style={{
                display: "flex",
                fontSize: 26,
                color: "#9CA3AF",
                marginTop: 8,
                maxWidth: 1040,
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
            >
              {marketTitle}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", fontSize: 24, color: "#9CA3AF" }}>
          velocity-markets.com
        </div>
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
  const placementLabel = `#${placement}`;
  const meta = `@${username} · ${accuracyPct}% accuracy`;
  return (
    <div style={SHELL_STYLE}>
      <HeroBackground opacity={0.3} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: 80,
          width: 1200,
          height: 630,
          position: "relative",
          justifyContent: "space-between",
        }}
      >
        <BrandLockup />

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              color: "#FFB547",
              letterSpacing: 6,
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            Tournament finish
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 168,
              fontWeight: 800,
              lineHeight: 0.95,
              marginTop: 16,
              fontFamily: "monospace",
              color: "#FFB547",
              letterSpacing: -4,
            }}
          >
            {placementLabel}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 36,
              marginTop: 24,
              color: "#fff",
              fontWeight: 600,
            }}
          >
            {meta}
          </div>
          {tournamentName ? (
            <div
              style={{
                display: "flex",
                fontSize: 26,
                color: "#9CA3AF",
                marginTop: 8,
              }}
            >
              {tournamentName}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", fontSize: 24, color: "#9CA3AF" }}>
          velocity-markets.com
        </div>
      </div>
    </div>
  );
}
