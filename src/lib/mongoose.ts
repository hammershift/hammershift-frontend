import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || undefined;

// Cache the connection across serverless invocations using the global object.
// Without this, every Lambda cold start opens a new connection and they pile up.
declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

const cache = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cache;

const connectToDB = async () => {
  if (!uri) {
    console.error("⚠️ MONGODB_URI environment variable is not defined");
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
  }

  // Return existing connection if healthy
  if (cache.conn && mongoose.connection.readyState === 1) {
    return cache.conn;
  }

  // Reuse in-flight connection promise (prevents parallel connect() calls)
  if (!cache.promise) {
    const opts: mongoose.ConnectOptions = {
      ...(dbName ? { dbName } : {}),
      maxPoolSize: 5,       // Keep pool small — M0 free tier has a 500 connection cap
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
    };

    cache.promise = mongoose.connect(uri, opts).then((m) => {
      console.log(`✅ MongoDB connected (pool ≤5): ${dbName ?? "(from URI)"}`);
      return m;
    });
  }

  try {
    cache.conn = await cache.promise;
  } catch (err) {
    // Reset so the next request retries
    cache.promise = null;
    console.error("❌ MongoDB connection error:", err);
    throw err;
  }

  return cache.conn;
};

export default connectToDB;
