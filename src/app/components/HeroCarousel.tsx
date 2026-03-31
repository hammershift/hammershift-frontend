'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import Link from 'next/link';
import CountdownInline from './CountdownInline';
import LiveBadge from './LiveBadge';
import BookmarkButton from './BookmarkButton';

interface FeaturedMarket {
  _id: string;
  question: string;
  yesPrice: number;
  noPrice: number;
  totalVolume: number;
  auction: {
    title: string | null;
    image: string | null;
    deadline: string | null;
  };
}

interface HeroCarouselProps {
  markets: FeaturedMarket[];
}

export default function HeroCarousel({ markets }: HeroCarouselProps) {
  if (markets.length === 0) {
    return (
      <section className="relative flex min-h-[50vh] items-center justify-center overflow-hidden bg-[#0A0A1A]">
        <div className="absolute inset-0">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-[#F2CA16]/[0.04] blur-[120px]" />
          <div className="absolute right-1/4 top-1/3 h-[300px] w-[300px] rounded-full bg-[#00D4AA]/[0.03] blur-[100px]" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0A0A1A]" />
        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <h1 className="mb-3 text-5xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl">
            Predict Car Auction Prices.{' '}
            <span className="text-[#F2CA16]">Win Real Prizes.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-300 md:text-xl">
            Join tournaments, guess the hammer price, and compete against car enthusiasts
            on the world&apos;s first automotive prediction platform.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/tournaments"
              className="rounded-full bg-[#00D4AA] px-8 py-3 text-sm font-semibold text-black transition hover:bg-[#00B894]"
            >
              Enter a Tournament
            </Link>
            <Link
              href="/price_is_right"
              className="rounded-full border border-white/20 px-8 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/[0.05]"
            >
              Play Free
            </Link>
          </div>
        </div>
      </section>
    );
  }

  function formatVolume(cents: number): string {
    const dollars = cents / 100;
    if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`;
    if (dollars >= 1_000) return `$${(dollars / 1_000).toFixed(1)}K`;
    if (dollars > 0) return `$${dollars.toFixed(0)}`;
    return "$0";
  }

  return (
    <section className="relative w-full overflow-hidden">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: 8000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        loop={markets.length > 1}
        className="hero-carousel"
      >
        {markets.map((market) => {
          const yesPercent = Math.round(market.yesPrice * 100);
          return (
            <SwiperSlide key={market._id}>
              <div className="relative h-[38vh] min-h-[320px] max-h-[420px] w-full">
                {/* Background image — blurred fill + sharp cover */}
                {market.auction?.image && (
                  <>
                    {/* Blurred fill to prevent letterboxing on small source images */}
                    <img
                      src={market.auction.image}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 h-full w-full object-cover blur-2xl scale-110 opacity-60"
                    />
                    {/* Sharp image on top */}
                    <img
                      src={market.auction.image}
                      alt={market.auction.title ?? ''}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A1A]/90 via-[#0A0A1A]/70 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A1A] via-transparent to-[#0A0A1A]/30" />

                {/* Content overlay */}
                <div className="relative z-10 flex h-full items-center">
                  <div className="mx-auto w-full max-w-6xl px-6">
                    <div className="max-w-lg">
                      {/* Live badge + Countdown */}
                      <div className="flex items-center gap-2 mb-2">
                        {market.auction?.deadline && new Date(market.auction.deadline) > new Date() && (
                          <LiveBadge />
                        )}
                        {market.auction?.deadline && (
                          <p className="text-xs font-mono text-[#FFB547] uppercase tracking-wider">
                            Ends in <CountdownInline deadline={market.auction.deadline} />
                          </p>
                        )}
                      </div>

                      {/* Title */}
                      <h2 className="mb-2 text-2xl font-bold text-white md:text-3xl lg:text-4xl leading-tight">
                        {market.auction?.title ?? market.question}
                      </h2>

                      {/* Question */}
                      <p className="mb-4 text-sm text-gray-300 line-clamp-2">
                        {market.question}
                      </p>

                      {/* Probability */}
                      <div className="mb-4 flex items-baseline gap-3">
                        <span className="text-3xl md:text-4xl font-bold font-mono text-white">
                          {yesPercent}%
                        </span>
                        <span className="text-sm text-gray-400">chance</span>
                        <span className="text-xs font-mono text-gray-500">
                          {formatVolume(market.totalVolume)} volume
                        </span>
                      </div>

                      {/* Quick trade buttons */}
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/trading/${market._id}`}
                          className="rounded-lg bg-[#00D4AA]/20 border border-[#00D4AA]/40 px-6 py-2.5 text-sm font-semibold font-mono text-[#00D4AA] hover:bg-[#00D4AA]/30 transition-colors"
                        >
                          Yes {Math.round(market.yesPrice * 100)}¢
                        </Link>
                        <Link
                          href={`/trading/${market._id}`}
                          className="rounded-lg bg-[#E94560]/20 border border-[#E94560]/40 px-6 py-2.5 text-sm font-semibold font-mono text-[#E94560] hover:bg-[#E94560]/30 transition-colors"
                        >
                          No {Math.round(market.noPrice * 100)}¢
                        </Link>
                        <BookmarkButton marketId={market._id} className="!h-10 !w-10" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Custom Swiper styles */}
      <style jsx global>{`
        .hero-carousel .swiper-pagination-bullet {
          background: rgba(255,255,255,0.3);
          opacity: 1;
        }
        .hero-carousel .swiper-pagination-bullet-active {
          background: #E94560;
        }
        .hero-carousel .swiper-button-prev,
        .hero-carousel .swiper-button-next {
          color: rgba(255,255,255,0.5);
          --swiper-navigation-size: 28px;
          display: none;
        }
        @media (min-width: 768px) {
          .hero-carousel .swiper-button-prev,
          .hero-carousel .swiper-button-next {
            display: flex;
          }
        }
        .hero-carousel .swiper-button-prev:hover,
        .hero-carousel .swiper-button-next:hover {
          color: white;
        }
      `}</style>
    </section>
  );
}
