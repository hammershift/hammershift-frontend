"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Gavel,
  Clock,
  Users,
  Trophy,
  AlertTriangle,
  X,
  DollarSign,
  Target,
  Medal,
  Share2,
} from "lucide-react";

interface AuctionCard {
  _id: string;
  auctionId: string;
  title: string;
  image: string | null;
  deadline: string;
  currentBid: number;
  bids: number;
  guessCount: number;
}

interface RecentResult {
  auctionId: string;
  title: string;
  image: string | null;
  actualPrice: number;
  totalEntries: number;
  winnerName: string;
  winnerGuess: number;
  winnerPrize: number;
  userGuessId?: string;
}

interface Props {
  auctions: AuctionCard[];
  recentResults: RecentResult[];
  userGuesses: Record<string, number>;
  userBalance: number;
  isAuthenticated: boolean;
}

const ENTRY_FEE = 5;

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function CountdownTimer({ deadline }: { deadline: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    function update() {
      const diff = new Date(deadline).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Ended");
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    }
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  return <span className="font-mono text-sm">{timeLeft}</span>;
}

export default function GuessTheHammerClient({
  auctions,
  recentResults,
  userGuesses,
  userBalance,
  isAuthenticated,
}: Props) {
  const [activeTab, setActiveTab] = useState<"play" | "results" | "leaderboard">("play");
  const [isVirtual, setIsVirtual] = useState(true);
  const [selectedAuction, setSelectedAuction] = useState<AuctionCard | null>(null);
  const [guessPrice, setGuessPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [localGuesses, setLocalGuesses] = useState(userGuesses);

  const submitGuess = useCallback(async () => {
    if (!selectedAuction || !guessPrice) return;
    const price = parseFloat(guessPrice.replace(/[^0-9.]/g, ""));
    if (isNaN(price) || price <= 0) {
      setError("Enter a valid price");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/guess-the-hammer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auctionId: selectedAuction.auctionId || selectedAuction._id,
          guessedPrice: price,
          isVirtual,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit guess");
        return;
      }

      setSuccess(`Guess submitted: ${formatCurrency(price)}`);
      setLocalGuesses((prev) => ({ ...prev, [selectedAuction._id]: price }));
      setTimeout(() => {
        setSelectedAuction(null);
        setGuessPrice("");
        setSuccess(null);
      }, 2000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [selectedAuction, guessPrice, isVirtual]);

  const tabs = [
    { key: "play" as const, label: "Active Auctions", icon: <Gavel className="w-4 h-4" /> },
    { key: "results" as const, label: "Recent Results", icon: <Trophy className="w-4 h-4" /> },
    { key: "leaderboard" as const, label: "Leaderboard", icon: <Medal className="w-4 h-4" /> },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-3">
          Guess the <span className="text-[#FFB547]">Hammer</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Predict the final auction price. Closest guess wins.
        </p>
      </div>

      {/* Rules callout */}
      <div className="bg-[#FFB547]/5 border border-[#FFB547]/20 rounded-xl p-4 mb-8 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-[#FFB547] flex-shrink-0 mt-0.5" />
        <div className="text-sm text-gray-300">
          <strong className="text-[#FFB547]">Price is Right rules</strong> — guess
          over the actual sale price and your penalty error is{" "}
          <strong className="text-white">doubled</strong>. Going under is always
          safer!
        </div>
      </div>

      {/* Mode toggle + balance */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2 bg-[#16181f] border border-white/[0.08] rounded-lg p-1">
          <button
            onClick={() => setIsVirtual(true)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              isVirtual
                ? "bg-[#00D4AA]/10 text-[#00D4AA] border border-[#00D4AA]/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Free Play
          </button>
          <button
            onClick={() => setIsVirtual(false)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              !isVirtual
                ? "bg-[#FFB547]/10 text-[#FFB547] border border-[#FFB547]/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Play for Cash (${ENTRY_FEE})
          </button>
        </div>
        {isAuthenticated && (
          <div className="text-sm text-gray-400">
            Balance:{" "}
            <span className="font-mono text-white">
              {formatCurrency(userBalance)}
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-white/[0.08]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
              activeTab === tab.key
                ? "border-[#E94560] text-white"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Auctions Tab */}
      {activeTab === "play" && (
        <>
          {auctions.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Gavel className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No auctions ending soon</p>
              <p className="text-sm mt-2">Check back later for new auctions to predict</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {auctions.map((auction) => {
                const alreadyGuessed = auction._id in localGuesses;
                return (
                  <div
                    key={auction._id}
                    className="bg-[#16181f] border border-white/[0.08] rounded-xl overflow-hidden hover:border-white/[0.14] transition group"
                  >
                    {/* Image */}
                    <div className="relative h-44 bg-[#0A0A1A]">
                      {auction.image ? (
                        <Image
                          src={auction.image}
                          alt={auction.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Gavel className="w-8 h-8 text-gray-600" />
                        </div>
                      )}
                      {/* Countdown badge */}
                      <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#E94560]" />
                        <CountdownTimer deadline={auction.deadline} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-white line-clamp-2 mb-3 min-h-[2.5rem]">
                        {auction.title}
                      </h3>

                      <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5" />
                          <span className="font-mono text-white">
                            {formatCurrency(auction.currentBid)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          <span>{auction.guessCount} guesses</span>
                        </div>
                      </div>

                      {alreadyGuessed ? (
                        <div className="bg-[#00D4AA]/10 border border-[#00D4AA]/20 rounded-lg p-3 text-center">
                          <p className="text-xs text-[#00D4AA]">Your guess</p>
                          <p className="font-mono font-bold text-white">
                            {formatCurrency(localGuesses[auction._id])}
                          </p>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            if (!isAuthenticated) {
                              window.location.href = "/login_page";
                              return;
                            }
                            setSelectedAuction(auction);
                            setError(null);
                            setSuccess(null);
                            setGuessPrice("");
                          }}
                          className="w-full bg-[#E94560] hover:bg-[#E94560]/90 text-white font-semibold py-2.5 rounded-lg transition text-sm"
                        >
                          Make Your Guess
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Recent Results Tab */}
      {activeTab === "results" && (
        <>
          {recentResults.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No results yet</p>
              <p className="text-sm mt-2">Results appear after auctions close and guesses are graded</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentResults.map((result) => (
                <div
                  key={result.auctionId}
                  className="bg-[#16181f] border border-white/[0.08] rounded-xl p-4 flex items-center gap-4"
                >
                  {result.image && (
                    <div className="relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={result.image}
                        alt={result.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-white truncate">
                      {result.title}
                    </h4>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                      <span>
                        Sold for{" "}
                        <span className="font-mono text-[#00D4AA]">
                          {formatCurrency(result.actualPrice)}
                        </span>
                      </span>
                      <span>{result.totalEntries} entries</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1 text-xs text-[#FFB547]">
                      <Trophy className="w-3.5 h-3.5" />
                      {result.winnerName}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Guessed {formatCurrency(result.winnerGuess)}
                    </div>
                    {result.winnerPrize > 0 && (
                      <div className="text-xs font-mono text-[#00D4AA] mt-0.5">
                        Won {formatCurrency(result.winnerPrize)}
                      </div>
                    )}
                    {result.userGuessId && (
                      <Link
                        href={`/results/${result.userGuessId}?type=guess`}
                        className="mt-1 inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white transition"
                      >
                        <Share2 className="w-3 h-3" />
                        Share
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Leaderboard Tab */}
      {activeTab === "leaderboard" && <LeaderboardSection />}

      {/* Guess Modal */}
      {selectedAuction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#16181f] border border-white/[0.08] rounded-2xl w-full max-w-md overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
              <h3 className="text-lg font-bold text-white">Your Prediction</h3>
              <button
                onClick={() => setSelectedAuction(null)}
                className="text-gray-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6">
              {/* Car info */}
              {selectedAuction.image && (
                <div className="relative h-40 rounded-xl overflow-hidden mb-4">
                  <Image
                    src={selectedAuction.image}
                    alt={selectedAuction.title}
                    fill
                    className="object-cover"
                    sizes="400px"
                  />
                </div>
              )}
              <h4 className="text-sm font-semibold text-white mb-1">
                {selectedAuction.title}
              </h4>
              <div className="flex items-center gap-4 text-xs text-gray-400 mb-6">
                <span>
                  Current bid:{" "}
                  <span className="font-mono text-white">
                    {formatCurrency(selectedAuction.currentBid)}
                  </span>
                </span>
                <span>
                  <CountdownTimer deadline={selectedAuction.deadline} /> left
                </span>
              </div>

              {/* Price input */}
              <label className="block text-xs text-gray-400 mb-2">
                What will this car sell for?
              </label>
              <div className="relative mb-4">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-mono">
                  $
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={guessPrice}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, "");
                    setGuessPrice(raw ? parseInt(raw).toLocaleString() : "");
                  }}
                  placeholder="0"
                  className="w-full bg-[#0A0A1A] border border-white/[0.12] rounded-lg py-3 pl-8 pr-4 font-mono text-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#E94560]/50 transition"
                  autoFocus
                />
              </div>

              {/* Fee info */}
              <div className="flex items-center justify-between text-xs text-gray-400 mb-6">
                <span>
                  {isVirtual ? "Free play — no charge" : `Entry fee: $${ENTRY_FEE}`}
                </span>
                {!isVirtual && (
                  <span>
                    Balance: <span className="font-mono text-white">{formatCurrency(userBalance)}</span>
                  </span>
                )}
              </div>

              {error && (
                <div className="bg-[#E94560]/10 border border-[#E94560]/20 rounded-lg p-3 mb-4 text-sm text-[#E94560]">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-[#00D4AA]/10 border border-[#00D4AA]/20 rounded-lg p-3 mb-4 text-sm text-[#00D4AA]">
                  {success}
                </div>
              )}

              <button
                onClick={submitGuess}
                disabled={submitting || !guessPrice}
                className="w-full bg-[#E94560] hover:bg-[#E94560]/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                {submitting ? (
                  "Submitting..."
                ) : (
                  <>
                    <Target className="w-4 h-4" />
                    Submit Guess
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Leaderboard sub-component (client-side fetch) ──────────────────────── */

function LeaderboardSection() {
  const [data, setData] = useState<{
    leaderboard: Array<{
      rank: number;
      displayName: string;
      totalGames: number;
      avgAccuracy: number;
      totalWinnings: number;
      isCurrentUser: boolean;
    }>;
    myRank: { rank: number; totalGames: number; avgAccuracy: number; totalWinnings: number } | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/guess-the-hammer/leaderboard")
      .then((res) => res.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-400">Loading leaderboard...</div>
    );
  }

  if (!data || data.leaderboard.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <Medal className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p className="text-lg">No leaderboard data yet</p>
        <p className="text-sm mt-2">Play Guess the Hammer to appear on the leaderboard</p>
      </div>
    );
  }

  return (
    <div className="bg-[#16181f] border border-white/[0.08] rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.06] text-xs text-gray-400 uppercase tracking-wider">
            <th className="px-4 py-3 text-left">#</th>
            <th className="px-4 py-3 text-left">Player</th>
            <th className="px-4 py-3 text-right">Games</th>
            <th className="px-4 py-3 text-right">Accuracy</th>
            <th className="px-4 py-3 text-right">Winnings</th>
          </tr>
        </thead>
        <tbody>
          {data.leaderboard.map((entry) => (
            <tr
              key={entry.rank}
              className={`border-b border-white/[0.04] ${
                entry.isCurrentUser ? "bg-[#E94560]/5" : ""
              }`}
            >
              <td className="px-4 py-3 font-mono text-gray-400">
                {entry.rank <= 3 ? (
                  <span className="text-[#FFB547]">{entry.rank}</span>
                ) : (
                  entry.rank
                )}
              </td>
              <td className="px-4 py-3 text-white font-medium">
                {entry.displayName}
                {entry.isCurrentUser && (
                  <span className="ml-2 text-xs text-[#E94560]">(you)</span>
                )}
              </td>
              <td className="px-4 py-3 text-right font-mono text-gray-300">
                {entry.totalGames}
              </td>
              <td className="px-4 py-3 text-right font-mono text-[#00D4AA]">
                {entry.avgAccuracy}%
              </td>
              <td className="px-4 py-3 text-right font-mono text-white">
                {formatCurrency(entry.totalWinnings)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {data.myRank && (
        <div className="border-t border-white/[0.08] px-4 py-3 bg-[#E94560]/5 text-sm">
          Your rank:{" "}
          <span className="font-mono text-white">#{data.myRank.rank}</span> —{" "}
          <span className="font-mono text-[#00D4AA]">{data.myRank.avgAccuracy}%</span> accuracy
          across {data.myRank.totalGames} games
        </div>
      )}
    </div>
  );
}
