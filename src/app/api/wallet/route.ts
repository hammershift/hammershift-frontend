import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import Transaction from "@/models/transaction";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Temporary debug mode: /api/wallet?debug=1
  const debug = req.nextUrl.searchParams.get("debug") === "1";
  if (debug) {
    const u = session.user as any;
    return NextResponse.json({
      _debug: true,
      session_id: u?._id ?? null,
      session_user_id: u?.id ?? null,
      session_email: u?.email ?? null,
      session_keys: Object.keys(u || {}),
      session_provider: u?.provider ?? null,
      session_username: u?.username ?? null,
    });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || undefined);

    // Try _id first (fastest path)
    const rawId = (session.user as any)._id ?? (session.user as any).id;
    if (rawId) {
      const userID = new mongoose.Types.ObjectId(rawId as string);
      const user = await db.collection("users").findOne({ _id: userID });
      if (user) {
        return NextResponse.json({ balance: user.balance ?? 0 });
      }
      console.warn("wallet: _id lookup failed for", rawId);
    }

    // Fallback to email lookup
    const email = session.user?.email;
    if (email) {
      const emailRegex = new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
      const user = await db.collection("users").findOne({ email: { $regex: emailRegex } });
      if (user) {
        return NextResponse.json({ balance: user.balance ?? 0 });
      }
      console.warn("wallet: email lookup failed for", email);
    }

    // Last resort: log full session for debugging
    console.error("wallet: no user found. session.user keys:", Object.keys(session.user || {}), "email:", email, "_id:", rawId);
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  } catch (error) {
    console.error("GET User Wallet error:", error);
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
    const db = client.db(process.env.DB_NAME || undefined);

    const userID = new mongoose.Types.ObjectId((session.user as any)._id ?? (session.user as any).id);

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
