import { Document, Schema, model, models, Types } from "mongoose";

export interface EmailLog extends Document {
  user_id: Types.ObjectId;
  campaign_id: string;
  sent_at: Date;
  opened_at?: Date;
  clicked_at?: Date;
}

const emailLogSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    campaign_id: {
      type: String,
      required: true,
      index: true,
    },
    sent_at: {
      type: Date,
      default: Date.now,
    },
    opened_at: {
      type: Date,
    },
    clicked_at: {
      type: Date,
    },
  },
  {
    collection: "email_logs",
    timestamps: false,
  }
);

// Compound index for querying email engagement by user and campaign
emailLogSchema.index({ user_id: 1, campaign_id: 1, sent_at: -1 });

const EmailLog = models.EmailLog || model<EmailLog>("EmailLog", emailLogSchema);

export default EmailLog;
