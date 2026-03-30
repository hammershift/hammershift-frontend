import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import connectToDB from "@/lib/mongoose";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Revalidate hourly

interface WeeklyAuction {
  _id: string;
  title: string;
  image: string;
  price: number;
}

function parseWeekSlug(slug: string): Date | null {
  const match = slug.match(/^bat-results-(\d{4}-\d{2}-\d{2})$/);
  if (!match) return null;
  const date = new Date(match[1] + "T00:00:00Z");
  if (isNaN(date.getTime())) return null;
  return date;
}

async function getWeeklyRecapData(
  weekStart: Date
): Promise<WeeklyAuction[] | null> {
  await connectToDB();

  const db = mongoose.connection.db;
  if (!db) return null;

  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Find auctions that ended during this week with a sold price
  const auctions = await db
    .collection("auctions")
    .find({
      "sort.deadline": { $gte: weekStart, $lt: weekEnd },
      "sort.price": { $gt: 0 },
      isActive: false,
    })
    .sort({ "sort.price": -1 })
    .limit(50)
    .project({ title: 1, image: 1, "sort.price": 1 })
    .toArray();

  if (!auctions || auctions.length === 0) return null;

  return auctions.map((a) => ({
    _id: a._id.toString(),
    title: (a.title as string) ?? "",
    image: (a.image as string) ?? "",
    price: (a.sort as { price?: number })?.price ?? 0,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const weekStart = parseWeekSlug(slug);
  if (!weekStart) return { title: "Not Found" };

  const title = `BaT Auction Results — Week of ${weekStart.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} | Velocity Markets`;
  const description =
    "Weekly Bring a Trailer auction results recap. Top sales, surprise prices, and standout cars.";

  return {
    title,
    description,
    openGraph: { title, description, type: "article" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function BlogWeekPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const weekStart = parseWeekSlug(slug);
  if (!weekStart) notFound();

  const auctions = await getWeeklyRecapData(weekStart);
  if (!auctions || auctions.length === 0) notFound();

  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);

  const totalVolume = auctions.reduce((sum, a) => sum + a.price, 0);
  const biggestSale = auctions[0];
  const top5 = auctions.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-3 text-3xl font-bold text-white md:text-4xl">
          BaT Auction Results — Week of {formatDate(weekStart)}
        </h1>
        <p className="mb-10 text-gray-400">
          {formatDate(weekStart)} – {formatDate(weekEnd)} &middot;{" "}
          {auctions.length} auctions closed
        </p>

        {/* Summary stats */}
        <div className="mb-12 grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4 text-center">
            <div className="mb-1 text-xs uppercase tracking-wide text-gray-500">
              Total Auctions
            </div>
            <div className="text-2xl font-bold text-white">
              {auctions.length}
            </div>
          </div>
          <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4 text-center">
            <div className="mb-1 text-xs uppercase tracking-wide text-gray-500">
              Total Volume
            </div>
            <div className="font-mono text-2xl font-bold text-[#FFC553]">
              {formatCurrency(totalVolume)}
            </div>
          </div>
          <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4 text-center">
            <div className="mb-1 text-xs uppercase tracking-wide text-gray-500">
              Biggest Sale
            </div>
            <div className="font-mono text-2xl font-bold text-[#FFC553]">
              {formatCurrency(biggestSale.price)}
            </div>
          </div>
        </div>

        {/* Top 5 sales */}
        <h2 className="mb-6 text-2xl font-bold text-white">
          Top 5 Sales This Week
        </h2>
        <div className="mb-12 space-y-4">
          {top5.map((auction, index) => (
            <div
              key={auction._id}
              className="flex items-center gap-4 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4"
            >
              <div className="w-8 text-center font-mono text-3xl font-bold text-[#FFC553]">
                {index + 1}
              </div>
              {auction.image && (
                <img
                  src={auction.image}
                  alt={auction.title}
                  className="h-16 w-24 rounded-lg object-cover"
                  loading="lazy"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold text-white">
                  {auction.title}
                </div>
              </div>
              <div className="font-mono text-xl font-bold text-[#FFC553]">
                {formatCurrency(auction.price)}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-8 text-center">
          <h2 className="mb-3 text-xl font-bold text-white">
            Predict next week&apos;s results
          </h2>
          <p className="mb-6 text-gray-400">
            Think you can spot the next big sale? Enter a tournament or guess
            the hammer price.
          </p>
          <Link
            href="/tournaments"
            className="inline-block rounded-lg bg-[#01696F] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#0C4E54]"
          >
            Enter This Week&apos;s Tournament &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
