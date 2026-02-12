import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('⚠️ MONGODB_URI environment variable is not defined');
  console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('MONGO') || k.includes('DB')));
}

const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!uri) {
  // Create a rejected promise that will fail when actually used
  clientPromise = Promise.reject(
    new Error('Invalid/Missing environment variable: "MONGODB_URI"')
  );
} else if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
    console.log('MongoDB connected in development mode');
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
  console.log('MongoDB connected in production mode');
}

export default clientPromise;
