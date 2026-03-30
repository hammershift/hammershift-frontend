export interface EntryTier {
  name: string;
  buyInAmount: number;
  prizeMultiplier: number;
  maxEntries: number;
  currentEntries: number;
}

export function calculatePrizePool(
  entryTiers: EntryTier[],
  rakePercent: number
): number {
  const totalRevenue = entryTiers.reduce(
    (sum, tier) => sum + tier.buyInAmount * tier.currentEntries,
    0
  );
  return totalRevenue * (1 - rakePercent / 100);
}

export function calculateTierPayout(
  prizePool: number,
  prizeMultiplier: number,
  totalMultiplierWeight: number
): number {
  if (totalMultiplierWeight === 0) return 0;
  return prizePool * (prizeMultiplier / totalMultiplierWeight);
}

export function getDefaultTiers(): EntryTier[] {
  return [
    { name: "Free", buyInAmount: 0, prizeMultiplier: 0, maxEntries: 1000, currentEntries: 0 },
    { name: "Bronze", buyInAmount: 5, prizeMultiplier: 1, maxEntries: 500, currentEntries: 0 },
    { name: "Silver", buyInAmount: 15, prizeMultiplier: 3, maxEntries: 200, currentEntries: 0 },
    { name: "Gold", buyInAmount: 50, prizeMultiplier: 10, maxEntries: 50, currentEntries: 0 },
  ];
}
