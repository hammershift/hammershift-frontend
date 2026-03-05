'use client';

import { useState } from 'react';
import { TradingForm, OrderBook, MarketCard, TradeSummary } from './index';

// Mock data for demonstration
const mockOrders = [
  {
    id: '1',
    price: 0.55,
    size: 100,
    remainingSize: 100,
    side: 'BUY' as const,
    outcome: 'YES' as const,
    timestamp: new Date(),
  },
  {
    id: '2',
    price: 0.54,
    size: 200,
    remainingSize: 150,
    side: 'BUY' as const,
    outcome: 'YES' as const,
    timestamp: new Date(),
  },
  {
    id: '3',
    price: 0.53,
    size: 300,
    remainingSize: 300,
    side: 'BUY' as const,
    outcome: 'YES' as const,
    timestamp: new Date(),
  },
  {
    id: '4',
    price: 0.58,
    size: 150,
    remainingSize: 150,
    side: 'SELL' as const,
    outcome: 'YES' as const,
    timestamp: new Date(),
  },
  {
    id: '5',
    price: 0.59,
    size: 250,
    remainingSize: 200,
    side: 'SELL' as const,
    outcome: 'YES' as const,
    timestamp: new Date(),
  },
];

const mockMarkets = [
  {
    marketId: 'market-1',
    auctionId: 'auction-1',
    title: '1967 Porsche 911 S',
    imageUrl: 'https://bringatrailer.com/wp-content/uploads/2023/01/1967_porsche_911_s_16739748851cf5c36e1967_porsche_911_s_1673974885f6e9c7IMG_4657-scaled.jpg',
    predictedPrice: 125000,
    volume: 45200,
    liquidity: 12800,
    yesProbability: 0.62,
    status: 'ACTIVE' as const,
    endsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
  },
  {
    marketId: 'market-2',
    auctionId: 'auction-2',
    title: '1993 Toyota Supra Turbo',
    predictedPrice: 95000,
    volume: 32100,
    liquidity: 8900,
    yesProbability: 0.48,
    status: 'ACTIVE' as const,
    endsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
  },
  {
    marketId: 'market-3',
    auctionId: 'auction-3',
    title: '2023 Ford Bronco Raptor',
    predictedPrice: 72000,
    volume: 28500,
    liquidity: 9200,
    yesProbability: 0.71,
    status: 'RESOLVED' as const,
    winningOutcome: 'YES' as const,
  },
];

export function TradingDemo() {
  const [selectedTab, setSelectedTab] = useState<'form' | 'orderbook' | 'summary' | 'cards'>('form');

  const handleOrderSubmit = (order: any) => {
    console.log('Order submitted:', order);
    alert(`Order submitted: ${order.side} ${order.size} shares of ${order.outcome} at $${order.price}`);
  };

  return (
    <div className="min-h-screen bg-trading-bg-primary p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-white">
            Polymarket-Style Trading Components
          </h1>
          <p className="text-gray-400">
            Dark mode trading interface with teal/red color scheme
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 flex gap-2 border-b border-gray-700">
          <button
            onClick={() => setSelectedTab('form')}
            className={`px-4 py-2 font-semibold transition-colors ${
              selectedTab === 'form'
                ? 'border-b-2 border-trading-yes text-trading-yes'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Trading Form
          </button>
          <button
            onClick={() => setSelectedTab('orderbook')}
            className={`px-4 py-2 font-semibold transition-colors ${
              selectedTab === 'orderbook'
                ? 'border-b-2 border-trading-yes text-trading-yes'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Order Book
          </button>
          <button
            onClick={() => setSelectedTab('summary')}
            className={`px-4 py-2 font-semibold transition-colors ${
              selectedTab === 'summary'
                ? 'border-b-2 border-trading-yes text-trading-yes'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Trade Summary
          </button>
          <button
            onClick={() => setSelectedTab('cards')}
            className={`px-4 py-2 font-semibold transition-colors ${
              selectedTab === 'cards'
                ? 'border-b-2 border-trading-yes text-trading-yes'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Market Cards
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {selectedTab === 'form' && (
            <div className="max-w-md">
              <TradingForm
                marketId="market-1"
                auctionId="auction-1"
                auctionTitle="1967 Porsche 911 S"
                predictedPrice={125000}
                onSubmit={handleOrderSubmit}
              />
            </div>
          )}

          {selectedTab === 'orderbook' && (
            <div className="grid gap-6 lg:grid-cols-2">
              <OrderBook orders={mockOrders} outcome="YES" />
              <OrderBook orders={mockOrders} outcome="NO" />
            </div>
          )}

          {selectedTab === 'summary' && (
            <div className="grid gap-6 lg:grid-cols-2">
              <TradeSummary
                side="BUY"
                outcome="YES"
                price={0.55}
                size={100}
              />
              <TradeSummary
                side="SELL"
                outcome="NO"
                price={0.42}
                size={200}
                showPotentialReturn={false}
              />
            </div>
          )}

          {selectedTab === 'cards' && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mockMarkets.map((market) => (
                <MarketCard key={market.marketId} {...market} />
              ))}
            </div>
          )}
        </div>

        {/* Design Tokens Reference */}
        <div className="mt-12 rounded-lg border border-gray-700 bg-trading-bg-card p-6">
          <h2 className="mb-4 text-xl font-bold text-white">Design Tokens</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <h3 className="mb-2 font-semibold text-gray-300">Colors</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-trading-yes" />
                  <span className="text-gray-400">YES: #14B8A6</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-trading-no" />
                  <span className="text-gray-400">NO: #EF4444</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-trading-bg-primary" />
                  <span className="text-gray-400">BG Primary: #0A0A1A</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-trading-bg-secondary" />
                  <span className="text-gray-400">BG Secondary: #1A1B2E</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-trading-bg-card border border-gray-700" />
                  <span className="text-gray-400">Card: #252739</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-gray-300">Typography</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <div>Prices: JetBrains Mono</div>
                <div>Headings: System Default (bold)</div>
                <div>Body: System Default</div>
              </div>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-gray-300">Fees</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <div>Taker Fee: 2%</div>
                <div>Maker Fee: 0% (or rebate)</div>
                <div>Always shown before trade</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
