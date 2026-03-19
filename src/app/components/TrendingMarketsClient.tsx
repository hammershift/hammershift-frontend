'use client';

import { useState, useMemo } from 'react';
import TradingDrawer from './trading/TradingDrawer';
import CountdownInline from './CountdownInline';
import CategoryFilterBar from './CategoryFilterBar';
import MarketSortDropdown from './MarketSortDropdown';
import Sparkline from './Sparkline';
import LiveBadge from './LiveBadge';
import BookmarkButton from './BookmarkButton';

// Shape expected by TradingDrawer
interface DrawerMarket {
  _id: string;
  contractAddress?: string;
  question: string;
  yesPrice: number;
  noPrice: number;
  predictedPrice: number;
  auction: { title: string | null; image: string | null };
}

// Extended shape we receive from the API (may include deadline)
interface TrendingMarket extends DrawerMarket {
  auctionId?: string;
  totalVolume?: number;
  priceChange?: number | null; // percentage points change in last 24h
  sparkData?: number[];        // last 20 yesPrice values for sparkline
  auction: {
    title: string | null;
    image: string | null;
    deadline?: string | null;
  };
}

function formatVolume(cents: number): string {
  const dollars = cents / 100;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`;
  if (dollars >= 1_000) return `$${(dollars / 1_000).toFixed(1)}K`;
  if (dollars > 0) return `$${dollars.toFixed(0)}`;
  return "$0";
}

interface Props {
  markets: TrendingMarket[];
}

export default function TrendingMarketsClient({ markets }: Props) {
  const [selectedMarket, setSelectedMarket] = useState<DrawerMarket | null>(null);
  const [selectedSide, setSelectedSide] = useState<'YES' | 'NO'>('YES');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('trending');

  const filteredMarkets = useMemo(() => {
    if (activeCategory === 'all' || activeCategory === 'trending') return markets;
    if (activeCategory === 'ending_soon') {
      return [...markets].sort((a, b) => {
        const da = a.auction?.deadline ? new Date(a.auction.deadline).getTime() : Infinity;
        const db = b.auction?.deadline ? new Date(b.auction.deadline).getTime() : Infinity;
        return da - db;
      });
    }
    if (activeCategory === 'new') {
      return [...markets].reverse();
    }
    // Make-based filters
    const makeMap: Record<string, RegExp> = {
      ferrari: /ferrari/i,
      porsche: /porsche/i,
      mercedes: /mercedes|benz/i,
      bmw: /bmw/i,
      american_muscle: /mustang|camaro|corvette|challenger|charger/i,
      jdm: /toyota|nissan|honda|mazda|subaru|mitsubishi|datsun/i,
      classic: /\b(19[3-7]\d)\b/i,
    };
    if (makeMap[activeCategory]) {
      return markets.filter((m) => makeMap[activeCategory].test(m.auction?.title ?? ''));
    }
    // Price-based filters
    if (activeCategory === 'under_25k') {
      return markets.filter((m) => (m.predictedPrice ?? 0) < 25000);
    }
    if (activeCategory === 'over_100k') {
      return markets.filter((m) => (m.predictedPrice ?? 0) >= 100000);
    }
    return markets;
  }, [markets, activeCategory]);

  const sortedMarkets = useMemo(() => {
    let result = [...filteredMarkets];
    switch (sortBy) {
      case 'ending_soon':
        result.sort((a, b) => {
          const da = a.auction?.deadline ? new Date(a.auction.deadline).getTime() : Infinity;
          const db = b.auction?.deadline ? new Date(b.auction.deadline).getTime() : Infinity;
          return da - db;
        });
        break;
      case 'newest':
        result.reverse();
        break;
      case 'volume':
        result.sort((a, b) => (b.totalVolume ?? 0) - (a.totalVolume ?? 0));
        break;
      case 'contested':
        result.sort((a, b) => {
          const aDist = Math.abs((a.yesPrice ?? 0.5) - 0.5);
          const bDist = Math.abs((b.yesPrice ?? 0.5) - 0.5);
          return aDist - bDist;
        });
        break;
      // 'trending' is default order from API
    }
    return result;
  }, [filteredMarkets, sortBy]);

  function handleTrade(market: TrendingMarket, outcome: 'YES' | 'NO') {
    // Open the drawer regardless of auth — the drawer handles login gating
    // Map to the DrawerMarket shape TradingDrawer expects
    const drawerMarket: DrawerMarket = {
      _id: market._id,
      contractAddress: market.contractAddress,
      question: market.question,
      yesPrice: market.yesPrice ?? 0.5,
      noPrice: market.noPrice ?? 0.5,
      predictedPrice: market.predictedPrice ?? 0,
      auction: {
        title: market.auction?.title ?? null,
        image: market.auction?.image ?? null,
      },
    };
    setSelectedMarket(drawerMarket);
    setSelectedSide(outcome);
    setDrawerOpen(true);
  }

  if (!markets.length) {
    return (
      <div className="text-center py-12 text-gray-500 text-sm">
        No active markets yet — check back soon.
      </div>
    );
  }

  return (
    <>
      <CategoryFilterBar
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>{sortedMarkets.length} market{sortedMarkets.length !== 1 ? 's' : ''}</span>
        </div>
        <MarketSortDropdown value={sortBy} onChange={setSortBy} />
      </div>

      {sortedMarkets.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-sm">
          No markets match this filter.
        </div>
      ) : (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sortedMarkets.map((market) => (
          <div
            key={market._id}
            className="rounded-xl overflow-hidden border border-white/[0.08] bg-[#16181f] flex flex-col transition-all duration-150 hover:brightness-105 hover:border-white/[0.15]"
          >
            {market.auction?.image && (
              <div className="relative aspect-video w-full bg-gray-900">
                <img
                  src={market.auction.image}
                  alt={market.auction.title ?? ''}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#16181f] via-transparent to-transparent" />
                {market.auction?.deadline && new Date(market.auction.deadline) > new Date() && (
                  <div className="absolute top-2 left-2 z-10">
                    <LiveBadge />
                  </div>
                )}
                <div className="absolute top-2 right-2 z-10">
                  <BookmarkButton marketId={market._id} />
                </div>
              </div>
            )}
            <div className="flex flex-col flex-1 p-4 gap-3">
              <p className="text-sm font-medium text-white leading-snug line-clamp-2">
                {market.auction?.title ?? market.question}
              </p>
              <p className="text-xs text-gray-500 line-clamp-2">{market.question}</p>
              {market.auction?.deadline && (
                <p className="text-xs font-mono text-[#FFB547]">
                  <CountdownInline deadline={market.auction.deadline} />
                </p>
              )}
              {/* Probability + Delta */}
              {(() => {
                const yesPercent = Math.round((market.yesPrice ?? 0.5) * 100);
                return (
                  <div className="flex items-baseline gap-2">
                    <span className={`text-lg font-bold font-mono ${yesPercent > 60 ? "text-[#16c784]" : yesPercent < 40 ? "text-[#f44b5a]" : "text-gray-300"}`}>
                      {yesPercent}% chance
                    </span>
                    {market.priceChange != null && market.priceChange !== 0 && (
                      <span className={`text-xs font-mono ${market.priceChange > 0 ? "text-[#16c784]" : "text-[#f44b5a]"}`}>
                        {market.priceChange > 0 ? "\u25B2" : "\u25BC"}{Math.abs(market.priceChange)}%
                      </span>
                    )}
                  </div>
                );
              })()}
              {market.sparkData && market.sparkData.length >= 2 && (
                <Sparkline data={market.sparkData} width={100} height={24} />
              )}

              <div className="flex gap-2 mt-auto">
                <button
                  onClick={() => handleTrade(market, 'YES')}
                  className="flex-1 rounded-lg bg-[#00D4AA]/10 border border-[#00D4AA]/30 py-2 text-sm font-mono font-semibold text-[#00D4AA] hover:bg-[#00D4AA]/20 transition-colors"
                >
                  YES {Math.round((market.yesPrice ?? 0.5) * 100)}&cent;
                </button>
                <button
                  onClick={() => handleTrade(market, 'NO')}
                  className="flex-1 rounded-lg bg-[#E94560]/10 border border-[#E94560]/30 py-2 text-sm font-mono font-semibold text-[#E94560] hover:bg-[#E94560]/20 transition-colors"
                >
                  NO {Math.round((market.noPrice ?? 0.5) * 100)}&cent;
                </button>
              </div>
              {(market.totalVolume ?? 0) > 0 && (
                <div className="text-xs text-gray-500 font-mono mt-1">
                  {formatVolume(market.totalVolume ?? 0)} Vol.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      )}

      <TradingDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        market={selectedMarket}
        initialSide={selectedSide}
      />
    </>
  );
}
