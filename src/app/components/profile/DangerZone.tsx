"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";

interface Props {
  username: string;
}

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

// TODO: Wire this to the real delete-account endpoint once it exists.
// Expected contract (per profile redesign plan): DELETE /api/profile (or
// POST /api/profile/delete-account) — auth-gated, anonymizes the user
// record, revokes the session, and returns 204. When the route lands,
// flip DELETE_ACCOUNT_API_AVAILABLE to true and uncomment the fetch
// inside handleConfirm.
const DELETE_ACCOUNT_API_AVAILABLE = false;

export default function DangerZone({ username }: Props) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  const handle = username.length > 0 ? `@${username}` : "@your-handle";
  const matches = typed.trim() === handle;
  const canConfirm = matches && DELETE_ACCOUNT_API_AVAILABLE && !submitting;

  const closeModal = useCallback((): void => {
    // Restore focus BEFORE unmounting so screen-reader focus is stable
    const prev = previouslyFocusedRef.current;
    if (prev && typeof prev.focus === "function") {
      try {
        prev.focus();
      } catch {
        // ignore focus failures
      }
    }
    setOpen(false);
    setTyped("");
    setError(null);
  }, []);

  // Focus management: cache previously-focused element and move focus into the input
  useEffect(() => {
    if (!open) return;
    if (typeof document !== "undefined") {
      const active = document.activeElement;
      previouslyFocusedRef.current =
        active instanceof HTMLElement ? active : null;
    }
    inputRef.current?.focus();
  }, [open]);

  // Keydown handler: Esc-to-close and Tab trap
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeModal();
        return;
      }
      if (e.key !== "Tab") return;
      const container = dialogRef.current;
      if (!container) return;
      const focusables = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter(
        (el) =>
          !el.hasAttribute("disabled") &&
          el.getAttribute("aria-hidden") !== "true"
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const activeEl =
        typeof document !== "undefined" &&
        document.activeElement instanceof HTMLElement
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
  }, [open, closeModal]);

  // Body scroll lock while modal open
  useEffect(() => {
    if (!open) return;
    if (typeof document === "undefined") return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  async function handleConfirm(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (!matches) return;
    if (!DELETE_ACCOUNT_API_AVAILABLE) {
      setError("Account deletion is not yet available. Contact support.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      // TODO: replace with the real endpoint when it lands.
      // const res = await fetch("/api/profile/delete-account", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ confirm: typed }),
      // });
      // if (!res.ok) {
      //   setError("Failed to delete account. Try again or contact support.");
      //   return;
      // }
      // window.location.href = "/";
      setError("Account deletion is not yet available. Contact support.");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-[#E94560]/40 bg-[#13202D] p-5 md:p-6">
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-[#E94560]">Danger zone</h2>
        <p className="mt-1 text-sm text-gray-400">
          Deleting your account is permanent. Your predictions, badges, and
          history will be removed.
        </p>
      </header>
      <div className="border-t border-white/[0.06] pt-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={!DELETE_ACCOUNT_API_AVAILABLE}
          title={
            DELETE_ACCOUNT_API_AVAILABLE
              ? "Delete your account"
              : "Coming soon"
          }
          className="rounded-lg border border-[#E94560]/60 px-4 py-2 text-sm font-semibold text-[#E94560] transition hover:bg-[#E94560]/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {DELETE_ACCOUNT_API_AVAILABLE
            ? "Delete account"
            : "Delete account (coming soon)"}
        </button>
      </div>

      {open ? (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="danger-zone-modal-title"
          aria-describedby="danger-zone-modal-desc"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-[#E94560]/40 bg-[#13202D] p-6">
            <h3
              id="danger-zone-modal-title"
              className="text-lg font-semibold text-[#E94560]"
            >
              Delete account
            </h3>
            <p
              id="danger-zone-modal-desc"
              className="mt-2 text-sm text-gray-300"
            >
              This cannot be undone. Type{" "}
              <span className="font-mono text-white">{handle}</span> to
              confirm.
            </p>
            <form onSubmit={handleConfirm} className="mt-4 space-y-4">
              <input
                ref={inputRef}
                type="text"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                autoComplete="off"
                placeholder={handle}
                aria-label={`Type ${handle} to confirm`}
                className="block w-full rounded-lg border border-white/[0.06] bg-[#0A0A1A] px-3 py-2 font-mono text-sm text-white outline-none focus:border-[#E94560]"
              />
              {error ? (
                <p className="text-sm text-[#E94560]">{error}</p>
              ) : null}
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-white/[0.06] px-4 py-2 text-sm font-semibold text-white transition hover:border-white/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!canConfirm}
                  className="rounded-lg bg-[#E94560] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#d83a55] disabled:cursor-not-allowed disabled:opacity-60"
                  title={
                    DELETE_ACCOUNT_API_AVAILABLE
                      ? undefined
                      : "Coming soon"
                  }
                >
                  {submitting
                    ? "Deleting…"
                    : DELETE_ACCOUNT_API_AVAILABLE
                    ? "Delete account"
                    : "Coming soon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
