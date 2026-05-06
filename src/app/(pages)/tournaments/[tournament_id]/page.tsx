"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow, format, isValid } from "date-fns";
import {
  ArrowLeft,
  Trophy,
  DollarSign,
  Clock,
  Users,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Lock,
  Loader2,
  Share2,
} from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/badge";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { Tournament } from "@/models/tournament.model";
import { Auction } from "@/models/auction.model";
import { Prediction } from "@/models/predictions.model";
import { useTrackEvent } from "@/hooks/useTrackEvent";

interface LeaderboardEntry {
  user_id: string;
  username: string;
  fullName: string;
  rank: number;
  total_score: number;
  predictions_made: number;
  avg_accuracy: number;
  disqualified: boolean;
}

interface PredictionInput {
  auction_id: string;
  title: string;
  value: string;
  hasEnded: boolean;
  hasError: boolean;
}

export default function TournamentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const track = useTrackEvent();

  const tournament_id = params.tournament_id as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [predictions, setPredictions] = useState<PredictionInput[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [disqualified, setDisqualified] = useState<LeaderboardEntry[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [hasPredicted, setHasPredicted] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>("Free");
  const [countdown, setCountdown] = useState<string>("");

  // Countdown timer
  useEffect(() => {
    if (!tournament) return;
    const target = new Date(tournament.endTime);
    const now = new Date();
    const startTime = new Date(tournament.startTime);
    const isUpcoming = startTime > now;

    function updateCountdown() {
      const ref = isUpcoming ? startTime : target;
      const diff = ref.getTime() - Date.now();
      if (diff <= 0) {
        setCountdown(isUpcoming ? "Starting now" : "Ended");
        return;
      }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setCountdown(
        days > 0
          ? `${days}d ${hours}h ${minutes}m`
          : `${hours}h ${minutes}m ${seconds}s`
      );
    }
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [tournament]);

  // Leaderboard polling every 30s during active tournament
  useEffect(() => {
    if (!tournament) return;
    const now = new Date();
    const isActive = new Date(tournament.startTime) <= now && new Date(tournament.endTime) > now;
    if (!isActive) return;

    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/tournaments/${tournament._id}/leaderboard`);
        if (res.ok) {
          const data = await res.json();
          if (data.leaderboard) setLeaderboard(data.leaderboard);
        }
      } catch {}
    }, 30000);

    return () => clearInterval(poll);
  }, [tournament]);

  // Track page view
  useEffect(() => {
    if (tournament) {
      track('tournament_viewed', {
        tournament_id: tournament._id,
        tournament_name: tournament.name,
        type: tournament.type,
        prize_pool: tournament.prizePool,
        entry_fee: tournament.buyInFee
      });
    }
  }, [tournament]);

  // Load tournament data
  useEffect(() => {
    async function loadTournament() {
      try {
        const response = await fetch(`/api/tournaments?id=${tournament_id}`);
        const data = await response.json();

        if (response.ok) {
          setTournament(data);

          // Check if user has joined
          if (session && data.users) {
            const joined = data.users.some(
              (u: any) => u.userId === session.user.id
            );
            setHasJoined(joined);
          }
        } else {
          setError("Tournament not found");
        }
      } catch (error) {
        console.error("Error loading tournament:", error);
        setError("Failed to load tournament");
      } finally {
        setLoading(false);
      }
    }

    if (tournament_id) {
      loadTournament();
    }
  }, [tournament_id, session]);

  // Load auctions
  useEffect(() => {
    async function loadAuctions() {
      if (!tournament) return;

      try {
        // Fetch auctions by tournament auction_ids (batch query)
        const ids = tournament.auction_ids.join(",");
        const batchRes = await fetch(`/api/cars?auction_ids=${ids}`);
        let validAuctions: Auction[] = [];
        if (batchRes.ok) {
          const batchData = await batchRes.json();
          validAuctions = Array.isArray(batchData) ? batchData.filter((a: any) => a && a._id) : [];
        }

        // If batch returned nothing, try individual lookups (handles both ObjectId and auction_id)
        if (validAuctions.length === 0) {
          const auctionPromises = tournament.auction_ids.map(async (id: string) => {
            const response = await fetch(`/api/cars?auction_id=${id}`);
            return response.json();
          });
          const auctionData = await Promise.all(auctionPromises);
          validAuctions = auctionData.filter((a: any) => a && a._id);
        }

        setAuctions(validAuctions);

        // Initialize prediction inputs. Scraper writes sort.deadline 24h
        // early, so real end = deadline + 24h. Predictions close 1 hour
        // before that real end. These constants MUST match the ones used in
        // the render block or the two panels will disagree.
        const DAY_MS = 24 * 60 * 60 * 1000;
        const PREDICTION_BUFFER_MS = 60 * 60 * 1000;
        const now = Date.now();
        setPredictions(
          validAuctions.map((auction: Auction) => {
            const raw = auction.sort?.deadline;
            const closeAt = raw ? new Date(raw).getTime() + DAY_MS - PREDICTION_BUFFER_MS : 0;
            return {
              auction_id: auction._id,
              title: auction.title,
              value: "",
              hasEnded: closeAt > 0 ? closeAt <= now : false,
              hasError: false,
            };
          })
        );

        // Check if user already has predictions
        if (session && hasJoined) {
          const predResponse = await fetch(
            `/api/predictions?tournament_id=${tournament._id}`
          );
          if (predResponse.ok) {
            const predData = await predResponse.json();
            const userPredictions = predData.filter(
              (p: Prediction) => p.user.userId === session.user.id
            );
            if (userPredictions.length > 0) {
              setHasPredicted(true);
            }
          }
        }
      } catch (error) {
        console.error("Error loading auctions:", error);
      }
    }

    loadAuctions();
  }, [tournament, session, hasJoined]);

  // Load leaderboard (poll every 30 seconds)
  useEffect(() => {
    async function loadLeaderboard() {
      if (!tournament) return;

      try {
        const response = await fetch(
          `/api/tournaments/${tournament._id}/leaderboard`
        );

        if (response.ok) {
          const data = await response.json();
          setLeaderboard(data.leaderboard || []);
          setDisqualified(data.disqualified || []);
        }
      } catch (error) {
        console.error("Error loading leaderboard:", error);
      }
    }

    loadLeaderboard();

    // Poll every 30 seconds if tournament is active
    const interval = setInterval(() => {
      if (tournament && !isTournamentEnded()) {
        loadLeaderboard();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [tournament]);

  const isTournamentEnded = () => {
    if (!tournament) return false;
    return new Date(tournament.endTime) < new Date() || tournament.haveWinners;
  };

  const handlePredictionChange = (index: number, value: string) => {
    setPredictions((prev) => {
      const newPredictions = [...prev];
      newPredictions[index].value = value;
      newPredictions[index].hasError = false;
      return newPredictions;
    });
  };

  const handleJoinTournament = async () => {
    setError("");
    setSuccess("");

    if (!session) {
      router.push(`/login_page?redirect=/tournaments/${tournament_id}`);
      return;
    }

    if (hasJoined) {
      setError("You have already joined this tournament");
      return;
    }

    if (!tournament) return;

    // Check max participants
    if (
      tournament.max_participants &&
      tournament.users.length >= tournament.max_participants
    ) {
      setError("Tournament is full");
      return;
    }

    // Tier-based entry check
    const hasTiers = tournament.entryTiers && tournament.entryTiers.length > 0;
    if (hasTiers) {
      const tier = tournament.entryTiers!.find((t: any) => t.name === selectedTier);
      if (tier && tier.buyInAmount > 0) {
        if ((session.user.balance || 0) < tier.buyInAmount) {
          setError("Insufficient balance for this tier");
          return;
        }
        setShowPaymentModal(true);
        return;
      }
      // Free tier — join directly
      await joinTournament();
      return;
    }

    // Legacy: check entry fee for paid tournaments
    if (tournament.type === "paid" && tournament.buyInFee > 0) {
      if ((session.user.balance || 0) < tournament.buyInFee) {
        setError("Insufficient balance");
        return;
      }

      // Show payment confirmation modal
      setShowPaymentModal(true);
      return;
    }

    // Join free tournament
    await joinTournament();
  };

  const joinTournament = async () => {
    if (!tournament) return;

    setSubmitting(true);

    try {
      const hasTiers = tournament.entryTiers && tournament.entryTiers.length > 0;
      const response = await fetch(`/api/tournaments/${tournament._id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hasTiers ? { tierName: selectedTier } : {}),
      });

      const data = await response.json();

      if (response.ok) {
        track("tournament_joined", {
          tournament_id: tournament._id,
          tournament_name: tournament.name,
          entry_fee: tournament.buyInFee,
          prize_pool: tournament.prizePool
        });

        setSuccess("Successfully joined tournament!");
        setHasJoined(true);
        setShowPaymentModal(false);

        // Refresh tournament data
        router.refresh();
      } else {
        setError(data.error || "Failed to join tournament");
      }
    } catch (error) {
      console.error("Error joining tournament:", error);
      setError("An error occurred while joining the tournament");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBatchSubmit = async () => {
    setError("");
    setSuccess("");

    if (!tournament || !session) return;

    // Validate all predictions filled
    const incompletePredictions = predictions.filter(
      (p) =>
        (!p.value || p.value.trim() === "" || isNaN(Number(p.value)) || Number(p.value) < 0) &&
        !p.hasEnded
    );

    if (incompletePredictions.length > 0) {
      setError(`Please enter valid predictions for all ${auctions.length} auctions`);
      setPredictions((prev) =>
        prev.map((p) => ({
          ...p,
          hasError: incompletePredictions.includes(p)
        }))
      );
      return;
    }

    setSubmitting(true);

    try {
      const predictionData = predictions
        .filter(p => !p.hasEnded)
        .map((prediction) => ({
          auction_id: prediction.auction_id,
          tournament_id: tournament._id,
          predictedPrice: parseInt(prediction.value),
          predictionType: "tournament"
        }));

      const response = await fetch("/api/predictions/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ predictions: predictionData })
      });

      const data = await response.json();

      if (response.ok) {
        track("tournament_predictions_submitted", {
          tournament_id: tournament._id,
          prediction_count: predictionData.length
        });

        setSuccess("All predictions submitted successfully!");
        setHasPredicted(true);
        router.push("/tournaments/success");
      } else {
        setError(data.error || "Failed to submit predictions");
      }
    } catch (error) {
      console.error("Error submitting predictions:", error);
      setError("An error occurred while submitting predictions");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-12">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-[#E94560]" />
          <p className="text-xl">Loading tournament details...</p>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Tournament not found"}</AlertDescription>
        </Alert>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tournaments
        </Button>
      </div>
    );
  }

  const tournamentEnded = isTournamentEnded();

  // Scraper offsets sort.deadline by -24h from the real BaT end. We
  // compensate so "Live vs Ended" reflects the true auction state, not
  // the stale scraper timestamp. Predictions close PREDICTION_BUFFER_MS
  // before the real end to avoid last-second races.
  const DAY_MS = 24 * 60 * 60 * 1000;
  const PREDICTION_BUFFER_MS = 60 * 60 * 1000;
  const auctionRealEnd = (a: Auction): number => {
    const raw = a.sort?.deadline;
    if (!raw) return 0;
    return new Date(raw).getTime() + DAY_MS;
  };
  const predictionCloseAt = (a: Auction): number => {
    const end = auctionRealEnd(a);
    return end > 0 ? end - PREDICTION_BUFFER_MS : 0;
  };
  const liveAuctions = auctions
    .filter((a) => predictionCloseAt(a) > Date.now())
    .sort((a, b) => predictionCloseAt(a) - predictionCloseAt(b));
  const endedAuctions = auctions
    .filter((a) => predictionCloseAt(a) <= Date.now())
    .sort((a, b) => auctionRealEnd(b) - auctionRealEnd(a));

  return (
    <div className="container mx-auto px-4 py-12">
      <Button variant="ghost" className="mb-8" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Tournaments
      </Button>

      {/* Hero Banner */}
      <div className="mb-8 overflow-hidden rounded-xl bg-[#16181f]">
        <div className="relative aspect-[3/1] min-h-[240px]">
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-black to-transparent" />
          <Image
            src={tournament.banner || tournament.featured_image || ""}
            alt={tournament.name}
            fill
            className="object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 z-20 p-8">
            <h1 className="mb-2 text-3xl font-bold md:text-4xl">
              {tournament.name}
            </h1>
            <p className="max-w-2xl text-gray-300">{tournament.description}</p>

            <div className="mt-4 flex flex-wrap gap-4">
              <Badge
                className={
                  tournamentEnded
                    ? "bg-red-500/20 text-red-500"
                    : "bg-green-500/20 text-green-500"
                }
              >
                {tournamentEnded ? "ENDED" : tournament.isActive ? "LIVE" : "UPCOMING"}
              </Badge>

              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-[#FFB547]" />
                <span>
                  Entry: {tournament.buyInFee === 0 ? "FREE" : `$${tournament.buyInFee}`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-[#FFB547]" />
                <span className="font-['JetBrains_Mono']">
                  Prize: ${tournament.prizePool || 0}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#FFB547]" />
                <span>
                  Ends: {format(new Date(tournament.endTime), "MMM d, yyyy")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#FFB547]" />
                <span>
                  {tournament.users.length}/{tournament.max_participants || tournament.maxUsers}{" "}
                  players
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Countdown */}
      {countdown && (
        <div className="mb-6 rounded-xl border border-[#E94560]/20 bg-[#E94560]/5 p-4 text-center">
          <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
            {new Date(tournament.startTime) > new Date() ? "Starts in" : "Time remaining"}
          </p>
          <p className="font-mono text-2xl font-bold text-white">{countdown}</p>
        </div>
      )}

      {/* Entry Tier Selection */}
      {!hasJoined && !tournamentEnded && tournament.entryTiers && tournament.entryTiers.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-white mb-3">Choose Your Entry Tier</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(tournament.entryTiers as any[]).map((tier: any) => (
              <button
                key={tier.name}
                onClick={() => setSelectedTier(tier.name)}
                className={`rounded-xl border p-4 text-left transition ${
                  selectedTier === tier.name
                    ? "border-[#FFB547] bg-[#FFB547]/10"
                    : "border-white/[0.08] bg-[#16181f] hover:border-white/[0.14]"
                }`}
              >
                <div className="font-bold text-white mb-1">{tier.name}</div>
                <div className="font-mono text-lg text-[#FFB547]">
                  {tier.buyInAmount === 0 ? "Free" : `$${tier.buyInAmount}`}
                </div>
                {tier.prizeMultiplier > 0 && (
                  <div className="text-xs text-gray-400 mt-1">
                    {tier.prizeMultiplier}x prize multiplier
                  </div>
                )}
                <div className="text-xs text-gray-400 mt-1">
                  {tier.currentEntries}/{tier.maxEntries} spots
                </div>
                {tier.currentEntries >= tier.maxEntries && (
                  <div className="text-xs text-[#E94560] mt-1 font-semibold">FULL</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Alerts */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-500 bg-green-500/10">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-500">{success}</AlertDescription>
        </Alert>
      )}

      {/* Tournament Rules */}
      <Card className="mb-8 border-white/[0.08] bg-[#16181f] p-6">
        <h2 className="mb-4 text-xl font-bold">TOURNAMENT RULES</h2>
        <p className="mb-4 text-gray-300">
          In this tournament, you&apos;ll predict the final hammer price for each car
          below. The person with the closest predictions across all cars will win the
          tournament.
          {tournament.type === "paid" &&
            " A 12% platform fee is deducted from the prize pool."}
        </p>

        {/* Prize Distribution */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-[#1E2A36] p-4">
            <h3 className="mb-2 text-lg font-bold text-[#FFB547]">1st PLACE</h3>
            <p className="font-['JetBrains_Mono'] text-xl font-bold">
              {tournament.type === "paid"
                ? `$${Math.round(tournament.prizePool * 0.5)}`
                : `${Math.round(tournament.auction_ids.length * 10 * 0.5)} points`}
            </p>
            <p className="text-sm text-gray-400">50% of prize pool</p>
          </div>

          <div className="rounded-lg bg-[#1E2A36] p-4">
            <h3 className="mb-2 text-lg font-bold text-gray-300">2nd PLACE</h3>
            <p className="font-['JetBrains_Mono'] text-xl font-bold">
              {tournament.type === "paid"
                ? `$${Math.round(tournament.prizePool * 0.3)}`
                : `${Math.round(tournament.auction_ids.length * 10 * 0.3)} points`}
            </p>
            <p className="text-sm text-gray-400">30% of prize pool</p>
          </div>

          <div className="rounded-lg bg-[#1E2A36] p-4">
            <h3 className="mb-2 text-lg font-bold text-[#cd7f32]">3rd PLACE</h3>
            <p className="font-['JetBrains_Mono'] text-xl font-bold">
              {tournament.type === "paid"
                ? `$${Math.round(tournament.prizePool * 0.2)}`
                : `${Math.round(tournament.auction_ids.length * 10 * 0.2)} points`}
            </p>
            <p className="text-sm text-gray-400">20% of prize pool</p>
          </div>
        </div>

        {!hasJoined && !tournamentEnded && liveAuctions.length > 0 && (
          <div className="mt-6 rounded-lg border border-[#FFB547] bg-[#FFB547]/10 p-4">
            <p className="text-sm text-[#FFB547]">
              <strong>Important:</strong> You must predict all {liveAuctions.length}{" "}
              open {liveAuctions.length === 1 ? "auction" : "auctions"} to qualify for prizes.
              Predictions lock 1 hour before each auction ends.
              {endedAuctions.length > 0 && (
                <>
                  {" "}
                  Predictions are already closed on {endedAuctions.length}{" "}
                  {endedAuctions.length === 1 ? "auction" : "auctions"} and are not required.
                </>
              )}
            </p>
          </div>
        )}
        {!hasJoined && !tournamentEnded && liveAuctions.length === 0 && auctions.length > 0 && (
          <div className="mt-6 rounded-lg border border-[#E94560] bg-[#E94560]/10 p-4">
            <p className="text-sm text-[#E94560]">
              <strong>Predictions are closed on every auction in this tournament.</strong>{" "}
              Joining now will not qualify you for prizes.
            </p>
          </div>
        )}
      </Card>

      {/* Two-Column Layout */}
      <div className="grid gap-8 md:grid-cols-12">
        {/* Left Column: Auctions */}
        <div className="md:col-span-7">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="text-2xl font-bold">TOURNAMENT CARS</h2>
            <p className="text-sm text-gray-400">
              {liveAuctions.length} live · {endedAuctions.length} ended
            </p>
          </div>

          {auctions.length === 0 ? (
            <Card className="border-white/[0.08] bg-[#16181f] p-8 text-center">
              <Trophy className="mx-auto mb-3 h-10 w-10 text-gray-600" />
              <h3 className="mb-2 text-lg font-bold text-white">
                {tournamentEnded ? "Tournament results below" : "Cars loading soon"}
              </h3>
              <p className="text-sm text-gray-400">
                {tournamentEnded
                  ? "All cars in this tournament have concluded. Check the leaderboard to see how predictions landed."
                  : "Auction data is still syncing. Check back in a few minutes."}
              </p>
            </Card>
          ) : (
            <>
              {/* Live auctions — primary focus, sorted by urgency */}
              {liveAuctions.length > 0 && (
                <div className="mb-10">
                  {liveAuctions.length !== auctions.length && (
                    <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#00D4AA]">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00D4AA]" />
                      Open for predictions · locks 1 hour before each auction ends
                    </div>
                  )}
                  <div className="space-y-6">
                    {liveAuctions.map((auction) => (
                      <Card
                        key={auction._id}
                        className="overflow-hidden border-white/[0.08] bg-[#16181f]"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-5">
                          <div className="relative h-48 sm:col-span-2 sm:h-auto">
                            <Image
                              src={auction.image}
                              alt={auction.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="p-4 sm:col-span-3">
                            <h3 className="mb-2 font-bold">{auction.title}</h3>
                            <div className="mb-4 grid grid-cols-2 gap-2">
                              <div>
                                <div className="text-xs text-gray-400">Current Bid</div>
                                <div className="font-['JetBrains_Mono'] font-bold text-[#00D4AA]">
                                  ${(auction.sort?.price ?? auction.attributes?.[0]?.value ?? 0).toLocaleString()}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-400">Ends</div>
                                <div className="text-sm">
                                  {formatDistanceToNow(new Date(auctionRealEnd(auction)), {
                                    addSuffix: true,
                                  })}
                                </div>
                              </div>
                            </div>
                            <Link
                              href={`/auctions/car_view_page/${auction._id}`}
                              className="flex items-center text-[#E94560] hover:underline"
                            >
                              View Details
                              <ChevronRight className="ml-1 h-4 w-4" />
                            </Link>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Ended auctions — dimmed, collapsed visual */}
              {endedAuctions.length > 0 && (
                <div>
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-500" />
                    Predictions closed
                  </div>
                  <div className="space-y-3">
                    {endedAuctions.map((auction) => (
                      <Card
                        key={auction._id}
                        className="overflow-hidden border-white/[0.04] bg-[#16181f]/60 opacity-70 transition-opacity hover:opacity-100"
                      >
                        <div className="grid grid-cols-[80px_1fr_auto] items-center gap-3 p-3">
                          <div className="relative h-16 w-20 overflow-hidden rounded">
                            <Image
                              src={auction.image}
                              alt={auction.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-white">
                              {auction.title}
                            </h3>
                            <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                              <span className="font-['JetBrains_Mono'] text-[#00D4AA]">
                                ${(auction.sort?.price ?? 0).toLocaleString()}
                              </span>
                              <span>
                                {auctionRealEnd(auction) > Date.now() ? "Hammer" : "Ended"}{" "}
                                {formatDistanceToNow(new Date(auctionRealEnd(auction)), {
                                  addSuffix: true,
                                })}
                              </span>
                            </div>
                          </div>
                          <Link
                            href={`/auctions/car_view_page/${auction._id}`}
                            className="text-xs text-gray-400 hover:text-[#E94560]"
                          >
                            View
                            <ChevronRight className="ml-0.5 inline h-3 w-3" />
                          </Link>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Column: Predictions & Leaderboard */}
        <div className="md:col-span-5">
          <div className="sticky top-24">
            <Card className="border-white/[0.08] bg-[#16181f]">
              <CardContent className="p-6">
                {!hasJoined && !tournamentEnded ? (
                  <>
                    <h3 className="mb-6 text-xl font-bold">JOIN TOURNAMENT</h3>
                    <div className="mb-6 rounded-lg bg-[#1E2A36]/80 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-gray-300">Entry Fee:</span>
                        <span className="font-['JetBrains_Mono'] font-bold text-[#FFB547]">
                          {tournament.buyInFee === 0 ? "FREE" : `$${tournament.buyInFee}`}
                        </span>
                      </div>
                      {tournament.buyInFee > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Your Balance:</span>
                          <span
                            className={`font-['JetBrains_Mono'] font-bold ${
                              (session?.user.balance || 0) < tournament.buyInFee
                                ? "text-red-500"
                                : "text-green-500"
                            }`}
                          >
                            ${session?.user.balance || 0}
                          </span>
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={handleJoinTournament}
                      disabled={
                        submitting ||
                        liveAuctions.length === 0 ||
                        (tournament.max_participants &&
                          tournament.users.length >= tournament.max_participants)
                      }
                      className="w-full bg-[#E94560] text-white hover:bg-[#E94560]/90"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Joining...
                        </>
                      ) : liveAuctions.length === 0 ? (
                        "NO LIVE AUCTIONS"
                      ) : (
                        `JOIN TOURNAMENT (${tournament.buyInFee > 0 ? `$${tournament.buyInFee}` : "FREE"})`
                      )}
                    </Button>
                  </>
                ) : hasJoined && !hasPredicted && !tournamentEnded ? (
                  <>
                    <h3 className="mb-6 text-xl font-bold">YOUR PREDICTIONS</h3>

                    <div className="mb-6 space-y-4">
                      {predictions.map((prediction, index) => (
                        <div key={prediction.auction_id}>
                          <label className="mb-2 block text-sm font-medium">
                            {prediction.title}
                          </label>
                          {prediction.hasEnded ? (
                            <Alert variant="destructive">
                              <Lock className="h-4 w-4" />
                              <AlertDescription>Predictions closed for this auction</AlertDescription>
                            </Alert>
                          ) : (
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                              <Input
                                type="number"
                                value={prediction.value}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePredictionChange(index, e.target.value)}
                                className={`pl-10 ${prediction.hasError ? "border-red-500" : ""}`}
                                placeholder="Enter your prediction"
                                min="0"
                                step="1"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={handleBatchSubmit}
                      disabled={submitting}
                      className="w-full bg-[#00D4AA] text-black hover:bg-[#00D4AA]/90"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "SUBMIT ALL PREDICTIONS"
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    <h3 className="mb-6 text-xl font-bold">LIVE LEADERBOARD</h3>

                    {leaderboard.length === 0 ? (
                      <div className="py-8 text-center text-gray-400">
                        No qualified participants yet
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {leaderboard.slice(0, 20).map((entry) => (
                          <div
                            key={entry.user_id}
                            className={`flex items-center justify-between rounded-lg p-3 ${
                              session?.user.id === entry.user_id
                                ? "bg-[#E94560]/20 border border-[#E94560]"
                                : "bg-[#1E2A36]"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${
                                  entry.rank === 1
                                    ? "bg-[#FFB547] text-black"
                                    : entry.rank === 2
                                      ? "bg-gray-400 text-black"
                                      : entry.rank === 3
                                        ? "bg-[#cd7f32] text-black"
                                        : "bg-[#16181f] text-white"
                                }`}
                              >
                                {entry.rank}
                              </div>
                              <div>
                                <div className="font-medium">
                                  {entry.username}
                                  {session?.user.id === entry.user_id && (
                                    <Badge className="ml-2 bg-blue-500/20 text-xs text-blue-500">
                                      YOU
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {entry.avg_accuracy.toFixed(1)}% accuracy
                                </div>
                              </div>
                            </div>
                            <div className="font-['JetBrains_Mono'] text-lg font-bold text-[#00D4AA]">
                              {entry.total_score.toFixed(0)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Share result link for ended tournaments */}
                    {tournamentEnded && session && leaderboard.some(e => e.user_id === session.user.id) && (
                      <div className="mt-4 rounded-lg border border-[#01696F]/30 bg-[#01696F]/10 p-3 text-center">
                        <p className="text-sm text-gray-300 mb-2">Share your tournament result</p>
                        <Link
                          href={`/tournaments`}
                          className="inline-flex items-center gap-2 text-sm font-medium text-[#01696F] hover:text-[#00d4aa] transition"
                        >
                          <Share2 className="w-4 h-4" />
                          View & Share Results
                        </Link>
                      </div>
                    )}

                    {disqualified.length > 0 && (
                      <div className="mt-6">
                        <h4 className="mb-3 text-sm font-bold text-red-500">
                          DISQUALIFIED ({disqualified.length})
                        </h4>
                        <div className="space-y-2">
                          {disqualified.slice(0, 5).map((entry) => (
                            <div
                              key={entry.user_id}
                              className="flex items-center justify-between rounded-lg bg-red-500/10 p-2"
                            >
                              <span className="text-sm text-gray-400">
                                {entry.username}
                              </span>
                              <Badge className="bg-red-500/20 text-xs text-red-500">
                                {entry.predictions_made}/{tournament.auction_ids.length}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <Card className="w-full max-w-md border-white/[0.08] bg-[#16181f] p-6">
            <h3 className="mb-4 text-xl font-bold">Confirm Entry Fee</h3>
            <p className="mb-6 text-gray-300">
              You are about to join this tournament with an entry fee of{" "}
              <span className="font-['JetBrains_Mono'] font-bold text-[#FFB547]">
                ${tournament.buyInFee}
              </span>
              . This amount will be deducted from your balance.
            </p>
            <div className="flex gap-4">
              <Button
                onClick={() => setShowPaymentModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={joinTournament}
                disabled={submitting}
                className="flex-1 bg-[#E94560] text-white hover:bg-[#E94560]/90"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm & Join"
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
