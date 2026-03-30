import mongoose, { Schema, Document } from 'mongoose';

export interface IGuessTheHammer extends Document {
  user: mongoose.Types.ObjectId;
  auction: mongoose.Types.ObjectId;
  auctionId: string;
  guessedPrice: number;
  actualPrice: number | null;
  absoluteError: number | null;
  penalizedError: number | null;
  rank: number | null;
  entryFee: number;
  prizePaid: number;
  isVirtual: boolean;
  status: 'pending' | 'graded' | 'paid';
  createdAt: Date;
  updatedAt: Date;
}

const GuessTheHammerSchema = new Schema({
  user:           { type: Schema.Types.ObjectId, ref: 'User', required: true },
  auction:        { type: Schema.Types.ObjectId, ref: 'Auction', required: true },
  auctionId:      { type: String },
  guessedPrice:   { type: Number, required: true, min: 0 },
  actualPrice:    { type: Number, default: null },
  absoluteError:  { type: Number, default: null },
  penalizedError: { type: Number, default: null },
  rank:           { type: Number, default: null },
  entryFee:       { type: Number, required: true, default: 0 },
  prizePaid:      { type: Number, default: 0 },
  isVirtual:      { type: Boolean, default: false },
  status:         { type: String, enum: ['pending', 'graded', 'paid'], default: 'pending' },
}, { timestamps: true });

GuessTheHammerSchema.index({ user: 1, auction: 1 }, { unique: true });
GuessTheHammerSchema.index({ auction: 1, penalizedError: 1 });
GuessTheHammerSchema.index({ user: 1, createdAt: -1 });

export default mongoose.models.GuessTheHammer ||
  mongoose.model<IGuessTheHammer>('GuessTheHammer', GuessTheHammerSchema, 'guesstehammers');
