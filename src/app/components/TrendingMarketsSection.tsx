import TrendingMarketsClient from './TrendingMarketsClient';

async function fetchTrendingMarkets() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
    // Try the trending endpoint; fall back to active polygon markets
    const res = await fetch(`${baseUrl}/api/markets/trending`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length) return data;
    }
    // Fallback
    const fallback = await fetch(`${baseUrl}/api/polygon-markets?status=ACTIVE&limit=4`, {
      next: { revalidate: 60 },
    });
    if (!fallback.ok) return [];
    const fallbackData = await fallback.json();
    // Normalize polygon-markets shape if needed
    return Array.isArray(fallbackData) ? fallbackData : (fallbackData.markets ?? []);
  } catch {
    return [];
  }
}

export default async function TrendingMarketsSection() {
  const markets = await fetchTrendingMarkets();
  return <TrendingMarketsClient markets={markets} />;
}
