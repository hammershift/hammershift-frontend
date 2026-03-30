import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ predictionId: string }> }
) {
  try {
    const { predictionId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") || "guess";
    const format = searchParams.get("format") || "twitter";

    // Fetch prediction data from the Node.js data endpoint
    const dataUrl = new URL(
      `/api/share-card-data/${predictionId}`,
      request.url
    );
    dataUrl.searchParams.set("type", type);

    const dataRes = await fetch(dataUrl.toString());
    const data = await dataRes.json();

    if (!data.success) {
      return new Response("Prediction not found", { status: 404 });
    }

    const { prediction } = data;
    const accuracy = prediction.accuracy;

    // Color-code accuracy: green >= 95%, gold >= 85%, red otherwise
    const accuracyColor =
      accuracy >= 95 ? "#00d68f" : accuracy >= 85 ? "#FFC553" : "#e84560";

    const isInstagram = format === "instagram";
    const width = isInstagram ? 1080 : 1200;
    const height = isInstagram ? 1080 : 630;
    const padding = isInstagram ? 80 : 60;

    const rankNum = prediction.rank;
    const trophy =
      rankNum === 1
        ? "\u{1F947}"
        : rankNum === 2
          ? "\u{1F948}"
          : rankNum === 3
            ? "\u{1F949}"
            : "";

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: `${width}px`,
            height: `${height}px`,
            backgroundColor: "#0d0d0d",
            padding: `${padding}px`,
            fontFamily: "Arial, sans-serif",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "40px",
            }}
          >
            <div
              style={{
                fontSize: isInstagram ? "36px" : "28px",
                fontWeight: "bold",
                color: "#01696F",
              }}
            >
              VELOCITY MARKETS
            </div>
            <div
              style={{
                fontSize: isInstagram ? "24px" : "18px",
                color: "#666666",
              }}
            >
              velocity-markets.com
            </div>
          </div>

          {/* Car title */}
          <div
            style={{
              fontSize: isInstagram ? "44px" : "34px",
              fontWeight: "bold",
              color: "#ffffff",
              marginBottom: "24px",
              lineHeight: 1.2,
            }}
          >
            {prediction.carTitle}
          </div>

          {/* Prediction vs Actual */}
          <div
            style={{ display: "flex", gap: "60px", marginBottom: "40px" }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontSize: "18px",
                  color: "#9ca3af",
                  marginBottom: "8px",
                }}
              >
                MY PREDICTION
              </div>
              <div
                style={{
                  fontSize: isInstagram ? "56px" : "48px",
                  fontWeight: "bold",
                  color: "#01696F",
                }}
              >
                ${prediction.predictedPrice.toLocaleString()}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontSize: "18px",
                  color: "#9ca3af",
                  marginBottom: "8px",
                }}
              >
                ACTUAL PRICE
              </div>
              <div
                style={{
                  fontSize: isInstagram ? "56px" : "48px",
                  fontWeight: "bold",
                  color: "#FFC553",
                }}
              >
                ${prediction.actualPrice.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Accuracy */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "20px",
              marginBottom: "30px",
            }}
          >
            <div
              style={{
                fontSize: isInstagram ? "88px" : "72px",
                fontWeight: "bold",
                color: accuracyColor,
              }}
            >
              {prediction.accuracy.toFixed(1)}%
            </div>
            <div style={{ fontSize: "28px", color: "#9ca3af" }}>
              ACCURACY
            </div>
          </div>

          {/* Rank (if available) */}
          {prediction.rank && (
            <div
              style={{
                fontSize: "26px",
                color: "#FFC553",
                marginBottom: "20px",
              }}
            >
              {trophy} Ranked #{prediction.rank}
              {prediction.totalParticipants
                ? ` of ${prediction.totalParticipants} players`
                : ""}
            </div>
          )}

          {/* Footer */}
          <div
            style={{ marginTop: "auto", fontSize: "20px", color: "#4a4a4a" }}
          >
            Predict car auction prices. Win real prizes.
          </div>
        </div>
      ),
      { width, height }
    );
  } catch {
    return new Response("Error generating card", { status: 500 });
  }
}
