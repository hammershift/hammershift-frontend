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
    <div className="flex flex-col justify-center">
      <section
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        className="relative flex min-h-[50vh] items-center justify-center"
      >
        <div className="absolute inset-0 bg-[#0C1924]/70"></div>
        <div className="relative z-10">
          <div className="section-container mx-auto flex min-h-[50vh] w-full flex-col items-center justify-center gap-5">
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
      <section className="section-container mx-auto flex justify-between max-lg:flex-col">
        {/* <LiveGames numberToDisplay={NUM_DISPLAY} />
        <MiniLeaderboard /> */}
        <GameModes />
      </section>
      {/* AI Agents */}
      <section className="section-container mx-auto bg-[#0A1621] px-4 py-12">
        <AIAgents />
      </section>
      {/* Live Auctions*/}
      <section className="section-container mx-auto px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold">LIVE AUCTIONS</h2>
        </div>
        <LiveAuctions />
      </section>
      {/* <div className="section-container mx-auto mb-10">
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
