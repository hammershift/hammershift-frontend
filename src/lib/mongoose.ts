import mongoose from "mongoose";

const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string, {
      dbName: "hammershift",
    });

    console.log("Mongoose connected");
  } catch (err) {
    console.log(err);
  }
};

export default connectToDB;
