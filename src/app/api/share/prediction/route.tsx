import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import connectToDB from "@/lib/mongoose";
import { Predictions } from "@/models/predictions.model";
import Auctions from "@/models/auction.model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const USDollar = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export async function GET(req: NextRequest) {
  try {
    const predictionId = req.nextUrl.searchParams.get("predictionId");
    if (!predictionId) {
      return new Response("Missing predictionId", { status: 400 });
    }

    await connectToDB();
    const prediction = await Predictions.findById(predictionId).lean().exec();
    if (!prediction) {
      return new Response("Prediction not found", { status: 404 });
    }

    const auction = await Auctions.findById((prediction as any).auction_id).lean().exec();
    const auctionTitle = (auction as any)?.title ?? "Classic Car Auction";
    const imageUrl = (auction as any)?.image ?? "";
    const predictedPrice = USDollar.format((prediction as any).predictedPrice);

    return new ImageResponse(
      (
        <div
          style={{
            width: "1200px",
            height: "630px",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#0A0A1A",
            fontFamily: "sans-serif",
            position: "relative",
          }}
        >
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt=""
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: 0.3,
              }}
            />
          )}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, #0A0A1A 60%, transparent)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "60px",
              left: "60px",
              right: "60px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span style={{ color: "#9ca3af", fontSize: "18px", marginBottom: "8px" }}>
              velocity-markets.com
            </span>
            <span style={{ color: "#9ca3af", fontSize: "20px", marginBottom: "8px" }}>
              I picked:
            </span>
            <span
              style={{
                color: "white",
                fontSize: "36px",
                fontWeight: "bold",
                marginBottom: "12px",
              }}
            >
              {auctionTitle}
            </span>
            <span
              style={{
                color: "#E94560",
                fontSize: "52px",
                fontWeight: "bold",
                fontFamily: "monospace",
              }}
            >
              {predictedPrice}
            </span>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch (err) {
    console.error(err);
    return new Response("Failed to generate image", { status: 500 });
  }
}
