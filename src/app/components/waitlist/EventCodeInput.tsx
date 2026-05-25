"use client";

import { useEffect, useState } from "react";

interface Props {
  /**
   * Called once when a valid code is accepted. Use to scroll/focus the
   * downstream signup field. The cookie set by the API persists across
   * reloads, so this fires at most once per browser per 24h.
   */
  onAccepted?: (source: string) => void;
}

/**
 * Small "have a code?" input shown above the cold-gate signup form. Booth
 * attendees enter `VELOCITY26` and the next signup is auto-invited.
 *
 * Idempotent on the client: if the cookie is already present (from a prior
 * tab), shows the success state immediately. We can't read the HttpOnly
 * cookie from JS, so we mirror the success state in localStorage purely
 * for UI continuity — the security guarantee remains on the cookie.
 */
export default function EventCodeInput({ onAccepted }: Props) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [accepted, setAccepted] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prior = window.localStorage.getItem("vm_event_code_ok");
    if (prior) setAccepted(prior);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !code.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/waitlist/event-code", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setAccepted(data.source);
        try {
          window.localStorage.setItem("vm_event_code_ok", data.source);
        } catch {
          // localStorage may be blocked in private browsing — non-fatal.
        }
        onAccepted?.(data.source);
      } else if (res.status === 429) {
        setError("Too many tries — slow down a sec.");
      } else {
        setError("That code isn't valid.");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (accepted) {
    return (
      <div
        data-testid="event-code-success"
        className="mb-4 rounded-md border border-[#00D4AA]/40 bg-[#00D4AA]/10 px-3 py-2 text-sm text-[#00D4AA]"
      >
        Event code accepted — sign up below to skip the waitlist.
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      data-testid="event-code-form"
      className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center"
    >
      <input
        type="text"
        autoCapitalize="characters"
        autoComplete="off"
        spellCheck={false}
        placeholder="Event code (booth attendees)"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        disabled={busy}
        data-testid="event-code-input"
        className="w-full rounded-md border border-[#1E2A36] bg-[#13202D] px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-[#E94560] focus:outline-none sm:max-w-[260px]"
      />
      <button
        type="submit"
        disabled={busy || !code.trim()}
        data-testid="event-code-submit"
        className="rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/20 disabled:opacity-50"
      >
        {busy ? "Checking…" : "Apply"}
      </button>
      {error && (
        <span
          className="text-xs text-[#E94560] sm:ml-2"
          data-testid="event-code-error"
        >
          {error}
        </span>
      )}
    </form>
  );
}
