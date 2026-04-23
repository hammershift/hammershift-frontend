"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "vm_welcome_shown";
const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

interface Welcome {
  shortCode: string;
}

function parseWelcome(data: unknown): Welcome | null {
  if (typeof data !== "object" || data === null) return null;
  const d = data as Record<string, unknown>;
  if (typeof d.shortCode !== "string" || d.shortCode.length === 0) return null;
  return { shortCode: d.shortCode };
}

export default function InvitedCelebrationModal() {
  const [shortCode, setShortCode] = useState<string | null>(null);
  const [visible, setVisible] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const copyButtonRef = useRef<HTMLButtonElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch welcome share card once, unless already dismissed
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === "1") {
        setVisible(false);
        return;
      }
    } catch {
      // localStorage can throw in private-mode/blocked contexts — fail quiet
      return;
    }

    let cancelled = false;
    fetch("/api/share/welcome", { method: "POST", cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) return null;
        const data: unknown = await r.json().catch(() => null);
        return parseWelcome(data);
      })
      .then((parsed) => {
        if (cancelled) return;
        if (parsed) {
          setShortCode(parsed.shortCode);
        } else {
          // Fail-closed-quiet: never render modal on any failure
          setVisible(false);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setVisible(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const dismiss = useCallback(() => {
    // Restore focus BEFORE unmounting so screen-reader focus is stable
    const prev = previouslyFocusedRef.current;
    if (prev && typeof prev.focus === "function") {
      try {
        prev.focus();
      } catch {
        // ignore focus failures
      }
    }
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, "1");
      }
    } catch {
      // ignore storage failures
    }
    setVisible(false);
  }, []);

  // Focus management: cache previously-focused element and move focus into dialog
  useEffect(() => {
    if (!visible || !shortCode) return;
    if (typeof document !== "undefined") {
      const active = document.activeElement;
      previouslyFocusedRef.current =
        active instanceof HTMLElement ? active : null;
    }
    // Move focus to primary action (Copy link button)
    copyButtonRef.current?.focus();
  }, [visible, shortCode]);

  // Keydown handler: Esc-to-close and Tab trap
  useEffect(() => {
    if (!visible || !shortCode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dismiss();
        return;
      }
      if (e.key !== "Tab") return;
      const container = dialogRef.current;
      if (!container) return;
      const focusables = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter(
        (el) => !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true"
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const activeEl =
        typeof document !== "undefined" && document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      if (e.shiftKey) {
        if (activeEl === first || !container.contains(activeEl)) {
          e.preventDefault();
          last.focus();
        }
      } else if (activeEl === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [visible, shortCode, dismiss]);

  // Clear copied-state timer on unmount
  useEffect(() => {
    return () => {
      if (copiedTimerRef.current) {
        clearTimeout(copiedTimerRef.current);
        copiedTimerRef.current = null;
      }
    };
  }, []);

  if (!visible || !shortCode) return null;

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/s/${encodeURIComponent(shortCode)}`
      : `/s/${shortCode}`;

  const handleCopy = () => {
    const clipboard = typeof navigator !== "undefined" ? navigator.clipboard : undefined;
    if (!clipboard) {
      // Non-secure context; still dismiss so user isn't trapped
      dismiss();
      return;
    }
    clipboard
      .writeText(shareUrl)
      .then(() => {
        setCopied(true);
        if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
        copiedTimerRef.current = setTimeout(() => setCopied(false), 1500);
        dismiss();
      })
      .catch(() => {
        dismiss();
      });
  };

  const handleStart = () => {
    // Modal is mounted on /app; dismiss IS the action (no navigation needed).
    dismiss();
  };

  return (
    <div
      data-testid="invited-modal"
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="invited-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#1E2A36] bg-[#13202D] shadow-2xl">
        <div className="border-b border-[#1E2A36] p-5">
          <h2
            id="invited-modal-title"
            className="text-xl font-semibold text-[#E94560]"
          >
            You&apos;re in.
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            Tell the world. Here&apos;s your &quot;I&apos;m in&quot; card:
          </p>
        </div>

        <div className="space-y-5 p-5">
          <div className="overflow-hidden rounded-xl border border-[#1E2A36] bg-[#0A0A1A]">
            <Image
              src={`/s/${encodeURIComponent(shortCode)}/opengraph-image`}
              width={1200}
              height={630}
              alt="Your welcome share card"
              unoptimized
              className="h-auto w-full"
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              readOnly
              value={shareUrl}
              aria-label="Your welcome share link"
              className="flex-1 rounded border border-[#1E2A36] bg-[#0A0A1A] px-3 py-2 font-mono text-sm text-gray-200"
            />
            <button
              ref={copyButtonRef}
              type="button"
              onClick={handleCopy}
              aria-label="Copy share link"
              className="rounded bg-[#E94560] px-4 py-2 text-sm font-semibold text-white hover:bg-[#E94560]/90 focus:outline-none focus:ring-2 focus:ring-[#E94560] focus:ring-offset-2 focus:ring-offset-[#13202D]"
            >
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
          <span className="sr-only" aria-live="polite">
            {copied ? "Share link copied" : ""}
          </span>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss welcome message"
              className="rounded px-3 py-2 text-sm text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#1E2A36]"
            >
              Not now
            </button>
            <button
              type="button"
              onClick={handleStart}
              aria-label="Start predicting on Velocity Markets"
              className="rounded bg-[#1E2A36] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1E2A36]/80 focus:outline-none focus:ring-2 focus:ring-[#1E2A36] focus:ring-offset-2 focus:ring-offset-[#13202D]"
            >
              Start predicting
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
