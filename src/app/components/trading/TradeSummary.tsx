'use client';

interface TradeSummaryProps {
  side: 'BUY' | 'SELL';
  outcome: 'YES' | 'NO';
  price: number;
  size: number;
  takerFee?: number;
  makerFee?: number;
  showPotentialReturn?: boolean;
}

const DEFAULT_TAKER_FEE = 0.02; // 2%
const DEFAULT_MAKER_FEE = 0.00; // 0% (or -0.01 for rebate)

export function TradeSummary({
  side,
  outcome,
  price,
  size,
  takerFee = DEFAULT_TAKER_FEE,
  makerFee = DEFAULT_MAKER_FEE,
  showPotentialReturn = true,
}: TradeSummaryProps) {
  // Calculate values
  const subtotal = price * size;
  const fee = subtotal * takerFee;
  const total = side === 'BUY' ? subtotal + fee : subtotal - fee;
  const potentialReturn = side === 'BUY' ? size - total : total;
  const returnPercent = side === 'BUY' ? ((potentialReturn / total) * 100) : 0;

  return (
    <div className="w-full rounded-lg border border-gray-700 bg-trading-bg-card p-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Trade Summary</h3>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              side === 'BUY'
                ? 'bg-trading-yes/20 text-trading-yes'
                : 'bg-trading-no/20 text-trading-no'
            }`}
          >
            {side}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              outcome === 'YES'
                ? 'bg-trading-yes/10 text-trading-yes'
                : 'bg-trading-no/10 text-trading-no'
            }`}
          >
            {outcome}
          </span>
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-3">
        {/* Price per share */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Price per share</span>
          <span className="font-mono text-white">${price.toFixed(3)}</span>
        </div>

        {/* Number of shares */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Shares</span>
          <span className="font-mono text-white">{size.toFixed(0)}</span>
        </div>

        {/* Subtotal */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Subtotal</span>
          <span className="font-mono text-white">${subtotal.toFixed(2)}</span>
        </div>

        {/* Fee */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <span className="text-gray-400">Trading Fee</span>
            <span className="text-xs text-gray-500">
              ({(takerFee * 100).toFixed(1)}%)
            </span>
          </div>
          <span className="font-mono text-white">
            {side === 'BUY' ? '+' : '-'}${fee.toFixed(2)}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700" />

        {/* Total */}
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-white">
            {side === 'BUY' ? 'Total Cost' : 'Total Return'}
          </span>
          <span className="font-mono text-xl font-bold text-white">
            ${total.toFixed(2)}
          </span>
        </div>

        {/* Potential Return (for buys) */}
        {showPotentialReturn && side === 'BUY' && (
          <>
            <div className="border-t border-gray-700" />
            <div className="rounded-lg bg-trading-yes/10 p-3">
              <div className="mb-1 text-xs font-semibold text-trading-yes">
                If {outcome} wins
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-gray-300">Payout</span>
                <div className="text-right">
                  <div className="font-mono text-lg font-bold text-white">
                    ${size.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-400">
                    +${potentialReturn.toFixed(2)} profit (
                    {returnPercent.toFixed(1)}%)
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Fee Structure Info */}
        <div className="mt-4 rounded-lg bg-gray-800/50 p-3 text-xs text-gray-400">
          <div className="mb-2 font-semibold text-gray-300">Fee Structure</div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Taker Fee:</span>
              <span className="font-mono">{(takerFee * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Maker Fee:</span>
              <span className="font-mono">
                {makerFee === 0
                  ? '0%'
                  : makerFee < 0
                  ? `${Math.abs(makerFee * 100).toFixed(1)}% rebate`
                  : `${(makerFee * 100).toFixed(1)}%`}
              </span>
            </div>
          </div>
          <p className="mt-2 text-xs leading-relaxed">
            Market orders are taker orders and incur the taker fee. Limit orders
            that add liquidity to the order book may receive a maker rebate.
          </p>
        </div>
      </div>
    </div>
  );
}
