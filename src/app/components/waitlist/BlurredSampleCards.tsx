"use client";
import { useEffect, useState } from "react";

type MarketCard = {
  _id: string;
  title: string;
  imageUrl?: string | null;
  yesPrice?: number;
  noPrice?: number;
};

function parseMarkets(data: unknown): MarketCard[] {
  if (typeof data !== "object" || data === null) return [];
  const d = data as Record<string, unknown>;
  if (!Array.isArray(d.markets)) return [];
  const out: MarketCard[] = [];
  for (const raw of d.markets) {
    if (typeof raw !== "object" || raw === null) continue;
    const m = raw as Record<string, unknown>;
    if (typeof m._id === "undefined") continue;
    out.push({
      _id: String(m._id),
      title: typeof m.title === "string" ? m.title : "",
      imageUrl: typeof m.imageUrl === "string" ? m.imageUrl : null,
      yesPrice: typeof m.yesPrice === "number" ? m.yesPrice : undefined,
      noPrice: typeof m.noPrice === "number" ? m.noPrice : undefined,
    });
  }
  return out;
}

export default function BlurredSampleCards() {
  const [markets, setMarkets] = useState<MarketCard[]>([]);
  useEffect(() => {
    fetch("/api/waitlist/sample-markets")
      .then((r) => r.json() as Promise<unknown>)
      .then((d) => setMarkets(parseMarkets(d)))
      .catch(() => {});
  }, []);
  if (!markets.length) return null;
  return (
    <div
      aria-hidden="true"
      className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-10 select-none pointer-events-none"
      data-testid="blurred-cards"
    >
      {markets.map((m) => (
        <div
          key={m._id}
          className="relative bg-[#13202D] border border-[#1E2A36] rounded-lg overflow-hidden"
        >
          <div className="aspect-video bg-gray-800" />
          <div className="p-3 blur-sm">
            <div className="text-xs text-gray-400 truncate">{m.title}</div>
            <div className="mt-2 flex gap-2 font-mono text-sm">
              <span className="text-[#00D4AA]">YES {Math.round((m.yesPrice ?? 0.5) * 100)}%</span>
              <span className="text-[#E94560]">NO {Math.round((m.noPrice ?? 0.5) * 100)}%</span>
            </div>
          </div>
          <div className="absolute inset-0 bg-[#0A0A1A]/40" />
        </div>
      ))}
    </div>
  );
}
