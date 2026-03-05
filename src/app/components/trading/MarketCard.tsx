'use client';

import Link from 'next/link';
import { useMemo } from 'react';

interface MarketCardProps {
  marketId: string;
  auctionId: string;
  title: string;
  imageUrl?: string;
  predictedPrice: number;
  volume: number;
  liquidity: number;
  yesProbability: number; // 0-1
  status: 'PENDING' | 'ACTIVE' | 'RESOLVED';
  winningOutcome?: 'YES' | 'NO';
  endsAt?: Date;
  className?: string;
}

export function MarketCard({
  marketId,
  auctionId,
  title,
  imageUrl,
  predictedPrice,
  volume,
  liquidity,
  yesProbability,
  status,
  winningOutcome,
  endsAt,
  className = '',
}: MarketCardProps) {
  const noProbability = 1 - yesProbability;

  // Format time remaining
  const timeRemaining = useMemo(() => {
    if (!endsAt || status !== 'ACTIVE') return null;
    const now = new Date();
    const diff = endsAt.getTime() - now.getTime();
    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  }, [endsAt, status]);

  return (
    <Link href={`/trading/${auctionId}`}>
      <div
        className={`group relative overflow-hidden rounded-xl border border-gray-700 bg-trading-bg-card transition-all hover:border-gray-600 hover:shadow-lg hover:shadow-trading-yes/5 ${className}`}
      >
        {/* Status Badge */}
        {status === 'RESOLVED' && winningOutcome && (
          <div className="absolute right-3 top-3 z-10 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
            <span
              className={
                winningOutcome === 'YES' ? 'text-trading-yes' : 'text-trading-no'
              }
            >
              {winningOutcome} WON
            </span>
          </div>
        )}

        {/* Image */}
        {imageUrl && (
          <div className="relative h-48 w-full overflow-hidden bg-gray-900">
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-trading-bg-card via-transparent to-transparent" />
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="mb-3 line-clamp-2 text-base font-semibold leading-tight text-white group-hover:text-trading-yes">
            {title}
          </h3>

          {/* Predicted Price */}
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="text-gray-400">Predicted Price</span>
            <span className="font-mono font-semibold text-white">
              ${predictedPrice.toLocaleString()}
            </span>
          </div>

          {/* Probability Bars */}
          <div className="mb-3 space-y-2">
            {/* YES Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-trading-yes">YES</span>
                <span className="font-mono text-trading-yes">
                  {(yesProbability * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-800">
                <div
                  className="h-full rounded-full bg-trading-yes transition-all"
                  style={{ width: `${yesProbability * 100}%` }}
                />
              </div>
            </div>

            {/* NO Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-trading-no">NO</span>
                <span className="font-mono text-trading-no">
                  {(noProbability * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-800">
                <div
                  className="h-full rounded-full bg-trading-no transition-all"
                  style={{ width: `${noProbability * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between border-t border-gray-700 pt-3 text-xs text-gray-400">
            <div>
              <div className="font-semibold text-white">
                ${volume.toLocaleString()}
              </div>
              <div>Volume</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-white">
                ${liquidity.toLocaleString()}
              </div>
              <div>Liquidity</div>
            </div>
            {timeRemaining && (
              <div className="text-right">
                <div className="font-semibold text-white">{timeRemaining}</div>
                <div>Remaining</div>
              </div>
            )}
          </div>

          {/* Status Indicator */}
          <div className="mt-3">
            {status === 'ACTIVE' && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="h-2 w-2 animate-pulse rounded-full bg-trading-yes" />
                Live Trading
              </div>
            )}
            {status === 'PENDING' && (
              <div className="text-xs text-gray-500">Opening Soon</div>
            )}
            {status === 'RESOLVED' && (
              <div className="text-xs text-gray-500">Market Closed</div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
