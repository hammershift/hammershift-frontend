import connectToDB from "@/lib/mongoose";
import { Predictions } from "@/models/predictions.model";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/betterAuth";
import { headers } from "next/headers";
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return NextResponse.json(
      { message: "Unauthorized request" },
      { status: 401 }
    );
  }

  const username = session.user.username;

  try {
    await connectToDB();

    const forTournament = req.nextUrl.searchParams.get("tournament");

    const filter: any = {
      "user.username": username,
    };
    if (forTournament) {
      filter.tournament_id = { $exists: true };
    } else {
      filter.tournament_id = { $exists: false };
    }

    const userPredictions = await Predictions.find(filter).populate({
      path: "auction_id",
      model: "Auction",
    });
    // const userPredictions = await Predictions.aggregate([
    //   query,
    //   {
    //     $lookup: {
    //       from: "auctions",
    //       localField: "auction_id",
    //       foreignField: "auction_id",
    //       as: "carData",
    //     },
    //   },
    //   {
    //     $unwind: "$carData",
    //   },
    // ]);

    const predictionDetails = userPredictions
      .map((prediction) => {
        if (!prediction.auction_id) return null;
        const auctionDetails = prediction.auction_id;

        return {
          _id: prediction._id.toString(),
          auctionObjectId: auctionDetails._id,
          auctionIdentifierId: auctionDetails.auction_id,
          tournament_id: forTournament ? prediction.tournament_id : null,
          auctionPot: auctionDetails.pot,
          auctionImage:
            auctionDetails.images_list.length > 0
              ? auctionDetails.images_list[0].src
              : null,
          auctionYear: auctionDetails.attributes.find(
            (attr: { key: string }) => attr.key === "year"
          )?.value,
          auctionMake: auctionDetails.attributes.find(
            (attr: { key: string }) => attr.key === "make"
          )?.value,
          auctionModel: auctionDetails.attributes.find(
            (attr: { key: string }) => attr.key === "model"
          )?.value,
          auctionPrice: auctionDetails.attributes.find(
            (attr: { key: string }) => attr.key === "price"
          )?.value,
          auctionDeadline: auctionDetails.attributes.find(
            (attr: { key: string }) => attr.key === "deadline"
          )?.value,
          auctionStatus: auctionDetails.attributes.find(
            (attr: { key: string }) => attr.key === "status"
          )?.value,
          predictionType: prediction.predictionType,
          //TODO: rename priceGuessed to predictedPrice
          predictedPrice: prediction.predictedPrice,
          user: prediction.user,
          createdAt: prediction.createdAt,
        };
      })
      .filter((detail) => detail !== null);

    return NextResponse.json(
      { predictions: predictionDetails },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
