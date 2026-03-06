'use client';

import { useState, useMemo } from 'react';

interface TradingFormProps {
  marketId: string;
  auctionId: string;
  auctionTitle: string;
  predictedPrice: number;
  onSubmit: (order: OrderSubmission) => void;
  loading?: boolean;
}

interface OrderSubmission {
  side: 'BUY' | 'SELL';
  outcome: 'YES' | 'NO';
  price: number;
  size: number;
  orderType: 'LIMIT' | 'MARKET';
}

const TAKER_FEE = 0.02; // 2% taker fee
const MAKER_FEE = 0.00; // 0% maker fee (or rebate)

export function TradingForm({
  marketId,
  auctionId,
  auctionTitle,
  predictedPrice,
  onSubmit,
  loading = false,
}: TradingFormProps) {
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [outcome, setOutcome] = useState<'YES' | 'NO'>('YES');
  const [orderType, setOrderType] = useState<'LIMIT' | 'MARKET'>('LIMIT');
  const [price, setPrice] = useState<string>('0.50');
  const [size, setSize] = useState<string>('10');

  // Calculate totals
  const calculations = useMemo(() => {
    const priceNum = parseFloat(price) || 0;
    const sizeNum = parseFloat(size) || 0;
    const subtotal = priceNum * sizeNum;
    const fee = subtotal * TAKER_FEE;
    const total = side === 'BUY' ? subtotal + fee : subtotal - fee;

    return {
      subtotal,
      fee,
      total,
      avgPrice: priceNum,
      potentialReturn: side === 'BUY' ? sizeNum - total : total,
    };
  }, [price, size, side]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const priceNum = parseFloat(price);
    const sizeNum = parseFloat(size);

    if (priceNum <= 0 || priceNum > 1 || sizeNum <= 0) {
      alert('Invalid price or size');
      return;
    }

    onSubmit({
      side,
      outcome,
      price: priceNum,
      size: sizeNum,
      orderType,
    });
  };

  return (
    <div className="w-full rounded-lg border border-gray-700 bg-trading-bg-card p-6">
      {/* Market Info */}
      <div className="mb-4 border-b border-gray-700 pb-4">
        <h3 className="text-lg font-semibold text-white">{auctionTitle}</h3>
        <p className="mt-1 font-mono text-sm text-gray-400">
          Predicted: ${predictedPrice.toLocaleString()}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Buy/Sell Tabs */}
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-trading-bg-secondary p-1">
          <button
            type="button"
            onClick={() => setSide('BUY')}
            className={`rounded-md px-4 min-h-[44px] font-semibold transition-colors touch-manipulation ${
              side === 'BUY'
                ? 'bg-trading-yes text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Buy
          </button>
          <button
            type="button"
            onClick={() => setSide('SELL')}
            className={`rounded-md px-4 min-h-[44px] font-semibold transition-colors touch-manipulation ${
              side === 'SELL'
                ? 'bg-trading-no text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sell
          </button>
        </div>

        {/* Outcome Selector */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Outcome
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setOutcome('YES')}
              className={`rounded-lg border-2 px-4 py-3 font-semibold transition-all touch-manipulation min-h-[44px] ${
                outcome === 'YES'
                  ? 'border-trading-yes bg-trading-yes/10 text-trading-yes'
                  : 'border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              YES
              <div className="mt-1 text-xs opacity-70">
                Hammer &gt; Predicted
              </div>
            </button>
            <button
              type="button"
              onClick={() => setOutcome('NO')}
              className={`rounded-lg border-2 px-4 py-3 font-semibold transition-all touch-manipulation min-h-[44px] ${
                outcome === 'NO'
                  ? 'border-trading-no bg-trading-no/10 text-trading-no'
                  : 'border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              NO
              <div className="mt-1 text-xs opacity-70">
                Hammer &lt; Predicted
              </div>
            </button>
          </div>
        </div>

        {/* Order Type */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Order Type
          </label>
          <select
            value={orderType}
            onChange={(e) => setOrderType(e.target.value as 'LIMIT' | 'MARKET')}
            className="w-full rounded-lg border border-gray-700 bg-trading-bg-secondary px-4 py-2.5 text-base text-white focus:border-trading-yes focus:outline-none focus:ring-2 focus:ring-trading-yes/20 touch-manipulation"
          >
            <option value="LIMIT">Limit Order</option>
            <option value="MARKET">Market Order</option>
          </select>
        </div>

        {/* Price Input (only for limit orders) */}
        {orderType === 'LIMIT' && (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Price (per share)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="0.99"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-trading-bg-secondary py-2.5 pl-8 pr-4 text-base font-mono text-white focus:border-trading-yes focus:outline-none focus:ring-2 focus:ring-trading-yes/20"
                placeholder="0.50"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Range: $0.01 - $0.99 (probability)
            </p>
          </div>
        )}

        {/* Size Input */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Shares
          </label>
          <input
            type="number"
            step="1"
            min="1"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-trading-bg-secondary px-4 py-2.5 text-base font-mono text-white focus:border-trading-yes focus:outline-none focus:ring-2 focus:ring-trading-yes/20"
            placeholder="10"
          />
        </div>

        {/* Summary */}
        <div className="rounded-lg border border-gray-700 bg-trading-bg-secondary p-4">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Subtotal</span>
              <span className="font-mono text-white">
                ${calculations.subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">
                Fee (2% taker)
              </span>
              <span className="font-mono text-white">
                {side === 'BUY' ? '+' : '-'}${calculations.fee.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-gray-700 pt-2 text-base">
              <span className="font-semibold text-white">Total</span>
              <span className="font-mono font-bold text-white">
                ${calculations.total.toFixed(2)}
              </span>
            </div>
            {side === 'BUY' && (
              <div className="mt-3 rounded-md bg-trading-yes/10 p-3 text-xs">
                <div className="font-semibold text-trading-yes">
                  Potential Return
                </div>
                <div className="mt-1 text-gray-300">
                  If {outcome} wins: ${calculations.potentialReturn.toFixed(2)}{' '}
                  profit
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full rounded-lg py-3 min-h-[44px] font-semibold text-white transition-all touch-manipulation ${
            side === 'BUY'
              ? 'bg-trading-yes hover:bg-trading-yes/90'
              : 'bg-trading-no hover:bg-trading-no/90'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? 'Processing...' : `${side} ${outcome}`}
        </button>
      </form>
    </div>
  );
}
