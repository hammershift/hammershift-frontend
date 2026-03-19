'use client';

import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface MarketSortDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

const SORT_OPTIONS = [
  { label: 'Trending', value: 'trending' },
  { label: 'Ending Soon', value: 'ending_soon' },
  { label: 'Newest', value: 'newest' },
  { label: 'Highest Volume', value: 'volume' },
  { label: 'Most Contested', value: 'contested' },
];

export default function MarketSortDropdown({ value, onChange }: MarketSortDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const activeLabel = SORT_OPTIONS.find(o => o.value === value)?.label ?? 'Sort';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg bg-white/[0.08] border border-white/10 px-3 py-1.5 text-sm text-gray-300 hover:bg-white/[0.12] transition-colors"
      >
        {activeLabel}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-20 w-44 rounded-lg border border-white/10 bg-[#16181f] py-1 shadow-xl">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                value === opt.value ? 'text-white bg-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
