import connectToDB from "@/lib/mongoose";
import Tournament from "@/models/tournament";
import Auctions from "@/models/auction.model";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

type TournamentData = {
  title: string;
  buyInFee: number;
  isActive: boolean;
  startTime: string;
  endTime: string;
};

// to GET tournament data
// URL = /api/tournaments?id=<insert id>    fetch one tournaments
// URL = /api/tournaments                   fetch all tournaments
export async function GET(req: NextRequest) {
  try {
    await connectToDB();
    const id = req.nextUrl.searchParams.get("id");
    const offset = Number(req.nextUrl.searchParams.get("offset")) || 0;
    const limit = Number(req.nextUrl.searchParams.get("limit"));
    const sort = req.nextUrl.searchParams.get("sort");

    // check if there is a request body
    if (id) {
      const tournament = await Tournament.findOne({ _id: id });
      if (tournament) {
        return NextResponse.json(tournament, { status: 200 });
      } else {
        return NextResponse.json(
          { message: "Cannot find tournament" },
          { status: 404 }
        );
      }
    }

    //sorting
    let sortOptions = {};
    if (sort === "newest") {
      sortOptions = { endTime: -1 };
    } else if (sort === "endingSoon") {
      sortOptions = { endTime: 1 };
    }

    // To get all auctions with isActive = true
    const tournaments = await Tournament.find({ isActive: true })
      .sort(sortOptions)
      .limit(limit)
      .skip(offset);
    // count all tournaments with isActive = true
    const tournamentsCount = await Tournament.countDocuments({
      isActive: true,
    });

    //response {total, tournaments}
    if (tournaments) {
      return NextResponse.json(
        { total: tournamentsCount, tournaments },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "Cannot post tournament" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error,
      },
      { status: 500 }
    );
  }
}

// to POST tournament data
// sample request body:
/*{
    "title": "Random Collections Tournament"
    "auctionID": ["65b06c9a5860b968d880c6e9", "65b309b0990459fcb7461e02", "65b309b1990459fcb7461e34", "65b309b1990459fcb7461e66", "65b38cc682288dfdce7db1c9" ],
    "buyInFee": 50,
    "startTime": "2024-02-05T07:34:45.337Z",
    "endTime": "2024-02-10T07:34:45.337Z"
}*/
