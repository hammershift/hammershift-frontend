import connectToDB from "@/lib/mongoose";
import Auctions from "@/models/auction.model";
import { DailySlate } from "@/app/components/DailySlate";

export const dynamic = "force-dynamic";

async function getDailyAuctions() {
  try {
    await connectToDB();
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const auctions = await Auctions.find({
      isActive: true,
      "sort.deadline": { $gt: now, $lt: in24h },
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
