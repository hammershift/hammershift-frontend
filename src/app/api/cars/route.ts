import clientPromise from "@/lib/mongodb";
import connectToDB from "@/lib/mongoose";
import Auctions from "@/models/auction.model";
import Tournaments from "@/models/tournament.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectToDB();
    const auction_id = req.nextUrl.searchParams.get("auction_id");
    const auction_ids = req.nextUrl.searchParams.get("auction_ids");
    const tournament_id = req.nextUrl.searchParams.get("tournament_id");
    const offset = Number(req.nextUrl.searchParams.get("offset")) || 0;
    const limit = Number(req.nextUrl.searchParams.get("limit"));
    const make = req.nextUrl.searchParams.get("make");
    const status = req.nextUrl.searchParams.get("status");
    const priceRange = Number(req.nextUrl.searchParams.get("priceRange"));

    if (auction_ids) {
      const auction_ids_split = auction_ids.split(",");
      const auctions = await Auctions.find({
        _id: {
          $in: auction_ids_split,
        },
      });

      if (auctions.length === 0) {
        return NextResponse.json(
          { message: "No auctions found" },
          { status: 404 }
        );
      }
      return NextResponse.json(auctions);
    }
    // api/cars?auction_id=213123 to get a single car
    if (auction_id) {
      const car = await Auctions.findOne({
        $and: [{ _id: auction_id }, { isActive: true }],
      });
      return NextResponse.json(car);
    }
    // api/cars?tournament_id=123123 to get cars by tournament id
    if (tournament_id) {
      const tournament = await Tournaments.findOne({
        tournament_id: tournament_id,
      });
      if (!tournament) {
        return NextResponse.json(
          { message: "Tournament not found" },
          { status: 404 }
        );
      }
      const auctions = await Auctions.find({
        _id: { $in: tournament.auction_ids },
      });

      return NextResponse.json(auctions);
    }
    // api/cars to get all cars
    /*
      price range values:
      0: all
      1: < 50k
      2: 50k - 100k
      3: 100k - 200k
      4: 250k
    */
    let priceFilter = {};
    switch (priceRange) {
      case 0:
        priceFilter = { $exists: true };
        break;
      case 1:
        priceFilter = { $lt: 50000 };
        break;
      case 2:
        priceFilter = { $gte: 50000, $lt: 100000 };
        break;
      case 3:
        priceFilter = { $gte: 100000, $lt: 250000 };
        break;
      case 4:
        priceFilter = { $gte: 250000 };
        break;
      default:
        priceFilter = { $exists: true };
    }
    // Build attribute filters using $elemMatch (key-based, not positional index)
    // Positional queries like "attributes.14.value" break if scraper changes attribute order
    const attributeFilters: any[] = [
      { $elemMatch: { key: "status", value: 1 } },
    ];
    if (make && make !== "all") {
      attributeFilters.push({ $elemMatch: { key: "make", value: make } });
    }
    if (priceRange !== 0) {
      attributeFilters.push({ $elemMatch: { key: "price", value: priceFilter } });
    }

    const query: any = {
      isActive: true,
      "sort.deadline":
        status === "active" || status === "ending_soon"
          ? { $gt: new Date() }
          : status === "starting_soon"
          ? { $gt: new Date(Date.now() + 24 * 60 * 60 * 1000) }
          : { $lt: new Date() },
      $and: attributeFilters.map((f) => ({ attributes: f })),
    };
    const options = {
      offset: offset,
      limit: limit,
      sort:
        status === "ending_soon"
          ? { "sort.deadline": 1 }
          : status === "starting_soon"
          ? { "sort.deadline": 1 }
          : { "sort.deadline": -1 },
    };
    const cars = await Auctions.paginate(query, options);
    return NextResponse.json({ total: cars.totalPages, cars: cars.docs });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal server error" });
  }
}

// export async function PUT(req: NextRequest) {
//   try {
//     await connectToDB();
//     const auction_id = req.nextUrl.searchParams.get('auction_id');
//     const edits = await req.json();

//     const editedAuction = await Auctions.findOneAndUpdate({ $and: [{ auction_id: auction_id }, { isActive: true }] }
//       ,
//       { $set: edits },
//       { new: true }
//     )

//     return NextResponse.json(editedAuction, { status: 202 });
//   } catch (error) {
//     console.error(error)
//     return NextResponse.json({ message: "Internal server error" });
//   }
// }

export async function PUT(req: NextRequest) {
  try {
    await connectToDB();
    const auction_id = req.nextUrl.searchParams.get("auction_id");
    const edits = await req.json();

    const editedAuction = Auctions.findOneAndUpdate(
      { $and: [{ _id: auction_id }, { isActive: true }] },
      { $set: edits },
      { returnDocument: "after" }
    );

    return NextResponse.json(editedAuction, { status: 202 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal server error" });
  }
}
