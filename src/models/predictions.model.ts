import { Document, Schema, model, models, Types } from "mongoose";

export interface Prediction {
  predicted_price: number;
  prediction_type: string;
  user: {
    fullName: string;
    username: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const predictionsSchema = new Schema(
  {
    car_id: { type: String, required: true },
    predicted_price: { type: Number, required: true },
    prediction_type: { type: String, required: true },
    user: {
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
