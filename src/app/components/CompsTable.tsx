"use client";

import { useEffect, useState } from "react";

interface Comp {
  _id: string;
  title: string;
  sort?: { price: number; deadline: string };
  attributes?: Array<{ key: string; value: any }>;
}

interface CompsTableProps {
  auctionId: string;
  currentBid?: number;
}

const USDollar = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function CompsTable({ auctionId, currentBid }: CompsTableProps) {
  const [comps, setComps] = useState<Comp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/auctions/${auctionId}/comps`)
      .then((r) => r.json())
      .then((data) => setComps(data.comps ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [auctionId]);

  if (loading) {
    return <p className="text-gray-500 text-sm animate-pulse">Loading comparable sales&hellip;</p>;
  }
  if (!comps.length) {
    return <p className="text-gray-500 text-sm">No comparable sales found.</p>;
  }

  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
        Recent Sales
      </h4>
      <div className="space-y-2">
        {comps.map((comp) => {
          const price = comp.sort?.price ?? 0;
          const diff =
            currentBid && currentBid > 0 && price > 0
              ? Math.round(((price - currentBid) / currentBid) * 100)
              : null;
          return (
            <div
              key={comp._id}
              className="flex items-center justify-between text-sm py-2 border-b border-[#1E2A36] last:border-0"
            >
              <span className="text-gray-300 truncate mr-3 text-xs">{comp.title}</span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-white text-xs">
                  {USDollar.format(price)}
                </span>
                {diff !== null && (
                  <span
                    className={`font-mono text-xs font-medium ${
                      diff >= 0 ? "text-[#00D4AA]" : "text-[#E94560]"
                    }`}
                  >
                    {diff >= 0 ? "+" : ""}
                    {diff}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
