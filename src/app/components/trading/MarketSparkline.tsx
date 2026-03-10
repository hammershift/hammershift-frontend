'use client';

import { useEffect, useState } from 'react';
import SparklineChart from './SparklineChart';

interface Props {
  marketId: string;
  yesPrice: number;
}

export default function MarketSparkline({ marketId, yesPrice }: Props) {
  const [data, setData] = useState<{ day: number; price: number }[] | null>(null);

  useEffect(() => {
    fetch(`/api/polygon-markets/${marketId}/history`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, [marketId]);

  if (!data || !Array.isArray(data)) {
    return <div className="h-10 w-full bg-white/5 rounded animate-pulse" />;
  }

  return <SparklineChart data={data} positive={yesPrice >= 0.5} />;
}
