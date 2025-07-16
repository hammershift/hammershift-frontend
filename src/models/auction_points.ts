import mongoose from "mongoose";

const AuctionPointsSchema = new mongoose.Schema(
  {
    auctionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auction",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fullName: String,
    username: String,
    image: String,
    points: {
      type: Number,
      required: true,
    },
    rank: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true, collection: "auction_points" }
);

const AuctionPoints =
  mongoose.models.Point || mongoose.model("Point", AuctionPointsSchema);

export default AuctionPoints;
