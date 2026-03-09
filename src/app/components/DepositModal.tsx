'use client';

import { useState, useEffect, useRef } from 'react';
import { useVelocityAuth } from '@/hooks/useVelocityAuth';

interface Props {
  open: boolean;
  onClose: () => void;
}

// Extend Window to carry the Stripe Onramp vanilla SDK global
declare global {
  interface Window {
    StripeOnramp?: (publishableKey: string) => {
      createSession: (options: { clientSecret: string; appearance?: Record<string, unknown> }) => {
        mount: (element: HTMLElement) => void;
        unmount: () => void;
      };
    };
  }
}

const ONRAMP_SCRIPT_URL = 'https://crypto-js.stripe.com/crypto-onramp-outer.js';
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!;

function loadOnrampScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Already loaded
    if (window.StripeOnramp) {
      resolve();
      return;
    }
    // Script tag already injected — wait for it
    const existing = document.querySelector(`script[src="${ONRAMP_SCRIPT_URL}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Stripe Onramp script failed to load')));
      return;
    }
    const script = document.createElement('script');
    script.src = ONRAMP_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Stripe Onramp script failed to load'));
    document.head.appendChild(script);
  });
}

export default function DepositModal({ open, onClose }: Props) {
  const { embeddedWalletAddress } = useVelocityAuth();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Keep a ref to the mounted session so we can unmount on close
  const sessionRef = useRef<{ unmount: () => void } | null>(null);

  // Fetch a new onramp client secret whenever the modal opens
  useEffect(() => {
    if (!open || !embeddedWalletAddress) return;
    setLoading(true);
    setError(null);
    setClientSecret(null);

    fetch('/api/stripe/onramp-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress: embeddedWalletAddress, amount: 50 }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          setError(data.message ?? 'Failed to load deposit widget');
        }
      })
      .catch(() => setError('Network error. Please try again.'))
      .finally(() => setLoading(false));
  }, [open, embeddedWalletAddress]);

  // Unmount widget and reset state when modal closes
  useEffect(() => {
    if (!open) {
      if (sessionRef.current) {
        try {
          sessionRef.current.unmount();
        } catch {
          // ignore unmount errors
        }
        sessionRef.current = null;
      }
      setClientSecret(null);
      setError(null);
    }
  }, [open]);

  // Mount the Stripe Onramp widget once we have a clientSecret and a DOM node
  useEffect(() => {
    if (!clientSecret || !containerRef.current) return;

    loadOnrampScript()
      .then(() => {
        if (!window.StripeOnramp || !containerRef.current) return;
        const onramp = window.StripeOnramp(PUBLISHABLE_KEY);
        const session = onramp.createSession({
          clientSecret,
          appearance: { theme: 'dark' } as Record<string, unknown>,
        });
        session.mount(containerRef.current);
        sessionRef.current = session;
      })
      .catch((err) => {
        console.error('Stripe Onramp mount error:', err);
        setError('Payment widget failed to load. Please try again.');
      });
  }, [clientSecret]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Deposit USDC"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={(e) => {
        // Close when clicking the backdrop
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-[#1E293B]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div>
            <h2 className="text-lg font-semibold text-[#F8FAFC]">Deposit USDC</h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Funds go directly to your Velocity wallet
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close deposit modal"
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {/* Loading state */}
          {loading && (
            <div className="flex h-64 items-center justify-center text-sm text-slate-400">
              <span className="animate-pulse">Loading payment widget…</span>
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className="flex h-64 flex-col items-center justify-center gap-3">
              <p className="text-center text-sm text-red-400">{error}</p>
              <button
                onClick={() => {
                  // Retry by toggling the clientSecret reset
                  setError(null);
                  setClientSecret(null);
                  if (!embeddedWalletAddress) return;
                  setLoading(true);
                  fetch('/api/stripe/onramp-session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ walletAddress: embeddedWalletAddress, amount: 50 }),
                  })
                    .then((r) => r.json())
                    .then((data) => {
                      if (data.clientSecret) setClientSecret(data.clientSecret);
                      else setError(data.message ?? 'Failed to load deposit widget');
                    })
                    .catch(() => setError('Network error. Please try again.'))
                    .finally(() => setLoading(false));
                }}
                className="rounded-md bg-[#E94560] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#E94560]/80"
              >
                Try again
              </button>
            </div>
          )}

          {/* No wallet — unauthenticated fallback */}
          {!loading && !error && !embeddedWalletAddress && (
            <div className="flex h-64 items-center justify-center">
              <p className="text-center text-sm text-slate-400">
                Please sign in to deposit funds.
              </p>
            </div>
          )}

          {/* Stripe Onramp widget mount point */}
          <div
            ref={containerRef}
            className={clientSecret && !error ? 'min-h-64' : 'hidden'}
          />
        </div>
      </div>
    </div>
  );
}
