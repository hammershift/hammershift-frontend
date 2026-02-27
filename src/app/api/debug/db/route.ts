import connectToDB from "@/lib/mongoose";
import Auctions from "@/models/auction.model";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Temporary diagnostic endpoint — remove after debugging
// GET /api/debug/db
export async function GET() {
  try {
    await connectToDB();

    const dbName = mongoose.connection.db?.databaseName ?? "unknown";
    const totalCount = await Auctions.countDocuments({});
    const activeCount = await Auctions.countDocuments({ isActive: true });

    const now = new Date();

    // Count active with deadline existing vs missing
    const activeWithDeadline = await Auctions.countDocuments({
      isActive: true,
      "sort.deadline": { $exists: true },
    });
    const activeWithFutureDeadline = await Auctions.countDocuments({
      isActive: true,
      "sort.deadline": { $gt: now },
    });
    const activeNoDeadline = await Auctions.countDocuments({
      isActive: true,
      "sort.deadline": { $exists: false },
    });

    // Exact same query as homepage
    const homepageLiveAuctions = await Auctions.find({ isActive: true })
      .sort({ "sort.deadline": -1 })
      .limit(12)
      .select("_id title isActive sort image source_badge createdAt updatedAt")
      .lean();

    // KEY DIAGNOSTIC: docs created/updated in last 48h regardless of isActive
    // If admin's new auctions don't show here, they landed in a different database.
    const recentlyAdded = await Auctions.find({
      createdAt: { $gte: new Date(now.getTime() - 48 * 60 * 60 * 1000) },
    })
      .select("_id title isActive createdAt updatedAt source_badge")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const recentlyUpdated = await Auctions.find({
      updatedAt: { $gte: new Date(now.getTime() - 48 * 60 * 60 * 1000) },
    })
      .select("_id title isActive createdAt updatedAt source_badge")
      .sort({ updatedAt: -1 })
      .limit(20)
      .lean();

    return NextResponse.json({
      connectedDb: dbName,
      mongoUri: process.env.MONGODB_URI
        ? process.env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, "//***:***@")
        : "NOT SET",
      dbNameEnvVar: process.env.DB_NAME ?? "NOT SET",
      counts: {
        total: totalCount,
        isActive_true: activeCount,
        active_with_deadline: activeWithDeadline,
        active_with_future_deadline: activeWithFutureDeadline,
        active_no_deadline: activeNoDeadline,
      },
      // If admin's newly activated auctions don't appear here,
      // they are in a DIFFERENT database than this frontend reads from.
      recentlyAdded_last48h: recentlyAdded.map((a: any) => ({
        _id: a._id,
        title: a.title,
        isActive: a.isActive,
        createdAt: a.createdAt,
        source_badge: a.source_badge,
      })),
      recentlyUpdated_last48h: recentlyUpdated.map((a: any) => ({
        _id: a._id,
        title: a.title,
        isActive: a.isActive,
        updatedAt: a.updatedAt,
        source_badge: a.source_badge,
      })),
      homepageLiveAuctions: homepageLiveAuctions.map((a: any) => ({
        _id: a._id,
        title: a.title,
        isActive: a.isActive,
        deadline: a.sort?.deadline,
        deadlinePast: a.sort?.deadline ? new Date(a.sort.deadline) < now : null,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
        source_badge: a.source_badge,
      })),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message, stack: err.stack },
      { status: 500 }
    );
  }
}
