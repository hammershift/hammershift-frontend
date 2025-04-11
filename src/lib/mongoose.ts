import mongoose from "mongoose";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI');
}

const uri = process.env.MONGODB_URI;

const connectToDB = async () => {
  try {
    await mongoose.connect(uri, {
      dbName: "hammershift",
    });
  } catch (err) {
    console.log(err);
  }
};

export default connectToDB;
