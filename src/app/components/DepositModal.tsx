'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useVelocityAuth } from '@/hooks/useVelocityAuth';
import { usePrivy } from '@privy-io/react-auth';
import { QRCodeSVG } from 'qrcode.react';

interface Props {
  open: boolean;
  onClose: () => void;
  refetchBalance?: () => void;
}

const USD_AMOUNTS = [25, 50, 100, 250, 500, 1000] as const;
const CRYPTO_AMOUNTS = [50, 100, 250, 500] as const;
type Tab = 'usd' | 'crypto';
type CryptoSubTab = 'card' | 'transfer';

export default function DepositModal({ open, onClose, refetchBalance }: Props) {
  const { data: session, status } = useSession();
  const { embeddedWalletAddress } = useVelocityAuth();
  const { getAccessToken } = usePrivy();

  const [tab, setTab] = useState<Tab>('usd');
  const [cryptoSubTab, setCryptoSubTab] = useState<CryptoSubTab>('card');
  const [selectedUsdAmount, setSelectedUsdAmount] = useState<number>(100);
  const [selectedCryptoAmount, setSelectedCryptoAmount] = useState<number>(100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) {
      setError(null);
      setLoading(false);
      setCopied(false);
    }
  }, [open]);

  const handleCopy = useCallback(async () => {
    if (!embeddedWalletAddress) return;
    await navigator.clipboard.writeText(embeddedWalletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [embeddedWalletAddress]);

  // Standard USD deposit via Stripe Checkout
  const handleUsdDeposit = async () => {
    if (!session?.user) {
      setError('Please sign in to deposit.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: selectedUsdAmount }),
      });
      const data = await res.json();

      if (data.url) {
        window.open(data.url, '_blank', 'noopener,noreferrer');
        onClose();
      } else {
        setError(data.error ?? 'Failed to create checkout session');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Crypto onramp via Stripe (existing flow)
  const handleCryptoDeposit = async () => {
    if (!embeddedWalletAddress) {
      setError('Crypto wallet not available. Use USD deposit instead.');
      return;
    }
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
        body: JSON.stringify({ walletAddress: embeddedWalletAddress, amount: selectedCryptoAmount }),
      });
      const data = await res.json();

      if (data.redirectUrl) {
        if (data.sessionId) {
          localStorage.setItem('vm_onramp_session', JSON.stringify({
            sessionId: data.sessionId,
            amount: selectedCryptoAmount,
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

  const isLoggedIn = !!session?.user;
  const isLoading = status === 'loading';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Add Funds"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/[0.08] bg-[#16181f]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] p-5">
          <div>
            <h2 className="text-lg font-semibold text-white">Add Funds</h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Deposit to your Velocity Markets account
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

        <div className="p-5 space-y-5">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            </div>
          ) : !isLoggedIn ? (
            <div className="flex h-32 items-center justify-center">
              <p className="text-center text-sm text-gray-500">
                Sign in to add funds to your account.
              </p>
            </div>
          ) : (
            <>
              {/* Tab toggle: USD (primary) | Crypto */}
              <div className="flex rounded-lg border border-white/[0.08] bg-[#0A0A1A] p-1">
                <button
                  type="button"
                  onClick={() => setTab('usd')}
                  className={`flex-1 rounded-md py-2 text-xs font-semibold transition-colors ${
                    tab === 'usd'
                      ? 'bg-[#01696F] text-white'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  Deposit USD
                </button>
                <button
                  type="button"
                  onClick={() => setTab('crypto')}
                  className={`flex-1 rounded-md py-2 text-xs font-semibold transition-colors ${
                    tab === 'crypto'
                      ? 'bg-[#16181f] text-white'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  Crypto
                </button>
              </div>

              {/* ── USD Deposit tab (PRIMARY) ── */}
              {tab === 'usd' && (
                <>
                  <div>
                    <p className="mb-2 text-xs text-gray-500">Select amount</p>
                    <div className="grid grid-cols-3 gap-2">
                      {USD_AMOUNTS.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setSelectedUsdAmount(opt)}
                          className={`rounded-lg border py-2.5 text-sm font-semibold font-mono transition-colors ${
                            selectedUsdAmount === opt
                              ? 'border-[#01696F] bg-[#01696F]/10 text-[#01696F]'
                              : 'border-white/[0.08] bg-[#0A0A1A] text-gray-400 hover:border-gray-500'
                          }`}
                        >
                          ${opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                      {error}
                    </p>
                  )}

                  {/* Trust signals */}
                  <div className="rounded-xl border border-white/[0.08] bg-[#0A0A1A] px-4 py-3 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      <span>Secure checkout powered by <span className="font-semibold text-gray-300">Stripe</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      <span>Credit card, debit card, Apple Pay, Google Pay</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>Funds credited to your account instantly</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleUsdDeposit}
                    disabled={loading}
                    className="w-full rounded-xl bg-[#01696F] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0C4E54] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Creating checkout…
                      </span>
                    ) : (
                      `Deposit $${selectedUsdAmount}`
                    )}
                  </button>

                  <p className="text-center text-xs text-gray-600">
                    Opens Stripe checkout in a new tab. Your card details never touch our servers.
                  </p>
                </>
              )}

              {/* ── Crypto tab ── */}
              {tab === 'crypto' && (
                <>
                  {/* Sub-tabs for crypto */}
                  <div className="flex rounded-lg border border-white/[0.08] bg-[#0A0A1A] p-1">
                    <button
                      type="button"
                      onClick={() => setCryptoSubTab('card')}
                      className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors ${
                        cryptoSubTab === 'card'
                          ? 'bg-[#16181f] text-white'
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      Buy USDC
                    </button>
                    <button
                      type="button"
                      onClick={() => setCryptoSubTab('transfer')}
                      className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors ${
                        cryptoSubTab === 'transfer'
                          ? 'bg-[#16181f] text-white'
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      Transfer USDC
                    </button>
                  </div>

                  {!embeddedWalletAddress && (
                    <div className="flex h-20 items-center justify-center">
                      <p className="text-center text-sm text-gray-500">
                        Crypto wallet not available. Use the USD deposit tab instead.
                      </p>
                    </div>
                  )}

                  {embeddedWalletAddress && cryptoSubTab === 'card' && (
                    <>
                      <div>
                        <p className="mb-2 text-xs text-gray-500">Select amount (USD → USDC)</p>
                        <div className="grid grid-cols-4 gap-2">
                          {CRYPTO_AMOUNTS.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setSelectedCryptoAmount(opt)}
                              className={`rounded-lg border py-2 text-sm font-semibold font-mono transition-colors ${
                                selectedCryptoAmount === opt
                                  ? 'border-[#8247E5] bg-[#8247E5]/10 text-[#8247E5]'
                                  : 'border-white/[0.08] bg-[#0A0A1A] text-gray-400 hover:border-gray-500'
                              }`}
                            >
                              ${opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      {error && (
                        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                          {error}
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={handleCryptoDeposit}
                        disabled={loading}
                        className="w-full rounded-xl bg-[#8247E5] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#6F3CC4] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            Creating session…
                          </span>
                        ) : (
                          'Buy USDC via Stripe'
                        )}
                      </button>

                      <p className="text-center text-xs text-gray-600">
                        Purchases USDC stablecoin via Stripe crypto onramp.
                      </p>
                    </>
                  )}

                  {embeddedWalletAddress && cryptoSubTab === 'transfer' && (
                    <>
                      <p className="text-xs text-gray-500">
                        Send USDC directly to your Velocity Markets wallet on Polygon.
                      </p>

                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-[#0A0A1A] px-3 py-1 text-xs text-gray-300">
                          <span className="h-2 w-2 rounded-full bg-[#8247E5]" />
                          Polygon
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-[#0A0A1A] px-3 py-1 text-xs text-gray-300">
                          <span className="h-2 w-2 rounded-full bg-[#2775CA]" />
                          USDC
                        </span>
                      </div>

                      <div className="flex justify-center">
                        <div className="rounded-xl bg-[#1a1a1a] p-3">
                          <QRCodeSVG
                            value={embeddedWalletAddress}
                            size={160}
                            level="M"
                            includeMargin={false}
                          />
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/[0.08] bg-[#0A0A1A] px-4 py-3">
                        <p className="mb-1.5 text-xs text-gray-500">Your deposit address (Polygon)</p>
                        <div className="flex items-center gap-2">
                          <p className="min-w-0 flex-1 truncate font-mono text-xs text-gray-300">
                            {embeddedWalletAddress}
                          </p>
                          <button
                            type="button"
                            onClick={handleCopy}
                            className="shrink-0 rounded-lg border border-white/[0.08] bg-[#16181f] px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-white/10"
                          >
                            {copied ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>

                      <div className="rounded-xl border border-[#FFB547]/20 bg-[#FFB547]/5 px-4 py-3">
                        <p className="text-xs font-semibold text-[#FFB547] mb-1">Important</p>
                        <p className="text-xs text-[#FFB547]/80">
                          Only send <span className="font-semibold text-[#FFB547]">USDC on Polygon</span>. Other tokens or networks may result in permanent loss.
                        </p>
                      </div>
                    </>
                  )}
                </>
              )}

              <p className="text-center text-[10px] leading-relaxed text-gray-600">
                By depositing, you agree to our Terms of Service. Funds are held in USD.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
