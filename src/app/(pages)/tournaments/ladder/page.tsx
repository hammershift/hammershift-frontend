"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LadderProgress, TIERS, LadderData } from "@/app/components/LadderProgress";
import { useTrackEvent } from "@/hooks/useTrackEvent";

export default function LadderPage() {
  const [ladderData, setLadderData] = useState<LadderData | null>(null);
  const [loading, setLoading] = useState(true);
  const track = useTrackEvent();

  useEffect(() => {
    fetch("/api/tournaments/ladder/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) {
          setLadderData(data);
          track("ladder_page_viewed", { currentTier: data.tier });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-[#0A0A1A] px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href="/tournaments"
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            ← Back to Tournaments
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">Ladder</h1>
        <p className="text-gray-400 mb-8 text-sm">
          Compete in tier qualifiers to climb the ladder and unlock bigger prizes.
        </p>

        <LadderProgress data={ladderData} loading={loading} />

        <div className="mt-8">
          <h2 className="text-lg font-bold text-white mb-4">Tier Breakdown</h2>
          <div className="space-y-2">
            {TIERS.map((tier) => {
              const isCurrentTier = ladderData?.tier === tier.id;
              return (
                <div
                  key={tier.id}
                  className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${
                    isCurrentTier
                      ? "border-[#E94560]/40 bg-[#13202D]"
                      : "border-[#1E2A36] bg-[#13202D]/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: tier.color }}
                    />
                    <span
                      className="font-medium text-sm"
                      style={{ color: isCurrentTier ? tier.color : "white" }}
                    >
                      {tier.label}
                      {isCurrentTier && (
                        <span className="ml-2 text-xs text-gray-400">(current)</span>
                      )}
                    </span>
                  </div>
                  <span className="text-gray-400 text-xs font-mono">
                    {tier.minPoints}+ pts
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 rounded-lg border border-[#1E2A36] bg-[#13202D] p-5">
          <h3 className="text-white font-semibold mb-2">How it works</h3>
          <ul className="text-gray-400 text-sm space-y-2">
            <li>• Earn points by making predictions in tournaments</li>
            <li>• Accurate predictions earn more points</li>
            <li>• Climb tiers to unlock higher prize pool events</li>
            <li>• Stay active to maintain your tier qualification</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
