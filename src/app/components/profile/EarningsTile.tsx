import Link from "next/link";
import EarningsSparkline from "./EarningsSparkline";
import type { EarningsSeriesPoint } from "@/lib/profile/summary";

interface Props {
  lifetimeUsd: number;
  thisMonthUsd: number;
  series: EarningsSeriesPoint[];
}

function fmtUsd(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

function fmtSignedUsd(n: number): string {
  const v = Math.round(n);
  if (v <= 0) return `$${Math.abs(v).toLocaleString("en-US")}`;
  return `+$${v.toLocaleString("en-US")}`;
}

export default function EarningsTile({
  lifetimeUsd,
  thisMonthUsd,
  series,
}: Props) {
  const isEmpty = lifetimeUsd <= 0 && thisMonthUsd <= 0;

  return (
    <section
      data-testid="tile-earnings"
      aria-label="Earnings"
      className="md:col-span-2 rounded-2xl border border-white/[0.06] bg-[#13202D] p-5 flex flex-col"
    >
      <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-gray-400">
        Earnings
      </h2>

      {isEmpty ? (
        <div className="mt-4 flex flex-1 flex-col gap-3">
          <p className="font-mono text-3xl font-bold text-white tabular-nums">
            $0
          </p>
          <p className="text-sm text-gray-400">Predict to earn.</p>
          <div className="mt-auto pt-4 border-t border-white/[0.04]">
            <Link
              href="/my_wallet"
              className="text-sm text-[#E94560] hover:underline"
            >
              Open wallet →
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-4">
            <p className="font-mono text-3xl font-bold text-[#00D4AA] tabular-nums">
              {fmtUsd(lifetimeUsd)}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              <span className="font-mono text-gray-200 tabular-nums">
                {fmtSignedUsd(thisMonthUsd)}
              </span>
              {` this month`}
            </p>
          </div>

          <div className="mt-4">
            <EarningsSparkline series={series} />
          </div>

          <div className="mt-auto pt-4 border-t border-white/[0.04]">
            <Link
              href="/my_wallet"
              className="text-sm text-[#E94560] hover:underline"
            >
              Open wallet →
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
