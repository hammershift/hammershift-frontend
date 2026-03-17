'use client';

import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import CountdownInline from "./CountdownInline";

interface FeaturedAuction {
  _id: string;
  auction_id?: string;
  title: string;
  image?: string | null;
  sort?: {
    deadline?: string;
    price?: number;
  };
}

interface FeaturedAuctionHeroProps {
  auction: FeaturedAuction;
}

const USDollar = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export default function FeaturedAuctionHero({ auction }: FeaturedAuctionHeroProps) {
  const auctionId = auction.auction_id ?? auction._id;
  const deadline = auction.sort?.deadline ?? null;
  const currentBid = auction.sort?.price ?? null;
  const hasImage = Boolean(auction.image);

  return (
    <section
      className="mx-auto w-full max-w-6xl px-4 pb-10"
      aria-label="Featured Auction"
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E94560]/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#E94560] border border-[#E94560]/20">
          <span
            className="h-1.5 w-1.5 rounded-full bg-[#E94560] animate-pulse"
            aria-hidden="true"
          />
          Closing Soon
        </span>
      </div>

      <Link
        href={`/auction_details/${auctionId}`}
        className="group block rounded-2xl overflow-hidden border border-[#1E2A36] bg-[#0F172A] transition-all duration-200 hover:border-[#E94560]/40 hover:shadow-xl hover:shadow-[#E94560]/5"
        aria-label={`Featured auction: ${auction.title}`}
      >
        <div className="flex flex-col md:flex-row">
          {/* Image or gradient placeholder */}
          <div className="relative h-56 w-full shrink-0 overflow-hidden md:h-auto md:w-2/5">
            {hasImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={auction.image!}
                alt={auction.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div
                className="h-full w-full"
                style={{
                  background:
                    "linear-gradient(135deg, #0F172A 0%, #1E2A36 40%, #E94560/20 100%)",
                }}
                aria-hidden="true"
              >
                <div className="flex h-full items-center justify-center">
                  <span className="font-mono text-4xl font-bold text-[#E94560]/20 select-none">
                    BaT
                  </span>
                </div>
              </div>
            )}
            {/* Gradient overlay on image */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0F172A]/60 md:block hidden" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 via-transparent to-transparent md:hidden" />
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col justify-between p-6 md:p-8">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
                Featured Auction
              </p>
              <h3 className="text-xl font-bold leading-snug text-white md:text-2xl group-hover:text-gray-100 transition-colors">
                {auction.title}
              </h3>
            </div>

            {/* Stats row */}
            <div className="mt-6 flex flex-wrap items-center gap-6">
              {/* Current bid */}
              {currentBid != null && currentBid > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Current Bid</p>
                  <p className="font-mono text-2xl font-bold text-white tabular-nums">
                    {USDollar.format(currentBid)}
                  </p>
                </div>
              )}

              {/* Countdown */}
              {deadline && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    Time Remaining
                  </p>
                  <p className="font-mono text-2xl font-bold tabular-nums text-[#FFB547]">
                    <CountdownInline deadline={deadline} />
                  </p>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="mt-8">
              <span className="inline-flex items-center gap-2 rounded-xl bg-[#E94560] px-6 py-3 text-sm font-semibold text-white transition-colors group-hover:bg-[#E94560]/90">
                Trade Now
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </section>
  );
}
