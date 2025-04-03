"use client";
import React, { useState } from "react";
import Image from "next/image";
import Links from "../../components/links";

import FeaturedPhoto from "../../../../public/images/featured-photo.svg";
import DollarIcon from "../../../../public/images/dollar.svg";
import HourGlass from "../../../../public/images/hour-glass.svg";
import ArrowLeft from "../../../../public/images/arrow-left.svg";
import ArrowRight from "../../../../public/images/arrow-right.svg";

const DiscoveryPageData = {
  title: "2005 Ford GT Speed Yellow",
  description:
    "This GT is one of just 19 Speed Yellow cars produced for 2005 with full Le Mans stripes and gray-painted brake calipers. Race-bred engineering includes an aluminum 5.4L V-8 engine belting out a factory-rated 550 HP with electronic multi-port fuel injection, a Lysholm screw-type supercharger, intercooler and stainless dual exhaust. Other competition-derived engineering features include a Ricardo 6-speed rear transaxle, extruded aluminum space frame, precision-cast aluminum double-wishbone “SLA” suspension with coilovers, dry-sump engine lubrication and big 4-wheel Brembo ventilated disc brakes with 4-piston calipers.",
  current_bid: "$490,000",
  bids: 48,
  wagers: 16,
  time_left: "12:17:00",
  photos: [
    { id: "imagedis1", url: FeaturedPhoto },
    { id: "imagedis2", url: FeaturedPhoto },
    { id: "imagedis3", url: FeaturedPhoto },
  ],
};

const DiscoverPage = () => {
  return (
    <div className="page-container ">
      <div className="section-container flex flex-col lg:flex-row-reverse items-end gap-8 md:gap-16 lg:gap-24 xl:gap-36 md:mt-12 mb-20">
        <div className="basis-2/3 h-auto">
          <Carousel imageList={DiscoveryPageData.photos} />
        </div>
        <div className="basis-1/3 mt-4 lg:mt-0">
          <div className="text-[#49C742] font-bold">FEATURE</div>
          <div className="text-3xl xl:text-4xl 2xl:text-5xl font-bold mt-4">
            {DiscoveryPageData.title}
          </div>
          <div className="opacity-80 h-[120px] ellipsis overflow-hidden mt-4 text-sm sm:text-base">
            {DiscoveryPageData.description}
          </div>
          <div className="mt-4 text-sm sm:text-base">
            <div className="flex">
              <Image
                src={DollarIcon}
                width={20}
                height={20}
                alt="dollar icon"
                className="w-5 h-5 "
              />
              <span className="opacity-80 ml-2">Current Bid:</span>
              <span className="text-[#F2CA16] ml-2 font-bold">
                {DiscoveryPageData.current_bid}
              </span>
              <span className="opacity-50 ml-2">{`${DiscoveryPageData.bids} bids`}</span>
            </div>
            <div className="flex mt-2">
              <Image
                src={HourGlass}
                width={20}
                height={20}
                alt="dollar icon"
                className="w-5 h-5 "
              />
              <span className="opacity-80 ml-2 ">Time Left:</span>
              <span className=" ml-2  font-bold">
                {DiscoveryPageData.current_bid}
              </span>
            </div>
          </div>
          <div className="mt-8">
            <button className="btn-yellow">PLACE MY WAGER</button>
            <span className="ml-4 opacity-50">{`${DiscoveryPageData.wagers} wagers`}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscoverPage;

interface CarouselProps {
  imageList: { id: string; url: string }[];
}

const Carousel: React.FC<CarouselProps> = ({ imageList }) => {
  const [sliderTransform, setSlidertransform] = useState(0);
  let listNum = imageList.length;
  const imgWidth = 100 / listNum;
  const lastImgLoc = 100 - imgWidth;
  const wholeWidth = 100 * listNum;

  const rightArrowHandler = () => {
    if (sliderTransform <= -lastImgLoc) {
      setSlidertransform(0);
    } else {
      setSlidertransform((prev) => prev - imgWidth);
    }
  };
  const leftArrowHandler = () => {
    if (sliderTransform >= 0) {
      setSlidertransform(-lastImgLoc);
    } else {
      setSlidertransform((prev) => prev + imgWidth);
    }
  };

  return (
    <div className=" relative pt-8 md:pt-16 h-auto">
      <div className="carousel-container relative w-full h-auto overflow-hidden">
        <div
          className="slider-container transition duration-[2000ms] flex h-auto w-full"
          style={{
            transform: `translate(${sliderTransform}%)`,
            width: `${wholeWidth}%`,
          }}
        >
          {imageList.map((photo) => (
            <div key={photo.id} className="w-full">
              <Image
                src={photo.url}
                width={752}
                height={540}
                alt="feature car"
                className="w-full h-auto object-cover aspect-auto"
                priority={true}
              />
            </div>
          ))}
        </div>
      </div>
      {/* Controller arrows */}
      <div className="absolute mt-4 z-50 bottom-[-48px] right-0">
        <button onClick={leftArrowHandler}>
          <Image
            src={ArrowLeft}
            alt="arrow left"
            width={32}
            height={32}
            className="w-auto h-auto arrow-slider rounded-full"
          />
        </button>
        <button onClick={rightArrowHandler} className="ml-4">
          <Image
            src={ArrowRight}
            alt="arrow left"
            width={32}
            height={32}
            className="w-auto h-auto arrow-slider rounded-full"
          />
        </button>
      </div>
    </div>
  );
};
