import { Document, Schema, model, models, Types } from "mongoose";

export interface Streak extends Document {
  user_id: Types.ObjectId;
  current_streak: number;
  longest_streak: number;
  last_prediction_date?: Date;
  freeze_tokens: number;
}

const streakSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Ensures one streak record per user
    },
    current_streak: {
      type: Number,
      default: 0,
    },
    longest_streak: {
      type: Number,
      default: 0,
    },
    last_prediction_date: {
      type: Date,
    },
    freeze_tokens: {
      type: Number,
      default: 0,
    },
  },
  {
    collection: "streaks",
    timestamps: true,
  }
);

const Streak = models.Streak || model<Streak>("Streak", streakSchema);

export default Streak;
