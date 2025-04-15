import { Document, Schema, model, models, Types } from "mongoose";

export interface Prediction {
  predictedPrice: number;
  predictionType: string;
  user: {
    fullName: string;
    username: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const predictionsSchema = new Schema(
  {
    carId: { type: String, required: true },
    predictedPrice: { type: Number, required: true },
    predictionType: { type: String, required: true },
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
