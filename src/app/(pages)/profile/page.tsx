"use client";

import { useSession } from "next-auth/react";
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
import { Label } from "@/app/components/ui/label";
import { Switch } from "@/app/components/ui/switch";
import { TimerProvider } from "@/app/context/TimerContext";
import {
  getMyPredictions,
  getMyTournamentPredictions,
  getMyAuctionPoints,
} from "@/lib/data";
import { getInitials } from "@/lib/utils";
import {
  CircleDollarSign,
  Clock,
  Settings,
  Trophy,
  TrendingUp,
  Target,
  Award,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Flame,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { PulseLoader } from "react-spinners";
import { default as DollarIcon } from "../../../../public/images/dollar.svg";
import HourglassIcon from "../../../../public/images/hour-glass.svg";
import MoneyBagBlack from "../../../../public/images/money-bag-black.svg";
import WalletIcon from "../../../../public/images/wallet--money-payment-finance-wallet.svg";
import StreakIndicator from "@/app/components/StreakIndicator";
import BadgeDisplay from "@/app/components/BadgeDisplay";
import { BadgeType } from "@/models/badge.model";
import { useTrackEvent } from "@/hooks/useTrackEvent";
import { DailyChallenge } from "@/app/components/DailyChallenge";
import {
  getGuestPredictions,
  clearGuestPredictions,
} from "@/lib/guestPredictions";

interface Props {}

function Profile(props: Props) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [about, setAbout] = useState("");
  const [loading, setLoading] = useState(true);
  const [dataIsLoading, setDataIsLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activePredictions, setActivePredictions] = useState([]);
  const [completedPredictions, setCompletedPredictions] = useState([]);
  const [activeTournamentPredictions, setActiveTournamentPredictions] =
    useState([]);
  const [completedTournamentPredictions, setCompletedTournamentPredictions] =
    useState([]);
  const [isActivePrediction, setIsActivePrediction] = useState(true);
  const [isActiveTournament, setIsActiveTournament] = useState(true);
  const [currentTab, setCurrentTab] = useState<string>("overview");
  const [userPoints, setUserPoints] = useState<number>(0);
  const [emailPreferences, setEmailPreferences] = useState({
    weekly_digest: true,
    auction_reminders: true,
    result_notifications: true,
    marketing: false,
  });
  const [profileData, setProfileData] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [streakData, setStreakData] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    old: "",
    new: "",
    confirm: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [notifPrefs, setNotifPrefs] = useState({
    email_30min: true,
    email_rank_drop: true,
    push_30min: false,
    sms_30min: false,
  });
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifSaved, setNotifSaved] = useState(false);

  const { data } = useSession();
  const router = useRouter();
  const track = useTrackEvent();

  useEffect(() => {
    if (data) {
      setName(data?.user.name);
      setUsername(data?.user.username!);
      fetchUserProfile();
    }
  }, [data]);

  // Migrate guest predictions to the authenticated account on first login
  useEffect(() => {
    if (!data?.user) return;
    const guestPredictions = getGuestPredictions();
    if (!guestPredictions.length) return;

    fetch("/api/guest/migrate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        predictions: guestPredictions.map((p) => ({
          auctionId: p.auctionId,
          predictedPrice: p.predictedPrice,
        })),
      }),
    })
      .then(() => {
        clearGuestPredictions();
      })
      .catch(() => {
        // Silently fail — guest predictions remain in localStorage
      });
  }, [data]);

  useEffect(() => {
    track("profile_viewed", {
      tab: currentTab,
      current_streak: streakData?.current_streak || 0,
      badges_earned: badges.length,
    });
  }, [currentTab]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/profile`, {
        method: "GET",
      });
      if (!res.ok) throw new Error("Unable to fetch user profile");

      const result = await res.json();
      setProfileData(result);
      setAbout(result.user.about || "");
      setBadges(result.badges || []);
      setStreakData(result.streak);
      setEmailPreferences(
        result.user.email_preferences || {
          weekly_digest: true,
          auction_reminders: true,
          result_notifications: true,
          marketing: false,
        }
      );
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch total points
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

  // Fetch predictions/tournaments
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
    } else if (currentTab === "tournaments") {
      fetchTournaments();
    }
  }, [currentTab]);

  useEffect(() => {
    fetch("/api/notifications/preferences")
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) setNotifPrefs(data);
      })
      .catch(() => {}); // graceful — backend not yet implemented
  }, []);

  const saveNotifPrefs = async () => {
    setNotifLoading(true);
    await fetch("/api/notifications/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(notifPrefs),
    }).catch(() => {});
    setNotifLoading(false);
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 2000);
  };

  const handleUpdateProfile = async () => {
    setIsLoading(true);
    setSuccessMessage("");
    setErrorMessage("");
    try {
      const response = await fetch(`/api/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: name,
          about: about,
        }),
      });

      if (response.ok) {
        setSuccessMessage("Profile updated successfully");
        fetchUserProfile();
      } else {
        setErrorMessage("Failed to update profile");
      }
    } catch (error) {
      setErrorMessage("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEmailPreferences = async () => {
    setIsLoading(true);
    setSuccessMessage("");
    setErrorMessage("");
    try {
      const response = await fetch(`/api/profile/email-preferences`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_preferences: emailPreferences }),
      });

      if (response.ok) {
        setSuccessMessage("Email preferences updated successfully");
        track("email_preferences_updated", { preferences: emailPreferences });
      } else {
        setErrorMessage("Failed to update email preferences");
      }
    } catch (error) {
      setErrorMessage("Failed to update email preferences");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      setErrorMessage("New passwords do not match");
      return;
    }
    if (passwords.new.length < 8) {
      setErrorMessage("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    setSuccessMessage("");
    setErrorMessage("");
    try {
      const response = await fetch(`/api/profile/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword: passwords.old,
          newPassword: passwords.new,
        }),
      });

      if (response.ok) {
        setSuccessMessage("Password changed successfully");
        setPasswords({ old: "", new: "", confirm: "" });
      } else {
        const data = await response.json();
        setErrorMessage(data.error || "Failed to change password");
      }
    } catch (error) {
      setErrorMessage("Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const response = await fetch(`/api/profile/export`);
      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `velocity-markets-data-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      track("profile_data_exported", {});
    } catch (error) {
      setErrorMessage("Failed to export data");
    }
  };

  // Get all badge types and determine which are locked
  const allBadgeTypes = Object.values(BadgeType);
  const earnedBadgeTypes = badges.map((b) => b.badge_type);
  const lockedBadges = allBadgeTypes.filter(
    (type) => !earnedBadgeTypes.includes(type)
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-b-transparent border-l-transparent border-r-transparent border-t-[#E94560]"></div>
            <p className="text-xl">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Profile Header */}
      <div className="mb-8 overflow-hidden rounded-xl bg-[#1E2A36]">
        <div className="h-20 bg-gradient-to-r from-[#E94560] to-[#0A0A1A]"></div>
        <div className="px-8 pb-8">
          <div className="-mt-12 flex flex-col items-start gap-6 md:flex-row md:items-center">
            <Avatar className="h-24 w-24 border-4 border-[#13202D] shadow-lg">
              <AvatarFallback className="bg-[#E94560] text-2xl text-white">
                {getInitials(data ? data.user.name : "")}
              </AvatarFallback>
            </Avatar>
            <div className="pt-12 md:pt-0">
              <h1 className="text-3xl font-bold">
                {data ? data.user.name : ""}
              </h1>
              <p className="text-gray-400">@{data ? data.user.username : ""}</p>
              {profileData?.user?.rank_title && (
                <span className="mt-2 inline-block rounded-full bg-[#E94560]/20 px-3 py-1 text-sm font-medium text-[#E94560]">
                  {profileData.user.rank_title}
                </span>
              )}
            </div>
            <div className="ml-auto pt-6 md:pt-0">
              <Button
                variant="outline"
                className="flex items-center gap-2 border-[#E94560] bg-[#0A0A1A] hover:bg-[#E94560]/10"
                onClick={() => router.push("/settings")}
              >
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs
        defaultValue="overview"
        className="w-full"
        value={currentTab}
        onValueChange={(value) => setCurrentTab(value)}
      >
        <TabsList className="mb-6 bg-[#1E2A36]">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-[#E94560] data-[state=active]:text-white"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="predictions"
            className="data-[state=active]:bg-[#E94560] data-[state=active]:text-white"
          >
            Predictions
          </TabsTrigger>
          <TabsTrigger
            value="tournaments"
            className="data-[state=active]:bg-[#E94560] data-[state=active]:text-white"
          >
            Tournaments
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="data-[state=active]:bg-[#E94560] data-[state=active]:text-white"
          >
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview */}
        <TabsContent value="overview">
          <div className="mb-6">
            <DailyChallenge />
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Hero Stats Card */}
            <div className="lg:col-span-3">
              <Card className="border-[#1E2A36] bg-gradient-to-br from-[#1E2A36] to-[#13202D]">
                <CardContent className="p-6">
                  <div className="grid gap-6 md:grid-cols-5">
                    <div className="flex flex-col items-center text-center">
                      <Award className="mb-2 h-8 w-8 text-[#E94560]" />
                      <p className="text-sm text-gray-400">Current Rank</p>
                      <p className="font-mono text-2xl font-bold">
                        #{profileData?.rank || "-"}
                      </p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <Target className="mb-2 h-8 w-8 text-[#FFB547]" />
                      <p className="text-sm text-gray-400">Total Points</p>
                      <p className="font-mono text-2xl font-bold text-[#FFB547]">
                        {userPoints.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <TrendingUp className="mb-2 h-8 w-8 text-[#00D4AA]" />
                      <p className="text-sm text-gray-400">Predictions</p>
                      <p className="font-mono text-2xl font-bold">
                        {(activePredictions.length +
                          completedPredictions.length)}
                      </p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <CircleDollarSign className="mb-2 h-8 w-8 text-[#00D4AA]" />
                      <p className="text-sm text-gray-400">Accuracy</p>
                      <p className="font-mono text-2xl font-bold text-[#00D4AA]">
                        {profileData?.accuracy?.toFixed(1) || "0.0"}%
                      </p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <Clock className="mb-2 h-8 w-8 text-gray-400" />
                      <p className="text-sm text-gray-400">Member Since</p>
                      <p className="text-sm font-medium">
                        {profileData?.user?.createdAt
                          ? new Date(
                              profileData.user.createdAt
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Column 1: Streaks & Badges */}
            <div className="space-y-6">
              {/* Streak Dashboard */}
              <Card className="border-[#1E2A36] bg-[#13202D]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-[#FFB547]" />
                    Prediction Streaks
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Current Streak</span>
                    {streakData?.current_streak > 0 ? (
                      <StreakIndicator
                        currentStreak={streakData.current_streak}
                        size="md"
                      />
                    ) : (
                      <span className="text-gray-500">No streak</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Longest Streak</span>
                    <span className="font-mono text-xl font-bold text-[#FFB547]">
                      {streakData?.longest_streak || 0} days
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Freeze Tokens</span>
                    <span className="font-mono text-xl font-bold text-[#00D4AA]">
                      {streakData?.freeze_tokens || 0}
                    </span>
                  </div>
                  <div className="mt-4 rounded-lg bg-[#1E2A36] p-3">
                    <p className="text-xs text-gray-400">
                      Make predictions daily to build your streak and earn
                      rewards!
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Badges Grid */}
              <Card className="border-[#1E2A36] bg-[#13202D]">
                <CardHeader>
                  <CardTitle>Badges & Achievements</CardTitle>
                  <p className="text-sm text-gray-400">
                    {badges.length} of {allBadgeTypes.length} earned
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {/* Earned badges first */}
                    {badges.map((badge) => (
                      <BadgeDisplay
                        key={badge._id}
                        badge={badge}
                        size="sm"
                        locked={false}
                      />
                    ))}
                    {/* Locked badges */}
                    {lockedBadges.map((badgeType) => (
                      <BadgeDisplay
                        key={badgeType}
                        badge={badgeType}
                        size="sm"
                        locked={true}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Column 2: Recent Activity */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-[#1E2A36] bg-[#13202D]">
                <CardHeader>
                  <CardTitle>Recent Predictions</CardTitle>
                </CardHeader>
                <CardContent>
                  {completedPredictions.length === 0 ? (
                    <div className="py-12 text-center text-gray-400">
                      No recent predictions to display
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {completedPredictions.slice(0, 5).map((prediction: any) => (
                        <div
                          key={prediction._id}
                          className="flex items-center gap-4 rounded-lg border border-[#1E2A36] bg-[#0A0A1A] p-4"
                        >
                          <Image
                            src={prediction.auctionImage}
                            width={80}
                            height={80}
                            alt={`${prediction.auctionYear} ${prediction.auctionMake} ${prediction.auctionModel}`}
                            className="h-20 w-20 rounded object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold">
                              {prediction.auctionYear} {prediction.auctionMake}{" "}
                              {prediction.auctionModel}
                            </h4>
                            <div className="mt-1 flex items-center gap-4 text-sm">
                              <span className="text-gray-400">
                                Your Prediction:{" "}
                                <span className="font-mono text-[#FFB547]">
                                  ${prediction.predictedPrice.toLocaleString()}
                                </span>
                              </span>
                              <span className="text-gray-400">
                                Actual:{" "}
                                <span className="font-mono text-[#00D4AA]">
                                  ${prediction.auctionPrice.toLocaleString()}
                                </span>
                              </span>
                            </div>
                            {prediction.score && (
                              <div className="mt-1">
                                <span className="text-xs text-gray-400">
                                  Score:{" "}
                                </span>
                                <span className="font-mono font-bold text-[#E94560]">
                                  {prediction.score}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      <Link href="/profile?tab=predictions">
                        <Button variant="outline" className="w-full">
                          View All Predictions
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Predictions History */}
        <TabsContent value="predictions">
          <Card className="border-[#1E2A36] bg-[#13202D]">
            <CardHeader>
              <CardTitle>Your Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 rounded bg-[#172431]">
                <div className="flex">
                  <button
                    onClick={() => setIsActivePrediction(true)}
                    className={`flex w-1/2 items-center justify-center gap-2 border-b-2 border-[#314150] py-2 ${
                      isActivePrediction === true
                        ? "border-white text-lg font-bold"
                        : ""
                    }`}
                  >
                    <div>ACTIVE </div>
                    {!dataIsLoading && (
                      <span className="rounded bg-[#E94560] px-1 text-sm font-bold text-white">
                        {activePredictions.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setIsActivePrediction(false)}
                    className={`flex w-1/2 items-center justify-center gap-2 border-b-2 border-[#314150] py-2 ${
                      isActivePrediction === false
                        ? "border-white text-lg font-bold"
                        : ""
                    }`}
                  >
                    <div>COMPLETED</div>
                    {!dataIsLoading && (
                      <span className="rounded bg-[#E94560] px-1 text-sm font-bold text-white">
                        {completedPredictions.length}
                      </span>
                    )}
                  </button>
                </div>
                <div>
                  {dataIsLoading ? (
                    <div className="flex h-[100px] w-full items-center justify-center">
                      <PulseLoader color="#E94560" />
                    </div>
                  ) : isActivePrediction === true ? (
                    activePredictions.length === 0 ? (
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
                  ) : completedPredictions.length === 0 ? (
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

        {/* Tab 3: Tournament History */}
        <TabsContent value="tournaments">
          <Card className="border-[#1E2A36] bg-[#13202D]">
            <CardHeader>
              <CardTitle>Your Tournaments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 rounded bg-[#172431]">
                <div className="flex">
                  <button
                    onClick={() => setIsActiveTournament(true)}
                    className={`flex w-1/2 items-center justify-center gap-2 border-b-2 border-[#314150] py-2 ${
                      isActiveTournament === true
                        ? "border-white text-lg font-bold"
                        : ""
                    } `}
                  >
                    <div>ACTIVE</div>
                    {!dataIsLoading && (
                      <span className="rounded bg-[#E94560] px-1 text-sm font-bold text-white">
                        {activeTournamentPredictions.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setIsActiveTournament(false)}
                    className={`flex w-1/2 items-center justify-center gap-2 border-b-2 border-[#314150] py-2 ${
                      isActiveTournament === false
                        ? "border-white text-lg font-bold"
                        : ""
                    }`}
                  >
                    <div>COMPLETED</div>
                    {!dataIsLoading && (
                      <span className="rounded bg-[#E94560] px-1 text-sm font-bold text-white">
                        {completedTournamentPredictions.length}
                      </span>
                    )}
                  </button>
                </div>
                <div>
                  {dataIsLoading ? (
                    <div className="flex h-[100px] w-full items-center justify-center">
                      <PulseLoader color="#E94560" />
                    </div>
                  ) : isActiveTournament === true ? (
                    activeTournamentPredictions.length === 0 ? (
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
                  ) : completedTournamentPredictions.length === 0 ? (
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

        {/* Tab 4: Settings */}
        <TabsContent value="settings">
          <div className="space-y-6">
            {/* Profile Settings */}
            <Card className="border-[#1E2A36] bg-[#13202D]">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                    placeholder="Your display name"
                    className="mt-2 border-[#1E2A36] bg-[#0A0A1A]"
                  />
                </div>

                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    disabled
                    className="mt-2 border-[#1E2A36] bg-[#1E2A36] opacity-50"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Username cannot be changed
                  </p>
                </div>

                <div>
                  <Label htmlFor="about">About / Bio</Label>
                  <TextArea
                    id="about"
                    value={about}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAbout(e.target.value)}
                    placeholder="Tell others about yourself"
                    className="mt-2 border-[#1E2A36] bg-[#0A0A1A]"
                    rows={3}
                    maxLength={200}
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    {about.length}/200 characters
                  </p>
                </div>

                <Button
                  onClick={handleUpdateProfile}
                  disabled={isLoading}
                  className="bg-[#E94560] hover:bg-[#E94560]/90"
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>

            {/* Email Preferences */}
            <Card className="border-[#1E2A36] bg-[#13202D]">
              <CardHeader>
                <CardTitle>Email Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Weekly Digest</Label>
                    <p className="text-sm text-gray-400">
                      Receive weekly summary of your predictions
                    </p>
                  </div>
                  <Switch
                    checked={emailPreferences.weekly_digest}
                    onCheckedChange={(checked) =>
                      setEmailPreferences((prev) => ({
                        ...prev,
                        weekly_digest: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auction Reminders</Label>
                    <p className="text-sm text-gray-400">
                      Get notified 24h before auction close
                    </p>
                  </div>
                  <Switch
                    checked={emailPreferences.auction_reminders}
                    onCheckedChange={(checked) =>
                      setEmailPreferences((prev) => ({
                        ...prev,
                        auction_reminders: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Result Notifications</Label>
                    <p className="text-sm text-gray-400">
                      Receive emails when predictions are scored
                    </p>
                  </div>
                  <Switch
                    checked={emailPreferences.result_notifications}
                    onCheckedChange={(checked) =>
                      setEmailPreferences((prev) => ({
                        ...prev,
                        result_notifications: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Marketing Emails</Label>
                    <p className="text-sm text-gray-400">
                      Receive promotional offers and updates
                    </p>
                  </div>
                  <Switch
                    checked={emailPreferences.marketing}
                    onCheckedChange={(checked) =>
                      setEmailPreferences((prev) => ({
                        ...prev,
                        marketing: checked,
                      }))
                    }
                  />
                </div>

                <Button
                  onClick={handleUpdateEmailPreferences}
                  disabled={isLoading}
                  className="bg-[#E94560] hover:bg-[#E94560]/90"
                >
                  {isLoading ? "Saving..." : "Save Preferences"}
                </Button>
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <div className="rounded-lg border border-[#1E2A36] bg-[#13202D] p-5 mt-6">
              <h3 className="text-white font-semibold mb-4">Notifications</h3>
              <div className="space-y-3 mb-4">
                {([
                  { key: "email_30min", label: "Email when auction closes in 30 min" },
                  { key: "email_rank_drop", label: "Email when you drop in rank" },
                ] as const).map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifPrefs[key]}
                      onChange={(e) =>
                        setNotifPrefs((p) => ({ ...p, [key]: e.target.checked }))
                      }
                      className="w-4 h-4 accent-[#E94560]"
                    />
                    <span className="text-gray-300 text-sm">{label}</span>
                  </label>
                ))}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifPrefs.push_30min}
                    onChange={async (e) => {
                      if (e.target.checked && typeof Notification !== "undefined") {
                        const perm = await Notification.requestPermission();
                        if (perm !== "granted") return;
                        track("notification_opted_in", { channel: "push" });
                      }
                      setNotifPrefs((p) => ({ ...p, push_30min: e.target.checked }));
                    }}
                    className="w-4 h-4 accent-[#E94560]"
                  />
                  <span className="text-gray-300 text-sm">
                    Push: Auction closes in 30 min
                    {!notifPrefs.push_30min && (
                      <span className="ml-2 text-xs text-[#FFB547]">(requires permission)</span>
                    )}
                  </span>
                </label>
              </div>
              <button
                onClick={saveNotifPrefs}
                disabled={notifLoading}
                className="bg-[#E94560] text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-[#E94560]/90 transition-colors"
              >
                {notifSaved ? "Saved!" : notifLoading ? "Saving\u2026" : "Save Preferences"}
              </button>
            </div>

            {/* Change Password */}
            <Card className="border-[#1E2A36] bg-[#13202D]">
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="oldPassword">Current Password</Label>
                  <div className="relative mt-2">
                    <Input
                      id="oldPassword"
                      type={showPassword ? "text" : "password"}
                      value={passwords.old}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPasswords((prev) => ({ ...prev, old: e.target.value }))
                      }
                      className="border-[#1E2A36] bg-[#0A0A1A] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={passwords.new}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setPasswords((prev) => ({ ...prev, new: e.target.value }))
                    }
                    className="mt-2 border-[#1E2A36] bg-[#0A0A1A]"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={passwords.confirm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setPasswords((prev) => ({
                        ...prev,
                        confirm: e.target.value,
                      }))
                    }
                    className="mt-2 border-[#1E2A36] bg-[#0A0A1A]"
                  />
                </div>

                <Button
                  onClick={handleChangePassword}
                  disabled={isLoading}
                  className="bg-[#E94560] hover:bg-[#E94560]/90"
                >
                  {isLoading ? "Changing..." : "Change Password"}
                </Button>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card className="border-[#1E2A36] bg-[#13202D]">
              <CardHeader>
                <CardTitle>Account Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  onClick={handleExportData}
                  className="flex w-full items-center gap-2 border-[#1E2A36]"
                >
                  <Download className="h-4 w-4" />
                  Export My Data
                </Button>

                <Button
                  variant="outline"
                  className="flex w-full items-center gap-2 border-[#E94560] text-[#E94560] hover:bg-[#E94560]/10"
                  onClick={() => {
                    if (
                      confirm(
                        "Are you sure you want to delete your account? This action cannot be undone."
                      )
                    ) {
                      // Handle account deletion
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </Button>
              </CardContent>
            </Card>

            {/* Success/Error Messages */}
            {successMessage && (
              <div className="rounded-lg border border-[#00D4AA] bg-[#00D4AA]/10 p-4 text-[#00D4AA]">
                {successMessage}
              </div>
            )}
            {errorMessage && (
              <div className="rounded-lg border border-[#E94560] bg-[#E94560]/10 p-4 text-[#E94560]">
                {errorMessage}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Profile;

// Completed Prediction Card Component (kept from original)
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

  const currencyMyWager = new Intl.NumberFormat().format(priceGuess);
  const currencyFinalPrice = new Intl.NumberFormat().format(finalPrice);

  return (
    <div>
      <div className="flex gap-6 px-6 py-6">
        <Link
          href={
            type === "prediction"
              ? `/auction_details?id=${id}&mode=free_play`
              : `/tournaments/${tournament_id}`
          }
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
              <div className="font-bold text-[#E94560]">${currencyMyWager}</div>
            </div>
            <div className="flex gap-2 text-sm">
              <Image src={DollarIcon} alt="" className="w-3.5 text-[#d1d3d6]" />
              <div className="text-[#d1d3d6]">Final Price:</div>
              <div className="font-bold text-[#00D4AA]">
                ${currencyFinalPrice}
              </div>
            </div>
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
            <div className="mt-2 flex w-full items-center gap-2 rounded bg-[#4b2330] p-1 text-xs sm:mt-4 sm:gap-4 sm:p-2 sm:text-sm">
              <div className="grow-[1] text-left font-bold text-[#E94560]">
                UNSUCCESSFUL{" "}
                <span className="hidden sm:inline-block">AUCTION</span>
              </div>
            </div>
          )}
          {status === 4 && prize && (
            <div className="mt-2 flex w-full items-center justify-between rounded bg-[#00D4AA] p-1 text-xs font-bold text-[#0f1923] sm:mt-4 sm:gap-4 sm:p-2 sm:text-sm">
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
                    })}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="h-[2px] bg-white/10"></div>
    </div>
  );
};
