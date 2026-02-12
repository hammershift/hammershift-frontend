import { AgentProperties, Role } from "@/app/types/interfaces";
import { Document, Schema, model, models, Types } from "mongoose";

export interface User {
  _id: Types.ObjectId;
  username: string;
  fullName: string;
  email: string;
  balance: number;
  isActive: boolean;
  isBanned: boolean;
  provider: string;
  about: string;
  createdAt: Date;
  updatedAt: Date;
  role: string;
  agentProperties?: AgentProperties;
  current_streak?: number;
  longest_streak?: number;
  last_prediction_at?: Date;
  rank_title?: 'Rookie' | 'Contender' | 'Expert' | 'Master' | 'Legend';
  total_points?: number;
  email_preferences?: {
    weekly_digest?: boolean;
    auction_reminders?: boolean;
    result_notifications?: boolean;
    marketing?: boolean;
  };
}

const userSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, required: true },
    username: { type: String, required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    emailVerified: { type: Boolean, default: false },
    balance: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isBanned: { type: Boolean, default: false },
    provider: { type: String, default: "email" },
    about: { type: String, default: "" },
    role: { type: String, enum: Role, default: Role.USER },
    agentProperties: {
      type: {
        systemInstruction: { type: String },
      },
      required: false,
    },
    current_streak: { type: Number, default: 0 },
    longest_streak: { type: Number, default: 0 },
    last_prediction_at: { type: Date },
    rank_title: {
      type: String,
      enum: ['Rookie', 'Contender', 'Expert', 'Master', 'Legend'],
      default: 'Rookie'
    },
    total_points: { type: Number, default: 0 },
    email_preferences: {
      weekly_digest: { type: Boolean, default: true },
      auction_reminders: { type: Boolean, default: true },
      result_notifications: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false }
    },
    createdAt: Date,
    updatedAt: Date,
  },
  { collection: "users", timestamps: true }
);

const Users = models.User || model<User>("User", userSchema);

export default Users;
