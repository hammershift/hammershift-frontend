// src/models/shareCard.model.ts
import { Document, Schema, model, models, Types } from "mongoose";

export type ShareCardType = "welcome" | "winner" | "tournament";

export interface ShareCardDoc extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: ShareCardType;
  payload: Record<string, unknown>;
  shortCode: string;
  views: number;
  signups: number;
  createdAt: Date;
  updatedAt: Date;
}

const shareCardSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User", index: true },
    type: { type: String, required: true, enum: ["welcome", "winner", "tournament"] },
    payload: { type: Schema.Types.Mixed, required: true },
    shortCode: { type: String, required: true, unique: true, index: true },
    views: { type: Number, default: 0 },
    signups: { type: Number, default: 0 },
  },
  { collection: "share_cards", timestamps: true }
);

shareCardSchema.index(
  { userId: 1, type: 1 },
  { unique: true, partialFilterExpression: { type: "welcome" } }
);

export const ShareCard =
  models.ShareCard || model<ShareCardDoc>("ShareCard", shareCardSchema);
