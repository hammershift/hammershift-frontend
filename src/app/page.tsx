// Force dynamic rendering - page uses session/headers and live DB data
export const dynamic = 'force-dynamic';

import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Auctions from "@/models/auction.model";
import { Predictions } from "@/models/predictions.model";
import Users from "@/models/user.model";
import { startOfWeek, startOfDay, subDays } from "date-fns";
import "./styles/app.css";
import { ArrowRight } from "lucide-react";
import ClientHomepageTracker from "./components/ClientHomepageTracker";
import connectToDB from "@/lib/mongoose";
import mongoose from "mongoose";
import DailyHammer from "./components/DailyHammer";
import LiveTicker from "./components/LiveTicker";
import TrendingMarketsSection from "./components/TrendingMarketsSection";
import AuthorityBar from "./components/AuthorityBar";

// Format currency
const USDollar = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

// Server Component - Fetch data on server
async function getHomePageData() {
  try {
    await connectToDB();

    // Query live auctions directly from shared MongoDB
    const now = new Date();
    const liveAuctions: any[] = await Auctions.find({
      isActive: true,
      "sort.deadline": { $gt: now },
    })
      .sort({ "sort.deadline": 1 })
      .limit(12)
      .lean();

    // Featured auction = first (soonest deadline) from live list
    const featuredAuction = liveAuctions[0] ?? null;

    // Featured car hero = first auction with a deadline within 48 hours
    const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const featuredCarJson = liveAuctions.find((a: any) => {
      const d = a.sort?.deadline ? new Date(a.sort.deadline) : null;
      return d && d > now && d < in48h;
    }) ?? null;

    // Activity stats
    const predictions_today = await Predictions.countDocuments({
      createdAt: { $gte: startOfDay(new Date()) }
    });

    const activeAuctionsValue = await Auctions.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$sort.price' } }}
    ]);

    const active_players = await Users.countDocuments({
      last_prediction_at: { $gte: subDays(new Date(), 7) }
    });

    // Leaderboard (weekly top 10)
    const weekStart = startOfWeek(new Date());
    const leaderboard = await Predictions.aggregate([
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
    ]);

    const activityStats = {
      predictions_today,
      active_auctions_value: activeAuctionsValue[0]?.total || 0,
      active_players
    };

    // Fetch one qualifying high-profile car for Daily Hammer widget
    const QUALIFYING_MAKES_REGEX = /ferrari|lamborghini|corvette|mercedes|bmw|maserati|alfa romeo|mustang|porsche|camaro/i;
    const db = mongoose.connection.db!;
    const dailyHammerAuction = await db.collection('auctions').findOne({
      isActive: true,
      'sort.deadline': { $gt: now },
      title: { $regex: QUALIFYING_MAKES_REGEX },
    }, { projection: { _id: 1, auction_id: 1, title: 1, image: 1, 'sort.deadline': 1 } });

    const dailyHammer = dailyHammerAuction ? {
      auctionId: (dailyHammerAuction.auction_id ?? dailyHammerAuction._id.toString()) as string,
      title: dailyHammerAuction.title as string,
      image: (dailyHammerAuction.image ?? null) as string | null,
      deadline: (dailyHammerAuction.sort as any)?.deadline instanceof Date
        ? ((dailyHammerAuction.sort as any).deadline as Date).toISOString()
        : null,
    } : null;

    return {
      featuredAuction: featuredAuction ? JSON.parse(JSON.stringify(featuredAuction)) : null,
      featuredCar: featuredCarJson,
      liveAuctions: liveAuctions ? JSON.parse(JSON.stringify(liveAuctions)) : [],
      leaderboard: leaderboard ? JSON.parse(JSON.stringify(leaderboard)) : [],
      activityStats,
      dailyHammer,
    };
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    return {
      featuredAuction: null,
      featuredCar: null,
      liveAuctions: [],
      leaderboard: [],
      activityStats: {
        predictions_today: 0,
        active_auctions_value: 0,
        active_players: 0
      },
      dailyHammer: null,
    };
  }
}

export default async function HomePage() {
  let featuredAuction = null;
  let dailyHammer: { auctionId: string; title: string; image: string | null; deadline: string | null } | null = null;
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
  } catch (err: any) {
    console.error('❌ Error fetching homepage data:', err);
    error = `Data error: ${err.message}`;
  }

  // If critical error, show error page
  if (error && !featuredAuction && !dailyHammer) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A1A] p-4">
        <div className="max-w-2xl rounded-lg border border-[#E94560]/30 bg-[#13202D] p-8">
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

      {/* Live Activity Ticker */}
      <LiveTicker />

      {/* Hero — 45vh exchange aesthetic */}
      <section className="relative flex h-[45vh] items-center justify-center overflow-hidden bg-[#0F172A]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1580274455191-1c62238fa333?auto=format&fit=crop&w=1920&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/40 via-transparent to-[#0A0A1A]" />
        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <h1 className="mb-3 text-5xl font-bold tracking-tight text-white md:text-6xl">
            Trade on the Hammer Price.
          </h1>
          <p className="text-lg text-gray-300 md:text-xl">
            The prediction market for collector car auctions.
          </p>
          <Link
            href="/markets"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#E94560] px-6 py-3 text-sm font-semibold text-white hover:bg-[#E94560]/90 transition-colors"
          >
            Browse Markets <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Trending Markets — overlaps hero bottom */}
      <section className="relative z-10 -mt-12 mx-auto w-full max-w-6xl px-4 pb-16">
        <h2 className="mb-6 text-lg font-semibold text-gray-300">Trending Markets</h2>
        <TrendingMarketsSection />
      </section>

      {/* Daily Hammer Widget */}
      <DailyHammer auction={dailyHammer} />

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
