import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'hammershift'; // Default from env vars

const connectToDB = async () => {
  if (!uri) {
    console.error('⚠️ MONGODB_URI environment variable is not defined');
    console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('MONGO') || k.includes('DB')));
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
  }

  try {
    if (mongoose.connection.readyState >= 1) {
      // Already connected or connecting
      return;
    }

    await mongoose.connect(uri, {
      dbName: dbName,
    });
    console.log(`✅ MongoDB connected to database: ${dbName}`);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    throw err;
  }
};

export default connectToDB;
