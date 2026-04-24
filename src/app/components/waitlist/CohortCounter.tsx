"use client";
import { useEffect, useState } from "react";

type CohortState = { claimed: number; cap: number };

function parseCohort(data: unknown): CohortState | null {
  if (typeof data !== "object" || data === null) return null;
  const d = data as Record<string, unknown>;
  if (typeof d.claimed !== "number" || typeof d.cap !== "number") return null;
  return { claimed: d.claimed, cap: d.cap };
}

export default function CohortCounter() {
  const [state, setState] = useState<CohortState | null>(null);
  useEffect(() => {
    fetch("/api/waitlist/cohort")
      .then((r) => r.json() as Promise<unknown>)
      .then((data) => setState(parseCohort(data)))
      .catch(() => {});
  }, []);
  if (!state) return null;
  const pct = Math.min(100, (state.claimed / state.cap) * 100);
  return (
    <div className="mt-3 text-sm" data-testid="cohort-counter">
      <div className="flex justify-between text-gray-200 mb-1.5">
        <span className="font-mono">{state.claimed}</span>
        <span className="font-mono text-gray-400">/ {state.cap} founding spots</span>
      </div>
      <div
        role="progressbar"
        aria-label="Founding cohort spots claimed"
        aria-valuenow={state.claimed}
        aria-valuemin={0}
        aria-valuemax={state.cap}
        className="h-1 bg-white/10 rounded overflow-hidden"
      >
        <div className="h-full bg-[#E94560] transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
