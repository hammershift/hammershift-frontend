import mongoose, { Document, Schema, model, models, Types } from "mongoose";
import paginate from "mongoose-paginate-v2";

export interface Tournament {
  _id: string;
  tournament_id: number;
  name: string;
  description: string;
  banner: string;
  type: string;
  prizePool: number;
  buyInFee: number;
  isActive: boolean;
  startTime: Date;
  endTime: Date;
  auction_ids: string[];
  users: string[];
  maxUsers: number;
  haveWinners: boolean;
}
export interface TournamentDocument extends Document {
  _id: Types.ObjectId;
  tournament_id: number;
  name: string;
  description: string;
  banner: string;
  type: string;
  prizePool: number;
  buyInFee: number;
  isActive: boolean;
  startTime: Date;
  endTime: Date;
  auction_ids: string[];
  users: string[];
  maxUsers: number;
  createdAt?: Date;
  updatedAt?: Date;
  haveWinners: boolean;
}

const tournamentWinnerSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  transactionID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transaction",
  },
  username: {
    type: String,
  },
  userImage: {
    type: String,
  },
  prize: {
    type: Number,
  },
  rank: {
    type: Number,
  },
  winningDate: {
    type: Date,
    default: Date.now,
  },
});

// const tournamentSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//     },
//     buyInFee: {
//       type: Number,
//       required: true,
//     },
//     winners: [tournamentWinnerSchema],
//     pot: {
//       type: Number,
//       default: 0,
//       required: true,
//     },
//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//     startTime: {
//       type: String,
//       required: true,
//     },
//     endTime: {
//       type: String,
//       required: true,
//     },
//     tournamentEndTime: {
//       type: String,
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

const userSchema = new mongoose.Schema(
  {
    userId: { type: Types.ObjectId, required: true },
    fullName: { type: String, required: true },
    username: { type: String, required: true },
    role: { type: String, enum: ["USER", "AGENT"], required: true },
  },
  {
    _id: false,
  }
);

const tournamentSchema = new mongoose.Schema(
  {
    _id: { type: Schema.Types.ObjectId, required: true },
    tournament_id: { type: Number, required: true },
    name: { type: String, required: true },
    description: { type: String, required: false },
    banner: { type: String, required: true },
    type: { type: String, required: true, enum: ["free_play", "paid"] },
    prizePool: { type: Number, required: true, default: 0 }, //if 0, free_play?
    buyInFee: { type: Number, required: true, default: 0 },
    isActive: { type: Boolean, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    auction_ids: { type: [String], required: true },
    users: { type: [userSchema] },
    maxUsers: { type: Number, required: true },
    haveWinners: { type: Boolean, required: true, default: false },
  },
  {
    collection: "tournaments",
    timestamps: true,
  }
);

tournamentSchema.plugin(paginate);
const Tournaments =
  (models.Tournament as mongoose.PaginateModel<TournamentDocument>) ||
  mongoose.model<TournamentDocument, mongoose.PaginateModel<Document>>(
    "Tournament",
    tournamentSchema,
    "tournaments"
  );

export default Tournaments;
