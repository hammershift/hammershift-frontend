import { describe, it, expect } from "vitest";
import { aggregateBetaMetrics } from "../betaMetrics";

/**
 * The metrics lib does direct mongo native-driver calls. To unit-test it
 * without spinning up Mongo we build a thin in-memory mock that supports
 * just the operations the lib uses: find/.project/.toArray, aggregate/
 * .toArray, distinct, findOne.
 *
 * Each test composes a fresh DB out of fixture data. Keep the fixtures
 * small — three users, a handful of events, predictions, etc.
 */

type Doc = Record<string, any>;

function makeMockDb(seeds: Record<string, Doc[]>) {
  return {
    collection(name: string) {
      const docs: Doc[] = seeds[name] ?? [];

      const cursorOver = (rows: Doc[]) => ({
        project: () => cursorOver(rows),
        toArray: async () => rows,
        async *[Symbol.asyncIterator]() {
          for (const r of rows) yield r;
        },
      });

      return {
        find(query: any = {}) {
          const matched = docs.filter((d) => matchesQuery(d, query));
          return cursorOver(matched);
        },
        async findOne(query: any) {
          return docs.find((d) => matchesQuery(d, query)) ?? null;
        },
        async distinct(field: string, query: any = {}) {
          const matched = docs.filter((d) => matchesQuery(d, query));
          const set = new Set();
          for (const d of matched) {
            const v = readPath(d, field);
            if (v !== undefined && v !== null) set.add(String(v));
          }
          return Array.from(set);
        },
        aggregate(pipeline: any[]) {
          let stream = docs.slice();
          for (const stage of pipeline) {
            if (stage.$match) stream = stream.filter((d) => matchesQuery(d, stage.$match));
            else if (stage.$group) stream = applyGroup(stream, stage.$group);
            else if (stage.$lookup) stream = applyLookup(stream, stage.$lookup, seeds);
            // Skip other stages (the lib uses only $match/$group/$lookup).
          }
          return cursorOver(stream);
        },
      };
    },
  } as any;
}

function readPath(obj: any, path: string): any {
  const parts = path.replace(/^\$/, "").split(".");
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    if (Array.isArray(cur)) {
      // Mongo dotted-path on an array projects across elements. For our
      // tests we only need the first element's subvalue.
      cur = cur[0]?.[p];
    } else {
      cur = cur[p];
    }
  }
  return cur;
}

function matchesQuery(doc: any, query: any): boolean {
  if (!query) return true;
  for (const [key, cond] of Object.entries(query)) {
    if (key === "$or" && Array.isArray(cond)) {
      if (!(cond as any[]).some((sub) => matchesQuery(doc, sub))) return false;
      continue;
    }
    const docVal = readPath(doc, key);
    if (cond && typeof cond === "object" && !Array.isArray(cond) && !(cond instanceof Date)) {
      const c = cond as Record<string, any>;
      if ("$gte" in c && !(docVal >= c.$gte)) return false;
      if ("$lte" in c && !(docVal <= c.$lte)) return false;
      if ("$gt" in c && !(docVal > c.$gt)) return false;
      if ("$lt" in c && !(docVal < c.$lt)) return false;
      if ("$in" in c && !c.$in.some((v: any) => String(v) === String(docVal))) return false;
      if ("$ne" in c) {
        if (c.$ne === null && (docVal === null || docVal === undefined)) return false;
        if (c.$ne !== null && docVal === c.$ne) return false;
      }
      if ("$exists" in c) {
        const exists = docVal !== undefined && docVal !== null;
        if (exists !== c.$exists) return false;
      }
      if ("$size" in c) {
        if (!Array.isArray(docVal) || docVal.length !== c.$size) return false;
      }
    } else if (docVal !== cond) {
      return false;
    }
  }
  return true;
}

function applyGroup(docs: Doc[], group: any): Doc[] {
  const idExpr = group._id;
  const accumulators: Record<string, (vals: any[]) => any> = {};
  for (const [k, v] of Object.entries(group)) {
    if (k === "_id") continue;
    const op = v as Record<string, any>;
    if ("$max" in op) {
      const inner = op.$max;
      accumulators[k] = (rows) => Math.max(...rows.map((r) => evalExpr(r, inner)));
    } else if ("$min" in op) {
      const inner = op.$min;
      accumulators[k] = (rows) => {
        const vals = rows
          .map((r) => evalExpr(r, inner))
          .filter((x) => x !== undefined && x !== null);
        if (vals.length === 0) return null;
        return vals.reduce((m, x) => (x < m ? x : m), vals[0]);
      };
    } else if ("$sum" in op) {
      const inner = op.$sum;
      accumulators[k] = (rows) =>
        rows.reduce((s, r) => s + Number(evalExpr(r, inner) ?? 0), 0);
    }
  }

  const groups = new Map<string, { key: any; rows: Doc[] }>();
  for (const d of docs) {
    const keyVal = evalExpr(d, idExpr);
    const keyStr = JSON.stringify(keyVal === undefined ? null : keyVal);
    const entry = groups.get(keyStr) ?? { key: keyVal ?? null, rows: [] };
    entry.rows.push(d);
    groups.set(keyStr, entry);
  }

  return Array.from(groups.values()).map(({ key, rows }) => {
    const out: Doc = { _id: key };
    for (const [k, fn] of Object.entries(accumulators)) {
      out[k] = fn(rows);
    }
    return out;
  });
}

function evalExpr(doc: any, expr: any): any {
  if (typeof expr === "string" && expr.startsWith("$")) {
    return readPath(doc, expr.slice(1));
  }
  if (expr && typeof expr === "object") {
    if ("$cond" in expr) {
      const [cond, then, els] = expr.$cond;
      const condEvaled = evalExpr(doc, cond);
      return condEvaled ? evalExpr(doc, then) : evalExpr(doc, els);
    }
    if ("$eq" in expr) {
      const [a, b] = expr.$eq;
      return evalExpr(doc, a) === evalExpr(doc, b);
    }
    if ("$ifNull" in expr) {
      const [a, b] = expr.$ifNull;
      const av = evalExpr(doc, a);
      return av ?? evalExpr(doc, b);
    }
  }
  return expr;
}

function applyLookup(docs: Doc[], lookup: any, seeds: Record<string, Doc[]>): Doc[] {
  const { from, localField, foreignField, as } = lookup;
  const foreign = seeds[from] ?? [];
  return docs.map((d) => {
    const lv = readPath(d, localField);
    const matches = foreign.filter(
      (f) => String(readPath(f, foreignField)) === String(lv)
    );
    return { ...d, [as]: matches };
  });
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const NOW = new Date("2026-06-01T00:00:00Z");
const DAY = 24 * 60 * 60 * 1000;
const ago = (days: number) => new Date(NOW.getTime() - days * DAY);

// ---------------------------------------------------------------------------

describe("aggregateBetaMetrics — empty DB", () => {
  it("returns nulls / zeros without throwing", async () => {
    const db = makeMockDb({});
    const r = await aggregateBetaMetrics(db, { since: ago(30) });
    expect(r.adoption.submitRatePct).toBeNull();
    expect(r.monetization.freeToPaidPct).toBeNull();
    expect(r.retentionWeek2.week2RetentionPct).toBeNull();
    expect(r.accuracy.totalSettled).toBe(0);
    expect(r.growth.kFactor).toBeNull();
  });
});

describe("aggregateBetaMetrics — adoption", () => {
  it("computes session submit rate when sessionIds present", async () => {
    const db = makeMockDb({
      user_events: [
        // session A: viewed + predicted
        { user_id: "u1", event_type: "homepage_viewed", event_data: { sessionId: "A" }, created_at: ago(1) },
        { user_id: "u1", event_type: "prediction_made", event_data: { sessionId: "A" }, created_at: ago(1) },
        // session B: viewed only
        { user_id: "u2", event_type: "homepage_viewed", event_data: { sessionId: "B" }, created_at: ago(1) },
        // session C: predicted
        { user_id: "u3", event_type: "prediction_made", event_data: { sessionId: "C" }, created_at: ago(1) },
        // session D: viewed only
        { user_id: "u4", event_type: "homepage_viewed", event_data: { sessionId: "D" }, created_at: ago(1) },
      ],
    });
    const r = await aggregateBetaMetrics(db, { since: ago(30) });
    expect(r.adoption.sessionsTotal).toBe(4);
    expect(r.adoption.sessionsWithPrediction).toBe(2);
    expect(r.adoption.submitRatePct).toBe(50);
    expect(r.adoption.method).toBe("session");
  });

  it("falls back to per-user when no sessionIds exist", async () => {
    const db = makeMockDb({
      user_events: [
        { user_id: "u1", event_type: "homepage_viewed", event_data: {}, created_at: ago(1) },
        { user_id: "u1", event_type: "prediction_made", event_data: {}, created_at: ago(1) },
        { user_id: "u2", event_type: "homepage_viewed", event_data: {}, created_at: ago(1) },
      ],
    });
    const r = await aggregateBetaMetrics(db, { since: ago(30) });
    expect(r.adoption.method).toBe("user_fallback");
    expect(r.adoption.sessionsTotal).toBe(2); // distinct users
    expect(r.adoption.sessionsWithPrediction).toBe(1);
    expect(r.adoption.submitRatePct).toBe(50);
  });
});

describe("aggregateBetaMetrics — free→paid", () => {
  it("counts converters who paid within 30d of signup", async () => {
    const db = makeMockDb({
      predictions: [
        // u1: free-play tournament prediction
        { user: { userId: "u1" }, tournament_id: "t-free", createdAt: ago(20) },
        // u2: prediction with no tournament (free)
        { user: { userId: "u2" }, createdAt: ago(15) },
        // u3: only paid-tournament prediction → not in cohort
        { user: { userId: "u3" }, tournament_id: "t-paid", createdAt: ago(10) },
      ],
      tournaments: [
        { _id: "t-free", type: "free_play" },
        { _id: "t-paid", type: "paid" },
      ],
      users: [
        { _id: "u1", createdAt: ago(20) }, // signed up 20d ago
        { _id: "u2", createdAt: ago(15) },
      ],
      tournament_wager: [
        // u1 paid within 30d of signup
        { user: { _id: "u1" }, buyInAmount: 10, createdAt: ago(5) },
        // u2 paid outside 30d (signed up 15d ago, paid 90d ago — impossible
        // but tests the window logic)
        { user: { _id: "u2" }, buyInAmount: 20, createdAt: ago(90) },
      ],
    });
    const r = await aggregateBetaMetrics(db, { since: ago(60) });
    expect(r.monetization.freePlayCohort).toBe(2);
    expect(r.monetization.paidWithin30d).toBe(1);
    expect(r.monetization.freeToPaidPct).toBe(50);
  });
});

describe("aggregateBetaMetrics — week-2 retention", () => {
  it("counts users who predicted in days 8-14 after signup", async () => {
    const db = makeMockDb({
      users: [
        { _id: "u1", createdAt: ago(20) }, // ≥14d cohort
        { _id: "u2", createdAt: ago(20) }, // ≥14d cohort
        { _id: "u3", createdAt: ago(5) }, // too recent — not in cohort
      ],
      predictions: [
        // u1 predicted on day 10 after signup → returner
        { user: { userId: "u1" }, createdAt: ago(10) },
        // u2 predicted on day 20 — outside window
        { user: { userId: "u2" }, createdAt: ago(0) },
      ],
    });
    const r = await aggregateBetaMetrics(db);
    expect(r.retentionWeek2.cohort).toBe(2);
    expect(r.retentionWeek2.returners).toBe(1);
    expect(r.retentionWeek2.week2RetentionPct).toBe(50);
  });
});

describe("aggregateBetaMetrics — accuracy distribution", () => {
  it("buckets |delta|/predictedPrice", async () => {
    const db = makeMockDb({
      predictions: [
        // 1% off → <5%
        { predictedPrice: 10000, delta_from_actual: 100, createdAt: ago(1), scored_at: ago(0) },
        // 10% off → 5-15%
        { predictedPrice: 10000, delta_from_actual: 1000, createdAt: ago(1), scored_at: ago(0) },
        // 25% off → 15-30%
        { predictedPrice: 10000, delta_from_actual: 2500, createdAt: ago(1), scored_at: ago(0) },
        // 40% off → 30-50%
        { predictedPrice: 10000, delta_from_actual: 4000, createdAt: ago(1), scored_at: ago(0) },
        // 75% off → ≥50%
        { predictedPrice: 10000, delta_from_actual: 7500, createdAt: ago(1), scored_at: ago(0) },
        // unscored — excluded
        { predictedPrice: 10000, delta_from_actual: 100, createdAt: ago(1), scored_at: null },
      ],
    });
    const r = await aggregateBetaMetrics(db, { since: ago(30) });
    expect(r.accuracy.totalSettled).toBe(5);
    expect(r.accuracy.bucketCounts).toEqual({
      "<5%": 1,
      "5-15%": 1,
      "15-30%": 1,
      "30-50%": 1,
      ">=50%": 1,
    });
  });
});

describe("aggregateBetaMetrics — K-factor", () => {
  it("counts qualified referrals per referrer", async () => {
    const db = makeMockDb({
      waitlist_entries: [
        { email: "a@x.com", referredByCode: "ALICE-V26", createdAt: ago(5) },
        { email: "b@x.com", referredByCode: "ALICE-V26", createdAt: ago(4) },
        { email: "c@x.com", referredByCode: "BOB-V26", createdAt: ago(3) },
      ],
      users: [
        { _id: "ua", email: "a@x.com" },
        { _id: "ub", email: "b@x.com" },
        { _id: "uc", email: "c@x.com" },
      ],
      predictions: [
        { user: { userId: "ua" }, createdAt: ago(1) }, // a qualifies
        { user: { userId: "uc" }, createdAt: ago(1) }, // c qualifies
        // ub never predicted
      ],
    });
    const r = await aggregateBetaMetrics(db, { since: ago(30) });
    expect(r.growth.referrers).toBe(2); // ALICE-V26, BOB-V26
    expect(r.growth.qualifiedReferrals).toBe(2); // a, c
    expect(r.growth.kFactor).toBe(1); // 2/2
  });

  it("returns null kFactor when no referrals exist", async () => {
    const db = makeMockDb({ waitlist_entries: [] });
    const r = await aggregateBetaMetrics(db, { since: ago(30) });
    expect(r.growth.kFactor).toBeNull();
  });
});
