import { Document, Schema, model, models, Types } from 'mongoose';

export interface TransferLog {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  toAddress: string;
  amount: number;
  txHash: string | null;
  status: 'PENDING' | 'BROADCAST' | 'CONFIRMED' | 'FAILED';
  failReason: string | null;
  ipAddress: string;
  deviceFingerprint: string | null;
  createdAt: Date;
}

const transferLogSchema = new Schema<TransferLog & Document>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  toAddress: { type: String, required: true },
  amount: { type: Number, required: true },
  txHash: { type: String, default: null },
  status: {
    type: String,
    enum: ['PENDING', 'BROADCAST', 'CONFIRMED', 'FAILED'],
    default: 'PENDING',
  },
  failReason: { type: String, default: null },
  ipAddress: { type: String, required: true },
  deviceFingerprint: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

transferLogSchema.index({ userId: 1, createdAt: -1 });

const TransferLogs =
  models.TransferLog ||
  model<TransferLog & Document>('TransferLog', transferLogSchema, 'transfer_logs');

export default TransferLogs;
