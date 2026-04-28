"use client";

import NextImage from "next/image";
import { useState } from "react";

export type CardType = "welcome" | "winner" | "tournament";

export interface GalleryCard {
  id: string;
  type: CardType;
  shortCode: string;
  /** ISO 8601 string — already serialized for the wire. */
  createdAt: string;
}

interface Props {
  cards: GalleryCard[];
  baseUrl: string;
}

const TYPE_LABEL: Record<CardType, string> = {
  welcome: "Welcome",
  winner: "Winner",
  tournament: "Tournament",
};

// Locked-state hint copy. MUST match the strings used by the hub
// ShareCardsTile so the language stays consistent across surfaces.
// Welcome is always issued for invited founders, so it never gets
// a locked placeholder here.
const LOCKED_HINT: Record<Exclude<CardType, "welcome">, string> = {
  winner: "Win a market to unlock",
  tournament: "Top 10 a tournament to unlock",
};

// Source dimensions for the OG image route. The image scales down
// responsively via className — the source is fetched at this size so
// the grid renders sharply on retina without re-encoding through
// Next's optimizer (the route already returns a finished PNG).
const SHARE_CARD_THUMB = { width: 800, height: 419 } as const;

type Slot =
  | { kind: "card"; card: GalleryCard }
  | { kind: "locked"; type: Exclude<CardType, "welcome"> };

const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

export default function CardsGalleryClient({ cards, baseUrl }: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const slots = buildSlots(cards);

  const handleCopy = async (card: GalleryCard) => {
    const url = `${baseUrl}/s/${card.shortCode}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(card.id);
      window.setTimeout(() => setCopiedId(null), 1200);
    } catch {
      // Clipboard API unavailable — fail silently. The card link
      // is still reachable via the anchor.
    }
  };

  if (slots.length === 0) {
    return (
      <p className="mt-8 text-sm text-gray-400">No share cards yet.</p>
    );
  }

  return (
    <ul
      data-testid="cards-gallery"
      className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5"
    >
      {slots.map((slot, i) => {
        if (slot.kind === "card") {
          const c = slot.card;
          const url = `${baseUrl}/s/${c.shortCode}`;
          const ogSrc = `${baseUrl}/s/${c.shortCode}/opengraph-image`;
          const isCopied = copiedId === c.id;
          const dateLabel = formatDate(c.createdAt);
          return (
            <li
              key={c.id}
              className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#0A0A1A]"
            >
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block aspect-[1200/630] w-full"
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
              <button
                type="button"
                onClick={() => handleCopy(c)}
                className="absolute right-3 top-3 inline-flex items-center gap-1 rounded border border-white/[0.1] bg-black/60 px-2 py-1 font-mono text-[11px] uppercase tracking-[0.15em] text-gray-200 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-[#E94560] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A1A]"
                aria-label="Copy share link"
              >
                {isCopied ? "Copied" : "Copy"}
              </button>
              <div className="flex items-center justify-between border-t border-white/[0.06] bg-[#13202D] px-3 py-2">
                <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-gray-300">
                  {TYPE_LABEL[c.type]}
                </span>
                <span className="font-mono text-[11px] text-gray-500">
                  {dateLabel}
                </span>
              </div>
            </li>
          );
        }
        return (
          <li
            key={`locked-${i}-${slot.type}`}
            className="relative overflow-hidden rounded-xl border border-dashed border-white/[0.12] bg-[#0A0A1A]"
          >
            <div
              className="flex aspect-[1200/630] w-full items-center justify-center px-4 text-center"
              style={{ filter: "grayscale(1)" }}
            >
              <div className="space-y-1">
                <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-gray-500">
                  {TYPE_LABEL[slot.type]}
                </p>
                <p className="text-sm text-gray-400">
                  {LOCKED_HINT[slot.type]}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Build the gallery slot list:
 *   1. Every real card the user owns (already sorted newest first).
 *   2. Append locked placeholders for any of `winner`/`tournament` the
 *      user has zero of, so the page communicates what's still earnable
 *      without polluting the gallery for a power user with many cards.
 */
function buildSlots(cards: GalleryCard[]): Slot[] {
  const slots: Slot[] = cards.map((card) => ({ kind: "card", card }));

  const presentTypes = new Set<CardType>(cards.map((c) => c.type));
  const lockable: Array<Exclude<CardType, "welcome">> = ["winner", "tournament"];
  for (const t of lockable) {
    if (!presentTypes.has(t)) {
      slots.push({ kind: "locked", type: t });
    }
  }

  return slots;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return DATE_FMT.format(d);
}
