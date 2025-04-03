"use client";

import "./styles/app.css";
import Footer from "@/app/components/footer";
import HowHammerShiftWorks from "@/app/components/how_hammeshift_works";
import LiveGames from "@/app/components/live_games";
import LivePageCarousel from "@/app/components/live_page_carousel";
import NewEraWagering from "@/app/components/new_era_wagering";
import Subscribe from "@/app/components/subscribe";
import { getCarsWithMostPot } from "@/lib/data";
import React, { useEffect, useRef, useState } from "react";
import Carousel from "./components/carousel";
import AuctionHero from "./components/auction_hero";
import { GameModes } from "./components/game_modes";
import { AIAgents } from "./components/ai_agents";
import { LiveAuctions } from "./components/live_auctions";
import Image from "next/image";
import HammershiftLogo from "../../public/images/hammershift-logo.svg";
import MiniLeaderboard from "./components/mini_leaderboard";

const LivePage = () => {
  const [screenWidth, setScreenWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    handleResize(); // Check on initial render
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const NUM_DISPLAY = screenWidth < 1400 && screenWidth > 996 ? 2 : 3;
  return (
    <div className="tw-flex tw-flex-col tw-justify-center">
      <section
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        className="tw-relative tw-flex tw-min-h-[50vh] tw-items-center tw-justify-center"
      >
        <div className="tw-absolute tw-inset-0 tw-bg-[#0C1924]/70"></div>
        <div className="tw-relative tw-z-10">
          <div className="section-container tw-mx-auto tw-flex tw-min-h-[50vh] tw-w-full tw-flex-col tw-items-center tw-justify-center tw-gap-5">
            {" "}
            {/* <Image
              alt="hammershift-logo"
              src={HammershiftLogo}
              width={800}
            ></Image> */}
            <AuctionHero />
          </div>
        </div>
      </section>

      {/* <LivePageCarousel /> */}
      <section className="section-container tw-mx-auto tw-flex tw-justify-between max-lg:tw-flex-col">
        {/* <LiveGames numberToDisplay={NUM_DISPLAY} />
        <MiniLeaderboard /> */}
        <GameModes />
      </section>
      {/* AI Agents */}
      <section className="section-container tw-mx-auto tw-bg-[#0A1621] tw-px-4 tw-py-12">
        <AIAgents />
      </section>
      {/* Live Auctions*/}
      <section className="section-container tw-mx-auto tw-px-4 tw-py-12">
        <div className="tw-mb-6 tw-flex tw-items-center tw-justify-between">
          <h2 className="tw-text-3xl tw-font-bold">LIVE AUCTIONS</h2>
        </div>
        <LiveAuctions />
      </section>
      {/* <div className="section-container tw-mx-auto tw-mb-10">
        <Carousel />
      </div> */}

      {/* <NewEraWagering /> */}
      <HowHammerShiftWorks />
      <Subscribe />
      <div>
        <Footer />
      </div>
    </div>
  );
};

export default LivePage;
