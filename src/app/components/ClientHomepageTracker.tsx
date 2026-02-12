'use client';

import { useEffect } from 'react';
import { useTrackEvent } from '@/hooks/useTrackEvent';

interface ClientHomepageTrackerProps {
  featuredAuctionId?: string;
}

export default function ClientHomepageTracker({ featuredAuctionId }: ClientHomepageTrackerProps) {
  const track = useTrackEvent();

  useEffect(() => {
    track('homepage_viewed', {
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      featured_auction: featuredAuctionId,
      timestamp: new Date().toISOString()
    });
  }, [featuredAuctionId, track]);

  return null;
}
