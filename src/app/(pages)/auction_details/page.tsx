"use client";
import { useEffect, useState } from "react";
import { Types } from "mongoose";
import { Badge } from "@/app/components/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/card_component";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { USDollar } from "@/helpers/utils";
import { formatDistanceToNow, isValid, subDays } from "date-fns";
import {
  ArrowLeft,
  Car as CarIcon,
  Clock,
  DollarSign,
  Eye,
  Hash,
  Heart,
  Link as LinkIcon,
  Loader2,
  MapPin,
  MessageSquare,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  addPrediction,
  getCarData,
  getPredictionData,
  getPredictionDataFilter,
} from "@/lib/data";

import { CommentsSection } from "@/app/components/CommentsSection";
import { usePrediction } from "@/app/context/PredictionContext";
import { Car } from "@/models/auction.model";
import { Prediction } from "@/models/predictions.model";
import { Role } from "@/app/types/interfaces";

const GuessTheHammer = () => {
  const navigate = useRouter();
  const { setLatestPrediction } = usePrediction();

  const [car, setCar] = useState<Car>();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [prediction, setPrediction] = useState<string>("");
  const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [predictionLoading, setPredictionLoading] = useState<boolean>(true);
  const [userPrediction, setUserPrediction] = useState(null);
  const [mode, setMode] = useState<string>("free_play");
  const [carNotLoaded, setCarNotLoaded] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState(false);

  const freePlayActive = true; // TODO: add check if auction is active and current date isn't 1 day before the deadline
  const { data: session } = useSession();

  const formatTimeLeft = (dateString: string | undefined) => {
    if (dateString === undefined) return "No end date";
    if (!dateString) return "No end date";

    try {
      const endDate = new Date(dateString);

      if (!isValid(endDate)) {
        return "Invalid date";
      }

      const now = new Date();
      if (endDate < now) {
        return "Ended";
      }

      return formatDistanceToNow(endDate, { addSuffix: true });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Date error";
    }
  };

  const obfuscateAmount = (amount: number) => {
    if (amount === undefined || amount === null) return "$0";

    const amountStr = amount.toLocaleString();
    if (amountStr.length <= 1) return "$" + amountStr;

    const firstDigit = amountStr[0];
    let result = "$" + firstDigit;

    for (let i = 1; i < amountStr.length; i++) {
      if (amountStr[i] === "," || amountStr[i] === ".") {
        result += amountStr[i];
      } else {
        result += "*";
      }
    }

    return result;
  };

  const handlePredictionAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    if (rawValue === "") {
      setPrediction(rawValue);
      return;
    }

    if (/^(\d+(\.\d*)?|\.\d+)$/.test(rawValue)) {
      const numericValue = Number(rawValue);
      if (numericValue <= MAX_SAFE_INTEGER) {
        setPrediction(rawValue);
      } else {
        setPrediction(prediction);
      }
    }
  };

  const handlePredictionSubmit = async (e: { preventDefault: () => void }) => {
    if (e) e.preventDefault();

    if (session === null) {
      setError("You must be logged in to make a prediction.");
      return;
    }

    if (!car || !car._id) {
      setError("Car not found");
      return;
    }

    if (predictions.some((p) => p.user.username === session.user.username)) {
      setError("You have already made a prediction for this auction.");
      return;
    }

    const predictionValue = parseInt(prediction);
    if (isNaN(predictionValue) || predictionValue < 0) {
      setError("Please enter a valid prediction amount.");
      return;
    }

    if (predictions.some((p) => p.predictedPrice === predictionValue)) {
      setError(
        "A user has already predicted this amount. Please enter a different amount."
      );
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      let predictionData = {
        auction_id: car._id,
        predictedPrice: predictionValue,
        predictionType: mode,
        user: {
          userId: session.user.id, //TODO: change to string because the mongoose import is causing module not found errors. Instead convert to objectId on server side
          fullName: session.user.name,
          username: session.user.username!,
          role: "USER", //should be default USER since agents can't access this page
        },
        isActive: true,
      };

      const result = await addPrediction(predictionData);
      if (result) {
        setUserPrediction(result);
        setPredictions([...predictions, result]);
        setHasSubmitted(true);
        setLatestPrediction(predictionData);
        navigate.push("/free_play/success");
      }
    } catch (e) {
      console.error("Failed to submit prediction:", e);
      setError("Failed to submit prediction. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const auctionId = urlParams.get("id");
    const modeParam = urlParams.get("mode")!;

    //TODO: for now, mode is only free_play. Later on, add tournament and price_is_right
    setMode(modeParam);

    async function loadData() {
      if (auctionId) {
        try {
          const response = await getCarData(auctionId);
          if (response) {
            setCar(response);
          } else {
            setCar({
              _id: auctionId,
              auction_id: "",
              title: "Untitled Auction",
              website: "",
              image: "",
              page_url: "",
              isActive: false,
              attributes: [],
              views: 0,
              watchers: 0,
              comments: 0,
              description: [],
              images_list: [],
              listing_details: [],
              statusAndPriceChecked: false,
              pot: 0,
            });
          }

          try {
            const predictionData = await getPredictionData(auctionId);
            if (session?.user) {
              const sorted = predictionData.sort(
                (a: Prediction, b: Prediction) => {
                  if (session.user.username === a.user.username) {
                    return -1;
                  } else if (session.user.username === b.user.username) {
                    return 1;
                  } else {
                    return 0;
                  }
                }
              );
              setPredictions(sorted || []);
            } else {
              setPredictions(predictionData || []);
            }
          } catch (e) {
            console.error("Error loading predictions:", e);
            setPredictions([]);
          } finally {
            setPredictionLoading(false);
          }

          try {
            // const userData = await getUserData();
            if (session?.user && auctionId) {
              try {
                //TODO get user specific prediction, maybe filter just from the predictions array
                const existingPredictions = await getPredictionDataFilter(
                  auctionId,
                  "free_play",
                  session.user.username!
                );

                if (existingPredictions && existingPredictions.length > 0) {
                  setHasSubmitted(true);
                  setUserPrediction(existingPredictions[0]);
                  setPrediction(
                    existingPredictions[0].predicted_price?.toString() || ""
                  );
                }
              } catch (e) {
                console.error("Error loading user predictions:", e);
              }
            }
          } catch (e) {
            console.error("User is not logged in");
          }
        } catch (e) {
          console.error("Error loading car data:", e);
          setCar({
            _id: auctionId,
            auction_id: "",
            title: "Untitled Auction",
            website: "",
            image: "",
            page_url: "",
            isActive: false,
            attributes: [],
            views: 0,
            watchers: 0,
            comments: 0,
            description: [],
            images_list: [],
            listing_details: [],
            statusAndPriceChecked: false,
            pot: 0,
          });
        }
      }
    }
    loadData();
  }, [session]);
  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => {
          navigate.back();
        }}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 overflow-hidden lg:col-span-2">
          <div>
            <h1 className="mb-2 text-2xl font-bold md:text-3xl">
              {car?.title || "Untitled Auction"}
            </h1>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-[#2C2C2C]">
                {car?.website || "Unknown Platform"}
              </Badge>

              {/* {formatTimeLeft(car?.sort!.deadline.toString()) !== "Ended" ||
              formatTimeLeft(car?.sort!.deadline.toString()) !==
                "Invalid date" ? (
                <Badge className="bg-green-500/20 text-green-500">Active</Badge>
              ) : (
                <Badge className="bg-gray-500/20 text-gray-400">Ended</Badge>
              )} */}
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-[#13202D]">
              {car?.images_list && car?.images_list.length > 0 ? (
                <Image
                  src={
                    car?.images_list[selectedImage].src ||
                    "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80"
                  }
                  alt={"Car image"}
                  layout="responsive"
                  width={1600} // Add intrinsic width (use your image's actual width)
                  height={900} // Add intrinsic height (use your image's actual height - maintaining aspect ratio)
                  sizes="100vw" // Example sizes, adjust if needed
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#13202D]">
                  <CarIcon className="h-16 w-16 text-gray-500" />
                </div>
              )}
            </div>

            {car?.images_list && car?.images_list.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {car?.images_list.map((image, index) => (
                  <button
                    key={index}
                    className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded ${
                      selectedImage === index ? "ring-2 ring-[#F2CA16]" : ""
                    }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <Image
                      src={
                        image.src ||
                        "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80"
                      }
                      alt={`Thumbnail ${index + 1}`}
                      className="h-full w-full object-cover"
                      fill={true}
                      // onError={(e) => {
                      //   e.target.src =
                      //     "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80";
                      // }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <Tabs defaultValue="details">
            <TabsList className="bg-[#13202D]">
              <TabsTrigger
                value="details"
                className="data-[state=active]:bg-[#F2CA16] data-[state=active]:text-[#0C1924]"
              >
                Details
              </TabsTrigger>
              <TabsTrigger
                value="discussion"
                className="data-[state=active]:bg-[#F2CA16] data-[state=active]:text-[#0C1924]"
              >
                Discussion
              </TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-6 pt-4">
              <Card className="border-[#1E2A36] bg-[#13202D]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">DETAILS</CardTitle>
                </CardHeader>
                <CardContent>
                  {/*TODO: change this to not using attributes */}
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    {car?.attributes[2] && (
                      <div>
                        <div className="text-sm text-gray-400">Make</div>
                        <div>{car?.attributes[2].value}</div>
                      </div>
                    )}
                    {car?.attributes[3] && (
                      <div>
                        <div className="text-sm text-gray-400">Model</div>
                        <div>{car?.attributes[3].value}</div>
                      </div>
                    )}
                    {car?.attributes[1] && (
                      <div>
                        <div className="text-sm text-gray-400">Year</div>
                        <div>{car?.attributes[1].value}</div>
                      </div>
                    )}
                    {car?.attributes[8] && (
                      <div>
                        <div className="text-sm text-gray-400">Location</div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          {car?.attributes[8].value}
                        </div>
                      </div>
                    )}
                    {car?.attributes[7] && (
                      <div>
                        <div className="text-sm text-gray-400">Seller</div>
                        <div>{car?.attributes[7].value}</div>
                      </div>
                    )}
                    {car?.attributes[10] && (
                      <div>
                        <div className="text-sm text-gray-400">Lot #</div>
                        <div className="flex items-center gap-1">
                          <Hash className="h-3 w-3 text-gray-400" />
                          {car?.attributes[10].value}
                        </div>
                      </div>
                    )}
                    {/*Add mileage to attributes */}
                    {car?.listing_details[1] && (
                      <div>
                        <div className="text-sm text-gray-400">Mileage</div>
                        <div>{car?.listing_details[1]}</div>
                      </div>
                    )}
                    {car?.attributes[11] && (
                      <div>
                        <div className="text-sm text-gray-400">
                          Listing Type
                        </div>
                        <div>{car?.attributes[11].value}</div>
                      </div>
                    )}
                  </div>

                  {car?.listing_details && car?.listing_details.length > 0 && (
                    <div className="mt-6">
                      <div className="mb-2 text-sm text-gray-400">
                        HIGHLIGHTS
                      </div>
                      <ul className="list-inside list-disc space-y-1">
                        {car?.listing_details.map((detail, index) => (
                          <li key={index} className="text-gray-300">
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {car?.description && (
                    <div className="mt-6">
                      <div className="mb-2 text-sm text-gray-400">
                        DESCRIPTION
                      </div>

                      <div
                        className={`flex flex-col text-justify text-gray-300`}
                      >
                        {car.description
                          .slice(0, isExpanded ? car.description.length : 1)
                          .map((text) => {
                            if (Array.isArray(text)) {
                              return (
                                <ul
                                  className="list-inside list-disc"
                                  key={text}
                                >
                                  {text.map((points, index) => {
                                    return (
                                      <li className="mb-2" key={index}>
                                        {points}
                                      </li>
                                    );
                                  })}
                                </ul>
                              );
                              // text.map((points, index) => {
                              //   console.log(points);
                              //   return (
                              //     <ul key={index}>
                              //       <li className="mb-2" key={index}>
                              //         {points}
                              //       </li>
                              //     </ul>
                              //   );
                              // });
                            } else {
                              return (
                                <div key={text}>
                                  <p className="mb-2" key={text}>
                                    {text}
                                  </p>
                                </div>
                              );
                            }
                          })}
                      </div>
                      <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-sm text-gray-400 transition-colors hover:text-gray-300"
                      >
                        {isExpanded ? "Show less" : "Show more"}
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* <AIInsightCard car={car} /> */}
            </TabsContent>

            <TabsContent value="discussion" className="pt-4">
              <CommentsSection
                pageID={car?.auction_id || ""}
                pageType={"auction"}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="border-[#1E2A36] bg-[#13202D]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg sm:text-xl">
                AUCTION STATUS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-400 sm:text-sm">
                    Current Bid
                  </div>
                  <div className="text-xl font-bold text-[#F2CA16] sm:text-2xl">
                    {USDollar.format(car?.attributes[0].value)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 sm:text-sm">
                    Time Left
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div className="text-base sm:text-lg">
                      {car && formatTimeLeft(car?.sort!.deadline.toString())}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 sm:text-sm">Bids</div>
                  <div className="text-base sm:text-lg">
                    {car?.sort!.bids || 0}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 sm:text-sm">
                    Watchers
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4 text-gray-400" />
                    <div className="text-base sm:text-lg">
                      {car?.watchers || 0}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 sm:text-sm">Views</div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4 text-gray-400" />
                    <div className="text-base sm:text-lg">
                      {car?.views || 0}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 sm:text-sm">
                    Comments
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4 text-gray-400" />
                    <div className="text-base sm:text-lg">
                      {car?.comments || 0}
                    </div>
                  </div>
                </div>
              </div>

              {car?.isActive && car?.attributes[10] && (
                <Button
                  variant="outline"
                  className="w-full border-[#F2CA16] text-[#F2CA16] hover:bg-[#F2CA16] hover:text-[#0C1924]"
                  onClick={() => window.open(`${car.page_url}`, "_blank")}
                >
                  <LinkIcon className="mr-2 h-4 w-4" />
                  VIEW ON BaT
                </Button>
              )}
            </CardContent>
          </Card>

          {car?.isActive && (
            <div className="mb-8">
              {mode === "free_play" && (
                <>
                  {/*TODO: start date and end date does not exist yet, has to be set in admin panel? */}
                  {/* {formatTimeLeft(car?.sort.deadline.toString()) !== 'Ended' && formatTimeLeft(car?.sort.deadline.toString()) !== "Invalid date" && (
                    <Alert className="mb-4 border-yellow-800/30 bg-yellow-900/20">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      <AlertDescription className="text-yellow-400">
                        Free Play for this auction{" "}
                        {car?.free_play_end &&
                        new Date(car.free_play_end) < new Date()
                          ? "has ended"
                          : "is not yet active"}
                        .
                        {car?.free_play_start &&
                        new Date(car.free_play_start) > new Date()
                          ? ` Predictions open on ${new Date(car.free_play_start).toLocaleString()}.`
                          : ""}
                      </AlertDescription>
                    </Alert>
                  )} */}

                  <Card className="border-[#1E2A36] bg-[#13202D]">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl">FREE PLAY</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handlePredictionSubmit}>
                        {error && (
                          <Alert className="mb-4 border-red-800/30 bg-red-900/20">
                            <AlertDescription className="text-red-400">
                              {error}
                            </AlertDescription>
                          </Alert>
                        )}

                        <div className="space-y-4">
                          <div>
                            <label className="mb-1 block text-sm text-gray-400">
                              Your Prediction (USD)
                            </label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-500" />
                              <Input
                                type="text"
                                value={prediction}
                                onChange={handlePredictionAmount}
                                className="border-[#1E2A36] bg-[#1E2A36] pl-8 transition-colors hover:border-[#F2CA16]"
                                placeholder="Enter amount"
                              />
                            </div>
                          </div>
                          <Button
                            type="submit"
                            disabled={isSubmitting || !freePlayActive}
                            className="w-full bg-[#F2CA16] text-[#0C1924] hover:bg-[#F2CA16]/90"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                              </>
                            ) : (
                              "Submit Prediction"
                            )}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                    {/* <CardFooter className="flex justify-between border-t border-[#1E2A36] pt-4">
                      <p className="text-sm text-gray-400">
                        {car?.free_play_start && car?.free_play_end
                          ? `Predictions open: ${new Date(car.free_play_start).toLocaleString()} - ${new Date(car.free_play_end).toLocaleString()}`
                          : "Prediction window not specified"}
                      </p>
                    </CardFooter> */}
                  </Card>
                </>
              )}

              {/* {mode === "price_is_right" && (
                <>
                  {!hammerGameActive && (
                    <Alert className="mb-4 border-yellow-800/30 bg-yellow-900/20">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      <AlertDescription className="text-yellow-400">
                        Guess The Hammer for this auction{" "}
                        {car?.hammer_game_end &&
                        new Date(car.hammer_game_end) < new Date()
                          ? "has ended"
                          : "is not yet active"}
                        .
                        {car?.hammer_game_start &&
                        new Date(car.hammer_game_start) > new Date()
                          ? ` Wagering opens on ${new Date(car.hammer_game_start).toLocaleString()}.`
                          : ""}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Card className="border-[#1E2A36] bg-[#13202D] lg:col-span-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl">
                        GUESS THE HAMMER
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handlePredictionSubmit}>
                        {error && (
                          <Alert className="mb-4 border-red-800/30 bg-red-900/20">
                            <AlertDescription className="text-red-400">
                              {error}
                            </AlertDescription>
                          </Alert>
                        )}

                        <div className="space-y-4">
                          <div>
                            <label className="mb-1 block text-sm text-gray-400">
                              Your Prediction (USD)
                            </label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-500" />
                              <Input
                                type="number"
                                value={prediction}
                                onChange={(e) => setPrediction(e.target.value)}
                                className="border-[#1E2A36] bg-[#1E2A36] pl-8"
                                placeholder="Enter amount"
                              />
                            </div>
                          </div>
                          <Button
                            type="submit"
                            disabled={isSubmitting || !hammerGameActive}
                            className="w-full bg-[#F2CA16] text-[#0C1924] hover:bg-[#F2CA16]/90"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Placing Wager...
                              </>
                            ) : (
                              "Place Wager"
                            )}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t border-[#1E2A36] pt-4">
                      <p className="text-sm text-gray-400">
                        {car?.hammer_game_start && car?.hammer_game_end
                          ? `Wagering open: ${new Date(car.hammer_game_start).toLocaleString()} - ${new Date(car.hammer_game_end).toLocaleString()}`
                          : "Wagering window not specified"}
                      </p>
                    </CardFooter>
                  </Card>
                </>
              )} */}
            </div>
          )}

          <Card className="border-[#1E2A36] bg-[#13202D]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg sm:text-xl">PREDICTIONS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400 sm:text-base">
                    Players
                  </div>
                  <div className="text-lg font-bold sm:text-xl">
                    {
                      (predictions || []).filter(
                        (p) => mode === "free_play" //|| !p?.is_ai_agent
                      ).length
                    }
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 sm:text-base">
                    Prize
                  </div>
                  <div className="text-lg font-bold text-[#F2CA16] sm:text-xl">
                    {/*TODO: change this when paid auctions are implemented */}
                    10 points
                  </div>
                </div>
              </div>
              {predictionLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading predictions...
                </div>
              ) : (
                <div className="space-y-4">
                  {(predictions || [])
                    .filter((prediction) => prediction && mode === "free_play")

                    .map((prediction, index) => {
                      if (!prediction) return null;

                      const isCurrentUser =
                        session &&
                        prediction.user.username === session.user.username;

                      const displayAmount =
                        mode === "free_play"
                          ? USDollar.format(prediction.predictedPrice)
                          : isCurrentUser
                            ? USDollar.format(prediction.predictedPrice)
                            : obfuscateAmount(prediction.predictedPrice);

                      const getDisplayName = () => {
                        // if (prediction.is_ai_agent) {
                        //   return prediction.agent_id || "UnknownAgent";
                        // }

                        if (prediction.user?.username) {
                          return prediction.user.username;
                        }

                        // if (prediction.created_by) {
                        //   const emailParts = prediction.created_by.split("@");
                        //   if (emailParts.length > 0) {
                        //     return emailParts[0];
                        //   }
                        // }
                        return "Unknown User";
                      };

                      // const getAvatarBg = () => {
                      //   return prediction.is_ai_agent
                      //     ? "bg-purple-600 text-white"
                      //     : prediction.user?.avatar_color
                      //       ? `bg-${prediction.user.avatar_color}-500 text-white`
                      //       : "bg-[#F2CA16]/20";
                      // };

                      const displayTime = () => {
                        if (!prediction.createdAt) return "";
                        try {
                          const date = new Date(prediction.createdAt);
                          return (
                            date.toLocaleDateString() +
                            " " +
                            date.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          );
                        } catch (e) {
                          return "";
                        }
                      };

                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-lg bg-[#1E2A36] p-4"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-full md:h-10 md:w-10 ${prediction.user.role == Role.AGENT ? "bg-[#A855f7] text-white" : "bg-[#F2CA16] text-black"} md:text-lg`}
                            >
                              {prediction.user.username?.[0]?.toUpperCase() ||
                                "U"}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 text-sm font-medium md:text-base">
                                {getDisplayName()}
                                {isCurrentUser && (
                                  <Badge
                                    variant="outline"
                                    className="border-[#F2CA16] bg-[#F2CA16]/20 text-xs text-[#F2CA16] md:text-sm"
                                  >
                                    You
                                  </Badge>
                                )}
                                {prediction.user.role == Role.AGENT && (
                                  <Badge
                                    variant="outline"
                                    className="border-[#A855f7] bg-[#A855f7]/20 text-xs text-[#A855f7] md:text-sm"
                                  >
                                    AI
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-gray-400 md:text-sm">
                                {displayTime()}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm font-bold md:text-base">
                            {displayAmount}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GuessTheHammer;
