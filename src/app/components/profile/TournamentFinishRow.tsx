import Link from "next/link";

export interface TournamentFinishRowItem {
  id: string;
  tournamentName: string;
  rank: number;
  prize: number;
  accuracyPct: number | null;
  endedAt: string | null; // ISO 8601, or null if missing
}

interface Props {
  item: TournamentFinishRowItem;
}

const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDate(iso: string | null): string | null {
  if (iso === null) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : DATE_FMT.format(d);
}

function fmtUsd(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

export default function TournamentFinishRow({ item }: Props) {
  const dateLabel = formatDate(item.endedAt);
  const placementColor =
    item.rank > 0 && item.rank <= 10 ? "text-[#FFB547]" : "text-[#9CA3AF]";

  return (
    <Link
      href={`/tournaments/${item.id}`}
      aria-label={`View tournament ${item.tournamentName}`}
      className="block rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E94560]/40 focus:ring-offset-2 focus:ring-offset-[#0A0A1A]"
    >
      <div className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-[#13202D] p-4 transition hover:border-white/[0.12]">
        <span
          className={`shrink-0 w-14 font-mono text-2xl font-bold tabular-nums ${placementColor}`}
        >
          {`#${item.rank}`}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">
            {item.tournamentName}
          </p>
          {dateLabel !== null ? (
            <p className="mt-0.5 truncate text-xs text-gray-400">
              <span>Ended </span>
              <span className="font-mono tabular-nums">{dateLabel}</span>
            </p>
          ) : null}
        </div>
        <div className="hidden sm:flex shrink-0 flex-col items-end gap-0.5">
          {item.accuracyPct !== null ? (
            <span className="font-mono text-sm text-gray-300 tabular-nums">
              {`${item.accuracyPct}%`}
            </span>
          ) : (
            <span className="text-xs text-gray-500">—</span>
          )}
          {item.prize > 0 ? (
            <span className="font-mono text-xs text-[#00D4AA] tabular-nums">
              {fmtUsd(item.prize)}
            </span>
          ) : null}
        </div>
        <span
          aria-hidden="true"
          className="shrink-0 text-gray-500 transition group-hover:text-gray-300"
        >
          {"→"}
        </span>
      </div>
    </Link>
  );
}
