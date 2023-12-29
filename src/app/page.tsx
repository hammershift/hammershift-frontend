"use client";
import "./styles/app.css";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Card from "./components/card";
import HowHammerShiftWorks from "./components/how_hammeshift_works";
import { TournamentsCard } from "./components/card";
import Footer from "./components/footer";
import Subscribe from "./components/subscribe";
import Image from "next/image";
import { TimerProvider, useTimer } from "./_context/TimerContext";
import {
  getCars,
  getCarsWithFilter,
  sortByMostBids,
  sortByMostExpensive,
  sortByNewGames,
  sortByTrending,
} from "@/lib/data";

import LiveGamesIcon from "../../public/images/currency-dollar-circle.svg";

import TeamBattlesIcon from "../../public/images/team-battles-icon.svg";
import TournamentsIcon from "../../public/images/award-trophy-star-1.svg";
import HourGlassIcon from "../../public/images/hour-glass.svg";
import PlayersIcon from "../../public/images/players.svg";
import GamesByMakeIcon from "../../public/images/green-diagonal.svg";
import Avatar from "../../public/images/avatar.svg";
import TrophyIconGreen from "../../public/images/trophy-icon-green.svg";
import TrophyIconBlue from "../../public/images/trophy-icon-blue.svg";

import MagnifyingGlass from "../../public/images/magnifying-glass.svg";
import WatchlistIcon from "../../public/images/watchlist-icon.svg";
import ArrowRight from "../../public/images/arrow-right.svg";
import ArrowLeft from "../../public/images/arrow-left.svg";

import TeslaLogo from "../../public/images/brand-logos/tesla-logo.svg";
import BMWLogo from "../../public/images/brand-logos/bmw-logo.svg";
import AudiLogo from "../../public/images/brand-logos/audi-logo.svg";
import DodgeLogo from "../../public/images/brand-logos/dodge-logo.svg";
import HondaLogo from "../../public/images/brand-logos/honda-logo.svg";
import JeepLogo from "../../public/images/brand-logos/jeep-logo.svg";
import NissanLogo from "../../public/images/brand-logos/nissan-logo.svg";
import SubaruLogo from "../../public/images/brand-logos/subaru-logo.svg";
import ToyotaLogo from "../../public/images/brand-logos/toyota-logo.svg";
import FordLogo from "../../public/images/brand-logos/ford-logo.svg";

import TransitionPattern from "../../public/images/transition-pattern.svg";

import YellowSportsCar from "../../public/images/wager-by-category/yellow-sportscar.svg";
import WhiteCar from "../../public/images/wager-by-category/white-car.svg";
import RedCar from "../../public/images/wager-by-category/red-car.svg";

import SilverPickup from "../../public/images/wager-by-category/silver-pickup.svg";
import SilverSUV from "../../public/images/wager-by-category/silver-suv.svg";
import BlackMercedes from "../../public/images/black-mercedes.svg";

import AvatarOne from "../../public/images/avatar-one.svg";
import AvatarTwo from "../../public/images/avatar-two.svg";
import AvatarThree from "../../public/images/avatar-three.svg";
import AvatarFour from "../../public/images/avatar-four.svg";
import Link from "next/link";
import Carousel from "./components/carousel";
import TeamBattles from "./components/team_battles";
import Tournaments from "./components/tournaments";
import NewEraWagering from "./components/new_era_wagering";
import GamesByMake from "./components/games_by_make";
import WagerByCategory from "./components/wager_by_category";
import SkillStrategyAndStakes from "./components/skills_strategy_and_stakes";
import NewGames from "./components/new_games";
import WhatsTrending from "./components/whats_trending";
import MostExpensiveCars from "./components/most_expensive_cars";
import MostBids from "./components/most_bids";
import LiveGames from "./components/live_games";

const Homepage = () => {
  return (
    <div className="2xl:tw-flex tw-flex-col tw-items-center">
      <Carousel />
      <LiveGames />
      <TeamBattles />
      <Tournaments />
      <NewEraWagering />
      <GamesByMake />
      <WagerByCategory />
      <SkillStrategyAndStakes />
      <NewGames />
      <WhatsTrending />
      <MostExpensiveCars />
      <MostBids />
      <HowHammerShiftWorks />
      <Subscribe />
      <Footer />
    </div>
  );
};
export default Homepage;
