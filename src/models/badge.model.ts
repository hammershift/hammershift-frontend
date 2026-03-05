import { Document, Schema, model, models, Types } from "mongoose";
import { BadgeType } from "@/types/badge-types";

export { BadgeType } from "@/types/badge-types";

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
