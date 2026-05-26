import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isRoleBypass } from "@/lib/gate";
import clientPromise from "@/lib/mongodb";
import {
  aggregateBetaMetrics,
  type MetricsResult,
} from "@/lib/metrics/betaMetrics";

export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;

function formatPct(v: number | null): string {
  return v === null ? "—" : `${v}%`;
}

function formatK(v: number | null): string {
  return v === null ? "—" : v.toFixed(3);
}

interface PageProps {
  // Next.js 15 makes searchParams an awaitable promise. Typed loosely
  // because the route's generated `PageProps` is only available at
  // `next build` time, not from a stand-alone `tsc --noEmit`.
  searchParams?: Promise<{ days?: string }>;
}

export default async function AdminMetricsPage({ searchParams }: PageProps) {
  const session = (await getServerSession(authOptions)) as
    | { user?: { role?: string } }
    | null;
  if (!isRoleBypass(session?.user?.role)) redirect("/");

  const resolvedSearch = (await searchParams) ?? {};
  const daysRaw = resolvedSearch.days;
  const days = daysRaw
    ? Math.max(1, Math.min(365, parseInt(daysRaw, 10)))
    : 90;
  const since = new Date(Date.now() - days * DAY_MS);

  const client = await clientPromise;
  const db = client.db(process.env.DB_NAME || undefined);
  const metrics: MetricsResult = await aggregateBetaMetrics(db, { since });

  return (
    <main className="min-h-screen bg-[#0A0A1A] text-white px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Beta Program Metrics</h1>
            <p className="text-sm text-gray-400 mt-1">
              Window: last {days} days · {metrics.windowStart.toISOString().slice(0, 10)}{" "}
              to {metrics.windowEnd.toISOString().slice(0, 10)}
            </p>
          </div>
          <div className="text-xs text-gray-400">
            <a className="underline hover:text-white" href="?days=30">
              30d
            </a>{" "}
            ·{" "}
            <a className="underline hover:text-white" href="?days=90">
              90d
            </a>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* 1 — Adoption */}
          <Card
            label="Adoption · Prediction Submit Rate"
            value={formatPct(metrics.adoption.submitRatePct)}
            accent="#E94560"
            sub={`${metrics.adoption.sessionsWithPrediction} / ${metrics.adoption.sessionsTotal} ${metrics.adoption.method === "session" ? "sessions" : "users (fallback)"}`}
            benchmark="Free-to-play: 30-50%. Session-based: 30-70%."
            calc="(sessions w/ ≥1 prediction) / total sessions"
          />

          {/* 2 — Monetization */}
          <Card
            label="Monetization · Free→Paid"
            value={formatPct(metrics.monetization.freeToPaidPct)}
            accent="#00D4AA"
            sub={`${metrics.monetization.paidWithin30d} / ${metrics.monetization.freePlayCohort} free-play users converted in 30d`}
            benchmark="Consumer freemium: 8-15%. Gaming: 5-8%."
            calc="(paid wager within 30d of signup) / free-play cohort"
          />

          {/* 3 — Week-2 retention */}
          <Card
            label="Retention · Week-2"
            value={formatPct(metrics.retentionWeek2.week2RetentionPct)}
            accent="#FFB547"
            sub={`${metrics.retentionWeek2.returners} / ${metrics.retentionWeek2.cohort} users returned days 8-14`}
            benchmark="Mobile app: 15%. Sticky: 20%+. Gaming: ~27%."
            calc="(users with ≥1 prediction days 8-14) / cohort signed up ≥14d ago"
          />

          {/* 4 — Accuracy distribution */}
          <Card
            label="Retention · Accuracy Distribution"
            value={`${metrics.accuracy.totalSettled} settled`}
            accent="#FFB547"
            calc="|predicted - hammer| / predicted · histogram"
            benchmark="Lower is better."
          >
            <AccuracyBars buckets={metrics.accuracy.bucketCounts} />
          </Card>

          {/* 5 — K-factor */}
          <Card
            label="Growth · Viral K-factor"
            value={formatK(metrics.growth.kFactor)}
            accent="#00D4AA"
            sub={`${metrics.growth.qualifiedReferrals} qualified referrals / ${metrics.growth.referrers} referrers`}
            benchmark="K ≥ 1.0 = organic growth. K < 1.0 = paid-acq dependent."
            calc="(referred users who submitted ≥1 prediction) / distinct referrers"
          />
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Live aggregation — no cache. Auto-refreshes on page reload. For raw
          JSON: <code>GET /api/admin/metrics?days={days}</code>
        </p>
      </div>
    </main>
  );
}

function Card(props: {
  label: string;
  value: string;
  accent: string;
  sub?: string;
  benchmark?: string;
  calc?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#13202D] p-5">
      <div className="text-xs uppercase tracking-wider text-gray-400 mb-2">
        {props.label}
      </div>
      <div
        className="font-mono text-3xl font-bold mb-2"
        style={{ color: props.accent }}
      >
        {props.value}
      </div>
      {props.sub && (
        <div className="text-xs text-gray-300 mb-3">{props.sub}</div>
      )}
      {props.children}
      {props.calc && (
        <div className="mt-3 border-t border-white/5 pt-3 text-[11px] text-gray-500">
          <div>
            <span className="text-gray-400">Calc:</span> {props.calc}
          </div>
          {props.benchmark && (
            <div className="mt-1">
              <span className="text-gray-400">Benchmark:</span>{" "}
              {props.benchmark}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AccuracyBars({ buckets }: { buckets: Record<string, number> }) {
  const entries = Object.entries(buckets);
  const total = entries.reduce((s, [, n]) => s + n, 0);
  if (total === 0) {
    return (
      <div className="text-xs text-gray-500">No settled predictions yet.</div>
    );
  }
  return (
    <div className="space-y-1">
      {entries.map(([label, count]) => {
        const pct = Math.round((count / total) * 100);
        return (
          <div key={label} className="flex items-center gap-2 text-xs">
            <span className="w-14 text-gray-400">{label}</span>
            <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full bg-[#FFB547]"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-12 text-right text-gray-300 font-mono">
              {count} ({pct}%)
            </span>
          </div>
        );
      })}
    </div>
  );
}
