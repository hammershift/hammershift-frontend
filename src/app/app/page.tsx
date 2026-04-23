// Force dynamic rendering - page uses session/headers and live DB data
export const dynamic = "force-dynamic";

import Link from "next/link";
import { Suspense } from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Auctions from "@/models/auction.model";
import Tournaments from "@/models/tournament.model";
import Users from "@/models/user.model";
import { Predictions } from "@/models/predictions.model";
import { startOfWeek } from "date-fns";
import "../styles/app.css";
import ClientHomepageTracker from "../components/ClientHomepageTracker";
import InvitedCelebrationModal from "../components/waitlist/InvitedCelebrationModal";
import connectToDB from "@/lib/mongoose";
import mongoose from "mongoose";
import LiveTicker from "../components/LiveTicker";
import TrendingMarketsSection from "../components/TrendingMarketsSection";
import MarketCardSkeleton from "../components/MarketCardSkeleton";
import { ModeCard } from "../components/ModeCard";
import { NewsletterForm } from "../components/NewsletterForm";
import CountdownTimer from "../components/CountdownTimer";
import AnimatedCounter from "../components/AnimatedCounter";
import { Button } from "../components/ui/button";
import { Trophy, Clock, DollarSign, Users as UsersIcon, Hash } from "lucide-react";
import JsonLd from "../components/JsonLd";

interface HomepageData {
  activeTournaments: number;
  weeklyPrizePool: number;
  totalPlayers: number;
  userRank: number | null;
  featuredTournament: {
    _id: string;
    name: string;
    description?: string;
    type?: string;
    startTime: string;
    endTime: string;
    calculatedPrizePool: number;
    buyInFee: number;
    users: { userId: string }[];
    auction_ids: string[];
    isActive: boolean;
  } | null;
  featuredAuctions: Array<{
    _id: string;
    title: string;
    image: string;
    sort?: { deadline?: string; price?: number; bids?: number };
    prediction_count?: number;
  }>;
  trendingAuctions: Array<{
    _id: string;
    title: string;
    image: string;
    sort?: { deadline?: string; price?: number; bids?: number };
    prediction_count?: number;
  }>;
  recentWinners: Array<{
    username: string;
    prize: number;
    tournamentName: string;
  }>;
  recentSales: Array<{
    title: string;
    price: number;
    soldDate: string | null;
    realDeadline: string | null;
    isLive: boolean;
  }>;
  cumulativeStats: {
    carsTracked: number;
    totalPredictions: number;
    totalVolume: number;
    totalMarkets: number;
  };
}

function formatCurrency(amount: number): string {
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  }
  return `$${amount.toLocaleString()}`;
}

async function getHomepageData(userId: string | null): Promise<HomepageData> {
  await connectToDB();

  const db = mongoose.connection.db;
  if (!db) throw new Error("MongoDB connection not established");

  const now = new Date();
  const weekStart = startOfWeek(now);

  const [
    activeTournaments,
    weeklyTournaments,
    totalPlayers,
    featuredTournamentCandidates,
    trendingAuctions,
    recentWinnerTournaments,
    userRankResult,
    recentSalesRaw,
    carsTracked,
    totalPredictions,
    totalMarkets,
    totalVolumeResult,
  ] = await Promise.all([
    // Active tournament count
    Tournaments.countDocuments({ isActive: true }),

    // Weekly prize pool: sum of active tournaments this week
    Tournaments.find({
      isActive: true,
      startTime: { $gte: weekStart },
    })
      .select("calculatedPrizePool buyInFee users")
      .lean(),

    // Total players (fast estimate)
    Users.estimatedDocumentCount(),

    // Featured tournament: rank-then-pick. We fetch the pool of active
    // tournaments that haven't ended and score them in JS so a brand-new
    // empty free_play tournament (which naturally has buyInFee=0 and
    // users.length=0) doesn't trump a live paid tournament with real
    // participants. Scoring below favors live > upcoming, and engagement
    // over empty.
    Tournaments.find({
      isActive: true,
      endTime: { $gt: now },
    })
      .sort({ startTime: 1 })
      .limit(20)
      .lean(),

    // Trending auctions: qualifying makes, still live (scraper offsets deadline by -1 day)
    Auctions.find({
      "sort.deadline": { $gt: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
      $or: [
        ...[
          "ferrari", "lamborghini", "bugatti", "mclaren", "porsche",
          "corvette", "camaro", "mustang", "mercedes", "bmw",
          "alfa romeo", "fiat", "volvo", "pagani", "cobra",
        ].map((make) => ({ title: { $regex: make, $options: "i" } })),
      ],
    })
      .sort({ prediction_count: -1, "sort.deadline": 1 })
      .limit(8)
      .lean() as Promise<any[]>,

    // Recent winners: tournaments with haveWinners=true, sorted by most recent
    db
      .collection("tournaments")
      .find({ haveWinners: true })
      .sort({ endTime: -1 })
      .limit(5)
      .project({ name: 1, winners: 1 })
      .toArray(),

    // User rank (if logged in)
    userId
      ? Predictions.aggregate([
          {
            $match: {
              createdAt: { $gte: weekStart },
              score: { $exists: true, $ne: null },
            },
          },
          {
            $group: {
              _id: "$user.userId",
              total_score: { $sum: "$score" },
            },
          },
          { $sort: { total_score: -1 } },
          {
            $group: {
              _id: null,
              rankings: { $push: "$_id" },
            },
          },
          {
            $project: {
              rank: {
                $add: [{ $indexOfArray: ["$rankings", userId] }, 1],
              },
            },
          },
        ])
      : Promise.resolve([]),

    // Recent sales for ticker
    db
      .collection('auctions')
      .find({ isActive: false, 'sort.price': { $gt: 0 } })
      .sort({ 'sort.deadline': -1 })
      .limit(20)
      .project({ title: 1, 'sort.price': 1, 'sort.deadline': 1 })
      .toArray(),

    // Cumulative stats: cars tracked
    db.collection('auctions').countDocuments(),

    // Cumulative stats: total predictions
    db.collection('predictions').countDocuments(),

    // Cumulative stats: total markets
    db.collection('polygon_markets').countDocuments(),

    // Cumulative stats: total volume
    db.collection('polygon_markets').aggregate([
      { $group: { _id: null, total: { $sum: '$totalVolume' } } },
    ]).toArray(),
  ]);

  // Rank featured tournament candidates:
  //   live + engaged   → 2000+ (beats everything)
  //   live + empty     → 1000
  //   upcoming+engaged →  500 + users
  //   upcoming+empty   →  100
  // Ties broken by startTime asc (sooner is better).
  const featuredTournament = (featuredTournamentCandidates as any[])
    .map((t) => {
      const start = new Date(t.startTime).getTime();
      const end = new Date(t.endTime).getTime();
      const isLive = start <= now.getTime() && end > now.getTime();
      const userCount = t.users?.length || 0;
      const hasPool = (t.calculatedPrizePool || 0) > 0 || t.buyInFee > 0;
      let score = isLive ? 1000 : 100;
      if (userCount > 0) score += 1000 + Math.min(userCount, 50) * 10;
      if (hasPool) score += 200;
      return { t, score, start };
    })
    .sort((a, b) => b.score - a.score || a.start - b.start)[0]?.t ?? null;

  // Calculate weekly prize pool
  const weeklyPrizePool = weeklyTournaments.reduce((sum, t) => {
    const pool =
      (t as any).calculatedPrizePool ||
      ((t as any).buyInFee || 0) * ((t as any).users?.length || 0);
    return sum + pool;
  }, 0);

  // Extract user rank
  const userRank =
    userRankResult.length > 0 && userRankResult[0].rank > 0
      ? userRankResult[0].rank
      : null;

  // Fetch featured tournament auctions
  let featuredAuctions: any[] = [];
  if (featuredTournament && (featuredTournament as any).auction_ids?.length) {
    const auctionIds = (featuredTournament as any).auction_ids.slice(0, 6);
    const objectIds: mongoose.Types.ObjectId[] = [];
    for (const id of auctionIds) {
      try {
        objectIds.push(new mongoose.Types.ObjectId(id));
      } catch {}
    }
    if (objectIds.length) {
      featuredAuctions = await Auctions.find({ _id: { $in: objectIds } })
        .select("title image sort prediction_count")
        .lean();
    }
  }

  // Extract recent winners
  const recentWinners: Array<{
    username: string;
    prize: number;
    tournamentName: string;
  }> = [];
  for (const t of recentWinnerTournaments) {
    const winners = (t.winners as any[]) ?? [];
    for (const w of winners.slice(0, 2)) {
      if (w.prize > 0) {
        recentWinners.push({
          username: w.username ?? "Player",
          prize: w.prize,
          tournamentName: t.name as string,
        });
      }
    }
    if (recentWinners.length >= 5) break;
  }

  const DAY_MS = 24 * 60 * 60 * 1000;
  const recentSales = recentSalesRaw.map((a: any) => {
    const rawDeadline = a.sort?.deadline ? new Date(a.sort.deadline).getTime() : 0;
    const realDeadline = rawDeadline + DAY_MS;
    return {
      title: a.title ?? 'Unknown',
      price: a.sort?.price ?? 0,
      soldDate: rawDeadline ? new Date(rawDeadline).toISOString() : null,
      realDeadline: rawDeadline ? new Date(realDeadline).toISOString() : null,
      isLive: realDeadline > Date.now(),
    };
  });

  return {
    activeTournaments,
    weeklyPrizePool,
    totalPlayers,
    userRank,
    featuredTournament: featuredTournament
      ? JSON.parse(JSON.stringify(featuredTournament))
      : null,
    featuredAuctions: JSON.parse(JSON.stringify(featuredAuctions)),
    trendingAuctions: JSON.parse(JSON.stringify(trendingAuctions)),
    recentWinners,
    recentSales,
    cumulativeStats: {
      carsTracked,
      totalPredictions,
      totalMarkets,
      totalVolume: totalVolumeResult[0]?.total ?? 0,
    },
  };
}

export default async function HomePage() {
  let data: HomepageData = {
    activeTournaments: 0,
    weeklyPrizePool: 0,
    totalPlayers: 0,
    userRank: null,
    featuredTournament: null,
    featuredAuctions: [],
    trendingAuctions: [],
    recentWinners: [],
    recentSales: [],
    cumulativeStats: { carsTracked: 0, totalPredictions: 0, totalVolume: 0, totalMarkets: 0 },
  };
  let error: string | null = null;

  let sessionUserId: string | null = null;
  try {
    const session = await getServerSession(authOptions);
    sessionUserId = (session?.user as any)?.id ?? null;
  } catch {}

  try {
    data = await getHomepageData(sessionUserId);
  } catch (err: any) {
    console.error("Error fetching homepage data:", err);
    error = err.message;
  }

  if (error && !data.featuredTournament && data.trendingAuctions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A1A] p-4">
        <div className="max-w-2xl rounded-lg border border-[#E94560]/30 bg-[#16181f] p-8">
          <h1 className="mb-4 text-3xl font-bold text-[#E94560]">
            Service Temporarily Unavailable
          </h1>
          <p className="mb-4 text-gray-300">
            We&apos;re experiencing technical difficulties. Our team has been
            notified and is working to resolve the issue.
          </p>
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-300">
              Technical Details
            </summary>
            <pre className="mt-2 overflow-auto rounded bg-[#0A0A1A] p-4 text-xs text-gray-400">
              {error}
            </pre>
          </details>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <InvitedCelebrationModal />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Velocity Markets",
          url: "https://www.velocity-markets.com",
          description:
            "Predict hammer prices of collector car auctions. Join tournaments, guess the price, and win real prizes.",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://www.velocity-markets.com/markets?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Velocity Markets",
          url: "https://www.velocity-markets.com",
          logo: "https://www.velocity-markets.com/logo.png",
          description:
            "The prediction market for collector car auctions. Predict prices on Bring a Trailer, Mecum, RM Sotheby's, and more.",
        }}
      />
      <ClientHomepageTracker featuredAuctionId={undefined} />

      {/* Live Activity Ticker */}
      <LiveTicker sales={data.recentSales} />

      {/* ───────── Hero Section ───────── */}
      <section className="relative flex min-h-[80vh] items-center bg-gradient-to-br from-[#0d0d0d] via-[#111111] to-[#0d0d0d]">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#01696F]/5 via-transparent to-transparent" />
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h1 className="mb-6 text-4xl font-bold text-white sm:text-5xl md:text-7xl">
            Predict Car Auction Prices.
            <br />
            <span className="text-[#FFC553]">Win Real Prizes.</span>
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-400 md:text-xl">
            Join tournaments, guess the hammer price, and compete against car
            enthusiasts on the world&apos;s first automotive prediction platform.
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/tournaments">
              <Button asChild className="bg-[#01696F] px-8 py-4 text-lg text-white hover:bg-[#0C4E54]">
                Enter a Tournament
              </Button>
            </Link>
            <Link href="/markets">
              <Button
                asChild
                variant="outline"
                className="border-white/30 px-8 py-4 text-lg text-white hover:bg-white/10"
              >
                Play Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ───────── Stats Bar ───────── */}
      <section aria-label="Platform statistics" className="border-y border-white/10 bg-black/50 py-6">
        <div className="container mx-auto grid grid-cols-2 gap-4 px-4 text-center md:grid-cols-4">
          <div className="flex flex-col items-center">
            <div className="text-2xl font-bold text-white font-mono tabular-nums md:text-3xl">
              <AnimatedCounter end={data.cumulativeStats.carsTracked} format="abbreviated" />
            </div>
            <div className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-500">
              Cars Tracked
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-2xl font-bold text-[#FFC553] font-mono tabular-nums md:text-3xl">
              <AnimatedCounter end={data.cumulativeStats.totalPredictions} format="abbreviated" />
            </div>
            <div className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-500">
              Total Predictions
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-2xl font-bold text-white font-mono tabular-nums md:text-3xl">
              <AnimatedCounter end={data.cumulativeStats.totalMarkets} format="abbreviated" />
            </div>
            <div className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-500">
              Markets Listed
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-2xl font-bold text-white font-mono tabular-nums md:text-3xl">
              <AnimatedCounter end={data.totalPlayers} format="abbreviated" />
            </div>
            <div className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-500">
              Total Players
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Three-Mode Showcase ───────── */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-white">
            Three Ways to Play
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <ModeCard
              icon="&#127942;"
              title="Tournaments"
              description="Enter weekly tournaments with 15 live BaT auctions. Predict prices across all cars. Top scorers split the prize pool."
              cta="View Tournaments"
              href="/tournaments"
              accent="#01696F"
            />
            <ModeCard
              icon="&#128296;"
              title="Guess the Hammer"
              description="Pick an auction. Guess the final sale price. Closest prediction wins. Price is Right rules — go over and your error doubles!"
              cta="Start Guessing"
              href="/price_is_right"
              accent="#FFC553"
            />
            <ModeCard
              icon="&#127919;"
              title="Free Play"
              description="Predict auction outcomes with Velocity Points. No money required. Available in all 50 states. Climb the leaderboard."
              cta="Play Free"
              href="/markets"
              accent="#00d68f"
            />
          </div>
        </div>
      </section>

      {/* ───────── Featured Tournament ───────── */}
      {data.featuredTournament ? (
        (() => {
          const ft = data.featuredTournament;
          const nowMs = Date.now();
          const startMs = new Date(ft.startTime).getTime();
          const endMs = new Date(ft.endTime).getTime();
          const isLive = startMs <= nowMs && endMs > nowMs;
          const isUpcoming = startMs > nowMs;
          const userCount = ft.users?.length || 0;
          const carCount = ft.auction_ids?.length || 0;
          const isFreePlay = (ft.buyInFee || 0) === 0;
          const prizePool =
            ft.calculatedPrizePool ||
            (ft.buyInFee || 0) * userCount;
          return (
            <section className="relative overflow-hidden bg-gradient-to-b from-[#0F0F1A] via-[#111111] to-[#0F0F1A] py-20">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(1,105,111,0.12),_transparent_55%)]" />
              <div className="container relative mx-auto px-4">
                {/* Eyebrow */}
                <div className="mb-4 flex items-center justify-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#01696F]/40 bg-[#01696F]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#00D4AA]">
                    <Trophy className="h-3 w-3" />
                    Featured Tournament
                  </span>
                  {isLive && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E94560]/40 bg-[#E94560]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#E94560]">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#E94560]" />
                      Live Now
                    </span>
                  )}
                </div>

                {/* Hero header */}
                <div className="mb-10 text-center">
                  <h2 className="mx-auto max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl">
                    {ft.name}
                  </h2>
                  {ft.description && (
                    <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-400 sm:text-base">
                      {ft.description}
                    </p>
                  )}
                </div>

                {/* Stat row */}
                <div className="mx-auto mb-10 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
                  {/* Prize / FREE PLAY */}
                  <div className="rounded-xl border border-white/[0.08] bg-[#16181f] p-4 text-center sm:col-span-1">
                    {isFreePlay ? (
                      <>
                        <div className="font-mono text-2xl font-bold text-[#00D4AA] sm:text-3xl">
                          FREE
                        </div>
                        <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-500">
                          Play · No Buy-In
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="font-mono text-2xl font-bold text-[#FFC553] sm:text-3xl">
                          {prizePool > 0 ? formatCurrency(prizePool) : `$${ft.buyInFee}`}
                        </div>
                        <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-500">
                          {prizePool > 0 ? "Prize Pool" : "Buy-In"}
                        </p>
                      </>
                    )}
                  </div>
                  {/* Cars */}
                  <div className="rounded-xl border border-white/[0.08] bg-[#16181f] p-4 text-center">
                    <div className="font-mono text-2xl font-bold text-white sm:text-3xl">
                      {carCount}
                    </div>
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-500">
                      {carCount === 1 ? "Car" : "Cars"}
                    </p>
                  </div>
                  {/* Players */}
                  <div className="rounded-xl border border-white/[0.08] bg-[#16181f] p-4 text-center">
                    <div className="font-mono text-2xl font-bold text-white sm:text-3xl">
                      {userCount}
                    </div>
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-500">
                      {userCount === 1 ? "Player" : "Players"}
                    </p>
                  </div>
                  {/* Timer */}
                  <div className="rounded-xl border border-white/[0.08] bg-[#16181f] p-4 text-center">
                    <div className="flex h-[36px] items-center justify-center">
                      <CountdownTimer
                        endTime={new Date(isUpcoming ? ft.startTime : ft.endTime)}
                        size="sm"
                      />
                    </div>
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-500">
                      {isUpcoming ? "Starts In" : "Ends In"}
                    </p>
                  </div>
                </div>

                {/* Featured auction cards */}
                {data.featuredAuctions.length > 0 && (
                  <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {data.featuredAuctions.map((auction) => (
                      <Link
                        key={auction._id}
                        href={`/auctions/car_view_page/${auction._id}`}
                        className="group overflow-hidden rounded-xl border border-white/[0.08] bg-[#16181f] transition-colors hover:border-[#01696F]/40"
                      >
                        {auction.image && (
                          <div
                            className="h-28 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                            style={{
                              backgroundImage: `url(${auction.image})`,
                            }}
                          />
                        )}
                        <div className="p-3">
                          <p className="line-clamp-2 text-xs font-medium text-white">
                            {auction.title}
                          </p>
                          {auction.sort?.price != null && (
                            <p className="mt-1 font-mono text-xs text-gray-400">
                              ${auction.sort.price.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* CTA */}
                <div className="text-center">
                  <Link href={`/tournaments/${ft._id}`}>
                    <Button
                      asChild
                      className="bg-[#E94560] px-8 py-3 text-base font-semibold text-white shadow-lg shadow-[#E94560]/20 hover:bg-[#E94560]/90"
                    >
                      <Trophy className="mr-2 h-5 w-5" />
                      {isFreePlay ? "Play Free" : isUpcoming ? "Register Now" : "Enter Tournament"}
                    </Button>
                  </Link>
                  <p className="mt-3 text-xs text-gray-500">
                    {new Date(ft.startTime).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                    {" — "}
                    {new Date(ft.endTime).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </section>
          );
        })()
      ) : (
        <section className="bg-[#111111] py-16">
          <div className="container mx-auto px-4 text-center">
            <Trophy className="mx-auto mb-4 h-12 w-12 text-[#01696F]/50" />
            <h2 className="mb-2 text-2xl font-bold text-white">
              Next Tournament Starts Soon
            </h2>
            <p className="text-gray-400">
              Tournaments run weekly with cash prizes. Browse free play markets
              while you wait.
            </p>
            <Link href="/markets" className="mt-6 inline-block">
              <Button asChild className="bg-[#01696F] px-6 py-3 text-white hover:bg-[#0C4E54]">
                Browse Markets
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* ───────── Trending Auctions ───────── */}
      <section aria-label="Trending prediction markets" className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold text-white">Trending Auctions</h2>
            <Link
              href="/markets"
              className="text-sm font-medium text-[#01696F] hover:text-[#01898F]"
            >
              See All &rarr;
            </Link>
          </div>

          {data.trendingAuctions.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {data.trendingAuctions.slice(0, 8).map((auction) => (
                <Link
                  key={auction._id}
                  href={`/auctions/car_view_page/${auction._id}`}
                  className="group overflow-hidden rounded-xl border border-white/[0.08] bg-[#16181f] transition-colors hover:border-[#01696F]/30"
                >
                  {auction.image && (
                    <div
                      className="h-36 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                      style={{
                        backgroundImage: `url(${auction.image})`,
                      }}
                    />
                  )}
                  <div className="p-4">
                    <p className="line-clamp-2 text-sm font-medium text-white">
                      {auction.title}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                      {auction.sort?.deadline && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <CountdownTimer
                            endTime={new Date(new Date(auction.sort.deadline).getTime() + 24 * 60 * 60 * 1000)}
                            size="sm"
                          />
                        </span>
                      )}
                      {(auction.prediction_count ?? 0) > 0 && (
                        <span className="font-mono">
                          {auction.prediction_count} predictions
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <Suspense
              fallback={
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <MarketCardSkeleton key={i} />
                  ))}
                </div>
              }
            >
              <TrendingMarketsSection />
            </Suspense>
          )}
        </div>
      </section>

      {/* ───────── Recent Winners ───────── */}
      {data.recentWinners.length > 0 && (
        <section className="bg-[#111111] py-16">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-white">Recent Winners</h2>
              <Link
                href="/leaderboard"
                className="text-sm font-medium text-[#01696F] hover:text-[#01898F]"
              >
                View Full Leaderboard &rarr;
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {data.recentWinners.map((winner, i) => (
                <div
                  key={`${winner.username}-${i}`}
                  className="flex items-center gap-4 rounded-xl border border-white/[0.08] bg-[#16181f] p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#01696F]/20 text-sm font-bold text-[#01696F]">
                    {winner.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {winner.username}
                    </p>
                    <p className="truncate text-xs text-gray-400">
                      {winner.tournamentName}
                    </p>
                  </div>
                  <div className="font-mono text-sm font-bold text-[#FFC553]">
                    ${winner.prize.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ───────── How It Works ───────── */}
      <section className="py-16 bg-[#0d0d0d]">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-white">
            How It Works
          </h2>
          <div className="grid gap-8 text-center md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Choose Your Game",
                desc: "Tournaments, Guess the Hammer, or Free Play — pick your style.",
              },
              {
                step: "02",
                title: "Make Predictions",
                desc: "Predict final auction prices for live BaT cars. Use your car knowledge.",
              },
              {
                step: "03",
                title: "Win Prizes",
                desc: "Top predictors win cash prizes from the prize pool. Pure skill, no luck.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-center">
                <div className="mb-4 text-5xl font-bold text-[#01696F]">
                  {step}
                </div>
                <h3 className="mb-3 text-xl font-bold text-white">{title}</h3>
                <p className="text-sm leading-relaxed text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Newsletter ───────── */}
      <section aria-label="Newsletter signup" className="py-16 bg-[#111111]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-3 text-2xl font-bold text-white">
            Stay in the Loop
          </h2>
          <p className="mb-8 text-gray-400">
            Get weekly tournament alerts and auction price insights.
          </p>
          <NewsletterForm />
        </div>
      </section>
    </div>
  );
}
