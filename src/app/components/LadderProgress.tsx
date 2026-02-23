"use client";

export const TIERS = [
  { id: "rookie", label: "Rookie", color: "#94A3B8", minPoints: 0 },
  { id: "silver", label: "Silver", color: "#C0C0C0", minPoints: 100 },
  { id: "gold",   label: "Gold",   color: "#FFB547", minPoints: 300 },
  { id: "pro",    label: "Pro",    color: "#E94560", minPoints: 750 },
] as const;

export type TierId = (typeof TIERS)[number]["id"];

export interface LadderData {
  tier: TierId;
  points: number;
  rank: number;
  nextTierThreshold: number;
}

interface LadderProgressProps {
  data: LadderData | null;
  loading?: boolean;
}

export function LadderProgress({ data, loading }: LadderProgressProps) {
  if (loading || !data) {
    return (
      <div className="rounded-lg border border-[#1E2A36] bg-[#13202D] p-5">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-[#1E2A36] rounded w-2/5" />
          <div className="h-2 bg-[#1E2A36] rounded w-full" />
          <div className="h-3 bg-[#1E2A36] rounded w-3/5" />
        </div>
      </div>
    );
  }

  const currentTier = TIERS.find((t) => t.id === data.tier) ?? TIERS[0];
  const tierIndex = TIERS.indexOf(currentTier);
  const nextTier = TIERS[tierIndex + 1];

  const pct = nextTier
    ? Math.min(
        Math.round(
          ((data.points - currentTier.minPoints) /
            (nextTier.minPoints - currentTier.minPoints)) *
            100
        ),
        100
      )
    : 100;

  return (
    <div className="rounded-lg border border-[#1E2A36] bg-[#13202D] p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="font-bold text-base" style={{ color: currentTier.color }}>
          {currentTier.label} Tier
        </span>
        <span className="text-xs text-gray-400 font-mono">Rank #{data.rank}</span>
      </div>
      <div className="w-full bg-[#0A0A1A] rounded-full h-2 mb-2">
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: currentTier.color }}
        />
      </div>
      <div className="flex justify-between text-xs font-mono text-gray-400">
        <span>{data.points} pts</span>
        {nextTier ? (
          <span>
            {nextTier.minPoints - data.points} pts to{" "}
            <span style={{ color: nextTier.color }}>{nextTier.label}</span>
          </span>
        ) : (
          <span style={{ color: currentTier.color }}>Max tier reached</span>
        )}
      </div>
    </div>
  );
}
