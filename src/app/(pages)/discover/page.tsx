"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
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
    <div className="carousel-container h-[280px] my-10 bg-gray-800 py-8 sm:py-16">
      <div className="flex w-full justify-between p-2">
        <div className="flex flex-col w-full justify-between mt-5">
          <div className="w-20 mb-5 h-5 bg-gray-700 rounded-full animate-pulse"></div>
          <div className="w-2/3 mb-5 h-16 bg-gray-700 rounded-full animate-pulse"></div>
          <div className="w-40 h-10 bg-gray-700 rounded-full animate-pulse"></div>
          <div className="w-[200px] sm:w-[416px] bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        <div className="w-2/3 mb-5 h-30 bg-gray-700 rounded-full animate-pulse"></div>
      </div>
    </div>
  ),
});
const DynamicLiveGames = withDynamicImport("live_games", {
  loading: () => (
    <div className="p-4 bg-gray-800 sm:py-16">
      <div className="flex flex-col">
        <div className="flex justify-between">
          <div className="flex items-center">
            <div className="mr-5 w-8 h-10 bg-gray-700 rounded-full animate-pulse"></div>
            <div className="w-36 h-10 bg-gray-700 rounded-full animate-pulse"></div>
          </div>
          <div className="flex">
            <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
            <div className="w-8 h-8 ml-4 bg-gray-700 rounded-full animate-pulse"></div>
          </div>
        </div>
        <div className="flex w-full mt-8 justify-center items-center max-sm:flex-col">
          <div className="flex flex-col w-full max-sm:flex-row justify-evenly items-center">
            <div className="w-48 mb-5 h-48 rounded-full bg-gray-700 max-md:w-36 max-md:h-36"></div>
            <div className="flex flex-col w-2/3 max-md:w-1/2">
              <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            </div>
          </div>
          <div className="flex flex-col w-full max-sm:flex-row justify-evenly items-center">
            <div className="w-48 mb-5 h-48 rounded-full bg-gray-700 max-md:w-36 max-md:h-36"></div>
            <div className="flex flex-col w-2/3 max-md:w-1/2">
              <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            </div>
          </div>
          <div className="flex flex-col w-full max-sm:flex-row justify-evenly items-center">
            <div className="w-48 mb-5 h-48 rounded-full bg-gray-700 max-md:w-36 max-md:h-36"></div>
            <div className="flex flex-col w-2/3 max-md:w-1/2">
              <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            </div>
          </div>
          <div className="flex flex-col w-full max-sm:flex-row justify-evenly items-center">
            <div className="w-48 mb-5 h-48 rounded-full bg-gray-700 max-md:w-36 max-md:h-36"></div>
            <div className="flex flex-col w-2/3 max-md:w-1/2">
              <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            </div>
          </div>
          <div className="flex flex-col w-full max-sm:flex-row justify-evenly items-center">
            <div className="w-48 mb-5 h-48 rounded-full bg-gray-700 max-md:w-36 max-md:h-36"></div>
            <div className="flex flex-col w-2/3 max-md:w-1/2">
              <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
});
const DynamicTeamBattles = withDynamicImport("team_battles", {
  loading: () => (
    <div className="p-4 bg-gray-800 py-8 sm:py-16">
      <div className="flex flex-col">
        <div className="flex justify-between">
          <div className="flex my-10">
            <div className="mr-5 w-10 h-10 bg-gray-700 rounded-full animate-pulse"></div>
            <div className="w-80 h-10 bg-gray-700 rounded-full animate-pulse"></div>
          </div>
          <div className="flex">
            <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
            <div className="w-8 h-8 ml-4 bg-gray-700 rounded-full animate-pulse"></div>
          </div>
        </div>
        <div className="flex">
          <div className="w-2/3 mb-5 h-72 bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="w-1/3 mx-10 mb-5 h-64 bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="w-1/3 mb-5 h-64 bg-gray-700 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  ),
});
const DynamicTournaments = withDynamicImport("tournaments", {
  loading: () => (
    <div className="p-4 bg-gray-800 py-8 sm:py-16">
      <div className="flex flex-col">
        <div className="flex justify-between">
          <div className="flex my-10">
            <div className="mr-5 w-10 h-10 bg-gray-700 rounded-full animate-pulse"></div>
            <div className="w-80 h-10 bg-gray-700 rounded-full animate-pulse"></div>
          </div>
          <div className="flex">
            <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
            <div className="w-8 h-8 ml-4 bg-gray-700 rounded-full animate-pulse"></div>
          </div>
        </div>
        <div className="flex">
          <div className="w-1/3 mx-10 mb-5 h-64 bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="w-1/3 mx-10 mb-5 h-64 bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="w-1/3 mx-10 mb-5 h-64 bg-gray-700 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  ),
});
const DynamicNewEraWagering = withDynamicImport("new_era_wagering", {
  loading: () => (
    <div className="flex w-full justify-center items-center bg-gray-800 py-8 sm:py-16">
      <div className="flex flex-col">
        <div className="flex justify-between">
          <div className="flex flex-col m-10">
            <div className="m-5 w-80 h-20 bg-gray-700 rounded-full animate-pulse"></div>
            <div className="m-5 w-96 h-20 bg-gray-700 rounded-full animate-pulse"></div>
          </div>
          <div className="flex flex-col m-10">
            <div className="m-5 w-96 h-20 bg-gray-700 rounded-full animate-pulse"></div>
            <div className="m-5 w-96 h-28 bg-gray-700 rounded-full animate-pulse"></div>
            <div className="m-5 flex justify-between">
              <div className="w-36 h-10 bg-gray-700 rounded-full animate-pulse"></div>
              <div className="w-36 h-10 bg-gray-700 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="flex m-10">
          <div className="w-1/3 mx-10 mb-5 h-64 bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="w-1/3 mx-10 mb-5 h-64 bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="w-1/3 mx-10 mb-5 h-64 bg-gray-700 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  ),
});
const DynamicGamesByMake = withDynamicImport("games_by_make", {
  loading: () => (
    <div className="section-container bg-gray-800 py-8 sm:py-16">
      <div className="flex flex-col">
        <div className="flex justify-between">
          <div className="flex my-10">
            <div className="mr-5 w-10 h-10 bg-gray-700 rounded-full animate-pulse"></div>
            <div className="w-80 h-10 bg-gray-700 rounded-full animate-pulse"></div>
          </div>
          <div className="flex">
            <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
            <div className="w-8 h-8 ml-4 bg-gray-700 rounded-full animate-pulse"></div>
          </div>
        </div>
        <div className="flex">
          <div className="w-1/5 mb-5 h-52 bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="w-1/5 mx-10 mb-5 h-52 bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="w-1/5 mb-5 h-52 bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="w-1/5 mx-10 mb-5 h-52 bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="w-1/5 mb-5 h-52 bg-gray-700 rounded-lg animate-pulse"></div>
        </div>
        <div className="flex">
          <div className="w-1/5 mb-5 h-52 bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="w-1/5 mx-10 mb-5 h-52 bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="w-1/5 mb-5 h-52 bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="w-1/5 mx-10 mb-5 h-52 bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="w-1/5 mb-5 h-52 bg-gray-700 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  ),
});
const DynamicWagerByCategory = withDynamicImport("wager_by_category", {
  loading: () => (
    <div className="section-container bg-gray-800 py-8 sm:py-16">
      <div className="flex flex-col">
        <div className="flex justify-between">
          <div className="flex my-10">
            <div className="mr-5 w-10 h-10 bg-gray-700 rounded-full animate-pulse"></div>
            <div className="w-80 h-10 bg-gray-700 rounded-full animate-pulse"></div>
          </div>
        </div>
        <div className="flex justify-between">
          <div className="w-2/3 mb-5 h-52 bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="w-2/3 mx-10 mb-5 h-52 bg-gray-700 rounded-lg animate-pulse"></div>
        </div>
        <div className="flex justify-evenly mt-5">
          <div className="w-1/3 mb-5 h-52 bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="w-1/3 mx-10 mb-5 h-52 bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="w-1/3 mb-5 h-52 bg-gray-700 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  ),
});
const DynamicSkillStrategyAndStakes = withDynamicImport(
  "skills_strategy_and_stakes"
);
const DynamicNewGames = withDynamicImport("new_games", {
  loading: () => (
    <div id="newly_listed" className="section-container h-auto bg-gray-800 py-8 sm:py-16">
      <div className="flex flex-col">
        <div className="flex justify-between">
          <div className="flex items-center">
            <div className="mr-5 w-10 h-10 bg-gray-700 rounded-full animate-pulse"></div>
            <div className="w-36 h-10 bg-gray-700 rounded-full animate-pulse"></div>
          </div>
          <div className="flex">
            <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
            <div className="w-8 h-8 ml-4 bg-gray-700 rounded-full animate-pulse"></div>
          </div>
        </div>
        <div className="flex mt-8 justify-evenly">
          <div className="flex flex-col m-2">
            <div className="w-96 mb-5 h-48 bg-gray-700"></div>
            <div className="w-4/5 h-10 mb-5 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-5 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-10 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-1/3 mb-2 h-10 bg-gray-700 rounded-lg animate-pulse"></div>
          </div>
          <div className="flex flex-col m-2">
            <div className="w-96 mb-5 h-48 bg-gray-700"></div>
            <div className="w-4/5 h-10 mb-5 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-5 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-10 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-1/3 mb-2 h-10 bg-gray-700 rounded-lg animate-pulse"></div>
          </div>
          <div className="flex flex-col m-2">
            <div className="w-96 mb-5 h-48 bg-gray-700"></div>
            <div className="w-4/5 h-10 mb-5 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-5 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-10 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-1/3 mb-2 h-10 bg-gray-700 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  ),
});
const DynamicWhatsTrending = withDynamicImport("whats_trending", {
  loading: () => (
    <div className="section-container h-auto bg-gray-800 py-8 sm:py-16">
      <div className="flex flex-col">
        <div className="flex justify-between">
          <div className="flex items-center">
            <div className="mr-5 w-10 h-10 bg-gray-700 rounded-full animate-pulse"></div>
            <div className="w-36 h-10 bg-gray-700 rounded-full animate-pulse"></div>
          </div>
          <div className="flex">
            <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
            <div className="w-8 h-8 ml-4 bg-gray-700 rounded-full animate-pulse"></div>
          </div>
        </div>
        <div className="flex mt-8 justify-evenly">
          <div className="flex flex-col m-2">
            <div className="w-96 mb-5 h-48 bg-gray-700"></div>
            <div className="w-4/5 h-10 mb-5 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-5 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-10 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-1/3 mb-2 h-10 bg-gray-700 rounded-lg animate-pulse"></div>
          </div>
          <div className="flex flex-col m-2">
            <div className="w-96 mb-5 h-48 bg-gray-700"></div>
            <div className="w-4/5 h-10 mb-5 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-5 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-10 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-1/3 mb-2 h-10 bg-gray-700 rounded-lg animate-pulse"></div>
          </div>
          <div className="flex flex-col m-2">
            <div className="w-96 mb-5 h-48 bg-gray-700"></div>
            <div className="w-4/5 h-10 mb-5 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-5 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-10 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-1/3 mb-2 h-10 bg-gray-700 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  ),
});
const DynamicMostExpensiveCars = withDynamicImport("most_expensive_cars", {
  loading: () => (
    <div id="most_expensive" className="section-container h-auto bg-gray-800 py-8 sm:py-16">
      <div className="flex flex-col">
        <div className="flex justify-between">
          <div className="flex items-center">
            <div className="mr-5 w-10 h-10 bg-gray-700 rounded-full animate-pulse"></div>
            <div className="w-36 h-10 bg-gray-700 rounded-full animate-pulse"></div>
          </div>
          <div className="flex">
            <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
            <div className="w-8 h-8 ml-4 bg-gray-700 rounded-full animate-pulse"></div>
          </div>
        </div>
        <div className="flex mt-8 justify-evenly">
          <div className="flex flex-col m-2">
            <div className="w-96 mb-5 h-48 bg-gray-700"></div>
            <div className="w-4/5 h-10 mb-5 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-5 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-10 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-1/3 mb-2 h-10 bg-gray-700 rounded-lg animate-pulse"></div>
          </div>
          <div className="flex flex-col m-2">
            <div className="w-96 mb-5 h-48 bg-gray-700"></div>
            <div className="w-4/5 h-10 mb-5 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-5 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-10 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-1/3 mb-2 h-10 bg-gray-700 rounded-lg animate-pulse"></div>
          </div>
          <div className="flex flex-col m-2">
            <div className="w-96 mb-5 h-48 bg-gray-700"></div>
            <div className="w-4/5 h-10 mb-5 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-5 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-10 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-1/3 mb-2 h-10 bg-gray-700 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  ),
});
const DynamicMostBids = withDynamicImport("most_bids", {
  loading: () => (
    <div id="most_bids" className="section-container h-auto bg-gray-800 py-8 sm:py-16">
      <div className="flex flex-col">
        <div className="flex justify-between">
          <div className="flex items-center">
            <div className="mr-5 w-10 h-10 bg-gray-700 rounded-full animate-pulse"></div>
            <div className="w-36 h-10 bg-gray-700 rounded-full animate-pulse"></div>
          </div>
          <div className="flex">
            <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
            <div className="w-8 h-8 ml-4 bg-gray-700 rounded-full animate-pulse"></div>
          </div>
        </div>
        <div className="flex mt-8 justify-evenly">
          <div className="flex flex-col m-2">
            <div className="w-96 mb-5 h-48 bg-gray-700"></div>
            <div className="w-4/5 h-10 mb-5 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-5 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-10 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-1/3 mb-2 h-10 bg-gray-700 rounded-lg animate-pulse"></div>
          </div>
          <div className="flex flex-col m-2">
            <div className="w-96 mb-5 h-48 bg-gray-700"></div>
            <div className="w-4/5 h-10 mb-5 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-5 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-10 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-1/3 mb-2 h-10 bg-gray-700 rounded-lg animate-pulse"></div>
          </div>
          <div className="flex flex-col m-2">
            <div className="w-96 mb-5 h-48 bg-gray-700"></div>
            <div className="w-4/5 h-10 mb-5 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-5 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-10 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-1/3 mb-2 h-10 bg-gray-700 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  ),
});
const DynamicHowHammerShiftWorks = withDynamicImport("how_hammeshift_works", {
  loading: () => (
    <div className="w-full h-auto bg-gray-800 py-8 sm:py-16">
      <div className="flex flex-col">
        <div className="mr-5 w-1/2 my-10 mb-16 h-24 bg-gray-700 rounded-lg animate-pulse"></div>
        <div className="flex my-10">
          <div className="flex w-1/2 justify-evenly">
            <div className="flex flex-col w-1/4 justify-evenly">
              <div className="mr-5 w-full my-1 h-3 bg-gray-700 rounded-full animate-pulse"></div>
              <div className="mr-5 w-full my-1 h-3 bg-gray-700 rounded-full animate-pulse"></div>
            </div>
            <div className="mr-5 w-20 my-1 h-20 bg-gray-700 rounded-lg animate-pulse"></div>
          </div>
          <div className="flex w-1/2 justify-evenly">
            <div className="flex flex-col w-1/4 justify-evenly">
              <div className="mr-5 w-full my-1 h-3 bg-gray-700 rounded-full animate-pulse"></div>
              <div className="mr-5 w-full my-1 h-3 bg-gray-700 rounded-full animate-pulse"></div>
            </div>
            <div className="mr-5 w-20 my-1 h-20 bg-gray-700 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
      <div className="flex">
        <div className="flex w-1/2 justify-evenly">
          <div className="flex flex-col w-1/4 justify-evenly">
            <div className="mr-5 w-full my-1 h-3 bg-gray-700 rounded-full animate-pulse"></div>
            <div className="mr-5 w-full my-1 h-3 bg-gray-700 rounded-full animate-pulse"></div>
          </div>
          <div className="mr-5 w-20 my-1 h-20 bg-gray-700 rounded-lg animate-pulse"></div>
        </div>
        <div className="flex w-1/2 justify-evenly">
          <div className="flex flex-col w-1/4 justify-evenly">
            <div className="mr-5 w-full my-1 h-3 bg-gray-700 rounded-full animate-pulse"></div>
            <div className="mr-5 w-full my-1 h-3 bg-gray-700 rounded-full animate-pulse"></div>
          </div>
          <div className="mr-5 w-20 my-1 h-20 bg-gray-700 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  ),
});
const DynamicSubscribe = withDynamicImport("subscribe", {
  loading: () => (
    <div className="w-full justify-center items-center h-auto bg-gray-800 py-8 sm:py-16">
      <div className="flex flex-col justify-evenly">
        <div className="mr-5 w-1/2 my-10 mb-16 h-32 bg-gray-700 rounded-lg animate-pulse"></div>
        <div className="mr-5 w-1/2 my-1 h-3 bg-gray-700 rounded-full animate-pulse"></div>
        <div className="mr-5 w-1/2 my-1 h-3 bg-gray-700 rounded-full animate-pulse"></div>
        <div className="mr-5 w-1/2 my-1 h-3 bg-gray-700 rounded-full animate-pulse"></div>
        <div className="mr-5 w-1/2 my-1 h-3 bg-gray-700 rounded-full animate-pulse"></div>
        <div className="flex">
          <div className="mr-5 mt-10 w-2/6 h-16 bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="mr-5 mt-10 w-1/6 h-16 bg-gray-700 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  ),
});
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
    <div className="2xl:flex flex-col items-center justify-center">
      <div ref={liveGamesRef} className="section-container">
        {isLiveGamesVisible ? <DynamicLiveGames /> : null}
      </div>
      <div ref={teamBattlesRef} className="section-container">
        {isTeamBattlesVisible ? <DynamicTeamBattles /> : null}
      </div>
      <div ref={tournamentsRef} className="section-container">
        {isTournamentsVisible ? <DynamicTournaments /> : null}
      </div>
      <div
        className="w-full flex justify-center"
        ref={newEraWageringRef}
      >
        {isNewEraWageringVisible ? <DynamicNewEraWagering /> : null}
      </div>
      <div ref={gamesByMakeRef} className="section-container">
        {isGamesByMakeVisible ? <DynamicGamesByMake /> : null}
      </div>
      <div
        className="w-full flex justify-center"
        ref={wagerByCategoryRef}
      >
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
      <div className="w-full" ref={howHammershiftWorksRef}>
        {isHowHammershiftWorksVisible ? <DynamicHowHammerShiftWorks /> : null}
      </div>
      <div className="w-full" ref={subscribeRef}>
        {isSubscribeVisible ? <DynamicSubscribe /> : null}
      </div>
      <DynamicFooter />
    </div>
  );
};
export default Homepage;
