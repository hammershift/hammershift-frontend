/**
 * Beta-program success metrics aggregator.
 *
 * Five metrics, all pulled live from existing collections. Designed to be
 * called from a single admin-gated endpoint that returns JSON; expensive
 * queries are bounded by the `since` window so they stay snappy.
 *
 * 1. Adoption — Prediction Submit Rate
 *      = (distinct sessions w/ ≥1 prediction_made) / (distinct sessions)
 *      Sessions are read from user_events.event_data.sessionId. Falls back
 *      to per-user counts when sessionId isn't set on any event.
 *
 * 2. Monetization — Free→Paid Conversion Rate (within 30 days)
 *      = (users who made a paid tournament_wager within 30d of signup)
 *      / (users who made ≥1 free-play prediction)
 *
 * 3. Retention — Week-2 Retention Rate
 *      = (users who predicted in days 8-14 after signup)
 *      / (users who signed up ≥14 days ago)
 *
 * 4. Retention — Prediction Accuracy Score Distribution
 *      Bucketed |delta_from_actual| / predictedPrice on settled predictions.
 *      Buckets: <5%, 5-15%, 15-30%, 30-50%, ≥50%.
 *
 * 5. Growth — Viral K-factor
 *      = (referred users who submitted ≥1 prediction)
 *      / (distinct referrers in the same period)
 *      A referrer is any user whose referralCode appears in
 *      WaitlistEntry.referredByCode or Users.referredByCode.
 */

import type { Db } from "mongodb";

export interface MetricsResult {
  windowStart: Date;
  windowEnd: Date;
  adoption: {
    submitRatePct: number | null;
    sessionsTotal: number;
    sessionsWithPrediction: number;
    method: "session" | "user_fallback";
  };
  monetization: {
    freeToPaidPct: number | null;
    freePlayCohort: number;
    paidWithin30d: number;
  };
  retentionWeek2: {
    week2RetentionPct: number | null;
    cohort: number;
    returners: number;
  };
  accuracy: {
    bucketCounts: Record<string, number>;
    totalSettled: number;
  };
  growth: {
    kFactor: number | null;
    referrers: number;
    qualifiedReferrals: number;
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;

function pct(num: number, denom: number): number | null {
  if (denom <= 0) return null;
  return Math.round((num / denom) * 10000) / 100; // two decimals
}

export interface AggregateOpts {
  /** Lower bound for "recent" filtering. Default: 90 days ago (matches the
   *  TTL on the user_events collection). */
  since?: Date;
}

export async function aggregateBetaMetrics(
  db: Db,
  opts: AggregateOpts = {}
): Promise<MetricsResult> {
  const now = new Date();
  const since = opts.since ?? new Date(now.getTime() - 90 * DAY_MS);

  const [
    adoption,
    monetization,
    retentionWeek2,
    accuracy,
    growth,
  ] = await Promise.all([
    computeAdoption(db, since),
    computeMonetization(db, since),
    computeWeek2Retention(db, now),
    computeAccuracy(db, since),
    computeKFactor(db, since),
  ]);

  return {
    windowStart: since,
    windowEnd: now,
    adoption,
    monetization,
    retentionWeek2,
    accuracy,
    growth,
  };
}

// ── 1. Adoption ────────────────────────────────────────────────────────
async function computeAdoption(
  db: Db,
  since: Date
): Promise<MetricsResult["adoption"]> {
  const sessionsAgg = await db
    .collection("user_events")
    .aggregate([
      { $match: { created_at: { $gte: since } } },
      {
        $group: {
          _id: "$event_data.sessionId",
          hasPrediction: {
            $max: { $cond: [{ $eq: ["$event_type", "prediction_made"] }, 1, 0] },
          },
        },
      },
    ])
    .toArray();

  const namedSessions = sessionsAgg.filter((s) => s._id);
  if (namedSessions.length > 0) {
    const total = namedSessions.length;
    const withPred = namedSessions.filter((s) => s.hasPrediction === 1).length;
    return {
      submitRatePct: pct(withPred, total),
      sessionsTotal: total,
      sessionsWithPrediction: withPred,
      method: "session",
    };
  }

  // Fallback: per-user. Before sessionId rollout we just say "fraction of
  // active users who submitted at least one prediction in the window".
  const activeUsers = await db
    .collection("user_events")
    .distinct("user_id", { created_at: { $gte: since } });
  const submitters = await db
    .collection("user_events")
    .distinct("user_id", {
      created_at: { $gte: since },
      event_type: "prediction_made",
    });
  return {
    submitRatePct: pct(submitters.length, activeUsers.length),
    sessionsTotal: activeUsers.length,
    sessionsWithPrediction: submitters.length,
    method: "user_fallback",
  };
}

// ── 2. Free→Paid Conversion ────────────────────────────────────────────
async function computeMonetization(
  db: Db,
  since: Date
): Promise<MetricsResult["monetization"]> {
  // Free-play cohort: users with ≥1 prediction in a free_play tournament.
  // (Predictions outside tournaments are also free; we tag those as
  // free-play too via predictionType.)
  const freeUsersAgg = await db
    .collection("predictions")
    .aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $lookup: {
          from: "tournaments",
          localField: "tournament_id",
          foreignField: "_id",
          as: "tournament",
        },
      },
      {
        $match: {
          $or: [
            { tournament: { $size: 0 } }, // no tournament = free
            { "tournament.type": "free_play" },
          ],
        },
      },
      { $group: { _id: "$user.userId" } },
    ])
    .toArray();

  const freeUserIds = freeUsersAgg.map((u) => u._id).filter(Boolean);
  if (freeUserIds.length === 0) {
    return {
      freeToPaidPct: null,
      freePlayCohort: 0,
      paidWithin30d: 0,
    };
  }

  // Pull signup dates for those users.
  const users = await db
    .collection("users")
    .find({ _id: { $in: freeUserIds } })
    .project({ _id: 1, createdAt: 1 })
    .toArray();

  // For each, was there a paid tournament_wager within 30 days of signup?
  const userMap = new Map(users.map((u) => [String(u._id), u.createdAt]));
  const wagerCursor = db.collection("tournament_wager").aggregate([
    { $match: { "user._id": { $in: freeUserIds }, buyInAmount: { $gt: 0 } } },
    {
      $group: {
        _id: "$user._id",
        firstPaidAt: { $min: { $ifNull: ["$createdAt", "$updatedAt"] } },
      },
    },
  ]);

  let converted = 0;
  for await (const row of wagerCursor) {
    const signup = userMap.get(String(row._id));
    if (!signup) continue;
    const elapsed = new Date(row.firstPaidAt).getTime() - new Date(signup).getTime();
    if (elapsed >= 0 && elapsed <= 30 * DAY_MS) converted++;
  }

  return {
    freeToPaidPct: pct(converted, freeUserIds.length),
    freePlayCohort: freeUserIds.length,
    paidWithin30d: converted,
  };
}

// ── 3. Week-2 Retention ────────────────────────────────────────────────
async function computeWeek2Retention(
  db: Db,
  now: Date
): Promise<MetricsResult["retentionWeek2"]> {
  // Cohort: users who signed up ≥14 days ago (so the window is fully past).
  const cohortCutoff = new Date(now.getTime() - 14 * DAY_MS);
  const cohort = await db
    .collection("users")
    .find({ createdAt: { $lte: cohortCutoff } })
    .project({ _id: 1, createdAt: 1 })
    .toArray();

  if (cohort.length === 0) {
    return { week2RetentionPct: null, cohort: 0, returners: 0 };
  }

  // For each cohort user, did they have a prediction in days 8-14?
  // Batch via $facet would be ideal; given expected cohort size at beta scale
  // we do a single query and bucket client-side.
  const userIds = cohort.map((u) => u._id);
  const preds = await db
    .collection("predictions")
    .find(
      { "user.userId": { $in: userIds } },
      { projection: { "user.userId": 1, createdAt: 1 } }
    )
    .toArray();

  const signupByUser = new Map(cohort.map((u) => [String(u._id), u.createdAt]));
  const returners = new Set<string>();
  for (const p of preds) {
    const uid = String(p.user?.userId);
    const signup = signupByUser.get(uid);
    if (!signup) continue;
    const elapsed = new Date(p.createdAt).getTime() - new Date(signup).getTime();
    if (elapsed >= 8 * DAY_MS && elapsed <= 14 * DAY_MS) {
      returners.add(uid);
    }
  }

  return {
    week2RetentionPct: pct(returners.size, cohort.length),
    cohort: cohort.length,
    returners: returners.size,
  };
}

// ── 4. Accuracy Score Distribution ─────────────────────────────────────
async function computeAccuracy(
  db: Db,
  since: Date
): Promise<MetricsResult["accuracy"]> {
  const rows = await db
    .collection("predictions")
    .find(
      {
        createdAt: { $gte: since },
        scored_at: { $ne: null },
        predictedPrice: { $gt: 0 },
        delta_from_actual: { $exists: true, $ne: null },
      },
      { projection: { predictedPrice: 1, delta_from_actual: 1 } }
    )
    .toArray();

  const buckets: Record<string, number> = {
    "<5%": 0,
    "5-15%": 0,
    "15-30%": 0,
    "30-50%": 0,
    ">=50%": 0,
  };
  for (const r of rows) {
    const pp = r.predictedPrice;
    const delta = Math.abs(r.delta_from_actual);
    if (!pp || pp <= 0) continue;
    const ratio = delta / pp;
    if (ratio < 0.05) buckets["<5%"]++;
    else if (ratio < 0.15) buckets["5-15%"]++;
    else if (ratio < 0.3) buckets["15-30%"]++;
    else if (ratio < 0.5) buckets["30-50%"]++;
    else buckets[">=50%"]++;
  }

  return { bucketCounts: buckets, totalSettled: rows.length };
}

// ── 5. K-factor ────────────────────────────────────────────────────────
async function computeKFactor(
  db: Db,
  since: Date
): Promise<MetricsResult["growth"]> {
  // Referrers: any user whose referralCode appears on another WaitlistEntry's
  // referredByCode OR on another User's referredByCode.
  const referredEntries = await db
    .collection("waitlist_entries")
    .find({ referredByCode: { $ne: null }, createdAt: { $gte: since } })
    .project({ email: 1, referredByCode: 1 })
    .toArray();

  if (referredEntries.length === 0) {
    return { kFactor: null, referrers: 0, qualifiedReferrals: 0 };
  }

  // Distinct referrers in the period.
  const referrerCodes = new Set(
    referredEntries.map((e) => e.referredByCode).filter(Boolean)
  );

  // For each referred entry, did the referee submit ≥1 prediction?
  const refereeEmails = referredEntries.map((e) => e.email);
  const refereeUsers = await db
    .collection("users")
    .find({ email: { $in: refereeEmails } })
    .project({ _id: 1, email: 1 })
    .toArray();
  const emailToUserId = new Map(refereeUsers.map((u) => [u.email, u._id]));

  let qualified = 0;
  for (const entry of referredEntries) {
    const uid = emailToUserId.get(entry.email);
    if (!uid) continue;
    const hasPred = await db
      .collection("predictions")
      .findOne({ "user.userId": uid }, { projection: { _id: 1 } });
    if (hasPred) qualified++;
  }

  const kFactor =
    referrerCodes.size > 0
      ? Math.round((qualified / referrerCodes.size) * 1000) / 1000
      : null;
  return {
    kFactor,
    referrers: referrerCodes.size,
    qualifiedReferrals: qualified,
  };
}
