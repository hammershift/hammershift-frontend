'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useTrackEvent } from '@/hooks/useTrackEvent';
import { Loader2 } from 'lucide-react';

interface PredictionFormClientProps {
  auctionId: string;
  minPrice: number;
  maxPrice: number;
  currentBid: number;
  deadline?: string | Date;
}

export default function PredictionFormClient({
  auctionId,
  minPrice,
  maxPrice,
  currentBid,
  deadline
}: PredictionFormClientProps) {
  const [predictedPrice, setPredictedPrice] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const track = useTrackEvent();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const price = parseInt(predictedPrice);

    // Validation
    if (!price || isNaN(price)) {
      setError('Please enter a valid price');
      return;
    }

    if (price < minPrice || price > maxPrice) {
      setError(`Prediction must be between $${minPrice.toLocaleString()} and $${maxPrice.toLocaleString()}`);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auction_id: auctionId,
          predictedPrice: price,
          predictionType: 'free_play'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to submit prediction');
        setIsSubmitting(false);
        return;
      }

      // Track event
      const timeBeforeEnd = deadline
        ? new Date(deadline).getTime() - Date.now()
        : 0;

      track('prediction_made', {
        auction_id: auctionId,
        predicted_price: price,
        time_before_end: timeBeforeEnd,
        timestamp: new Date().toISOString()
      });

      // Refresh page to show updated prediction
      router.refresh();
    } catch (err) {
      console.error('Prediction submission error:', err);
      setError('An error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Range slider helper */}
      <div className="rounded-lg bg-[#0A0A1A]/50 p-3">
        <div className="mb-2 text-xs text-gray-400">Suggested Range</div>
        <div className="flex items-center justify-between text-sm">
          <span className="font-mono text-gray-300">${minPrice.toLocaleString()}</span>
          <span className="text-gray-500">to</span>
          <span className="font-mono text-gray-300">${maxPrice.toLocaleString()}</span>
        </div>
      </div>

      {/* Price input */}
      <div>
        <label htmlFor="predicted-price" className="mb-2 block text-sm text-gray-400">
          Your Prediction
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
          <Input
            id="predicted-price"
            type="number"
            placeholder="Enter amount"
            value={predictedPrice}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPredictedPrice(e.target.value)}
            className="border-[#1E2A36] bg-[#0A0A1A] pl-7 font-mono text-lg"
            min={minPrice}
            max={maxPrice}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Bonus modifiers display */}
      <div className="space-y-1 text-xs">
        <div className="flex items-center justify-between text-gray-400">
          <span>Early Bird Bonus</span>
          <span className="font-mono text-[#FFB547]">+50 pts</span>
        </div>
        <div className="flex items-center justify-between text-gray-400">
          <span>Streak Bonus</span>
          <span className="font-mono text-[#00D4AA]">+25 pts</span>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Submit button */}
      <Button
        type="submit"
        className="w-full bg-[#E94560] text-white hover:bg-[#E94560]/90"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Prediction'
        )}
      </Button>

      <p className="text-center text-xs text-gray-500">
        Predictions lock 1 hour before auction end
      </p>
    </form>
  );
}
