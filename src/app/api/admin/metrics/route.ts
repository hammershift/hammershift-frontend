/**
 * GET /api/admin/metrics
 *
 * Returns the five beta-program success metrics. Admin/owner only.
 * Optional ?days=30 narrows the time window (default 90, matches the TTL
 * on the user_events collection).
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isRoleBypass } from "@/lib/gate";
import clientPromise from "@/lib/mongodb";
import { aggregateBetaMetrics } from "@/lib/metrics/betaMetrics";

export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;

export async function GET(req: Request) {
  const session = (await getServerSession(authOptions)) as
    | { user?: { role?: string } }
    | null;
  if (!isRoleBypass(session?.user?.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const daysRaw = url.searchParams.get("days");
  const days = daysRaw ? Math.max(1, Math.min(365, parseInt(daysRaw, 10))) : 90;
  const since = new Date(Date.now() - days * DAY_MS);

  const client = await clientPromise;
  const db = client.db(process.env.DB_NAME || undefined);

  try {
    const metrics = await aggregateBetaMetrics(db, { since });
    return NextResponse.json({ ok: true, days, ...metrics });
  } catch (err) {
    console.error("admin/metrics:", err);
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, error: "Aggregation failed", detail },
      { status: 500 }
    );
  }
}
