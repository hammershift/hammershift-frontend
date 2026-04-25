"use client";
import { useState } from "react";

const ITEMS: Array<{ q: string; a: string }> = [
  {
    q: "Is this gambling?",
    a: "No. Velocity Markets is a skill-based prediction product. You call a hammer-price range on upcoming auctions; payouts are tied to how close your prediction lands to the actual sale.",
  },
  {
    q: "When does it open?",
    a: "We're seating the founding cohort first. Verified members get invites in waves as capacity opens up. Refer verified friends to jump the line — every one gets you 10 spots closer.",
  },
  {
    q: "What do I actually win?",
    a: "USD. Paid to your wallet. Withdraw via ACH or crypto once you clear the minimum threshold.",
  },
];

export default function GateFaq() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section
      aria-label="Frequently asked questions"
      className="border-t border-white/[0.06] bg-[#0A0A1A]"
    >
      <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
        <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-gray-500 mb-6">
          FAQ
        </h2>
        <dl className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
          {ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q}>
                <dt>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`gate-faq-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="w-full flex items-center justify-between py-5 text-left text-white hover:text-[#E94560] transition-colors focus:outline-none focus-visible:text-[#E94560]"
                  >
                    <span className="text-base md:text-lg">{item.q}</span>
                    <span
                      aria-hidden="true"
                      className="font-mono text-lg text-gray-500 shrink-0 ml-4"
                    >
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                </dt>
                {isOpen && (
                  <dd
                    id={`gate-faq-${i}`}
                    className="pb-5 text-gray-400 text-sm md:text-base leading-relaxed max-w-xl"
                  >
                    {item.a}
                  </dd>
                )}
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
