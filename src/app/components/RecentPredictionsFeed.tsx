'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface Prediction {
  _id: string;
  predictedPrice: number;
  user: {
    username: string;
  };
  createdAt: string;
}

interface RecentPredictionsFeedProps {
  auctionId: string;
  initialPredictions: Prediction[];
}

export default function RecentPredictionsFeed({
  auctionId,
  initialPredictions
}: RecentPredictionsFeedProps) {
  const [predictions, setPredictions] = useState<Prediction[]>(initialPredictions);

  // Poll for new predictions every 10 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/predictions?auction_id=${auctionId}&limit=10`);
        if (response.ok) {
          const data = await response.json();
          setPredictions(data);
        }
      } catch (error) {
        console.error('Failed to fetch recent predictions:', error);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [auctionId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (predictions.length === 0) {
    return (
      <div className="py-4 text-center text-sm text-gray-500">
        No predictions yet. Be the first!
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto">
      {predictions.map((prediction) => (
        <div
          key={prediction._id}
          className="flex items-start justify-between rounded-lg bg-[#0A0A1A]/50 p-3 text-sm"
        >
          <div className="flex-1">
            <div className="font-semibold text-white">{prediction.user.username}</div>
            <div className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(prediction.createdAt), { addSuffix: true })}
            </div>
          </div>
          <div className="font-mono font-bold text-[#00D4AA]">
            {formatCurrency(prediction.predictedPrice)}
          </div>
        </div>
      ))}
    </div>
  );
}
