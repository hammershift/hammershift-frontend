"use client";

import { useState } from "react";

type Result =
  | { ok: true; email: string; referralCode?: string; already_invited?: boolean }
  | { ok: false; error: string };

export default function InviteForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setResult({
          ok: true,
          email: data.email,
          referralCode: data.referralCode,
          already_invited: !!data.already_invited,
        });
        setEmail("");
      } else {
        setResult({ ok: false, error: data.error ?? `HTTP ${res.status}` });
      }
    } catch (err) {
      setResult({ ok: false, error: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <label className="text-sm text-gray-300">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@example.com"
          autoComplete="off"
          className="w-full rounded-md bg-[#13202D] border border-[#1E2A36] px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#E94560]"
        />
        <button
          type="submit"
          disabled={busy || !email}
          className="rounded-md bg-[#E94560] px-4 py-2 font-semibold text-white disabled:opacity-50"
        >
          {busy ? "Inviting…" : "Grant invite"}
        </button>
      </form>

      {result && (
        <div
          className={`mt-4 rounded-md border px-3 py-2 text-sm ${
            result.ok
              ? "border-[#00D4AA] text-[#00D4AA]"
              : "border-[#E94560] text-[#E94560]"
          }`}
        >
          {result.ok ? (
            <>
              {result.already_invited
                ? `${result.email} was already invited.`
                : `Invited ${result.email}.`}{" "}
              {result.referralCode && (
                <span className="text-gray-300">
                  Referral code: <code>{result.referralCode}</code>
                </span>
              )}
            </>
          ) : (
            <>Error: {result.error}</>
          )}
        </div>
      )}
    </>
  );
}
