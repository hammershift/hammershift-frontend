'use client';

import { useEffect, useState } from 'react';

export default function CountdownInline({ deadline }: { deadline: string | null }) {
  const [label, setLabel] = useState('—');

  useEffect(() => {
    if (!deadline) return;

    const tick = () => {
      const diff = new Date(deadline).getTime() - Date.now();
      if (diff <= 0) { setLabel('ENDED'); return; }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      if (h > 24) {
        setLabel(`${Math.floor(h / 24)}d ${h % 24}h`);
      } else {
        setLabel(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  return (
    <span className="font-mono text-xs tabular-nums text-amber-400">{label}</span>
  );
}
