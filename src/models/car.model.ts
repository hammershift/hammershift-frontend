import mongoose from "mongoose";

const carSchema = new mongoose.Schema({
  "type": "object",
  "properties": {
    "auction_id": { "type": "string" },
    "attributes": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "key": { "type": "string" },
          "value": {
            "anyOf": [
              { "type": "string" },
              { "type": "integer" },
              { "type": "boolean" },
              { "type": "number" },
              { "type": "null" }
            ]
          }
        },
        "required": ["key", "value"]
      }
    },
    "createdAt": { "type": "string", "format": "date-time" },
    "description": {
      "type": "array",
      "items": { "type": "string" }
    },
    "images_list": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "placing": { "type": "integer" },
          "src": { "type": "string" }
        },
        "required": ["placing", "src"]
      }
    },
    "listing_details": {
      "type": "array",
      "items": { "type": "string" }
    },
    "page_url": { "type": "string" },
    "updatedAt": { "type": "string", "format": "date-time" },
    "website": { "type": "string" }
  },
  "required": [
    "auction_id",
    "attributes",
    "createdAt",
    "description",
    "images_list",
    "listing_details",
    "page_url",
    "updatedAt",
    "website"
  ]
});

const Cars = mongoose.models.cars || mongoose.model("cars", carSchema);

export default Cars;




// const carSchema = new mongoose.Schema({
//   auction_id: String,
//   category: String,
//   chassis: String,
//   createdAt: Date,
//   description: [String],
//   era: String,
//   images_list: [
//     {
//       placing: Number,
//       src: String,
//     },
//   ],
//   listing_details: [String],
//   listing_type: String,
//   location: String,
//   lot_num: String,
//   make: String,
//   model: String,
//   price: Number,
//   seller: String,
//   status: Number,
//   updatedAt: Date,
//   website: String,
//   year: String,
// });

// carSchema.index({
//   location: "text",
//   make: "text",
//   model: "text",
//   year: "text",
// });

// const Cars = mongoose.models.cars || mongoose.model("cars", carSchema);

// export default Cars;
