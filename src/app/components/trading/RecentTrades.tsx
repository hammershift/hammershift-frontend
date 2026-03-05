'use client';

import { formatDistanceToNow } from 'date-fns';

interface Trade {
  id: string;
  price: number;
  size: number;
  side: 'BUY' | 'SELL';
  outcome: 'YES' | 'NO';
  timestamp: Date;
}

interface RecentTradesProps {
  trades: Trade[];
  maxTrades?: number;
  className?: string;
}

export function RecentTrades({ trades, maxTrades = 20, className = '' }: RecentTradesProps) {
  const displayTrades = trades.slice(0, maxTrades);

  return (
    <div className={`rounded-lg border border-gray-700 bg-trading-bg-card ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-700 px-4 py-3">
        <h3 className="text-lg font-semibold text-white">Recent Trades</h3>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-4 gap-2 border-b border-gray-700 px-4 py-2 text-xs font-semibold text-gray-400">
        <div>Price</div>
        <div className="text-right">Size</div>
        <div className="text-right">Side</div>
        <div className="text-right">Time</div>
      </div>

      {/* Trades List */}
      <div className="max-h-[400px] overflow-y-auto">
        {displayTrades.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-500">
            No trades yet
          </div>
        ) : (
          <div className="divide-y divide-gray-700/50">
            {displayTrades.map((trade) => (
              <TradeRow key={trade.id} trade={trade} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface TradeRowProps {
  trade: Trade;
}

function TradeRow({ trade }: TradeRowProps) {
  const isBuy = trade.side === 'BUY';
  const isYes = trade.outcome === 'YES';
  const total = trade.price * trade.size;

  return (
    <div className="grid grid-cols-4 gap-2 px-4 py-2 text-sm transition-colors hover:bg-gray-800/50">
      {/* Price */}
      <div className="flex items-center gap-1">
        <span
          className={`font-mono font-semibold ${
            isYes ? 'text-trading-yes' : 'text-trading-no'
          }`}
        >
          ${trade.price.toFixed(3)}
        </span>
        <span className="text-xs text-gray-500">{trade.outcome}</span>
      </div>

      {/* Size */}
      <div className="text-right font-mono text-white">
        {trade.size.toFixed(0)}
      </div>

      {/* Side */}
      <div className="text-right">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            isBuy
              ? 'bg-trading-yes/20 text-trading-yes'
              : 'bg-trading-no/20 text-trading-no'
          }`}
        >
          {trade.side}
        </span>
      </div>

      {/* Time */}
      <div className="text-right text-xs text-gray-400">
        {formatDistanceToNow(new Date(trade.timestamp), { addSuffix: true })}
      </div>
    </div>
  );
}
