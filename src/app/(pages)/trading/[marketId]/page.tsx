'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  TradingForm,
  MarketCard,
  PriceChart,
  RecentTrades,
  UserOpenOrders,
  UserPositions,
  TradingOrderBook,
} from '@/app/components/trading';

// Mock data generation functions (replace with real API calls)
const generateMockPriceData = () => {
  const data = [];
  const now = new Date();
  for (let i = 24; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    data.push({
      timestamp,
      yesPrice: 0.5 + Math.random() * 0.2 - 0.1,
      noPrice: 0.5 + Math.random() * 0.2 - 0.1,
      volume: Math.floor(Math.random() * 1000),
    });
  }
  return data;
};

export default function TradingPage() {
  const params = useParams();
  const marketId = params.marketId as string;

  const [market, setMarket] = useState<any>(null);
  const [recentTrades, setRecentTrades] = useState<any[]>([]);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [userPositions, setUserPositions] = useState<any[]>([]);
  const [priceData, setPriceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOutcome, setSelectedOutcome] = useState<'YES' | 'NO'>('YES');

  // Fetch market data
  const fetchMarketData = useCallback(async () => {
    try {
      // TODO: Replace with real API call
      // const response = await fetch(`/api/markets/${marketId}`);
      // const data = await response.json();

      // Mock data for now
      setMarket({
        marketId,
        auctionId: 'auction-123',
        title: '1967 Porsche 911 S',
        imageUrl: 'https://bringatrailer.com/wp-content/uploads/2023/01/1967_porsche_911_s_16739748851cf5c36e1967_porsche_911_s_1673974885f6e9c7IMG_4657-scaled.jpg',
        predictedPrice: 125000,
        volume: 45200,
        liquidity: 12800,
        yesProbability: 0.62,
        status: 'ACTIVE',
        endsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      });
    } catch (error) {
      console.error('Error fetching market data:', error);
    }
  }, [marketId]);

  // Order book is now handled by WebSocket via TradingOrderBook component
  // No need for polling fetchOrderBook anymore

  // Fetch user positions
  const fetchUserPositions = useCallback(async () => {
    try {
      // TODO: Replace with real API call
      // const response = await fetch(`/api/positions?marketId=${marketId}`);
      // const data = await response.json();

      // Mock data for now
      const mockPositions = [
        {
          id: '1',
          marketId,
          outcome: 'YES',
          shares: 100,
          avgPrice: 0.52,
          currentPrice: 0.62,
        },
      ];
      setUserPositions(mockPositions as any);
    } catch (error) {
      console.error('Error fetching user positions:', error);
    }
  }, [marketId]);

  // Fetch user open orders
  const fetchUserOrders = useCallback(async () => {
    try {
      // TODO: Replace with real API call
      // const response = await fetch(`/api/orders/user?marketId=${marketId}`);
      // const data = await response.json();

      // Mock data for now
      const mockUserOrders = [
        {
          id: 'user-order-1',
          marketId,
          side: 'BUY',
          outcome: 'YES',
          price: 0.50,
          size: 50,
          remainingSize: 50,
          status: 'OPEN',
          createdAt: new Date(),
        },
      ];
      setUserOrders(mockUserOrders as any);
    } catch (error) {
      console.error('Error fetching user orders:', error);
    }
  }, [marketId]);

  // Fetch recent trades
  const fetchRecentTrades = useCallback(async () => {
    try {
      // TODO: Replace with real API call
      // const response = await fetch(`/api/trades/recent?marketId=${marketId}`);
      // const data = await response.json();

      // Mock data for now
      const mockTrades = [
        { id: '1', price: 0.56, size: 25, side: 'BUY', outcome: 'YES', timestamp: new Date(Date.now() - 5 * 60 * 1000) },
        { id: '2', price: 0.55, size: 50, side: 'SELL', outcome: 'YES', timestamp: new Date(Date.now() - 10 * 60 * 1000) },
      ];
      setRecentTrades(mockTrades as any);
    } catch (error) {
      console.error('Error fetching recent trades:', error);
    }
  }, [marketId]);

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchMarketData(),
        fetchUserPositions(),
        fetchUserOrders(),
        fetchRecentTrades(),
      ]);
      setPriceData(generateMockPriceData());
      setLoading(false);
    };

    loadData();
  }, [fetchMarketData, fetchUserPositions, fetchUserOrders, fetchRecentTrades]);

  // Poll recent trades only (order book is now real-time via WebSocket)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRecentTrades();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchRecentTrades]);

  // Handle order submission
  const handleOrderSubmit = async (order: any) => {
    try {
      // TODO: Replace with real API call
      // const response = await fetch('/api/orders/create', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ ...order, marketId }),
      // });

      console.log('Order submitted:', order);
      alert(`Order placed: ${order.side} ${order.size} shares of ${order.outcome} at $${order.price}`);

      // Refresh user orders (order book updates via WebSocket)
      fetchUserOrders();
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Failed to place order');
    }
  };

  // Handle order cancellation
  const handleCancelOrder = async (orderId: string) => {
    try {
      // TODO: Replace with real API call
      // const response = await fetch(`/api/orders/cancel`, {
      //   method: 'DELETE',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ orderId }),
      //});

      console.log('Order cancelled:', orderId);

      // Refresh user orders (order book updates via WebSocket)
      fetchUserOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order');
    }
  };

  if (loading || !market) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-trading-bg-primary">
        <div className="text-white">Loading market data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-trading-bg-primary p-4 md:p-6">
      <div className="mx-auto max-w-[1600px]">
        {/* Market Header */}
        <div className="mb-6">
          <MarketCard {...market} className="w-full" />
        </div>

        {/* Outcome Selector */}
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-gray-700 bg-trading-bg-card p-2">
          <button
            onClick={() => setSelectedOutcome('YES')}
            className={`flex-1 rounded-md px-4 py-2 font-semibold transition-colors ${
              selectedOutcome === 'YES'
                ? 'bg-trading-yes text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            YES
          </button>
          <button
            onClick={() => setSelectedOutcome('NO')}
            className={`flex-1 rounded-md px-4 py-2 font-semibold transition-colors ${
              selectedOutcome === 'NO'
                ? 'bg-trading-no text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            NO
          </button>
        </div>

        {/* Main Trading Layout */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column - Charts & Trades */}
          <div className="space-y-6 lg:col-span-5">
            <PriceChart data={priceData} outcome={selectedOutcome} />
            <RecentTrades trades={recentTrades} />
          </div>

          {/* Middle Column - Order Book (Real-time via WebSocket) */}
          <div className="lg:col-span-3">
            <TradingOrderBook marketId={marketId} />
          </div>

          {/* Right Column - Trading Form & User Data */}
          <div className="space-y-6 lg:col-span-4">
            <TradingForm
              marketId={market.marketId}
              auctionId={market.auctionId}
              auctionTitle={market.title}
              predictedPrice={market.predictedPrice}
              onSubmit={handleOrderSubmit}
            />
            <UserOpenOrders orders={userOrders} onCancelOrder={handleCancelOrder} />
            <UserPositions positions={userPositions} />
          </div>
        </div>
      </div>
    </div>
  );
}
