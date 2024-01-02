"use client";

import "./styles/app.css";
import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { PropagateLoader } from "react-spinners";
import useIntersectionObserver from "./api/intersectionObserver/intersectionObserver";

//Dynamic Imports
const DynamicCarousel = dynamic(() => import("@/app/components/carousel"), {
  ssr: false,
  loading: () => (
    <div className="tw-flex tw-justify-center tw-items-center tw-h-[500px]">
      <PropagateLoader color="#f9e700" />
    </div>
  ),
});
const DynamicLiveGames = dynamic(() => import("@/app/components/live_games"), {
  ssr: false,
  loading: () => (
    <div className="tw-flex tw-justify-center tw-items-center tw-h-[500px]">
      <PropagateLoader color="#f9e700" />
    </div>
  ),
});

const DynamicTeamBattles = dynamic(
  () => import("@/app/components/team_battles"),
  {
    ssr: false,
    loading: () => (
      <div className="tw-flex tw-justify-center tw-items-center tw-h-[500px]">
        <PropagateLoader color="#f9e700" />
      </div>
    ),
  }
);
const DynamicTournaments = dynamic(
  () => import("@/app/components/tournaments"),
  {
    ssr: false,
    loading: () => (
      <div className="tw-flex tw-justify-center tw-items-center tw-h-[500px]">
        <PropagateLoader color="#f9e700" />
      </div>
    ),
  }
);
const DynamicNewEraWagering = dynamic(
  () => import("@/app/components/new_era_wagering"),
  {
    ssr: false,
    loading: () => (
      <div className="tw-flex tw-justify-center tw-items-center tw-h-[500px]">
        <PropagateLoader color="#f9e700" />
      </div>
    ),
  }
);
const DynamicGamesByMake = dynamic(
  () => import("@/app/components/games_by_make"),
  {
    ssr: false,
    loading: () => (
      <div className="tw-flex tw-justify-center tw-items-center tw-h-[500px]">
        <PropagateLoader color="#f9e700" />
      </div>
    ),
  }
);
const DynamicWagerByCategory = dynamic(
  () => import("@/app/components/wager_by_category"),
  {
    ssr: false,
    loading: () => (
      <div className="tw-flex tw-justify-center tw-items-center tw-h-[500px]">
        <PropagateLoader color="#f9e700" />
      </div>
    ),
  }
);
const DynamicSkillStrategyAndStakes = dynamic(
  () => import("@/app/components/skills_strategy_and_stakes"),
  {
    ssr: false,
    loading: () => (
      <div className="tw-flex tw-justify-center tw-items-center tw-h-[500px]">
        <PropagateLoader color="#f9e700" />
      </div>
    ),
  }
);
const DynamicNewGames = dynamic(() => import("@/app/components/new_games"), {
  ssr: false,
  loading: () => (
    <div className="tw-flex tw-justify-center tw-items-center tw-h-[500px]">
      <PropagateLoader color="#f9e700" />
    </div>
  ),
});
const DynamicWhatsTrending = dynamic(
  () => import("@/app/components/whats_trending"),
  {
    ssr: false,
    loading: () => (
      <div className="tw-flex tw-justify-center tw-items-center tw-h-[500px]">
        <PropagateLoader color="#f9e700" />
      </div>
    ),
  }
);
const DynamicMostExpensiveCars = dynamic(
  () => import("@/app/components/most_expensive_cars"),
  {
    ssr: false,
    loading: () => (
      <div className="tw-flex tw-justify-center tw-items-center tw-h-[500px]">
        <PropagateLoader color="#f9e700" />
      </div>
    ),
  }
);
const DynamicMostBids = dynamic(() => import("@/app/components/most_bids"), {
  ssr: false,
  loading: () => (
    <div className="tw-flex tw-justify-center tw-items-center tw-h-[500px]">
      <PropagateLoader color="#f9e700" />
    </div>
  ),
});
const DynamicHowHammerShiftWorks = dynamic(
  () => import("@/app/components/how_hammeshift_works"),
  {
    ssr: false,
    loading: () => (
      <div className="tw-flex tw-justify-center tw-items-center tw-h-[500px]">
        <PropagateLoader color="#f9e700" />
      </div>
    ),
  }
);
const DynamicSubscribe = dynamic(() => import("@/app/components/subscribe"), {
  ssr: false,
  loading: () => (
    <div className="tw-flex tw-justify-center tw-items-center tw-h-[500px]">
      <PropagateLoader color="#f9e700" />
    </div>
  ),
});
const DynamicFooter = dynamic(() => import("@/app/components/footer"), {
  ssr: false,
  loading: () => (
    <div className="tw-flex tw-justify-center tw-items-center tw-h-[500px]">
      <PropagateLoader color="#f9e700" />
    </div>
  ),
});

const Homepage = () => {
  const liveGamesRef = useRef<HTMLDivElement | null>(null);
  const isLiveGamesVisible = useIntersectionObserver(liveGamesRef);
  const teamBattlesRef = useRef<HTMLDivElement | null>(null);
  const isTeamBattlesVisible = useIntersectionObserver(teamBattlesRef);
  const tournamentsRef = useRef<HTMLDivElement | null>(null);
  const isTournamentsVisible = useIntersectionObserver(tournamentsRef);
  const newEraWageringRef = useRef<HTMLDivElement | null>(null);
  const isNewEraWageringVisible = useIntersectionObserver(newEraWageringRef);
  const gamesByMakeRef = useRef<HTMLDivElement | null>(null);
  const isGamesByMakeVisible = useIntersectionObserver(gamesByMakeRef);
  const wagerByCategoryRef = useRef<HTMLDivElement | null>(null);
  const isWagerByCategory = useIntersectionObserver(wagerByCategoryRef);
  const skillsStrategyAndStakesRef = useRef<HTMLDivElement | null>(null);
  const isSkillsStrategyAndStakesVisible = useIntersectionObserver(
    skillsStrategyAndStakesRef
  );
  const newGamesRef = useRef<HTMLDivElement | null>(null);
  const isNewGamesVisible = useIntersectionObserver(newGamesRef);
  const whatsTrendingRef = useRef<HTMLDivElement | null>(null);
  const isWhatsTrendingRef = useIntersectionObserver(whatsTrendingRef);
  const mostExpensiveCarsRef = useRef<HTMLDivElement | null>(null);
  const isMostExpensiveCarsVisible =
    useIntersectionObserver(mostExpensiveCarsRef);
  const mostBidsRef = useRef<HTMLDivElement | null>(null);
  const isMostBidsVisible = useIntersectionObserver(mostBidsRef);
  const howHammershiftWorksRef = useRef<HTMLDivElement | null>(null);
  const isHowHammershiftWorksVisible = useIntersectionObserver(
    howHammershiftWorksRef
  );
  const subscribeRef = useRef<HTMLDivElement | null>(null);
  const isSubscribeVisible = useIntersectionObserver(subscribeRef);

  return (
    <div className="2xl:tw-flex tw-flex-col tw-items-center">
      <DynamicCarousel />
      <div ref={liveGamesRef}>{isLiveGamesVisible && <DynamicLiveGames />}</div>
      <div ref={teamBattlesRef}>
        {isTeamBattlesVisible && <DynamicTeamBattles />}
      </div>
      <div ref={tournamentsRef}>
        {isTournamentsVisible && <DynamicTournaments />}
      </div>
      <div ref={newEraWageringRef}>
        {isNewEraWageringVisible && <DynamicNewEraWagering />}
      </div>
      <div ref={gamesByMakeRef}>
        {isGamesByMakeVisible && <DynamicGamesByMake />}
      </div>
      <div ref={wagerByCategoryRef}>
        {isWagerByCategory && <DynamicWagerByCategory />}
      </div>
      <div ref={skillsStrategyAndStakesRef}>
        {isSkillsStrategyAndStakesVisible && <DynamicSkillStrategyAndStakes />}
      </div>
      <div ref={newGamesRef}>{isNewGamesVisible && <DynamicNewGames />}</div>
      <div ref={whatsTrendingRef}>
        {isWhatsTrendingRef && <DynamicWhatsTrending />}
      </div>
      <div ref={mostExpensiveCarsRef}>
        {isMostExpensiveCarsVisible && <DynamicMostExpensiveCars />}
      </div>
      <div ref={mostBidsRef}>{isMostBidsVisible && <DynamicMostBids />}</div>
      <div ref={howHammershiftWorksRef}>
        {isHowHammershiftWorksVisible && <DynamicHowHammerShiftWorks />}
      </div>
      <div ref={subscribeRef}>{isSubscribeVisible && <DynamicSubscribe />}</div>
      <DynamicFooter />
    </div>
  );
};
export default Homepage;
