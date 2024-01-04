"use client";

import "./styles/app.css";
import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { PropagateLoader } from "react-spinners";
// import useIntersectionObserver from "./api/intersectionObserver/intersectionObserver";

const withDynamicImport = (componentPath: string, options = {}) => {
  const DynamicComponent = dynamic(
    () => import(`@/app/components/${componentPath}`),
    {
      ...options,
      ssr: false,
    }
  );
  return DynamicComponent;
};

//Dynamic Imports
const DynamicCarousel = withDynamicImport("carousel", {
  loading: () => (
    <div className="section-container tw-my-10 tw-bg-gray-800 tw-py-8 sm:tw-py-16">
     <header className="tw-flex tw-justify-between">
        <div className="tw-flex tw-items-center">
        </div>
      </header>
      <div className="tw-flex tw-items-center tw-justify-center tw-mt-10">
        <div className="tw-w-[200px] sm:tw-w-[416px] bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
  </div>
  ),
});
const DynamicLiveGames = withDynamicImport("live_games", {
  loading: () => (
    <div className="section-container tw-bg-gray-800 tw-py-8 sm:tw-py-16">
      <header className="tw-flex tw-justify-between">
        <div className="tw-flex tw-items-center">
          <div className="tw-w-10 tw-h-10 tw-bg-gray-700 rounded-full animate-pulse"></div>
          <div className="tw-font-bold tw-text-2xl sm:tw-text-3xl tw-ml-4 tw-bg-gray-700 animate-pulse"></div>
        </div>
        <div className="tw-flex">
          <div className="tw-w-8 tw-h-8 tw-bg-gray-700 rounded-full animate-pulse"></div>
          <div className="tw-w-8 tw-h-8 tw-ml-4 tw-bg-gray-700 rounded-full animate-pulse"></div>
        </div>
      </header>
      <div className="tw-flex tw-items-center tw-justify-center tw-mt-10">
        <div className="tw-w-[200px] sm:tw-w-[416px] bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    </div>
  ),
});
const DynamicTeamBattles = withDynamicImport("team_battles", {
  loading: () => (
    <div className="section-container tw-py-8 sm:tw-py-16">
      <header className="tw-flex tw-justify-between">
        <div className="tw-flex tw-items-center">
          <div className="tw-font-bold tw-text-2xl sm:tw-text-3xl tw-ml-4"></div>
        </div>
        <div className="tw-flex"></div>
      </header>
      <section className="left-container tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-8 md:tw-gap-16 tw-mt-8 sm:tw-mt-16">
        <div className="tw-h-[388px] tw-w-auto tw-bg-cover tw-rounded-lg tw-p-4 tw-flex tw-flex-col tw-justify-end">
          <div className="tw-text-2xl tw-font-medium"></div>
          <div className="tw-flex tw-items-center"></div>
        </div>
        <div className="right-container tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 tw-gap-16 xl:tw-gap-16 tw-w-auto tw-h-auto">
          <div className="tw-relative">
            <div className="tw-px-5 tw-w-full tw-h-[356px]">
              <div className="tw-font-bold tw-text-[18px]"></div>
              <div className="tw-text-[14px]"></div>
              <div className="tw-relative tw-mt-4"></div>
            </div>
          </div>

          <div className="tw-relative tw-pb-8 sm:tw-pb-0">
            <div className="tw-px-5 tw-w-full tw-h-[356px]">
              <div className="tw-font-bold tw-text-[18px]"></div>
              <div className="tw-text-[14px]"></div>
              <div className="tw-relative tw-mt-4"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  ),
});
const DynamicTournaments = withDynamicImport("tournaments", {
  loading: () => (
    <div className="tw-flex tw-justify-center tw-items-center tw-h-[500px]">
      <PropagateLoader color="#f9e700" />
    </div>
  ),
});
const DynamicNewEraWagering = withDynamicImport("new_era_wagering", {
  loading: () => (
    <div className="tw-flex tw-justify-center tw-items-center tw-h-[500px]">
      <PropagateLoader color="#f9e700" />
    </div>
  ),
});
const DynamicGamesByMake = withDynamicImport("games_by_make", {
  loading: () => (
    <div className="tw-flex tw-justify-center tw-items-center tw-h-[500px]">
      <PropagateLoader color="#f9e700" />
    </div>
  ),
});
const DynamicWagerByCategory = withDynamicImport("wager_by_category", {
  loading: () => (
    <div className="tw-flex tw-justify-center tw-items-center tw-h-[500px]">
      <PropagateLoader color="#f9e700" />
    </div>
  ),
});
const DynamicSkillStrategyAndStakes = withDynamicImport(
  "skills_strategy_and_stakes"
);
const DynamicNewGames = withDynamicImport("new_games", {
  loading: () => (
    <div className="tw-flex tw-justify-center tw-items-center tw-h-[500px]">
      <PropagateLoader color="#f9e700" />
    </div>
  ),
});
const DynamicWhatsTrending = withDynamicImport("whats_trending", {
  loading: () => (
    <div className="tw-flex tw-justify-center tw-items-center tw-h-[500px]">
      <PropagateLoader color="#f9e700" />
    </div>
  ),
});
const DynamicMostExpensiveCars = withDynamicImport("most_expensive_cars", {
  loading: () => (
    <div className="tw-flex tw-justify-center tw-items-center tw-h-[500px]">
      <PropagateLoader color="#f9e700" />
    </div>
  ),
});
const DynamicMostBids = withDynamicImport("most_bids");
const DynamicHowHammerShiftWorks = withDynamicImport("how_hammeshift_works", {
  loading: () => (
    <div className="tw-flex tw-justify-center tw-items-center tw-h-[500px]">
      <PropagateLoader color="#f9e700" />
    </div>
  ),
});
const DynamicSubscribe = withDynamicImport("subscribe", {
  loading: () => (
    <div className="tw-flex tw-justify-center tw-items-center tw-h-[500px]">
      <PropagateLoader color="#f9e700" />
    </div>
  ),
});
const DynamicFooter = withDynamicImport("footer", {
  loading: () => (
    <div className="tw-flex tw-justify-center tw-items-center tw-h-[500px]">
      <PropagateLoader color="#f9e700" />
    </div>
  ),
});

const Homepage = () => {
  // References
  const liveGamesRef = useRef<HTMLDivElement | null>(null);
  const teamBattlesRef = useRef<HTMLDivElement | null>(null);
  const tournamentsRef = useRef<HTMLDivElement | null>(null);
  const newEraWageringRef = useRef<HTMLDivElement | null>(null);
  const gamesByMakeRef = useRef<HTMLDivElement | null>(null);
  const wagerByCategoryRef = useRef<HTMLDivElement | null>(null);
  const skillsStrategyAndStakesRef = useRef<HTMLDivElement | null>(null);
  const newGamesRef = useRef<HTMLDivElement | null>(null);
  const whatsTrendingRef = useRef<HTMLDivElement | null>(null);
  const mostExpensiveCarsRef = useRef<HTMLDivElement | null>(null);
  const mostBidsRef = useRef<HTMLDivElement | null>(null);
  const howHammershiftWorksRef = useRef<HTMLDivElement | null>(null);
  const subscribeRef = useRef<HTMLDivElement | null>(null);

  //Component Visibility State
  const [isLiveGamesVisible, setIsLiveGamesVisible] = useState(true);
  const [isTeamBattlesVisible, setIsTeamBattlesVisible] = useState(false);
  const [isTournamentsVisible, setIsTournamentsVisible] = useState(false);
  const [isNewEraWageringVisible, setIsNewEraWageringVisible] = useState(false);
  const [isGamesByMakeVisible, setIsGamesByMakeVisible] = useState(false);
  const [isWagerByCategoryVisible, setIsWagerByCategoryVisible] =
    useState(false);
  const [
    isSkillsStrategyAndStakesVisible,
    setIsSkillsStrategyAndStakesVisible,
  ] = useState(false);
  const [isNewGamesVisible, setIsNewGamesVisible] = useState(false);
  const [isWhatsTrendingRef, setIsWhatsTrendingVisible] = useState(false);
  const [isMostExpensiveCarsVisible, setIsMostExpensiveCarsVisible] =
    useState(false);
  const [isMostBidsVisible, setIsMostBidsVisible] = useState(false);
  const [isHowHammershiftWorksVisible, setIsHowHammerShiftWorksVisible] =
    useState(false);
  const [isSubscribeVisible, setIsSubscribeVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY >= 250) {
        setIsLiveGamesVisible(true);
      }
      if (window.scrollY >= 400) {
        setIsTeamBattlesVisible(true);
      }
      if (window.scrollY >= 800) {
        setIsTournamentsVisible(true);
      }
      if (window.scrollY >= 1200) {
        setIsNewEraWageringVisible(true);
      }
      if (window.scrollY >= 2000) {
        setIsGamesByMakeVisible(true);
      }
      if (window.scrollY >= 2400) {
        setIsWagerByCategoryVisible(true);
      }
      if (window.scrollY >= 2800) {
        setIsSkillsStrategyAndStakesVisible(true);
      }
      if (window.scrollY >= 3200) {
        setIsNewGamesVisible(true);
        setIsWhatsTrendingVisible(true);
        setIsMostBidsVisible(true);
        setIsMostExpensiveCarsVisible(true);
      }
      if (window.scrollY >= 3600) {
        setIsHowHammerShiftWorksVisible(true);
      }
      if (window.scrollY >= 4000) {
        setIsSubscribeVisible(true);
      }
    };
    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="2xl:tw-flex tw-flex-col tw-items-center">
      <DynamicCarousel />
      <div ref={liveGamesRef}>
        {isLiveGamesVisible ? <DynamicLiveGames /> : null}
      </div>
      <div ref={teamBattlesRef}>
        {isTeamBattlesVisible ? <DynamicTeamBattles /> : null}
      </div>
      <div ref={tournamentsRef}>
        {isTournamentsVisible ? <DynamicTournaments /> : null}
      </div>
      <div ref={newEraWageringRef}>
        {isNewEraWageringVisible ? <DynamicNewEraWagering /> : null}
      </div>
      <div ref={gamesByMakeRef}>
        {isGamesByMakeVisible ? <DynamicGamesByMake /> : null}
      </div>
      <div ref={wagerByCategoryRef}>
        {isWagerByCategoryVisible ? <DynamicWagerByCategory /> : null}
      </div>
      <div ref={skillsStrategyAndStakesRef}>
        {isSkillsStrategyAndStakesVisible ? (
          <DynamicSkillStrategyAndStakes />
        ) : null}
      </div>
      <div ref={newGamesRef}>
        {isNewGamesVisible ? <DynamicNewGames /> : null}
      </div>
      <div ref={whatsTrendingRef}>
        {isWhatsTrendingRef ? <DynamicWhatsTrending /> : null}
      </div>
      <div ref={mostExpensiveCarsRef}>
        {isMostExpensiveCarsVisible ? <DynamicMostExpensiveCars /> : null}
      </div>
      <div ref={mostBidsRef}>
        {isMostBidsVisible ? <DynamicMostBids /> : null}
      </div>
      <div ref={howHammershiftWorksRef}>
        {isHowHammershiftWorksVisible ? <DynamicHowHammerShiftWorks /> : null}
      </div>
      <div ref={subscribeRef}>
        {isSubscribeVisible ? <DynamicSubscribe /> : null}
      </div>
      <DynamicFooter />
    </div>
  );
};
export default Homepage;
