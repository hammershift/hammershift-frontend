export const GUEST_KEY = "vm_guest_predictions";

export interface GuestPrediction {
  auctionId: string;
  predictedPrice: number;
  timestamp: number;
}

export function saveGuestPrediction(
  auctionId: string,
  predictedPrice: number
): number {
  try {
    const existing: GuestPrediction[] = JSON.parse(
      localStorage.getItem(GUEST_KEY) ?? "[]"
    );
    const updated: GuestPrediction[] = [
      ...existing.filter((p) => p.auctionId !== auctionId),
      { auctionId, predictedPrice, timestamp: Date.now() },
    ];
    localStorage.setItem(GUEST_KEY, JSON.stringify(updated));
    return updated.length;
  } catch {
    return 0;
  }
}

export function getGuestPredictions(): GuestPrediction[] {
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function clearGuestPredictions(): void {
  try {
    localStorage.removeItem(GUEST_KEY);
  } catch {
    // ignore
  }
}
