export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDB from "@/lib/mongoose";
import GuessTheHammer from "@/models/guess_the_hammer.model";
import Auctions from "@/models/auction.model";
import mongoose from "mongoose";

const ENTRY_FEE = 5;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const body = await req.json();
  const { auctionId, guessedPrice, isVirtual = false } = body;

  if (!auctionId || typeof guessedPrice !== "number" || guessedPrice <= 0) {
    return NextResponse.json({ error: "auctionId and guessedPrice (> 0) are required" }, { status: 400 });
  }

  await connectToDB();

  // Find the auction — try auction_id string first, then ObjectId
  let auction = await Auctions.findOne({ auction_id: auctionId }).lean();
  if (!auction) {
    try {
      auction = await Auctions.findById(auctionId).lean();
    } catch {}
  }
  if (!auction) {
    return NextResponse.json({ error: "Auction not found" }, { status: 404 });
  }

  // Check auction hasn't ended
  const deadline = (auction as any).sort?.deadline;
  if (deadline && new Date(deadline) < new Date()) {
    return NextResponse.json({ error: "This auction has already ended" }, { status: 400 });
  }

  const userId = new mongoose.Types.ObjectId(session.user.id);
  const auctionObjectId = (auction as any)._id;

  // If paid mode, deduct entry fee from wallet
  if (!isVirtual) {
    const db = mongoose.connection.db!;
    const user = await db.collection("users").findOne({ _id: userId });
    if (!user || (typeof user.balance !== "number") || user.balance < ENTRY_FEE) {
      return NextResponse.json({
        error: `Insufficient balance. You need $${ENTRY_FEE} to enter. Current balance: $${(user?.balance ?? 0).toFixed(2)}`,
      }, { status: 400 });
    }

    // Deduct entry fee
    await db.collection("users").updateOne(
      { _id: userId },
      { $inc: { balance: -ENTRY_FEE }, $set: { updatedAt: new Date() } }
    );

    // Audit trail
    await db.collection("transactions").insertOne({
      userID: userId,
      transactionType: "gth_entry",
      amount: ENTRY_FEE,
      type: "-",
      status: "success",
      description: `Guess the Hammer entry fee`,
      referenceId: auctionObjectId,
      transactionDate: new Date(),
    });
  }

  try {
    const guess = await GuessTheHammer.create({
      user: userId,
      auction: auctionObjectId,
      auctionId: (auction as any).auction_id ?? auctionId,
      guessedPrice,
      entryFee: isVirtual ? 0 : ENTRY_FEE,
      isVirtual,
      status: "pending",
    });

    return NextResponse.json({ success: true, guess });
  } catch (err: any) {
    // Handle duplicate key (user already guessed)
    if (err.code === 11000) {
      // Refund if paid
      if (!isVirtual) {
        const db = mongoose.connection.db!;
        await db.collection("users").updateOne(
          { _id: userId },
          { $inc: { balance: ENTRY_FEE }, $set: { updatedAt: new Date() } }
        );
        await db.collection("transactions").insertOne({
          userID: userId,
          transactionType: "gth_refund",
          amount: ENTRY_FEE,
          type: "+",
          status: "success",
          description: "Guess the Hammer entry refund — duplicate guess",
          referenceId: auctionObjectId,
          transactionDate: new Date(),
        });
      }
      return NextResponse.json({ error: "You already submitted a guess for this auction" }, { status: 409 });
    }
    throw err;
  }
}
