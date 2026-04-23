import { Document, Schema, model, models, Types } from "mongoose";

export interface WaitlistEntryDoc extends Document {
  _id: Types.ObjectId;
  email: string;
  referralCode: string;
  referredByCode: string | null;
  verifiedAt: Date | null;
  invitedAt: Date | null;
  invitedBatchId: string | null;
  inviteEmailSentAt: Date | null;
  userId: Types.ObjectId | null;
  utm: { source?: string; medium?: string; campaign?: string };
  ipHash: string;
  flaggedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const waitlistEntrySchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, unique: true, index: true },
    referralCode: { type: String, required: true, unique: true, index: true },
    referredByCode: { type: String, default: null, index: true },
    verifiedAt: { type: Date, default: null },
    invitedAt: { type: Date, default: null },
    invitedBatchId: { type: String, default: null },
    inviteEmailSentAt: { type: Date, default: null },
    userId: { type: Schema.Types.ObjectId, default: null, ref: "User" },
    utm: {
      source: { type: String },
      medium: { type: String },
      campaign: { type: String },
    },
    ipHash: { type: String, required: true },
    flaggedAt: { type: Date, default: null },
  },
  { collection: "waitlist_entries", timestamps: true }
);

waitlistEntrySchema.index({ verifiedAt: 1, invitedAt: 1 });
waitlistEntrySchema.index({ invitedAt: 1, inviteEmailSentAt: 1 });

export const WaitlistEntry =
  models.WaitlistEntry ||
  model<WaitlistEntryDoc>("WaitlistEntry", waitlistEntrySchema);
