"use client";

import "./styles/app.css";
import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { PropagateLoader } from "react-spinners";

const DynamicCarousel = dynamic(() => import("@/app/components/carousel"), {
  loading: () => (
    <div className="tw-flex tw-justify-center tw-items-center tw-h-[500px]">
      <PropagateLoader color="#f9e700" />
    </div>
  ),
});
const DynamicLiveGames = dynamic(() => import("@/app/components/live_games"), {
  loading: () => (
    <div className="tw-flex tw-justify-center tw-items-center tw-h-[500px]">
      <PropagateLoader color="#f9e700" />
    </div>
  ),
});
const DynamicTeamBattles = dynamic(
  () => import("@/app/components/team_battles"),
  {
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
    loading: () => (
      <div className="tw-flex tw-justify-center tw-items-center tw-h-[500px]">
        <PropagateLoader color="#f9e700" />
      </div>
    ),
  }
);
const DynamicNewGames = dynamic(() => import("@/app/components/new_games"), {
  loading: () => (
    <div className="tw-flex tw-justify-center tw-items-center tw-h-[500px]">
      <PropagateLoader color="#f9e700" />
    </div>
  ),
});
const DynamicWhatsTrending = dynamic(
  () => import("@/app/components/whats_trending"),
  {
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
    loading: () => (
      <div className="tw-flex tw-justify-center tw-items-center tw-h-[500px]">
        <PropagateLoader color="#f9e700" />
      </div>
    ),
  }
);
const DynamicMostBids = dynamic(() => import("@/app/components/most_bids"), {
  loading: () => (
    <div className="tw-flex tw-justify-center tw-items-center tw-h-[500px]">
      <PropagateLoader color="#f9e700" />
    </div>
  ),
});
const DynamicHowHammerShiftWorks = dynamic(
  () => import("@/app/components/how_hammeshift_works"),
  {
    loading: () => (
      <div className="tw-flex tw-justify-center tw-items-center tw-h-[500px]">
        <PropagateLoader color="#f9e700" />
      </div>
    ),
  }
);
const DynamicSubscribe = dynamic(() => import("@/app/components/subscribe"), {
  loading: () => (
    <div className="tw-flex tw-justify-center tw-items-center tw-h-[500px]">
      <PropagateLoader color="#f9e700" />
    </div>
  ),
});
const DynamicFooter = dynamic(() => import("@/app/components/footer"), {
  loading: () => (
    <div className="tw-flex tw-justify-center tw-items-center tw-h-[500px]">
      <PropagateLoader color="#f9e700" />
    </div>
  ),
});

const Homepage = () => {
  const [displaySections, setDisplaySections] = useState({
    teamBattles: false,
    tournaments: false,
    newEraWagering: false,
    gamesByMake: false,
    wagerByCategory: false,
    skillStrategyAndStakes: false,
    newGames: false,
    whatsTrending: false,
    mostExpensiveCars: false,
    mostBids: false,
    howHammershiftWorks: false,
    subscribe: false,
  });

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

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          setDisplaySections((prev) => ({ ...prev, [sectionId]: true }));
          observer.unobserve(entry.target);
        }
      });
    });

    if (teamBattlesRef.current) {
      observer.observe(teamBattlesRef.current);
    }
    if (tournamentsRef.current) {
      observer.observe(tournamentsRef.current);
    }
    if (newEraWageringRef.current) {
      observer.observe(newEraWageringRef.current);
    }
    if (gamesByMakeRef.current) {
      observer.observe(gamesByMakeRef.current);
    }
    if (wagerByCategoryRef.current) {
      observer.observe(wagerByCategoryRef.current);
    }
    if (skillsStrategyAndStakesRef.current) {
      observer.observe(skillsStrategyAndStakesRef.current);
    }
    if (newGamesRef.current) {
      observer.observe(newGamesRef.current);
    }
    if (whatsTrendingRef.current) {
      observer.observe(whatsTrendingRef.current);
    }
    if (mostExpensiveCarsRef.current) {
      observer.observe(mostExpensiveCarsRef.current);
    }
    if (mostBidsRef.current) {
      observer.observe(mostBidsRef.current);
    }
    if (howHammershiftWorksRef.current) {
      observer.observe(howHammershiftWorksRef.current);
    }
    if (subscribeRef.current) {
      observer.observe(subscribeRef.current);
    }

    return () => {
      if (teamBattlesRef.current) {
        observer.unobserve(teamBattlesRef.current);
      }
      if (tournamentsRef.current) {
        observer.unobserve(tournamentsRef.current);
      }
      if (newEraWageringRef.current) {
        observer.unobserve(newEraWageringRef.current);
      }
      if (gamesByMakeRef.current) {
        observer.unobserve(gamesByMakeRef.current);
      }
      if (wagerByCategoryRef.current) {
        observer.unobserve(wagerByCategoryRef.current);
      }
      if (skillsStrategyAndStakesRef.current) {
        observer.unobserve(skillsStrategyAndStakesRef.current);
      }
      if (newGamesRef.current) {
        observer.unobserve(newGamesRef.current);
      }
      if (whatsTrendingRef.current) {
        observer.unobserve(whatsTrendingRef.current);
      }
      if (mostExpensiveCarsRef.current) {
        observer.unobserve(mostExpensiveCarsRef.current);
      }
      if (mostBidsRef.current) {
        observer.unobserve(mostBidsRef.current);
      }
      if (howHammershiftWorksRef.current) {
        observer.unobserve(howHammershiftWorksRef.current);
      }
      if (subscribeRef.current) {
        observer.unobserve(subscribeRef.current);
      }
    };
  }, []);

  return (
    <div className="2xl:tw-flex tw-flex-col tw-items-center">
      <DynamicCarousel />
      <DynamicLiveGames />
      <div id="teamBattles" ref={teamBattlesRef}>
        {displaySections.teamBattles && <DynamicTeamBattles />}
      </div>
      <div id="tournaments" ref={tournamentsRef}>
        {displaySections.tournaments && <DynamicTournaments />}
      </div>
      <div id="newEraWagering" ref={newEraWageringRef}>
        {displaySections.newEraWagering && <DynamicNewEraWagering />}
      </div>
      <div id="gamesByMake" ref={gamesByMakeRef}>
        {displaySections.gamesByMake && <DynamicGamesByMake />}
      </div>
      <div id="wagerByCategory" ref={wagerByCategoryRef}>
        {displaySections.wagerByCategory && <DynamicWagerByCategory />}
      </div>
      <div id="skillStrategyAndStakes" ref={wagerByCategoryRef}>
        {displaySections.skillStrategyAndStakes && (
          <DynamicSkillStrategyAndStakes />
        )}
      </div>
      <div id="newGames" ref={newGamesRef}>
        {displaySections.skillStrategyAndStakes && <DynamicNewGames />}
      </div>
      <div id="whatsTrending" ref={whatsTrendingRef}>
        {displaySections.whatsTrending && <DynamicWhatsTrending />}
      </div>
      <div id="mostExpensiveCars" ref={mostExpensiveCarsRef}>
        {displaySections.mostExpensiveCars && <DynamicMostExpensiveCars />}
      </div>
      <div id="mostBids" ref={mostBidsRef}>
        {displaySections.mostBids && <DynamicMostBids />}
      </div>
      <div id="howHammershiftWorks" ref={howHammershiftWorksRef}>
        {displaySections.howHammershiftWorks && <DynamicHowHammerShiftWorks />}
      </div>
      <div id="subscribe" ref={subscribeRef}>
        {displaySections.subscribe && <DynamicSubscribe />}
      </div>
      <DynamicFooter />
    </div>
  );
};
export default Homepage;
