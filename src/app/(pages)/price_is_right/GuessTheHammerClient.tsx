"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
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
  Lock,
  Timer,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Info,
  Filter,
} from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import AuctionDetailsDrawer from "@/app/components/price_is_right/AuctionDetailsDrawer";

/* ── Error boundary so a runtime crash shows a fallback, not a white screen ── */
class GuessTheHammerErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
          <Gavel className="w-12 h-12 text-gray-600 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-400 mb-6">
            We hit an error loading Guess the Hammer. Please try refreshing.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-[#E94560] hover:bg-[#E94560]/90 text-white font-semibold rounded-lg transition"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

type AuctionStatus = "open" | "ending_soon" | "ended";

interface AuctionCard {
  _id: string;
  auctionId: string;
  title: string;
  image: string | null;
  deadline: string | null;
  currentBid: number;
  bids: number;
  guessCount: number;
  status: AuctionStatus;
  make: string;
  // Rich fields forwarded from server projection for the details drawer.
  // Typed as `unknown` so AuctionLike helpers can safely narrow them.
  attributes?: unknown;
  images_list?: unknown;
  description?: unknown;
  listing_details?: unknown;
  page_url?: unknown;
  sort?: unknown;
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
  counts: { open: number; endingSoon: number; ended: number };
  recentResults: RecentResult[];
  userGuesses: Record<string, number>;
  userBalance: number;
  isAuthenticated: boolean;
}

const ENTRY_FEE = 5;

function formatCurrency(n: number | null | undefined) {
  if (n == null || isNaN(n)) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function CountdownTimer({ deadline }: { deadline: string | null }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!deadline) {
      setTimeLeft("Ended");
      return;
    }
    function update() {
      const diff = new Date(deadline!).getTime() - Date.now();
      if (diff <= 0 || isNaN(diff)) {
        setTimeLeft("Ended");
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (d > 0) setTimeLeft(`${d}d ${h}h ${m}m`);
      else setTimeLeft(`${h}h ${m}m ${s}s`);
    }
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  return <span className="font-mono text-sm">{timeLeft}</span>;
}

/* ── Status badge for each auction card ─────────────────────────────── */

function StatusBadge({ status, deadline }: { status: AuctionStatus; deadline: string | null }) {
  if (status === "open") {
    return (
      <div className="bg-[#00D4AA]/20 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-[#00D4AA] animate-pulse" />
        <CountdownTimer deadline={deadline} />
      </div>
    );
  }
  if (status === "ending_soon") {
    return (
      <div className="bg-[#FFB547]/20 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-1.5">
        <Lock className="w-3.5 h-3.5 text-[#FFB547]" />
        <CountdownTimer deadline={deadline} />
      </div>
    );
  }
  return (
    <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1.5">
      <span className="font-mono text-sm text-gray-400">Ended</span>
    </div>
  );
}

/* ── Individual auction card ────────────────────────────────────────── */

function AuctionCardItem({
  auction,
  alreadyGuessed,
  guessedPrice,
  loggedIn,
  onSelect,
  onDetails,
}: {
  auction: AuctionCard;
  alreadyGuessed: boolean;
  guessedPrice?: number;
  loggedIn: boolean;
  onSelect: () => void;
  onDetails: () => void;
}) {
  const isOpen = auction.status === "open";
  const isEndingSoon = auction.status === "ending_soon";
  const isEnded = auction.status === "ended";

  return (
    <div
      className={`bg-[#16181f] border rounded-xl overflow-hidden transition group ${
        isOpen
          ? "border-[#00D4AA]/20 hover:border-[#00D4AA]/40"
          : isEndingSoon
          ? "border-[#FFB547]/20 hover:border-[#FFB547]/30"
          : "border-white/[0.05] opacity-75"
      }`}
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
        <div className="absolute top-3 right-3">
          <StatusBadge status={auction.status} deadline={auction.deadline} />
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

        {/* Action area */}
        {alreadyGuessed ? (
          <div className="bg-[#00D4AA]/10 border border-[#00D4AA]/20 rounded-lg p-3 text-center">
            <p className="text-xs text-[#00D4AA]">Your guess</p>
            <p className="font-mono font-bold text-white">
              {formatCurrency(guessedPrice)}
            </p>
          </div>
        ) : isOpen ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onDetails}
              aria-label={`View details for ${typeof auction.title === "string" ? auction.title : "auction"}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-2 text-sm text-gray-300 hover:text-white hover:border-white/[0.2] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E94560]"
            >
              <Info className="h-4 w-4" aria-hidden />
              Details
            </button>
            <button
              onClick={onSelect}
              className="flex-1 bg-[#E94560] hover:bg-[#E94560]/90 text-white font-semibold py-2.5 rounded-lg transition text-sm"
            >
              Make Your Guess
            </button>
          </div>
        ) : isEndingSoon ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onDetails}
              aria-label={`View details for ${typeof auction.title === "string" ? auction.title : "auction"}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-2 text-sm text-gray-300 hover:text-white hover:border-white/[0.2] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E94560]"
            >
              <Info className="h-4 w-4" aria-hidden />
              Details
            </button>
            <div className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs text-[#FFB547] bg-[#FFB547]/5 border border-[#FFB547]/10 rounded-lg">
              <Lock className="w-3.5 h-3.5" />
              Guessing closed — ending soon
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onDetails}
              aria-label={`View details for ${typeof auction.title === "string" ? auction.title : "auction"}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-2 text-sm text-gray-300 hover:text-white hover:border-white/[0.2] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E94560]"
            >
              <Info className="h-4 w-4" aria-hidden />
              Details
            </button>
            <div className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs text-gray-500">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Auction ended — awaiting results
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Section header ─────────────────────────────────────────────────── */

function SectionHeader({
  icon,
  title,
  count,
  color,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  color: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={`flex items-center gap-2 ${color}`}>
        {icon}
        <h2 className="text-lg font-bold text-white">{title}</h2>
      </div>
      <span className="text-sm text-gray-400">({count})</span>
      {subtitle && <span className="text-xs text-gray-500 hidden sm:block">— {subtitle}</span>}
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────── */

export default function GuessTheHammerClient(props: Props) {
  return (
    <GuessTheHammerErrorBoundary>
      <GuessTheHammerInner {...props} />
    </GuessTheHammerErrorBoundary>
  );
}

function GuessTheHammerInner({
  auctions,
  counts,
  recentResults,
  userGuesses,
  userBalance,
  isAuthenticated,
}: Props) {
  const { data: session } = useSession();
  const loggedIn = isAuthenticated || !!session;

  const [activeTab, setActiveTab] = useState<"play" | "results" | "leaderboard">("play");
  const [isVirtual, setIsVirtual] = useState(true);
  const [selectedAuction, setSelectedAuction] = useState<AuctionCard | null>(null);
  const [guessPrice, setGuessPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [localGuesses, setLocalGuesses] = useState(userGuesses);
  const [makeFilter, setMakeFilter] = useState<string>("all");
  const [showAllOpen, setShowAllOpen] = useState(false);
  const [showScoring, setShowScoring] = useState(false);
  const [detailsOpenId, setDetailsOpenId] = useState<string | null>(null);

  const detailsAuction = useMemo(() => {
    if (detailsOpenId === null) return null;
    return (
      auctions.find(
        (a) => typeof a._id === "string" && a._id === detailsOpenId
      ) ?? null
    );
  }, [auctions, detailsOpenId]);

  const FEATURED_COUNT = 20;

  // Extract available makes for filter pills
  const allOpenAuctions = auctions.filter((a) => a.status === "open");
  const availableMakes = Array.from(new Set(allOpenAuctions.map((a) => a.make)))
    .filter((m) => m !== "Other")
    .sort();

  // Apply make filter
  const filteredOpen = makeFilter === "all"
    ? allOpenAuctions
    : allOpenAuctions.filter((a) => a.make === makeFilter);

  // Show top N unless expanded or filtered
  const openAuctions = (makeFilter !== "all" || showAllOpen)
    ? filteredOpen
    : filteredOpen.slice(0, FEATURED_COUNT);
  const hasMoreOpen = makeFilter === "all" && !showAllOpen && filteredOpen.length > FEATURED_COUNT;

  const endingSoonAuctions = auctions.filter((a) => a.status === "ending_soon");
  const endedAuctions = auctions.filter((a) => a.status === "ended");

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
    {
      key: "play" as const,
      label: `Play (${allOpenAuctions.length})`,
      icon: <Gavel className="w-4 h-4" />,
    },
    {
      key: "results" as const,
      label: "Results",
      icon: <Trophy className="w-4 h-4" />,
    },
    {
      key: "leaderboard" as const,
      label: "Leaderboard",
      icon: <Medal className="w-4 h-4" />,
    },
  ];

  function handleSelect(auction: AuctionCard) {
    if (!loggedIn) {
      window.location.href = "/login_page?redirect=/price_is_right";
      return;
    }
    setSelectedAuction(auction);
    setError(null);
    setSuccess(null);
    setGuessPrice("");
  }

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

      {/* How Scoring Works — collapsible */}
      <div className="mb-8">
        <button
          onClick={() => setShowScoring(!showScoring)}
          className="w-full bg-[#16181f] border border-white/[0.08] rounded-xl px-5 py-3.5 flex items-center justify-between hover:border-white/[0.15] transition"
        >
          <div className="flex items-center gap-2.5">
            <Info className="w-4.5 h-4.5 text-[#FFB547]" />
            <span className="text-sm font-semibold text-white">How Scoring Works</span>
          </div>
          {showScoring ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
        {showScoring && (
          <div className="mt-2 bg-[#16181f] border border-white/[0.08] rounded-xl p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#0A0A1A] rounded-lg p-4 border border-white/[0.05]">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-[#00D4AA]" />
                  <h4 className="text-xs font-semibold text-[#00D4AA] uppercase tracking-wider">Accuracy</h4>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Your score is based on how close your guess is to the final sale price.
                  <span className="text-white font-medium"> Closer = better.</span>
                </p>
              </div>
              <div className="bg-[#0A0A1A] rounded-lg p-4 border border-white/[0.05]">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-[#E94560]" />
                  <h4 className="text-xs font-semibold text-[#E94560] uppercase tracking-wider">Over-Guess Penalty</h4>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  <span className="text-white font-medium">Price is Right rules</span> — guess over the actual price
                  and your error is <span className="text-[#E94560] font-bold">doubled</span>. Going under is always safer.
                </p>
              </div>
              <div className="bg-[#0A0A1A] rounded-lg p-4 border border-white/[0.05]">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-4 h-4 text-[#FFB547]" />
                  <h4 className="text-xs font-semibold text-[#FFB547] uppercase tracking-wider">Winning</h4>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  <span className="text-white font-medium">Free Play:</span> earn leaderboard rank.{" "}
                  <span className="text-white font-medium">Cash ($5):</span> closest guess wins the pot.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2 border-t border-white/[0.05]">
              <Lock className="w-3.5 h-3.5 text-[#FFB547] flex-shrink-0" />
              <p className="text-xs text-gray-500">
                Guessing locks <span className="text-gray-300">12 hours</span> before auction ends — no last-second sniping.
                Leaderboard ranks by <span className="text-gray-300">average accuracy</span> across all your graded games.
              </p>
            </div>
          </div>
        )}
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
        {loggedIn && (
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

      {/* ── Auctions Tab ──────────────────────────────────────────────── */}
      {activeTab === "play" && (
        <>
          {auctions.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Gavel className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No auctions available</p>
              <p className="text-sm mt-2">Check back soon — new auctions appear daily</p>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Open for Guessing */}
              {allOpenAuctions.length > 0 && (
                <section>
                  <SectionHeader
                    icon={<span className="h-2.5 w-2.5 rounded-full bg-[#00D4AA] animate-pulse" />}
                    title="Open for Guessing"
                    count={filteredOpen.length}
                    color="text-[#00D4AA]"
                    subtitle={makeFilter === "all" ? "Top picks by value" : `Filtered: ${makeFilter}`}
                  />

                  {/* Make filter pills */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <button
                      onClick={() => { setMakeFilter("all"); setShowAllOpen(false); }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition border ${
                        makeFilter === "all"
                          ? "bg-[#00D4AA]/10 text-[#00D4AA] border-[#00D4AA]/30"
                          : "bg-[#0A0A1A] text-gray-400 border-white/[0.08] hover:border-gray-500"
                      }`}
                    >
                      All ({allOpenAuctions.length})
                    </button>
                    {availableMakes.map((make) => {
                      const count = allOpenAuctions.filter((a) => a.make === make).length;
                      return (
                        <button
                          key={make}
                          onClick={() => { setMakeFilter(make); setShowAllOpen(false); }}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition border ${
                            makeFilter === make
                              ? "bg-[#00D4AA]/10 text-[#00D4AA] border-[#00D4AA]/30"
                              : "bg-[#0A0A1A] text-gray-400 border-white/[0.08] hover:border-gray-500"
                          }`}
                        >
                          {make} ({count})
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {openAuctions.map((auction) => (
                      <AuctionCardItem
                        key={auction._id}
                        auction={auction}
                        alreadyGuessed={auction._id in localGuesses}
                        guessedPrice={localGuesses[auction._id]}
                        loggedIn={loggedIn}
                        onSelect={() => handleSelect(auction)}
                        onDetails={() => setDetailsOpenId(auction._id)}
                      />
                    ))}
                  </div>

                  {hasMoreOpen && (
                    <button
                      onClick={() => setShowAllOpen(true)}
                      className="mt-4 flex items-center gap-2 text-sm text-[#00D4AA] hover:text-[#00D4AA]/80 transition mx-auto"
                    >
                      <ChevronDown className="w-4 h-4" />
                      Show all {filteredOpen.length} auctions
                    </button>
                  )}
                </section>
              )}

              {/* Ending Soon (locked) */}
              {endingSoonAuctions.length > 0 && (
                <section>
                  <SectionHeader
                    icon={<Timer className="w-5 h-5 text-[#FFB547]" />}
                    title="Ending Soon"
                    count={endingSoonAuctions.length}
                    color="text-[#FFB547]"
                    subtitle="Under 12h — guessing locked"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {endingSoonAuctions.map((auction) => (
                      <AuctionCardItem
                        key={auction._id}
                        auction={auction}
                        alreadyGuessed={auction._id in localGuesses}
                        guessedPrice={localGuesses[auction._id]}
                        loggedIn={loggedIn}
                        onSelect={() => {}}
                        onDetails={() => setDetailsOpenId(auction._id)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Recently Ended */}
              {endedAuctions.length > 0 && (
                <section>
                  <SectionHeader
                    icon={<CheckCircle2 className="w-5 h-5 text-gray-500" />}
                    title="Recently Ended"
                    count={endedAuctions.length}
                    color="text-gray-400"
                    subtitle="Past auctions — results incoming"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {endedAuctions.slice(0, 12).map((auction) => (
                      <AuctionCardItem
                        key={auction._id}
                        auction={auction}
                        alreadyGuessed={auction._id in localGuesses}
                        guessedPrice={localGuesses[auction._id]}
                        loggedIn={loggedIn}
                        onSelect={() => {}}
                        onDetails={() => setDetailsOpenId(auction._id)}
                      />
                    ))}
                  </div>
                  {endedAuctions.length > 12 && (
                    <button
                      onClick={() => {/* could expand */}}
                      className="mt-4 text-sm text-gray-400 hover:text-white transition"
                    >
                      Show all {endedAuctions.length} ended auctions
                    </button>
                  )}
                </section>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Results Tab ───────────────────────────────────────────────── */}
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

      {/* ── Leaderboard Tab ───────────────────────────────────────────── */}
      {activeTab === "leaderboard" && <LeaderboardSection />}

      {/* ── Guess Modal (Radix Dialog: focus trap, Esc, restore focus, role) ─ */}
      <DialogPrimitive.Root
        open={selectedAuction !== null}
        onOpenChange={(o) => {
          if (!o) setSelectedAuction(null);
        }}
      >
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content
            aria-describedby="guess-modal-description"
            className="fixed left-[50%] top-[50%] z-50 w-full max-w-md -translate-x-[50%] -translate-y-[50%] bg-[#16181f] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
              <DialogPrimitive.Title className="text-lg font-bold text-white">
                Your Prediction
              </DialogPrimitive.Title>
              <DialogPrimitive.Close
                aria-label="Close"
                className="text-gray-400 hover:text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E94560] rounded"
              >
                <X className="w-5 h-5" />
              </DialogPrimitive.Close>
            </div>

            <DialogPrimitive.Description id="guess-modal-description" className="sr-only">
              {selectedAuction
                ? `Enter your hammer-price guess for ${selectedAuction.title}`
                : "Enter your hammer-price guess"}
            </DialogPrimitive.Description>

            {selectedAuction ? (
            <div className="p-6">
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
                {selectedAuction.deadline && (
                  <span>
                    <CountdownTimer deadline={selectedAuction.deadline} /> left
                  </span>
                )}
              </div>

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

              <div className="flex items-center justify-between text-xs text-gray-400 mb-6">
                <span>
                  {isVirtual ? "Free play — no charge" : `Entry fee: $${ENTRY_FEE}`}
                </span>
                {!isVirtual && (
                  <span>
                    Balance:{" "}
                    <span className="font-mono text-white">
                      {formatCurrency(userBalance)}
                    </span>
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
            ) : null}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
      {/* ── End Guess Modal ─────────────────────────────────────────────── */}

      {/* ── Auction Details Drawer ────────────────────────────────────── */}
      <AuctionDetailsDrawer
        auction={detailsAuction}
        open={detailsOpenId !== null}
        onOpenChange={(o) => {
          if (!o) setDetailsOpenId(null);
        }}
        onMakeGuess={() => {
          if (detailsAuction) {
            // Capture target so the closure isn't stale after re-render.
            const target = detailsAuction;
            setDetailsOpenId(null);
            // Defer to next tick so Radix's restore-focus pass on close
            // completes before the guess modal mounts and autoFocuses.
            setTimeout(() => handleSelect(target), 0);
          }
        }}
      />
    </div>
  );
}

/* ── Leaderboard ────────────────────────────────────────────────────── */

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
    myRank: {
      rank: number;
      totalGames: number;
      avgAccuracy: number;
      totalWinnings: number;
    } | null;
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
    return <div className="text-center py-20 text-gray-400">Loading leaderboard...</div>;
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
          <span className="font-mono text-[#00D4AA]">{data.myRank.avgAccuracy}%</span>{" "}
          accuracy across {data.myRank.totalGames} games
        </div>
      )}
    </div>
  );
}
