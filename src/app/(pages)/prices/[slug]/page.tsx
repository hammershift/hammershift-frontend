import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import connectToDB from "@/lib/mongoose";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";
export const revalidate = 86400; // ISR: revalidate daily

interface AuctionPriceData {
  make: string;
  model: string;
  count: number;
  medianPrice: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  recentAuctions: Array<{
    _id: string;
    title: string;
    finalPrice: number;
    date: string;
    imageUrl: string;
  }>;
}

function parseSlug(slug: string): { make: string; model: string } | null {
  const suffix = "-bat-auction-prices";
  if (!slug.endsWith(suffix)) return null;

  const withoutSuffix = slug.slice(0, -suffix.length);
  const dashIdx = withoutSuffix.indexOf("-");
  if (dashIdx === -1) return null;

  return {
    make: withoutSuffix.slice(0, dashIdx).replace(/-/g, " "),
    model: withoutSuffix.slice(dashIdx + 1).replace(/-/g, " "),
  };
}

async function getAuctionData(
  make: string,
  model: string
): Promise<AuctionPriceData | null> {
  await connectToDB();

  const db = mongoose.connection.db;
  if (!db) return null;

  const makeRegex = new RegExp(`^${make}$`, "i");
  const modelRegex = new RegExp(`^${model}$`, "i");

  // Query auctions with matching make/model attributes that have a sold price
  const auctions = await db
    .collection("auctions")
    .find({
      attributes: {
        $all: [
          { $elemMatch: { key: "make", value: makeRegex } },
          { $elemMatch: { key: "model", value: modelRegex } },
        ],
      },
      "sort.price": { $gt: 0 },
      isActive: false,
    })
    .sort({ "sort.price": -1 })
    .limit(100)
    .project({
      title: 1,
      image: 1,
      "sort.price": 1,
      "sort.deadline": 1,
      attributes: 1,
      createdAt: 1,
    })
    .toArray();

  if (!auctions || auctions.length === 0) return null;

  const prices = auctions
    .map((a) => (a.sort as { price?: number })?.price ?? 0)
    .filter((p) => p > 0)
    .sort((a, b) => a - b);

  if (prices.length === 0) return null;

  const medianPrice = prices[Math.floor(prices.length / 2)];
  const avgPrice = Math.round(
    prices.reduce((s, p) => s + p, 0) / prices.length
  );

  // Extract display make/model from first auction's attributes
  const firstAttrs = (auctions[0].attributes as Array<{ key: string; value: string }>) ?? [];
  const displayMake =
    firstAttrs.find((a) => a.key === "make")?.value ?? make;
  const displayModel =
    firstAttrs.find((a) => a.key === "model")?.value ?? model;

  return {
    make: displayMake,
    model: displayModel,
    count: prices.length,
    medianPrice,
    avgPrice,
    minPrice: prices[0],
    maxPrice: prices[prices.length - 1],
    recentAuctions: auctions.slice(0, 10).map((a) => ({
      _id: a._id.toString(),
      title: (a.title as string) ?? "",
      finalPrice: (a.sort as { price?: number })?.price ?? 0,
      date: (
        (a.sort as { deadline?: Date })?.deadline ??
        (a as { createdAt?: Date }).createdAt ??
        new Date()
      ).toString(),
      imageUrl: (a.image as string) ?? "",
    })),
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseSlug(slug);
  if (!parsed) return { title: "Not Found" };

  const data = await getAuctionData(parsed.make, parsed.model);
  if (!data) return { title: "Not Found" };

  const title = `${data.make} ${data.model} BaT Auction Prices & Results | Velocity Markets`;
  const description = `${data.count} ${data.make} ${data.model} auctions tracked on Bring a Trailer. Median price: $${data.medianPrice.toLocaleString()}. Range: $${data.minPrice.toLocaleString()} – $${data.maxPrice.toLocaleString()}. Predict the next sale price.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://velocity-markets.com/prices/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

function generateJsonLd(data: AuctionPriceData, slug: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${data.make} ${data.model} BaT Auction Prices`,
    description: `Track ${data.make} ${data.model} auction prices on Bring a Trailer`,
    url: `https://velocity-markets.com/prices/${slug}`,
    mainEntity: {
      "@type": "Product",
      name: `${data.make} ${data.model}`,
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "USD",
        lowPrice: data.minPrice,
        highPrice: data.maxPrice,
        offerCount: data.count,
      },
    },
  };
}

export default async function MakeModelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const parsed = parseSlug(slug);
  if (!parsed) notFound();

  const data = await getAuctionData(parsed.make, parsed.model);
  if (!data) notFound();

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateJsonLd(data, slug)),
        }}
      />

      <div className="min-h-screen bg-[#0d0d0d] text-white">
        <div className="container mx-auto max-w-6xl px-4 py-12">
          <h1 className="mb-3 text-3xl font-bold text-white md:text-4xl">
            {data.make} {data.model} — Bring a Trailer Auction Prices
          </h1>
          <p className="mb-10 text-gray-400">
            {data.count} completed auctions tracked. All prices in USD.
          </p>

          {/* Stats grid */}
          <div className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: "Median Price", value: formatCurrency(data.medianPrice) },
              { label: "Average Price", value: formatCurrency(data.avgPrice) },
              { label: "Lowest Sale", value: formatCurrency(data.minPrice) },
              { label: "Highest Sale", value: formatCurrency(data.maxPrice) },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4"
              >
                <div className="mb-1 text-xs uppercase tracking-wide text-gray-500">
                  {label}
                </div>
                <div className="font-mono text-2xl font-bold tabular-nums text-[#FFC553]">
                  {value}
                </div>
              </div>
            ))}
          </div>

          {/* Recent auctions */}
          <h2 className="mb-6 text-2xl font-bold text-white">
            Recent Auctions
          </h2>
          <div className="mb-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.recentAuctions.map((auction) => (
              <div
                key={auction._id}
                className="overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#1a1a1a]"
              >
                {auction.imageUrl && (
                  <div className="aspect-video">
                    <img
                      src={auction.imageUrl}
                      alt={auction.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="mb-1 text-sm font-medium text-white">
                    {auction.title}
                  </div>
                  <div className="font-mono text-lg font-bold text-[#FFC553]">
                    {formatCurrency(auction.finalPrice)}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {new Date(auction.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-8 text-center">
            <h2 className="mb-3 text-xl font-bold text-white">
              Predict the next {data.make} {data.model} auction price
            </h2>
            <p className="mb-6 text-gray-400">
              Think you know what this car will sell for? Compete against other
              enthusiasts.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/price_is_right"
                className="rounded-lg bg-[#01696F] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#0C4E54]"
              >
                Guess the Hammer &rarr;
              </Link>
              <Link
                href="/tournaments"
                className="rounded-lg border border-[#2a2a2a] px-6 py-3 font-semibold text-white transition-colors hover:border-[#01696F]"
              >
                Enter a Tournament &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
