export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongoose";
import Auctions from "@/models/auction.model";

const QUALIFYING_MAKES = [
  "ferrari", "lamborghini", "bugatti", "mclaren", "porsche",
  "corvette", "camaro", "mustang", "mercedes", "bmw",
  "alfa romeo", "fiat", "volvo", "pagani", "cobra",
];

export async function GET() {
  await connectToDB();
  const now = new Date();
  const lookback24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const lookback7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const makeFilter = {
    $or: QUALIFYING_MAKES.map((make) => ({
      title: { $regex: make, $options: "i" },
    })),
  };

  const [
    totalAuctions,
    totalQualifying,
    deadline24h,
    deadline7d,
    deadlineFuture,
    newestDeadlines,
    sampleTitles,
  ] = await Promise.all([
    // Total auctions in DB
    Auctions.countDocuments(),
    // Total matching qualifying makes (any deadline)
    Auctions.countDocuments(makeFilter),
    // Qualifying with deadline > 24h ago (current query)
    Auctions.countDocuments({
      "sort.deadline": { $gt: lookback24h },
      ...makeFilter,
    }),
    // Qualifying with deadline > 7d ago
    Auctions.countDocuments({
      "sort.deadline": { $gt: lookback7d },
      ...makeFilter,
    }),
    // Qualifying with deadline in the future
    Auctions.countDocuments({
      "sort.deadline": { $gt: now },
      ...makeFilter,
    }),
    // 10 most recent deadlines (any make)
    Auctions.find({})
      .sort({ "sort.deadline": -1 })
      .limit(10)
      .select("title sort.deadline isActive")
      .lean(),
    // 10 most recent qualifying deadlines
    Auctions.find(makeFilter)
      .sort({ "sort.deadline": -1 })
      .limit(10)
      .select("title sort.deadline isActive")
      .lean(),
  ]);

  return NextResponse.json({
    now: now.toISOString(),
    lookback24h: lookback24h.toISOString(),
    counts: {
      totalAuctions,
      totalQualifying,
      qualifyingDeadlineGt24hAgo: deadline24h,
      qualifyingDeadlineGt7dAgo: deadline7d,
      qualifyingDeadlineFuture: deadlineFuture,
    },
    newestDeadlines: newestDeadlines.map((a: any) => ({
      title: a.title?.substring(0, 60),
      deadline: a.sort?.deadline,
      isActive: a.isActive,
    })),
    newestQualifyingDeadlines: sampleTitles.map((a: any) => ({
      title: a.title?.substring(0, 60),
      deadline: a.sort?.deadline,
      isActive: a.isActive,
    })),
  });
}
