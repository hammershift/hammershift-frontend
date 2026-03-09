'use client';

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/app/components/ui/sheet';

interface Market {
  _id: string;
  question: string;
  yesPrice: number;
  noPrice: number;
  predictedPrice: number;
  auction: { title: string | null; image: string | null };
}

interface Props {
  open: boolean;
  onClose: () => void;
  market: Market | null;
  initialSide?: 'YES' | 'NO';
}

export default function TradingDrawer({
  open,
  onClose,
  market,
  initialSide = 'YES',
}: Props) {
  const [side, setSide] = useState<'YES' | 'NO'>(initialSide);
  const [amount, setAmount] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);

  // Sync side when initialSide prop changes (new market opened)
  useEffect(() => {
    setSide(initialSide);
    setAmount('');
  }, [initialSide, market?._id]);

  if (!market) return null;

  const price = side === 'YES' ? (market.yesPrice ?? 0.5) : (market.noPrice ?? 0.5);
  const shares =
    amount && parseFloat(amount) > 0
      ? (parseFloat(amount) / price).toFixed(2)
      : '—';
  const color = side === 'YES' ? '#10B981' : '#EF4444';
  const amountNum = parseFloat(amount);
  const isValidAmount = !isNaN(amountNum) && amountNum > 0;

  const handleTrade = async () => {
    if (!isValidAmount) return;
    // TODO E1.T3: replace with Biconomy AA gasless transaction
    setIsPlacing(true);
    try {
      window.location.href = `/trading/${market._id}?side=${side}`;
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent>
        <SheetHeader>
          <p className="text-xs text-slate-400 uppercase tracking-widest">
            Prediction Market
          </p>
          <SheetTitle>{market.auction.title ?? 'Market'}</SheetTitle>
          <p className="text-sm text-slate-300 leading-snug">{market.question}</p>
        </SheetHeader>

        <div className="p-6 flex flex-col gap-5">
          {/* Side toggle */}
          <div className="grid grid-cols-2 gap-2">
            {(['YES', 'NO'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSide(s)}
                className={`py-3 rounded-lg font-bold text-sm transition-all ${
                  side === s
                    ? s === 'YES'
                      ? 'bg-[#10B981] text-black'
                      : 'bg-[#EF4444] text-white'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                {s}
                <span className="block text-xs font-mono font-normal mt-0.5">
                  {Math.round(
                    (s === 'YES' ? (market.yesPrice ?? 0.5) : (market.noPrice ?? 0.5)) * 100
                  )}
                  ¢
                </span>
              </button>
            ))}
          </div>

          {/* USDC amount input */}
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">
              Amount (USDC)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">
                $
              </span>
              <input
                type="number"
                min="1"
                step="1"
                placeholder="10"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#0F172A] border border-white/10 rounded-lg py-3 pl-7 pr-4 text-[#F8FAFC] font-mono text-sm focus:outline-none focus:border-white/30"
              />
            </div>
          </div>

          {/* Order summary */}
          <div className="bg-[#0F172A] rounded-lg p-4 flex flex-col gap-2 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Price per share</span>
              <span className="font-mono" style={{ color }}>
                {Math.round(price * 100)}¢
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Shares</span>
              <span className="font-mono text-[#F8FAFC]">{shares}</span>
            </div>
            <div className="flex justify-between font-semibold text-[#F8FAFC] pt-2 border-t border-white/10">
              <span>Total</span>
              <span className="font-mono">${isValidAmount ? amount : '0'} USDC</span>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={handleTrade}
            disabled={!isValidAmount || isPlacing}
            className="w-full py-4 rounded-lg font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              backgroundColor: color,
              color: side === 'YES' ? 'black' : 'white',
            }}
          >
            {isPlacing
              ? 'Placing...'
              : `Buy ${side} — $${isValidAmount ? amount : '0'} USDC`}
          </button>

          <p className="text-xs text-slate-500 text-center">
            Gas fees sponsored by Velocity Markets
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
