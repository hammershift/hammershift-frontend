'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface TickerItem {
  label: string;
  price: string;
  change: string;
  positive: boolean;
}

const MOCK_ITEMS: TickerItem[] = [
  { label: '1989 Porsche 911', price: 'YES 72\u00a2', change: '+5%', positive: true },
  { label: '2003 Ferrari 360', price: 'NO 41\u00a2', change: '-3%', positive: false },
  { label: '1967 Corvette Stingray', price: 'YES 58\u00a2', change: '+2%', positive: true },
  { label: '2008 BMW M3', price: 'YES 65\u00a2', change: '+8%', positive: true },
  { label: '2001 Lamborghini Diablo', price: 'NO 39\u00a2', change: '-6%', positive: false },
  { label: '1972 Mercedes 450SL', price: 'YES 71\u00a2', change: '+4%', positive: true },
  { label: '2010 Porsche Cayman S', price: 'YES 54\u00a2', change: '+1%', positive: true },
  { label: '1969 Mustang Mach 1', price: 'YES 68\u00a2', change: '+9%', positive: true },
];

export default function LiveTicker() {
  const [items, setItems] = useState<TickerItem[]>(MOCK_ITEMS);

  // Try to enrich with real market data
  useEffect(() => {
    fetch('/api/markets/trending')
      .then((r) => r.json())
      .then((markets: any[]) => {
        if (!markets?.length) return;
        const real: TickerItem[] = markets.map((m) => ({
          label: m.auction?.title ?? 'Market',
          price: `YES ${Math.round((m.yesPrice ?? 0.5) * 100)}\u00a2`,
          change: '+' + (Math.random() * 10).toFixed(0) + '%',
          positive: true,
        }));
        setItems([...real, ...MOCK_ITEMS].slice(0, 12));
      })
      .catch(() => {});
  }, []);

  // Duplicate for seamless loop
  const doubled = [...items, ...items];

  return (
    <div className="w-full overflow-hidden bg-[#0F172A] border-b border-[#1E2A36] py-2">
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">{item.label}:</span>
            <span className="font-mono font-semibold text-white">{item.price}</span>
            <span className={`font-mono text-xs ${item.positive ? 'text-[#00D4AA]' : 'text-[#E94560]'}`}>
              {item.change}
            </span>
            <span className="text-[#1E2A36]">|</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
