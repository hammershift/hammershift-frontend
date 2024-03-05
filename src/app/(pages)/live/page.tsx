"use client";

import Footer from "@/app/components/footer";
import HowHammerShiftWorks from "@/app/components/how_hammeshift_works";
import LiveGames from "@/app/components/live_games";
import LivePageCarousel from "@/app/components/live_page_carousel";
import NewEraWagering from "@/app/components/new_era_wagering";
import Subscribe from "@/app/components/subscribe";
import React, { useEffect, useRef, useState } from "react";

const LivePage = () => {
    return (
        <div>
            <LivePageCarousel />
            <div className="section-container tw-m-auto">
                <LiveGames />
            </div>
            <div className="section-container tw-m-auto">
                <NewEraWagering />
            </div>
            <div className="section-container tw-m-auto">
                <HowHammerShiftWorks />
            </div>
            <div className="section-container tw-m-auto">
                <Subscribe />
            </div>
            <div className="section-container tw-m-auto">
                <Footer />
            </div>
        </div>
    );
};

export default LivePage;
