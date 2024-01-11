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
    { name: BMWLogo, width: 100, make: 'BMW' },
    { name: AudiLogo, width: 120, make: 'Audi' },
    { name: DodgeLogo, width: 180, make: 'Dodge' },
    { name: FordLogo, width: 160, make: 'Ford' },
    { name: HondaLogo, width: 120, make: 'Honda' },
    { name: JeepLogo, width: 100, make: 'Jeep' },
    { name: NissanLogo, width: 120, make: 'Nissan' },
    { name: SubaruLogo, width: 120, make: 'Subaru' },
    { name: TeslaLogo, width: 160, make: 'Tesla' },
    { name: ToyotaLogo, width: 120, make: 'Toyota' },
  ];

  return (
    <div className="section-container tw-py-8 md:tw-py-[120px]">
      <header className="tw-flex tw-justify-between">
        <div className="tw-flex tw-items-center">
          <Image
            src={GamesByMakeIcon}
            width={40}
            height={40}
            alt="dollar"
            className="tw-w-10 tw-h-10"
          />
          <div className="tw-font-bold tw-text-2xl sm:tw-text-3xl tw-ml-4">
            Games by Make
          </div>
        </div>
        <div className="tw-flex">
          <Image
            src={ArrowLeft}
            width={32}
            height={32}
            alt="arrow left"
            className="tw-w-8 tw-h-8 "
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
      <section className="tw-grid tw-grid-cols-3 sm:tw-grid-cols-2 md:tw-grid-cols-5 tw-gap-8 tw-mt-16">
        {carList.map((car) => {
          return (
            <div key={car.name}>
              {/* <Link href={`/auctions?make=${car.make}&sort=Newly+Listed`}> */}
              <div
                onClick={e => router.push(`/auctions?make=${car.make}&sort=Newly+Listed`)}
                className="tw-cursor-pointer">
                <Image
                  src={car.name}
                  width={car.width}
                  height={100}
                  alt={car.name}
                  style={{ width: car.width, height: "100px" }}
                  className="tw-block tw-mx-auto"
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
