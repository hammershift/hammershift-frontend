"use client";
// import { SubscribeSmall } from "@/app/components/subscribe";
// import { getWinnersRank } from "@/lib/getWinners";
// import React, { useEffect, useState } from "react";
// import { BounceLoader } from "react-spinners";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/card_component";
import { Button } from "@/app/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/table";
import { Trophy, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { createPageUrl } from "@/app/components/utils";
import { getAuctionPoints } from "@/lib/data";
import { Types } from "mongoose";
type LeaderboardData = {
  _id: Types.ObjectId;
  totalPoints: number;
  totalPredictions: number;
  user: {
    userId: Types.ObjectId;
    fullName: string;
    username: string;
    role: string;
  };

  image: string;
  auctions: {
    auctionId: Types.ObjectId;
    points: number;
    rank: number;
  };
};
const LeaderboardPage = () => {
  const navigate = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<string>("all_time");
  const [gameMode, setGameMode] = useState<string>("free_play");

  useEffect(() => {
    const fetchData = async () => {
      const leaderboard = await getAuctionPoints(20);
      setLeaderboard(leaderboard);
      setLoading(false);
    };
    fetchData();
  }, []);

  const getLeaderboardTitle = () => {
    const mode = gameMode === "free_play" ? "Free Play" : "Guess the Hammer";
    const time = "All Time";

    return `${time} ${mode} Leaderboard`;
  };

  const getMedalColor = (position: number) => {
    switch (position) {
      case 1:
        return "text-[#F2CA16]"; // Gold
      case 2:
        return "text-gray-300"; // Silver
      case 3:
        return "text-amber-600"; // Bronze
      default:
        return "text-gray-500";
    }
  };
  return (
    // <div className="page-container">
    //   <div className="section-container grid gap-8 pb-16">
    //     <div className="text-3xl font-bold md:text-5xl">Top Winners</div>
    //     {loading ? (
    //       <LoadingSpinner />
    //     ) : (
    //       <table className="w-full md:table-fixed">
    //         <thead className="bg-[#F2CA16] text-xl text-black md:text-2xl">
    //           <tr className="leading-10">
    //             <th className="sm:w-1/3">RANK</th>
    //             <th className="sm:w-1/3">USER</th>
    //             <th className="sm:w-1/3">WINS</th>
    //           </tr>
    //         </thead>
    //         <tbody className="space-y-1 text-center">
    //           {data.length > 0 &&
    //             (data as DataItem[]).map((item, index) => (
    //               <tr
    //                 key={index + "LDB"}
    //                 className={`leading-10 ${
    //                   index % 2 === 1 ? "bg-white/5" : ""
    //                 }`}
    //               >
    //                 <td className="sm:w-1/3">{item.rank}</td>
    //                 <td className="sm:w-1/3">{item.user}</td>
    //                 <td className="sm:w-1/3">{item.numberOfWinnings}</td>
    //               </tr>
    //             ))}
    //         </tbody>
    //       </table>
    //     )}
    //   </div>
    //   <SubscribeSmall />
    // </div>
    <div className="container mx-auto px-4 py-12">
      <Button variant="ghost" className="mb-6" onClick={() => navigate.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <h1 className="mb-8 text-center text-3xl font-bold">LEADERBOARDS</h1>

      <Tabs
        defaultValue="free_play"
        value={gameMode}
        onValueChange={setGameMode}
        className="mb-8"
      >
        <div className="mb-6 flex justify-center">
          <TabsList className="bg-[#1E2A36]">
            <TabsTrigger
              value="free_play"
              className="data-[state=active]:bg-[#F2CA16] data-[state=active]:text-[#0C1924]"
            >
              FREE PLAY
            </TabsTrigger>
            {/* <TabsTrigger
              value="tournament"
              className="data-[state=active]:bg-[#F2CA16] data-[state=active]:text-[#0C1924]"
            >
              TOURNAMENTS
            </TabsTrigger>
            <TabsTrigger
              value="price_is_right"
              className="data-[state=active]:bg-[#F2CA16] data-[state=active]:text-[#0C1924]"
            >
              GUESS THE HAMMER
            </TabsTrigger> */}
          </TabsList>
        </div>

        <TabsContent value="free_play">
          <Card className="border-[#1E2A36] bg-[#13202D]">
            <CardHeader className="flex flex-row items-center justify-between border-b border-[#1E2A36]">
              <CardTitle className="text-xl">{getLeaderboardTitle()}</CardTitle>
              <div className="flex gap-2">
                {/* <Button
                  variant={timeframe === "weekly" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeframe("weekly")}
                  className={
                    timeframe === "weekly" ? "bg-[#F2CA16] text-[#0C1924]" : ""
                  }
                >
                  Weekly
                </Button>
                <Button
                  variant={timeframe === "monthly" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeframe("monthly")}
                  className={
                    timeframe === "monthly" ? "bg-[#F2CA16] text-[#0C1924]" : ""
                  }
                >
                  Monthly
                </Button> */}
                <Button
                  variant={timeframe === "all_time" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeframe("all_time")}
                  className={
                    timeframe === "all_time"
                      ? "bg-[#F2CA16] text-[#0C1924]"
                      : ""
                  }
                >
                  All Time
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#1E2A36]">
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead className="">Predictions</TableHead>
                    {/* <TableHead>Win Rate</TableHead> */}
                    <TableHead className="">Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array(10)
                      .fill(0)
                      .map((_, i) => (
                        <TableRow key={i} className="animate-pulse">
                          <TableCell>
                            <div className="h-4 w-8 rounded bg-[#1E2A36]"></div>
                          </TableCell>
                          <TableCell>
                            <div className="h-4 w-32 rounded bg-[#1E2A36]"></div>
                          </TableCell>
                          <TableCell className="">
                            <div className="h-4 w-16 rounded bg-[#1E2A36]"></div>
                          </TableCell>
                          {/* <TableCell>
                              <div className="h-4 w-16 rounded bg-[#1E2A36]"></div>
                            </TableCell> */}
                          <TableCell className="">
                            <div className="ml-auto h-4 w-20 rounded bg-[#1E2A36]"></div>
                          </TableCell>
                        </TableRow>
                      ))
                  ) : leaderboard.length > 0 ? (
                    leaderboard.slice(0, 50).map((player, index) => (
                      <TableRow
                        key={player._id.toString()}
                        className="hover:bg-[#1E2A36]"
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {index < 3 ? (
                              <Trophy
                                className={`h-4 w-4 ${getMedalColor(index + 1)}`}
                              />
                            ) : (
                              <span className="text-gray-500">{index + 1}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {player.user.username}
                        </TableCell>
                        <TableCell className="">
                          {player.totalPredictions}
                        </TableCell>
                        {/* <TableCell>{player.winRate}%</TableCell> */}
                        <TableCell className="font-bold">
                          {player.totalPoints.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell className="h-24"></TableCell>
                      <TableCell className="h-24">No players found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tournament">
          <Card className="border-[#1E2A36] bg-[#13202D]">
            <CardHeader className="flex flex-row items-center justify-between border-b border-[#1E2A36]">
              <CardTitle className="text-xl">{getLeaderboardTitle()}</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={timeframe === "weekly" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeframe("weekly")}
                  className={
                    timeframe === "weekly" ? "bg-[#F2CA16] text-[#0C1924]" : ""
                  }
                >
                  Weekly
                </Button>
                <Button
                  variant={timeframe === "monthly" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeframe("monthly")}
                  className={
                    timeframe === "monthly" ? "bg-[#F2CA16] text-[#0C1924]" : ""
                  }
                >
                  Monthly
                </Button>
                <Button
                  variant={timeframe === "all_time" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeframe("all_time")}
                  className={
                    timeframe === "all_time"
                      ? "bg-[#F2CA16] text-[#0C1924]"
                      : ""
                  }
                >
                  All Time
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#1E2A36]">
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead>Tournaments</TableHead>
                    <TableHead>Win Rate</TableHead>
                    <TableHead className="text-right">Earnings</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.length > 0 ? (
                    leaderboard.slice(0, 50).map((player, index) => (
                      <TableRow key={player._id.toString()}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {index < 3 ? (
                              <Trophy
                                className={`h-4 w-4 ${getMedalColor(index + 1)}`}
                              />
                            ) : (
                              <span className="text-gray-500">{index + 1}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {player.user.username}
                        </TableCell>
                        <TableCell>
                          {Math.floor(player.totalPredictions / 3)}
                        </TableCell>
                        {/* <TableCell>{player.winRate}%</TableCell> */}
                        {/* <TableCell className="text-right font-bold">
                        ${player.earnings.toLocaleString()}
                      </TableCell> */}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell className="h-24"></TableCell>
                      <TableCell className="h-24">No players found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="price_is_right">
          <Card className="border-[#1E2A36] bg-[#13202D]">
            <CardHeader className="flex flex-row items-center justify-between border-b border-[#1E2A36]">
              <CardTitle className="text-xl">{getLeaderboardTitle()}</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={timeframe === "weekly" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeframe("weekly")}
                  className={
                    timeframe === "weekly"
                      ? "bg-[#399645] hover:bg-[#399645]/90"
                      : ""
                  }
                >
                  Weekly
                </Button>
                <Button
                  variant={timeframe === "monthly" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeframe("monthly")}
                  className={
                    timeframe === "monthly"
                      ? "bg-[#399645] hover:bg-[#399645]/90"
                      : ""
                  }
                >
                  Monthly
                </Button>
                <Button
                  variant={timeframe === "all_time" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeframe("all_time")}
                  className={
                    timeframe === "all_time"
                      ? "bg-[#399645] hover:bg-[#399645]/90"
                      : ""
                  }
                >
                  All Time
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#1E2A36]">
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead>Predictions</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead className="text-right">Earnings</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {leaderboard.length > 0 ? (
                    leaderboard.slice(0, 50).map((player, index) => (
                      <TableRow key={player._id.toString()}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {index < 3 ? (
                              <Trophy
                                className={`h-4 w-4 ${getMedalColor(index + 1)}`}
                              />
                            ) : (
                              <span className="text-gray-500">{index + 1}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {player.user.username}
                        </TableCell>
                        <TableCell>
                          {Math.floor(player.totalPredictions / 2)}
                        </TableCell>
                        {/* <TableCell>{player.winRate - 10}%</TableCell>
                      <TableCell className="text-right font-bold">
                        ${(player.earnings * 0.8).toLocaleString()}
                      </TableCell> */}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell className="h-24"></TableCell>
                      <TableCell colSpan={5} className="h-24">
                        No players found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// const LoadingSpinner = () => {
//   return (
//     <div className="flex h-[50vh] items-center justify-center">
//       <BounceLoader color="#F2CA16" />
//     </div>
//   );
// };

export default LeaderboardPage;
