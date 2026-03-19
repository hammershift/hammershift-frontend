'use client';

import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';

interface TradeActivity {
  timestamp: string;
  yesPrice: number;
  noPrice: number;
  volume: number;
}

interface ActivityFeedProps {
  marketId: string;
}

export function ActivityFeed({ marketId }: ActivityFeedProps) {
  const [activity, setActivity] = useState<TradeActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/polygon-markets/${marketId}/history`)
      .then(r => r.json())
      .then((data: TradeActivity[]) => {
        // Show most recent first, limit to 20
        const sorted = (Array.isArray(data) ? data : []).slice(-20).reverse();
        setActivity(sorted);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [marketId]);

  if (loading) {
    return <div className="py-8 text-center text-sm text-gray-500">Loading activity...</div>;
  }

  if (activity.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-500">
        <Activity className="h-8 w-8 mb-2 opacity-30" />
        <p className="text-sm">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {activity.map((trade, i) => {
        const yesCents = Math.round(trade.yesPrice * 100);
        const volDollars = (trade.volume / 100);
        return (
          <div key={i} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-xs hover:bg-white/5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-gray-300">
                Yes {yesCents}¢ / No {100 - yesCents}¢
              </span>
            </div>
            <div className="flex items-center gap-3">
              {volDollars > 0 && (
                <span className="font-mono text-gray-500">${volDollars.toFixed(0)}</span>
              )}
              <span className="text-gray-600">
                {new Date(trade.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
