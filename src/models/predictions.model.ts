import { Role } from "@/app/types/interfaces";
import { Document, Schema, model, models, Types } from "mongoose";
import { StdioNull } from "node:child_process";

export interface Prediction {
  auction_id: string;
  tournament_id?: string;
  predictedPrice: number;
  predictionType: string;
  wagerAmount?: number;
  user: {
    userId: string;
    fullName: string;
    username: string;
    role: string;
  };
  refunded?: boolean;
  isActive: boolean;
  score?: number;
  rank?: number;
  delta_from_actual?: number;
  scored_at?: Date;
  bonus_modifiers?: {
    early_bird?: boolean;
    streak_bonus?: boolean;
    bullseye?: boolean;
    tournament_multiplier?: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const predictionsSchema = new Schema(
  {
    // carId: { type: String, required: true },
    // carObjectId: { type: Types.ObjectId, required: true },
    auction_id: { type: Schema.Types.ObjectId, required: true, ref: "Auction" },
    tournament_id: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: "Tournament",
    },
    predictedPrice: { type: Number, required: true },
    predictionType: { type: String, required: true },
    wagerAmount: { type: Number, required: false, default: 0 },
    user: {
      userId: { type: Types.ObjectId, required: true },
      fullName: { type: String, required: true },
      username: { type: String, required: true },
      role: { type: String, enum: Role, required: true },
    },
    refunded: { type: Boolean, required: false, default: false },
    isActive: { type: Boolean, required: true, default: true },
    prize: { type: Number, required: false, default: 0 },
    score: { type: Number },
    rank: { type: Number },
    delta_from_actual: { type: Number },
    scored_at: { type: Date },
    bonus_modifiers: {
      early_bird: { type: Boolean, default: false },
      streak_bonus: { type: Boolean, default: false },
      bullseye: { type: Boolean, default: false },
      tournament_multiplier: { type: Number, default: 1 },
    },
  },
  {
    collection: "predictions",
    timestamps: true,
  }
);

export const Predictions =
  models.predictions || model("predictions", predictionsSchema);
