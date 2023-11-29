import mongoose from "mongoose";

const carSchema = new mongoose.Schema({
  auction_id: String,
  category: String,
  chassis: String,
  createdAt: Date,
  description: [String],
  era: String,
  images_list: [
    {
      placing: Number,
      src: String,
    },
  ],
  listing_details: [String],
  listing_type: String,
  location: String,
  lot_num: String,
  make: String,
  model: String,
  price: Number,
  seller: String,
  status: Number,
  updatedAt: Date,
  website: String,
  year: String,
});

carSchema.index({
  location: "text",
  make: "text",
  model: "text",
  year: "text",
});

const Cars = mongoose.models.cars || mongoose.model("cars", carSchema);

export default Cars;
