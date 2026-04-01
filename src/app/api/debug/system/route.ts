export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongoose";
import mongoose from "mongoose";

const DAY_MS = 24 * 60 * 60 * 1000;

export async function GET() {
  await connectToDB();
  const db = mongoose.connection.db!;
  const now = new Date();

  // ── 1. Scraper health: check scraper_runs collection ──
  const lastRun = await db
    .collection("scraper_runs")
    .findOne({}, { sort: { startedAt: -1 } });

  const scraperRuns24h = await db
    .collection("scraper_runs")
    .countDocuments({ startedAt: { $gt: new Date(now.getTime() - DAY_MS) } });

  const scraperRuns7d = await db
    .collection("scraper_runs")
    .countDocuments({ startedAt: { $gt: new Date(now.getTime() - 7 * DAY_MS) } });

  // ── 2. Auction freshness ──
  const totalAuctions = await db.collection("auctions").countDocuments();

  // Deadlines relative to now (remember: stored deadline = real - 24h)
  const deadlineFuture = await db.collection("auctions").countDocuments({
    "sort.deadline": { $gt: now },
  });
  const deadlineGt24hAgo = await db.collection("auctions").countDocuments({
    "sort.deadline": { $gt: new Date(now.getTime() - DAY_MS) },
  });
  const deadlineGt48hAgo = await db.collection("auctions").countDocuments({
    "sort.deadline": { $gt: new Date(now.getTime() - 2 * DAY_MS) },
  });
  const deadlineGt7dAgo = await db.collection("auctions").countDocuments({
    "sort.deadline": { $gt: new Date(now.getTime() - 7 * DAY_MS) },
  });

  // Newest 5 deadlines (any make)
  const newestAuctions = await db
    .collection("auctions")
    .find({})
    .sort({ "sort.deadline": -1 })
    .limit(5)
    .project({ title: 1, "sort.deadline": 1, "sort.price": 1, isActive: 1, updatedAt: 1 })
    .toArray();

  // Recently created auctions (by createdAt, not deadline)
  const recentlyCreated = await db
    .collection("auctions")
    .find({ createdAt: { $gt: new Date(now.getTime() - 2 * DAY_MS) } })
    .sort({ createdAt: -1 })
    .limit(5)
    .project({ title: 1, "sort.deadline": 1, createdAt: 1 })
    .toArray();

  // ── 3. Prediction Markets health ──
  const totalMarkets = await db.collection("polygon_markets").countDocuments();
  const activeMarkets = await db
    .collection("polygon_markets")
    .countDocuments({ status: "ACTIVE" });
  const marketsWithFutureClose = await db
    .collection("polygon_markets")
    .countDocuments({ closesAt: { $gt: now } });

  // Market status distribution
  const marketStatusDist = await db
    .collection("polygon_markets")
    .aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])
    .toArray();

  // 5 newest markets
  const newestMarkets = await db
    .collection("polygon_markets")
    .find({})
    .sort({ createdAt: -1 })
    .limit(5)
    .project({ auctionId: 1, status: 1, closesAt: 1, createdAt: 1, title: 1 })
    .toArray();

  // ── 4. Compute real deadlines for display ──
  const formatAuction = (a: any) => ({
    title: a.title?.substring(0, 60),
    rawDeadline: a.sort?.deadline,
    realDeadline: a.sort?.deadline
      ? new Date(new Date(a.sort.deadline).getTime() + DAY_MS).toISOString()
      : null,
    realDeadlineVsNow: a.sort?.deadline
      ? `${((new Date(a.sort.deadline).getTime() + DAY_MS - now.getTime()) / 3600000).toFixed(1)}h`
      : null,
    price: a.sort?.price,
    isActive: a.isActive,
    updatedAt: a.updatedAt,
  });

  // ── 5. Scraper status determination ──
  let scraperStatus: string;
  if (!lastRun) {
    scraperStatus = "NO_RUNS_FOUND — scraper_runs collection is empty";
  } else {
    const hoursSinceRun = (now.getTime() - new Date(lastRun.startedAt).getTime()) / 3600000;
    if (hoursSinceRun < 26) {
      scraperStatus = `HEALTHY — last run ${hoursSinceRun.toFixed(1)}h ago`;
    } else if (hoursSinceRun < 50) {
      scraperStatus = `WARNING — last run ${hoursSinceRun.toFixed(1)}h ago (missed 1+ daily run)`;
    } else {
      scraperStatus = `DOWN — last run ${hoursSinceRun.toFixed(1)}h ago (${(hoursSinceRun / 24).toFixed(0)} days)`;
    }
  }

  return NextResponse.json({
    timestamp: now.toISOString(),

    scraper: {
      status: scraperStatus,
      lastRun: lastRun
        ? {
            startedAt: lastRun.startedAt,
            completedAt: lastRun.completedAt,
            auctionsScraped: lastRun.auctionsScraped ?? lastRun.auctions_scraped,
            errors: lastRun.errors,
            duration: lastRun.durationMs ?? lastRun.duration_ms,
          }
        : null,
      runsLast24h: scraperRuns24h,
      runsLast7d: scraperRuns7d,
    },

    auctions: {
      total: totalAuctions,
      liveOnBaT: deadlineGt24hAgo, // raw deadline > now-24h means real deadline > now
      endingWithin48h: deadlineGt48hAgo - deadlineGt24hAgo,
      endedLast7d: deadlineGt7dAgo - deadlineGt24hAgo,
      rawDeadlineFuture: deadlineFuture,
      newest: newestAuctions.map(formatAuction),
      recentlyCreated: recentlyCreated.map((a: any) => ({
        title: a.title?.substring(0, 60),
        createdAt: a.createdAt,
        rawDeadline: a.sort?.deadline,
      })),
    },

    markets: {
      total: totalMarkets,
      active: activeMarkets,
      closesInFuture: marketsWithFutureClose,
      statusDistribution: Object.fromEntries(
        marketStatusDist.map((s) => [s._id ?? "null", s.count])
      ),
      newest: newestMarkets.map((m) => ({
        auctionId: m.auctionId,
        status: m.status,
        closesAt: m.closesAt,
        closesAtVsNow: m.closesAt
          ? `${((new Date(m.closesAt).getTime() - now.getTime()) / 3600000).toFixed(1)}h`
          : null,
        createdAt: m.createdAt,
        title: m.title?.substring(0, 40),
      })),
    },

    diagnosis: [
      deadlineGt24hAgo === 0 &&
        "⚠️ ZERO auctions with live deadlines — scraper may not be running",
      activeMarkets === 0 &&
        "⚠️ ZERO active prediction markets — run /api/debug/fix-markets to reactivate",
      scraperRuns24h === 0 &&
        "⚠️ No scraper runs in last 24h — check PM2 on EC2",
      totalAuctions > 0 && deadlineFuture === 0 && deadlineGt24hAgo > 0 &&
        "ℹ️ No raw future deadlines but some within 24h — these are live auctions (offset -1 day)",
    ].filter(Boolean),
  });
}
