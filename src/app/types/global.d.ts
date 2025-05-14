import { MongoClient } from 'mongodb';
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;

  interface Window {
    gtag: (...args: any[]) => void;
  }
}
