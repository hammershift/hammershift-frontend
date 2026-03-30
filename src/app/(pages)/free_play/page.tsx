"use client";

import { AuctionFilters } from "@/app/components/auction_filters";
import { AuctionGrid } from "@/app/components/auction_grid";
import { Card } from "@/app/components/card_component";
import { Button } from "@/app/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { createPageUrl } from "@/app/components/utils";
import { Tournament } from "@/models/tournament.model";
import { getCars, getTournaments } from "@/lib/data";
import { Trophy, BarChart2, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import ResponsivePagination from "react-responsive-pagination";
import "react-responsive-pagination/themes/classic.css";
import TournamentGrid from "@/app/components/tournament_grid";

interface Filters {
  make: string;
  priceRange: string;
  status: "active" | "ending_soon" | "starting_soon" | "ended";
}

interface QuickGuessAuction {
  _id: string;
  title: string;
  image: string;
  sort?: { deadline?: string; price?: number };
}

const FreePlay = () => {
  const [hammerCars, setHammerCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("markets");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [filters, setFilters] = useState<Filters>({
    make: "all",
    priceRange: "0",
    status: "active",
  });
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  // Quick Guess state
  const [quickAuctions, setQuickAuctions] = useState<QuickGuessAuction[]>([]);
  const [quickLoading, setQuickLoading] = useState(false);
  const [guessInput, setGuessInput] = useState<Record<string, string>>({});
  const [guessSubmitting, setGuessSubmitting] = useState<string | null>(null);
  const [guessSuccess, setGuessSuccess] = useState<string | null>(null);
  const [virtualBalance, setVirtualBalance] = useState<number>(10000);

  const handleTabChange = async (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setTotalPages(1);
    setFilters({ make: "all", priceRange: "0", status: "active" });
  };

  // Fetch virtual balance
  useEffect(() => {
    fetch("/api/virtual-balance")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setVirtualBalance(d.virtualBalance);
      })
      .catch(() => {});
  }, []);

  // Fetch quick guess auctions
  useEffect(() => {
    if (activeTab === "quickguess") {
      setQuickLoading(true);
      getCars({ offset: 0, limit: 5, status: "ending_soon" })
        .then((data) => setQuickAuctions(data.cars ?? []))
        .catch(() => setQuickAuctions([]))
        .finally(() => setQuickLoading(false));
    }
  }, [activeTab]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        switch (activeTab) {
          case "hammer":
            {
              const data = await getCars({
                offset: (currentPage - 1) * 6,
                limit: 6,
                make: filters.make,
                priceRange: parseInt(filters.priceRange),
                status: filters.status,
              });
              setHammerCars(data.cars);
              setTotalPages(data.total);
            }
            break;
          case "tournaments":
            {
              const data = await getTournaments({
                offset: (currentPage - 1) * 6,
                limit: 6,
                type: "free",
              });
              setTournaments(data.tournaments);
              setTotalPages(data.total);
            }
            break;
        }
      } catch (e) {
        console.log(e);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    if (activeTab !== "markets" && activeTab !== "quickguess") {
      loadData();
    } else {
      setLoading(false);
    }
  }, [currentPage, filters, activeTab]);

  const handleQuickGuess = async (auctionId: string) => {
    const price = parseFloat(guessInput[auctionId] ?? "");
    if (isNaN(price) || price <= 0) return;

    setGuessSubmitting(auctionId);
    try {
      const res = await fetch("/api/guess-the-hammer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auctionId,
          guessedPrice: price,
          entryFee: 0,
          isVirtual: true,
        }),
      });
      if (res.ok) {
        setGuessSuccess(auctionId);
        setTimeout(() => setGuessSuccess(null), 3000);
      }
    } catch {
      /* ignore */
    } finally {
      setGuessSubmitting(null);
    }
  };

  return (
    <div className="page-container">
      <div className="section-container mx-auto px-4 py-12">
        <div className="mb-8 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-3xl font-bold">Free Play Arena</h1>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-[#16181f] border border-[#FFC553]/30 rounded-full px-4 py-2">
                <span className="text-gray-400 text-sm">VP</span>
                <span className="font-mono font-bold text-[#FFC553]">
                  {virtualBalance.toLocaleString()}
                </span>
              </div>
              <Link href={createPageUrl("Leaderboard")}>
                <Button
                  variant="outline"
                  className="w-full border-[#E94560] text-[#E94560] hover:bg-[#E94560] hover:text-[#0C1924] sm:w-auto"
                >
                  <Trophy className="mr-2 h-5 w-5" />
                  LEADERBOARD
                </Button>
              </Link>
            </div>
          </div>

          <p className="text-gray-400">
            Practice your prediction skills with Velocity Points — no real money
            involved
          </p>
        </div>

        <div className="mb-8 rounded-md border border-[#01696F]/30 bg-[#01696F]/10 p-4">
          <p className="text-gray-300">
            Velocity Points are virtual — they have no cash value. Play for
            bragging rights and leaderboard rank! Your 10,000 starting points
            refresh if you run low.
          </p>
        </div>

        {error && (
          <div className="mb-8 rounded-md border border-red-800/30 bg-red-900/20 p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <Tabs
          value={activeTab}
          onValueChange={(value) => handleTabChange(value)}
          className="mb-8"
        >
          <TabsList className="border-[#333333] bg-[#2C2C2C]">
            <TabsTrigger
              value="markets"
              className="data-[state=active]:bg-[#01696F] data-[state=active]:text-white"
            >
              <BarChart2 className="mr-2 h-4 w-4" />
              Predict Markets
            </TabsTrigger>
            <TabsTrigger
              value="quickguess"
              className="data-[state=active]:bg-[#01696F] data-[state=active]:text-white"
            >
              <Zap className="mr-2 h-4 w-4" />
              Quick Guess
            </TabsTrigger>
            <TabsTrigger
              value="hammer"
              className="data-[state=active]:bg-[#E94560] data-[state=active]:text-[#0C1924]"
            >
              Free Guess the Hammer
            </TabsTrigger>
            <TabsTrigger
              value="tournaments"
              className="data-[state=active]:bg-[#E94560] data-[state=active]:text-[#0C1924]"
            >
              Free Tournaments
            </TabsTrigger>
          </TabsList>

          {/* Predict Markets Tab */}
          <TabsContent value="markets" className="pt-6">
            <div className="rounded-lg border border-white/[0.08] bg-[#16181f] p-8 text-center">
              <BarChart2 className="mx-auto mb-4 h-12 w-12 text-[#01696F]" />
              <h3 className="mb-2 text-xl font-bold">
                Prediction Markets
              </h3>
              <p className="mb-6 text-gray-400">
                Trade YES or NO on car auction outcomes using Velocity Points.
                No real money required.
              </p>
              <Link href="/markets">
                <Button className="bg-[#01696F] hover:bg-[#01898F] text-white">
                  Go to Markets
                </Button>
              </Link>
            </div>
          </TabsContent>

          {/* Quick Guess Tab */}
          <TabsContent value="quickguess" className="pt-6">
            <div className="mb-4">
              <h3 className="text-lg font-bold mb-1">Quick Price Guess</h3>
              <p className="text-sm text-gray-400">
                Guess the final price of auctions ending soon. No entry fee —
                just fun.
              </p>
            </div>

            {quickLoading ? (
              <div className="flex items-center justify-center p-12">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-b-transparent border-l-transparent border-r-transparent border-t-[#01696F]" />
              </div>
            ) : quickAuctions.length === 0 ? (
              <div className="rounded-lg border border-white/[0.08] bg-[#16181f] p-12 text-center">
                <p className="text-gray-400">
                  No auctions ending soon. Check back later!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickAuctions.map((auction) => (
                  <div
                    key={auction._id}
                    className="rounded-xl border border-white/[0.08] bg-[#16181f] overflow-hidden"
                  >
                    {auction.image && (
                      <div
                        className="h-32 bg-cover bg-center"
                        style={{ backgroundImage: `url(${auction.image})` }}
                      />
                    )}
                    <div className="p-4">
                      <p className="text-sm font-medium text-white mb-2 line-clamp-2">
                        {auction.title}
                      </p>
                      {auction.sort?.price && (
                        <p className="text-xs text-gray-400 mb-3">
                          Current bid:{" "}
                          <span className="font-mono text-white">
                            ${auction.sort.price.toLocaleString()}
                          </span>
                        </p>
                      )}
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-sm">
                            $
                          </span>
                          <input
                            type="number"
                            placeholder="Your guess"
                            value={guessInput[auction._id] ?? ""}
                            onChange={(e) =>
                              setGuessInput((prev) => ({
                                ...prev,
                                [auction._id]: e.target.value,
                              }))
                            }
                            className="w-full bg-[#0A0A1A] border border-white/10 rounded-lg py-2 pl-7 pr-3 text-white font-mono text-sm focus:outline-none focus:border-[#01696F]/50"
                          />
                        </div>
                        <button
                          onClick={() => handleQuickGuess(auction._id)}
                          disabled={
                            guessSubmitting === auction._id ||
                            guessSuccess === auction._id
                          }
                          className="bg-[#01696F] hover:bg-[#01898F] text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors"
                        >
                          {guessSuccess === auction._id
                            ? "Sent!"
                            : guessSubmitting === auction._id
                            ? "..."
                            : "Guess"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Existing Hammer tab */}
          <TabsContent value="hammer" className="pt-6">
            <div className="flex overflow-x-auto border-b border-white/[0.08] mb-6">
              {(
                ["ending_soon", "active", "starting_soon", "ended"] as const
              ).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilters((f) => ({ ...f, status: tab }))}
                  className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                    filters.status === tab
                      ? "border-b-2 border-[#E94560] text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {tab === "ending_soon" && "Ending Soon"}
                  {tab === "active" && "Live Now"}
                  {tab === "starting_soon" && "Starting Soon"}
                  {tab === "ended" && "Ended"}
                </button>
              ))}
            </div>

            <Card className="mb-8 border-[#333333] bg-[#2C2C2C] p-6">
              <AuctionFilters filters={filters} setFilters={setFilters} />
            </Card>

            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-b-transparent border-l-transparent border-r-transparent border-t-[#E94560]" />
              </div>
            ) : (
              <AuctionGrid
                isEnded={filters.status === "ended"}
                auctions={hammerCars}
                mode="free_play"
              />
            )}
          </TabsContent>

          <TabsContent value="tournaments" className="pt-6">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-b-transparent border-l-transparent border-r-transparent border-t-[#E94560]" />
              </div>
            ) : tournaments.length > 0 ? (
              <TournamentGrid tournaments={tournaments} />
            ) : (
              <div className="rounded-lg border border-white/[0.08] bg-[#16181f] p-12 text-center">
                <h3 className="mb-2 text-xl font-bold">
                  No Free Tournaments Available
                </h3>
                <p className="text-gray-400">
                  There are currently no free tournaments available. Please check
                  back later!
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        {activeTab !== "markets" && activeTab !== "quickguess" && (
          <div className="mx-auto mb-8 w-1/3">
            <ResponsivePagination
              current={currentPage}
              total={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};
export default FreePlay;
