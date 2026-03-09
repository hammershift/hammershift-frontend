'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';

const STORAGE_KEY = 'vm_onboarded';

const STEPS = [
  {
    emoji: '🏎️',
    title: 'What is Velocity Markets?',
    body: 'Trade YES or NO on whether collector cars sell above their estimate. Real auctions. Real money.',
    isFinal: false,
  },
  {
    emoji: '💰',
    title: 'How do trades work?',
    body: 'Buy YES or NO shares in USDC. Shares resolve to $1.00 if correct, $0 if wrong. No gas fees.',
    isFinal: false,
  },
  {
    emoji: '⚡',
    title: 'Get started free',
    body: 'Create your wallet in seconds. No seed phrases. Just your email.',
    isFinal: true,
  },
];

// Inner component: only rendered when PrivyProvider is present in the tree.
// Calls usePrivy unconditionally (satisfies React hook rules).
function OnboardingModalWithPrivy() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const { login, authenticated } = usePrivy();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Dev helper: ?reset_onboarding=1 clears the flag
    if (window.location.search.includes('reset_onboarding=1')) {
      localStorage.removeItem(STORAGE_KEY);
    }
    const alreadyOnboarded = localStorage.getItem(STORAGE_KEY);
    if (!alreadyOnboarded) {
      setOpen(true);
    }
  }, []);

  // If user authenticated via Privy while modal is open, dismiss it
  useEffect(() => {
    if (authenticated && open) {
      dismiss();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated]);

  function dismiss() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
    setOpen(false);
  }

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    }
  }

  function handleConnect() {
    login();
    dismiss();
  }

  if (!open) return null;

  const current = STEPS[step];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      role="presentation"
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-[#1E2A36] bg-[#0F172A] p-8 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Welcome to Velocity Markets"
      >
        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-500 hover:text-white transition-colors"
          aria-label="Close onboarding"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Step indicator */}
        <div className="mb-6 flex items-center gap-2" aria-hidden="true">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-[#E94560]' : 'bg-[#1E2A36]'
              }`}
            />
          ))}
        </div>

        {/* Step label */}
        <p className="mb-2 text-xs font-mono uppercase tracking-widest text-[#FFB547]">
          Step {step + 1} of {STEPS.length}
        </p>

        {/* Content */}
        <div className="mb-8 space-y-4">
          <p className="text-4xl" aria-hidden="true">{current.emoji}</p>
          <h2 className="text-2xl font-bold text-white">{current.title}</h2>
          <p className="text-gray-400 leading-relaxed">{current.body}</p>
        </div>

        {/* Actions */}
        {current.isFinal ? (
          <div className="flex flex-col gap-3">
            <button
              onClick={handleConnect}
              className="w-full rounded-xl bg-[#E94560] py-3 font-semibold text-white hover:bg-[#E94560]/90 transition-colors"
            >
              Connect with Email →
            </button>
            <button
              onClick={dismiss}
              className="w-full rounded-xl border border-[#1E2A36] py-3 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Skip for now
            </button>
          </div>
        ) : (
          <button
            onClick={handleNext}
            className="w-full rounded-xl bg-[#E94560] py-3 font-semibold text-white hover:bg-[#E94560]/90 transition-colors"
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
}

// Fallback: renders the modal without Privy login capability.
// Used when NEXT_PUBLIC_PRIVY_APP_ID is not set.
function OnboardingModalNoPrivy() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Dev helper: ?reset_onboarding=1 clears the flag
    if (window.location.search.includes('reset_onboarding=1')) {
      localStorage.removeItem(STORAGE_KEY);
    }
    const alreadyOnboarded = localStorage.getItem(STORAGE_KEY);
    if (!alreadyOnboarded) {
      setOpen(true);
    }
  }, []);

  function dismiss() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
    setOpen(false);
  }

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    }
  }

  if (!open) return null;

  const current = STEPS[step];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      role="presentation"
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-[#1E2A36] bg-[#0F172A] p-8 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Welcome to Velocity Markets"
      >
        <button
          onClick={dismiss}
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-500 hover:text-white transition-colors"
          aria-label="Close onboarding"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 flex items-center gap-2" aria-hidden="true">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-[#E94560]' : 'bg-[#1E2A36]'
              }`}
            />
          ))}
        </div>

        <p className="mb-2 text-xs font-mono uppercase tracking-widest text-[#FFB547]">
          Step {step + 1} of {STEPS.length}
        </p>

        <div className="mb-8 space-y-4">
          <p className="text-4xl" aria-hidden="true">{current.emoji}</p>
          <h2 className="text-2xl font-bold text-white">{current.title}</h2>
          <p className="text-gray-400 leading-relaxed">{current.body}</p>
        </div>

        {current.isFinal ? (
          <div className="flex flex-col gap-3">
            <button
              onClick={dismiss}
              className="w-full rounded-xl bg-[#E94560] py-3 font-semibold text-white hover:bg-[#E94560]/90 transition-colors"
            >
              Get Started →
            </button>
            <button
              onClick={dismiss}
              className="w-full rounded-xl border border-[#1E2A36] py-3 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Skip for now
            </button>
          </div>
        ) : (
          <button
            onClick={handleNext}
            className="w-full rounded-xl bg-[#E94560] py-3 font-semibold text-white hover:bg-[#E94560]/90 transition-colors"
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
}

// Public export: renders the Privy-aware variant when PrivyProvider is active,
// otherwise renders the no-Privy fallback. Renders null immediately for returning
// users (localStorage flag set) — zero visual overhead.
export default function OnboardingModal() {
  const privyConfigured = Boolean(process.env.NEXT_PUBLIC_PRIVY_APP_ID);

  if (privyConfigured) {
    return <OnboardingModalWithPrivy />;
  }

  return <OnboardingModalNoPrivy />;
}
