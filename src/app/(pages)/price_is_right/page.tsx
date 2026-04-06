export const dynamic = "force-dynamic";

import { Suspense } from "react";
import connectToDB from "@/lib/mongoose";
import Auctions from "@/models/auction.model";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import GuessTheHammerClient from "./GuessTheHammerClient";

const QUALIFYING_MAKES = [
  "ferrari", "lamborghini", "bugatti", "mclaren", "porsche",
  "corvette", "camaro", "mustang", "mercedes", "bmw",
  "alfa romeo", "fiat", "volvo", "pagani", "cobra",
];

// Scraper stores sort.deadline as -1 day from BaT's actual end time.
const DAY_MS = 24 * 60 * 60 * 1000;
const LOCK_HOURS = 12; // Guessing locks this many hours before end

async function getPageData() {
  await connectToDB();
  const db = mongoose.connection.db!;
  const now = new Date();

  // Thresholds (all in terms of stored/raw deadline)
  // Real deadline = raw + 24h
  // "Open" means real deadline > now + 12h → raw > now - 12h
  const openThreshold = new Date(now.getTime() - (DAY_MS - LOCK_HOURS * 60 * 60 * 1000));
  // "Ending soon" means real deadline > now but ≤ now + 12h → raw > now - 24h but ≤ openThreshold
  const liveThreshold = new Date(now.getTime() - DAY_MS);
  // Show ended auctions from last 7 days
  const recentThreshold = new Date(now.getTime() - 7 * DAY_MS);

  const makeFilter = {
    $or: QUALIFYING_MAKES.map((make) => ({
      title: { $regex: make, $options: "i" },
    })),
  };

  const allAuctions = await Auctions.find({
    "sort.deadline": { $gt: recentThreshold },
    ...makeFilter,
  })
    .sort({ "sort.deadline": -1 })
    .limit(150)
    .lean();

  // Classify into 3 tiers based on real deadline
  const open: any[] = [];
  const endingSoon: any[] = [];
  const ended: any[] = [];

  for (const a of allAuctions) {
    const rawDl = a.sort?.deadline ? new Date(a.sort.deadline) : null;
    if (!rawDl) { ended.push(a); continue; }

    if (rawDl > openThreshold) {
      open.push(a); // > 12h to real end — guessing allowed
    } else if (rawDl > liveThreshold) {
      endingSoon.push(a); // ≤ 12h to real end — view only
    } else {
      ended.push(a); // past real end
    }
  }

  // Sort: open by highest bid first (most exciting), endingSoon by soonest ending
  open.sort((a: any, b: any) => (b.sort?.price ?? 0) - (a.sort?.price ?? 0));
  endingSoon.sort((a: any, b: any) => new Date(a.sort?.deadline).getTime() - new Date(b.sort?.deadline).getTime());

  const orderedAuctions = [...open, ...endingSoon, ...ended];

  // Count guesses per auction
  const auctionIds = orderedAuctions.map((a: any) => a._id);
  const guessCounts = await db
    .collection("guesstehammers")
    .aggregate([
      { $match: { auction: { $in: auctionIds } } },
      { $group: { _id: "$auction", count: { $sum: 1 } } },
    ])
    .toArray();
  const guessCountMap = new Map(
    guessCounts.map((g) => [g._id.toHexString(), g.count])
  );

  // Recent graded results (last 10 auctions)
  const recentResults = await db
    .collection("guesstehammers")
    .aggregate([
      { $match: { status: { $in: ["graded", "paid"] } } },
      { $sort: { updatedAt: -1 } },
      {
        $group: {
          _id: "$auction",
          actualPrice: { $first: "$actualPrice" },
          totalEntries: { $sum: 1 },
          winner: { $first: "$$ROOT" },
        },
      },
      { $limit: 10 },
    ])
    .toArray();

  // Enrich results with auction titles
  const resultAuctionIds = recentResults.map((r) => r._id);
  const resultAuctions = await db
    .collection("auctions")
    .find({ _id: { $in: resultAuctionIds } })
    .project({ title: 1, image: 1, sort: 1 })
    .toArray();
  const auctionMap = new Map(
    resultAuctions.map((a) => [a._id.toHexString(), a])
  );

  // Get winner usernames
  const winnerUserIds = recentResults
    .filter((r) => r.winner?.user)
    .map((r) => r.winner.user);
  const winnerUsers = await db
    .collection("users")
    .find({ _id: { $in: winnerUserIds } })
    .project({ username: 1, fullName: 1 })
    .toArray();
  const winnerUserMap = new Map(
    winnerUsers.map((u) => [u._id.toHexString(), u])
  );

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  // Get user's existing guesses on active auctions
  let userGuesses: Record<string, number> = {};
  if (userId) {
    const guesses = await db
      .collection("guesstehammers")
      .find({
        user: new mongoose.Types.ObjectId(userId),
        auction: { $in: auctionIds },
      })
      .toArray();
    for (const g of guesses) {
      userGuesses[g.auction.toHexString()] = g.guessedPrice;
    }
  }

  // Get user's graded guesses for share links
  let userGradedGuesses: Record<string, string> = {};
  if (userId) {
    const gradedGuesses = await db
      .collection("guesstehammers")
      .find({
        user: new mongoose.Types.ObjectId(userId),
        auction: { $in: resultAuctionIds },
        status: { $in: ["graded", "paid"] },
      })
      .project({ auction: 1 })
      .toArray();
    for (const g of gradedGuesses) {
      userGradedGuesses[g.auction.toHexString()] = g._id.toHexString();
    }
  }

  // Get user balance
  let userBalance = 0;
  if (userId) {
    const user = await db
      .collection("users")
      .findOne({ _id: new mongoose.Types.ObjectId(userId) });
    userBalance = user?.balance ?? 0;
  }

  // Determine status for each auction
  function getStatus(a: any): "open" | "ending_soon" | "ended" {
    if (open.includes(a)) return "open";
    if (endingSoon.includes(a)) return "ending_soon";
    return "ended";
  }

  // Extract make from title for filtering
  function extractMake(title: string): string {
    const t = title.toLowerCase();
    for (const make of QUALIFYING_MAKES) {
      if (t.includes(make)) return make.charAt(0).toUpperCase() + make.slice(1);
    }
    return "Other";
  }

  return {
    auctions: JSON.parse(
      JSON.stringify(
        orderedAuctions.map((a: any) => {
          const rawDeadline = a.sort?.deadline;
          const displayDeadline = rawDeadline
            ? new Date(new Date(rawDeadline).getTime() + DAY_MS).toISOString()
            : null;
          return {
            _id: a._id.toString(),
            auctionId: a.auction_id,
            title: a.title,
            image: a.image,
            deadline: displayDeadline,
            currentBid: a.sort?.price ?? 0,
            bids: a.sort?.bids ?? 0,
            guessCount: guessCountMap.get(a._id.toString()) ?? 0,
            status: getStatus(a),
            make: extractMake(a.title ?? ""),
          };
        })
      )
    ),
    counts: {
      open: open.length,
      endingSoon: endingSoon.length,
      ended: ended.length,
    },
    recentResults: JSON.parse(
      JSON.stringify(
        recentResults.map((r) => {
          const auction = auctionMap.get(r._id.toHexString());
          const winnerUser = r.winner?.user
            ? winnerUserMap.get(r.winner.user.toHexString())
            : null;
          return {
            auctionId: r._id.toString(),
            title: (auction as any)?.title ?? "Unknown",
            image: (auction as any)?.image ?? null,
            actualPrice: r.actualPrice,
            totalEntries: r.totalEntries,
            winnerName:
              (winnerUser as any)?.username ||
              (winnerUser as any)?.fullName ||
              "Anonymous",
            winnerGuess: r.winner?.guessedPrice,
            winnerPrize: r.winner?.prizePaid ?? 0,
            userGuessId: userGradedGuesses[r._id.toHexString()] || undefined,
          };
        })
      )
    ),
    userGuesses,
    userBalance,
    isAuthenticated: !!userId,
  };
}

export default async function PriceIsRightPage() {
  const data = await getPageData();

  return (
    <div className="min-h-screen bg-[#0A0A1A]">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-gray-400">Loading...</div>
          </div>
        }
      >
        <GuessTheHammerClient {...data} />
      </Suspense>
    </div>
  );
}
