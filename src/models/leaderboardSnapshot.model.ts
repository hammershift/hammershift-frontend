import { Document, Schema, model, models, Types } from "mongoose";

export interface LeaderboardSnapshot extends Document {
  period: 'weekly' | 'monthly' | 'alltime';
  user_id: Types.ObjectId;
  rank: number;
  score: number;
  accuracy_pct?: number;
  predictions_count?: number;
  snapshot_at: Date;
}

const leaderboardSnapshotSchema = new Schema(
  {
    period: {
      type: String,
      enum: ['weekly', 'monthly', 'alltime'],
      required: true,
      index: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    rank: {
      type: Number,
      required: true,
      index: true,
    },
    score: {
      type: Number,
      required: true,
    },
    accuracy_pct: {
      type: Number,
    },
    predictions_count: {
      type: Number,
    },
    snapshot_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "leaderboard_snapshots",
    timestamps: false,
  }
);

// Compound index for efficient leaderboard queries
leaderboardSnapshotSchema.index({ period: 1, rank: 1 });
leaderboardSnapshotSchema.index({ period: 1, user_id: 1, snapshot_at: -1 });

const LeaderboardSnapshot =
  models.LeaderboardSnapshot ||
  model<LeaderboardSnapshot>("LeaderboardSnapshot", leaderboardSnapshotSchema);

export default LeaderboardSnapshot;
