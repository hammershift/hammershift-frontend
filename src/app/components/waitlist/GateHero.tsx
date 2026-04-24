"use client";
import Image from "next/image";
import type { ReactNode } from "react";

const HERO_SRC = "/images/gate/hero-sonoma-sunset.jpg";
const HERO_ALT =
  "Classic and historic race cars lined up at Sonoma Raceway at sunset";

export default function GateHero({ children }: { children: ReactNode }) {
  return (
    <section
      aria-label="Velocity Markets — founding cohort"
      className="relative w-full min-h-screen overflow-hidden bg-[#0A0A1A]"
    >
      <div className="absolute inset-0">
        <Image
          src={HERO_SRC}
          alt={HERO_ALT}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-[#0A0A1A]/60 via-[#0A0A1A]/20 to-[#0A0A1A]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-[#0A0A1A] via-[#0A0A1A]/75 to-transparent md:w-3/4"
      />
      <div className="absolute top-6 left-6 md:top-8 md:left-10 z-10">
        <Image
          src="/images/brand/velocity-lockup-white.png"
          alt="Velocity"
          width={180}
          height={40}
          priority
          className="h-7 md:h-9 w-auto"
        />
      </div>
      <div className="relative z-10 min-h-screen flex items-end md:items-center">
        <div className="w-full max-w-6xl mx-auto px-6 md:px-10 pb-16 md:pb-0 pt-28">
          <div className="max-w-2xl">{children}</div>
        </div>
      </div>
    </section>
  );
}
