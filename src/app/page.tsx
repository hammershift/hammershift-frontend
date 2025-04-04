"use client";

import "./styles/app.css";
import Footer from "@/app/components/footer";
import Link from "next/link";

import LiveGames from "@/app/components/live_games";
import LivePageCarousel from "@/app/components/live_page_carousel";
import NewEraWagering from "@/app/components/new_era_wagering";
import Subscribe from "@/app/components/subscribe";
import { getCarsWithMostPot } from "@/lib/data";
import React, { useEffect, useRef, useState } from "react";
import Carousel from "./components/carousel";
import AuctionHero from "./components/auction_hero";
import { Button } from "./components/ui/button";
import { GameModes } from "./components/game_modes";
import { AIAgents } from "./components/ai_agents";
import { LiveAuctions } from "./components/live_auctions";
import { DollarSign, Timer, Users, Car } from "lucide-react";
import { Leaderboard } from "./components/leaderboard";
import { HowItWorks } from "./components/how_it_works";
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
                {/* <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">LIVE AUCTIONS</h2>
        </div> */}
                <LiveAuctions />
                <p className="mt-4 text-center text-sm text-gray-300">
                    Participating in live auctions is subject to terms and
                    conditions.
                </p>
            </section>
            {/* Stats Row*/}
            <section className="bg-[#13202D] py-10">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                        <div className="text-center">
                            <Car className="mx-auto mb-2 h-8 w-8 text-[#F2CA16]" />
                            <div className="text-3xl font-bold text-[#F2CA16]">
                                💰??
                            </div>
                            <div className="text-gray-300">
                                Prize Money Awarded
                            </div>
                        </div>
                        <div className="text-center">
                            <Users className="mx-auto mb-2 h-8 w-8 text-[#F2CA16]" />
                            <div className="text-3xl font-bold text-[#F2CA16]">
                                12,400+
                            </div>
                            <div className="text-gray-300">Active Players</div>
                        </div>
                        <div className="text-center">
                            <DollarSign className="mx-auto mb-2 h-8 w-8 text-[#F2CA16]" />
                            <div className="text-3xl font-bold text-[#F2CA16]">
                                💰??
                            </div>
                            <div className="text-gray-300">
                                Avg. Tournament Prize
                            </div>
                        </div>
                        <div className="text-center">
                            <Timer className="mx-auto mb-2 h-8 w-8 text-[#F2CA16]" />
                            <div className="text-3xl font-bold text-[#F2CA16]">
                                97%
                            </div>
                            <div className="text-gray-300">
                                Player Satisfaction
                            </div>
                        </div>
                    </div>
                    <p className="mt-4 text-center text-sm text-gray-300">
                        Statistics are subject to change based on player
                        participation.
                    </p>
                </div>
            </section>
            {/* Leaderboard */}
            <section className="section-container mx-auto px-4 py-12">
                <Leaderboard />
                <p className="mt-4 text-center text-sm text-gray-300">
                    Leaderboard results are based on game performance and do not
                    guarantee any winnings.
                </p>
            </section>
            {/* How It Works */}
            <section className="section-container mx-auto px-4 py-12">
                <HowItWorks />
                <p className="mt-4 text-center text-sm text-gray-300">
                    For information on how to play and the mechanics involved,
                    please refer to our guidelines.
                </p>
            </section>
            {/* CTA Section */}
            <section className="bg-[#13202D] py-16">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="mb-4 text-3xl font-bold">
                        READY TO <span className="text-[#F2CA16]">START</span>{" "}
                        PLAYING?
                    </h2>
                    <p className="mx-auto mb-8 max-w-2xl text-xl">
                        Join Velocity Markets today and start predicting auction
                        prices to win prizes.
                    </p>
                    <Link href="/">
                        <Button className="bg-[#F2CA16] px-8 py-6 text-lg text-[#0C1924] hover:bg-[#F2CA16]/90">
                            SIGN UP NOW
                        </Button>
                    </Link>
                    <p className="mt-4 text-sm text-gray-300">
                        Please read our terms and conditions before signing up.
                    </p>
                </div>
            </section>
            {/* <div className="section-container mx-auto mb-10">
        <Carousel />
      </div> */}

            {/* <NewEraWagering /> */}
            {/* <HowHammerShiftWorks /> */}
            {/* <Subscribe /> */}
        </div>
    );
};

export default LivePage;
