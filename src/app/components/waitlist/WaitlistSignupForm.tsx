"use client";
import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import WaitlistDashboard from "./WaitlistDashboard";

interface SignupOk {
  referralCode: string;
  position: number;
  alreadyOnList?: boolean;
}

function parseOk(data: unknown): SignupOk | null {
  if (typeof data !== "object" || data === null) return null;
  const d = data as Record<string, unknown>;
  if (typeof d.referralCode !== "string") return null;
  if (typeof d.position !== "number") return null;
  return {
    referralCode: d.referralCode,
    position: d.position,
    alreadyOnList: d.alreadyOnList === true,
  };
}

const COOKIE_KEY = "vm_waitlist_code";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function setWaitlistCookie(code: string) {
  document.cookie = `${COOKIE_KEY}=${encodeURIComponent(code)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export default function WaitlistSignupForm() {
  const sp = useSearchParams();
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [signedUp, setSignedUp] = useState<SignupOk | null>(null);
  const [pending, startTransition] = useTransition();

  if (signedUp) {
    return (
      <div data-testid="gate-waitlisted-inline" aria-live="polite">
        <WaitlistDashboard referralCode={signedUp.referralCode} />
      </div>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const trimmed = email.trim();
    if (!trimmed) return;

    const ref = sp?.get("ref") || undefined;
    const from = sp?.get("from") || undefined;
    const utm: Record<string, string> = {};
    if (from) utm.source = from;
    for (const k of ["utm_source", "utm_medium", "utm_campaign"] as const) {
      const v = sp?.get(k);
      if (v) utm[k] = v;
    }

    startTransition(() => {
      void (async () => {
        try {
          const res = await fetch("/api/waitlist/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: trimmed,
              ...(ref ? { referredByCode: ref } : {}),
              ...(Object.keys(utm).length > 0 ? { utm } : {}),
            }),
          });
          if (res.status === 429) {
            setErr("Too many tries. Wait an hour and retry.");
            return;
          }
          if (res.status === 409) {
            setErr("You already have an account — sign in instead.");
            return;
          }
          if (res.status === 400) {
            setErr("Please use a real email address.");
            return;
          }
          if (!res.ok) {
            setErr("Something went wrong. Please retry.");
            return;
          }
          const ok = parseOk((await res.json()) as unknown);
          if (!ok) {
            setErr("Something went wrong. Please retry.");
            return;
          }
          setWaitlistCookie(ok.referralCode);
          setSignedUp(ok);
        } catch {
          setErr("Network error. Please retry.");
        }
      })();
    });
  };

  return (
    <form
      data-testid="gate-signup-form"
      onSubmit={submit}
      className="mb-8 max-w-xl"
      noValidate
    >
      <label htmlFor="gate-email" className="sr-only">
        Email address
      </label>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          id="gate-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          aria-label="Email address"
          aria-describedby="gate-signup-msg"
          aria-invalid={err ? true : undefined}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={pending}
          className="flex-1 bg-[#13202D] border border-[#1E2A36] text-white placeholder-gray-500 px-3 py-3 rounded focus:outline-none focus:ring-2 focus:ring-[#E94560]"
        />
        <button
          type="submit"
          disabled={pending || email.trim().length === 0}
          className="bg-[#E94560] text-white shadow-lg shadow-[#E94560]/30 hover:bg-[#ff5577] transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:bg-[#E94560] px-5 py-3 rounded font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E94560] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A1A]"
        >
          {pending ? "Joining…" : "Join the waitlist"}
        </button>
      </div>
      <div
        id="gate-signup-msg"
        role={err ? "alert" : undefined}
        aria-live="polite"
        className="min-h-[1.25rem] mt-2 text-sm"
      >
        {err && (
          <span className="text-[#FFB547]">
            {err}
            {err.includes("sign in") && (
              <>
                {" "}
                <a href="/login_page" className="underline">
                  Sign in
                </a>
              </>
            )}
          </span>
        )}
      </div>
    </form>
  );
}
