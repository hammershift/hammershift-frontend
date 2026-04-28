"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";
import type { EarningsSeriesPoint } from "@/lib/profile/summary";

interface Props {
  series: EarningsSeriesPoint[];
}

/**
 * Tiny 7-day sparkline. Recharts has to run on the client because it
 * relies on the DOM ResizeObserver to make ResponsiveContainer work.
 *
 * Falls back to a faint horizontal line when the series is empty or
 * entirely zero — recharts otherwise renders an empty SVG that takes
 * up the same height but signals nothing.
 */
export default function EarningsSparkline({ series }: Props) {
  const hasNonZero = series.some((p) => p.v > 0);

  if (!hasNonZero) {
    return (
      <div
        aria-hidden
        className="h-12 w-full border-b border-white/[0.06]"
      />
    );
  }

  return (
    <div aria-hidden className="h-12 w-full">
      <ResponsiveContainer width="100%" height={48}>
        <AreaChart
          data={series}
          margin={{ top: 4, bottom: 0, left: 0, right: 0 }}
        >
          <Area
            type="monotone"
            dataKey="v"
            stroke="#00D4AA"
            fill="#00D4AA"
            fillOpacity={0.18}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
