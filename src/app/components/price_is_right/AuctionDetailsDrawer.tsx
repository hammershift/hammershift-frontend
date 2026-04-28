// src/app/components/price_is_right/AuctionDetailsDrawer.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Info } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/app/components/ui/sheet";
import {
  type AuctionLike,
  getGallery,
  getMileage,
  getLocation,
  getSeller,
  getLot,
  getHighlights,
  getDescriptionBlocks,
  getBaTUrl,
  getAuctionStatus,
} from "@/lib/auctionFields";

const MAX_HIGHLIGHTS = 6;
const DESCRIPTION_PREVIEW_BLOCKS = 2;

interface Props {
  auction: (AuctionLike & { auction_id?: string; _id?: string }) | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Fired when the user clicks "Make Your Guess →". The parent should close
   * the drawer and open the existing guess modal for this auction.
   */
  onMakeGuess: () => void;
}

export default function AuctionDetailsDrawer({
  auction,
  open,
  onOpenChange,
  onMakeGuess,
}: Props) {
  const [showAllHighlights, setShowAllHighlights] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  if (!auction) return null;

  const gallery = getGallery(auction);
  const title = typeof auction.title === "string" ? auction.title : "Auction";
  const mileage = getMileage(auction);
  const location = getLocation(auction);
  const seller = getSeller(auction);
  const lot = getLot(auction);
  const highlights = getHighlights(auction);
  const descriptionBlocks = getDescriptionBlocks(auction);
  const batUrl = getBaTUrl(auction);
  const status = getAuctionStatus(auction);
  const fullPageId =
    (typeof auction.auction_id === "string" && auction.auction_id) ||
    (typeof auction._id === "string" && auction._id) ||
    "";

  const stats: Array<{ label: string; value: string }> = [];
  if (mileage) stats.push({ label: "Mileage", value: mileage });
  if (location) stats.push({ label: "Location", value: location });
  if (seller) stats.push({ label: "Seller", value: seller });
  if (lot) stats.push({ label: "Lot", value: `#${lot}` });

  const visibleHighlights = showAllHighlights
    ? highlights
    : highlights.slice(0, MAX_HIGHLIGHTS);

  const visibleDescription = descriptionExpanded
    ? descriptionBlocks
    : descriptionBlocks.slice(0, DESCRIPTION_PREVIEW_BLOCKS);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        data-testid="auction-details-drawer"
        className="w-full sm:max-w-[520px] bg-[#0A0A1A] border-l border-white/[0.08] p-0 flex flex-col"
      >
        <SheetHeader className="px-5 py-4 border-b border-white/[0.06]">
          <SheetTitle className="text-base font-semibold text-white flex items-center gap-2">
            <Info className="h-4 w-4 text-[#E94560]" aria-hidden />
            Auction details
          </SheetTitle>
          <p className="sr-only">
            Vehicle photos, specs, highlights and description
          </p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {gallery.length > 0 ? (
            <Gallery images={gallery} altBase={title} />
          ) : null}

          <div className="px-5 pt-4">
            <h2 className="text-lg md:text-xl font-bold text-white">{title}</h2>
          </div>

          {stats.length > 0 ? (
            <dl className="mt-4 mx-5 grid grid-cols-2 gap-x-4 gap-y-3 border-y border-white/[0.06] py-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="text-[11px] uppercase tracking-[0.15em] text-gray-500">
                    {s.label}
                  </dt>
                  <dd className="mt-1 font-mono text-sm text-white tabular-nums">
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}

          {highlights.length > 0 ? (
            <section className="mt-5 px-5">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500 mb-2">
                Highlights
              </h3>
              <ul className="space-y-1.5 text-sm text-gray-200">
                {visibleHighlights.map((h, i) => (
                  <li key={i} className="flex gap-2">
                    <span aria-hidden className="text-[#E94560] shrink-0">
                      •
                    </span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
              {highlights.length > MAX_HIGHLIGHTS ? (
                <button
                  type="button"
                  onClick={() => setShowAllHighlights((v) => !v)}
                  className="mt-2 text-xs text-[#E94560] hover:underline"
                >
                  {showAllHighlights ? "Show fewer" : `Show ${highlights.length - MAX_HIGHLIGHTS} more`}
                </button>
              ) : null}
            </section>
          ) : null}

          {descriptionBlocks.length > 0 ? (
            <section className="mt-5 px-5 pb-5">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500 mb-2">
                Description
              </h3>
              <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
                {visibleDescription.map((b, i) =>
                  b.kind === "p" ? (
                    <p key={i}>{b.text}</p>
                  ) : (
                    <ul key={i} className="list-disc pl-5 space-y-1">
                      {b.items.map((item, j) => (
                        <li key={j}>{item}</li>
                      ))}
                    </ul>
                  )
                )}
              </div>
              {descriptionBlocks.length > DESCRIPTION_PREVIEW_BLOCKS ? (
                <button
                  type="button"
                  onClick={() => setDescriptionExpanded((v) => !v)}
                  className="mt-2 text-xs text-[#E94560] hover:underline"
                >
                  {descriptionExpanded ? "Read less" : "Read more"}
                </button>
              ) : null}
            </section>
          ) : null}

          {batUrl ? (
            <div className="mx-5 my-4 pt-4 border-t border-white/[0.06]">
              <a
                href={batUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white"
              >
                View on Bring a Trailer
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
            </div>
          ) : null}
        </div>

        <div
          role="region"
          aria-label="Auction actions"
          className="border-t border-white/[0.06] bg-[#0A0A1A] px-5 py-4 space-y-3"
        >
          {status.currentBidUsd !== null || status.deadline !== null ? (
            <div className="flex items-center justify-between text-xs text-gray-400">
              {status.currentBidUsd !== null ? (
                <span className="font-mono tabular-nums text-white">
                  {`$${status.currentBidUsd.toLocaleString("en-US")}`}
                </span>
              ) : (
                <span />
              )}
              {status.deadline !== null ? (
                <span className="font-mono tabular-nums">
                  {formatTimeLeft(status.deadline)}
                </span>
              ) : null}
            </div>
          ) : null}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2">
            {fullPageId ? (
              <Link
                href={`/auction_details?id=${encodeURIComponent(fullPageId)}`}
                className="text-sm text-gray-300 hover:text-white border border-white/[0.08] rounded-lg px-3 py-2 text-center transition"
              >
                Open full page ↗
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onMakeGuess();
              }}
              className="rounded-lg bg-[#E94560] px-4 py-2 text-sm font-semibold text-white hover:bg-[#E94560]/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E94560] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A1A]"
            >
              Make Your Guess →
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Gallery({ images, altBase }: { images: Array<{ src: string }>; altBase: string }) {
  const [index, setIndex] = useState(0);
  const safeIndex = Math.min(Math.max(0, index), images.length - 1);
  const primary = images[safeIndex];
  return (
    <div>
      <div className="relative aspect-[16/9] bg-[#13202D]">
        <Image
          src={primary.src}
          alt={`${altBase} — photo ${safeIndex + 1} of ${images.length}`}
          fill
          sizes="(max-width: 640px) 100vw, 520px"
          className="object-cover"
          unoptimized
        />
      </div>
      {images.length > 1 ? (
        <div className="px-5 py-3 flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show photo ${i + 1} of ${images.length}`}
              aria-current={i === safeIndex}
              className={`relative shrink-0 w-16 h-12 rounded overflow-hidden border ${
                i === safeIndex
                  ? "border-[#E94560]"
                  : "border-white/[0.08] hover:border-white/[0.2]"
              } transition`}
            >
              <Image
                src={img.src}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
                unoptimized
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function formatTimeLeft(deadline: Date): string {
  const ms = deadline.getTime() - Date.now();
  if (ms <= 0) return "Ended";
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}
