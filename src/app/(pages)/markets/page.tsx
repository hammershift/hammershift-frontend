'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BarChart2, TrendingUp, Activity, CheckCircle2, Clock } from 'lucide-react';
import CountdownInline from '@/app/components/CountdownInline';
import BaTLogo from '@/app/components/icons/BaTLogo';
import MarketSparkline from '@/app/components/trading/MarketSparkline';

// ─── Types ───────────────────────────────────────────────────────────────────

type MarketStatus = 'ACTIVE' | 'RESOLVED' | 'PENDING' | 'DISPUTED';
type FilterTab = 'ALL' | 'ACTIVE' | 'RESOLVED' | 'PENDING';

interface MarketAuction {
  title: string | null;
  image: string | null;
  deadline: string | null;
}

interface Market {
  _id: string;
  auctionId: string;
  question: string;
  status: MarketStatus;
  yesPrice: number;
  noPrice: number;
  totalVolume: number;
  totalLiquidity: number;
  predictedPrice: number;
  winningOutcome: 'YES' | 'NO' | null;
  resolvedAt: string | null;
  createdAt: string;
  currentBid: number | null;
  auction: MarketAuction;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatVolume(cents: number): string {
  const dollars = cents / 100;
  if (dollars >= 1_000_000) return `${(dollars / 1_000_000).toFixed(1)}M`;
  if (dollars >= 1_000) return `${(dollars / 1_000).toFixed(1)}K`;
  return dollars.toFixed(0);
}

function computeStats(markets: Market[]) {
  const totalVolumeCents = markets.reduce((sum, m) => sum + (m.totalVolume ?? 0), 0);
  const activeCount = markets.filter((m) => m.status === 'ACTIVE').length;
  return {
    total: markets.length,
    volumeFormatted: formatVolume(totalVolumeCents),
    activeCount,
  };
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden border border-[#1E2A36] bg-[#13202D] animate-pulse">
      {/* Image placeholder */}
      <div className="aspect-video bg-[#1A2C3D]" />
      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Question lines */}
        <div className="h-4 bg-[#1A2C3D] rounded w-full" />
        <div className="h-4 bg-[#1A2C3D] rounded w-3/4" />
        {/* Price bar */}
        <div className="h-10 bg-[#1A2C3D] rounded-lg" />
        {/* Bottom row */}
        <div className="flex justify-between items-center">
          <div className="h-3 bg-[#1A2C3D] rounded w-20" />
          <div className="h-7 bg-[#1A2C3D] rounded-lg w-16" />
        </div>
      </div>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: MarketStatus }) {
  if (status === 'ACTIVE') {
    return (
      <span className="inline-flex items-center gap-1.5 bg-[#0E1923]/80 backdrop-blur-sm text-[#00D4AA] text-xs px-2 py-1 rounded-full border border-[#00D4AA]/30">
        <span className="w-1.5 h-1.5 rounded-full bg-[#00D4AA] animate-pulse" />
        LIVE
      </span>
    );
  }
  if (status === 'RESOLVED') {
    return (
      <span className="inline-flex items-center gap-1 bg-gray-800/80 backdrop-blur-sm text-gray-400 text-xs px-2 py-1 rounded-full">
        <CheckCircle2 className="w-3 h-3" />
        RESOLVED
      </span>
    );
  }
  if (status === 'PENDING') {
    return (
      <span className="inline-flex items-center gap-1 bg-[#FFB547]/20 backdrop-blur-sm text-[#FFB547] text-xs px-2 py-1 rounded-full border border-[#FFB547]/30">
        <Clock className="w-3 h-3" />
        PENDING
      </span>
    );
  }
  // DISPUTED or unknown
  return (
    <span className="inline-flex items-center gap-1 bg-[#E94560]/20 backdrop-blur-sm text-[#E94560] text-xs px-2 py-1 rounded-full border border-[#E94560]/30">
      DISPUTED
    </span>
  );
}

// ─── Market Card ──────────────────────────────────────────────────────────────

function MarketCard({ market }: { market: Market }) {
  const yesPercent = Math.round((market.yesPrice ?? 0.5) * 100);
  const noPercent = 100 - yesPercent;
  const yesCents = Math.round((market.yesPrice ?? 0.5) * 100);
  const noCents = Math.round((market.noPrice ?? 0.5) * 100);

  return (
    <div className="relative bg-[#1E293B] border border-white/5 rounded-xl overflow-hidden flex flex-col hover:border-white/20 transition-colors">
      {/* Auction house logo + status badge */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <BaTLogo />
        <StatusBadge status={market.status} />
      </div>

      {/* Car image */}
      {market.auction?.image && (
        <div className="relative w-full h-36 bg-slate-900">
          <Image
            src={market.auction.image}
            alt={market.auction.title ?? 'Auction'}
            fill
            className="object-cover opacity-80"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B] via-transparent to-transparent" />
        </div>
      )}

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Title */}
        <p className="text-sm font-medium text-[#F8FAFC] line-clamp-2 leading-snug">
          {market.question}
        </p>

        {/* Sparkline price momentum */}
        <div className="w-full -mx-1">
          <MarketSparkline marketId={market._id.toString()} yesPrice={market.yesPrice ?? 0.5} />
        </div>

        {/* Countdown + real-world bid */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <span className="opacity-50">⏱</span>
            <CountdownInline deadline={market.auction?.deadline ?? null} />
          </div>
          {market.currentBid != null && (
            <span className="font-mono">
              Bid: <span className="text-[#F8FAFC]">${market.currentBid.toLocaleString()}</span>
            </span>
          )}
        </div>

        {/* YES / NO pricing */}
        <div className="grid grid-cols-2 gap-2">
          <Link href={`/trading/${market._id}?side=YES`}>
            <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg p-2.5 text-center hover:bg-[#10B981]/20 transition-colors cursor-pointer">
              <p className="text-[10px] text-[#10B981] font-semibold uppercase tracking-wider mb-0.5">YES</p>
              <p className="font-mono text-sm font-bold text-[#F8FAFC]">
                {yesCents}¢{' '}
                <span className="text-[#10B981] text-xs">({yesPercent}%)</span>
              </p>
            </div>
          </Link>
          <Link href={`/trading/${market._id}?side=NO`}>
            <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg p-2.5 text-center hover:bg-[#EF4444]/20 transition-colors cursor-pointer">
              <p className="text-[10px] text-[#EF4444] font-semibold uppercase tracking-wider mb-0.5">NO</p>
              <p className="font-mono text-sm font-bold text-[#F8FAFC]">
                {noCents}¢{' '}
                <span className="text-[#EF4444] text-xs">({noPercent}%)</span>
              </p>
            </div>
          </Link>
        </div>

        {/* Volume + target */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-white/5">
          <span>Vol: <span className="font-mono text-slate-300">${(market.totalVolume ?? 0).toLocaleString()}</span></span>
          <span>Target: <span className="font-mono text-slate-300">${(market.predictedPrice ?? 0).toLocaleString()}</span></span>
        </div>
      </div>
    </div>
  );
}

// ─── Filter Tab Button ────────────────────────────────────────────────────────

function FilterTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={
        active
          ? 'bg-[#00D4AA] text-black font-semibold rounded-full px-4 py-1.5 text-sm transition-all duration-150 whitespace-nowrap shrink-0 min-h-[44px] touch-manipulation'
          : 'border border-[#1E2A36] text-gray-400 hover:text-white hover:border-[#00D4AA]/30 rounded-full px-4 py-1.5 text-sm transition-all duration-150 whitespace-nowrap shrink-0 min-h-[44px] touch-manipulation'
      }
    >
      {label}
    </button>
  );
}

// ─── Stat Pill ────────────────────────────────────────────────────────────────

function StatPill({
  icon,
  label,
  value,
  valueColor = 'text-white',
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  valueColor?: string;
}) {
  return (
    <div className="flex items-center gap-2 bg-[#13202D] border border-[#1E2A36] rounded-full px-4 py-2">
      <span className="text-gray-500">{icon}</span>
      <span className="text-gray-400 text-sm">{label}</span>
      <span className={`font-['JetBrains_Mono',_monospace] font-bold text-sm ${valueColor}`}>
        {value}
      </span>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ filter }: { filter: FilterTab }) {
  const message =
    filter === 'ALL'
      ? 'No markets yet'
      : `No ${filter.toLowerCase()} markets`;
  const subtitle =
    filter === 'ALL'
      ? 'Markets will appear here once they are created.'
      : 'Try switching to a different filter.';

  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <BarChart2 className="text-gray-600 w-12 h-12 mb-4" />
      <p className="text-gray-400 text-lg font-semibold mb-1">{message}</p>
      <p className="text-gray-600 text-sm">{subtitle}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MarketsPage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>('ALL');

  const fetchMarkets = useCallback(async (activeFilter: FilterTab) => {
    setLoading(true);
    setError(null);
    try {
      const url =
        activeFilter === 'ALL'
          ? '/api/polygon-markets'
          : `/api/polygon-markets?status=${activeFilter}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to load markets (${res.status})`);
      }
      const data: Market[] = await res.json();
      setMarkets(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(message);
      setMarkets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarkets(filter);
  }, [filter, fetchMarkets]);

  const stats = computeStats(markets);

  const TABS: FilterTab[] = ['ALL', 'ACTIVE', 'RESOLVED', 'PENDING'];

  return (
    <div className="min-h-screen bg-[#0E1923]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* ── Header ── */}
        <div className="mb-8">
          <h1 className="text-white text-3xl font-bold mb-2">
            Prediction Markets
          </h1>
          <p className="text-gray-400 text-base mb-6">
            Trade YES or NO on automotive auction outcomes. Prices reflect the crowd&apos;s probability estimate.
          </p>

          {/* Stat pills */}
          {!loading && !error && (
            <div className="flex flex-wrap gap-2">
              <StatPill
                icon={<BarChart2 className="w-4 h-4" />}
                label="Markets"
                value={stats.total}
              />
              <StatPill
                icon={<TrendingUp className="w-4 h-4" />}
                label="Volume"
                value={`$${stats.volumeFormatted}`}
                valueColor="text-[#00D4AA]"
              />
              <StatPill
                icon={<Activity className="w-4 h-4" />}
                label="Active"
                value={stats.activeCount}
                valueColor="text-[#00D4AA]"
              />
            </div>
          )}
        </div>

        {/* ── Filter tabs ── */}
        <div className="flex overflow-x-auto gap-2 mb-6 pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
          {TABS.map((tab) => (
            <FilterTab
              key={tab}
              label={tab.charAt(0) + tab.slice(1).toLowerCase()}
              active={filter === tab}
              onClick={() => setFilter(tab)}
            />
          ))}
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div className="mb-6 rounded-lg border border-[#E94560]/30 bg-[#E94560]/10 px-4 py-3 text-sm text-[#E94560]">
            {error}
          </div>
        )}

        {/* ── Grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : markets.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {markets.map((market) => (
              <MarketCard key={market._id} market={market} />
            ))}
          </div>
        )}

        {/* ── Footer result count ── */}
        {!loading && markets.length > 0 && (
          <p className="mt-8 text-center text-gray-600 text-xs">
            {markets.length} {markets.length === 1 ? 'market' : 'markets'} shown
            {filter !== 'ALL' && ` · filtered by ${filter.toLowerCase()}`}
          </p>
        )}

      </div>
    </div>
  );
}
