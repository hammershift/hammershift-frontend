'use client';

import { useEffect, useState } from 'react';

interface SaleItem {
  title: string;
  price: number;
  soldDate: string | null;
  realDeadline: string | null;
  isLive: boolean;
}

interface LiveTickerProps {
  sales?: SaleItem[];
}

function formatPrice(dollars: number): string {
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`;
  if (dollars >= 1_000) return `$${Math.round(dollars / 1_000)}K`;
  return `$${dollars.toLocaleString()}`;
}

function timeLabel(item: SaleItem): string {
  if (item.isLive && item.realDeadline) {
    const diff = new Date(item.realDeadline).getTime() - Date.now();
    if (diff <= 0) return 'ending now';
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h left`;
    if (hours > 0) return `${hours}h ${mins}m left`;
    return `${mins}m left`;
  }
  if (!item.soldDate) return '';
  const diff = Date.now() - new Date(item.soldDate).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

export default function LiveTicker({ sales }: LiveTickerProps) {
  const [items, setItems] = useState<SaleItem[]>(sales ?? []);

  useEffect(() => {
    if (items.length > 0) return;
    fetch('/api/ticker/recent-sales')
      .then((r) => r.json())
      .then((data: SaleItem[]) => {
        if (data?.length) setItems(data);
      })
      .catch(() => {});
  }, [items.length]);

  if (items.length === 0) return null;

  const doubled = [...items, ...items];

  return (
    <div
      className="w-full overflow-hidden border-b border-white/[0.08] bg-[#0A0A1A] py-2.5"
      role="marquee"
      aria-label="Recent auction results"
    >
      <style>{`
        @keyframes sales-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .sales-track {
          display: flex;
          gap: 2.5rem;
          white-space: nowrap;
          animation: sales-scroll 45s linear infinite;
          width: max-content;
        }
        .sales-track:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="sales-track">
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-2 text-sm">
            {item.isLive ? (
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-[#00D4AA] animate-pulse" />
                <span className="text-[#00D4AA] text-xs font-semibold uppercase">Live</span>
              </span>
            ) : (
              <span className="text-[#F2CA16]">🔨</span>
            )}
            <span className="text-gray-300 font-medium">{item.title}</span>
            <span className={`font-mono font-bold ${item.isLive ? 'text-[#FFB547]' : 'text-[#00D4AA]'}`}>
              {item.isLive ? `Bid ${formatPrice(item.price)}` : formatPrice(item.price)}
            </span>
            <span className={`text-xs ${item.isLive ? 'text-[#E94560]' : 'text-gray-500'}`}>
              {timeLabel(item)}
            </span>
            <span className="text-[#1E2A36] mx-1">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}
