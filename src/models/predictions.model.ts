import { Document, Schema, model, models, Types } from "mongoose";

export interface Prediction {
  predictedPrice: number;
  predictionType: string;
  user: {
    fullName: string;
    username: string;
    isAgent?: boolean;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const predictionsSchema = new Schema(
  {
    carId: { type: String, required: true },
    carObjectId: { type: Types.ObjectId, required: true },
    predictedPrice: { type: Number, required: true },
    predictionType: { type: String, required: true },
    wagerAmount: { type: Number, required: false, default: 0 },
    user: {
      userId: { type: Types.ObjectId, required: true },
      fullName: { type: String, required: true },
      username: { type: String, required: true },
      isAgent: { type: Boolean, required: false },
    },
    refunded: { type: Boolean, required: false, default: false },
    isActive: { type: Boolean, required: true, default: true },
    prize: { type: Number, required: false, default: 0 },
  },
  {
    collection: "predictions",
    timestamps: true,
  }
);

export const Predictions =
  models.predictions || model("predictions", predictionsSchema);
