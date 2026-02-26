import connectToDB from "@/lib/mongoose";
import Auctions from "@/models/auction.model";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/auctions/filter
 *
 * Query params:
 *   publicOnly=true   — only return auctions with isActive:true (required for production listings)
 *   status            — "active" | "ending_soon" | "starting_soon" | "ended"
 *   make              — filter by make attribute
 *   priceRange        — 0=all, 1=<50k, 2=50-100k, 3=100-250k, 4=>250k
 *   offset            — pagination offset (default 0)
 *   limit             — page size (default 0 = all)
 */
export async function GET(req: NextRequest) {
  try {
    await connectToDB();

    const params = req.nextUrl.searchParams;
    const publicOnly = params.get("publicOnly") === "true";
    const status = params.get("status");
    const make = params.get("make");
    const priceRange = Number(params.get("priceRange")) || 0;
    const offset = Number(params.get("offset")) || 0;
    const limit = Number(params.get("limit")) || 0;

    const query: any = {};

    // publicOnly=true → only return admin-enabled auctions
    if (publicOnly) {
      query.isActive = true;
    }

    // Deadline filter by status
    if (status === "ending_soon") {
      query["sort.deadline"] = { $gt: new Date() };
    } else if (status === "starting_soon") {
      query["sort.deadline"] = { $gt: new Date(Date.now() + 24 * 60 * 60 * 1000) };
    } else if (status === "ended") {
      query["sort.deadline"] = { $lt: new Date() };
    } else {
      // "active" or missing: exclude past-deadline auctions; include no-deadline ones
      query.$or = [
        { "sort.deadline": { $gt: new Date() } },
        { "sort.deadline": null },
      ];
    }

    // Price range filter
    if (priceRange !== 0) {
      const priceFilter =
        priceRange === 1 ? { $lt: 50000 } :
        priceRange === 2 ? { $gte: 50000, $lt: 100000 } :
        priceRange === 3 ? { $gte: 100000, $lt: 250000 } :
                           { $gte: 250000 };
      query["sort.price"] = priceFilter;
    }

    // Make filter
    const attributeFilters: any[] = [];
    if (make && make !== "all") {
      attributeFilters.push({ $elemMatch: { key: "make", value: make } });
    }
    if (attributeFilters.length > 0) {
      query.$and = attributeFilters.map((f) => ({ attributes: f }));
    }

    const sortOrder =
      status === "ending_soon" || status === "starting_soon"
        ? { "sort.deadline": 1 }
        : { "sort.deadline": -1 };

    const cars = await Auctions.paginate(query, { offset, limit, sort: sortOrder });

    return NextResponse.json(
      { total: cars.totalPages, cars: cars.docs },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
