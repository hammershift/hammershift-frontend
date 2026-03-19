'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface RelatedMarket {
  _id: string;
  question: string;
  yesPrice: number;
  auction: { title: string | null; image: string | null };
}

interface RelatedMarketsProps {
  currentMarketId: string;
}

export function RelatedMarkets({ currentMarketId }: RelatedMarketsProps) {
  const [markets, setMarkets] = useState<RelatedMarket[]>([]);

  useEffect(() => {
    fetch('/api/markets/trending')
      .then(r => r.json())
      .then((data: RelatedMarket[]) => {
        // Filter out current market and take up to 4
        setMarkets(data.filter(m => m._id !== currentMarketId).slice(0, 4));
      })
      .catch(() => {});
  }, [currentMarketId]);

  if (markets.length === 0) return null;

  return (
    <div className="rounded-lg border border-gray-700 bg-trading-bg-card p-4">
      <h3 className="text-lg font-semibold text-white mb-3">Related Markets</h3>
      <div className="space-y-3">
        {markets.map(m => (
          <Link
            key={m._id}
            href={`/trading/${m._id}`}
            className="flex items-center gap-3 rounded-lg p-2 hover:bg-white/5 transition-colors"
          >
            {m.auction?.image && (
              <img src={m.auction.image} alt="" className="h-10 w-10 rounded object-cover" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{m.auction?.title ?? m.question}</p>
              <p className="text-xs text-gray-500">{m.question}</p>
            </div>
            <span className="text-sm font-mono font-semibold text-[#16c784] shrink-0">
              {Math.round(m.yesPrice * 100)}%
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
