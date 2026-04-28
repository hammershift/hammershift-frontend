import Image from "next/image";
import Link from "next/link";
import type { PredictionStatus } from "@/lib/profile/summary";

export interface PredictionRowItem {
  id: string;
  marketTitle: string;
  thumbUrl?: string;
  yourCall: string;
  status: PredictionStatus;
  modeLabel: "Tournament" | "Free-play";
  createdAt: string | null; // ISO 8601, or null if missing
  auctionHref?: string;
}

interface Props {
  item: PredictionRowItem;
}

const STATUS_LABEL: Record<PredictionStatus, string> = {
  won: "Won",
  lost: "Lost",
  pending: "Pending",
};

const STATUS_CHIP: Record<PredictionStatus, string> = {
  won: "text-[#00D4AA] bg-[#00D4AA]/10 border-[#00D4AA]/30",
  lost: "text-[#E94560] bg-[#E94560]/10 border-[#E94560]/30",
  pending: "text-[#FFB547] bg-[#FFB547]/10 border-[#FFB547]/30",
};

const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

// Returns a formatted date string, or null when the input is missing/invalid.
// Belt-and-suspenders: callers pass null when they know the source field is
// missing; this function additionally returns null on malformed ISO strings
// that slip through, so the caller can drop the date span entirely.
function formatDate(iso: string | null): string | null {
  if (iso === null) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : DATE_FMT.format(d);
}

export default function PredictionRow({ item }: Props) {
  const dateLabel = formatDate(item.createdAt);

  const inner = (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#13202D] p-4 transition hover:border-white/[0.12]">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-[#0A0A1A] ring-1 ring-white/[0.06]">
        {item.thumbUrl ? (
          <Image
            src={item.thumbUrl}
            alt=""
            fill
            sizes="56px"
            className="object-cover"
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">
          {item.marketTitle}
        </p>
        <p className="mt-0.5 truncate text-xs text-gray-400">
          {`Your call: `}
          <span className="font-mono text-gray-200 tabular-nums">
            {item.yourCall}
          </span>
          <span className="mx-2 text-gray-600">·</span>
          <span>{item.modeLabel}</span>
          {dateLabel !== null ? (
            <>
              <span className="mx-2 text-gray-600">·</span>
              <span className="font-mono tabular-nums">{dateLabel}</span>
            </>
          ) : null}
        </p>
      </div>
      <span
        className={`shrink-0 inline-flex items-center font-mono uppercase tracking-[0.15em] text-[10px] px-2 py-0.5 rounded border ${STATUS_CHIP[item.status]}`}
      >
        {STATUS_LABEL[item.status]}
      </span>
    </div>
  );

  if (item.auctionHref) {
    return (
      <Link
        href={item.auctionHref}
        className="block focus:outline-none focus:ring-2 focus:ring-[#E94560]/40 focus:ring-offset-2 focus:ring-offset-[#0A0A1A] rounded-xl"
      >
        {inner}
      </Link>
    );
  }
  return inner;
}
