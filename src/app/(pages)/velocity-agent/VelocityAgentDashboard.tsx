'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Overview {
  totalGraded: number;
  totalPending: number;
  accuracyPct: number;
  withinFivePct: number;
  withinTenPct: number;
  withinTwentyPct: number;
  meanAbsoluteErrorPct: number;
  gradeDistribution: { A: number; B: number; C: number; D: number; F: number };
}

interface ByConfidence {
  confidence: string;
  count: number;
  accuracyPct: number;
  meanError: number;
}

interface ByMake {
  make: string;
  count: number;
  accuracyPct: number;
  meanError: number;
}

interface TrendPoint {
  date: string;
  cumulativeAccuracyPct: number;
  totalGraded: number;
  withinTenPct: number;
}

interface AccuracyData {
  overview: Overview;
  byConfidence: ByConfidence[];
  byMake: ByMake[];
  trend: TrendPoint[];
}

interface Prediction {
  _id: string;
  auctionId: string;
  title: string;
  imageUrl?: string;
  year?: number;
  make?: string;
  model?: string;
  predictedPrice: number;
  finalPrice?: number;
  predictionErrorPct?: number;
  absoluteErrorPct?: number;
  confidence?: string;
  grade?: string;
  status: string;
  predictedAt: string;
  finalPriceCapturedAt?: string;
  pricingMethod?: string;
  comparablesUsed?: number;
  priceRange?: { low: number; high: number };
  marketOutcome?: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const GRADE_COLORS: Record<string, string> = {
  A: '#00D4AA',
  B: '#4ADE80',
  C: '#FFB547',
  D: '#F97316',
  F: '#E94560',
};

function gradeColor(grade: string) {
  return GRADE_COLORS[grade] ?? '#6B7280';
}

function fmt$(n: number) {
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function fmtPct(n: number | undefined) {
  if (n == null) return '—';
  return n.toFixed(1) + '%';
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-[#1E2A36] bg-[#13202D] p-5">
      <p className="text-xs uppercase tracking-wider text-gray-400">{label}</p>
      <p className="mt-1 font-mono text-2xl font-bold text-white">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-500">{sub}</p>}
    </div>
  );
}

function GradeBar({ dist }: { dist: Overview['gradeDistribution'] }) {
  const total = dist.A + dist.B + dist.C + dist.D + dist.F;
  if (total === 0) return <p className="text-sm text-gray-500">No graded predictions yet</p>;
  const grades = (['A', 'B', 'C', 'D', 'F'] as const).map((g) => ({
    grade: g,
    count: dist[g],
    pct: (dist[g] / total) * 100,
  }));

  return (
    <div>
      <div className="flex h-6 overflow-hidden rounded-md">
        {grades.map(
          (g) =>
            g.pct > 0 && (
              <div
                key={g.grade}
                className="flex items-center justify-center text-xs font-bold text-black"
                style={{ width: `${g.pct}%`, backgroundColor: gradeColor(g.grade) }}
              >
                {g.pct > 6 ? g.grade : ''}
              </div>
            )
        )}
      </div>
      <div className="mt-2 flex gap-4 text-xs text-gray-400">
        {grades.map((g) => (
          <span key={g.grade}>
            <span style={{ color: gradeColor(g.grade) }}>{g.grade}</span> {g.count}
          </span>
        ))}
      </div>
    </div>
  );
}

function PredictionRow({ p }: { p: Prediction }) {
  const isGraded = p.status === 'GRADED';
  return (
    <Link
      href={`/auction_details?id=${p.auctionId}`}
      className="flex items-center gap-4 rounded-lg border border-[#1E2A36] bg-[#13202D] px-4 py-3 transition hover:border-[#E94560]/40"
    >
      {p.imageUrl && (
        <img
          src={p.imageUrl}
          alt=""
          className="hidden h-12 w-18 rounded object-cover sm:block"
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">{p.title ?? p.auctionId}</p>
        <p className="text-xs text-gray-500">
          {p.make} {p.model} {p.year && `(${p.year})`} &middot; {fmtDate(p.predictedAt)}
        </p>
      </div>
      <div className="text-right">
        <p className="font-mono text-sm text-white">{fmt$(p.predictedPrice)}</p>
        {isGraded && p.finalPrice != null && (
          <p className="font-mono text-xs text-gray-400">sold {fmt$(p.finalPrice)}</p>
        )}
      </div>
      <div className="w-12 text-center">
        {isGraded && p.grade ? (
          <span
            className="inline-block rounded px-2 py-0.5 text-xs font-bold"
            style={{ backgroundColor: gradeColor(p.grade), color: '#000' }}
          >
            {p.grade}
          </span>
        ) : (
          <span className="inline-block rounded bg-gray-700 px-2 py-0.5 text-xs text-gray-300">
            {p.status === 'PENDING' ? 'LIVE' : p.status}
          </span>
        )}
      </div>
      {isGraded && (
        <p className="hidden w-16 text-right font-mono text-xs text-gray-400 md:block">
          {p.absoluteErrorPct != null ? fmtPct(p.absoluteErrorPct) + ' err' : ''}
        </p>
      )}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Dashboard                                                     */
/* ------------------------------------------------------------------ */

export default function VelocityAgentDashboard() {
  const [accuracy, setAccuracy] = useState<AccuracyData | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'PENDING' | 'GRADED'>('all');
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const statusParam = tab === 'all' ? '' : `&status=${tab}`;
      const [accRes, predRes] = await Promise.all([
        fetch('/api/agent/accuracy'),
        fetch(`/api/agent/predictions?page=${page}&limit=20${statusParam}&sort=predictedAt&order=desc`),
      ]);
      const accJson = await accRes.json();
      const predJson = await predRes.json();
      if (!accRes.ok || !predRes.ok) throw new Error('API error');
      setAccuracy(accJson);
      setPredictions(predJson.predictions);
      setPagination(predJson.pagination);
    } catch (err) {
      console.error('Failed to load agent data', err);
    } finally {
      setLoading(false);
    }
  }, [tab, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPage(1);
  }, [tab]);

  if (loading && !accuracy) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E94560] border-t-transparent" />
      </div>
    );
  }

  const ov = accuracy?.overview;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Velocity Agent
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Autonomous AI that predicts auction sale prices — tracked and graded in real time.
        </p>
      </div>

      {/* Stats Grid */}
      {ov && (
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label="Accuracy (within 10%)"
            value={fmtPct(ov.accuracyPct)}
            sub={`${ov.withinTenPct} of ${ov.totalGraded} graded`}
          />
          <StatCard
            label="Mean Error"
            value={fmtPct(ov.meanAbsoluteErrorPct)}
          />
          <StatCard
            label="Predictions Graded"
            value={ov.totalGraded.toLocaleString()}
            sub={`${ov.totalPending} pending`}
          />
          <StatCard
            label="Within 5%"
            value={ov.totalGraded > 0
              ? fmtPct((ov.withinFivePct / ov.totalGraded) * 100)
              : '—'}
            sub={`${ov.withinFivePct} predictions`}
          />
        </div>
      )}

      {/* Grade Distribution */}
      {ov && (
        <div className="mb-8 rounded-xl border border-[#1E2A36] bg-[#13202D] p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
            Grade Distribution
          </h2>
          <GradeBar dist={ov.gradeDistribution} />
        </div>
      )}

      {/* Accuracy by Make & Confidence side by side */}
      {accuracy && (
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          {/* By Make */}
          <div className="rounded-xl border border-[#1E2A36] bg-[#13202D] p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
              Accuracy by Make
            </h2>
            {accuracy.byMake.length === 0 ? (
              <p className="text-sm text-gray-500">Not enough data yet</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500">
                    <th className="pb-2">Make</th>
                    <th className="pb-2 text-right">Count</th>
                    <th className="pb-2 text-right">Accuracy</th>
                    <th className="pb-2 text-right">Avg Error</th>
                  </tr>
                </thead>
                <tbody>
                  {accuracy.byMake.map((m) => (
                    <tr key={m.make} className="border-t border-[#1E2A36]">
                      <td className="py-1.5 text-white">{m.make}</td>
                      <td className="py-1.5 text-right font-mono text-gray-400">{m.count}</td>
                      <td className="py-1.5 text-right font-mono text-white">{fmtPct(m.accuracyPct)}</td>
                      <td className="py-1.5 text-right font-mono text-gray-400">{fmtPct(m.meanError)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* By Confidence */}
          <div className="rounded-xl border border-[#1E2A36] bg-[#13202D] p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
              Accuracy by Confidence
            </h2>
            {accuracy.byConfidence.length === 0 ? (
              <p className="text-sm text-gray-500">Not enough data yet</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500">
                    <th className="pb-2">Level</th>
                    <th className="pb-2 text-right">Count</th>
                    <th className="pb-2 text-right">Accuracy</th>
                    <th className="pb-2 text-right">Avg Error</th>
                  </tr>
                </thead>
                <tbody>
                  {accuracy.byConfidence.map((c) => (
                    <tr key={c.confidence} className="border-t border-[#1E2A36]">
                      <td className="py-1.5 text-white">{c.confidence}</td>
                      <td className="py-1.5 text-right font-mono text-gray-400">{c.count}</td>
                      <td className="py-1.5 text-right font-mono text-white">{fmtPct(c.accuracyPct)}</td>
                      <td className="py-1.5 text-right font-mono text-gray-400">{fmtPct(c.meanError)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Predictions List */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Predictions</h2>
          <div className="flex gap-1 rounded-lg bg-[#13202D] p-1">
            {(['all', 'PENDING', 'GRADED'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                  tab === t
                    ? 'bg-[#E94560] text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {t === 'all' ? 'All' : t === 'PENDING' ? 'Live' : 'Graded'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {predictions.length === 0 && !loading && (
            <p className="py-12 text-center text-sm text-gray-500">No predictions yet</p>
          )}
          {predictions.map((p) => (
            <PredictionRow key={p._id} p={p} />
          ))}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-md border border-[#1E2A36] px-3 py-1 text-sm text-gray-400 transition hover:text-white disabled:opacity-30"
            >
              Prev
            </button>
            <span className="font-mono text-sm text-gray-400">
              {page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="rounded-md border border-[#1E2A36] px-3 py-1 text-sm text-gray-400 transition hover:text-white disabled:opacity-30"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
