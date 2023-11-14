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
        auction_id: String,
        website: String,
        description: String,
        images_list: Array,
        listing_details: String,
    }

);

const Topic = mongoose.model("Car", carSchema);