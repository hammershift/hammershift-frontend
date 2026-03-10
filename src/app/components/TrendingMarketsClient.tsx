'use client';

import { useState } from 'react';
import TradingDrawer from './trading/TradingDrawer';
import CountdownInline from './CountdownInline';

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
  auction: {
    title: string | null;
    image: string | null;
    deadline?: string | null;
  };
}

interface Props {
  markets: TrendingMarket[];
}

export default function TrendingMarketsClient({ markets }: Props) {
  const [selectedMarket, setSelectedMarket] = useState<DrawerMarket | null>(null);
  const [selectedSide, setSelectedSide] = useState<'YES' | 'NO'>('YES');
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Privy may not be available if env var is unset — handle gracefully
  let login: (() => void) | null = null;
  let authenticated = false;
  try {
    const privy = require('@privy-io/react-auth').usePrivy();
    login = privy.login;
    authenticated = privy.authenticated;
  } catch {
    // Privy not configured
  }

  function handleTrade(market: TrendingMarket, outcome: 'YES' | 'NO') {
    if (!authenticated && login) {
      login();
      return;
    }
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {markets.map((market) => (
          <div
            key={market._id}
            className="rounded-xl overflow-hidden border border-[#1E2A36] bg-[#0F172A] flex flex-col"
          >
            {market.auction?.image && (
              <div className="relative h-40 w-full bg-gray-900">
                <img
                  src={market.auction.image}
                  alt={market.auction.title ?? ''}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent" />
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
            </div>
          </div>
        ))}
      </div>

      <TradingDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        market={selectedMarket}
        initialSide={selectedSide}
      />
    </>
  );
}
