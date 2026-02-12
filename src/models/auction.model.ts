import mongoose, { Document, Schema, model, models, Types } from "mongoose";
import paginate from "mongoose-paginate-v2";
const attributeSchema = new Schema({
  key: { type: String, required: true },
  value: { type: Schema.Types.Mixed, required: true },
  _id: { type: Schema.Types.ObjectId, required: true },
});

const imageSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, required: true },
  placing: { type: Number, required: true },
  src: { type: String, required: true },
});

const sortSchema = new Schema(
  {
    price: { type: Number, default: 0 },
    bids: { type: Number, default: 0 },
    deadline: { type: Date },
  },
  {
    _id: false,
  }
);

const winnerSchema = new Schema({
  userID: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  objectID: {
    type: Schema.Types.ObjectId,
    ref: "Auction",
  },
  transaction: {
    type: Schema.Types.ObjectId,
    ref: "Transaction",
  },
  wager: {
    type: Schema.Types.ObjectId,
    ref: "Wager",
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

interface AuctionAttributes {
  key: string;
  value: any;
}
interface AuctionImageList {
  placing: number;
  src: string;
}

interface AuctionSort {
  price: number;
  bids: number;
  deadline: Date;
}
export interface Auction extends Document {
  auction_id: string;
  title: string;
  website: string;
  image: string;
  page_url: string;
  isActive: boolean;
  attributes: AuctionAttributes[];
  views: number;
  watchers: number;
  comments: number;
  description: string[];
  images_list: AuctionImageList[];
  listing_details: string[];
  sort?: AuctionSort;
  statusAndPriceChecked: boolean;
  pot: number;
  prediction_count?: number;
  avg_predicted_price?: number;
  source_badge?: 'bat' | 'cab';
  status_display?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface Car {
  _id: string;
  auction_id: string;
  title: string;
  website: string;
  image: string;
  page_url: string;
  isActive: boolean;
  attributes: AuctionAttributes[];
  views: number;
  watchers: number;
  comments: number;
  description: string[];
  images_list: AuctionImageList[];
  listing_details: string[];
  sort?: AuctionSort;
  statusAndPriceChecked: boolean;
  pot: number;
  createdAt?: Date;
  updatedAt?: Date;
}
const auctionSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, required: true },
    //TODO: not sure if tournamentId is needed?
    // tournamentID: {
    //   type: Schema.Types.ObjectId,
    //   ref: "Tournament",
    //   required: false,
    // },
    auction_id: { type: String, required: true },
    title: { type: String, required: true },
    website: { type: String, required: true },
    image: { type: String, required: true },
    page_url: { type: String, required: true },
    isActive: { type: Boolean, default: false },
    attributes: [attributeSchema],
    views: { type: Number, default: 0 },
    watchers: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    description: { type: Schema.Types.Mixed },
    images_list: [imageSchema],
    listing_details: { type: [String] },
    sort: sortSchema,
    statusAndPriceChecked: { type: Boolean, default: false },
    pot: { type: Number, default: 0 },
    prediction_count: { type: Number, default: 0 },
    avg_predicted_price: { type: Number },
    source_badge: { type: String, enum: ['bat', 'cab'], default: 'bat' },
    status_display: { type: String },

    // pot: { type: Number },
    // __v: { type: Number, default: 0 },
    // attributes: [attributeSchema],
    // description: { type: [String], required: true },
    // images_list: [imageSchema],
    // listing_details: { type: [String], required: true },
    // page_url: { type: String, required: true },
    // website: { type: String, required: true },
    // isProcessed: { type: Boolean, default: false },
    // winners: [winnerSchema],
    // wagers: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: "Wager",
    //   },
    // ],
  },
  { collection: "auctions", timestamps: true }
);

auctionSchema.plugin(paginate);
const Auctions =
  (models.Auction as mongoose.PaginateModel<Auction>) ||
  model<Auction, mongoose.PaginateModel<Auction>>(
    "Auction",
    auctionSchema,
    "auctions"
  );

export default Auctions;
