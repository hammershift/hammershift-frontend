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
    required: true,
  },
  fullName: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  wagerAmount: { type: Number, required: true },
  wager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wager',
  },
});

const carSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    auction_id: { type: String, required: true },
    pot: { type: Number },
    __v: { type: Number, default: 0 },
    attributes: [attributeSchema],
    description: { type: [String], required: true },
    images_list: [imageSchema],
    listing_details: { type: [String], required: true },
    page_url: { type: String, required: true },
    website: { type: String, required: true },
    winner: [winnerSchema],
  },
  { timestamps: true }
);

const Auctions = mongoose.models.auctions || mongoose.model('auctions', carSchema);

export default Auctions;
