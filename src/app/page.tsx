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
      loading: () => (
        <div className="tw-flex tw-justify-center tw-items-center tw-h-[500px]">
          <PropagateLoader color="#f9e700" />
        </div>
      ),
    }
  );
  return DynamicComponent;
};

//Dynamic Imports
const DynamicCarousel = withDynamicImport("carousel");
const DynamicLiveGames = withDynamicImport("live_games");
const DynamicTeamBattles = withDynamicImport("team_battles");
const DynamicTournaments = withDynamicImport("tournaments");
const DynamicNewEraWagering = withDynamicImport("new_era_wagering");
const DynamicGamesByMake = withDynamicImport("games_by_make");
const DynamicWagerByCategory = withDynamicImport("wager_by_category");
const DynamicSkillStrategyAndStakes = withDynamicImport(
  "skills_strategy_and_stakes"
);
const DynamicNewGames = withDynamicImport("new_games");
const DynamicWhatsTrending = withDynamicImport("whats_trending");
const DynamicMostExpensiveCars = withDynamicImport("most_expensive_cars");
const DynamicMostBids = withDynamicImport("most_bids");
const DynamicHowHammerShiftWorks = withDynamicImport("how_hammeshift_works");
const DynamicSubscribe = withDynamicImport("subscribe");
const DynamicFooter = withDynamicImport("footer");

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
  console.log(isLiveGamesVisible);
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
      if (window.scrollY >= 500) {
        setIsTeamBattlesVisible(true);
      }
      if (window.scrollY >= 1000) {
        setIsTournamentsVisible(true);
      }
      if (window.scrollY >= 1500) {
        setIsNewEraWageringVisible(true);
      }
      if (window.scrollY >= 2500) {
        setIsGamesByMakeVisible(true);
      }
      if (window.scrollY >= 3000) {
        setIsWagerByCategoryVisible(true);
      }
      if (window.scrollY >= 4000) {
        setIsSkillsStrategyAndStakesVisible(true);
      }
      if (window.scrollY >= 4800) {
        setIsNewGamesVisible(true);
        setIsWhatsTrendingVisible(true);
        setIsMostBidsVisible(true);
        setIsMostExpensiveCarsVisible(true);
      }
      if (window.scrollY >= 5400) {
        setIsHowHammerShiftWorksVisible(true);
      }
      if (window.scrollY >= 5600) {
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
