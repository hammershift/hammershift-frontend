"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface PriceDistributionProps {
  predictions: number[];
  userPrediction?: number;
}

function buildBuckets(predictions: number[], bucketSize = 25000) {
  if (!predictions.length) return [];
  const min = Math.floor(Math.min(...predictions) / bucketSize) * bucketSize;
  const max = Math.ceil(Math.max(...predictions) / bucketSize) * bucketSize;
  const buckets: { label: string; count: number; start: number }[] = [];
  for (let s = min; s <= max; s += bucketSize) {
    const count = predictions.filter((p) => p >= s && p < s + bucketSize).length;
    const label =
      s >= 1_000_000
        ? `$${(s / 1_000_000).toFixed(1)}M`
        : `$${Math.round(s / 1000)}k`;
    buckets.push({ label, count, start: s });
  }
  return buckets.filter((b) => b.count > 0 || buckets.length <= 10);
}

function percentile(sorted: number[], pct: number) {
  const idx = Math.floor((pct / 100) * sorted.length);
  return sorted[Math.min(idx, sorted.length - 1)];
}

export function PriceDistribution({
  predictions,
  userPrediction,
}: PriceDistributionProps) {
  if (!predictions || predictions.length === 0) {
    return (
      <p className="text-gray-400 text-sm">No predictions yet — be the first!</p>
    );
  }

  const sorted = [...predictions].sort((a, b) => a - b);
  const p25 = percentile(sorted, 25);
  const p75 = percentile(sorted, 75);
  const buckets = buildBuckets(predictions);

  const userBucket = userPrediction
    ? buckets.find(
        (b) => userPrediction >= b.start && userPrediction < b.start + 25000
      )?.label
    : undefined;

  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
        Prediction Distribution
      </h4>
      <p className="text-xs text-gray-500 mb-2">
        {predictions.length} predictions &middot; Red = consensus zone
      </p>
      <ResponsiveContainer width="100%" height={150}>
        <BarChart data={buckets} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="label"
            tick={{ fill: "#6b7280", fontSize: 9 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              backgroundColor: "#13202D",
              border: "1px solid #1E2A36",
              color: "white",
              fontSize: 12,
              borderRadius: "8px",
            }}
            formatter={(value: number | undefined) => [`${value ?? 0}`, "Predictions"]}
          />
          <Bar dataKey="count" radius={[3, 3, 0, 0]}>
            {buckets.map((b) => (
              <Cell
                key={b.start}
                fill={
                  b.label === userBucket
                    ? "#00D4AA"
                    : b.start >= p25 && b.start < p75
                    ? "#E94560"
                    : "#1E2A36"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
