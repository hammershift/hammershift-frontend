import { Document, Schema, model, models } from "mongoose";

export interface User {
    username: string;
    fullName: string;
    email: string;
    balance: number;
    isActive: boolean;
    isBanned: boolean;
    provider: string;
    createdAt: Date,
    updatedAt: Date,
}

const userSchema = new Schema(
    {
        _id: { type: Schema.Types.ObjectId, required: true },
        username: { type: String, required: true },
        fullName: { type: String, required: true },
        email: { type: String, required: true },
        balance: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
        isBanned: { type: Boolean, default: false },
        provider: { type: String, default: 'credentials' },
        createdAt: Date,
        updatedAt: Date,
    },
    { collection: "users", timestamps: true }
);

const Users = models.users || model<User>("users", userSchema);

export default Users;
