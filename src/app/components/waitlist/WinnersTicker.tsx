"use client";
import { useEffect, useState } from "react";

type Winner = { payout: number; username: string; marketTitle: string };

function parseWinners(data: unknown): Winner[] {
  if (typeof data !== "object" || data === null) return [];
  const d = data as Record<string, unknown>;
  if (!Array.isArray(d.winners)) return [];
  const out: Winner[] = [];
  for (const raw of d.winners) {
    if (typeof raw !== "object" || raw === null) continue;
    const w = raw as Record<string, unknown>;
    if (typeof w.payout !== "number") continue;
    out.push({
      payout: w.payout,
      username: typeof w.username === "string" && w.username ? w.username : "user",
      marketTitle: typeof w.marketTitle === "string" ? w.marketTitle : "",
    });
  }
  return out;
}

export default function WinnersTicker() {
  const [winners, setWinners] = useState<Winner[]>([]);
  useEffect(() => {
    fetch("/api/waitlist/recent-winners")
      .then((r) => r.json() as Promise<unknown>)
      .then((d) => setWinners(parseWinners(d)))
      .catch(() => {});
  }, []);
  if (!winners.length) return null;
  const doubled = [...winners, ...winners];
  return (
    <div className="overflow-hidden mt-12 py-4 border-y border-[#1E2A36]" data-testid="winners-ticker">
      <div className="flex gap-8 animate-[ticker_60s_linear_infinite] motion-reduce:animate-none whitespace-nowrap">
        {doubled.map((w, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
            <span className="text-[#00D4AA] font-mono">+${Math.round(w.payout)}</span>
            <span className="text-gray-500">{w.username} on</span>
            <span className="text-gray-300 truncate max-w-xs">{w.marketTitle}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
