"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "vm_welcome_shown";

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
  const router = useRouter();
  const [shortCode, setShortCode] = useState<string | null>(null);
  const [visible, setVisible] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

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
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, "1");
      }
    } catch {
      // ignore storage failures
    }
    setVisible(false);
  }, []);

  // Esc-to-close
  useEffect(() => {
    if (!visible || !shortCode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [visible, shortCode, dismiss]);

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
        setTimeout(() => setCopied(false), 1500);
        dismiss();
      })
      .catch(() => {
        dismiss();
      });
  };

  const handleStart = () => {
    dismiss();
    router.push("/app");
  };

  return (
    <div
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
            className="text-xl font-semibold text-white"
          >
            You&apos;re in. Welcome to Velocity Markets.
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            Share your welcome card and help friends skip the line.
          </p>
        </div>

        <div className="space-y-5 p-5">
          <div className="overflow-hidden rounded-xl border border-[#1E2A36] bg-[#0A0A1A]">
            <img
              src={`/s/${encodeURIComponent(shortCode)}/opengraph-image`}
              alt="Your welcome share card"
              width={1200}
              height={630}
              className="h-auto w-full"
              loading="lazy"
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
              className="rounded bg-[#E94560] px-4 py-2 text-sm font-semibold text-white hover:bg-[#E94560]/90 focus:outline-none focus:ring-2 focus:ring-[#E94560] focus:ring-offset-2 focus:ring-offset-[#13202D]"
            >
              Start predicting
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
