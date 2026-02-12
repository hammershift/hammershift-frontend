"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/card_component";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/table";
import {
  Trophy,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Target,
  Award,
} from "lucide-react";
import StreakIndicator from "@/app/components/StreakIndicator";
import { useTrackEvent } from "@/hooks/useTrackEvent";

type Period = "weekly" | "monthly" | "alltime";

interface LeaderboardEntry {
  _id: string;
  userId: string;
  username: string;
  fullName: string;
  rank: number;
  total_score: number;
  predictions_count: number;
  avg_accuracy: number;
  current_streak: number;
  trend?: "up" | "down" | "same";
  trend_change?: number;
}

interface PeriodStats {
  total_participants: number;
  top_score: number;
  avg_score: number;
}

interface CurrentUserStats {
  rank: number;
  total_score: number;
  predictions_count: number;
  accuracy: number;
  current_streak: number;
}

const LeaderboardPage = () => {
  const { data: session } = useSession();
  const track = useTrackEvent();
  const [period, setPeriod] = useState<Period>("alltime");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [periodStats, setPeriodStats] = useState<PeriodStats>({
    total_participants: 0,
    top_score: 0,
    avg_score: 0,
  });
  const [currentUserStats, setCurrentUserStats] = useState<CurrentUserStats | null>(null);

  const ITEMS_PER_PAGE = 50;

  useEffect(() => {
    fetchLeaderboard();
  }, [period, currentPage]);

  useEffect(() => {
    // Track leaderboard view
    track("leaderboard_viewed", {
      period,
      user_rank: currentUserStats?.rank,
    });
  }, [period]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/leaderboard?period=${period}&page=${currentPage}&limit=${ITEMS_PER_PAGE}`
      );
      if (!response.ok) throw new Error("Failed to fetch leaderboard");

      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
      setPeriodStats(data.periodStats || { total_participants: 0, top_score: 0, avg_score: 0 });
      setCurrentUserStats(data.currentUserStats || null);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-[#F2CA16]" />;
      case 2:
        return <Trophy className="h-5 w-5 text-gray-300" />;
      case 3:
        return <Trophy className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-gray-400">{rank}</span>;
    }
  };

  const getTrendIcon = (trend?: "up" | "down" | "same", change?: number) => {
    if (!trend || trend === "same") return <Minus className="h-4 w-4 text-gray-500" />;
    if (trend === "up") {
      return (
        <div className="flex items-center gap-1 text-[#00D4AA]">
          <TrendingUp className="h-4 w-4" />
          {change && <span className="text-xs">+{change}</span>}
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-[#E94560]">
        <TrendingDown className="h-4 w-4" />
        {change && <span className="text-xs">-{change}</span>}
      </div>
    );
  };

  const filteredLeaderboard = searchTerm
    ? leaderboard.filter((entry) =>
        entry.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : leaderboard;

  const topThree = leaderboard.slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold">Leaderboard</h1>
        <p className="text-gray-400">Top predictors across Velocity Markets</p>
      </div>

      {/* Period Selector */}
      <div className="mb-8 flex justify-center gap-2">
        <Button
          variant={period === "weekly" ? "default" : "outline"}
          onClick={() => {
            setPeriod("weekly");
            setCurrentPage(1);
          }}
          className={
            period === "weekly"
              ? "bg-[#E94560] hover:bg-[#E94560]/90"
              : "border-[#1E2A36] bg-[#0A0A1A] hover:bg-[#1E2A36]"
          }
        >
          Weekly
        </Button>
        <Button
          variant={period === "monthly" ? "default" : "outline"}
          onClick={() => {
            setPeriod("monthly");
            setCurrentPage(1);
          }}
          className={
            period === "monthly"
              ? "bg-[#E94560] hover:bg-[#E94560]/90"
              : "border-[#1E2A36] bg-[#0A0A1A] hover:bg-[#1E2A36]"
          }
        >
          Monthly
        </Button>
        <Button
          variant={period === "alltime" ? "default" : "outline"}
          onClick={() => {
            setPeriod("alltime");
            setCurrentPage(1);
          }}
          className={
            period === "alltime"
              ? "bg-[#E94560] hover:bg-[#E94560]/90"
              : "border-[#1E2A36] bg-[#0A0A1A] hover:bg-[#1E2A36]"
          }
        >
          All-Time
        </Button>
      </div>

      {/* Podium Section (Desktop only, top 3) */}
      {!loading && topThree.length === 3 && (
        <div className="mb-12 hidden grid-cols-3 gap-4 md:grid">
          {/* 2nd Place */}
          <Card className="mt-8 border-gray-300 bg-gradient-to-br from-gray-700 to-gray-800">
            <CardContent className="flex flex-col items-center p-6 text-center">
              <Trophy className="mb-2 h-12 w-12 text-gray-300" />
              <div className="text-5xl font-bold text-gray-300">2</div>
              <div className="mt-4 text-xl font-bold">{topThree[1].username}</div>
              <div className="font-mono text-2xl font-bold text-[#FFB547]">
                {topThree[1].total_score.toLocaleString()}
              </div>
              <div className="mt-2 text-sm text-gray-400">
                {topThree[1].predictions_count} predictions
              </div>
              <div className="text-sm text-gray-400">
                {topThree[1].avg_accuracy.toFixed(1)}% accuracy
              </div>
              {topThree[1].current_streak >= 3 && (
                <div className="mt-2">
                  <StreakIndicator currentStreak={topThree[1].current_streak} size="sm" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* 1st Place */}
          <Card className="border-[#F2CA16] bg-gradient-to-br from-yellow-600 to-yellow-800 shadow-xl">
            <CardContent className="flex flex-col items-center p-8 text-center">
              <Trophy className="mb-2 h-16 w-16 text-[#F2CA16]" />
              <div className="text-6xl font-bold text-[#F2CA16]">1</div>
              <div className="mt-4 text-2xl font-bold">{topThree[0].username}</div>
              <div className="font-mono text-3xl font-bold text-white">
                {topThree[0].total_score.toLocaleString()}
              </div>
              <div className="mt-2 text-sm">
                {topThree[0].predictions_count} predictions
              </div>
              <div className="text-sm">
                {topThree[0].avg_accuracy.toFixed(1)}% accuracy
              </div>
              {topThree[0].current_streak >= 3 && (
                <div className="mt-2">
                  <StreakIndicator currentStreak={topThree[0].current_streak} size="md" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* 3rd Place */}
          <Card className="mt-8 border-amber-600 bg-gradient-to-br from-amber-700 to-amber-900">
            <CardContent className="flex flex-col items-center p-6 text-center">
              <Trophy className="mb-2 h-12 w-12 text-amber-600" />
              <div className="text-5xl font-bold text-amber-600">3</div>
              <div className="mt-4 text-xl font-bold">{topThree[2].username}</div>
              <div className="font-mono text-2xl font-bold text-[#FFB547]">
                {topThree[2].total_score.toLocaleString()}
              </div>
              <div className="mt-2 text-sm text-gray-400">
                {topThree[2].predictions_count} predictions
              </div>
              <div className="text-sm text-gray-400">
                {topThree[2].avg_accuracy.toFixed(1)}% accuracy
              </div>
              {topThree[2].current_streak >= 3 && (
                <div className="mt-2">
                  <StreakIndicator currentStreak={topThree[2].current_streak} size="sm" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by username..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="border-[#1E2A36] bg-[#13202D] pl-10"
              />
            </div>
          </div>

          {/* Leaderboard Table */}
          <Card className="border-[#1E2A36] bg-[#13202D]">
            <CardHeader>
              <CardTitle>Rankings</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#1E2A36]">
                      <TableHead className="w-16">Rank</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                      <TableHead className="text-center">Predictions</TableHead>
                      <TableHead className="text-center">Accuracy</TableHead>
                      <TableHead className="text-center">Streak</TableHead>
                      <TableHead className="text-center">Trend</TableHead>
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
                            <TableCell>
                              <div className="ml-auto h-4 w-20 rounded bg-[#1E2A36]"></div>
                            </TableCell>
                            <TableCell>
                              <div className="mx-auto h-4 w-16 rounded bg-[#1E2A36]"></div>
                            </TableCell>
                            <TableCell>
                              <div className="mx-auto h-4 w-16 rounded bg-[#1E2A36]"></div>
                            </TableCell>
                            <TableCell>
                              <div className="mx-auto h-4 w-16 rounded bg-[#1E2A36]"></div>
                            </TableCell>
                            <TableCell>
                              <div className="mx-auto h-4 w-8 rounded bg-[#1E2A36]"></div>
                            </TableCell>
                          </TableRow>
                        ))
                    ) : filteredLeaderboard.length > 0 ? (
                      filteredLeaderboard.map((entry) => {
                        const isCurrentUser =
                          session && entry.userId === session.user.id;
                        return (
                          <TableRow
                            key={entry._id}
                            className={`hover:bg-[#1E2A36] ${
                              isCurrentUser
                                ? "border-2 border-[#E94560] bg-[#1E2A36]/50"
                                : ""
                            }`}
                          >
                            <TableCell>
                              <div className="flex items-center justify-center">
                                {getMedalIcon(entry.rank)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Link
                                  href={`/profile/${entry.userId}`}
                                  className="font-medium hover:text-[#E94560]"
                                >
                                  {entry.username}
                                </Link>
                                {isCurrentUser && (
                                  <span className="rounded bg-[#E94560] px-2 py-0.5 text-xs font-bold">
                                    YOU
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-mono font-bold text-[#FFB547]">
                              {entry.total_score.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-center">
                              {entry.predictions_count}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex flex-col items-center">
                                <span>{entry.avg_accuracy.toFixed(1)}%</span>
                                <div className="mt-1 h-1.5 w-full rounded-full bg-[#1E2A36]">
                                  <div
                                    className="h-full rounded-full bg-[#00D4AA]"
                                    style={{ width: `${entry.avg_accuracy}%` }}
                                  />
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              {entry.current_streak >= 3 ? (
                                <div className="flex justify-center">
                                  <StreakIndicator
                                    currentStreak={entry.current_streak}
                                    size="sm"
                                  />
                                </div>
                              ) : (
                                <span className="text-gray-500">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex justify-center">
                                {getTrendIcon(entry.trend, entry.trend_change)}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No players found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {filteredLeaderboard.length >= ITEMS_PER_PAGE && (
                <div className="flex items-center justify-between border-t border-[#1E2A36] p-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1 || loading}
                    className="border-[#1E2A36] bg-[#0A0A1A]"
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-400">
                    Page {currentPage}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={
                      loading || filteredLeaderboard.length < ITEMS_PER_PAGE
                    }
                    className="border-[#1E2A36] bg-[#0A0A1A]"
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Your Stats Card */}
          {session && currentUserStats && (
            <Card className="border-[#E94560] bg-[#13202D]">
              <CardHeader>
                <CardTitle className="text-[#E94560]">Your Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Current Rank</span>
                  <span className="font-mono text-xl font-bold">
                    #{currentUserStats.rank}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total Score</span>
                  <span className="font-mono text-xl font-bold text-[#FFB547]">
                    {currentUserStats.total_score.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Predictions</span>
                  <span className="font-mono text-xl font-bold">
                    {currentUserStats.predictions_count}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Accuracy</span>
                  <span className="font-mono text-xl font-bold text-[#00D4AA]">
                    {currentUserStats.accuracy.toFixed(1)}%
                  </span>
                </div>
                {currentUserStats.current_streak > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Streak</span>
                    <StreakIndicator
                      currentStreak={currentUserStats.current_streak}
                      size="sm"
                    />
                  </div>
                )}
                <Link href="/profile">
                  <Button className="w-full bg-[#E94560] hover:bg-[#E94560]/90">
                    View Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Period Info Card */}
          <Card className="border-[#1E2A36] bg-[#13202D]">
            <CardHeader>
              <CardTitle>Period Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1E2A36]">
                  <Users className="h-5 w-5 text-[#E94560]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total Participants</p>
                  <p className="font-mono text-lg font-bold">
                    {periodStats.total_participants.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1E2A36]">
                  <Award className="h-5 w-5 text-[#FFB547]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Top Score</p>
                  <p className="font-mono text-lg font-bold text-[#FFB547]">
                    {periodStats.top_score.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1E2A36]">
                  <Target className="h-5 w-5 text-[#00D4AA]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Average Score</p>
                  <p className="font-mono text-lg font-bold text-[#00D4AA]">
                    {periodStats.avg_score.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
