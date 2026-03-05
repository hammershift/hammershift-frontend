/**
 * Trading Order Book Component
 *
 * Displays the real-time order book for a market using the useOrderBook hook.
 * Shows BUY and SELL orders for both YES and NO outcomes.
 */

'use client';

import React from 'react';
import { useOrderBook } from '@/hooks/useOrderBook';
import { ConnectionStatus } from '@/components/ConnectionStatus';

export interface TradingOrderBookProps {
  marketId: string;
}

export function TradingOrderBook({ marketId }: TradingOrderBookProps) {
  const { orderBook, isConnected, error, isLoading } = useOrderBook(marketId);

  if (isLoading) {
    return (
      <div className="bg-[#0A0A1A] border border-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Order Book</h3>
          <ConnectionStatus isConnected={false} isLoading={true} />
        </div>
        <div className="text-center text-gray-400 py-8">Loading order book...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#0A0A1A] border border-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Order Book</h3>
          <ConnectionStatus isConnected={isConnected} error={error} />
        </div>
        <div className="text-center text-red-400 py-8">{error}</div>
      </div>
    );
  }

  if (!orderBook) {
    return (
      <div className="bg-[#0A0A1A] border border-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Order Book</h3>
          <ConnectionStatus isConnected={isConnected} />
        </div>
        <div className="text-center text-gray-400 py-8">No orders available</div>
      </div>
    );
  }

  return (
    <div className="bg-[#0A0A1A] border border-gray-800 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Order Book</h3>
        <ConnectionStatus isConnected={isConnected} error={error} />
      </div>

      {/* Order Book Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* YES Orders */}
        <div>
          <h4 className="text-sm font-medium text-[#00D4AA] mb-3">YES</h4>

          {/* Buy Orders */}
          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-2">BUY ORDERS</div>
            {orderBook.buy.YES.length === 0 ? (
              <div className="text-sm text-gray-600">No buy orders</div>
            ) : (
              <div className="space-y-1">
                {orderBook.buy.YES.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between bg-green-500/10 px-3 py-2 rounded"
                  >
                    <span className="font-mono text-sm text-white">
                      ${(order.price * 100).toFixed(2)}
                    </span>
                    <span className="font-mono text-xs text-gray-400">
                      {order.remainingSize} shares
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sell Orders */}
          <div>
            <div className="text-xs text-gray-500 mb-2">SELL ORDERS</div>
            {orderBook.sell.YES.length === 0 ? (
              <div className="text-sm text-gray-600">No sell orders</div>
            ) : (
              <div className="space-y-1">
                {orderBook.sell.YES.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between bg-red-500/10 px-3 py-2 rounded"
                  >
                    <span className="font-mono text-sm text-white">
                      ${(order.price * 100).toFixed(2)}
                    </span>
                    <span className="font-mono text-xs text-gray-400">
                      {order.remainingSize} shares
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* NO Orders */}
        <div>
          <h4 className="text-sm font-medium text-[#E94560] mb-3">NO</h4>

          {/* Buy Orders */}
          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-2">BUY ORDERS</div>
            {orderBook.buy.NO.length === 0 ? (
              <div className="text-sm text-gray-600">No buy orders</div>
            ) : (
              <div className="space-y-1">
                {orderBook.buy.NO.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between bg-green-500/10 px-3 py-2 rounded"
                  >
                    <span className="font-mono text-sm text-white">
                      ${(order.price * 100).toFixed(2)}
                    </span>
                    <span className="font-mono text-xs text-gray-400">
                      {order.remainingSize} shares
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sell Orders */}
          <div>
            <div className="text-xs text-gray-500 mb-2">SELL ORDERS</div>
            {orderBook.sell.NO.length === 0 ? (
              <div className="text-sm text-gray-600">No sell orders</div>
            ) : (
              <div className="space-y-1">
                {orderBook.sell.NO.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between bg-red-500/10 px-3 py-2 rounded"
                  >
                    <span className="font-mono text-sm text-white">
                      ${(order.price * 100).toFixed(2)}
                    </span>
                    <span className="font-mono text-xs text-gray-400">
                      {order.remainingSize} shares
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Last Update Timestamp */}
      <div className="mt-4 pt-4 border-t border-gray-800">
        <span className="text-xs text-gray-500">
          Last updated: {new Date(orderBook.lastUpdate).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}
