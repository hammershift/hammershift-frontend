"use client";

import React from "react";
import Image from "next/image";

import TournamentsIcon from "../../../public/images/award-trophy-star-1.svg";
import ArrowRight from "../../../public/images/arrow-right.svg";
import ArrowLeft from "../../../public/images/arrow-left.svg";
import { TournamentsCard } from "./card";

const Tournaments = () => {
  return (
    <div className="tw-py-8 sm:tw-py-16">
      <header className="tw-flex tw-justify-between">
        <div className="tw-flex tw-items-center">
          <Image
            src={TournamentsIcon}
            width={40}
            height={40}
            alt="dollar"
            className="tw-w-10 tw-h-10"
          />
          <div className="tw-font-bold tw-text-2xl sm:tw-text-3xl tw-ml-4">
            Tournaments (Coming Soon)
          </div>
        </div>
        <div className="tw-flex">
          <Image
            src={ArrowLeft}
            width={32}
            height={32}
            alt="arrow left"
            className="tw-w-8 tw-h-8"
          />
          <Image
            src={ArrowRight}
            width={32}
            height={32}
            alt="arrow right"
            className="tw-w-8 tw-h-8 tw-ml-4"
          />
        </div>
      </header>
      <section className="tw-flex tw-flex-col sm:tw-flex-row sm:tw-w-full tw-overflow-x-auto tw-gap-4 sm:tw-gap-8 tw-mt-8">
        {/* to be replaced by array.map. Tournaments Card in card component*/}
        <TournamentsCard />
        <TournamentsCard />
        <TournamentsCard />
      </section>
    </div>
  );
};

export default Tournaments;
