import { MongoClient, MongoClientOptions } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('⚠️ MONGODB_URI environment variable is not defined');
  console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('MONGO') || k.includes('DB')));
}

const options: MongoClientOptions = {
  maxPoolSize: 5,               // Match Mongoose — keep small for Atlas shared tier
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 30000,
};

// Cache across serverless invocations via global (same pattern as mongoose.ts)
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (!uri) {
  clientPromise = Promise.reject(
    new Error('Invalid/Missing environment variable: "MONGODB_URI"')
  );
} else if (!global._mongoClientPromise) {
  const client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
  console.log(`✅ MongoClient connected (pool ≤5)`);
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = global._mongoClientPromise;
}

export default clientPromise;
