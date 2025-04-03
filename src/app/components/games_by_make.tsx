"use client";

import React from "react";
import Image from "next/image";

import TeslaLogo from "../../../public/images/brand-logos/tesla-logo.svg";
import BMWLogo from "../../../public/images/brand-logos/bmw-logo.svg";
import AudiLogo from "../../../public/images/brand-logos/audi-logo.svg";
import DodgeLogo from "../../../public/images/brand-logos/dodge-logo.svg";
import HondaLogo from "../../../public/images/brand-logos/honda-logo.svg";
import JeepLogo from "../../../public/images/brand-logos/jeep-logo.svg";
import NissanLogo from "../../../public/images/brand-logos/nissan-logo.svg";
import SubaruLogo from "../../../public/images/brand-logos/subaru-logo.svg";
import ToyotaLogo from "../../../public/images/brand-logos/toyota-logo.svg";
import FordLogo from "../../../public/images/brand-logos/ford-logo.svg";

import GamesByMakeIcon from "../../../public/images/green-diagonal.svg";
import ArrowRight from "../../../public/images/arrow-right.svg";
import ArrowLeft from "../../../public/images/arrow-left.svg";
import Link from "next/link";
import { useRouter } from "next/navigation";

const GamesByMake = () => {
  const router = useRouter();

  // sample data
  const carList = [
    { name: BMWLogo, width: 100, make: "BMW" },
    { name: AudiLogo, width: 120, make: "Audi" },
    { name: DodgeLogo, width: 180, make: "Dodge" },
    { name: FordLogo, width: 160, make: "Ford" },
    { name: HondaLogo, width: 120, make: "Honda" },
    { name: JeepLogo, width: 100, make: "Jeep" },
    { name: NissanLogo, width: 120, make: "Nissan" },
    { name: SubaruLogo, width: 120, make: "Subaru" },
    { name: TeslaLogo, width: 160, make: "Tesla" },
    { name: ToyotaLogo, width: 120, make: "Toyota" },
  ];

  return (
    <div className="py-8 md:py-[120px]">
      <header className="flex justify-between">
        <div className="flex items-center">
          <Image
            src={GamesByMakeIcon}
            width={40}
            height={40}
            alt="dollar"
            className="w-10 h-10"
          />
          <div className="font-bold text-2xl sm:text-3xl ml-4">
            Games by Make
          </div>
        </div>
        <div className="flex">
          <Image
            src={ArrowLeft}
            width={32}
            height={32}
            alt="arrow left"
            className="w-8 h-8 "
          />
          <Image
            src={ArrowRight}
            width={32}
            height={32}
            alt="arrow right"
            className="w-8 h-8 ml-4"
          />
        </div>
      </header>
      <section className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-5 gap-8 mt-16">
        {carList.map((car) => {
          return (
            <div key={car.name}>
              {/* <Link href={`/auctions?make=${car.make}&sort=Newly+Listed`}> */}
              <div
                onClick={(e) =>
                  router.push(`/auctions?make=${car.make}&sort=Newly+Listed`)
                }
                className="cursor-pointer hover:scale-125 transform transition-all duration-100"
              >
                <Image
                  src={car.name}
                  width={car.width}
                  height={100}
                  alt={car.name}
                  style={{ width: car.width, height: "100px" }}
                  className="block mx-auto"
                />
              </div>
              {/* </Link> */}
            </div>
          );
        })}
      </section>
    </div>
  );
};

export default GamesByMake;
