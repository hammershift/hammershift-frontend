'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface OpenOrder {
  id: string;
  marketId: string;
  side: 'BUY' | 'SELL';
  outcome: 'YES' | 'NO';
  price: number;
  size: number;
  remainingSize: number;
  status: 'OPEN' | 'PARTIAL';
  createdAt: Date;
}

interface UserOpenOrdersProps {
  orders: OpenOrder[];
  onCancelOrder: (orderId: string) => void;
  loading?: boolean;
  className?: string;
}

export function UserOpenOrders({
  orders,
  onCancelOrder,
  loading = false,
  className = '',
}: UserOpenOrdersProps) {
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancel = async (orderId: string) => {
    setCancellingId(orderId);
    try {
      await onCancelOrder(orderId);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className={`rounded-lg border border-gray-700 bg-trading-bg-card ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
        <h3 className="text-lg font-semibold text-white">Your Open Orders</h3>
        {orders.length > 0 && (
          <span className="rounded-full bg-gray-700 px-2 py-0.5 text-xs font-semibold text-gray-300">
            {orders.length}
          </span>
        )}
      </div>

      {/* Orders List */}
      <div className="max-h-[300px] overflow-y-auto">
        {loading ? (
          <div className="py-8 text-center text-sm text-gray-500">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-500">
            No open orders
          </div>
        ) : (
          <div className="divide-y divide-gray-700/50">
            {orders.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                onCancel={handleCancel}
                cancelling={cancellingId === order.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface OrderRowProps {
  order: OpenOrder;
  onCancel: (orderId: string) => void;
  cancelling: boolean;
}

function OrderRow({ order, onCancel, cancelling }: OrderRowProps) {
  const filledPercent = ((order.size - order.remainingSize) / order.size) * 100;
  const isBuy = order.side === 'BUY';
  const isYes = order.outcome === 'YES';

  return (
    <div className="px-4 py-3">
      {/* Order Header */}
      <div className="mb-2 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              isBuy
                ? 'bg-trading-yes/20 text-trading-yes'
                : 'bg-trading-no/20 text-trading-no'
            }`}
          >
            {order.side}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              isYes
                ? 'bg-trading-yes/10 text-trading-yes'
                : 'bg-trading-no/10 text-trading-no'
            }`}
          >
            {order.outcome}
          </span>
          {order.status === 'PARTIAL' && (
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-500">
              Partial
            </span>
          )}
        </div>

        {/* Cancel Button */}
        <button
          onClick={() => onCancel(order.id)}
          disabled={cancelling}
          className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-red-500/20 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          title="Cancel order"
        >
          <X size={14} />
        </button>
      </div>

      {/* Order Details */}
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <div className="text-xs text-gray-400">Price</div>
          <div className="font-mono font-semibold text-white">
            ${order.price.toFixed(3)}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Size</div>
          <div className="font-mono text-white">
            {order.remainingSize.toFixed(0)} / {order.size.toFixed(0)}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Total</div>
          <div className="font-mono text-white">
            ${(order.price * order.remainingSize).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Progress Bar (if partially filled) */}
      {order.status === 'PARTIAL' && (
        <div className="mt-2">
          <div className="h-1 overflow-hidden rounded-full bg-gray-700">
            <div
              className={`h-full transition-all ${
                isBuy ? 'bg-trading-yes' : 'bg-trading-no'
              }`}
              style={{ width: `${filledPercent}%` }}
            />
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {filledPercent.toFixed(0)}% filled
          </div>
        </div>
      )}
    </div>
  );
}
