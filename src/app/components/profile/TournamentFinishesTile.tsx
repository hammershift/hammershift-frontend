import Link from "next/link";
import type { TournamentFinish } from "@/lib/profile/summary";

interface Props {
  finishes: TournamentFinish[];
}

export default function TournamentFinishesTile({ finishes }: Props) {
  return (
    <section
      data-testid="tile-tournament-finishes"
      aria-label="Tournament finishes"
      className="md:col-span-4 rounded-2xl border border-white/[0.06] bg-[#13202D] p-5"
    >
      <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-gray-400">
        Tournament finishes
      </h2>

      {finishes.length === 0 ? (
        <div className="mt-6 flex flex-col items-start gap-3">
          <p className="text-sm text-gray-400">No finishes yet.</p>
          <Link
            href="/tournaments"
            className="text-sm text-[#E94560] hover:underline"
          >
            Join a tournament →
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-4 divide-y divide-white/[0.04]">
            {finishes.map((f) => (
              <li
                key={f.id}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <span className="font-mono text-2xl font-bold text-[#FFB547] tabular-nums shrink-0 w-12">
                  {`#${f.placement}`}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-white">
                  {f.tournamentName}
                </span>
                <span className="shrink-0 font-mono text-sm text-gray-300 tabular-nums">
                  {`${f.accuracyPct}%`}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-white/[0.04] pt-3">
            <Link
              href="/profile/tournaments"
              className="text-sm text-[#E94560] hover:underline"
            >
              View all →
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
