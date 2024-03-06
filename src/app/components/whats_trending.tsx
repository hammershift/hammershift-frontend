import React, { useEffect, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { sortByTrending } from "@/lib/data";

import GamesByMakeIcon from "../../../public/images/green-diagonal.svg";
import { TimerProvider } from "../_context/TimerContext";
import Link from "next/link";

const WhatsTrending = () => {
  const [trending, setTrending] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const DynamicCards = dynamic(() => import("@/app/components/card"), {
    ssr: false,
    loading: () => (
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
      </div>
    ),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const trendingCarsData = await sortByTrending();
        setIsLoading(true);
        if (trendingCarsData && "cars" in trendingCarsData) {
          setTrending(trendingCarsData.cars);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);
  return (
    <div className="section-container tw-py-8 sm:tw-py-12">
      <header className="tw-max-w-[1312px]">
        <div className="tw-flex tw-justify-between">
          <div className="tw-flex tw-items-center">
            <Image
              src={GamesByMakeIcon}
              width={40}
              height={40}
              alt="dollar"
              className="tw-w-10 tw-h-10"
            />
            <div className="tw-font-bold tw-text-2xl sm:tw-text-3xl tw-ml-4">{`What\'s Trending`}</div>
          </div>
          <Link href="/auctions?sort=Most+Bids" className="tw-cursor-pointer">
            <div className="tw-text-[#49C742]">See All</div>
          </Link>
        </div>
      </header>
      {isLoading ? (
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
      ) : (
        <section className="tw-overflow-x-auto tw-w-full">
          <div className=" tw-w-[632px] sm:tw-w-[1312px] ">
            <div className=" tw-grid tw-grid-cols-3 tw-gap-4 sm:tw-gap-8 tw-mt-12 ">
              {trending.map((auctions, index) => {
                const {
                  _id,
                  image,
                  year,
                  make,
                  model,
                  description,
                  deadline,
                  auction_id,
                  price,
                  images_list
                } = auctions;
                return (
                  <TimerProvider key={index} deadline={deadline}>
                    <div className="tw-w-[200px] sm:tw-w-[416px]">
                      <DynamicCards
                        image={image}
                        year={year}
                        make={make}
                        model={model}
                        description={description}
                        deadline={deadline}
                        auction_id={auction_id}
                        price={price}
                        object_id={_id}
                        images_list={images_list}
                      />
                    </div>
                  </TimerProvider>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default WhatsTrending;
