"use client";

import NextImage from "next/image";
import { useState } from "react";
import type { ShareCardLite } from "@/lib/profile/summary";

interface Props {
  cards: ShareCardLite[];
  baseUrl: string;
}

type CardType = ShareCardLite["type"];

const TYPE_LABEL: Record<CardType, string> = {
  welcome: "Welcome",
  winner: "Winner",
  tournament: "Tournament",
};

const LOCKED_HINT: Record<Exclude<CardType, "welcome">, string> = {
  winner: "Win a market to unlock",
  tournament: "Top 10 a tournament to unlock",
};

const SLOTS: CardType[] = ["welcome", "winner", "tournament", "winner"];

// Thumb dimensions used for both the active card preview and the locked
// placeholder so the row has a stable height. The OG image route renders
// at 1200x630 — `unoptimized` skips Next's optimizer so we don't ship a
// resized variant for a route that already returns a finished PNG.
const SHARE_CARD_THUMB = { width: 256, height: 134 } as const;

export default function ShareCardsTile({ cards, baseUrl }: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Build a stable order: 4 slots — start from `welcome`, then fill the
  // rest from the cards list, then fall back to locked placeholders for
  // any unfilled slot.
  const slots = buildSlots(cards);

  const handleCopy = async (card: ShareCardLite) => {
    const url = `${baseUrl}/s/${card.shortCode}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(card.id);
      window.setTimeout(() => setCopiedId(null), 1200);
    } catch {
      // Clipboard API unavailable — fail silently. The card still
      // links through to the unfurl page.
    }
  };

  return (
    <section
      data-testid="tile-share-cards"
      aria-label="Share cards"
      className="md:col-span-6 rounded-2xl border border-white/[0.06] bg-[#13202D] p-5"
    >
      <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-gray-400">
        Share cards
      </h2>

      <div className="mt-4 -mx-5 px-5 overflow-x-auto">
        <ul className="flex gap-3 pb-1">
          {slots.map((slot, i) => {
            if (slot.kind === "card") {
              const c = slot.card;
              const url = `${baseUrl}/s/${c.shortCode}`;
              const ogSrc = `${baseUrl}/s/${c.shortCode}/opengraph-image`;
              const isCopied = copiedId === c.id;
              return (
                <li
                  key={c.id}
                  className="group relative shrink-0 overflow-hidden rounded-lg border border-white/[0.06] bg-[#0A0A1A]"
                  style={{
                    width: SHARE_CARD_THUMB.width,
                    height: SHARE_CARD_THUMB.height,
                  }}
                >
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-full w-full"
                    aria-label={`Open ${TYPE_LABEL[c.type]} share card`}
                  >
                    <NextImage
                      src={ogSrc}
                      alt={`${TYPE_LABEL[c.type]} share card preview`}
                      width={SHARE_CARD_THUMB.width}
                      height={SHARE_CARD_THUMB.height}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  </a>
                  <span className="absolute left-2 top-2 inline-flex items-center font-mono uppercase tracking-[0.15em] text-[10px] px-1.5 py-0.5 rounded bg-black/60 text-gray-200">
                    {TYPE_LABEL[c.type]}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(c)}
                    className="absolute bottom-2 right-2 inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-[0.15em] px-2 py-1 rounded border border-white/[0.1] bg-black/60 text-gray-200 opacity-0 transition group-hover:opacity-100 focus:opacity-100 focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-[#E94560] focus-visible:ring-offset-2 focus-visible:ring-offset-[#13202D]"
                    aria-label="Copy share link"
                  >
                    {isCopied ? "Copied" : "Copy"}
                  </button>
                </li>
              );
            }
            return (
              <li
                key={`locked-${i}-${slot.type}`}
                className="relative shrink-0 overflow-hidden rounded-lg border border-dashed border-white/[0.1] bg-[#0A0A1A] flex items-center justify-center px-3 text-center"
                style={{
                  width: SHARE_CARD_THUMB.width,
                  height: SHARE_CARD_THUMB.height,
                  filter: "grayscale(1)",
                }}
              >
                <div className="space-y-1">
                  <p className="font-mono uppercase tracking-[0.15em] text-[10px] text-gray-500">
                    {TYPE_LABEL[slot.type]}
                  </p>
                  <p className="text-xs text-gray-400">
                    {slot.type === "welcome"
                      ? "Welcome card pending"
                      : LOCKED_HINT[slot.type]}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

type Slot =
  | { kind: "card"; card: ShareCardLite }
  | { kind: "locked"; type: CardType };

function buildSlots(cards: ShareCardLite[]): Slot[] {
  const slots: Slot[] = [];
  const remaining = [...cards];

  // Welcome slot first — promote a welcome card if one exists.
  const welcome = remaining.find((c) => c.type === "welcome");
  if (welcome) {
    slots.push({ kind: "card", card: welcome });
    const idx = remaining.indexOf(welcome);
    if (idx >= 0) remaining.splice(idx, 1);
  } else {
    slots.push({ kind: "locked", type: "welcome" });
  }

  // Fill remaining slots from cards in order, falling back to locked
  // placeholders that hint at how to earn that type.
  for (let i = 1; i < SLOTS.length; i++) {
    const next = remaining.shift();
    if (next) slots.push({ kind: "card", card: next });
    else slots.push({ kind: "locked", type: SLOTS[i] });
  }

  return slots;
}
