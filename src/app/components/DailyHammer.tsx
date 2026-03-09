'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import CountdownInline from './CountdownInline';

interface DailyHammerProps {
  /** A qualifying auction object fetched server-side */
  auction: {
    auctionId: string;
    title: string;
    image: string | null;
    deadline: string | null;
  } | null;
}

// Inner component: only rendered when PrivyProvider is active in the tree.
function DailyHammerWithPrivy({ auction }: DailyHammerProps) {
  const [guess, setGuess] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, authenticated } = usePrivy();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!auction) return;

    const parsed = parseFloat(guess.replace(/[^0-9.]/g, ''));
    if (isNaN(parsed) || parsed <= 0) {
      setError('Enter a valid price');
      return;
    }

    // Auth gate: fire Privy login if not authenticated
    if (!authenticated) {
      // Store pending guess in sessionStorage — user can submit after auth
      sessionStorage.setItem(
        'pending_guess',
        JSON.stringify({ auctionId: auction.auctionId, guessedPrice: parsed })
      );
      login();
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/daily-guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auctionId: auction.auctionId, guessedPrice: parsed }),
      });

      if (res.status === 409) {
        setError('You already submitted a guess for this auction.');
        setSubmitted(true);
        return;
      }

      if (!res.ok) throw new Error('Failed');
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  // After Privy auth, submit the pending guess
  useEffect(() => {
    if (!authenticated) return;
    const pending = sessionStorage.getItem('pending_guess');
    if (!pending) return;
    sessionStorage.removeItem('pending_guess');
    const { auctionId, guessedPrice } = JSON.parse(pending);
    if (auction?.auctionId !== auctionId) return;
    fetch('/api/daily-guess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auctionId, guessedPrice }),
    })
      .then(() => setSubmitted(true))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated]);

  return <DailyHammerUI auction={auction} guess={guess} setGuess={setGuess} submitted={submitted} loading={loading} error={error} onSubmit={handleSubmit} />;
}

// Fallback: renders without Privy — submits directly (no auth gate).
function DailyHammerNoPrivy({ auction }: DailyHammerProps) {
  const [guess, setGuess] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!auction) return;

    const parsed = parseFloat(guess.replace(/[^0-9.]/g, ''));
    if (isNaN(parsed) || parsed <= 0) {
      setError('Enter a valid price');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/daily-guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auctionId: auction.auctionId, guessedPrice: parsed }),
      });

      if (res.status === 409) {
        setError('You already submitted a guess for this auction.');
        setSubmitted(true);
        return;
      }

      if (!res.ok) throw new Error('Failed');
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return <DailyHammerUI auction={auction} guess={guess} setGuess={setGuess} submitted={submitted} loading={loading} error={error} onSubmit={handleSubmit} />;
}

// Shared UI — pure presentational, no hooks.
interface DailyHammerUIProps {
  auction: DailyHammerProps['auction'];
  guess: string;
  setGuess: (v: string) => void;
  submitted: boolean;
  loading: boolean;
  error: string;
  onSubmit: (e: React.FormEvent) => void;
}

function DailyHammerUI({ auction, guess, setGuess, submitted, loading, error, onSubmit }: DailyHammerUIProps) {
  if (!auction) return null;

  return (
    <section className="w-full bg-[#0F172A] border-t border-[#1E2A36] py-12">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-6 text-center">
          <p className="text-xs uppercase tracking-widest text-[#FFB547] mb-1">Daily Hammer</p>
          <h2 className="text-2xl font-bold text-white">What&apos;s it worth?</h2>
        </div>

        <div className="rounded-2xl overflow-hidden border border-[#1E2A36] bg-[#0A0A1A]">
          {auction.image && (
            <div className="relative h-56 w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={auction.image} alt={auction.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A1A] via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-lg font-semibold text-white">{auction.title}</p>
                {auction.deadline && (
                  <p className="text-xs font-mono text-[#FFB547] mt-1">
                    Closes in: <CountdownInline deadline={auction.deadline} />
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="p-6">
            {submitted ? (
              <div className="text-center py-4">
                <p className="text-[#00D4AA] text-lg font-semibold">Guess submitted!</p>
                <p className="text-gray-400 text-sm mt-1">Results after the auction closes.</p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-lg">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    placeholder="Guess the exact hammer price..."
                    className="w-full rounded-xl border border-[#1E2A36] bg-[#0F172A] pl-8 pr-4 py-4 font-mono text-xl text-white placeholder:text-gray-600 focus:border-[#E94560] focus:outline-none"
                  />
                </div>
                {error && <p className="text-[#E94560] text-sm">{error}</p>}
                <p className="text-xs text-gray-500 text-center">
                  Closest exact guess wins $50 in USDC trading credits.
                </p>
                <button
                  type="submit"
                  disabled={loading || !guess}
                  className="w-full rounded-xl bg-[#E94560] py-4 font-semibold text-white disabled:opacity-50 hover:bg-[#E94560]/90 transition-colors"
                >
                  {loading ? 'Submitting...' : 'Submit Guess \u2192'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function DailyHammer({ auction }: DailyHammerProps) {
  const privyConfigured = Boolean(process.env.NEXT_PUBLIC_PRIVY_APP_ID);

  if (privyConfigured) {
    return <DailyHammerWithPrivy auction={auction} />;
  }

  return <DailyHammerNoPrivy auction={auction} />;
}
