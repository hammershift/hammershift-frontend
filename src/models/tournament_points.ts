import mongoose from "mongoose";

const AuctionScoreSchema = new mongoose.Schema({
  auctionID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auction",
    required: true,
  },
  score: { type: Number, required: true },
});

const TournamentPointsSchema = new mongoose.Schema(
  {
    tournamentID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },
    user: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      username: { type: String, required: true },
      image: { type: String },
    },
    auctionScores: [AuctionScoreSchema],
  },
  { timestamps: true }
);

const TournamentPoints =
  mongoose.models.tournament_points ||
  mongoose.model("tournament_points", TournamentPointsSchema);

export default TournamentPoints;
