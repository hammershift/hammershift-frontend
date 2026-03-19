'use client';

import { useState, useEffect } from 'react';
import { useVelocityAuth } from '@/hooks/useVelocityAuth';
import { usePrivy } from '@privy-io/react-auth';

interface Props {
  open: boolean;
  onClose: () => void;
  refetchBalance?: () => void;
}

const AMOUNT_OPTIONS = [50, 100, 250, 500] as const;
type AmountOption = typeof AMOUNT_OPTIONS[number];

export default function DepositModal({ open, onClose, refetchBalance }: Props) {
  const { embeddedWalletAddress } = useVelocityAuth();
  const { getAccessToken } = usePrivy();
  const [selectedAmount, setSelectedAmount] = useState<AmountOption>(100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setError(null);
      setLoading(false);
    }
  }, [open]);

  const handleDeposit = async () => {
    if (!embeddedWalletAddress) return;
    setLoading(true);
    setError(null);

    try {
      const token = await getAccessToken();
      if (!token) {
        setError('Please sign in to deposit.');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/stripe/onramp-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ walletAddress: embeddedWalletAddress, amount: selectedAmount }),
      });
      const data = await res.json();

      if (data.redirectUrl) {
        // Store sessionId so /my_wallet can verify on return
        if (data.sessionId) {
          localStorage.setItem('vm_onramp_session', JSON.stringify({
            sessionId: data.sessionId,
            amount: selectedAmount,
            timestamp: Date.now(),
          }));
        }
        window.open(data.redirectUrl, '_blank', 'noopener,noreferrer');
        onClose();
      } else {
        setError(data.message ?? 'Failed to create deposit session');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Deposit USDC"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-[#1E2A36] bg-[#0F172A]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E2A36] p-5">
          <div>
            <h2 className="text-lg font-semibold text-white">Deposit USDC</h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Funds go directly to your Polygon wallet
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-white/10 hover:text-white"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">

          {/* No wallet */}
          {!embeddedWalletAddress && (
            <div className="flex h-32 items-center justify-center">
              <p className="text-center text-sm text-gray-500">
                Sign in with Google to get a wallet and deposit.
              </p>
            </div>
          )}

          {embeddedWalletAddress && (
            <>
              {/* Wallet address */}
              <div className="rounded-xl border border-[#1E2A36] bg-[#0A0A1A] px-4 py-3">
                <p className="mb-1 text-xs text-gray-500">Your Polygon wallet</p>
                <p className="truncate font-mono text-xs text-gray-300">{embeddedWalletAddress}</p>
              </div>

              {/* Amount selector */}
              <div>
                <p className="mb-2 text-xs text-gray-500">Select amount (USD)</p>
                <div className="grid grid-cols-4 gap-2">
                  {AMOUNT_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSelectedAmount(opt)}
                      className={`rounded-lg border py-2 text-sm font-semibold font-mono transition-colors ${
                        selectedAmount === opt
                          ? 'border-[#E94560] bg-[#E94560]/10 text-[#E94560]'
                          : 'border-[#1E2A36] bg-[#0A0A1A] text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      ${opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error */}
              {error && (
                <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                  {error}
                </p>
              )}

              {/* Info */}
              <div className="rounded-xl border border-[#1E2A36] bg-[#0A0A1A] px-4 py-3 space-y-1.5 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="text-[#00D4AA]">✓</span>
                  Buy USDC with card, bank, or Apple Pay
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#00D4AA]">✓</span>
                  Delivered to your Polygon wallet instantly
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#00D4AA]">✓</span>
                  Powered by Stripe
                </div>
              </div>

              {/* CTA */}
              <button
                type="button"
                onClick={handleDeposit}
                disabled={loading}
                className="w-full rounded-xl bg-[#E94560] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#E94560]/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Creating session…
                  </span>
                ) : (
                  `Continue to Stripe →`
                )}
              </button>

              <p className="text-center text-xs text-gray-600">
                Opens in a new tab. Return here when complete.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
