import connectToDB from "@/lib/mongoose";
import Auctions from "@/models/auction.model";
import { DailySlate } from "@/app/components/DailySlate";

export const dynamic = "force-dynamic";

const QUALIFYING_MAKES = [
  "ferrari", "lamborghini", "bugatti", "mclaren", "porsche",
  "corvette", "camaro", "mustang", "mercedes", "bmw",
  "alfa romeo", "fiat", "volvo", "pagani", "cobra",
];

async function getDailyAuctions() {
  try {
    await connectToDB();
    const now = new Date();
    // Scraper offsets sort.deadline by -1 day, so look back 24h to catch live auctions
    const lookback = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const auctions = await Auctions.find({
      "sort.deadline": { $gt: lookback },
      $or: QUALIFYING_MAKES.map((make) => ({
        title: { $regex: make, $options: "i" },
      })),
    })
      .sort({ "sort.deadline": 1 })
      .lean()
      .exec();
    return JSON.parse(JSON.stringify(auctions));
  } catch (error) {
    console.error("Error fetching daily auctions:", error);
    return [];
  }
}

export default async function DailyPage() {
  const auctions = await getDailyAuctions();

  return (
    <main className="min-h-screen bg-[#0A0A1A] px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-2 text-3xl font-bold text-white">{"Today's Slate"}</h1>
        <p className="mb-8 text-gray-400">Auctions closing in the next 24 hours</p>
        <DailySlate auctions={auctions} />
      </div>
    </main>
  );
}
