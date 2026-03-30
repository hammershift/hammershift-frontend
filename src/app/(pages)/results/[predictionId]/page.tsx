import { Metadata } from "next";
import { notFound } from "next/navigation";
import ShareResultCard from "@/app/components/ShareResultCard";
import Link from "next/link";
import connectToDB from "@/lib/mongoose";
import GuessTheHammer from "@/models/guess_the_hammer.model";
import { Predictions } from "@/models/predictions.model";
import Wager from "@/models/wager";

export const dynamic = "force-dynamic";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://velocity-markets.com";

interface PredictionData {
  carTitle: string;
  predictedPrice: number;
  actualPrice: number;
  accuracy: number;
  rank: number | null;
  totalParticipants: number | null;
}

async function getPredictionData(
  predictionId: string,
  type: string
): Promise<PredictionData | null> {
  await connectToDB();

  try {
    if (type === "guess") {
      const guess = await GuessTheHammer.findById(predictionId)
        .populate("auction", "title")
        .lean();
      if (!guess) return null;

      const g = guess as Record<string, unknown>;
      const auction = g.auction as Record<string, unknown> | null;
      const guessedPrice = (g.guessedPrice as number) || 0;
      const actualPrice = (g.actualPrice as number) || 0;

      const totalParticipants = auction
        ? await GuessTheHammer.countDocuments({
            auction: (auction as Record<string, unknown>)._id,
          })
        : 0;

      const accuracy =
        actualPrice > 0
          ? Math.max(
              0,
              (1 - Math.abs(guessedPrice - actualPrice) / actualPrice) * 100
            )
          : 0;

      return {
        carTitle: (auction?.title as string) || "BaT Auction",
        predictedPrice: guessedPrice,
        actualPrice,
        accuracy: Math.round(accuracy * 10) / 10,
        rank: (g.rank as number) || null,
        totalParticipants,
      };
    } else if (type === "tournament") {
      const pred = await Predictions.findById(predictionId)
        .populate("auction_id", "title")
        .lean();
      if (!pred) return null;

      const p = pred as Record<string, unknown>;
      const auction = p.auction_id as Record<string, unknown> | null;
      const predictedPrice = (p.predictedPrice as number) || 0;
      const deltaFromActual = (p.delta_from_actual as number) || 0;
      const actualPrice = predictedPrice + deltaFromActual;

      const accuracy =
        actualPrice > 0
          ? Math.max(
              0,
              (1 - Math.abs(predictedPrice - actualPrice) / actualPrice) * 100
            )
          : 0;

      return {
        carTitle: (auction?.title as string) || "Tournament Prediction",
        predictedPrice,
        actualPrice: actualPrice > 0 ? actualPrice : 0,
        accuracy: Math.round(accuracy * 10) / 10,
        rank: (p.rank as number) || null,
        totalParticipants: null,
      };
    } else {
      const wager = await Wager.findById(predictionId)
        .populate("auctionID", "title sort")
        .lean();
      if (!wager) return null;

      const w = wager as Record<string, unknown>;
      const auction = w.auctionID as Record<string, unknown> | null;
      const priceGuessed = (w.priceGuessed as number) || 0;
      const auctionSort = auction?.sort as Record<string, unknown> | undefined;
      const actualPrice = (auctionSort?.price as number) || 0;

      const accuracy =
        actualPrice > 0
          ? Math.max(
              0,
              (1 - Math.abs(priceGuessed - actualPrice) / actualPrice) * 100
            )
          : 0;

      return {
        carTitle: (auction?.title as string) || "Prediction",
        predictedPrice: priceGuessed,
        actualPrice,
        accuracy: Math.round(accuracy * 10) / 10,
        rank: null,
        totalParticipants: null,
      };
    }
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ predictionId: string }>;
  searchParams: Promise<{ type?: string }>;
}): Promise<Metadata> {
  const { predictionId } = await params;
  const { type: rawType } = await searchParams;
  const type = rawType || "guess";
  const data = await getPredictionData(predictionId, type);

  if (!data) {
    return { title: "Result Not Found | Velocity Markets" };
  }

  const title = `${data.accuracy.toFixed(1)}% Accuracy — ${data.carTitle} | Velocity Markets`;
  const description = `Predicted $${data.predictedPrice.toLocaleString()} — Actual: $${data.actualPrice.toLocaleString()}. Can you do better?`;
  const imageUrl = `${BASE_URL}/api/share-card/${predictionId}?type=${type}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: imageUrl, width: 1200, height: 630 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ predictionId: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { predictionId } = await params;
  const { type: rawType } = await searchParams;
  const type = rawType || "guess";
  const data = await getPredictionData(predictionId, type);

  if (!data) notFound();

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);

  const ctaHref =
    type === "tournament"
      ? "/tournaments"
      : type === "guess"
        ? "/price_is_right"
        : "/tournaments";

  const ctaLabel =
    type === "tournament"
      ? "Enter a Tournament"
      : type === "guess"
        ? "Guess the Hammer"
        : "Play Free";

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <div className="container mx-auto max-w-2xl px-4 py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-2 text-4xl font-bold text-[#FFC553]">
            {data.accuracy.toFixed(1)}% Accuracy
          </div>
          <h1 className="mb-2 text-2xl font-bold text-white">
            {data.carTitle}
          </h1>
          {data.rank && (
            <div className="text-lg text-gray-400">
              Ranked #{data.rank}
              {data.totalParticipants
                ? ` of ${data.totalParticipants} players`
                : ""}
            </div>
          )}
        </div>

        {/* Price comparison */}
        <div className="mb-6 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-6">
          <div className="grid grid-cols-2 gap-6 text-center">
            <div>
              <div className="mb-2 text-xs uppercase tracking-wide text-gray-500">
                My Prediction
              </div>
              <div className="font-mono text-3xl font-bold text-[#01696F]">
                {formatCurrency(data.predictedPrice)}
              </div>
            </div>
            <div>
              <div className="mb-2 text-xs uppercase tracking-wide text-gray-500">
                Actual Price
              </div>
              <div className="font-mono text-3xl font-bold text-[#FFC553]">
                {formatCurrency(data.actualPrice)}
              </div>
            </div>
          </div>
        </div>

        {/* Share card */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-white">
            Share Your Result
          </h2>
          <ShareResultCard
            predictionId={predictionId}
            type={type as "guess" | "tournament" | "wager"}
            carTitle={data.carTitle}
            accuracy={data.accuracy}
            predictedPrice={data.predictedPrice}
            actualPrice={data.actualPrice}
            rank={data.rank}
          />
        </div>

        {/* CTA */}
        <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-6 text-center">
          <p className="mb-4 text-gray-400">Think you can do better?</p>
          <Link
            href={ctaHref}
            className="inline-block rounded-lg bg-[#01696F] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#0C4E54]"
          >
            {ctaLabel} &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
