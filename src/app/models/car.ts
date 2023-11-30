import mongoose from "mongoose";

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

const carSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    auction_id: { type: String, required: true },
    __v: { type: Number, default: 0 },
    attributes: [attributeSchema],
    description: { type: [String], required: true },
    images_list: [imageSchema],
    listing_details: { type: [String], required: true },
    page_url: { type: String, required: true },
    website: { type: String, required: true },
  },
  { timestamps: true }
);

carSchema.index({
  location: "text",
  make: "text",
  model: "text",
  year: "text",
});

const Cars = mongoose.models.cars || mongoose.model("cars", carSchema);

export default Cars;