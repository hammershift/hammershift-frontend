'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ComparableSale {
  title: string;
  year: number | null;
  make: string;
  model: string;
  salePrice: number;
  saleDate: string | null;
  bidCount: number;
  commentCount: number;
  mileage: number | null;
  imageUrl: string | null;
  batUrl: string | null;
}

interface ComparableStats {
  count: number;
  median: number;
  p25: number;
  p75: number;
  min: number;
  max: number;
}

interface ComparableSalesProps {
  make: string | null;
  model: string | null;
}

export function ComparableSales({ make, model }: ComparableSalesProps) {
  const [open, setOpen] = useState(false);
  const [comparables, setComparables] = useState<ComparableSale[]>([]);
  const [stats, setStats] = useState<ComparableStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!open || fetched || !make || !model) return;

    setLoading(true);
    fetch(`/api/markets/comparables?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&limit=10`)
      .then((res) => res.json())
      .then((data) => {
        setComparables(data.comparables ?? []);
        setStats(data.stats ?? null);
        setFetched(true);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, fetched, make, model]);

  if (!make || !model) return null;

  return (
    <div className="rounded-lg border border-gray-700 bg-trading-bg-card overflow-hidden">
      {/* Toggle header */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full p-4 text-sm text-gray-400 hover:text-gray-300 transition-colors"
      >
        <span className="font-semibold text-white">Comparable Sales</span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {open && (
        <div className="border-t border-gray-700 p-4 space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-6">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-600 border-t-white" />
            </div>
          )}

          {!loading && comparables.length === 0 && (
            <p className="text-center text-xs text-gray-500 py-4">
              No comparable sales found for {make} {model}.
            </p>
          )}

          {!loading && stats && stats.count > 0 && (
            <>
              {/* Stats summary */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg bg-[#0A0A1A] p-3">
                  <p className="text-xs text-gray-500">Median</p>
                  <p className="text-sm font-mono font-semibold text-white">
                    ${stats.median.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg bg-[#0A0A1A] p-3">
                  <p className="text-xs text-gray-500">Range</p>
                  <p className="text-sm font-mono font-semibold text-white">
                    ${stats.min.toLocaleString()} – ${stats.max.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg bg-[#0A0A1A] p-3">
                  <p className="text-xs text-gray-500">Sales</p>
                  <p className="text-sm font-mono font-semibold text-white">
                    {stats.count}
                  </p>
                </div>
              </div>

              {/* Sales list */}
              <div className="space-y-2">
                {comparables.map((c, i) => {
                  const date = c.saleDate
                    ? new Date(c.saleDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
                    : '';
                  const miles = c.mileage
                    ? `${(c.mileage / 1000).toFixed(0)}k mi`
                    : '';

                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-lg border border-white/[0.05] bg-[#0A0A1A] p-3"
                    >
                      {/* Thumbnail */}
                      {c.imageUrl && (
                        <img
                          src={c.imageUrl}
                          alt={c.title}
                          className="h-12 w-16 shrink-0 rounded-md object-cover"
                        />
                      )}

                      {/* Details */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-white">
                          {c.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {[date, miles, `${c.bidCount} bids`].filter(Boolean).join(' · ')}
                        </p>
                      </div>

                      {/* Price */}
                      <p className="shrink-0 text-sm font-mono font-semibold text-[#00D4AA]">
                        ${c.salePrice.toLocaleString()}
                      </p>
                    </div>
                  );
                })}
              </div>

              <p className="text-center text-xs text-gray-600">
                Based on BaT auction results
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
