import { MongoClient, MongoClientOptions } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('⚠️ MONGODB_URI environment variable is not defined');
  console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('MONGO') || k.includes('DB')));
}

const options: MongoClientOptions = {
  maxPoolSize: 5,               // Match Mongoose — keep small for Atlas shared tier
  // Atlas shared-tier clusters can pause when idle and replica-set elections
  // can briefly outlast the default. 5s was tight enough to throw on every
  // cold start; 15s leaves comfortable headroom under the 30s Lambda budget
  // while the cron's own per-run TIME_BUDGET (22s) still bounds total work.
  serverSelectionTimeoutMS: 15000,
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
