import { Flame } from "lucide-react";
import type { RecentBadge } from "@/lib/profile/summary";

interface Props {
  current: number;
  longest: number;
  badges: RecentBadge[];
}

function fmtEarned(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime()) || date.getTime() === 0) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function StreakBadgesTile({ current, longest, badges }: Props) {
  const isEmpty = current === 0 && longest === 0 && badges.length === 0;

  return (
    <section
      data-testid="tile-streak-badges"
      aria-label="Streak and badges"
      className="md:col-span-2 rounded-2xl border border-white/[0.06] bg-[#13202D] p-5"
    >
      <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-gray-400">
        Streak & badges
      </h2>

      {isEmpty ? (
        <p className="mt-6 text-sm text-gray-400">
          Predict 3 days in a row to start a streak.
        </p>
      ) : (
        <>
          <div className="mt-4 flex items-baseline gap-3">
            <Flame
              aria-hidden
              className="h-6 w-6 text-[#FFB547]"
              fill="currentColor"
            />
            <span className="font-mono text-4xl font-bold text-white tabular-nums">
              {current}
            </span>
            <span className="text-sm text-gray-400">
              {current === 1 ? "day" : "days"}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {`Longest: `}
            <span className="font-mono text-gray-300 tabular-nums">
              {longest}
            </span>
          </p>

          {badges.length > 0 && (
            <ul className="mt-5 space-y-2 border-t border-white/[0.04] pt-4">
              {badges.map((b) => (
                <li
                  key={b.id}
                  className="flex items-center justify-between gap-2 text-xs"
                >
                  <span className="truncate text-gray-200">{b.name}</span>
                  <span className="shrink-0 font-mono text-gray-500 tabular-nums">
                    {fmtEarned(b.earnedAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
