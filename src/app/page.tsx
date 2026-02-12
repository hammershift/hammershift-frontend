import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Auctions from "@/models/auction.model";
import { Predictions } from "@/models/predictions.model";
import Users from "@/models/user.model";
import { startOfWeek, startOfDay, subDays } from "date-fns";
import "./styles/app.css";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/card_component";
import { Badge } from "./components/badge";
import CountdownTimer from "./components/CountdownTimer";
import { Clock, Users as UsersIcon, TrendingUp, Target, Trophy, ArrowRight } from "lucide-react";
import { HowItWorks } from "./components/how_it_works";
import ClientHomepageTracker from "./components/ClientHomepageTracker";
import connectToDB from "@/lib/mongoose";

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

    // Featured auction (ending soonest, active)
    const featuredAuction = await Auctions.findOne({
      isActive: true,
      'sort.deadline': { $exists: true }
    })
      .sort({ 'sort.deadline': 1 })
      .lean()
      .exec();

    // Live auctions (12 most recent)
    const liveAuctions = await Auctions.find({
      isActive: true,
      'sort.deadline': { $exists: true }
    })
      .sort({ 'sort.deadline': 1 })
      .limit(12)
      .lean()
      .exec();

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

    return {
      featuredAuction: featuredAuction ? JSON.parse(JSON.stringify(featuredAuction)) : null,
      liveAuctions: liveAuctions ? JSON.parse(JSON.stringify(liveAuctions)) : [],
      leaderboard: leaderboard ? JSON.parse(JSON.stringify(leaderboard)) : [],
      activityStats
    };
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    return {
      featuredAuction: null,
      liveAuctions: [],
      leaderboard: [],
      activityStats: {
        predictions_today: 0,
        active_auctions_value: 0,
        active_players: 0
      }
    };
  }
}

export default async function HomePage() {
  let session = null;
  let featuredAuction = null;
  let liveAuctions: any[] = [];
  let leaderboard: any[] = [];
  let activityStats = {
    predictions_today: 0,
    active_auctions_value: 0,
    active_players: 0
  };
  let error = null;

  try {
    session = await getServerSession(authOptions);
  } catch (err: any) {
    console.error('❌ Error getting session:', err);
    error = `Session error: ${err.message}`;
  }

  try {
    const data = await getHomePageData();
    featuredAuction = data.featuredAuction;
    liveAuctions = data.liveAuctions;
    leaderboard = data.leaderboard;
    activityStats = data.activityStats;
  } catch (err: any) {
    console.error('❌ Error fetching homepage data:', err);
    error = error ? `${error} | Data error: ${err.message}` : `Data error: ${err.message}`;
  }

  // If critical error, show error page
  if (error && liveAuctions.length === 0) {
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
      {/* Client-side event tracking */}
      <ClientHomepageTracker featuredAuctionId={featuredAuction?._id?.toString()} />

      {/* SECTION 1: HERO */}
      <section
        className="relative flex min-h-[85vh] items-center justify-center bg-gradient-to-b from-[#0A0A1A] to-[#13202D]"
      >
        <div className="absolute inset-0 bg-[url('/images/banner-min.jpg')] bg-cover bg-center opacity-20"></div>
        <div className="relative z-10 w-full">
          <div className="section-container mx-auto flex flex-col items-center justify-center gap-8 px-4 py-16">
            {/* Headline */}
            <div className="text-center">
              <h1 className="mb-4 text-5xl font-bold md:text-7xl">
                <span className="text-white">Predict.</span>{" "}
                <span className="text-[#E94560]">Compete.</span>{" "}
                <span className="text-white">Win.</span>
              </h1>
              <p className="mx-auto mb-6 max-w-2xl text-xl text-gray-300 md:text-2xl">
                Test your car knowledge against the market
              </p>
            </div>

            {/* Activity Ticker */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm md:gap-8 md:text-base">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-[#E94560]" />
                <span className="font-mono text-[#00D4AA]">{activityStats.predictions_today}</span>
                <span className="text-gray-400">predictions today</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#E94560]" />
                <span className="font-mono text-[#00D4AA]">{USDollar.format(activityStats.active_auctions_value / 1000000)}M</span>
                <span className="text-gray-400">in auction value</span>
              </div>
              <div className="flex items-center gap-2">
                <UsersIcon className="h-5 w-5 text-[#E94560]" />
                <span className="font-mono text-[#00D4AA]">{activityStats.active_players}</span>
                <span className="text-gray-400">active players</span>
              </div>
            </div>

            {/* Featured Auction Card */}
            {featuredAuction && (
              <Card className="w-full max-w-2xl border-[#E94560]/30 bg-[#13202D]/80 backdrop-blur-sm transition-all hover:border-[#E94560]">
                <div className="relative h-[300px] md:h-[400px]">
                  <Image
                    src={featuredAuction.image || '/images/default-car.jpg'}
                    alt={featuredAuction.title}
                    fill
                    priority
                    className="rounded-t-xl object-cover"
                  />
                  <div className="absolute right-4 top-4">
                    <Badge className="bg-[#E94560] text-white">Featured</Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="mb-4 text-2xl font-bold">{featuredAuction.title}</h3>
                  <div className="mb-4 grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-400">Current Bid</div>
                      <div className="font-mono text-2xl font-bold text-[#00D4AA]">
                        {USDollar.format(featuredAuction.sort?.price || 0)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Time Left</div>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-5 w-5 text-[#FFB547]" />
                        <CountdownTimer endTime={new Date(featuredAuction.sort?.deadline)} />
                      </div>
                    </div>
                  </div>
                  <Link href={`/auctions/car_view_page/${featuredAuction._id}?mode=free_play`}>
                    <Button className="w-full bg-[#E94560] text-white hover:bg-[#E94560]/90">
                      Make Your Prediction
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* CTAs */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/free_play">
                <Button className="bg-[#E94560] px-8 py-6 text-lg text-white hover:bg-[#E94560]/90">
                  Make Your First Prediction
                </Button>
              </Link>
              <Link href="#live-auctions">
                <Button variant="outline" className="border-[#E94560] px-8 py-6 text-lg text-[#E94560] hover:bg-[#E94560] hover:text-white">
                  Browse Live Auctions
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: LIVE AUCTIONS GRID */}
      <section id="live-auctions" className="section-container mx-auto px-4 py-16">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold">Live Auctions</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-[#E94560]/30 text-gray-300">All</Button>
            <Button variant="ghost" size="sm" className="text-gray-400">Ending Soon</Button>
            <Button variant="ghost" size="sm" className="text-gray-400">High Value</Button>
            <Button variant="ghost" size="sm" className="text-gray-400">New</Button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {liveAuctions.slice(0, 12).map((auction: any) => (
            <Link key={auction._id} href={`/auctions/car_view_page/${auction._id}?mode=free_play`}>
              <Card className="h-full border-[#1E2A36] bg-[#13202D] transition-all hover:border-[#E94560] hover:shadow-lg hover:shadow-[#E94560]/20">
                <div className="relative h-[200px]">
                  <Image
                    src={auction.image || '/images/default-car.jpg'}
                    alt={auction.title}
                    fill
                    className="rounded-t-xl object-cover"
                  />
                  {auction.source_badge && (
                    <div className="absolute right-2 top-2">
                      <Badge className="bg-[#FFB547] text-[#0A0A1A]">
                        {auction.source_badge.toUpperCase()}
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="mb-3 line-clamp-2 font-bold">{auction.title}</h3>
                  <div className="mb-4 grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-xs text-gray-400">Current Bid</div>
                      <div className="font-mono font-bold text-[#00D4AA]">
                        {USDollar.format(auction.sort?.price || 0)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Time Left</div>
                      <div className="flex items-center text-sm">
                        <Clock className="mr-1 h-3 w-3 text-[#FFB547]" />
                        <CountdownTimer endTime={new Date(auction.sort?.deadline)} size="sm" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-400">
                      <UsersIcon className="mr-1 h-3 w-3" />
                      {auction.prediction_count || 0} predictions
                    </div>
                    <Button size="sm" className="bg-[#E94560] text-white hover:bg-[#E94560]/90">
                      Predict
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {liveAuctions.length > 12 && (
          <div className="mt-8 text-center">
            <Link href="/free_play">
              <Button variant="outline" className="border-[#E94560] text-[#E94560] hover:bg-[#E94560] hover:text-white">
                View All Auctions <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* SECTION 3: LEADERBOARD PREVIEW */}
      <section className="bg-[#13202D]/50 py-16">
        <div className="section-container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold">Top Predictors This Week</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="border-[#E94560] bg-[#E94560]/20 text-[#E94560]">
                Weekly
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400">Monthly</Button>
              <Button variant="ghost" size="sm" className="text-gray-400">All-Time</Button>
            </div>
          </div>

          <div className="space-y-3">
            {leaderboard.slice(0, 10).map((entry: any, index: number) => (
              <div
                key={entry._id}
                className="flex items-center justify-between rounded-lg bg-[#0A0A1A]/50 p-4 backdrop-blur-sm transition-all hover:bg-[#0A0A1A]/80"
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${
                    index === 0 ? 'bg-[#FFB547] text-[#0A0A1A]' :
                    index === 1 ? 'bg-[#C0C0C0] text-[#0A0A1A]' :
                    index === 2 ? 'bg-[#CD7F32] text-[#0A0A1A]' :
                    'bg-[#1E2A36] text-gray-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold">{entry.username}</div>
                    <div className="text-xs text-gray-400">{entry.predictions_count} predictions</div>
                  </div>
                </div>
                <div className="font-mono text-xl font-bold text-[#00D4AA]">
                  {entry.total_score.toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/leaderboard">
              <Button variant="outline" className="border-[#E94560] text-[#E94560] hover:bg-[#E94560] hover:text-white">
                View Full Leaderboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 4: GAME MODES */}
      <section className="section-container mx-auto px-4 py-16">
        <h2 className="mb-8 text-center text-3xl font-bold">Choose Your Game Mode</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Free Play */}
          <Card className="border-[#1E2A36] bg-[#13202D] transition-all hover:border-[#00D4AA]">
            <CardContent className="flex flex-col items-center p-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#00D4AA]/20">
                <Target className="h-8 w-8 text-[#00D4AA]" />
              </div>
              <h3 className="mb-3 text-2xl font-bold">Free Play</h3>
              <p className="mb-6 text-gray-400">
                Practice your skills, no risk. Perfect for learning and building your prediction strategy.
              </p>
              <Link href="/free_play" className="w-full">
                <Button className="w-full bg-[#00D4AA] text-[#0A0A1A] hover:bg-[#00D4AA]/90">
                  Start Playing
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Tournaments */}
          <Card className="border-[#1E2A36] bg-[#13202D] transition-all hover:border-[#E94560]">
            <CardContent className="flex flex-col items-center p-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#E94560]/20">
                <Trophy className="h-8 w-8 text-[#E94560]" />
              </div>
              <h3 className="mb-3 text-2xl font-bold">Tournaments</h3>
              <p className="mb-6 text-gray-400">
                Compete for prizes in structured competitions. Test your skills against the best.
              </p>
              <Link href="/tournaments" className="w-full">
                <Button className="w-full bg-[#E94560] text-white hover:bg-[#E94560]/90">
                  View Tournaments
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Guess the Hammer (Coming Soon) */}
          <Card className="border-[#1E2A36] bg-[#13202D]/50 opacity-60">
            <CardContent className="flex flex-col items-center p-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FFB547]/20">
                <TrendingUp className="h-8 w-8 text-[#FFB547]" />
              </div>
              <h3 className="mb-3 text-2xl font-bold">Guess the Hammer</h3>
              <p className="mb-6 text-gray-400">
                Wager on your predictions. Higher stakes, bigger rewards.
              </p>
              <Button disabled className="w-full bg-gray-600 text-gray-400">
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SECTION 5: HOW IT WORKS */}
      <section className="bg-[#13202D]/50 py-16">
        <div className="section-container mx-auto px-4">
          <HowItWorks />
        </div>
      </section>

      {/* CTA SECTION */}
      {!session && (
        <section className="bg-gradient-to-r from-[#E94560]/20 to-[#00D4AA]/20 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Ready to <span className="text-[#E94560]">Start</span> Playing?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-300">
              Join Velocity Markets today and start predicting auction prices to win prizes.
            </p>
            <Link href="/create_account">
              <Button className="bg-[#E94560] px-8 py-6 text-lg text-white hover:bg-[#E94560]/90">
                Sign Up Now
              </Button>
            </Link>
            <p className="mt-4 text-sm text-gray-400">
              Please read our terms and conditions before signing up.
            </p>
          </div>
        </section>
      )}

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
