export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDB from "@/lib/mongoose";
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ auctionId: string }> }
) {
  const { auctionId } = await params;
  await connectToDB();
  const db = mongoose.connection.db!;

  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;

  // Find auction ObjectId
  const auction = await db.collection("auctions").findOne({
    $or: [
      { auction_id: auctionId },
      ...(mongoose.Types.ObjectId.isValid(auctionId) ? [{ _id: new mongoose.Types.ObjectId(auctionId) }] : []),
    ],
  });

  if (!auction) {
    return NextResponse.json({ error: "Auction not found" }, { status: 404 });
  }

  const entries = await db.collection("guesstehammers")
    .find({
      auction: auction._id,
      status: { $in: ["graded", "paid"] },
    })
    .sort({ penalizedError: 1 })
    .toArray();

  // Batch fetch user display names
  const userIds = entries.map((e) => e.user);
  const users = await db.collection("users")
    .find({ _id: { $in: userIds } })
    .project({ username: 1, fullName: 1, image: 1 })
    .toArray();
  const userMap = new Map(users.map((u) => [u._id.toHexString(), u]));

  const results = entries.map((e, i) => {
    const user = userMap.get(e.user.toHexString());
    return {
      rank: e.rank ?? i + 1,
      userId: e.user.toHexString(),
      displayName: (user as any)?.username || (user as any)?.fullName || "Anonymous",
      guessedPrice: e.guessedPrice,
      absoluteError: e.absoluteError,
      penalizedError: e.penalizedError,
      prizePaid: e.prizePaid ?? 0,
      isCurrentUser: currentUserId === e.user.toHexString(),
    };
  });

  return NextResponse.json({
    auctionId,
    actualPrice: entries[0]?.actualPrice ?? null,
    results,
  });
}
