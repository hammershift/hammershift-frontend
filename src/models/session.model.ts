import mongoose, { Document, Schema, model, models, Types } from "mongoose";

export interface Session extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  expiresAt: Date;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, required: true },
    userId: { type: Schema.Types.ObjectId, required: true },
    expiresAt: { type: Date, required: true },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, required: true },
  },
  {
    collection: "sessions",
  }
);

const Sessions = models.Session || model("Session", sessionSchema);

export default Sessions;
