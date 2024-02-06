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
      {/* TODO: Check if working*/}
      {/* <TournamentWagerPage /> */}
      {isWagerMenuOpen && (
        <div className="tw-bg-black tw-w-screen tw-h-full"></div>
      )}
      <TournamentsYouMightLike />
    </div>
  );
};

export default TournamentViewPage;
