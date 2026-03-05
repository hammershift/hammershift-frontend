'use client';

import { useMemo } from 'react';

interface Order {
  id: string;
  price: number;
  size: number;
  remainingSize: number;
  side: 'BUY' | 'SELL';
  outcome: 'YES' | 'NO';
  timestamp: Date;
}

interface OrderBookProps {
  orders: Order[];
  outcome: 'YES' | 'NO';
  maxDepth?: number;
}

export function OrderBook({ orders, outcome, maxDepth = 10 }: OrderBookProps) {
  // Filter and sort orders for this outcome
  const { buyOrders, sellOrders } = useMemo(() => {
    const filtered = orders.filter((o) => o.outcome === outcome);

    const buys = filtered
      .filter((o) => o.side === 'BUY' && o.remainingSize > 0)
      .sort((a, b) => b.price - a.price) // Highest price first
      .slice(0, maxDepth);

    const sells = filtered
      .filter((o) => o.side === 'SELL' && o.remainingSize > 0)
      .sort((a, b) => a.price - b.price) // Lowest price first
      .slice(0, maxDepth);

    return { buyOrders: buys, sellOrders: sells };
  }, [orders, outcome, maxDepth]);

  // Calculate spread
  const spread = useMemo(() => {
    if (sellOrders.length === 0 || buyOrders.length === 0) return null;
    return sellOrders[0].price - buyOrders[0].price;
  }, [buyOrders, sellOrders]);

  // Find max size for bar visualization
  const maxSize = useMemo(() => {
    const allSizes = [...buyOrders, ...sellOrders].map((o) => o.remainingSize);
    return Math.max(...allSizes, 1);
  }, [buyOrders, sellOrders]);

  return (
    <div className="w-full rounded-lg border border-gray-700 bg-trading-bg-card">
      {/* Header */}
      <div className="border-b border-gray-700 px-4 py-3">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
          Order Book
          <span
            className={`text-sm font-normal ${
              outcome === 'YES' ? 'text-trading-yes' : 'text-trading-no'
            }`}
          >
            {outcome}
          </span>
        </h3>
        {spread !== null && (
          <p className="mt-1 text-xs text-gray-400">
            Spread: <span className="font-mono">${spread.toFixed(3)}</span>
          </p>
        )}
      </div>

      <div className="p-4">
        {/* Column Headers */}
        <div className="mb-2 grid grid-cols-3 gap-2 text-xs font-semibold text-gray-400">
          <div className="text-left">Price</div>
          <div className="text-right">Size</div>
          <div className="text-right">Total</div>
        </div>

        {/* Sell Orders (Asks) */}
        <div className="mb-4 space-y-1">
          {sellOrders.length === 0 ? (
            <div className="py-4 text-center text-sm text-gray-500">
              No sell orders
            </div>
          ) : (
            sellOrders.reverse().map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                maxSize={maxSize}
                side="SELL"
              />
            ))
          )}
        </div>

        {/* Spread Indicator */}
        {spread !== null && (
          <div className="my-3 border-t border-b border-gray-700 py-2 text-center">
            <span className="font-mono text-sm text-gray-400">
              Spread: ${spread.toFixed(3)}
            </span>
          </div>
        )}

        {/* Buy Orders (Bids) */}
        <div className="space-y-1">
          {buyOrders.length === 0 ? (
            <div className="py-4 text-center text-sm text-gray-500">
              No buy orders
            </div>
          ) : (
            buyOrders.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                maxSize={maxSize}
                side="BUY"
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

interface OrderRowProps {
  order: Order;
  maxSize: number;
  side: 'BUY' | 'SELL';
}

function OrderRow({ order, maxSize, side }: OrderRowProps) {
  const total = order.price * order.remainingSize;
  const widthPercent = (order.remainingSize / maxSize) * 100;

  return (
    <div className="relative overflow-hidden rounded">
      {/* Background bar */}
      <div
        className={`absolute inset-y-0 ${
          side === 'BUY' ? 'left-0 bg-trading-yes/10' : 'right-0 bg-trading-no/10'
        } transition-all`}
        style={{ width: `${widthPercent}%` }}
      />

      {/* Order data */}
      <div className="relative grid grid-cols-3 gap-2 px-2 py-1.5 text-sm">
        <div
          className={`font-mono font-semibold ${
            side === 'BUY' ? 'text-trading-yes' : 'text-trading-no'
          }`}
        >
          ${order.price.toFixed(3)}
        </div>
        <div className="text-right font-mono text-white">
          {order.remainingSize.toFixed(0)}
        </div>
        <div className="text-right font-mono text-gray-400">
          ${total.toFixed(2)}
        </div>
      </div>
    </div>
  );
}
