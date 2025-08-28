"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { createPageUrl } from "@/app/components/utils";
import { useTournamentPredictions } from "@/app/context/TournamentPredictionContext";
import { useTournament } from "@/app/context/TournamentContext";
import { Users, Trophy, Home, DollarSign } from "lucide-react";
import { Prediction } from "@/models/predictions.model";
import { getBatchCars } from "@/lib/data";
import { Auction } from "@/models/auction.model";
const TournamentSuccessPage = () => {
  const { latestTournament } = useTournament();
  const { latestTournamentPredictions } = useTournamentPredictions();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadPredictions = async () => {
      try {
        if (latestTournamentPredictions) {
          setPredictions(latestTournamentPredictions);

          if (latestTournamentPredictions.length > 0) {
            //get all the auction_ids
            const tournamentAuctions = latestTournamentPredictions.map(
              (prediction) => prediction.auction_id
            );

            const cars = await getBatchCars(tournamentAuctions);
            setAuctions(cars);
          }
        }
      } catch (e) {
        console.error("Error loading prediction data: ", e);
      } finally {
        setLoading(false);
      }
    };
    loadPredictions();
  }, [latestTournamentPredictions]);
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-[#F2CA16]"></div>
          <p className="text-gray-400">Loading your tournament entry...</p>
        </div>
      </div>
    );
  }
  if (!latestTournament || predictions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="mb-4 text-3xl font-bold">No Tournament Entry Found</h1>
        <p className="mb-8 text-gray-400">
          We couldn&apos;t find a recent tournament entry. Try joining a
          tournament!
        </p>
        <Link href={createPageUrl("tournaments")}>
          <Button className="bg-[#F2CA16] text-[#0C1924] hover:bg-[#F2CA16]/90">
            Browse Tournaments
          </Button>
        </Link>
      </div>
    );
  }
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-purple-500/20">
          <Trophy className="h-10 w-10 text-purple-500" />
        </div>
        <h1 className="mb-2 text-3xl font-bold">
          You&apos;ve joined the Tournament!
        </h1>
        <p className="mb-4 text-lg text-gray-400">
          Your entry for &quot;{latestTournament.name}&quot; has been confirmed.
        </p>

        <div className="mb-8 flex justify-center gap-6">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-[#F2CA16]" />
            <div className="text-left">
              <p className="text-sm text-gray-400">Entry Fee</p>
              <p className="font-bold">${latestTournament.buyInFee}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-[#F2CA16]" />
            <div className="text-left">
              <p className="text-sm text-gray-400">Prize Pool</p>
              <p className="font-bold">${latestTournament.prizePool}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-[#F2CA16]" />
            <div className="text-left">
              <p className="text-sm text-gray-400">Players</p>
              <p className="font-bold">
                {latestTournament.users.length}/{latestTournament.maxUsers}
              </p>
            </div>
          </div>
        </div>

        <h2 className="mb-4 text-xl font-bold">Your Predictions</h2>

        <div className="mb-8 space-y-4">
          {predictions.map((prediction, index) => {
            const auction = auctions.find(
              (auction) => auction.auction_id === prediction.auction_id
            );
            if (!auction) return null;

            return (
              <Card key={index} className="border-[#1E2A36] bg-[#13202D]">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex-1 text-left">
                      <h3 className="font-bold">{auction.title}</h3>
                      <div className="mt-1 flex items-center text-sm text-gray-400">
                        <span>
                          Current Bid: $
                          {auction.attributes[0].value.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="md:text-right">
                      <p className="text-sm text-gray-400">Your Prediction</p>
                      <p className="text-xl font-bold text-purple-500">
                        ${prediction.predictedPrice.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex flex-col justify-center gap-4 md:flex-row">
          <Link href={"/"}>
            <Button
              variant="outline"
              className="border-[#1E2A36] hover:bg-[#1E2A36]"
            >
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>

          <Link
            href={`${createPageUrl("tournaments")}/${latestTournament._id}`}
          >
            <Button className="bg-purple-600 text-white hover:bg-purple-700">
              <Trophy className="mr-2 h-4 w-4" />
              View Tournament Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TournamentSuccessPage;
