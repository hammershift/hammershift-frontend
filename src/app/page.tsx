// Force dynamic rendering - page uses session/headers and live DB data
export const dynamic = 'force-dynamic';

import Link from "next/link";
import { Suspense } from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Auctions from "@/models/auction.model";
import { Predictions } from "@/models/predictions.model";
import { startOfWeek } from "date-fns";
import "./styles/app.css";
import ClientHomepageTracker from "./components/ClientHomepageTracker";
import connectToDB from "@/lib/mongoose";
import mongoose from "mongoose";
import DailyHammer from "./components/DailyHammer";
import LiveTicker from "./components/LiveTicker";
import TrendingMarketsSection from "./components/TrendingMarketsSection";
import MarketCardSkeleton from "./components/MarketCardSkeleton";
import AuthorityBar from "./components/AuthorityBar";
import TopPredictors from "./components/TopPredictors";
import FeaturedAuctionHero from "./components/FeaturedAuctionHero";
import { Activity, BarChart2, DollarSign, Car } from "lucide-react";
import AnimatedCounter from "./components/AnimatedCounter";
import WelcomeBanner from "./components/WelcomeBanner";
import HomepageSidebar from "./components/HomepageSidebar";
import HeroCarousel from "./components/HeroCarousel";

// Server Component - Fetch data on server
async function getHomePageData() {
  try {
    await connectToDB();

    // Query live auctions directly from shared MongoDB
    const db = mongoose.connection.db;
    if (!db) throw new Error("MongoDB connection not established");
    const now = new Date();
    const weekStart = startOfWeek(now);
    const QUALIFYING_MAKES_REGEX = /ferrari|lamborghini|corvette|mercedes|bmw|maserati|alfa romeo|mustang|porsche|camaro/i;

    // Run ALL independent queries in parallel
    const [
      liveAuctions,
      totalMarkets,
      totalPredictions,
      totalVolumeResult,
      carsTracked,
      leaderboard,
      dailyHammerAuction,
      heroMarkets,
    ] = await Promise.all([
      // Live auctions
      Auctions.find({
        isActive: true,
        "sort.deadline": { $gt: now },
      })
        .sort({ "sort.deadline": 1 })
        .limit(12)
        .lean() as Promise<any[]>,

      // Cumulative stats
      db.collection("polygon_markets").countDocuments(),
      db.collection("predictions").countDocuments(),
      db.collection("polygon_markets").aggregate([
        { $group: { _id: null, total: { $sum: "$totalVolume" } } },
      ]).toArray().then(r => (r[0]?.total ?? 0) / 100),
      db.collection("auctions").countDocuments(),

      // Leaderboard (weekly top 10)
      Predictions.aggregate([
        {
          $match: {
            createdAt: { $gte: weekStart },
            score: { $exists: true, $ne: null }
          }
        },
        {
          $group: {
            _id: '$user.userId',
            total_score: { $sum: '$score' },
            predictions_count: { $sum: 1 },
            username: { $first: '$user.username' }
          }
        },
        { $sort: { total_score: -1 } },
        { $limit: 10 }
      ]),

      // Daily Hammer
      db.collection('auctions').findOne({
        isActive: true,
        'sort.deadline': { $gt: now },
        title: { $regex: QUALIFYING_MAKES_REGEX },
      }, { projection: { _id: 1, auction_id: 1, title: 1, image: 1, 'sort.deadline': 1 } }),

      // Hero carousel markets
      db.collection('polygon_markets')
        .find({ status: 'ACTIVE' })
        .sort({ totalVolume: -1 })
        .limit(5)
        .toArray(),
    ]);

    // Featured auction = first (soonest deadline) from live list
    const featuredAuction = liveAuctions[0] ?? null;

    // Featured car hero = first auction with a deadline within 48 hours
    const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const featuredCarJson = liveAuctions.find((a: any) => {
      const d = a.sort?.deadline ? new Date(a.sort.deadline) : null;
      return d && d > now && d < in48h;
    }) ?? null;

    const cumulativeStats = {
      totalMarkets,
      totalPredictions,
      totalVolume: totalVolumeResult,
      carsTracked,
    };

    const dailyHammer = dailyHammerAuction ? {
      auctionId: (dailyHammerAuction.auction_id ?? dailyHammerAuction._id.toString()) as string,
      title: dailyHammerAuction.title as string,
      image: (dailyHammerAuction.image ?? null) as string | null,
      deadline: (dailyHammerAuction.sort as any)?.deadline instanceof Date
        ? ((dailyHammerAuction.sort as any).deadline as Date).toISOString()
        : null,
    } : null;

    // Enrich hero markets with auction data (single batch query)
    const heroAuctionIds = heroMarkets.map((m: any) => m.auctionId).filter(Boolean);
    const heroObjectIds: mongoose.Types.ObjectId[] = [];
    for (const id of heroAuctionIds) {
      try { heroObjectIds.push(new mongoose.Types.ObjectId(id)); } catch {}
    }
    const heroAuctions = await db.collection('auctions').find({
      $or: [
        { auction_id: { $in: heroAuctionIds } },
        ...(heroObjectIds.length ? [{ _id: { $in: heroObjectIds } }] : []),
      ],
    }).project({ title: 1, image: 1, sort: 1, auction_id: 1 }).toArray();

    const heroAuctionMap = new Map<string, any>();
    for (const a of heroAuctions) {
      if (a.auction_id) heroAuctionMap.set(a.auction_id, a);
      heroAuctionMap.set(a._id.toString(), a);
    }

    const heroMarketsEnriched = heroMarkets.map((m: any) => {
      const auction = heroAuctionMap.get(m.auctionId);
      return {
        _id: m._id.toString(),
        question: m.question,
        yesPrice: m.yesPrice ?? 0.5,
        noPrice: m.noPrice ?? 0.5,
        totalVolume: m.totalVolume ?? 0,
        auction: {
          title: auction?.title ?? null,
          image: auction?.image ?? null,
          deadline: auction?.sort?.deadline ? new Date(auction.sort.deadline).toISOString() : null,
        },
      };
    });

    return {
      featuredAuction: featuredAuction ? JSON.parse(JSON.stringify(featuredAuction)) : null,
      featuredCar: featuredCarJson,
      liveAuctions: liveAuctions ? JSON.parse(JSON.stringify(liveAuctions)) : [],
      leaderboard: leaderboard ? JSON.parse(JSON.stringify(leaderboard)) : [],
      cumulativeStats,
      dailyHammer,
      heroMarkets: heroMarketsEnriched,
    };
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    return {
      featuredAuction: null,
      featuredCar: null,
      liveAuctions: [],
      leaderboard: [],
      cumulativeStats: {
        totalMarkets: 0,
        totalPredictions: 0,
        totalVolume: 0,
        carsTracked: 0,
      },
      dailyHammer: null,
      heroMarkets: [],
    };
  }
}

export default async function HomePage() {
  let featuredAuction = null;
  let dailyHammer: { auctionId: string; title: string; image: string | null; deadline: string | null } | null = null;
  let leaderboard: Array<{ _id: string; username: string; total_score: number; predictions_count: number }> = [];
  let cumulativeStats = { totalMarkets: 0, totalPredictions: 0, totalVolume: 0, carsTracked: 0 };
  let heroMarkets: Array<{ _id: string; question: string; yesPrice: number; noPrice: number; totalVolume: number; auction: { title: string | null; image: string | null; deadline: string | null } }> = [];
  let error = null;

  try {
    await getServerSession(authOptions);
  } catch (err: any) {
    console.error('❌ Error getting session:', err);
  }

  try {
    const data = await getHomePageData();
    featuredAuction = data.featuredAuction;
    dailyHammer = data.dailyHammer;
    leaderboard = data.leaderboard ?? [];
    cumulativeStats = data.cumulativeStats;
    heroMarkets = data.heroMarkets ?? [];
  } catch (err: any) {
    console.error('❌ Error fetching homepage data:', err);
    error = `Data error: ${err.message}`;
  }

  // If critical error, show error page
  if (error && !featuredAuction && !dailyHammer) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A1A] p-4">
        <div className="max-w-2xl rounded-lg border border-[#E94560]/30 bg-[#16181f] p-8">
          <h1 className="mb-4 text-3xl font-bold text-[#E94560]">Service Temporarily Unavailable</h1>
          <p className="mb-4 text-gray-300">
            We&apos;re experiencing technical difficulties. Our team has been notified and is working to resolve the issue.
          </p>
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-300">
              Technical Details
            </summary>
            <pre className="mt-2 overflow-auto rounded bg-[#0A0A1A] p-4 text-xs text-gray-400">
              {error}
            </pre>
          </details>
          <p className="mt-6 text-sm text-gray-400">
            Try visiting <a href="/api/health" className="text-[#00D4AA] underline">/api/health</a> for diagnostics
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <ClientHomepageTracker featuredAuctionId={featuredAuction?._id?.toString()} />
      <WelcomeBanner />

      {/* Live Activity Ticker */}
      <LiveTicker />

      {/* Hero — Featured Market Carousel */}
      <HeroCarousel markets={heroMarkets} />

      {/* Platform Stats Bar */}
      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-4 pb-10" aria-label="Platform statistics">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {/* Markets Listed */}
          <div className="flex items-center gap-4 rounded-xl border border-white/[0.08] bg-[#16181f] px-5 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E94560]/10">
              <BarChart2 className="h-5 w-5 text-[#E94560]" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                <AnimatedCounter end={cumulativeStats.totalMarkets} format="number" />
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Markets Listed</p>
            </div>
          </div>

          {/* Total Predictions */}
          <div className="flex items-center gap-4 rounded-xl border border-white/[0.08] bg-[#16181f] px-5 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#00D4AA]/10">
              <Activity className="h-5 w-5 text-[#00D4AA]" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                <AnimatedCounter end={cumulativeStats.totalPredictions} format="abbreviated" />
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Total Predictions</p>
            </div>
          </div>

          {/* Total Volume */}
          <div className="flex items-center gap-4 rounded-xl border border-white/[0.08] bg-[#16181f] px-5 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FFB547]/10">
              <DollarSign className="h-5 w-5 text-[#FFB547]" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                <AnimatedCounter end={cumulativeStats.totalVolume} format="currency" />
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Total Volume</p>
            </div>
          </div>

          {/* Cars Tracked */}
          <div className="flex items-center gap-4 rounded-xl border border-white/[0.08] bg-[#16181f] px-5 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#00D4AA]/10">
              <Car className="h-5 w-5 text-[#00D4AA]" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                <AnimatedCounter end={cumulativeStats.carsTracked} format="number" />
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Cars Tracked</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main content + Sidebar grid */}
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* Left column - main content */}
          <div className="space-y-8">
            {/* Featured Auction Hero */}
            {featuredAuction && <FeaturedAuctionHero auction={featuredAuction} />}

            {/* Trending Markets */}
            <section>
              <h2 className="mb-6 text-lg font-semibold text-gray-300">Trending Markets</h2>
              <Suspense
                fallback={
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <MarketCardSkeleton key={i} />
                    ))}
                  </div>
                }
              >
                <TrendingMarketsSection />
              </Suspense>
            </section>

            {/* Top Predictors This Week */}
            <TopPredictors leaderboard={leaderboard} />

            {/* Daily Hammer Widget */}
            <DailyHammer auction={dailyHammer} />
          </div>

          {/* Right column - sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-20">
              <HomepageSidebar />
            </div>
          </div>
        </div>
      </div>

      {/* Authority Bar */}
      <AuthorityBar />

      {/* Newsletter */}
      <section className="py-8">
        <iframe
          src="https://embeds.beehiiv.com/93359bc7-769f-4ce6-bb3d-3fbfdc15a4ff"
          data-test-id="beehiiv-embed"
          width="100%"
          height="320"
          frameBorder="0"
          scrolling="no"
          style={{ margin: 0, backgroundColor: "transparent" }}
        ></iframe>
      </section>
    </div>
  );
}
