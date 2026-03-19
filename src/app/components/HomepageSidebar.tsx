'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, TrendingUp, ArrowUpDown } from 'lucide-react';
import CountdownInline from './CountdownInline';
import WeeklyChallenge from './WeeklyChallenge';

interface SidebarMarket {
  _id: string;
  question: string;
  yesPrice: number;
  totalVolume?: number;
  closesAt?: string | null;
  priceChange?: number;
  auction: { title: string | null; image?: string | null };
}

interface SidebarData {
  endingSoon: SidebarMarket[];
  mostActive: SidebarMarket[];
  biggestMovers: SidebarMarket[];
}

export default function HomepageSidebar() {
  const [data, setData] = useState<SidebarData | null>(null);

  useEffect(() => {
    fetch('/api/markets/sidebar')
      .then(r => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) return null;

  function formatVolume(cents: number): string {
    const dollars = cents / 100;
    if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`;
    if (dollars >= 1_000) return `$${(dollars / 1_000).toFixed(1)}K`;
    if (dollars > 0) return `$${dollars.toFixed(0)}`;
    return "$0";
  }

  return (
    <aside className="space-y-6">
      {/* Ending Soon */}
      {data.endingSoon.length > 0 && (
        <div className="rounded-xl border border-white/[0.08] bg-[#16181f] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-[#FFB547]" />
            <h3 className="text-sm font-semibold text-white">Ending Soon</h3>
          </div>
          <div className="space-y-2">
            {data.endingSoon.map((m, i) => (
              <Link key={m._id} href={`/trading/${m._id}`} className="flex items-center gap-2 rounded-lg p-2 hover:bg-white/5 transition-colors">
                <span className="text-xs font-mono text-gray-600 w-4">{i + 1}</span>
                {m.auction?.image && (
                  <img src={m.auction.image} alt="" className="h-8 w-8 rounded object-cover shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white truncate">{m.auction?.title ?? m.question}</p>
                  {m.closesAt && (
                    <p className="text-[10px] font-mono text-[#FFB547]">
                      <CountdownInline deadline={m.closesAt} />
                    </p>
                  )}
                </div>
                <span className="text-xs font-mono font-semibold text-[#16c784] shrink-0">
                  {Math.round(m.yesPrice * 100)}%
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Most Active */}
      {data.mostActive.length > 0 && (
        <div className="rounded-xl border border-white/[0.08] bg-[#16181f] p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-[#00D4AA]" />
            <h3 className="text-sm font-semibold text-white">Most Active</h3>
          </div>
          <div className="space-y-2">
            {data.mostActive.map((m, i) => (
              <Link key={m._id} href={`/trading/${m._id}`} className="flex items-center gap-2 rounded-lg p-2 hover:bg-white/5 transition-colors">
                <span className="text-xs font-mono text-gray-600 w-4">{i + 1}</span>
                {m.auction?.image && (
                  <img src={m.auction.image} alt="" className="h-8 w-8 rounded object-cover shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white truncate">{m.auction?.title ?? m.question}</p>
                </div>
                <span className="text-xs font-mono text-gray-400 shrink-0">
                  {formatVolume(m.totalVolume ?? 0)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Biggest Movers */}
      {data.biggestMovers.length > 0 && (
        <div className="rounded-xl border border-white/[0.08] bg-[#16181f] p-4">
          <div className="flex items-center gap-2 mb-3">
            <ArrowUpDown className="h-4 w-4 text-[#E94560]" />
            <h3 className="text-sm font-semibold text-white">Biggest Movers</h3>
          </div>
          <div className="space-y-2">
            {data.biggestMovers.map((m, i) => (
              <Link key={m._id} href={`/trading/${m._id}`} className="flex items-center gap-2 rounded-lg p-2 hover:bg-white/5 transition-colors">
                <span className="text-xs font-mono text-gray-600 w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white truncate">{m.auction?.title ?? m.question}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono text-gray-300">
                    {Math.round(m.yesPrice * 100)}%
                  </span>
                  {m.priceChange != null && m.priceChange !== 0 && (
                    <span className={`text-xs font-mono ${m.priceChange > 0 ? "text-[#16c784]" : "text-[#f44b5a]"}`}>
                      {m.priceChange > 0 ? "\u25B2" : "\u25BC"}{Math.abs(m.priceChange)}%
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Challenge */}
      <WeeklyChallenge />
    </aside>
  );
}
