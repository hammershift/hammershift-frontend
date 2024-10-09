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
  return (
    <div className="tw-flex tw-flex-col tw-justify-center">
      <div className="section-container tw-m-auto">
        <LiveGames numberToDisplay={6} numberOfRows={2} />
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
