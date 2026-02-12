import { Document, Schema, model, models, Types } from "mongoose";

export interface UserEvent extends Document {
  user_id: Types.ObjectId;
  event_type: string;
  event_data?: Record<string, any>;
  created_at: Date;
}

const userEventSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    event_type: {
      type: String,
      required: true,
      index: true,
    },
    event_data: {
      type: Schema.Types.Mixed,
    },
    created_at: {
      type: Date,
      default: Date.now,
      expires: 7776000, // 90 days in seconds (90 * 24 * 60 * 60)
    },
  },
  {
    collection: "user_events",
    timestamps: false, // Using custom created_at field with TTL
  }
);

// Create compound index for querying events by user and type
userEventSchema.index({ user_id: 1, event_type: 1, created_at: -1 });

const UserEvent =
  models.UserEvent || model<UserEvent>("UserEvent", userEventSchema);

export default UserEvent;
