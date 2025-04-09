import { Document, Schema, model, models, Types } from "mongoose";

export interface Predictions extends Document {
  auction_id: Types.ObjectId;
  predicted_price: number;
  prediction_type: string;
  user: {
    _id: Types.ObjectId;
    fullName: string;
    username: string;
  };
}

const predictionsSchema = new Schema(
  {
    auction_id: { type: Schema.Types.ObjectId, required: true },
    predicted_price: { type: Number, required: true },
    prediction_type: { type: String, required: true },
    user: {
      _id: { type: Schema.Types.ObjectId, required: true },
      fullName: { type: String, required: true },
      username: { type: String, required: true },
    },
  },
  {
    collection: "predictions",
    timestamps: true,
  }
);

export const Predictions =
  models.predictions || model("predictions", predictionsSchema);
