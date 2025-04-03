"use client";

import React from "react";
import Image from "next/image";

import GamesByMakeIcon from "../../../public/images/green-diagonal.svg";
import WhiteCar from "../../../public/images/wager-by-category/white-car.svg";
import YellowSportsCar from "../../../public/images/wager-by-category/yellow-sportscar.svg";
import SilverSUV from "../../../public/images/wager-by-category/silver-suv.svg";
import RedCar from "../../../public/images/wager-by-category/red-car.svg";
import SilverPickup from "../../../public/images/wager-by-category/silver-pickup.svg";
import Link from "next/link";

const WagerByCategory = () => {
  return (
    <div className="w-full bg-[#1A2C3D] flex flex-col items-center">
      <div className="section-container md:py-[120px]">
        <header>
          <div className="flex items-center">
            <Image
              src={GamesByMakeIcon}
              width={40}
              height={40}
              alt="dollar"
              className="w-10 h-10"
            />
            <div className="font-bold text-2xl sm:text-3xl ml-4">
              Wager by Category
            </div>
          </div>
        </header>
        <section>
          <div className="first-row mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/auctions?category=Sedans&sort=Newly+Listed">
              <div className="h-[280px] grid grid-cols-2 bg-[#FFFFFF]/5 hover:scale-110 transform transition-all duration-100">
                <div className="flex flex-col justify-end pl-6 pb-6">
                  <div className="text-[30px] font-bold x-auto">
                    Sedans
                  </div>
                  <div className="my-4 ">
                    Unam incolunt Belgae, aliam Aquitani, tertiam. Cras mattis
                    iudicium purus sit amet fermentum.
                  </div>
                  <div className="font-bold text-[#F2CA16]">
                    Explore Sedans
                  </div>
                </div>
                <div className="relative">
                  <Image
                    src={WhiteCar}
                    width={511}
                    height={255}
                    alt="white car"
                    className="w-auto h-auto absolute right-0"
                  />
                </div>
              </div>
            </Link>
            <Link href="/auctions?category=SUVs&sort=Newly+Listed">
              <div className="h-[280px] grid grid-cols-2 bg-[#FFFFFF]/5 hover:scale-110 transform transition-all duration-100">
                <div className="flex flex-col justify-end pl-6 pb-6">
                  <div className="text-[30px] font-bold x-auto">
                    SUVs
                  </div>
                  <div className="my-4">
                    Unam incolunt Belgae, aliam Aquitani, tertiam. Cras mattis
                    iudicium purus sit amet fermentum.
                  </div>
                  <div className="font-bold text-[#F2CA16]">
                    Explore SUVs
                  </div>
                </div>
                <div className="relative">
                  <Image
                    src={SilverSUV}
                    width={511}
                    height={255}
                    alt="silver suv"
                    className="w-auto h-auto absolute right-0"
                  />
                </div>
              </div>
            </Link>
          </div>

          <div className="second-row mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/auctions?category=EVs+and+Hybrids&sort=Newly+Listed">
              <div className="relative h-[280px] grid grid-cols-2 bg-[#FFFFFF]/5 hover:scale-110 transform transition-all duration-100">
                <div className="flex flex-col justify-end pl-6 pb-6 h-[288px]">
                  <div className="text-[30px] font-bold x-auto">
                    EVs & Hybrids
                  </div>
                  <div className="my-4 text-ellipsis overflow-hidden">
                    Unam incolunt Belgae, aliam Aquitani, tertiam. Cras mattis
                    iudicium purus sit amet fermentum.
                  </div>
                  <div className="font-bold text-[#F2CA16]">
                    Explore EVs & Hybrids
                  </div>
                </div>
                <div className="relative">
                  <Image
                    src={RedCar}
                    width={511}
                    height={255}
                    alt="red sportscar"
                    className="w-auto h-auto absolute right-0"
                  />
                </div>
              </div>
            </Link>
            <Link href="/auctions?category=Luxury+Cars&sort=Newly+Listed">
              <div className="h-[280px] grid grid-cols-2 bg-[#FFFFFF]/5 hover:scale-110 transform transition-all duration-100">
                <div className="flex flex-col justify-end pl-6 pb-6 h-[288px]">
                  <div className="text-[30px] font-bold x-auto">
                    Luxury
                  </div>
                  <div className="my-4 text-ellipsis overflow-hidden">
                    Unam incolunt Belgae, aliam Aquitani, tertiam. Cras mattis
                    iudicium purus sit amet fermentum.
                  </div>
                  <div className="font-bold text-[#F2CA16]">
                    Explore Luxury
                  </div>
                </div>
                <div className="relative">
                  <Image
                    src={YellowSportsCar}
                    width={511}
                    height={255}
                    alt="yellow sportcar"
                    className="w-auto h-auto absolute right-0"
                  />
                </div>
              </div>
            </Link>
            <Link href="/auctions?category=Pickup+Trucks&sort=Newly+Listed">
              <div className="h-[280px] grid grid-cols-2 bg-[#FFFFFF]/5 hover:scale-110 transform transition-all duration-100">
                <div className="flex flex-col justify-end pl-6 pb-6 h-[288px]">
                  <div className="text-[30px] font-bold x-auto">
                    Pickup Trucks
                  </div>
                  <div className="my-4 text-ellipsis overflow-hidden">
                    Unam incolunt Belgae, aliam Aquitani, tertiam. Cras mattis
                    iudicium purus sit amet fermentum.
                  </div>
                  <div className="font-bold text-[#F2CA16]">
                    Explore Pickup Trucks
                  </div>
                </div>
                <div className="relative">
                  <Image
                    src={SilverPickup}
                    width={511}
                    height={255}
                    alt="silver pickup"
                    className="w-auto h-auto absolute right-0"
                  />
                </div>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default WagerByCategory;
