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
    const inactiveCount = await Auctions.countDocuments({ isActive: false });
    const noFieldCount = await Auctions.countDocuments({ isActive: { $exists: false } });

    // Sample 3 active docs
    const samples = await Auctions.find({ isActive: true })
      .limit(3)
      .select("_id title isActive sort.deadline attributes")
      .lean();

    return NextResponse.json({
      connectedDb: dbName,
      mongoUri: process.env.MONGODB_URI
        ? process.env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, "//***:***@")
        : "NOT SET",
      dbNameEnvVar: process.env.DB_NAME ?? "NOT SET (defaulting to hammershift)",
      counts: {
        total: totalCount,
        isActive_true: activeCount,
        isActive_false: inactiveCount,
        isActive_missing: noFieldCount,
      },
      sampleActiveDocs: samples,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message, stack: err.stack },
      { status: 500 }
    );
  }
}
