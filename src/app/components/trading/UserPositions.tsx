'use client';

interface Position {
  id: string;
  marketId: string;
  outcome: 'YES' | 'NO';
  shares: number;
  avgPrice: number;
  currentPrice: number;
}

interface UserPositionsProps {
  positions: Position[];
  loading?: boolean;
  className?: string;
}

export function UserPositions({ positions, loading = false, className = '' }: UserPositionsProps) {
  // Calculate totals
  const totalInvested = positions.reduce((sum, pos) => sum + pos.shares * pos.avgPrice, 0);
  const totalValue = positions.reduce((sum, pos) => sum + pos.shares * pos.currentPrice, 0);
  const totalPnL = totalValue - totalInvested;
  const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

  return (
    <div className={`rounded-lg border border-gray-700 bg-trading-bg-card ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-700 px-4 py-3">
        <h3 className="text-lg font-semibold text-white">Your Positions</h3>
      </div>

      {/* Total P&L Summary */}
      {positions.length > 0 && (
        <div className="border-b border-gray-700 bg-gray-800/50 px-4 py-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs text-gray-400">Total Invested</div>
              <div className="font-mono font-semibold text-white">
                ${totalInvested.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Current Value</div>
              <div className="font-mono font-semibold text-white">
                ${totalValue.toFixed(2)}
              </div>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-gray-700 pt-2">
            <span className="text-sm font-semibold text-gray-300">
              Unrealized P&L
            </span>
            <div className="text-right">
              <div
                className={`font-mono text-lg font-bold ${
                  totalPnL >= 0 ? 'text-trading-yes' : 'text-trading-no'
                }`}
              >
                {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
              </div>
              <div
                className={`text-xs ${
                  totalPnL >= 0 ? 'text-trading-yes' : 'text-trading-no'
                }`}
              >
                {totalPnL >= 0 ? '+' : ''}
                {totalPnLPercent.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Positions List */}
      <div className="max-h-[300px] overflow-y-auto">
        {loading ? (
          <div className="py-8 text-center text-sm text-gray-500">
            Loading positions...
          </div>
        ) : positions.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-500">
            No positions yet
          </div>
        ) : (
          <div className="divide-y divide-gray-700/50">
            {positions.map((position) => (
              <PositionRow key={position.id} position={position} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface PositionRowProps {
  position: Position;
}

function PositionRow({ position }: PositionRowProps) {
  const isYes = position.outcome === 'YES';
  const invested = position.shares * position.avgPrice;
  const currentValue = position.shares * position.currentPrice;
  const pnl = currentValue - invested;
  const pnlPercent = invested > 0 ? (pnl / invested) * 100 : 0;

  return (
    <div className="px-4 py-3">
      {/* Position Header */}
      <div className="mb-2 flex items-center justify-between">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            isYes
              ? 'bg-trading-yes/20 text-trading-yes'
              : 'bg-trading-no/20 text-trading-no'
          }`}
        >
          {position.outcome}
        </span>
        <div className="text-right">
          <div
            className={`text-sm font-bold ${
              pnl >= 0 ? 'text-trading-yes' : 'text-trading-no'
            }`}
          >
            {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
          </div>
          <div
            className={`text-xs ${
              pnl >= 0 ? 'text-trading-yes' : 'text-trading-no'
            }`}
          >
            {pnl >= 0 ? '+' : ''}
            {pnlPercent.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Position Details */}
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <div className="text-xs text-gray-400">Shares</div>
          <div className="font-mono text-white">{position.shares.toFixed(0)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Avg Price</div>
          <div className="font-mono text-white">${position.avgPrice.toFixed(3)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Current</div>
          <div className="font-mono text-white">
            ${position.currentPrice.toFixed(3)}
          </div>
        </div>
      </div>

      {/* Value Details */}
      <div className="mt-2 grid grid-cols-2 gap-4 border-t border-gray-700/50 pt-2 text-sm">
        <div>
          <div className="text-xs text-gray-400">Invested</div>
          <div className="font-mono text-gray-300">${invested.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Value</div>
          <div className="font-mono text-white">${currentValue.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}
