import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tournamentName = searchParams.get("tournament") || "Weekly Tournament";
  const playerRank = searchParams.get("rank") || "?";
  const totalPlayers = searchParams.get("total") || "?";
  const score = searchParams.get("score") || "0";
  const accuracy = searchParams.get("accuracy") || "0";
  const playerName = searchParams.get("player") || "Player";

  const rankNum = parseInt(playerRank, 10);
  const trophy = rankNum === 1 ? "🥇" : rankNum === 2 ? "🥈" : rankNum === 3 ? "🥉" : "";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "1200px",
          height: "630px",
          backgroundColor: "#0A0A1A",
          padding: "60px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: "#E94560" }}>
            VELOCITY MARKETS
          </div>
          <div style={{ fontSize: "18px", color: "#666666" }}>velocity-markets.com</div>
        </div>

        <div style={{ fontSize: "24px", color: "#9ca3af", marginBottom: "16px" }}>
          {tournamentName}
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: "16px", marginBottom: "30px" }}>
          <div style={{ fontSize: "96px", fontWeight: "bold", color: "#FFB547", lineHeight: 1 }}>
            {trophy} #{playerRank}
          </div>
          <div style={{ fontSize: "28px", color: "#9ca3af" }}>
            of {totalPlayers} players
          </div>
        </div>

        <div style={{ display: "flex", gap: "60px", marginBottom: "40px" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "18px", color: "#9ca3af", marginBottom: "8px" }}>SCORE</div>
            <div style={{ fontSize: "48px", fontWeight: "bold", color: "#E94560" }}>{score}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "18px", color: "#9ca3af", marginBottom: "8px" }}>ACCURACY</div>
            <div style={{ fontSize: "48px", fontWeight: "bold", color: "#00D4AA" }}>{accuracy}%</div>
          </div>
        </div>

        <div style={{ fontSize: "24px", color: "#ffffff", marginBottom: "20px" }}>
          {playerName} — I ranked #{playerRank} in {tournamentName} on Velocity Markets
        </div>

        <div style={{ marginTop: "auto", fontSize: "18px", color: "#4a4a4a" }}>
          Predict car auction prices. Win real prizes.
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
