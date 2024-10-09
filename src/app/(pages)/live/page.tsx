"use client";

import Footer from "@/app/components/footer";
import HowHammerShiftWorks from "@/app/components/how_hammeshift_works";
import LiveGames from "@/app/components/live_games";
import LivePageCarousel from "@/app/components/live_page_carousel";
import NewEraWagering from "@/app/components/new_era_wagering";
import Subscribe from "@/app/components/subscribe";
import { getCarsWithMostPot } from "@/lib/data";
import React, { useEffect, useRef, useState } from "react";

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

  const NUM_DISPLAY = screenWidth < 1200 ? 3 : 5;

  return (
    <div className="tw-flex tw-flex-col tw-justify-center">
      <div className="section-container tw-m-auto">
        <LiveGames numberToDisplay={NUM_DISPLAY} />
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
