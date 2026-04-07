import { Document, Schema, model, models, Types } from 'mongoose';

export interface VerifiedAddress {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  address: string;
  label: string;
  verifiedAt: Date;
  lastUsedAt: Date | null;
  createdAt: Date;
}

const verifiedAddressSchema = new Schema<VerifiedAddress & Document>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  address: { type: String, required: true },
  label: { type: String, required: true, maxlength: 50 },
  verifiedAt: { type: Date, required: true },
  lastUsedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

verifiedAddressSchema.index({ userId: 1, address: 1 }, { unique: true });

const VerifiedAddresses =
  models.VerifiedAddress ||
  model<VerifiedAddress & Document>('VerifiedAddress', verifiedAddressSchema, 'verified_addresses');

export default VerifiedAddresses;
