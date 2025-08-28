"use client";
import { useSession } from "@/lib/auth-client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PredictionsCard } from "@/app/components/navbar";
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { TextArea } from "@/app/components/ui/textarea";
import { TimerProvider } from "@/app/context/TimerContext";
import {
  getMyPredictions,
  getMyTournamentPredictions,
  getMyAuctionPoints,
} from "@/lib/data";
import { getInitials } from "@/lib/utils";
import { CircleDollarSign, Clock, Settings, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { PulseLoader } from "react-spinners";
import { default as DollarIcon } from "../../../../public/images/dollar.svg";
import HourglassIcon from "../../../../public/images/hour-glass.svg";
import MoneyBagBlack from "../../../../public/images/money-bag-black.svg";
import WalletIcon from "../../../../public/images/wallet--money-payment-finance-wallet.svg";

interface Props {}

function Profile(props: Props) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [about, setAbout] = useState("");
  const [loading, setLoading] = useState(true);
  const [totalPredictionsAndWatchlist, setTotalPredictionsAndWatchlist] =
    useState(0);
  const [dataIsLoading, setDataIsLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activePredictions, setActivePredictions] = useState([]);
  const [completedPredictions, setCompletedPredictions] = useState([]);
  const [activeTournamentPredictions, setActiveTournamentPredictions] =
    useState([]);
  const [completedTournamentPredictions, setCompletedTournamentPredictions] =
    useState([]);
  const [activeWatchlist, setActiveWatchlist] = useState([]);
  const [completedWatchlist, setCompletedWatchlist] = useState([]);
  const [isActivePrediction, setIsActivePrediction] = useState(true);
  const [isActiveTournament, setIsActiveTournament] = useState(true);
  const [currentTab, setCurrentTab] = useState<string>("predictions");
  const [userInfo, setUserInfo] = useState<any | null>(null);
  const [winsNum, setWinsNum] = useState<number>(0);
  const [joinedDate, setJoinedDate] = useState<string>("");
  const [userPoints, setUserPoints] = useState<number>(0);
  const {} = props;
  const { data } = useSession();
  const router = useRouter();

  const getUserInfo = async (email: string) => {
    const res = await fetch(`/api/userInfo?email=${email}`, {
      method: "GET",
    });
    if (!res.ok) {
      throw new Error("Unable to fetch user transactions");
    }
    const result = await res.json();
    setAbout(result.user.about);
    setLoading(false);
  };

  useEffect(() => {
    console.log(data);
    if (data) {
      setName(data?.user.name);
      setUsername(data?.user.username!);
      getUserInfo(data?.user.email);
    }
  }, [data]);

  //fetch total points

  useEffect(() => {
    async function fetchUserPoints() {
      if (data) {
        try {
          const res = await getMyAuctionPoints(data.user.id);
          setUserPoints(res.total);
        } catch (error) {
          console.error("Error fetching user points:", error);
        }
      }
    }

    fetchUserPoints();
  }, [data]);

  // fetch wagers
  useEffect(() => {
    setDataIsLoading(true);
    const fetchPredictions = async () => {
      const data = await getMyPredictions();
      const currentDate = new Date();

      if (!data.predictions || data.predictions.length !== 0) {
        const completed = data.predictions.filter((prediction: any) => {
          const auctionDeadline = new Date(prediction.auctionDeadline);
          return auctionDeadline < currentDate;
        });
        const active = data.predictions.filter((prediction: any) => {
          const auctionDeadline = new Date(prediction.auctionDeadline);
          return auctionDeadline >= currentDate;
        });

        setActivePredictions(active);
        setCompletedPredictions(completed);
      }
      setDataIsLoading(false);
    };
    const fetchTournaments = async () => {
      const data = await getMyTournamentPredictions();
      const currentDate = new Date();

      if (!data.predictions || data.predictions.length !== 0) {
        const completed = data.predictions.filter((prediction: any) => {
          const auctionDeadline = new Date(prediction.auctionDeadline);
          return auctionDeadline < currentDate;
        });
        const active = data.predictions.filter((prediction: any) => {
          const auctionDeadline = new Date(prediction.auctionDeadline);
          return auctionDeadline >= currentDate;
        });

        setActiveTournamentPredictions(active);
        setCompletedTournamentPredictions(completed);
      }
      setDataIsLoading(false);
    };
    if (currentTab === "predictions") {
      fetchPredictions();
      console.log("predictions loaded");
    } else if (currentTab === "tournaments") {
      fetchTournaments();
    }
  }, [currentTab]);

  // logs active and completed wagers for checking
  // useEffect(() => {
  //     console.log("active:", activeWagers, "completed:", completedWagers)
  // }, [activeWagers, completedWagers])

  //calculates total wagers and watchlist
  useEffect(() => {
    setTotalPredictionsAndWatchlist(
      activePredictions.length +
        completedPredictions.length +
        activeWatchlist.length +
        completedWatchlist.length
    );
  }, [
    activePredictions,
    completedPredictions,
    activeWatchlist,
    completedWatchlist,
  ]);

  // fetch watchlist
  // useEffect(() => {
  //   const fetchWatchlist = async () => {
  //     const data = await getMyWatchlist();
  //     const currentDate = new Date();

  //     if (!data.watchlist || data.watchlist.length !== 0) {
  //       const completed = data.watchlist.filter((watchlist: any) => {
  //         const auctionDeadline = new Date(watchlist.auctionDeadline);
  //         return auctionDeadline < currentDate;
  //       });
  //       const active = data.watchlist.filter((watchlist: any) => {
  //         const auctionDeadline = new Date(watchlist.auctionDeadline);
  //         return auctionDeadline >= currentDate;
  //       });

  //       setActiveWatchlist(active);
  //       setCompletedWatchlist(completed);
  //     }
  //     setDataIsLoading(false);
  //   };
  //   fetchWatchlist();
  // }, []);

  //fetch user data
  // useEffect(() => {
  //   const fetchUser = async () => {
  //     const res = await getUserInfo(data?.user.id);
  //     setUserInfo(res.user);
  //     setJoinedDate(dayjs(res.user.createdAt).format("MMMM YYYY"));
  //   };
  //   if (data) {
  //     fetchUser();
  //   }
  // }, [data]);

  //fetch winnings number
  useEffect(() => {
    const fetchWinnings = async () => {
      const res = await fetch("/api/winnings");
      const data = await res.json();
      setWinsNum(data.winnings);
    };

    fetchWinnings();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-b-transparent border-l-transparent border-r-transparent border-t-[#F2CA16]"></div>
            <p className="text-xl">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 overflow-hidden rounded-xl bg-[#1E2A36]">
        <div className="h-20 bg-[#1E2A36]"></div>
        <div className="px-8 pb-8">
          <div className="-mt-12 flex flex-col items-start gap-6 md:flex-row md:items-center">
            <Avatar className="h-24 w-24 border-4 border-[#13202D] shadow-lg">
              <AvatarFallback className="bg-[#F2CA16] text-2xl text-[#0C1924]">
                {getInitials(data ? data.user.name : "")}
              </AvatarFallback>
            </Avatar>
            <div className="pt-12 md:pt-0">
              <h1 className="text-3xl font-bold">
                {data ? data.user.name : ""}
              </h1>
              <p className="text-gray-400">{data ? data.user.username : ""}</p>
            </div>
            <div className="ml-auto pt-6 md:pt-0">
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-[#1E2A36]"
                onClick={() => router.push("/settings")}
              >
                <Settings className="h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-4">
        {/* <Card className="bg-[#13202D] border-[#1E2A36]">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-[#1E2A36] flex items-center justify-center mb-2">
                <BarChart3 className="w-6 h-6 text-[#F2CA16]" />
              </div>
              <p className="text-gray-400">Prediction Accuracy</p>
              <p className="text-3xl font-bold">{stats.accuracy.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#13202D] border-[#1E2A36]">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-[#1E2A36] flex items-center justify-center mb-2">
                <Trophy className="w-6 h-6 text-[#F2CA16]" />
              </div>
              <p className="text-gray-400">Global Rank</p>
              <p className="text-3xl font-bold">#{stats.rank}</p>
            </div>
          </CardContent>
        </Card> */}

        <Card className="border-[#1E2A36] bg-[#13202D]">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#1E2A36]">
                <CircleDollarSign className="h-6 w-6 text-[#F2CA16]" />
              </div>
              <p className="text-gray-400">Total Points</p>
              <p className="text-3xl font-bold">{userPoints}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#1E2A36] bg-[#13202D]">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#1E2A36]">
                <Clock className="h-6 w-6 text-[#F2CA16]" />
              </div>
              <p className="text-gray-400">Total Predictions</p>
              <p className="text-3xl font-bold">
                {activePredictions.length + completedPredictions.length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <h2 className="mb-4 text-xl font-bold">Profile Information</h2>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Username</label>
            <Input
              value={username}
              placeholder="Choose a username"
              disabled
              className="border-[#1E2A36] bg-[#1E2A36]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">About</label>
            <TextArea
              value={about}
              placeholder="Tell others about yourself"
              disabled
              className="border-[#1E2A36] bg-[#1E2A36]"
              rows={3}
            />
          </div>
        </div>
      </div>

      <Tabs
        defaultValue="predictions"
        className="w-full"
        onValueChange={(value) => setCurrentTab(value)}
      >
        <TabsList className="mb-6 bg-[#1E2A36]">
          <TabsTrigger
            value="predictions"
            className="data-[state=active]:bg-[#F2CA16] data-[state=active]:text-[#0C1924]"
          >
            Prediction History
          </TabsTrigger>
          <TabsTrigger
            value="tournaments"
            className="data-[state=active]:bg-[#F2CA16] data-[state=active]:text-[#0C1924]"
          >
            Tournaments
          </TabsTrigger>
          {/* <TabsTrigger value="badges">Badges & Achievements</TabsTrigger> */}
        </TabsList>

        <TabsContent value="predictions">
          <Card className="border-[#1E2A36] bg-[#13202D]">
            <CardHeader>
              <CardTitle>Your Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 rounded bg-[#172431]">
                <div className="flex">
                  <button
                    id="active-watchlist-button"
                    onClick={() => setIsActivePrediction(true)}
                    className={`flex w-1/2 items-center justify-center gap-2 border-b-2 border-[#314150] py-2 ${
                      isActivePrediction == true
                        ? "border-white text-lg font-bold"
                        : ""
                    }`}
                  >
                    <div>ACTIVE </div>
                    {!dataIsLoading && (
                      <span className="rounded bg-[#f2ca16] px-1 text-sm font-bold text-[#0f1923]">
                        {activePredictions.length}
                      </span>
                    )}
                  </button>
                  <button
                    id="completed-watchlist-button"
                    onClick={() => setIsActivePrediction(false)}
                    className={`flex w-1/2 items-center justify-center gap-2 border-b-2 border-[#314150] py-2 ${
                      isActivePrediction == false
                        ? "border-white text-lg font-bold"
                        : ""
                    }`}
                  >
                    <div>COMPLETED</div>
                    {!dataIsLoading && (
                      <span className="rounded bg-[#f2ca16] px-1 text-sm font-bold text-[#0f1923]">
                        {completedPredictions.length}
                      </span>
                    )}
                  </button>
                </div>
                <div>
                  {dataIsLoading ? (
                    <div className="flex h-[100px] w-full items-center justify-center">
                      <PulseLoader color="#f2ca16" />
                    </div>
                  ) : isActivePrediction == true ? (
                    activePredictions.length == 0 ? (
                      <div className="flex w-full justify-center py-4">
                        No Active Predictions
                      </div>
                    ) : (
                      activePredictions.map((prediction: any) => (
                        <div key={prediction._id + "active"}>
                          <TimerProvider deadline={prediction.auctionDeadline}>
                            <PredictionsCard
                              title={`${prediction.auctionYear} ${prediction.auctionMake} ${prediction.auctionModel}`}
                              img={prediction.auctionImage}
                              my_prediction={prediction.predictedPrice}
                              current_bid={prediction.auctionPrice}
                              time_left={prediction.auctionDeadline}
                              potential_prize={prediction.auctionPot}
                              id={prediction.auctionIdentifierId}
                              isActive={true}
                              status={prediction.auctionStatus}
                              predictionAmount={prediction.predictedPrice}
                              objectID={prediction.auctionObjectId}
                              predictionID={prediction._id}
                              isRefunded={prediction.refunded}
                              prize={prediction.prize}
                              deadline={prediction.auctionDeadline}
                              type="prediction"
                            />
                          </TimerProvider>
                        </div>
                      ))
                    )
                  ) : completedPredictions.length == 0 ? (
                    <div className="flex w-full justify-center py-4">
                      No Completed Predictions
                    </div>
                  ) : (
                    completedPredictions.map((prediction: any) => (
                      <div key={prediction._id + "completed"}>
                        <TimerProvider deadline={prediction.auctionDeadline}>
                          <CompletedPredictionCard
                            title={`${prediction.auctionYear} ${prediction.auctionMake} ${prediction.auctionModel}`}
                            img={prediction.auctionImage}
                            priceGuess={prediction.predictedPrice}
                            id={prediction.auctionIdentifierId}
                            status={prediction.auctionStatus}
                            finalPrice={prediction.auctionPrice}
                            wagerAmount={0}
                            auctionObjectID={prediction.auctionObjectId}
                            wagerID={prediction._id}
                            prize={prediction.prize}
                            type="prediction"
                          />
                        </TimerProvider>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tournaments">
          <Card className="border-[#1E2A36] bg-[#13202D]">
            <CardHeader>
              <CardTitle>Your Tournaments</CardTitle>
            </CardHeader>
            <CardContent>
              {/* <div className="text-center py-12">
                <Trophy className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">
                  No Tournament History
                </h3>
                <p className="text-gray-400 mb-4">
                  You haven't participated in any tournaments yet.
                </p>
                <Button onClick={() => navigate(createPageUrl("Tournaments"))}>
                  Browse Tournaments
                </Button>
              </div> */}
              <div className="flex flex-col gap-4 rounded bg-[#172431]">
                <div className="flex">
                  <button
                    id="active-watchlist-button"
                    onClick={() => setIsActiveTournament(true)}
                    className={`flex w-1/2 items-center justify-center gap-2 border-b-2 border-[#314150] py-2 ${isActiveTournament === true ? "border-white text-lg font-bold" : ""} `}
                  >
                    <div>ACTIVE</div>
                    {!dataIsLoading && (
                      <span className="rounded bg-[#f2ca16] px-1 text-sm font-bold text-[#0f1923]">
                        {activeTournamentPredictions.length}
                      </span>
                    )}
                  </button>
                  <button
                    id="completed-watchlist-button"
                    onClick={() => setIsActiveTournament(false)}
                    className={`flex w-1/2 items-center justify-center gap-2 border-b-2 border-[#314150] py-2 ${
                      isActiveTournament == false
                        ? "border-white text-lg font-bold"
                        : ""
                    }`}
                  >
                    <div>COMPLETED</div>
                    {!dataIsLoading && (
                      <span className="rounded bg-[#f2ca16] px-1 text-sm font-bold text-[#0f1923]">
                        {completedTournamentPredictions.length}
                      </span>
                    )}
                  </button>
                </div>
                <div>
                  {dataIsLoading ? (
                    <div className="flex h-[100px] w-full items-center justify-center">
                      <PulseLoader color="#f2ca16" />
                    </div>
                  ) : isActiveTournament == true ? (
                    activeTournamentPredictions.length == 0 ? (
                      <div className="flex w-full justify-center py-4">
                        No Active Tournament Predictions
                      </div>
                    ) : (
                      activeTournamentPredictions.map((prediction: any) => (
                        <div key={prediction._id + "active"}>
                          <TimerProvider deadline={prediction.auctionDeadline}>
                            <PredictionsCard
                              title={`${prediction.auctionYear} ${prediction.auctionMake} ${prediction.auctionModel}`}
                              img={prediction.auctionImage}
                              my_prediction={prediction.predictedPrice}
                              current_bid={prediction.auctionPrice}
                              time_left={prediction.auctionDeadline}
                              potential_prize={prediction.auctionPot}
                              id={prediction.auctionIdentifierId}
                              isActive={true}
                              status={prediction.auctionStatus}
                              predictionAmount={prediction.predictedPrice}
                              objectID={prediction.auctionObjectId}
                              predictionID={prediction._id}
                              isRefunded={prediction.refunded}
                              prize={prediction.prize}
                              deadline={prediction.auctionDeadline}
                              type="tournament"
                              tournament_id={prediction.tournament_id}
                            />
                          </TimerProvider>
                        </div>
                      ))
                    )
                  ) : completedTournamentPredictions.length == 0 ? (
                    <div className="flex w-full justify-center py-4">
                      No Completed Predictions
                    </div>
                  ) : (
                    completedTournamentPredictions.map((prediction: any) => (
                      <div key={prediction._id + "completed"}>
                        <TimerProvider deadline={prediction.auctionDeadline}>
                          <CompletedPredictionCard
                            title={`${prediction.auctionYear} ${prediction.auctionMake} ${prediction.auctionModel}`}
                            img={prediction.auctionImage}
                            priceGuess={prediction.predictedPrice}
                            id={prediction.auctionIdentifierId}
                            status={prediction.auctionStatus}
                            finalPrice={prediction.auctionPrice}
                            wagerAmount={0}
                            auctionObjectID={prediction.auctionObjectId}
                            wagerID={prediction._id}
                            prize={prediction.prize}
                            type="tournament"
                            tournament_id={prediction.tournament_id}
                          />
                        </TimerProvider>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* <TabsContent value="badges">
          <Card className="bg-[#13202D] border-[#1E2A36]">
            <CardHeader>
              <CardTitle>Badges & Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.badges.map((badge, index) => (
                  <div
                    key={index}
                    className="bg-[#1E2A36] p-4 rounded-lg text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-[#F2CA16]/20 flex items-center justify-center mx-auto mb-4">
                      <Trophy className="w-8 h-8 text-[#F2CA16]" />
                    </div>
                    <h3 className="font-medium mb-1">{badge}</h3>
                    <p className="text-sm text-gray-400">
                      Earned {new Date().toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent> */}
      </Tabs>
    </div>
    // <div className="flex justify-center bg-[#1A2C3D] pb-[60px]">
    //   <Image
    //     src={TransitionPattern}
    //     className="black-filter absolute max-h-[280px] object-cover object-bottom"
    //     alt=""
    //   />
    //   <div className="z-[1] mt-[120px] w-full max-w-[862px] sm:mt-[200px]">
    //     <div className="px-6 sm:flex sm:justify-between sm:px-0">
    //       <div className="sm:flex sm:items-center sm:gap-6">
    //         <Image
    //           src={AvatarOne}
    //           alt=""
    //           className="w-[100px] rounded-full sm:w-[200px]"
    //         />
    //         <div className="mt-6 sm:mt-0">
    //           <div className="text-4xl font-bold">{name}</div>
    //           <div className="text-lg text-[#d1d5d8]">
    //             {`Joined ${joinedDate}`}
    //           </div>
    //           <div className="flex gap-6 text-base text-[#487f4b]">
    //             <div>@{username}</div>
    //             <div>{totalPredictionsAndWatchlist} wagers</div>
    //             <div>{winsNum} wins</div>
    //           </div>
    //         </div>
    //       </div>
    //       <Button
    //         className="pointer-events-none mt-4 h-[44px] cursor-pointer rounded border-[1px] border-[#f2ca16] px-3 py-2 text-base font-medium text-[#f2ca16] opacity-50 sm:mt-[50px]"
    //         onClick={() => router.push("/profile/edit")}
    //         aria-disabled={true}
    //       >
    //         Edit Profile
    //       </Button>
    //     </div>
    //     <div className="mx-6 mt-[80px] flex items-center gap-6 rounded-lg bg-[#184c80] px-6 py-4 md:mx-0">
    //       <Image
    //         src={IDIcon}
    //         alt=""
    //         className="yellow-filter w-8"
    //         style={{ fill: "#53944f" }}
    //       />
    //       <div>
    //         <div className="text-base font-bold leading-6">
    //           Verify your identity
    //         </div>
    //         <div className="text-sm leading-5 text-[#bac9d9]">
    //           To wager on car auctions, you need to verify your identity
    //         </div>
    //         <div className="text-base font-medium leading-6 text-[#f2ca16]">
    //           Verify now
    //         </div>
    //       </div>
    //     </div>
    //     <div className="mt-8 flex flex-col gap-4 rounded bg-[#172431] p-6">
    //       <div className="text-lg font-bold leading-7 text-[#f2ca16]">
    //         ABOUT
    //       </div>
    //       <div className="leading-7">
    //         {userInfo && userInfo.aboutMe
    //           ? userInfo.aboutMe
    //           : "Join us and fuel your passion for cars!"}
    //       </div>
    //       <div className="flex flex-col gap-2 text-sm font-light leading-7 sm:flex-row sm:gap-6 sm:text-lg">
    //         <div className="flex items-center gap-2">
    //           <Image
    //             src={Pin}
    //             width={24}
    //             height={24}
    //             alt="pin"
    //             className="h-6"
    //           />
    //           <div>
    //             {userInfo ? `${userInfo.state}, ${userInfo.country}` : "--"}
    //           </div>
    //         </div>
    //         <div className="flex items-center gap-2">
    //           <Image
    //             src={Twitter}
    //             width={24}
    //             height={24}
    //             alt="twitter"
    //             className="h-6 opacity-20"
    //           />
    //           <div className="opacity-20">Twitter</div>
    //         </div>
    //         <div className="flex items-center gap-2">
    //           <Image
    //             src={Globe}
    //             width={24}
    //             height={24}
    //             alt="globe"
    //             className="h-6 opacity-20"
    //           />
    //           <div className="opacity-20">Website</div>
    //         </div>
    //       </div>
    //     </div>
    //     <div className="mt-8 flex flex-col gap-4 rounded bg-[#172431] p-6">
    //       <div className="text-lg font-bold leading-7 text-[#f2ca16]">
    //         PREDICTIONS
    //       </div>
    //       <div className="flex">
    //         <button
    //           id="active-watchlist-button"
    //           onClick={() => setIsActivePrediction(true)}
    //           className={`flex w-1/2 items-center justify-center gap-2 border-b-2 border-[#314150] py-2 ${isActivePrediction == true
    //             ? "border-white text-lg font-bold"
    //             : ""
    //             }`}
    //         >
    //           <div>ACTIVE </div>
    //           {!dataIsLoading && (
    //             <span className="rounded bg-[#f2ca16] px-1 text-sm font-bold text-[#0f1923]">
    //               {activePredictions.length}
    //             </span>
    //           )}
    //         </button>
    //         <button
    //           id="completed-watchlist-button"
    //           onClick={() => setIsActivePrediction(false)}
    //           className={`w-1/2 border-b-2 border-[#314150] py-2 ${isActivePrediction == false
    //             ? "border-white text-lg font-bold"
    //             : ""
    //             }`}
    //         >
    //           COMPLETED
    //         </button>
    //       </div>
    //       <div>
    //         {dataIsLoading ? (
    //           <div className="flex h-[100px] w-full items-center justify-center">
    //             <PulseLoader color="#f2ca16" />
    //           </div>
    //         ) : isActivePrediction == true ? (
    //           activePredictions.length == 0 ? (
    //             <div className="flex w-full justify-center py-4">
    //               No Active Predictions
    //             </div>
    //           ) : (
    //             activePredictions.map((prediction: any) => (
    //               <div key={prediction._id + "active"}>
    //                 <TimerProvider deadline={prediction.auctionDeadline}>
    //                   <PredictionsCard
    //                     title={`${prediction.auctionYear} ${prediction.auctionMake} ${prediction.auctionModel}`}
    //                     img={prediction.auctionImage}
    //                     my_prediction={prediction.priceGuessed}
    //                     current_bid={prediction.auctionPrice}
    //                     time_left={prediction.auctionDeadline}
    //                     potential_prize={prediction.auctionPot}
    //                     id={prediction.auctionIdentifierId}
    //                     isActive={true}
    //                     status={prediction.auctionStatus}
    //                     predictionAmount={prediction.predictionAmount}
    //                     objectID={prediction.auctionObjectId}
    //                     predictionID={prediction._id}
    //                     isRefunded={prediction.refunded}
    //                     prize={prediction.prize}
    //                     deadline={prediction.auctionDeadline}
    //                   />
    //                 </TimerProvider>
    //               </div>
    //             ))
    //           )
    //         ) : completedPredictions.length == 0 ? (
    //           <div className="flex w-full justify-center py-4">
    //             No Completed Predictions
    //           </div>
    //         ) : (
    //           completedPredictions.map((prediction: any) => (
    //             <div key={prediction._id + "completed"}>
    //               <TimerProvider deadline={prediction.auctionDeadline}>
    //                 <CompletedWagerCard
    //                   title={`${prediction.auctionYear} ${prediction.auctionMake} ${prediction.auctionModel}`}
    //                   img={prediction.auctionImage}
    //                   priceGuess={prediction.priceGuessed}
    //                   id={prediction.auctionIdentifierId}
    //                   status={prediction.auctionStatus}
    //                   finalPrice={prediction.auctionPrice}
    //                   wagerAmount={prediction.predictionAmount}
    //                   auctionObjectID={prediction.auctionObjectId}
    //                   wagerID={prediction._id}
    //                   prize={prediction.prize}
    //                 />
    //               </TimerProvider>
    //             </div>
    //           ))
    //         )}
    //       </div>
    //       {/* <UserWagerList /> */}
    //     </div>
    //     <div className="mt-8 flex flex-col gap-4 rounded bg-[#172431] p-6">
    //       <div className="text-lg font-bold leading-7 text-[#f2ca16]">
    //         WATCHLIST
    //       </div>
    //       <div>
    //         {dataIsLoading ? (
    //           <div className="flex h-[100px] w-full items-center justify-center">
    //             <PulseLoader color="#f2ca16" />
    //           </div>
    //         ) : activeWatchlist.length === 0 ? (
    //           <div className="flex w-full justify-center py-4">
    //             No Active Watchlist
    //           </div>
    //         ) : (
    //           activeWatchlist.map((watchlist: any) => (
    //             <div key={watchlist._id}>
    //               <TimerProvider deadline={watchlist.auctionDeadline}>
    //                 <MyWatchlistCard
    //                   title={`${watchlist.auctionYear} ${watchlist.auctionMake} ${watchlist.auctionModel}`}
    //                   img={watchlist.auctionImage}
    //                   current_bid={watchlist.auctionPrice}
    //                   time_left={watchlist.auctionDeadline}
    //                   id={watchlist.auctionIdentifierId}
    //                   isActive={true}
    //                 />
    //               </TimerProvider>
    //             </div>
    //           ))
    //         )}
    //       </div>
    //     </div>
    //   </div>
    // </div>
  );
}

export default Profile;

type CompletedWagerCardProps = {
  title: string;
  img: string;
  priceGuess: number;
  id: string;
  status: number;
  finalPrice: number;
  wagerAmount: number;
  auctionObjectID: string;
  wagerID: string;
  prize?: number;
  type: string;
  tournament_id?: number;
};

const CompletedPredictionCard: React.FC<CompletedWagerCardProps> = ({
  title,
  img,
  priceGuess,
  id,
  status,
  finalPrice,
  wagerAmount,
  auctionObjectID,
  wagerID,
  prize,
  type,
  tournament_id,
}) => {
  const [auctionStatus, setAuctionStatus] = useState("Completed");
  const [refunded, setRefunded] = useState(false);
  const [loading, setLoading] = useState(false);

  const statusMap: any = {
    1: "Ongoing",
    2: "Completed",
    3: "Unsuccessful Auction",
    4: "Completed and Prize Distributed",
    default: "Status Unknown",
  };

  useEffect(() => {
    setAuctionStatus(statusMap[status] || statusMap.default);
  }, [status]);

  //convert number to currency
  const currencyMyWager = new Intl.NumberFormat().format(priceGuess);
  const currencyFinalPrice = new Intl.NumberFormat().format(finalPrice);
  const currencyWagerAmount = new Intl.NumberFormat().format(wagerAmount);

  // refund for when auction is unsuccessful

  return (
    <div>
      <div className="flex gap-6 px-6 py-6">
        <Link
          href={`${type === "prediction" ? "/auction_details?id=${id}&mode=free_play" : "/tournaments/" + tournament_id}`}
          className="h-[50px] w-[50px] self-start pt-2 sm:h-[100px] sm:w-[100px] sm:pt-0"
        >
          <Image
            src={img}
            width={100}
            height={100}
            alt={title}
            className="h-[100px] w-[100px] rounded object-cover"
          />
        </Link>

        <div className="flex flex-auto flex-col gap-1.5">
          <div className="text-xl font-bold leading-7">{title}</div>
          <div>
            <div className="flex gap-2 leading-5">
              <Image src={WalletIcon} alt="" className="w-3.5 text-[#d1d3d6]" />
              <div className="text-[#d1d3d6]">Your Price Guess:</div>
              <div className="font-bold text-[#f2ca16]">${currencyMyWager}</div>
            </div>
            <div className="flex gap-2 text-sm">
              <Image src={DollarIcon} alt="" className="w-3.5 text-[#d1d3d6]" />
              <div className="text-[#d1d3d6]">Final Price:</div>
              <div className="font-bold text-[#49c742]">
                ${currencyFinalPrice}
              </div>
            </div>
            {/* <div className="flex w-full items-center gap-2 text-sm">
              <Image
                src={Dollar}
                width={14}
                height={14}
                alt="wallet icon"
                className="h-[14px] w-[14px]"
              />
              <span className="opacity-80">Wager Amount:</span>
              <span className="font-bold">${currencyWagerAmount}</span>
            </div> */}
            <div className="flex items-center gap-2 text-sm">
              <Image
                src={HourglassIcon}
                alt=""
                className="h-3.5 w-3.5 text-[#d1d3d6]"
              />
              <div className="text-[#d1d3d6]">Status:</div>
              <div>{auctionStatus}</div>
            </div>
          </div>
          {status === 3 && (
            <>
              <div className="mt-2 flex w-full items-center gap-2 rounded bg-[#4b2330] p-1 text-xs sm:mt-4 sm:gap-4 sm:p-2 sm:text-sm">
                <div className="grow-[1] text-left font-bold text-[#f92f60]">
                  ❌ UNSUCCESSFUL{" "}
                  <span className="hidden sm:inline-block">AUCTION</span>
                </div>
              </div>
            </>
          )}
          {status == 4 && prize && (
            <div className="mt-2 flex w-full items-center justify-between rounded bg-[#49c742] p-1 text-xs font-bold text-[#0f1923] sm:mt-4 sm:gap-4 sm:p-2 sm:text-sm">
              <div className="flex gap-2">
                <Image
                  src={MoneyBagBlack}
                  width={20}
                  height={20}
                  alt="money bag"
                  className="h-[20px] w-[20px]"
                />
                <div>WINNINGS</div>
              </div>
              <div>
                $
                {prize % 1 === 0
                  ? prize.toLocaleString()
                  : prize.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                🎉
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="h-[2px] bg-white/10"></div>
    </div>
  );
};

// function UserWatchList() {
//     return (
//         <div className="flex gap-4 py-3 items-center">
//             <Image
//                 src={WagerPhotoOne}
//                 alt=""
//                 className="rounded w-[100px]"
//             />
//             <div>
//                 <div className="font-bold sm:text-lg leading-7">
//                     620-Mile 2019 Ford GT
//                 </div>
//                 <div className="flex gap-2 text-sm leading-5">
//                     <Image
//                         src={DollarIcon}
//                         alt=""
//                         className="text-[#d1d3d6] w-3.5"
//                     />
//                     <div className="text-[#d1d3d6]">Current Bid:</div>
//                     <div className="text-[#49c742] font-bold">
//                         $904,000
//                     </div>
//                 </div>
//                 <div className="flex gap-2 text-sm items-center">
//                     <Image
//                         src={HourglassIcon}
//                         alt=""
//                         className="text-[#d1d3d6] w-3.5 h-3.5"
//                     />
//                     <div className="text-[#d1d3d6]">Time Left:</div>
//                     <div>12:17:00</div>
//                 </div>
//             </div>
//         </div>
//     );
// }
