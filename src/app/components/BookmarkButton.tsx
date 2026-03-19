'use client';

import { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface BookmarkButtonProps {
  marketId: string;
  initialBookmarked?: boolean;
  className?: string;
}

export default function BookmarkButton({ marketId, initialBookmarked = false, className = '' }: BookmarkButtonProps) {
  const { data: session } = useSession();
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault(); // Prevent card link navigation
    e.stopPropagation();
    if (!session || loading) return;

    setLoading(true);
    const prev = bookmarked;
    setBookmarked(!prev); // Optimistic update

    try {
      const res = await fetch('/api/watchlist/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marketId }),
      });
      if (res.ok) {
        const data = await res.json();
        setBookmarked(data.bookmarked);
      } else {
        setBookmarked(prev); // Revert on error
      }
    } catch {
      setBookmarked(prev); // Revert on error
    } finally {
      setLoading(false);
    }
  }

  // Don't show bookmark for non-logged-in users
  if (!session) return null;

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center justify-center h-7 w-7 rounded-md transition-colors ${
        bookmarked
          ? 'bg-[#E94560]/20 text-[#E94560]'
          : 'bg-black/40 text-gray-400 hover:text-white hover:bg-black/60'
      } ${className}`}
      aria-label={bookmarked ? 'Remove from watchlist' : 'Add to watchlist'}
    >
      <Bookmark className={`h-3.5 w-3.5 ${bookmarked ? 'fill-current' : ''}`} />
    </button>
  );
}
