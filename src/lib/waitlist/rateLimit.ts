import clientPromise from "@/lib/mongodb";

export interface RateLimitOpts { perHour: number; perDay: number; }
export interface RateLimitResult { ok: boolean; retryAfterSec: number; count: number; }

export async function checkRateLimit(
  ipHash: string,
  bucket: string,
  opts: RateLimitOpts,
): Promise<RateLimitResult> {
  const client = await clientPromise;
  const db = client.db(process.env.DB_NAME || undefined);
  const col = db.collection("waitlist_rate_events");
  await col.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }).catch(() => {});
  const now = new Date();
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const hourCount = await col.countDocuments({ ipHash, bucket, at: { $gt: hourAgo } });
  if (hourCount >= opts.perHour) return { ok: false, retryAfterSec: 3600, count: hourCount };

  const dayCount = await col.countDocuments({ ipHash, bucket, at: { $gt: dayAgo } });
  if (dayCount >= opts.perDay) return { ok: false, retryAfterSec: 86400, count: dayCount };

  await col.insertOne({
    ipHash,
    bucket,
    at: now,
    expiresAt: new Date(now.getTime() + 25 * 60 * 60 * 1000),
  });
  return { ok: true, retryAfterSec: 0, count: hourCount + 1 };
}
