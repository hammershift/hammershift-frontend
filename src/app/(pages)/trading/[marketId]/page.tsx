'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  TradingForm,
  MarketCard,
  PriceChart,
  RecentTrades,
  UserOpenOrders,
  UserPositions,
  TradingOrderBook,
} from '@/app/components/trading';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MarketData {
  _id: string;
  auctionId: string;
  question: string;
  status: 'PENDING' | 'ACTIVE' | 'RESOLVED';
  yesPrice: number;
  noPrice: number;
  totalVolume: number;
  totalLiquidity: number;
  predictedPrice: number;
  winningOutcome: 'YES' | 'NO' | null;
  resolvedAt: string | null;
  createdAt: string;
  auction: {
    title: string | null;
    image: string | null;
    deadline: string | null;
  };
}

// Shape returned by GET /api/orders — matches polygon_orders DB doc
interface Order {
  _id: string;
  side: 'BUY' | 'SELL';
  outcome: 'YES' | 'NO';
  price: number;
  // DB stores quantity submitted as `size`; `quantity` alias kept for safety
  size?: number;
  quantity?: number;
  remainingSize: number;
  filledQuantity?: number;
  status: 'OPEN' | 'FILLED' | 'CANCELLED';
  userId: string;
  createdAt: string;
  marketId: string;
}

// Resolve effective total size from an order
function orderSize(o: Order): number {
  return o.size ?? o.quantity ?? 0;
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function TradingPage() {
  const params = useParams();
  const marketId = params.marketId as string;
  const { data: session } = useSession();

  const [market, setMarket] = useState<MarketData | null>(null);
  const [recentTrades, setRecentTrades] = useState<Order[]>([]);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  // Positions store raw filled orders; we derive Position props at render time
  const [filledOrders, setFilledOrders] = useState<Order[]>([]);
  const [priceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [marketNotFound, setMarketNotFound] = useState(false);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState<'YES' | 'NO'>('YES');

  // Derive userId from session — server stores it as _id, client type declares id.
  const userId: string | undefined =
    ((session?.user as any)?._id as string | undefined) ??
    (session?.user?.id as string | undefined);

  // -------------------------------------------------------------------------
  // Fetch market data
  // -------------------------------------------------------------------------
  const fetchMarketData = useCallback(async () => {
    try {
      const res = await fetch(`/api/polygon-markets/${marketId}`);
      if (res.status === 404) {
        setMarketNotFound(true);
        return;
      }
      if (!res.ok) {
        console.error('fetchMarketData: unexpected status', res.status);
        return;
      }
      const data: MarketData = await res.json();
      setMarket(data);
    } catch (error) {
      console.error('fetchMarketData error:', error);
    }
  }, [marketId]);

  // -------------------------------------------------------------------------
  // Fetch user open orders
  // -------------------------------------------------------------------------
  const fetchUserOrders = useCallback(async () => {
    if (!session || !userId) return;
    try {
      const res = await fetch(
        `/api/orders?marketId=${encodeURIComponent(marketId)}&userId=${encodeURIComponent(userId)}`
      );
      if (!res.ok) {
        console.error('fetchUserOrders: unexpected status', res.status);
        return;
      }
      const data: Order[] = await res.json();
      // Show only OPEN orders in the user orders panel
      setUserOrders(data.filter((o) => o.status === 'OPEN'));
    } catch (error) {
      console.error('fetchUserOrders error:', error);
    }
  }, [marketId, session, userId]);

  // -------------------------------------------------------------------------
  // Fetch user positions (FILLED orders grouped by outcome)
  // -------------------------------------------------------------------------
  const fetchUserPositions = useCallback(async () => {
    if (!session || !userId) return;
    try {
      const res = await fetch(
        `/api/orders?marketId=${encodeURIComponent(marketId)}&userId=${encodeURIComponent(userId)}&status=FILLED`
      );
      if (!res.ok) {
        console.error('fetchUserPositions: unexpected status', res.status);
        return;
      }
      const data: Order[] = await res.json();
      setFilledOrders(data);
    } catch (error) {
      console.error('fetchUserPositions error:', error);
    }
  }, [marketId, session, userId]);

  // -------------------------------------------------------------------------
  // Fetch recent trades (all FILLED orders for market, most recent 20)
  // -------------------------------------------------------------------------
  const fetchRecentTrades = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/orders?marketId=${encodeURIComponent(marketId)}&status=FILLED`
      );
      if (!res.ok) {
        console.error('fetchRecentTrades: unexpected status', res.status);
        return;
      }
      const data: Order[] = await res.json();
      // API already returns sorted desc by createdAt — take first 20
      setRecentTrades(data.slice(0, 20));
    } catch (error) {
      console.error('fetchRecentTrades error:', error);
    }
  }, [marketId]);

  // -------------------------------------------------------------------------
  // Initial data load
  // -------------------------------------------------------------------------
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchMarketData();
      await Promise.all([
        fetchUserOrders(),
        fetchUserPositions(),
        fetchRecentTrades(),
      ]);
      setLoading(false);
    };

    loadData();
  }, [fetchMarketData, fetchUserOrders, fetchUserPositions, fetchRecentTrades]);

  // -------------------------------------------------------------------------
  // Auto-refresh market data every 15 seconds
  // -------------------------------------------------------------------------
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMarketData();
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchMarketData]);

  // -------------------------------------------------------------------------
  // Poll recent trades every 5 seconds (order book is real-time via WebSocket)
  // -------------------------------------------------------------------------
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRecentTrades();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchRecentTrades]);

  // -------------------------------------------------------------------------
  // Handle order submission
  // -------------------------------------------------------------------------
  const handleOrderSubmit = async (order: {
    side: 'BUY' | 'SELL';
    outcome: 'YES' | 'NO';
    price: number;
    size: number;
    orderType: 'LIMIT' | 'MARKET';
  }) => {
    if (!session) return;

    setOrderSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          marketId,
          side: order.side,
          outcome: order.outcome,
          price: order.price,
          quantity: order.size,
        }),
      });

      if (res.status === 401) {
        alert('You must be signed in to trade.');
        return;
      }
      if (res.status === 400 || res.status === 422) {
        const body = await res.json();
        alert(`Order rejected: ${body.message ?? 'Validation error'}`);
        return;
      }
      if (!res.ok) {
        alert('Failed to place order. Please try again.');
        return;
      }

      // Success — refresh user orders and market data
      await Promise.all([fetchUserOrders(), fetchMarketData()]);
    } catch (error) {
      console.error('handleOrderSubmit error:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setOrderSubmitting(false);
    }
  };

  // -------------------------------------------------------------------------
  // Handle order cancellation
  // -------------------------------------------------------------------------
  const handleCancelOrder = async (orderId: string) => {
    try {
      console.log('Cancel order:', orderId);
      // Refresh user orders after cancellation attempt
      await fetchUserOrders();
    } catch (error) {
      console.error('handleCancelOrder error:', error);
    }
  };

  // -------------------------------------------------------------------------
  // Derived MarketCard props — map API shape to component props
  // -------------------------------------------------------------------------
  const marketCardProps = market
    ? {
        marketId: String(market._id),
        auctionId: market.auctionId ?? String(market._id),
        title: market.auction?.title ?? market.question ?? 'Unknown Market',
        imageUrl: market.auction?.image ?? undefined,
        predictedPrice: market.predictedPrice ?? 0,
        volume: market.totalVolume ?? 0,
        liquidity: market.totalLiquidity ?? 0,
        yesProbability: market.yesPrice ?? 0.5,
        status: market.status,
        winningOutcome: market.winningOutcome ?? undefined,
        endsAt: market.auction?.deadline
          ? new Date(market.auction.deadline)
          : undefined,
      }
    : null;

  // -------------------------------------------------------------------------
  // Adapt raw API data to child component prop shapes
  // (component interfaces are not modified per constraint)
  // -------------------------------------------------------------------------

  // RecentTrades expects: { id, price, size, side, outcome, timestamp: Date }
  const adaptedTrades = recentTrades.map((o) => ({
    id: String(o._id),
    price: o.price,
    size: orderSize(o),
    side: o.side,
    outcome: o.outcome,
    timestamp: new Date(o.createdAt),
  }));

  // UserOpenOrders expects: { id, marketId, side, outcome, price, size, remainingSize, status: 'OPEN'|'PARTIAL', createdAt: Date }
  const adaptedUserOrders = userOrders.map((o) => ({
    id: String(o._id),
    marketId: o.marketId,
    side: o.side,
    outcome: o.outcome,
    price: o.price,
    size: orderSize(o),
    remainingSize: o.remainingSize,
    // API status is 'OPEN'|'FILLED'|'CANCELLED'; component only handles 'OPEN'|'PARTIAL'
    status: 'OPEN' as const,
    createdAt: new Date(o.createdAt),
  }));

  // UserPositions expects: { id, marketId, outcome, shares, avgPrice, currentPrice }
  // Group filled orders by outcome, compute weighted avg price, use live market price as current.
  const currentYesPrice = market?.yesPrice ?? 0.5;
  const currentNoPrice = market?.noPrice ?? 0.5;

  const positionMap: Record<
    'YES' | 'NO',
    { totalShares: number; totalCost: number }
  > = {
    YES: { totalShares: 0, totalCost: 0 },
    NO: { totalShares: 0, totalCost: 0 },
  };
  for (const o of filledOrders) {
    const shares = orderSize(o);
    if (o.outcome === 'YES') {
      positionMap.YES.totalShares += shares;
      positionMap.YES.totalCost += shares * o.price;
    } else if (o.outcome === 'NO') {
      positionMap.NO.totalShares += shares;
      positionMap.NO.totalCost += shares * o.price;
    }
  }

  const adaptedPositions = (
    ['YES', 'NO'] as const
  )
    .filter((outcome) => positionMap[outcome].totalShares > 0)
    .map((outcome) => {
      const { totalShares, totalCost } = positionMap[outcome];
      const avgPrice = totalShares > 0 ? totalCost / totalShares : 0;
      const currentPrice = outcome === 'YES' ? currentYesPrice : currentNoPrice;
      return {
        id: `${marketId}-${outcome}`,
        marketId,
        outcome,
        shares: totalShares,
        avgPrice,
        currentPrice,
      };
    });

  // -------------------------------------------------------------------------
  // Loading state
  // -------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-trading-bg-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-700 border-t-[#00D4AA]" />
          <p className="text-sm text-gray-400">Loading market data...</p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // 404 state
  // -------------------------------------------------------------------------
  if (marketNotFound || !market || !marketCardProps) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-trading-bg-primary">
        <div className="text-center">
          <p className="text-lg font-semibold text-white">Market not found</p>
          <p className="mt-2 text-sm text-gray-400">
            The market you are looking for does not exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Resolved at formatted date
  // -------------------------------------------------------------------------
  const resolvedAtFormatted = market.resolvedAt
    ? new Date(market.resolvedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="min-h-screen bg-trading-bg-primary p-4 md:p-6">
      <div className="mx-auto max-w-[1600px]">

        {/* Status Banners */}
        {market.status === 'RESOLVED' && (
          <div className="mb-4 rounded-xl border border-[#00D4AA]/30 bg-[#00D4AA]/10 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-[#00D4AA]">
                Market Resolved — Winner:{' '}
                <span className="font-bold">{market.winningOutcome ?? '—'}</span>
              </p>
              {resolvedAtFormatted && (
                <p className="text-sm text-[#00D4AA]/70">
                  Resolved at: {resolvedAtFormatted}
                </p>
              )}
            </div>
          </div>
        )}

        {market.status === 'PENDING' && (
          <div className="mb-4 rounded-xl border border-[#FFB547]/30 bg-[#FFB547]/10 p-4">
            <p className="font-semibold text-[#FFB547]">
              Market not yet active — trading opens soon
            </p>
          </div>
        )}

        {/* Market Header */}
        <div className="mb-6">
          <MarketCard {...marketCardProps} className="w-full" />
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
            <RecentTrades trades={adaptedTrades} />
          </div>

          {/* Middle Column - Order Book (Real-time via WebSocket) */}
          <div className="lg:col-span-3">
            <TradingOrderBook marketId={marketId} />
          </div>

          {/* Right Column - Trading Form & User Data */}
          <div className="space-y-6 lg:col-span-4">
            {session ? (
              <TradingForm
                marketId={String(market._id)}
                auctionId={market.auctionId ?? String(market._id)}
                auctionTitle={
                  market.auction?.title ?? market.question ?? 'Unknown Market'
                }
                predictedPrice={market.predictedPrice ?? 0}
                onSubmit={handleOrderSubmit}
                loading={orderSubmitting}
              />
            ) : (
              <div className="flex w-full items-center justify-center rounded-lg border border-gray-700 bg-trading-bg-card p-8">
                <p className="text-center text-sm text-gray-400">
                  <span className="mb-2 block font-semibold text-white">
                    Sign in to trade
                  </span>
                  You must be signed in to place orders on this market.
                </p>
              </div>
            )}
            <UserOpenOrders orders={adaptedUserOrders} onCancelOrder={handleCancelOrder} />
            <UserPositions positions={adaptedPositions} />
          </div>
        </div>
      </div>
    </div>
  );
}
