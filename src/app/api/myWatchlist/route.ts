import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import Auctions from "@/models/auction.model";
import Tournaments from "@/models/tournament.model";
import Watchlist from "@/models/watchlist";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/betterAuth";
import { headers } from "next/headers";
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { auctionID, action, tournamentID, tournamentImages } =
    await req.json();
  const convertedAuctionID = new mongoose.Types.ObjectId(auctionID);
  const convertedTournamentID = new mongoose.Types.ObjectId(tournamentID);
  const userID = new mongoose.Types.ObjectId(session.user.id);

  if (
    action !== "add" &&
    action !== "remove" &&
    action !== "add_tournament" &&
    action !== "remove_tournament"
  ) {
    console.log("Invalid action");
    return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  }

  try {
    if (action === "add") {
      // check if the auction is expired or not found (TEST IMPLEMENTATION)
      const auction = await Auctions.findOne({
        _id: convertedAuctionID,
        attributes: { $elemMatch: { key: "status", value: { $ne: 2 } } },
      });

      console.log(action);

      if (!auction) {
        await Watchlist.deleteOne({ auctionID: convertedAuctionID, userID });
        console.log(
          "Auction not found or is expired, removed from Watchlist if it was there"
        );
        return NextResponse.json(
          {
            message:
              "Auction not found or is expired, removed from Watchlist if it was there",
          },
          { status: 404 }
        );
      }

      // check if the auction item is already in the watchlist
      const existingAuctionItem = await Watchlist.findOne({
        auctionID: convertedAuctionID,
        userID,
      });
      if (existingAuctionItem) {
        console.log("Auction already in Watchlist");
        return NextResponse.json(
          { message: "Auction already in Watchlist" },
          { status: 200 }
        );
      }

      await Watchlist.create({ auctionID: convertedAuctionID, userID });
      console.log("Added to Watchlist successfully");
      return NextResponse.json(
        { message: "Added to Watchlist successfully" },
        { status: 201 }
      );
    }

    if (action === "add_tournament") {
      const tournament = await Tournaments.findOne({
        _id: convertedTournamentID,
        isActive: true,
      });

      console.log(action);
      if (!tournament) {
        await Watchlist.deleteOne({
          tournamentID: convertedTournamentID,
          userID,
        });
        console.log(
          "Tournament not found or is expired, removed from Watchlist if it was there"
        );
        return NextResponse.json(
          {
            message:
              "Tournament not found or is expired, removed from Watchlist if it was there",
          },
          { status: 404 }
        );
      }

      const existingTournamentItem = await Watchlist.findOne({
        tournamentID: convertedTournamentID,
        userID,
      });
      if (existingTournamentItem) {
        console.log("Tournament already in Watchlist");
        return NextResponse.json(
          { message: "Tournament already in Watchlist" },
          { status: 200 }
        );
      }

      await Watchlist.create({
        tournamentID: convertedTournamentID,
        userID,
        tournamentImages,
      });
      console.log("Added to Watchlist successfully");
      return NextResponse.json(
        { message: "Added to Watchlist successfully" },
        { status: 201 }
      );
    }

    if (action === "remove_tournament") {
      await Watchlist.deleteOne({
        tournamentID: convertedTournamentID,
        userID,
      });
      console.log("Removed from Watchlist successfully");
      return NextResponse.json(
        { message: "Removed from Watchlist successfully" },
        { status: 200 }
      );
    }

    // if action is 'remove'
    await Watchlist.deleteOne({ auctionID: convertedAuctionID, userID });
    console.log("Removed from Watchlist successfully");
    return NextResponse.json(
      { message: "Removed from Watchlist successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in watchlist operation:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    console.log("Unauthorized: No session found");
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userID = new mongoose.Types.ObjectId(session.user.id);

  try {
    const userWatchlist = await Watchlist.find({
      userID: userID,
      auctionID: { $exists: true },
    })
      .populate({
        path: "auctionID",
        model: Auctions,
        select: "pot images_list attributes auction_id",
      })
      .sort({ createdAt: 1 })
      .exec();

    const watchlistDetails = userWatchlist
      .map((item) => {
        if (!item.auctionID) {
          console.error(
            `Missing auction details for watchlist item with ID: ${item._id}`
          );
          return null;
        }

        const auctionDetails = item.auctionID;

        return {
          _id: item._id.toString(),
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
          createdAt: item.createdAt,
        };
      })
      .filter((detail) => detail !== null);

    const userTournamentWatchlist = await Watchlist.find({
      userID: userID,
      tournamentID: { $exists: true },
    })
      .populate({
        path: "tournamentID",
        model: Tournaments,
        select: "title endTime tournamentEndTime",
      })
      .sort({ createdAt: 1 })
      .exec();

    const tournamentWatchlistDetails = userTournamentWatchlist
      .map((item) => {
        if (!item.tournamentID) {
          console.error(
            `Missing auction details for watchlist item with ID: ${item._id}`
          );
          return null;
        }

        const tournamentDetails = item.tournamentID;

        return {
          _id: item._id.toString(),
          title: tournamentDetails.title,
          tournamentID: tournamentDetails._id,
          endTime: tournamentDetails.endTime,
          tournamentImages: item.tournamentImages,
        };
      })
      .filter((detail) => detail !== null);

    return NextResponse.json(
      {
        watchlist: watchlistDetails,
        tournament_watchlist: tournamentWatchlistDetails,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user watchlist:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
