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
  return (
    <div className="tw-flex tw-flex-col tw-justify-center">
      <div className="section-container tw-m-auto tw-flex tw-flex-col tw-items-center tw-gap-5">
        {" "}
        <Image alt="hammershift-logo" src={HammershiftLogo} width={800}></Image>
        <AuctionHero />
      </div>
      <LivePageCarousel />
      <div className="section-container tw-flex tw-justify-between tw-m-auto max-lg:tw-flex-col">
        <LiveGames />
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
