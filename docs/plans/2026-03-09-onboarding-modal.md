# Onboarding Modal Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Show a 3-step onboarding modal to first-time visitors that explains Velocity Markets, teaches them how to trade, and hooks them into Privy wallet creation.

**Architecture:** A client component (`OnboardingModal`) reads a `vm_onboarded` flag from `localStorage`. If absent, the modal renders over the homepage. Step 3 calls Privy `login()`. Completing auth or clicking Skip sets the flag and closes the modal.

**Tech Stack:** Next.js 15, Tailwind CSS, Privy (`usePrivy`), TypeScript. No new npm packages required — use the `Dialog`/modal primitives already in the project (Radix UI is installed).

**Design tokens:** BG `#0A0A1A`, Accent `#E94560`, Success `#00D4AA`, border `#1E2A36`. Step indicator in `#FFB547`.

---

### Task 1: Create the OnboardingModal component

**Files:**
- Create: `src/app/components/OnboardingModal.tsx`

**Step 1: Check if Radix Dialog is available**

```bash
cat package.json | grep "@radix-ui/react-dialog"
```

If present, use it. If not, build a simple portal-based modal with a div overlay.

**Step 2: Create the component**

```tsx
// src/app/components/OnboardingModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const STORAGE_KEY = 'vm_onboarded';

const STEPS = [
  {
    emoji: '🏎️',
    title: 'What is Velocity Markets?',
    body: 'Trade YES or NO on whether collector cars sell above their estimate. Real auctions. Real money.',
  },
  {
    emoji: '💰',
    title: 'How do trades work?',
    body: 'Buy YES or NO shares in USDC. Shares resolve to $1.00 if correct, $0 if wrong. No gas fees.',
  },
  {
    emoji: '⚡',
    title: 'Get started free',
    body: 'Create your wallet in seconds. No seed phrases. Just your email.',
    isFinal: true,
  },
];

export default function OnboardingModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  // Privy — graceful if not configured
  let login: (() => void) | null = null;
  try {
    const { usePrivy } = require('@privy-io/react-auth');
    const privy = usePrivy();
    login = privy.login;
    // If already authenticated, mark as onboarded and don't show modal
    if (privy.authenticated && open) {
      dismiss();
    }
  } catch {
    // Privy not configured
  }

  useEffect(() => {
    // Only run client-side
    if (typeof window === 'undefined') return;
    const alreadyOnboarded = localStorage.getItem(STORAGE_KEY);
    if (!alreadyOnboarded) {
      setOpen(true);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, 'true');
    setOpen(false);
  }

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    }
  }

  function handleConnect() {
    if (login) {
      login();
    }
    dismiss();
  }

  if (!open) return null;

  const current = STEPS[step];

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
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
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Step indicator */}
        <div className="mb-6 flex items-center gap-2">
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
          <p className="text-4xl">{current.emoji}</p>
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
```

**Step 3: Commit**

```bash
git add src/app/components/OnboardingModal.tsx
git commit -m "feat: OnboardingModal — 3-step first-visit modal with Privy auth hook"
```

---

### Task 2: Wire OnboardingModal into the root layout

The modal must render on every page (so users who land on `/markets` directly also see it), not just the homepage.

**Files:**
- Modify: `src/app/layout.tsx`

**Step 1: Read the full layout.tsx first**

Read `src/app/layout.tsx` completely before editing.

**Step 2: Add the import and component**

Find where `<PrivyProvider>` or the main body content wraps children, and add `<OnboardingModal />` as a sibling to `{children}`:

```tsx
import OnboardingModal from './components/OnboardingModal';

// Inside the JSX, directly inside <body> or the outermost wrapper:
<OnboardingModal />
{children}
```

The `OnboardingModal` is a client component and handles its own localStorage check — it renders `null` if the user is already onboarded, so it adds no visual overhead.

**Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: wire OnboardingModal into root layout — shows on first visit site-wide"
```

---

### Task 3: Reset onboarding flag during development (helper)

This is a dev-only convenience. Add a URL param that resets the flag so you can test the modal without clearing localStorage manually.

**Files:**
- Modify: `src/app/components/OnboardingModal.tsx`

**Step 1: Add reset-on-URL-param logic to the useEffect**

Inside the `useEffect` in `OnboardingModal.tsx`, add before the localStorage check:

```typescript
// Dev helper: ?reset_onboarding=1 clears the flag
if (window.location.search.includes('reset_onboarding=1')) {
  localStorage.removeItem(STORAGE_KEY);
}
```

**Step 2: Test the modal manually**

Open `http://localhost:3000/?reset_onboarding=1` and verify:
1. Modal appears on page load
2. Step indicator advances through 3 steps
3. "Connect with Email →" calls `login()` (or gracefully skips if Privy not configured)
4. "Skip for now" closes modal and sets `vm_onboarded` in localStorage
5. Refreshing without `?reset_onboarding=1` does NOT show the modal again

**Step 3: Commit**

```bash
git add src/app/components/OnboardingModal.tsx
git commit -m "feat: onboarding dev helper — ?reset_onboarding=1 clears localStorage flag"
```
