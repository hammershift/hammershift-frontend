"use client";
import { useEffect, useState } from "react";

type CohortState = { claimed: number };

function parseCohort(data: unknown): CohortState | null {
  if (typeof data !== "object" || data === null) return null;
  const d = data as Record<string, unknown>;
  if (typeof d.claimed !== "number") return null;
  return { claimed: d.claimed };
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
  return (
    <div
      className="mt-4 text-sm text-gray-400"
      data-testid="cohort-counter"
      aria-label="Predictors on the founding list"
    >
      <span className="font-mono text-white">{state.claimed.toLocaleString()}</span>{" "}
      predictors on the founding list
    </div>
  );
}
