import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
// DB_NAME is optional — if not set, Mongoose uses the database name from the URI path.
// The MONGODB_URI already contains the correct database (e.g. .../dev?...).
// Do NOT default to 'hammershift' — that causes a mismatch with the admin panel DB.
const dbName = process.env.DB_NAME || undefined;

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

    const connectOptions = dbName ? { dbName } : {};
    await mongoose.connect(uri, connectOptions);
    console.log(`✅ MongoDB connected to database: ${dbName ?? '(from URI)'}`);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    throw err;
  }
};

export default connectToDB;
