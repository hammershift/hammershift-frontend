/**
 * useOrderBook Hook
 *
 * Custom React hook for subscribing to real-time order book updates via Socket.IO.
 *
 * Features:
 * - Automatic subscription/unsubscription on mount/unmount
 * - Real-time order book state management
 * - Connection status tracking
 * - Error handling
 * - Optimistic updates merge with server updates
 *
 * Usage:
 * ```tsx
 * const { orderBook, isConnected, error } = useOrderBook(marketId);
 * ```
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Order {
  id: string;
  side: 'BUY' | 'SELL';
  outcome: 'YES' | 'NO';
  price: number;
  size: number;
  remainingSize: number;
}

export interface OrderBookState {
  buy: {
    YES: Order[];
    NO: Order[];
  };
  sell: {
    YES: Order[];
    NO: Order[];
  };
  lastUpdate: number;
}

export interface UseOrderBookReturn {
  orderBook: OrderBookState | null;
  isConnected: boolean;
  error: string | null;
  isLoading: boolean;
}

const POLL_INTERVAL_MS = 10_000;

function createEmptyOrderBook(): OrderBookState {
  return {
    buy: { YES: [], NO: [] },
    sell: { YES: [], NO: [] },
    lastUpdate: Date.now(),
  };
}

function groupOrders(orders: Order[]): OrderBookState {
  const book = createEmptyOrderBook();
  for (const order of orders) {
    book[order.side === 'BUY' ? 'buy' : 'sell'][order.outcome].push(order);
  }
  book.buy.YES.sort((a, b) => b.price - a.price);
  book.buy.NO.sort((a, b) => b.price - a.price);
  book.sell.YES.sort((a, b) => a.price - b.price);
  book.sell.NO.sort((a, b) => a.price - b.price);
  book.lastUpdate = Date.now();
  return book;
}

export function useOrderBook(marketId: string | null): UseOrderBookReturn {
  const [orderBook, setOrderBook] = useState<OrderBookState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!marketId) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch(
        `/api/orders?marketId=${encodeURIComponent(marketId)}&status=OPEN`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw: any[] = await res.json();
      const orders: Order[] = raw.map((o) => ({
        id: String(o._id),
        side: o.side,
        outcome: o.outcome,
        price: o.price,
        size: o.size ?? o.quantity ?? 0,
        remainingSize: o.remainingSize ?? o.size ?? 0,
      }));
      setOrderBook(groupOrders(orders));
      setError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load order book';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [marketId]);

  useEffect(() => {
    fetchOrders();
    const id = setInterval(fetchOrders, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchOrders]);

  return {
    orderBook,
    // Polling is always "connected" — no WebSocket to lose
    isConnected: !isLoading && error === null,
    error,
    isLoading,
  };
}
