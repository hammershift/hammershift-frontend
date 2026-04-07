import { Document, Schema, model, models, Types } from 'mongoose';

export interface AddressOtp {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  address: string;
  code: string;
  attempts: number;
  expiresAt: Date;
  createdAt: Date;
}

const addressOtpSchema = new Schema<AddressOtp & Document>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  address: { type: String, required: true },
  code: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

addressOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
addressOtpSchema.index({ userId: 1, address: 1 });

const AddressOtps =
  models.AddressOtp ||
  model<AddressOtp & Document>('AddressOtp', addressOtpSchema, 'address_otps');

export default AddressOtps;
