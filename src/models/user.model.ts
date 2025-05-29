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
    createdAt: Date,
    updatedAt: Date,
  },
  { collection: "users", timestamps: true }
);

const Users = models.users || model<User>("users", userSchema);

export default Users;
