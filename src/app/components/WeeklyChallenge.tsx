'use client';

import { useState, useEffect } from 'react';
import { Trophy, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function WeeklyChallenge() {
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    // Calculate days until end of current week (Sunday)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday
    const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    setDaysLeft(daysUntilSunday);
  }, []);

  return (
    <div className="rounded-xl border border-[#FFB547]/30 bg-gradient-to-br from-[#FFB547]/10 to-[#E94560]/10 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Trophy className="h-4 w-4 text-[#FFB547]" />
        <h3 className="text-sm font-semibold text-white">Weekly Challenge</h3>
      </div>
      <p className="text-xs text-gray-300 mb-3">
        Predict on 10 different auctions this week to earn bonus points and a streak bonus!
      </p>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-[#FFB547]">
          {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining
        </span>
        <Link href="/markets" className="flex items-center gap-1 text-xs text-[#E94560] hover:text-[#E94560]/80 transition-colors">
          Start trading <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
