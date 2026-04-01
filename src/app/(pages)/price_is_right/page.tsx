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

async function getPageData() {
  await connectToDB();
  const db = mongoose.connection.db!;
  const now = new Date();
  // Scraper offsets sort.deadline by -1 day from BaT's actual end time,
  // so we look back 24h to catch auctions that are still live on BaT
  const lookback = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Live auctions filtered to qualifying makes
  const activeAuctions = await Auctions.find({
    "sort.deadline": { $gt: lookback },
    $or: QUALIFYING_MAKES.map((make) => ({
      title: { $regex: make, $options: "i" },
    })),
  })
    .sort({ "sort.deadline": 1 })
    .limit(50)
    .lean();

  // Count guesses per auction
  const auctionIds = activeAuctions.map((a: any) => a._id);
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

  return {
    auctions: JSON.parse(
      JSON.stringify(
        activeAuctions.map((a: any) => {
          // Scraper offsets sort.deadline by -1 day from BaT's actual end time.
          // Add 24h back so the client countdown shows the real deadline.
          const rawDeadline = a.sort?.deadline;
          const displayDeadline = rawDeadline
            ? new Date(new Date(rawDeadline).getTime() + 24 * 60 * 60 * 1000).toISOString()
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
          };
        })
      )
    ),
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
