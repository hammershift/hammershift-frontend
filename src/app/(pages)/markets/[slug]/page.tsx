import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { toSlug } from '@/lib/slug';

interface Market {
  _id: string;
  question: string;
  yesPrice: number;
  noPrice: number;
  predictedPrice: number;
  status: string;
  totalVolume: number;
  auction: {
    title: string | null;
    image: string | null;
    deadline: string | null;
  };
}

async function getMarketBySlug(slug: string): Promise<Market | null> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/polygon-markets?status=ACTIVE`, {
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const markets: Market[] = await res.json();
  return (
    markets.find(
      (m) => m.auction.title && toSlug(m.auction.title) === slug
    ) ?? null
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const market = await getMarketBySlug(slug);
  if (!market) return { title: 'Market Not Found' };

  const yesPercent = Math.round((market.yesPrice ?? 0.5) * 100);
  const title = market.auction.title ?? 'Classic Car Market';

  return {
    title: `${title} — ${yesPercent}% YES | Velocity Markets`,
    description: market.question,
    openGraph: {
      title: `${title} — Will it sell above $${market.predictedPrice?.toLocaleString()}?`,
      description: `Current YES probability: ${yesPercent}%. Trade this prediction market on Velocity Markets.`,
      images: market.auction.image ? [{ url: market.auction.image }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} — ${yesPercent}% YES`,
      description: market.question,
    },
  };
}

export default async function MarketSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const market = await getMarketBySlug(slug);
  if (!market) notFound();

  const yesPercent = Math.round((market.yesPrice ?? 0.5) * 100);

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC] p-6">
      <div className="max-w-2xl mx-auto pt-24">
        <p className="text-sm text-slate-400 uppercase tracking-widest mb-2">
          Prediction Market
        </p>
        <h1 className="text-3xl font-bold mb-4">{market.auction.title}</h1>
        <p className="text-slate-300 mb-6">{market.question}</p>
        <div className="flex gap-4 mb-8">
          <div className="bg-[#1E293B] rounded-lg p-4 flex-1 text-center">
            <p className="text-xs text-slate-400 mb-1">YES</p>
            <p className="text-2xl font-mono font-bold text-[#10B981]">
              {yesPercent}%
            </p>
          </div>
          <div className="bg-[#1E293B] rounded-lg p-4 flex-1 text-center">
            <p className="text-xs text-slate-400 mb-1">NO</p>
            <p className="text-2xl font-mono font-bold text-[#EF4444]">
              {100 - yesPercent}%
            </p>
          </div>
        </div>
        <a
          href={`/trading/${market._id}`}
          className="block w-full bg-[#10B981] hover:bg-[#059669] text-black font-bold py-3 px-6 rounded-lg text-center transition-colors"
        >
          Trade This Market &rarr;
        </a>
      </div>
    </div>
  );
}
