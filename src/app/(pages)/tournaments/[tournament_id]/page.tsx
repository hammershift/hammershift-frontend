"use client";
import React, { useState, useEffect } from "react";
import { createPageUrl } from "@/app/components/utils";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/badge";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { formatDistanceToNow, format, isValid, subDays } from "date-fns";
import {
  ArrowLeft,
  Trophy,
  DollarSign,
  Clock,
  Users,
  ChevronRight,
} from "lucide-react";
import { useParams } from "next/navigation";
import { Tournament } from "@/models/tournament.model";
import { Auction } from "@/models/auction.model";
import { Prediction } from "@/models/predictions.model";
import { authClient } from "@/lib/auth-client";
import { getTournamentById } from "@/lib/data";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from "@/lib/auth-client";
import { useTournamentPredictions } from "@/app/context/TournamentPredictionContext";
import { useTournament } from "@/app/context/TournamentContext";
import { getTournamentCars, getTournamentPredictions } from "@/lib/data";
import { addTournamentPredictions } from "@/lib/data";
import { BeatLoader } from "react-spinners";
interface TournamentPrediction {
  auction_id: string;
  title: string;
  value: string;
  hasEnded: boolean;
  hasError: boolean;
}

interface DropdownValues {
  value: string;
  label: string;
}

interface PredictionSet {
  [key: string]: Set<number>;
}

interface User {
  userId: string;
  fullName: string;
  username: string;
  role: string;
}

const TournamentDetails = () => {
  const params = useParams();
  const router = useRouter();
  const { tournament_id } = params as { tournament_id: string };
  const { setLatestTournamentPredictions } = useTournamentPredictions();
  const { setLatestTournament } = useTournament();
  const [tournament, setTournament] = useState<Tournament>();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [predictions, setPredictions] = useState<TournamentPrediction[]>([]);
  const [currentPredictions, setCurrentPredictions] = useState<Prediction[]>(
    []
  );
  const [filteredPredictions, setFilteredPredictions] = useState<Prediction[]>(
    []
  );

  const [dropdownLimit, setDropdownLimit] = useState<number>(5);
  const [predictionSets, setPredictionSets] = useState<PredictionSet>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasJoined, setHasJoined] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPredictionLoading, setIsPredictionLoading] =
    useState<boolean>(false);
  const { data: session } = useSession();

  const checkIfAllAuctionsAreOver = () => {
    return false;
    // const now = new Date();
    // return auctions.every((auction) => {
    //   const deadline = new Date(auction.attributes[12].value);
    //   return now > deadline;
    // });
  };
  const handlePredictionChange = (index: number, value: string) => {
    // setPredictions((prev) => ({
    //   ...prev,
    //   [auction_id]: value,
    // }));
    setPredictions((prev) => {
      const newPredictions = [...prev];
      newPredictions[index].value = value;
      newPredictions[index].hasError = false;
      return newPredictions;
    });
  };

  // const obfuscateAmount = (amount: number) => {
  //   if (!amount && amount !== 0) return "$0";

  //   const amountStr = amount.toLocaleString();

  //   if (amountStr.length <= 1) return "$" + amountStr;

  //   const firstDigit = amountStr[0];
  //   let result = "$" + firstDigit;

  //   for (let i = 1; i < amountStr.length; i++) {
  //     if (amountStr[i] === "," || amountStr[i] === ".") {
  //       result += amountStr[i];
  //     } else {
  //       result += "*";
  //     }
  //   }

  //   return result;
  // };

  const getDisplayName = (prediction: Prediction) => {
    if (prediction.user.role === "AGENT") {
      return `${prediction.user.fullName || ""}`;
    }

    if (prediction.user?.username) {
      return prediction.user.username;
    }

    // if (prediction.created_by) {
    //   const emailParts = prediction.created_by.split("@");
    //   if (emailParts.length > 0) {
    //     return emailParts[0];
    //   }
    // }
    return "Unknown Player";
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const formatTimeDistance = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "soon"; // Invalid date
      }
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "soon";
    }
  };

  const formatTimeLeft = (dateString: string) => {
    if (!dateString) return "No end date";

    try {
      const endDate = new Date(dateString);
      const endDateMinusOneDay = subDays(endDate, 1);
      if (!isValid(endDate)) {
        return "Invalid date";
      }

      const now = new Date();
      if (endDateMinusOneDay < now) {
        return "Ended";
      }

      return formatDistanceToNow(endDateMinusOneDay, { addSuffix: true });
    } catch (error) {
      console.error("Date formatting error", error);
      return "Date error";
    }
  };

  const handleDropdownChange = async (auction_id: string) => {
    setIsPredictionLoading(true);
    setFilteredPredictions(
      currentPredictions.filter((p) => p.auction_id === auction_id)
    );
    setDropdownLimit(5);
    setTimeout(() => setIsPredictionLoading(false), 500);
  };

  const handleSubmitPredictions = async () => {
    setError("");
    if (!tournament) return;
    if (!session || session === null || !session.user) {
      router.push("/login_page");
      return;
    }

    if (hasJoined) {
      setError("You have already joined this tournament.");
      return;
    }

    if (tournament.buyInFee > 0 && session.user.balance < tournament.buyInFee) {
      setError("You do not have enough balance to join this tournament.");
      return;
    }

    const invalidPredictions = predictions.filter(
      (p) =>
        (p.value.toString() === "" ||
          isNaN(Number(p.value)) ||
          Number(p.value) < 0) &&
        !p.hasEnded
    );

    if (invalidPredictions.length > 0) {
      setError("Please enter a valid amount for all auctions");
      const updatePredictions = predictions.map((p) => {
        if (invalidPredictions.includes(p)) {
          return {
            ...p,
            hasError: true,
          };
        }
        return p;
      });
      setPredictions(updatePredictions);
      return;
    }

    //check if a prediction value already exists

    // Pre-compute the sets outside the loop
    const predictionSets = currentPredictions.reduce(
      (acc: PredictionSet, p) => {
        if (!acc[p.auction_id]) {
          acc[p.auction_id] = new Set();
        }
        acc[p.auction_id].add(p.predictedPrice);
        return acc;
      },
      {}
    );
    let duplicateCount = 0;
    const updatePredictions = predictions.map((p) => {
      const predictedPrice = parseInt(p.value);
      const hasDuplicate =
        predictionSets[p.auction_id]?.has(predictedPrice) || false;

      if (hasDuplicate && !p.hasEnded) {
        duplicateCount++;
        return {
          ...p,
          hasError: true,
        };
      } else {
        return p;
      }
    });
    // for (const prediction of predictions) {
    //   const predictedPrice = parseInt(prediction.value);
    //   const hasDuplicate =
    //     predictionSets[prediction.auction_id]?.has(predictedPrice) || false;

    //   if (hasDuplicate && !prediction.hasEnded) {
    //     const updatePredictions = predictions.map((p) => {
    //       if (p.auction_id === prediction.auction_id) {
    //         return {
    //           ...p,
    //           hasError: true,
    //         };
    //       }
    //       return p;
    //     });
    //     setPredictions(updatePredictions);
    //     duplicateCount++;
    //   }
    // }

    if (duplicateCount > 0) {
      setError(
        "Other users have already predicted the amount for the highlighted auction(s). Please try again."
      );
      setPredictions(updatePredictions);
      return;
    }
    setIsSubmitting(true);

    try {
      if (tournament.buyInFee > 0) {
        //TODO: update user balance
      }

      const submitPredictions = predictions.map((prediction) => {
        return {
          auction_id: prediction.auction_id,
          tournament_id: tournament.tournament_id,
          predictedPrice: parseInt(prediction.value),
          predictionType: tournament.type,
          wagerAmount: tournament.buyInFee,
          user: {
            userId: session.user.id,
            fullName: session.user.name,
            username: session.user.username!,
            role: session.user.role!,
          },
          isActive: true,
        };
      });

      const res = await addTournamentPredictions(
        tournament.tournament_id,
        submitPredictions
      );

      if (res) {
        setHasJoined(true);
        setLatestTournamentPredictions(res.predictions);
        setLatestTournament(res.tournaments);
        router.push(`/tournaments/success`);
        //TODO: go to tournament success page
      }
    } catch (e) {
      console.error("Failed to submit predictions", e);
      setError("Failed to submit tournament predictions.");
    } finally {
      setIsSubmitting(false);
    }

    // const invalidPredictions = Object.entries(predictions).filter(
    //   (value) => {
    //     console.log(key);
    //     console.log(value);
    //     return predictions[key].toString() === "" || isNaN(Number(value[key]));
    //   }
    // );

    // const invalidPredictions = Object.entries(predictions).filter(
    //   (prediction) => {
    //     prediction.toString() === "" || isNaN(Number(prediction));
    //   }
    // );
  };

  useEffect(() => {
    async function loadTournament() {
      try {
        const res = await getTournamentById(tournament_id);

        if (
          session &&
          res.users.some((user: User) => user.userId === session.user.id)
        ) {
          setHasJoined(true);
        }
        setTournament(res);

        setIsLoading(false);
      } catch (e) {
        console.log(e);
      }
    }
    loadTournament();
  }, [session, tournament_id]);

  useEffect(() => {
    async function loadAuctions() {
      if (!tournament) return;
      try {
        const res = await getTournamentCars(tournament.tournament_id);
        setAuctions(res);

        const now = new Date();

        setPredictions(
          res.map((auction: Auction) => ({
            auction_id: auction.auction_id,
            title: auction.title,
            value: "",
            hasEnded: subDays(new Date(auction.attributes[12].value), 1) < now,
            hasError: false,
          }))
        );

        //get current predictions for tournament

        const currentPredictions = await getTournamentPredictions(
          tournament.tournament_id
        );
        if (currentPredictions) {
          setCurrentPredictions(currentPredictions);
          setFilteredPredictions(
            currentPredictions.filter(
              (p: Prediction) => p.auction_id === res[0].auction_id
            )
          );
        }
      } catch (e) {
        console.log(e);
      }
    }
    loadAuctions();
  }, [tournament]);

  return (
    <div className="container mx-auto px-4 py-12">
      <Button variant="ghost" className="mb-8" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Tournaments
      </Button>
      {isLoading || !tournament ? (
        <div className="container mx-auto px-4 py-12">
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center">
              {/* <BounceLoader
                color="#F2CA16"
                loading={isLoading}
                className="mx-auto"
              /> */}
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-b-transparent border-l-transparent border-r-transparent border-t-[#F2CA16]"></div>
              <p className="text-xl">Loading tournament details...</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-8 overflow-hidden rounded-xl bg-[#13202D]">
            <div className="relative aspect-[3/1]">
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-black to-transparent" />
              <Image
                src={tournament?.banner || ""}
                alt={tournament?.name || "Car Image"}
                layout="fill"
                className="object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 z-20 p-8">
                <h1 className="mb-2 text-3xl font-bold md:text-4xl">
                  {tournament?.name}
                </h1>
                <p className="max-w-2xl text-gray-300">
                  {tournament?.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-purple-500/20 text-purple-500">
                      {tournament?.isActive === true ? "ACTIVE" : "UPCOMING"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-[#F2CA16]" />
                    <span>
                      Entry:{" "}
                      {tournament?.buyInFee === 0
                        ? "Free"
                        : `$${tournament?.buyInFee}`}{" "}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-[#F2CA16]" />
                    <span>Prize: ${tournament?.prizePool}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#F2CA16]" />
                    <span>
                      Ends:{" "}
                      {format(
                        new Date(tournament!.endTime!.toString() || new Date()),
                        "MMM d, yyyy"
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#F2CA16]" />
                    <span>
                      {tournament.users.length}/{tournament.maxUsers} players
                    </span>
                  </div>
                </div>

                {/* Display tournament entry requirements */}
                {tournament!.buyInFee > 0 ? (
                  <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="rounded-lg bg-[#1E2A36] p-4 text-center">
                      <div className="mb-1 text-sm text-gray-400">
                        Entry Fee
                      </div>
                      <div className="text-xl font-bold text-[#F2CA16]">
                        {tournament?.buyInFee} Credits
                      </div>
                    </div>
                    {/* Additional requirements for paid tournaments */}
                  </div>
                ) : (
                  <div className="mt-6 rounded-lg border border-blue-800/30 bg-blue-900/20 p-4">
                    <p className="text-blue-400">
                      <strong>Free Tournament:</strong> This tournament is free
                      to join. No entry fee or KYC verification required.
                      Predictions made here are for entertainment purposes only.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mb-8 rounded-lg bg-[#13202D] p-6">
            <h2 className="mb-4 text-xl font-bold">TOURNAMENT RULES</h2>
            <p className="mb-4 text-gray-300">
              In this tournament, you&apos;ll predict the final hammer price for
              each car below. The person with the closest predictions across all
              cars will win the tournament. A 12% platform fee is deducted from
              the prize pool.
            </p>

            {tournament.buyInFee > 0 && (
              <div className="mb-4 rounded-md border border-gray-700 bg-gray-800/60 p-3">
                <p className="text-sm text-gray-400">
                  <strong>Disclaimer:</strong> Tournament participation involves
                  financial risk. Past performance is not indicative of future
                  results. Velocity Markets does not guarantee winnings.
                  Platform fee of 12% applies to all tournaments.
                </p>
              </div>
            )}

            {tournament.prizePool > 0 && (
              <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-[#1E2A36] p-4">
                  <h3 className="mb-2 text-lg font-bold text-[#F2CA16]">
                    1st PLACE
                  </h3>
                  <p className="text-xl font-bold">
                    ${tournament!.prizePool * 0.5}
                  </p>
                  <p className="text-sm text-gray-400">50% of prize pool</p>
                </div>
                <div className="rounded-lg bg-[#1E2A36] p-4">
                  <h3 className="mb-2 text-lg font-bold text-gray-300">
                    2nd PLACE
                  </h3>
                  <p className="text-xl font-bold">
                    ${tournament!.prizePool * 0.3}
                  </p>
                  <p className="text-sm text-gray-400">30% of prize pool</p>
                </div>
                <div className="rounded-lg bg-[#1E2A36] p-4">
                  <h3 className="mb-2 text-lg font-bold text-[#cd7f32]">
                    3rd PLACE
                  </h3>
                  <p className="text-xl font-bold">
                    ${tournament!.prizePool * 0.2}
                  </p>
                  <p className="text-sm text-gray-400">20% of prize pool</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-8 md:grid-cols-12">
            <div className="md:col-span-7">
              <h2 className="mb-6 text-2xl font-bold">TOURNAMENT CARS</h2>
              <div className="space-y-6">
                {auctions.map((auction) => (
                  <Card
                    key={auction.id}
                    className="overflow-hidden border-[#1E2A36] bg-[#13202D]"
                  >
                    <div className="grid grid-cols-5">
                      <div className="relative col-span-2">
                        <Image
                          src={auction.image}
                          alt={auction.title}
                          className="object-cover"
                          layout="fill"
                          objectFit="cover"
                        />
                      </div>
                      <div className="col-span-3 p-4">
                        <h3 className="mb-2 font-bold">{auction.title}</h3>
                        <div className="mb-4 grid grid-cols-2 gap-2">
                          <div>
                            <div className="text-xs text-gray-400">
                              Current Bid
                            </div>
                            <div className="font-bold text-[#F2CA16]">
                              ${auction.attributes[0].value.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400">Ends</div>
                            <div>
                              {formatDistanceToNow(
                                new Date(auction.attributes[12].value),
                                {
                                  addSuffix: true,
                                }
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <Button
                            variant="link"
                            className="p-0 text-[#F2CA16]"
                            onClick={() =>
                              router.push(
                                `${createPageUrl("auction_details")}?id=${
                                  auction.auction_id
                                }&mode=tournament`
                              )
                            }
                          >
                            View Details
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="md:col-span-5">
              <div className="sticky top-24">
                <Card className="border-[#1E2A36] bg-[#13202D]">
                  <CardContent className="p-6">
                    <h3 className="mb-6 text-xl font-bold">YOUR PREDICTIONS</h3>

                    {error && (
                      <div className="mb-4 rounded-md border border-red-900/50 bg-red-900/20 p-3 text-red-500">
                        {error}
                      </div>
                    )}
                    {/* {error.length > 0 &&
                      error.map((err, index) => (
                        <div
                          key={index}
                          className="mb-4 rounded-md border border-red-900/50 bg-red-900/20 p-3 text-red-500"
                        >
                          {err}
                        </div>
                      ))} */}

                    {hasJoined ? (
                      <div className="mb-4 rounded-md border border-green-900/50 bg-green-900/20 p-3 text-green-500">
                        You have already joined this tournament.
                      </div>
                    ) : tournament.haveWinners ||
                      new Date(tournament.endTime) < new Date() ? (
                      <div className="mb-4 rounded-md border border-red-500/50 bg-red-500/20 p-3 text-red-500">
                        Tournament has already ended.
                      </div>
                    ) : new Date(tournament.startTime) < new Date() ? (
                      <div className="mb-4 rounded-md border border-yellow-500/50 bg-yellow-500/20 p-3 text-yellow-500">
                        Tournament has already started.
                      </div>
                    ) : (
                      <>
                        <div className="mb-6 rounded-lg bg-[#1E2A36]/80 p-4">
                          <div className="mb-3 flex items-center justify-between">
                            <span className="text-gray-300">
                              Tournament Entry Fee:
                            </span>
                            <span className="font-bold text-[#F2CA16]">
                              {tournament.buyInFee === 0
                                ? "Free"
                                : `$${tournament.buyInFee}`}
                            </span>
                          </div>
                          {tournament.buyInFee > 0 && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-300">
                                Your Balance:
                              </span>
                              <span
                                className={`font-bold ${
                                  0 < tournament!.buyInFee
                                    ? "text-red-500"
                                    : "text-green-500"
                                }`}
                              >
                                $ {0}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">
                          {auctions.map((auction, index) => (
                            <div key={auction.id} className="space-y-2">
                              <label className="text-sm font-medium">
                                {/* make - model - year*/}
                                {/* {auction.attributes[2].value}{" "}
                                {auction.attributes[3].value} (
                                {auction.attributes[1].value}) */}
                                {auction.title}
                              </label>
                              <div className="relative">
                                {predictions[index].hasEnded ? (
                                  <Alert
                                    variant="destructive"
                                    className="text-red-500"
                                  >
                                    <AlertCircle className="h-4 w-4" />
                                    <p className="text-sm">
                                      This auction has ended
                                    </p>
                                  </Alert>
                                ) : (
                                  <>
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <Input
                                      type="number"
                                      value={predictions[
                                        index
                                      ].value.toString()}
                                      onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>
                                      ) =>
                                        handlePredictionChange(
                                          index,
                                          e.target.value
                                        )
                                      }
                                      className={`pl-8 ${predictions[index].hasError ? "border-red-500" : ""}`}
                                      placeholder="Enter your prediction"
                                      min="0"
                                      step="1"
                                    />
                                  </>
                                )}
                              </div>
                            </div>
                          ))}

                          <div className="mt-8">
                            <Button
                              className={`w-full ${hasJoined ? "cursor-not-allowed bg-green-600" : checkIfAllAuctionsAreOver() ? "cursor-not-allowed bg-gray-600" : "bg-purple-600 hover:bg-purple-700"} text-white`}
                              onClick={handleSubmitPredictions}
                              disabled={
                                isSubmitting ||
                                hasJoined ||
                                checkIfAllAuctionsAreOver() ||
                                (session?.user.balance || 0) <
                                  tournament.buyInFee
                              }
                            >
                              {isSubmitting
                                ? "Submitting..."
                                : hasJoined
                                  ? "Joined"
                                  : checkIfAllAuctionsAreOver()
                                    ? "All auctions are over"
                                    : `JOIN TOURNAMENT (${tournament.buyInFee > 0 ? `$ ${tournament.buyInFee}` : "FREE"})`}
                            </Button>
                            {(session?.user.balance || 0) <
                              tournament.buyInFee && (
                              <p className="mt-2 text-center text-sm text-red-500">
                                Insufficient credits. Please add more credits to
                                your account.
                              </p>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    <div className="mt-8">
                      <div className="flex justify-between">
                        <h4 className="mb-4 w-1/2 text-lg font-semibold">
                          Current Predictions
                        </h4>
                        <div className="mb-4 w-1/2">
                          <select
                            className="w-full rounded-lg bg-[#1E2A36] p-2 text-xs text-white"
                            name="auctions"
                            id="auctions"
                            onChange={(e) =>
                              handleDropdownChange(e.target.value)
                            }
                          >
                            {auctions.map((auction, index) => (
                              <option
                                className="truncate"
                                value={auction.auction_id}
                                key={index}
                              >
                                {auction.title}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {isPredictionLoading ? (
                          <div className="mt-4 flex items-center justify-center">
                            <BeatLoader color="yellow" />
                          </div>
                        ) : filteredPredictions &&
                          filteredPredictions.length > 0 ? (
                          filteredPredictions
                            .slice(0, dropdownLimit)
                            .map((prediction, index) => {
                              const isCurrentUser =
                                session &&
                                prediction.user.username ===
                                  session.user.username;

                              return (
                                <div
                                  key={index}
                                  className="flex items-center justify-between rounded-lg bg-[#1E2A36] p-4"
                                >
                                  <div className="flex items-center gap-4">
                                    <div
                                      className={`h-10 w-10 rounded-full ${
                                        prediction.user.role === "AGENT"
                                          ? "bg-purple-600"
                                          : "bg-[#F2CA16]"
                                      } flex items-center justify-center text-white`}
                                    >
                                      {prediction.user.role === "AGENT"
                                        ? "AI"
                                        : getInitials(
                                            getDisplayName(prediction)
                                          )}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2 font-medium">
                                        {getDisplayName(prediction)}
                                        {prediction.user.role === "AGENT" && (
                                          <Badge
                                            variant="outline"
                                            className="bg-purple-500/20 text-xs text-purple-500"
                                          >
                                            AI AGENT
                                          </Badge>
                                        )}
                                        {isCurrentUser && (
                                          <Badge
                                            variant="outline"
                                            className="bg-blue-500/20 text-xs text-blue-500"
                                          >
                                            YOU
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="text-sm text-gray-400">
                                        {prediction.createdAt
                                          ? formatTimeDistance(
                                              prediction.createdAt.toString()
                                            )
                                          : "recently"}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-xl font-bold text-[#F2CA16]">
                                    {"$" +
                                      prediction.predictedPrice.toLocaleString()}
                                  </div>
                                </div>
                              );
                            })
                        ) : (
                          <div className="py-4 text-center text-gray-400">
                            No predictions yet. Be the first to join!
                          </div>
                        )}
                        {!isPredictionLoading &&
                          filteredPredictions.length > dropdownLimit && (
                            <div className="flex justify-center">
                              <Button
                                className="bg-purple-600 text-white hover:bg-purple-700"
                                onClick={() => {
                                  setIsPredictionLoading(true);
                                  setDropdownLimit(dropdownLimit + 5);
                                  setTimeout(() => {
                                    setIsPredictionLoading(false);
                                  }, 300);
                                }}
                              >
                                Load More
                              </Button>
                            </div>
                          )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TournamentDetails;
