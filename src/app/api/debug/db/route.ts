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

    // Exact same queries as the homepage getHomePageData()
    const now = new Date();
    const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const homepageLiveAuctions = await Auctions.find({
      isActive: true,
      "sort.deadline": { $exists: true },
    })
      .sort({ "sort.deadline": 1 })
      .limit(12)
      .select("_id title isActive sort image source_badge")
      .lean();

    const homepageFeaturedAuction = await Auctions.findOne({
      isActive: true,
      "sort.deadline": { $exists: true },
    })
      .sort({ "sort.deadline": 1 })
      .select("_id title isActive sort image")
      .lean();

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
      homepageQueries: {
        liveAuctionsCount: homepageLiveAuctions.length,
        liveAuctions: homepageLiveAuctions.map((a: any) => ({
          _id: a._id,
          title: a.title,
          deadline: a.sort?.deadline,
          deadlinePast: a.sort?.deadline ? new Date(a.sort.deadline) < now : null,
          hasImage: !!a.image,
          imageUrl: a.image?.substring(0, 60),
          source_badge: a.source_badge,
        })),
        featuredAuction: homepageFeaturedAuction
          ? { _id: homepageFeaturedAuction._id, title: (homepageFeaturedAuction as any).title, deadline: (homepageFeaturedAuction as any).sort?.deadline }
          : null,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message, stack: err.stack },
      { status: 500 }
    );
  }
}
