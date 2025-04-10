import { Document, Schema, model, models } from "mongoose";

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
export interface Car {
  auction_id: string;
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
    website: { type: String, required: true },
    image: { type: String, required: true },
    page_url: { type: String, required: true },
    isActive: { type: Boolean, default: false },
    attributes: [attributeSchema],
    views: { type: Number, default: 0 },
    watchers: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    description: { type: [String] },
    images_list: [imageSchema],
    listing_details: { type: [String] },
    sort: sortSchema,
    statusAndPriceChecked: { type: Boolean, default: false },
    pot: { type: Number, default: 0 },

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

const Auctions = models.auctions || model<Auction>("auctions", auctionSchema);

export default Auctions;
