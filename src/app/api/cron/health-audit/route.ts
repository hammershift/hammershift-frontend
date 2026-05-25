/**
 * GET /api/cron/health-audit
 *
 * Hourly system health check. Aggregates a short list of pass/warn/fail
 * signals from the production DB and returns:
 *   - 200 + { ok: true } when nothing critical is wrong
 *   - 503 + { ok: false, failures: [...] } when any FAIL threshold trips
 *
 * The 503 makes the upstream GitHub Actions step exit non-zero, which
 * emails the repo admins (same mechanism as void-stuck-markets). WARN
 * signals stay 200; they're observability, not pages.
 *
 * Auth: x-cron-secret header must equal CRON_SECRET env var.
 */

import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

type Severity = "pass" | "warn" | "fail";

interface Check {
  name: string;
  severity: Severity;
  detail: string;
  value?: number | string;
}

function isAuthorized(req: Request): boolean {
  const secret = req.headers.get("x-cron-secret");
  return !!secret && secret === process.env.CRON_SECRET;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const checks: Check[] = [];
  const now = new Date();

  try {
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || undefined);

    // Mongo ping is implicit in clientPromise (self-healing); reaching here
    // means the connection is alive. Still record it as an explicit signal.
    checks.push({
      name: "mongo_connectivity",
      severity: "pass",
      detail: "MongoClient reachable",
    });

    // ── Scraper freshness ──
    const lastRun = await db
      .collection("scraper_runs")
      .findOne({}, { sort: { startedAt: -1 } });
    if (!lastRun) {
      checks.push({
        name: "scraper_alive",
        severity: "fail",
        detail: "scraper_runs collection is empty",
      });
    } else {
      const ageH =
        (now.getTime() - new Date(lastRun.startedAt).getTime()) / HOUR_MS;
      checks.push({
        name: "scraper_alive",
        severity: ageH > 26 ? "fail" : ageH > 12 ? "warn" : "pass",
        detail: `last scraper run ${ageH.toFixed(1)}h ago`,
        value: Number(ageH.toFixed(1)),
      });
    }

    // ── Auction freshness ──
    const futureDeadlines = await db
      .collection("auctions")
      .countDocuments({ "sort.deadline": { $gt: now } });
    checks.push({
      name: "auction_freshness",
      severity: futureDeadlines < 20 ? "fail" : "pass",
      detail: `${futureDeadlines} auctions with future deadline`,
      value: futureDeadlines,
    });

    // ── Cars showing (recently scraped) ──
    const recentlyCreated = await db
      .collection("auctions")
      .countDocuments({ createdAt: { $gt: new Date(now.getTime() - 2 * DAY_MS) } });
    checks.push({
      name: "cars_showing",
      severity: recentlyCreated === 0 ? "fail" : "pass",
      detail: `${recentlyCreated} auctions created in last 48h`,
      value: recentlyCreated,
    });

    // ── Tournament creation ──
    const recentTournament = await db
      .collection("tournaments")
      .findOne({}, { sort: { createdAt: -1 } });
    if (!recentTournament) {
      checks.push({
        name: "tournament_creation",
        severity: "fail",
        detail: "tournaments collection is empty",
      });
    } else {
      const ageDays =
        (now.getTime() - new Date(recentTournament.createdAt).getTime()) / DAY_MS;
      checks.push({
        name: "tournament_creation",
        severity: ageDays > 8 ? "fail" : ageDays > 4 ? "warn" : "pass",
        detail: `last tournament created ${ageDays.toFixed(1)}d ago`,
        value: Number(ageDays.toFixed(1)),
      });
    }

    // ── Live markets ──
    const activeMarkets = await db
      .collection("polygon_markets")
      .countDocuments({ status: "ACTIVE" });
    checks.push({
      name: "live_markets",
      severity: activeMarkets === 0 ? "fail" : "pass",
      detail: `${activeMarkets} ACTIVE markets`,
      value: activeMarkets,
    });

    // ── Stuck markets (close-trading cron working) ──
    // Any market whose closesAt is more than 1h in the past but still ACTIVE
    // means close-trading hasn't run / failed silently.
    const stuckActive = await db.collection("polygon_markets").countDocuments({
      status: "ACTIVE",
      closesAt: { $lt: new Date(now.getTime() - HOUR_MS) },
    });
    checks.push({
      name: "stuck_active_markets",
      severity: stuckActive > 0 ? "fail" : "pass",
      detail: `${stuckActive} ACTIVE markets past closesAt > 1h`,
      value: stuckActive,
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    checks.push({
      name: "mongo_connectivity",
      severity: "fail",
      detail: `MongoClient unreachable: ${detail}`,
    });
  }

  const failures = checks.filter((c) => c.severity === "fail");
  const warnings = checks.filter((c) => c.severity === "warn");
  const ok = failures.length === 0;

  return NextResponse.json(
    {
      ok,
      timestamp: now.toISOString(),
      summary: `${failures.length} fail, ${warnings.length} warn, ${
        checks.length - failures.length - warnings.length
      } pass`,
      failures: failures.map((f) => f.name),
      warnings: warnings.map((w) => w.name),
      checks,
    },
    { status: ok ? 200 : 503 }
  );
}
