import connectToDB from "@/lib/mongoose";
import Tournament from "@/models/tournament.model";
import { Prediction, Predictions } from "@/models/predictions.model";
import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
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
    const type = req.nextUrl.searchParams.get("type");
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
    let query = {};
    if (type === "free") {
      query = {
        isActive: true,
        buyInFee: 0,
        endTime: {
          $gt: new Date(),
        },
      };
    } else if (type === "standard") {
      query = {
        isActive: true,
        buyInFee: {
          $gt: 0,
        },
      };
    } else {
      return NextResponse.json(
        { message: "Invalid tournament type" },
        { status: 400 }
      );
    }

    const options = {
      offset: offset,
      limit: limit,
      sort: sortOptions,
    };
    // To get all tournaments with isActive = true
    const tournaments = await Tournament.paginate(query, options);
    // const tournaments = await Tournament.find({ isActive: true })
    //   .sort(sortOptions)
    //   .limit(limit)
    //   .skip(offset);

    // count all tournaments with isActive = true
    // const tournamentsCount = await Tournament.countDocuments({
    //   isActive: true,
    // 
    //get the image of the first auction in auction_ids

    //response {total, tournaments}
    if (tournaments) {
      return NextResponse.json(
        { total: tournaments.totalPages, tournaments: tournaments.docs },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "Cannot GET tournament" },
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

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 400 });
    }

    await connectToDB();
    const body = await req.json();
    const predictions = body.predictions;
    const tournament_id = body.tournament_id;

    const tournament = await Tournament.findById(tournament_id);
    if (!tournament) {
      return NextResponse.json(
        { message: "Tournament not found" },
        { status: 404 }
      );
    }

    if (
      tournament.users.some(
        (user) => user.userId.toHexString() === session.user.id
      )
    ) {
      return NextResponse.json(
        { message: "You have already joined this tournament." },
        { status: 400 }
      );
    }
    if (
      predictions.every(
        (prediction: Prediction) =>
          prediction.user.username === session.user.username &&
          prediction.user.userId === session.user.id
      )
    ) {
      const newPredictions = await Predictions.insertMany(predictions);

      const updatedTournament = await Tournament.findByIdAndUpdate(
        tournament_id,
        {
          $push: {
            users: {
              userId: session.user.id,
              fullName: session.user.name,
              username: session.user.username,
              role: session.user.role,
            },
          },
        },
        { new: true }
      );

      return NextResponse.json(
        { predictions: newPredictions, tournaments: updatedTournament },
        { status: 201 }
      );
    } else {
      return NextResponse.json({ message: "User mismatch" }, { status: 400 });
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: "Internal server error" },
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
