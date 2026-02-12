import { Document, Schema, model, models, Types } from "mongoose";

export enum BadgeType {
  FIRST_PREDICTION = 'first_prediction',
  FIRST_WIN = 'first_win',
  HOT_START = 'hot_start',           // 3-day streak
  ON_FIRE = 'on_fire',               // 7-day streak
  UNSTOPPABLE = 'unstoppable',       // 14-day streak
  LEGEND = 'legend',                 // 30-day streak
  TOURNAMENT_ROOKIE = 'tournament_rookie',
  TOURNAMENT_CHAMPION = 'tournament_champion',
  SHARPSHOOTER = 'sharpshooter',     // 5 scores ≥ 900
  CENTURION = 'centurion',           // 100 total predictions
  TOP_10 = 'top_10',                 // Reach top 10 on leaderboard
}

export interface Badge extends Document {
  user_id: Types.ObjectId;
  badge_type: BadgeType;
  earned_at: Date;
  metadata?: Record<string, any>;
}

const badgeSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    badge_type: {
      type: String,
      enum: Object.values(BadgeType),
      required: true,
    },
    earned_at: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    collection: "badges",
    timestamps: false,
  }
);

// Compound index to ensure one badge per type per user
badgeSchema.index({ user_id: 1, badge_type: 1 }, { unique: true });

const Badge = models.Badge || model<Badge>("Badge", badgeSchema);

export default Badge;
