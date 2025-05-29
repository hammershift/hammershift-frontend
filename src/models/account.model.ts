import { Schema, model, models, Types, Document } from 'mongoose';

export interface Account extends Document {
    _id: Types.ObjectId;
    accountId: string;
    providerId: string;
    userId: Types.ObjectId;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

const accountSchema = new Schema<Account>(
    {
        _id: { type: Schema.Types.ObjectId, required: true },
        accountId: { type: String, required: true },
        providerId: { type: String, required: true },
        userId: { type: Schema.Types.ObjectId, required: true, ref: 'users' },
        password: { type: String, required: true },
    },
    { collection: 'account', timestamps: true }
);

const Accounts = models.accounts || model<Account>('account', accountSchema);

export default Accounts;