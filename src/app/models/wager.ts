import mongoose from 'mongoose';

const wagerSchema = new mongoose.Schema(
  {
    auctionID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auction',
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
