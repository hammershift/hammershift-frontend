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

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import {
  socketClient,
  OrderBookUpdate,
  OrderMatched,
  OrderCancelled,
  MarketResolved,
} from '@/lib/socket/client';

/**
 * Order Book State
 */
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

/**
 * Initialize empty order book
 */
const createEmptyOrderBook = (): OrderBookState => ({
  buy: { YES: [], NO: [] },
  sell: { YES: [], NO: [] },
  lastUpdate: Date.now(),
});

/**
 * Group orders by side and outcome
 */
const groupOrders = (orders: Order[]): OrderBookState => {
  const orderBook = createEmptyOrderBook();

  orders.forEach((order) => {
    if (order.side === 'BUY') {
      orderBook.buy[order.outcome].push(order);
    } else {
      orderBook.sell[order.outcome].push(order);
    }
  });

  // Sort buy orders by price descending (best bids first)
  orderBook.buy.YES.sort((a, b) => b.price - a.price);
  orderBook.buy.NO.sort((a, b) => b.price - a.price);

  // Sort sell orders by price ascending (best asks first)
  orderBook.sell.YES.sort((a, b) => a.price - b.price);
  orderBook.sell.NO.sort((a, b) => a.price - b.price);

  orderBook.lastUpdate = Date.now();
  return orderBook;
};

/**
 * useOrderBook Hook
 *
 * @param marketId - The market ID to subscribe to
 * @returns Order book state, connection status, and error
 */
export function useOrderBook(marketId: string | null): UseOrderBookReturn {
  const { data: session } = useSession();
  const [orderBook, setOrderBook] = useState<OrderBookState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const socketRef = useRef(socketClient.getSocket());

  /**
   * Handle order book updates from server
   */
  const handleOrderBookUpdate = useCallback((data: OrderBookUpdate) => {
    if (data.marketId !== marketId) return;

    const newOrderBook = groupOrders(data.orders);
    setOrderBook(newOrderBook);
    setIsLoading(false);
  }, [marketId]);

  /**
   * Handle order matched events
   */
  const handleOrderMatched = useCallback((data: OrderMatched) => {
    if (data.marketId !== marketId) return;

    setOrderBook((prev) => {
      if (!prev) return prev;

      // Update the matched order's remaining size
      const updated = { ...prev };
      const updateOrder = (orders: Order[]) => {
        return orders.map((order) =>
          order.id === data.orderId
            ? { ...order, remainingSize: order.remainingSize - data.matchedSize }
            : order
        ).filter((order) => order.remainingSize > 0);
      };

      updated.buy.YES = updateOrder(updated.buy.YES);
      updated.buy.NO = updateOrder(updated.buy.NO);
      updated.sell.YES = updateOrder(updated.sell.YES);
      updated.sell.NO = updateOrder(updated.sell.NO);
      updated.lastUpdate = data.timestamp;

      return updated;
    });
  }, [marketId]);

  /**
   * Handle order cancelled events
   */
  const handleOrderCancelled = useCallback((data: OrderCancelled) => {
    if (data.marketId !== marketId) return;

    setOrderBook((prev) => {
      if (!prev) return prev;

      // Remove the cancelled order
      const updated = { ...prev };
      const removeOrder = (orders: Order[]) => {
        return orders.filter((order) => order.id !== data.orderId);
      };

      updated.buy.YES = removeOrder(updated.buy.YES);
      updated.buy.NO = removeOrder(updated.buy.NO);
      updated.sell.YES = removeOrder(updated.sell.YES);
      updated.sell.NO = removeOrder(updated.sell.NO);
      updated.lastUpdate = data.timestamp;

      return updated;
    });
  }, [marketId]);

  /**
   * Handle market resolved events
   */
  const handleMarketResolved = useCallback((data: MarketResolved) => {
    if (data.marketId !== marketId) return;

    // Clear order book when market resolves
    setOrderBook(null);
    setError('Market has been resolved');
  }, [marketId]);

  /**
   * Setup socket connection and subscriptions
   */
  useEffect(() => {
    if (!marketId) {
      setIsLoading(false);
      return;
    }

    // Connect socket with session token
    const token = session?.user?.id;
    const socket = socketClient.connect(token);
    socketRef.current = socket;

    // Setup connection status listeners
    const handleConnect = () => {
      setIsConnected(true);
      setError(null);
      socketClient.subscribeToMarket(marketId);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleConnectError = (err: Error) => {
      setIsConnected(false);
      setError(`Connection error: ${err.message}`);
      setIsLoading(false);
    };

    // Register event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('orderBook:update', handleOrderBookUpdate);
    socket.on('order:matched', handleOrderMatched);
    socket.on('order:cancelled', handleOrderCancelled);
    socket.on('market:resolved', handleMarketResolved);

    // If already connected, subscribe immediately
    if (socket.connected) {
      handleConnect();
    }

    // Cleanup on unmount or marketId change
    return () => {
      if (marketId) {
        socketClient.unsubscribeFromMarket(marketId);
      }

      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('orderBook:update', handleOrderBookUpdate);
      socket.off('order:matched', handleOrderMatched);
      socket.off('order:cancelled', handleOrderCancelled);
      socket.off('market:resolved', handleMarketResolved);
    };
  }, [
    marketId,
    session,
    handleOrderBookUpdate,
    handleOrderMatched,
    handleOrderCancelled,
    handleMarketResolved,
  ]);

  return {
    orderBook,
    isConnected,
    error,
    isLoading,
  };
}
