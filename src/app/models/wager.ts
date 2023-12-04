import mongoose from 'mongoose';

const wagerSchema = new mongoose.Schema(
  {
    carId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Car',
    },
    priceGuessed: {
      type: Number,
      required: true,
    },
    wagerAmount: {
      type: Number,
      required: true,
    },
    user: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      fullName: String,
      username: String,
    },
  },
  { timestamps: true }
);

export const Wager = mongoose.model('Wager', wagerSchema);
