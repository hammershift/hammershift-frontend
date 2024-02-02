"use client";

import React, { useState } from "react";
import Links from "../../../components/links";
import { useRouter } from "next/navigation";
import { TournamentsListCard } from "../../../components/card";
import Image from "next/image";
import { LatestNews } from "../../../components/how_hammeshift_works";
import { SubscribeSmall } from "../../../components/subscribe";
import { TournamentsCard } from "../../../components/card";
import Footer from "../../../components/footer";
import Link from "next/link";

import PhotoOne from "../../../../../public/images/car-view-page/photoOne.svg";
import PhotoTwo from "../../../../../public/images/car-view-page/photoTwo.svg";
import PhotoThree from "../../../../../public/images/car-view-page/photoThree.svg";
import PhotoFour from "../../../../../public/images/car-view-page/photoFour.svg";
import PhotoFive from "../../../../../public/images/car-view-page/photoOne.svg";

import TournamentWagerModal from "@/app/components/tournament_wager_modal";
import { carDataThree } from "@/sample_data";
import {
  CommentsSection,
  TitleTournamentsList,
  TournamentButtons,
  TournamentInfoSection,
  TournamentWagersSection,
  TournamentsList,
  TournamentsYouMightLike,
} from "@/app/ui/tournaments_car_view_page/TournamentsCarViewPage";

const CarViewData = {
  name: "13k-Mile 2011 Mercedes Benz SLS AMG",
  currentBid: "$64,000",
  endingDate: "Jul 5, 2023, 7:00 PM",
  bids: 48,
  players: 4,
  timeLeft: "02:16:00",
  prize: "$1,000",
  images: [PhotoOne, PhotoTwo, PhotoThree, PhotoFour, PhotoFive],
  description:
    "This 2011 Mercedes-Benz SLS AMG was initially sold by Ray Catena Mercedes Benz Union in New Jersey, and remained registered in the state prior to being acquired by the selling dealer in 2023 and now has 13k miles. It is powered by a 6.2-liter V8 linked with a seven-speed dual-clutch automatic transaxle and a limited-slip differential. Finished in Iridium Silver Metallic over Charcoal Exclusive leather upholstery, the car is equipped with 19″ and 20″ seven-spoke alloy wheels, gullwing doors, a speed-activated aerofoil, bi-xenon headlights, Parktronic, heated power-adjustable seats, Keyless-Go, a rearview camera, COMAND infotainment, navigation, a radar detector, a Bang & Olufsen sound system, carbon-fiber interior trim, and dual-zone automatic climate control. This SLS AMG is now offered in Texas by the selling dealer at no reserve with a clean Carfax report and a clean New Jersey title.",
};

const TournamentViewPage = () => {
  // Change to true for tournament single car page
  const [isWagerMenuOpen, setIsWagerMenuOpen] = useState(false);
  const [toggleTournamentWagerModal, setToggleTournamentWagerModal] =
    useState(false);

  const toggleModal = () => {
    setToggleTournamentWagerModal((prev) => !prev);
  };

  return (
    <div className="page-container tw-relative">
      {toggleTournamentWagerModal ? (
        <TournamentWagerModal toggleTournamentWagerModal={toggleModal} />
      ) : null}
      <Links />
      <div className="section-container tw-flex tw-justify-between tw-items-center tw-mt-4 md:tw-mt-16">
        <div className="tw-w-auto tw-h-[28px] tw-flex tw-items-center tw-bg-[#184C80] tw-font-bold tw-rounded-full tw-px-2.5 tw-py-2 tw-text-[14px]">
          TOURNAMENT
        </div>
        <div className="tw-hidden sm:tw-block">
          <TournamentButtons toggleTournamentWagerModal={toggleModal} />
        </div>
      </div>

      <div className="section-container tw-w-full tw-mt-4 md:tw-mt-8 tw-flex tw-flex-col lg:tw-flex-row">
        <div className="left-container-marker tw-w-full tw-basis-2/3 tw-pl-0 lg:tw-pr-8">
          <TitleTournamentsList />
          <div className="sm:tw-hidden tw-mt-4">
            <TournamentButtons toggleTournamentWagerModal={toggleModal} />
          </div>
          <TournamentsList toggleTournamentWagerModal={toggleModal} />
          <div className="sm:tw-hidden tw-my-8">
            <TournamentWagersSection toggleTournamentWagerModal={toggleModal} />
            <TournamentInfoSection />
          </div>
          <CommentsSection />
        </div>
        <div className="right-container-marker tw-w-full tw-basis-1/3 tw-pl-0 lg:tw-pl-8 tw-hidden lg:tw-block">
          <TournamentWagersSection toggleTournamentWagerModal={toggleModal} />
          <TournamentInfoSection />
        </div>
      </div>

      <TournamentsYouMightLike />
      <LatestNews />
      <SubscribeSmall />
      <Footer />
      {/* TODO: Check if working*/}
      {/* <TournamentWagerPage /> */}
      {isWagerMenuOpen && (
        <div className="tw-bg-black tw-w-screen tw-h-full"></div>
      )}
    </div>
  );
};

export default TournamentViewPage;
