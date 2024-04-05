import mongoose from 'mongoose';

const attributeSchema = new mongoose.Schema({
  key: { type: String, required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  _id: { type: mongoose.Schema.Types.ObjectId, required: true },
});

const imageSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, required: true },
  placing: { type: Number, required: true },
  src: { type: String, required: true },
});

const winnerSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  objectID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction',
  },
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
  },
  wager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wager',
  },
  auctionID: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  userImage: {
    type: String,
  },
  priceGuessed: {
    type: Number,
    required: true,
  },
  prize: {
    type: Number,
    required: true,
  },
  rank: {
    type: Number,
    required: true,
  },
  winningDate: {
    type: Date,
    default: Date.now,
  },
});

const carSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    tournamentID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tournament',
      required: false,
    },
    auction_id: { type: String, required: true },
    pot: { type: Number },
    __v: { type: Number, default: 0 },
    attributes: [attributeSchema],
    description: { type: [String], required: true },
    images_list: [imageSchema],
    listing_details: { type: [String], required: true },
    page_url: { type: String, required: true },
    website: { type: String, required: true },
    isProcessed: { type: Boolean, default: false }, // test
    winners: [winnerSchema],
    wagers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wager',
      },
    ],
  },
  { timestamps: true }
);

const Auctions = mongoose.models.auctions || mongoose.model('auctions', carSchema);

export default Auctions;
