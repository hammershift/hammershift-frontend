import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import Transaction from "@/models/transaction";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const rawId = (session.user as any)._id ?? (session.user as any).id;
  if (!rawId) {
    // _id not yet set in JWT — fall back to email lookup
    const email = session.user?.email;
    if (!email) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    try {
      const client = await clientPromise;
      const db = client.db();
      const emailRegex = new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
      const user = await db.collection("users").findOne({ email: { $regex: emailRegex } });
      if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
      }
      return NextResponse.json({ balance: user.balance ?? 0 });
    } catch (error) {
      console.error("GET User Wallet (email fallback) error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  }

  const userID = new mongoose.Types.ObjectId(rawId as string);

  try {
    const client = await clientPromise;
    const db = client.db();

    // retrieve the user's balance from the users collection
    const user = await db.collection("users").findOne({ _id: userID });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ balance: user.balance ?? 0 });
  } catch (error) {
    console.error("GET User Wallet - Internal server error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { wagerAmount } = await req.json();
  if (!wagerAmount || wagerAmount <= 0) {
    return NextResponse.json(
      { message: "Invalid wager amount" },
      { status: 400 }
    );
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const userID = new mongoose.Types.ObjectId(session.user._id as string);

    // retrieve the user and check their balance
    const user = await db.collection("users").findOne({ _id: userID });
    if (!user || user.balance < wagerAmount) {
      return NextResponse.json(
        { message: "Insufficient funds" },
        { status: 400 }
      );
    }

    // deduct the wager amount from the user's balance and update the user document
    const newBalance = user.balance - wagerAmount;
    await db
      .collection("users")
      .updateOne({ _id: userID }, { $set: { balance: newBalance } });

    return NextResponse.json({
      message: "Wager amount deducted from wallet",
      newBalance,
    });
  } catch (error) {
    console.error("POST Update User Wallet - Internal server error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
