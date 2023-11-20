import mongoose from 'mongoose';

const carSchema = new mongoose.Schema({
  auction_id: String,
  chassis: String,
  createdAt: Date,
  description: [String],
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
  price: String,
  seller: String,
  status: Number,
  updatedAt: Date,
  website: String,
  year: String,
});

const Cars = mongoose.models.cars || mongoose.model('cars', carSchema);

export default Cars;