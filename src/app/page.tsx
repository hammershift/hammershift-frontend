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
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const NUM_DISPLAY = screenWidth < 1400 && screenWidth > 996 ? 2 : 3;
  return (
    <div className="tw-flex tw-flex-col tw-justify-center">
      <div className="section-container tw-m-auto tw-flex tw-flex-col tw-items-center tw-gap-5">
        {" "}
        <Image alt="hammershift-logo" src={HammershiftLogo} width={800}></Image>
        <AuctionHero />
      </div>
      <LivePageCarousel />
      <div className="section-container tw-flex tw-justify-between tw-m-auto max-lg:tw-flex-col">
        <LiveGames numberToDisplay={NUM_DISPLAY} />
        <MiniLeaderboard />
      </div>
      <div className="section-container tw-mx-auto tw-mb-10">
        <Carousel />
      </div>
      <NewEraWagering />
      <HowHammerShiftWorks />
      <Subscribe />
      <div className="tw-m-auto">
        <Footer />
      </div>
    </div>
  );
};

export default LivePage;
