"use client";

import React from "react";
import Image from "next/image";

import GamesByMakeIcon from "../../../public/images/green-diagonal.svg";
import WhiteCar from "../../../public/images/wager-by-category/white-car.svg";
import YellowSportsCar from "../../../public/images/wager-by-category/yellow-sportscar.svg";
import SilverSUV from "../../../public/images/wager-by-category/silver-suv.svg";
import RedCar from "../../../public/images/wager-by-category/red-car.svg";
import SilverPickup from "../../../public/images/wager-by-category/silver-pickup.svg";

const WagerByCategory = () => {
  return (
    <div className="tw-w-screen tw-bg-[#1A2C3D] tw-flex tw-flex-col tw-items-center">
      <div className=" section-container tw-py-8 md:tw-py-[120px]">
        <header>
          <div className="tw-flex tw-items-center">
            <Image
              src={GamesByMakeIcon}
              width={40}
              height={40}
              alt="dollar"
              className="tw-w-10 tw-h-10"
            />
            <div className="tw-font-bold tw-text-2xl sm:tw-text-3xl tw-ml-4">
              Wager by Category
            </div>
          </div>
        </header>
        <section>
          <div className="first-row tw-mt-8 tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6">
            <div className="tw-h-[280px] tw-grid tw-grid-cols-2 tw-bg-[#FFFFFF]/5">
              <div className="tw-flex tw-flex-col tw-justify-end tw-pl-6 tw-pb-6">
                <div className="tw-text-[30px] tw-font-bold tw-x-auto">
                  Sedans
                </div>
                <div className="tw-my-4 ">
                  Unam incolunt Belgae, aliam Aquitani, tertiam. Cras mattis
                  iudicium purus sit amet fermentum.
                </div>
                <div className="tw-font-bold tw-text-[#F2CA16]">
                  Explore Sedans
                </div>
              </div>
              <div className="tw-relative">
                <Image
                  src={WhiteCar}
                  width={511}
                  height={255}
                  alt="white car"
                  className="tw-w-auto tw-h-auto tw-absolute tw-right-0"
                />
              </div>
            </div>
            <div className="tw-h-[280px] tw-grid tw-grid-cols-2 tw-bg-[#FFFFFF]/5">
              <div className="tw-flex tw-flex-col tw-justify-end tw-pl-6 tw-pb-6">
                <div className="tw-text-[30px] tw-font-bold tw-x-auto">
                  SUVs
                </div>
                <div className="tw-my-4">
                  Unam incolunt Belgae, aliam Aquitani, tertiam. Cras mattis
                  iudicium purus sit amet fermentum.
                </div>
                <div className="tw-font-bold tw-text-[#F2CA16]">
                  Explore SUVs
                </div>
              </div>
              <div className="tw-relative">
                <Image
                  src={SilverSUV}
                  width={511}
                  height={255}
                  alt="silver suv"
                  className="tw-w-auto tw-h-auto tw-absolute tw-right-0"
                />
              </div>
            </div>
          </div>

          <div className="second-row tw-mt-8 tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-6">
            <div className="tw-relative tw-h-[280px] tw-grid tw-grid-cols-2 tw-bg-[#FFFFFF]/5">
              <div className="tw-flex tw-flex-col tw-justify-end tw-pl-6 tw-pb-6 tw-h-[288px]">
                <div className="tw-text-[30px] tw-font-bold tw-x-auto">
                  EVs & Hybrids
                </div>
                <div className="tw-my-4 tw-text-ellipsis tw-overflow-hidden">
                  Unam incolunt Belgae, aliam Aquitani, tertiam. Cras mattis
                  iudicium purus sit amet fermentum.
                </div>
                <div className="tw-font-bold tw-text-[#F2CA16]">
                  Explore EVs & Hybrids
                </div>
              </div>
              <div className="tw-relative">
                <Image
                  src={RedCar}
                  width={511}
                  height={255}
                  alt="red sportscar"
                  className="tw-w-auto tw-h-auto tw-absolute tw-right-0"
                />
              </div>
            </div>
            <div className="tw-h-[280px] tw-grid tw-grid-cols-2 tw-bg-[#FFFFFF]/5">
              <div className="tw-flex tw-flex-col tw-justify-end tw-pl-6 tw-pb-6 tw-h-[288px]">
                <div className="tw-text-[30px] tw-font-bold tw-x-auto">
                  Luxury
                </div>
                <div className="tw-my-4 tw-text-ellipsis tw-overflow-hidden">
                  Unam incolunt Belgae, aliam Aquitani, tertiam. Cras mattis
                  iudicium purus sit amet fermentum.
                </div>
                <div className="tw-font-bold tw-text-[#F2CA16]">
                  Explore Luxury
                </div>
              </div>
              <div className="tw-relative">
                <Image
                  src={YellowSportsCar}
                  width={511}
                  height={255}
                  alt="yellow sportcar"
                  className="tw-w-auto tw-h-auto tw-absolute tw-right-0"
                />
              </div>
            </div>
            <div className="tw-h-[280px] tw-grid tw-grid-cols-2 tw-bg-[#FFFFFF]/5">
              <div className="tw-flex tw-flex-col tw-justify-end tw-pl-6 tw-pb-6 tw-h-[288px]">
                <div className="tw-text-[30px] tw-font-bold tw-x-auto">
                  Pickup Trucks
                </div>
                <div className="tw-my-4 tw-text-ellipsis tw-overflow-hidden">
                  Unam incolunt Belgae, aliam Aquitani, tertiam. Cras mattis
                  iudicium purus sit amet fermentum.
                </div>
                <div className="tw-font-bold tw-text-[#F2CA16]">
                  Explore Pickup Trucks
                </div>
              </div>
              <div className="tw-relative">
                <Image
                  src={SilverPickup}
                  width={511}
                  height={255}
                  alt="silver pickup"
                  className="tw-w-auto tw-h-auto tw-absolute tw-right-0"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default WagerByCategory;
