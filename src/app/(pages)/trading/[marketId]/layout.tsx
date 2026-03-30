import { Metadata } from "next";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

async function getMarketData(marketId: string) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const market = await db
      .collection("polygon_markets")
      .findOne(
        { _id: new ObjectId(marketId) },
        {
          projection: {
            question: 1,
            predictedPrice: 1,
            yesPrice: 1,
            "auction.title": 1,
            "auction.image": 1,
          },
        }
      );
    return market;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ marketId: string }>;
}): Promise<Metadata> {
  const { marketId } = await params;
  const market = await getMarketData(marketId);

  if (!market) {
    return { title: "Market | Velocity Markets" };
  }

  const question = (market.question as string) ?? "Auction Prediction";
  const yesPercent = Math.round(((market.yesPrice as number) ?? 0.5) * 100);
  const title = `${question} | Velocity Markets`;
  const description = `${yesPercent}% say YES. Make your free prediction on Velocity Markets.`;
  const imageUrl = market.auction?.image as string | undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: imageUrl ? [{ url: imageUrl }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default function TradingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
