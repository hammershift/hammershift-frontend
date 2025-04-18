import mongoose from 'mongoose';

const wagerSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
    },
    auctionID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auction',
    },
    auctionIdentifierId: {
      type: String,
      required: true,
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
      image: String,
    },
    refunded: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    prize: {
      type: Number,
      required: false,
    },
  },
  { timestamps: true }
);

const Wager = mongoose.models.Wager || mongoose.model('Wager', wagerSchema);

export default Wager;
