"use client";

import "./styles/app.css";
import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { PropagateLoader } from "react-spinners";
import { isNonNullExpression } from "typescript";
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
      <div className="tw-flex tw-w-full tw-justify-between tw-mt-10">
        <div className="tw-flex tw-flex-col tw-w-full tw-justify-between tw-mt-5">
          <div className="tw-w-24 tw-mb-5 tw-h-5 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
          <div className="tw-w-2/3 tw-mb-5 tw-h-20 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
          <div className="tw-w-40 tw-h-10 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
          <div className="tw-w-[200px] sm:tw-w-[416px] tw-bg-gray-200 tw-rounded-lg tw-animate-pulse"></div>
        </div>
        <div className="tw-w-2/3 tw-mb-5 tw-h-30 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
      </div>
    </div>
  ),
});
const DynamicLiveGames = withDynamicImport("live_games", {
  loading: () => (
    <div className="section-container tw-h-auto tw-bg-gray-800 tw-py-8 sm:tw-py-16">
      <div className="tw-flex tw-flex-col">
        <div className="tw-flex tw-justify-between">
          <div className="tw-flex tw-items-center">
            <div className="tw-mr-5 tw-w-10 tw-h-10 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
            <div className="tw-w-36 tw-h-10 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
          </div>
          <div className="tw-flex">
            <div className="tw-w-8 tw-h-8 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
            <div className="tw-w-8 tw-h-8 tw-ml-4 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
          </div>
        </div>
        <div className="tw-flex tw-mt-8 tw-justify-evenly">
          <div className="tw-flex tw-flex-col">
            <div className="tw-w-48 tw-mb-5 tw-h-48 tw-rounded-full tw-bg-gray-700"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
          </div>
          <div className="tw-flex tw-flex-col">
            <div className="tw-w-48 tw-mb-5 tw-h-48 tw-rounded-full tw-bg-gray-700"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
          </div>
          <div className="tw-flex tw-flex-col">
            <div className="tw-w-48 tw-mb-5 tw-h-48 tw-rounded-full tw-bg-gray-700"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
          </div>
          <div className="tw-flex tw-flex-col">
            <div className="tw-w-48 tw-mb-5 tw-h-48 tw-rounded-full tw-bg-gray-700"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
          </div>
          <div className="tw-flex tw-flex-col">
            <div className="tw-w-48 tw-mb-5 tw-h-48 tw-rounded-full tw-bg-gray-700"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  ),
});
const DynamicTeamBattles = withDynamicImport("team_battles", {
  loading: () => (
    <div className="section-container tw-bg-gray-800 tw-py-8 sm:tw-py-16">
      <div className="tw-flex tw-flex-col">
        <div className="tw-flex tw-justify-between">
          <div className="tw-flex tw-my-10">
            <div className="tw-mr-5 tw-w-10 tw-h-10 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
            <div className="tw-w-80 tw-h-10 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
          </div>
          <div className="tw-flex">
            <div className="tw-w-8 tw-h-8 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
            <div className="tw-w-8 tw-h-8 tw-ml-4 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
          </div>
        </div>
        <div className="tw-flex">
          <div className="tw-w-2/3 tw-mb-5 tw-h-72 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
          <div className="tw-w-1/3 tw-mx-10 tw-mb-5 tw-h-64 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
          <div className="tw-w-1/3 tw-mb-5 tw-h-64 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
        </div>
      </div>
    </div>
  ),
});
const DynamicTournaments = withDynamicImport("tournaments", {
  loading: () => (
    <div className="section-container tw-bg-gray-800 tw-py-8 sm:tw-py-16">
      <div className="tw-flex tw-flex-col">
        <div className="tw-flex tw-justify-between">
          <div className="tw-flex tw-my-10">
            <div className="tw-mr-5 tw-w-10 tw-h-10 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
            <div className="tw-w-80 tw-h-10 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
          </div>
          <div className="tw-flex">
            <div className="tw-w-8 tw-h-8 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
            <div className="tw-w-8 tw-h-8 tw-ml-4 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
          </div>
        </div>
        <div className="tw-flex">
          <div className="tw-w-1/3 tw-mx-10 tw-mb-5 tw-h-64 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
          <div className="tw-w-1/3 tw-mx-10 tw-mb-5 tw-h-64 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
          <div className="tw-w-1/3 tw-mx-10 tw-mb-5 tw-h-64 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
        </div>
      </div>
    </div>
  ),
});
const DynamicNewEraWagering = withDynamicImport("new_era_wagering", {
  loading: () => (
    <div className="section-container tw-bg-gray-800 tw-py-8 sm:tw-py-16">
      <div className="tw-flex tw-flex-col">
        <div className="tw-flex tw-justify-between">
          <div className="tw-flex tw-flex-col tw-m-10">
            <div className="tw-m-5 tw-w-80 tw-h-20 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
            <div className="tw-m-5 tw-w-96 tw-h-20 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
          </div>
          <div className="tw-flex tw-flex-col tw-m-10">
            <div className="tw-m-5 tw-w-96 tw-h-20 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
            <div className="tw-m-5 tw-w-96 tw-h-28 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
            <div className="tw-m-5 tw-flex tw-justify-between">
              <div className="tw-w-36 tw-h-10 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
              <div className="tw-w-36 tw-h-10 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="tw-flex tw-m-10">
          <div className="tw-w-1/3 tw-mx-10 tw-mb-5 tw-h-64 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
          <div className="tw-w-1/3 tw-mx-10 tw-mb-5 tw-h-64 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
          <div className="tw-w-1/3 tw-mx-10 tw-mb-5 tw-h-64 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
        </div>
      </div>
    </div>
  ),
});
const DynamicGamesByMake = withDynamicImport("games_by_make", {
  loading: () => (
    <div className="section-container tw-bg-gray-800 tw-py-8 sm:tw-py-16">
      <div className="tw-flex tw-flex-col">
        <div className="tw-flex tw-justify-between">
          <div className="tw-flex tw-my-10">
            <div className="tw-mr-5 tw-w-10 tw-h-10 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
            <div className="tw-w-80 tw-h-10 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
          </div>
          <div className="tw-flex">
            <div className="tw-w-8 tw-h-8 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
            <div className="tw-w-8 tw-h-8 tw-ml-4 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
          </div>
        </div>
        <div className="tw-flex">
          <div className="tw-w-1/5 tw-mb-5 tw-h-52 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
          <div className="tw-w-1/5 tw-mx-10 tw-mb-5 tw-h-52 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
          <div className="tw-w-1/5 tw-mb-5 tw-h-52 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
          <div className="tw-w-1/5 tw-mx-10 tw-mb-5 tw-h-52 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
          <div className="tw-w-1/5 tw-mb-5 tw-h-52 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
        </div>
        <div className="tw-flex">
          <div className="tw-w-1/5 tw-mb-5 tw-h-52 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
          <div className="tw-w-1/5 tw-mx-10 tw-mb-5 tw-h-52 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
          <div className="tw-w-1/5 tw-mb-5 tw-h-52 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
          <div className="tw-w-1/5 tw-mx-10 tw-mb-5 tw-h-52 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
          <div className="tw-w-1/5 tw-mb-5 tw-h-52 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
        </div>
      </div>
    </div>
  ),
});
const DynamicWagerByCategory = withDynamicImport("wager_by_category", {
  loading: () => (
    <div className="section-container tw-bg-gray-800 tw-py-8 sm:tw-py-16">
      <div className="tw-flex tw-flex-col">
        <div className="tw-flex tw-justify-between">
          <div className="tw-flex tw-my-10">
            <div className="tw-mr-5 tw-w-10 tw-h-10 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
            <div className="tw-w-80 tw-h-10 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
          </div>
        </div>
        <div className="tw-flex tw-justify-between">
          <div className="tw-w-2/3 tw-mb-5 tw-h-52 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
          <div className="tw-w-2/3 tw-mx-10 tw-mb-5 tw-h-52 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
        </div>
        <div className="tw-flex tw-justify-evenly tw-mt-5">
          <div className="tw-w-1/3 tw-mb-5 tw-h-52 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
          <div className="tw-w-1/3 tw-mx-10 tw-mb-5 tw-h-52 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
          <div className="tw-w-1/3 tw-mb-5 tw-h-52 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
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
    <div className="section-container tw-h-auto tw-bg-gray-800 tw-py-8 sm:tw-py-16">
      <div className="tw-flex tw-flex-col">
        <div className="tw-flex tw-justify-between">
          <div className="tw-flex tw-items-center">
            <div className="tw-mr-5 tw-w-10 tw-h-10 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
            <div className="tw-w-36 tw-h-10 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
          </div>
          <div className="tw-flex">
            <div className="tw-w-8 tw-h-8 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
            <div className="tw-w-8 tw-h-8 tw-ml-4 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
          </div>
        </div>
        <div className="tw-flex tw-mt-8 tw-justify-evenly">
          <div className="tw-flex tw-flex-col tw-m-2">
            <div className="tw-w-96 tw-mb-5 tw-h-48 tw-bg-gray-700"></div>
            <div className="tw-w-4/5 tw-h-10 tw-mb-5 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-5 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-10 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-1/3 tw-mb-2 tw-h-10 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
          </div>
          <div className="tw-flex tw-flex-col tw-m-2">
            <div className="tw-w-96 tw-mb-5 tw-h-48 tw-bg-gray-700"></div>
            <div className="tw-w-4/5 tw-h-10 tw-mb-5 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-5 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-10 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-1/3 tw-mb-2 tw-h-10 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
          </div>
          <div className="tw-flex tw-flex-col tw-m-2">
            <div className="tw-w-96 tw-mb-5 tw-h-48 tw-bg-gray-700"></div>
            <div className="tw-w-4/5 tw-h-10 tw-mb-5 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-5 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-10 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-1/3 tw-mb-2 tw-h-10 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  ),
});
const DynamicWhatsTrending = withDynamicImport("whats_trending", {
  loading: () => (
    <div className="section-container tw-h-auto tw-bg-gray-800 tw-py-8 sm:tw-py-16">
      <div className="tw-flex tw-flex-col">
        <div className="tw-flex tw-justify-between">
          <div className="tw-flex tw-items-center">
            <div className="tw-mr-5 tw-w-10 tw-h-10 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
            <div className="tw-w-36 tw-h-10 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
          </div>
          <div className="tw-flex">
            <div className="tw-w-8 tw-h-8 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
            <div className="tw-w-8 tw-h-8 tw-ml-4 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
          </div>
        </div>
        <div className="tw-flex tw-mt-8 tw-justify-evenly">
          <div className="tw-flex tw-flex-col tw-m-2">
            <div className="tw-w-96 tw-mb-5 tw-h-48 tw-bg-gray-700"></div>
            <div className="tw-w-4/5 tw-h-10 tw-mb-5 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-5 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-10 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-1/3 tw-mb-2 tw-h-10 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
          </div>
          <div className="tw-flex tw-flex-col tw-m-2">
            <div className="tw-w-96 tw-mb-5 tw-h-48 tw-bg-gray-700"></div>
            <div className="tw-w-4/5 tw-h-10 tw-mb-5 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-5 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-10 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-1/3 tw-mb-2 tw-h-10 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
          </div>
          <div className="tw-flex tw-flex-col tw-m-2">
            <div className="tw-w-96 tw-mb-5 tw-h-48 tw-bg-gray-700"></div>
            <div className="tw-w-4/5 tw-h-10 tw-mb-5 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-5 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-10 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-1/3 tw-mb-2 tw-h-10 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  ),
});
const DynamicMostExpensiveCars = withDynamicImport("most_expensive_cars", {
  loading: () => (
    <div className="section-container tw-h-auto tw-bg-gray-800 tw-py-8 sm:tw-py-16">
      <div className="tw-flex tw-flex-col">
        <div className="tw-flex tw-justify-between">
          <div className="tw-flex tw-items-center">
            <div className="tw-mr-5 tw-w-10 tw-h-10 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
            <div className="tw-w-36 tw-h-10 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
          </div>
          <div className="tw-flex">
            <div className="tw-w-8 tw-h-8 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
            <div className="tw-w-8 tw-h-8 tw-ml-4 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
          </div>
        </div>
        <div className="tw-flex tw-mt-8 tw-justify-evenly">
          <div className="tw-flex tw-flex-col tw-m-2">
            <div className="tw-w-96 tw-mb-5 tw-h-48 tw-bg-gray-700"></div>
            <div className="tw-w-4/5 tw-h-10 tw-mb-5 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-5 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-10 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-1/3 tw-mb-2 tw-h-10 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
          </div>
          <div className="tw-flex tw-flex-col tw-m-2">
            <div className="tw-w-96 tw-mb-5 tw-h-48 tw-bg-gray-700"></div>
            <div className="tw-w-4/5 tw-h-10 tw-mb-5 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-5 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-10 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-1/3 tw-mb-2 tw-h-10 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
          </div>
          <div className="tw-flex tw-flex-col tw-m-2">
            <div className="tw-w-96 tw-mb-5 tw-h-48 tw-bg-gray-700"></div>
            <div className="tw-w-4/5 tw-h-10 tw-mb-5 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-5 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-10 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-1/3 tw-mb-2 tw-h-10 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  ),
});
const DynamicMostBids = withDynamicImport("most_bids", {
  loading: () => (
    <div className="section-container tw-h-auto tw-bg-gray-800 tw-py-8 sm:tw-py-16">
      <div className="tw-flex tw-flex-col">
        <div className="tw-flex tw-justify-between">
          <div className="tw-flex tw-items-center">
            <div className="tw-mr-5 tw-w-10 tw-h-10 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
            <div className="tw-w-36 tw-h-10 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
          </div>
          <div className="tw-flex">
            <div className="tw-w-8 tw-h-8 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
            <div className="tw-w-8 tw-h-8 tw-ml-4 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
          </div>
        </div>
        <div className="tw-flex tw-mt-8 tw-justify-evenly">
          <div className="tw-flex tw-flex-col tw-m-2">
            <div className="tw-w-96 tw-mb-5 tw-h-48 tw-bg-gray-700"></div>
            <div className="tw-w-4/5 tw-h-10 tw-mb-5 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-5 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-10 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-1/3 tw-mb-2 tw-h-10 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
          </div>
          <div className="tw-flex tw-flex-col tw-m-2">
            <div className="tw-w-96 tw-mb-5 tw-h-48 tw-bg-gray-700"></div>
            <div className="tw-w-4/5 tw-h-10 tw-mb-5 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-5 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-10 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-1/3 tw-mb-2 tw-h-10 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
          </div>
          <div className="tw-flex tw-flex-col tw-m-2">
            <div className="tw-w-96 tw-mb-5 tw-h-48 tw-bg-gray-700"></div>
            <div className="tw-w-4/5 tw-h-10 tw-mb-5 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-5 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-10 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-1/3 tw-mb-2 tw-h-10 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  ),
});
const DynamicHowHammerShiftWorks = withDynamicImport("how_hammeshift_works", {
  loading: () => (
    <div className="section-container tw-h-auto tw-bg-gray-800 tw-py-8 sm:tw-py-16">
      <div className="tw-flex tw-flex-col">
        <div className="tw-mr-5 tw-w-1/2 tw-my-10 tw-mb-16 tw-h-24 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
        <div className="tw-flex tw-my-10">
          <div className="tw-flex tw-w-1/2 tw-justify-evenly">
            <div className="tw-flex tw-flex-col tw-w-1/4 tw-justify-evenly">
              <div className="tw-mr-5 tw-w-full tw-my-1 tw-h-3 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
              <div className="tw-mr-5 tw-w-full tw-my-1 tw-h-3 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
            </div>
            <div className="tw-mr-5 tw-w-20 tw-my-1 tw-h-20 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
          </div>
          <div className="tw-flex tw-w-1/2 tw-justify-evenly">
            <div className="tw-flex tw-flex-col tw-w-1/4 tw-justify-evenly">
              <div className="tw-mr-5 tw-w-full tw-my-1 tw-h-3 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
              <div className="tw-mr-5 tw-w-full tw-my-1 tw-h-3 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
            </div>
            <div className="tw-mr-5 tw-w-20 tw-my-1 tw-h-20 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
          </div>
        </div>
      </div>
      <div className="tw-flex">
        <div className="tw-flex tw-w-1/2 tw-justify-evenly">
          <div className="tw-flex tw-flex-col tw-w-1/4 tw-justify-evenly">
            <div className="tw-mr-5 tw-w-full tw-my-1 tw-h-3 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
            <div className="tw-mr-5 tw-w-full tw-my-1 tw-h-3 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
          </div>
          <div className="tw-mr-5 tw-w-20 tw-my-1 tw-h-20 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
        </div>
        <div className="tw-flex tw-w-1/2 tw-justify-evenly">
          <div className="tw-flex tw-flex-col tw-w-1/4 tw-justify-evenly">
            <div className="tw-mr-5 tw-w-full tw-my-1 tw-h-3 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
            <div className="tw-mr-5 tw-w-full tw-my-1 tw-h-3 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
          </div>
          <div className="tw-mr-5 tw-w-20 tw-my-1 tw-h-20 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
        </div>
      </div>
    </div>
  ),
});
const DynamicSubscribe = withDynamicImport("subscribe", {
  loading: () => (
    <div className="section-container tw-h-auto tw-bg-gray-800 tw-py-8 sm:tw-py-16">
      <div className="tw-flex tw-flex-col tw-justify-evenly">
        <div className="tw-mr-5 tw-w-1/2 tw-my-10 tw-mb-16 tw-h-32 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
        <div className="tw-mr-5 tw-w-1/2 tw-my-1 tw-h-3 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
        <div className="tw-mr-5 tw-w-1/2 tw-my-1 tw-h-3 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
        <div className="tw-mr-5 tw-w-1/2 tw-my-1 tw-h-3 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
        <div className="tw-mr-5 tw-w-1/2 tw-my-1 tw-h-3 tw-bg-gray-700 tw-rounded-full tw-animate-pulse"></div>
        <div className="tw-flex">
          <div className="tw-mr-5 tw-mt-10 tw-w-2/6 tw-h-16 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
          <div className="tw-mr-5 tw-mt-10 tw-w-1/6 tw-h-16 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
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
