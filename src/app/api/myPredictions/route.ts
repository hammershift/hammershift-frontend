import { authOptions } from "@/lib/auth";

import connectToDB from "@/lib/mongoose";
import { Predictions } from "@/models/predictions.model";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    console.log("Unauthorized: No session found");
    return NextResponse.json(
      { message: "Unauthorized request" },
      { status: 401 }
    );
  }

  const username = session.user.username;

  try {
    await connectToDB();
    console.log("Fetching user predictions...");
    const userPredictions = await Predictions.aggregate([
      {
        $match: {
          "user.username": username,
        },
      },
      {
        $lookup: {
          from: "auctions",
          localField: "carId",
          foreignField: "auction_id",
          as: "carData",
        },
      },
      {
        $unwind: "$carData",
      },
    ]);

    const predictionDetails = userPredictions
      .map((prediction) => {
        if (!prediction.carData.auction_id) return null;
        const auctionDetails = prediction.carData;

        return {
          _id: prediction._id.toString(),
          auctionObjectId: auctionDetails._id,
          auctionIdentifierId: auctionDetails.auction_id,
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
