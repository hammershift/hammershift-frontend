'use client';

import { useEffect } from 'react';
import { useTrackEvent } from '@/hooks/useTrackEvent';

interface ClientAuctionTrackerProps {
  auctionId: string;
  auctionTitle: string;
  currentBid: number;
  timeRemaining?: string | Date;
}

export default function ClientAuctionTracker({
  auctionId,
  auctionTitle,
  currentBid,
  timeRemaining
}: ClientAuctionTrackerProps) {
  const track = useTrackEvent();

  useEffect(() => {
    track('auction_viewed', {
      auction_id: auctionId,
      auction_title: auctionTitle,
      current_bid: currentBid,
      time_remaining: timeRemaining,
      timestamp: new Date().toISOString()
    });
  }, [auctionId, auctionTitle, currentBid, timeRemaining, track]);

  return null;
}
