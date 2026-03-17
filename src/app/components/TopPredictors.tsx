import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";

interface LeaderboardEntry {
  _id: string;
  username: string;
  total_score: number;
  predictions_count: number;
}

interface TopPredictorsProps {
  leaderboard: LeaderboardEntry[];
}

const RANK_STYLES: Record<number, { badge: string; text: string }> = {
  1: { badge: "bg-[#FFB547]/20 text-[#FFB547] border border-[#FFB547]/30", text: "text-[#FFB547]" },
  2: { badge: "bg-gray-400/10 text-gray-300 border border-gray-400/20", text: "text-gray-300" },
  3: { badge: "bg-[#E94560]/10 text-[#E94560] border border-[#E94560]/20", text: "text-[#E94560]" },
};

const DEFAULT_RANK_STYLE = {
  badge: "bg-[#1E2A36] text-gray-500 border border-[#1E2A36]",
  text: "text-gray-400",
};

export default function TopPredictors({ leaderboard }: TopPredictorsProps) {
  const top5 = leaderboard.slice(0, 5);

  if (top5.length === 0) return null;

  return (
    <section
      className="mx-auto w-full max-w-6xl px-4 pb-16"
      aria-label="Top Predictors This Week"
    >
      {/* Section header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="h-5 w-5 text-[#FFB547]" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-gray-300">
            Top Predictors This Week
          </h2>
        </div>
        <Link
          href="/leaderboard"
          className="flex items-center gap-1.5 text-sm text-[#E94560] hover:text-[#E94560]/80 transition-colors font-medium"
          aria-label="View full leaderboard"
        >
          View Full Leaderboard
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>

      {/* Leaderboard card */}
      <div className="rounded-2xl border border-[#1E2A36] bg-[#0F172A] overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[48px_1fr_120px_80px] items-center border-b border-[#1E2A36] px-6 py-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-600">
            #
          </span>
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-600">
            Predictor
          </span>
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-600 text-right">
            Score
          </span>
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-600 text-right">
            Picks
          </span>
        </div>

        {/* Rows */}
        <ul role="list">
          {top5.map((entry, index) => {
            const rank = index + 1;
            const rankStyle = RANK_STYLES[rank] ?? DEFAULT_RANK_STYLE;

            return (
              <li
                key={entry._id}
                className="grid grid-cols-[48px_1fr_120px_80px] items-center border-b border-[#1E2A36]/50 px-6 py-4 last:border-b-0 transition-colors duration-150 hover:bg-[#1E2A36]/40"
              >
                {/* Rank badge */}
                <div className="flex items-center">
                  <span
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold font-mono ${rankStyle.badge}`}
                    aria-label={`Rank ${rank}`}
                  >
                    {rank}
                  </span>
                </div>

                {/* Username */}
                <div className="min-w-0 pr-4">
                  <span className={`text-sm font-semibold truncate block ${rankStyle.text}`}>
                    {entry.username || "Anonymous"}
                  </span>
                </div>

                {/* Score */}
                <div className="text-right">
                  <span className="font-mono text-base font-bold text-[#FFB547] tabular-nums">
                    {entry.total_score.toLocaleString()}
                  </span>
                  <span className="ml-1 text-xs text-gray-600">pts</span>
                </div>

                {/* Predictions count */}
                <div className="text-right">
                  <span className="font-mono text-sm text-gray-400 tabular-nums">
                    {entry.predictions_count}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
