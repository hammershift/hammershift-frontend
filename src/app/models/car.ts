import mongoose, { Schema } from "mongoose";

const carSchema = new Schema(
    {
        price: String,
        year: String,
        make: String,
        model: String,
        img: String,
        chassis: String,
        seller: String,
        location: String,
        lot_num: String,
        listing_type: String,
        auction_id: { type: String, unique: true },
        website: String,
        description: [String],
        images_list: [Object],
        listing_details: [String],
    },
    { timestamps: true }
);

const Car = mongoose.model("Car", carSchema);

export default Car