"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { sortByMostBids } from "@/lib/data";
import { TimerProvider } from "../_context/TimerContext";

import GamesByMakeIcon from "../../../public/images/green-diagonal.svg";
import Link from "next/link";

const MostBids = () => {
  const [mostBids, setMostBids] = useState([]);
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
        const mostBidsData = await sortByMostBids();
        setIsLoading(true);

        if (mostBidsData && "cars" in mostBidsData) {
          setMostBids(mostBidsData.cars);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="section-container tw-py-8 sm:tw-py-12 tw-mb-8 sm:tw-mb-16">
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
            <div className="tw-font-bold tw-text-2xl sm:tw-text-3xl tw-ml-4">
              Most Bids
            </div>
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
            <div className=" tw-grid tw-grid-cols-3 tw-gap-4 sm:tw-gap-8 tw-mt-12">
              {mostBids.map((auctions, index) => {
                const {
                  image,
                  year,
                  make,
                  model,
                  description,
                  deadline,
                  auction_id,
                  price,
                  _id,
                } = auctions;
                return (
                  <TimerProvider key={index} deadline={deadline}>
                    <div className="tw-w-[200px] sm:tw-w-[416px]">
                      <DynamicCards
                        object_id={_id}
                        image={image}
                        year={year}
                        make={make}
                        model={model}
                        description={description}
                        deadline={deadline}
                        auction_id={auction_id}
                        price={price}
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

export default MostBids;
