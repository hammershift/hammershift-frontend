"use client";
import { useEffect, useState } from "react";

export default function CohortCounter() {
  const [state, setState] = useState<{ claimed: number; cap: number } | null>(null);
  useEffect(() => {
    fetch("/api/waitlist/cohort").then((r) => r.json()).then(setState).catch(() => {});
  }, []);
  if (!state) return null;
  const pct = Math.min(100, (state.claimed / state.cap) * 100);
  return (
    <div className="mt-3 text-sm" data-testid="cohort-counter">
      <div className="flex justify-between text-gray-400 mb-1">
        <span className="font-mono">{state.claimed}</span>
        <span className="font-mono">/ {state.cap} spots claimed</span>
      </div>
      <div className="h-1 bg-[#1E2A36] rounded overflow-hidden">
        <div className="h-full bg-[#E94560] transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
