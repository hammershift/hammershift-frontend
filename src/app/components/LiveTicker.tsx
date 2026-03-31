'use client';

import { useEffect, useState } from 'react';

interface SaleItem {
  title: string;
  price: number;
  soldDate: string | null;
}

interface LiveTickerProps {
  sales?: SaleItem[];
}

function formatPrice(dollars: number): string {
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`;
  if (dollars >= 1_000) return `$${Math.round(dollars / 1_000)}K`;
  return `$${dollars.toLocaleString()}`;
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? '1 month ago' : `${months} months ago`;
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
            <span className="text-[#F2CA16]">🔨</span>
            <span className="text-gray-300 font-medium">{item.title}</span>
            <span className="text-[#00D4AA] font-mono font-bold">
              {formatPrice(item.price)}
            </span>
            {item.soldDate && (
              <span className="text-gray-500 text-xs">
                {timeAgo(item.soldDate)}
              </span>
            )}
            <span className="text-[#1E2A36] mx-1">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}
