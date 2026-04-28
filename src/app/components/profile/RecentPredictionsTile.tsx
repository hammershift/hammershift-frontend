import Image from "next/image";
import Link from "next/link";
import type {
  PredictionStatus,
  RecentPrediction,
} from "@/lib/profile/summary";

interface Props {
  recent: RecentPrediction[];
  totalCount: number;
}

const STATUS_LABEL: Record<PredictionStatus, string> = {
  won: "Won",
  lost: "Lost",
  pending: "Live",
};

const STATUS_CHIP: Record<PredictionStatus, string> = {
  won: "text-[#00D4AA] bg-[#00D4AA]/10 border-[#00D4AA]/30",
  lost: "text-[#E94560] bg-[#E94560]/10 border-[#E94560]/30",
  pending: "text-[#FFB547] bg-[#FFB547]/10 border-[#FFB547]/30",
};

export default function RecentPredictionsTile({ recent, totalCount }: Props) {
  return (
    <section
      data-testid="tile-recent-predictions"
      aria-label="Recent predictions"
      className="md:col-span-4 rounded-2xl border border-white/[0.06] bg-[#13202D] p-5"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-gray-400">
          Recent predictions
        </h2>
        {totalCount > 0 && (
          <span className="font-mono text-xs text-gray-500 tabular-nums">
            {totalCount.toLocaleString()}
          </span>
        )}
      </div>

      {recent.length === 0 ? (
        <div className="mt-6 flex flex-col items-start gap-3">
          <p className="text-sm text-gray-400">No predictions yet.</p>
          <Link
            href="/markets"
            className="text-sm text-[#E94560] hover:underline"
          >
            Browse live markets →
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-4 divide-y divide-white/[0.04]">
            {recent.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-[#0A0A1A] ring-1 ring-white/[0.06]">
                  {p.thumbUrl ? (
                    <Image
                      src={p.thumbUrl}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-white">{p.marketTitle}</p>
                  <p className="mt-0.5 truncate text-xs text-gray-400">
                    {`Your call: `}
                    <span className="font-mono text-gray-200 tabular-nums">
                      {p.yourCall}
                    </span>
                  </p>
                </div>
                <span
                  className={`shrink-0 inline-flex items-center font-mono uppercase tracking-[0.15em] text-[10px] px-2 py-0.5 rounded border ${STATUS_CHIP[p.status]}`}
                >
                  {STATUS_LABEL[p.status]}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-white/[0.04] pt-3">
            <Link
              href="/profile/predictions"
              className="text-sm text-[#E94560] hover:underline"
            >
              {`View all ${totalCount.toLocaleString()} →`}
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
