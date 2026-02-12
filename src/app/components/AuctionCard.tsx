"use client";

import Image from "next/image";
import Link from "next/link";
import CountdownTimer from "./CountdownTimer";
import { Auction } from "@/models/auction.model";

/**
 * AuctionCard Component
 *
 * Displays an auction listing with image, details, countdown, and metadata.
 * Features hover effects and responsive design.
 *
 * @param auction - The auction data object
 * @param compact - Optional compact layout mode
 *
 * Layout includes:
 * - 16:9 aspect ratio image
 * - Auction title
 * - Current bid (in monospace font)
 * - Countdown timer
 * - Prediction count badge
 * - Source badge (BaT or CaB)
 */

interface AuctionCardProps {
  auction: Auction;
  compact?: boolean;
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const getSourceBadgeConfig = (source: string) => {
  switch (source) {
    case "bat":
      return {
        label: "BaT",
        bgColor: "bg-[#E94560]",
        textColor: "text-white",
      };
    case "cab":
      return {
        label: "CaB",
        bgColor: "bg-[#00D4AA]",
        textColor: "text-[#0A0A1A]",
      };
    default:
      return {
        label: "BaT",
        bgColor: "bg-[#E94560]",
        textColor: "text-white",
      };
  }
};

export default function AuctionCard({ auction, compact = false }: AuctionCardProps) {
  const sourceBadge = getSourceBadgeConfig(auction.source_badge || "bat");
  const currentBid = auction.sort?.price || 0;
  const endTime = auction.sort?.deadline || new Date();
  const predictionCount = auction.prediction_count || 0;

  return (
    <Link
      href={`/auction_details/${auction.auction_id}`}
      className="group block"
    >
      <article
        className={`
          relative overflow-hidden rounded-lg border border-[#1E293B]
          bg-[#12122A] transition-all duration-300
          hover:border-[#E94560] hover:shadow-lg hover:shadow-[#E94560]/20
          hover:-translate-y-1
          ${compact ? "max-w-sm" : "w-full"}
        `}
      >
        {/* Image Container */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#1A1A3E]">
          <Image
            src={auction.image}
            alt={auction.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={false}
          />

          {/* Source Badge - Top Left */}
          <div className="absolute left-2 top-2">
            <span
              className={`
                ${sourceBadge.bgColor} ${sourceBadge.textColor}
                rounded px-2 py-1 text-xs font-semibold
              `}
            >
              {sourceBadge.label}
            </span>
          </div>

          {/* Prediction Count Badge - Top Right */}
          {predictionCount > 0 && (
            <div className="absolute right-2 top-2">
              <span className="flex items-center gap-1 rounded bg-[#0A0A1A]/80 px-2 py-1 text-xs font-medium text-[#94A3B8] backdrop-blur-sm">
                <svg
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span className="font-mono">{predictionCount}</span>
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3
            className={`
              mb-3 font-bold text-white line-clamp-2
              ${compact ? "text-sm" : "text-base md:text-lg"}
            `}
          >
            {auction.title}
          </h3>

          {/* Bid and Countdown Row */}
          <div className="flex items-center justify-between">
            {/* Current Bid */}
            <div>
              <p className="mb-1 text-xs text-[#94A3B8]">Current Bid</p>
              <p className="font-mono text-lg font-medium text-[#00D4AA]">
                {formatPrice(currentBid)}
              </p>
            </div>

            {/* Countdown Timer */}
            <div className="text-right">
              <p className="mb-1 text-xs text-[#94A3B8]">Time Left</p>
              <CountdownTimer endTime={endTime} size={compact ? "sm" : "md"} />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
