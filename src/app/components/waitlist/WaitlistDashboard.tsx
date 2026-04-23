"use client";
import { useEffect, useState } from "react";

interface Me {
  referralCode: string;
  position: number;
  verifiedReferrals: number;
  pendingReferrals: number;
}

function parseMe(data: unknown): Me | null {
  if (typeof data !== "object" || data === null) return null;
  const d = data as Record<string, unknown>;
  if (typeof d.referralCode !== "string") return null;
  if (typeof d.position !== "number") return null;
  if (typeof d.verifiedReferrals !== "number") return null;
  if (typeof d.pendingReferrals !== "number") return null;
  return {
    referralCode: d.referralCode,
    position: d.position,
    verifiedReferrals: d.verifiedReferrals,
    pendingReferrals: d.pendingReferrals,
  };
}

export default function WaitlistDashboard({ referralCode }: { referralCode: string }) {
  const [me, setMe] = useState<Me | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchMe = () =>
      fetch(`/api/waitlist/me?referralCode=${referralCode}`)
        .then((r) => r.json() as Promise<unknown>)
        .then((d) => {
          if (!cancelled) setMe(parseMe(d));
        })
        .catch(() => {});
    fetchMe();
    const id = setInterval(fetchMe, 20_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [referralCode]);

  if (!me) return <div className="text-gray-400">Loading…</div>;

  const shareUrl =
    typeof window !== "undefined" ? `${window.location.origin}/?ref=${me.referralCode}` : "";

  const handleCopy = () => {
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {});
  };

  return (
    <div data-testid="waitlist-dashboard" className="max-w-xl">
      <div className="font-mono text-7xl text-[#E94560] mb-2">#{me.position}</div>
      <p className="text-gray-300 mb-6">Share to move up. Every verified friend = 10 spots closer.</p>
      <div className="flex gap-2 mb-4">
        <input
          readOnly
          value={shareUrl}
          aria-label="Your share link"
          className="flex-1 bg-[#13202D] border border-[#1E2A36] px-3 py-2 rounded text-sm font-mono"
        />
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy share link"
          className="bg-[#E94560] px-4 py-2 rounded text-sm font-semibold"
        >
          {copied ? "Copied" : "Copy"}
        </button>
        <span className="sr-only" aria-live="polite">
          {copied ? "Share link copied" : ""}
        </span>
      </div>
      <div className="text-sm text-gray-400">
        <span className="text-[#00D4AA] font-mono">{me.verifiedReferrals} verified</span>
        <span className="mx-2">·</span>
        <span className="text-[#FFB547] font-mono">{me.pendingReferrals} pending</span>
      </div>
      {me.verifiedReferrals >= 10 && (
        <div className="mt-4 px-3 py-2 bg-[#FFB547]/10 border border-[#FFB547]/30 rounded text-sm">
          🏅 Early Predictor badge unlocked at invite time
        </div>
      )}
    </div>
  );
}
