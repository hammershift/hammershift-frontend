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

// Cache the connect-promise across serverless invocations. The previous
// version cached forever, so when Atlas closed the socket (idle pause /
// replica-set failover), the cached promise still resolved to a dead client
// and the next request blew up with "connection N to <ip>:27017 closed".
//
// Self-healing now:
//   - Listeners on the underlying MongoClient null the cache on close/topology-
//     close so a future request rebuilds instead of reusing a corpse.
//   - The default export is a thenable that re-checks the cache on every
//     `await`. Callers keep the existing `const client = await clientPromise`
//     ergonomics; no callsite changes needed across the 52 importers.
//   - Health is also verified with a cheap admin ping when a cached client
//     looks alive but might be wedged (covers the race where the close event
//     hasn't fired but the socket is already half-open).
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function invalidate(reason: string): void {
  if (global._mongoClientPromise) {
    console.warn(`⚠️ MongoClient cache invalidated (${reason})`);
  }
  global._mongoClientPromise = undefined;
}

async function pingClient(client: MongoClient): Promise<boolean> {
  try {
    await client.db('admin').command({ ping: 1 });
    return true;
  } catch (err) {
    console.warn('⚠️ MongoClient ping failed:', (err as Error).message);
    return false;
  }
}

async function getActiveClient(): Promise<MongoClient> {
  if (!uri) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
  }

  // Hot path: existing cached promise. Verify health before handing it back.
  if (global._mongoClientPromise) {
    try {
      const cached = await global._mongoClientPromise;
      if (await pingClient(cached)) {
        return cached;
      }
      invalidate('ping failed');
    } catch (err) {
      invalidate(`cached promise rejected: ${(err as Error).message}`);
    }
  }

  // Cold path: build a fresh client and attach self-heal listeners.
  const client = new MongoClient(uri, options);
  client.on('close', () => invalidate('close event'));
  client.on('topologyClosed', () => invalidate('topologyClosed event'));
  client.on('error', (err: Error) => {
    console.warn('⚠️ MongoClient error event:', err.message);
    invalidate('error event');
  });

  global._mongoClientPromise = client.connect()
    .then((c) => {
      console.log('✅ MongoClient connected (pool ≤5)');
      return c;
    })
    .catch((err) => {
      invalidate(`initial connect failed: ${(err as Error).message}`);
      throw err;
    });

  return global._mongoClientPromise;
}

// Thenable wrapper. `await clientPromise` triggers .then(), which calls
// getActiveClient() — so every awaited use of the default export runs the
// health check. Existing callers keep working unchanged.
const clientPromise: PromiseLike<MongoClient> = {
  then(onFulfilled, onRejected) {
    return getActiveClient().then(onFulfilled, onRejected);
  },
};

export default clientPromise as Promise<MongoClient>;
