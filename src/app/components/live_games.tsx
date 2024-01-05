import React, { useEffect, useState } from "react";
import Image from "next/image";
import { getCarsWithFilter } from "@/lib/data";
import { TimerProvider } from "../_context/TimerContext";
import LiveGamesIcon from "../../../public/images/currency-dollar-circle.svg";
import ArrowRight from "../../../public/images/arrow-right.svg";
import ArrowLeft from "../../../public/images/arrow-left.svg";

import { MoonLoader } from "react-spinners";
import dynamic from "next/dynamic";

const LiveGames = () => {
  const [liveGames, setLiveGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const DynamicLiveGamesCard = dynamic(
    () => import("@/app/components/live_games_card"),
    { ssr: false, loading: () => <MoonLoader color="#ffe500" /> }
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const liveGamesData = await getCarsWithFilter({ limit: 5 });
        setIsLoading(true);

        if (liveGamesData && "cars" in liveGamesData) {
          setLiveGames(liveGamesData.cars);
          setIsLoading(false);
        } else {
          console.error("Unexpected data structure:", liveGamesData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);
  return (
    <div className="section-container tw-py-8 sm:tw-py-16">
      <header className="tw-flex tw-justify-between">
        <div className="tw-flex tw-items-center">
          <Image
            src={LiveGamesIcon}
            width={40}
            height={40}
            alt="dollar"
            className="tw-w-10 tw-h-10"
          />
          <div className="tw-font-bold tw-text-2xl sm:tw-text-3xl tw-ml-4">
            Live Games
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
      {isLoading ? (
        <div className="tw-flex tw-mt-8 tw-justify-evenly">
          <div className="tw-flex tw-flex-col">
            <div className="tw-w-48 tw-mb-5 tw-h-48 tw-rounded-full tw-bg-gray-700"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
          </div>
          <div className="tw-flex tw-flex-col">
            <div className="tw-w-48 tw-mb-5 tw-h-48 tw-rounded-full tw-bg-gray-700"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
          </div>
          <div className="tw-flex tw-flex-col">
            <div className="tw-w-48 tw-mb-5 tw-h-48 tw-rounded-full tw-bg-gray-700"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
          </div>
          <div className="tw-flex tw-flex-col">
            <div className="tw-w-48 tw-mb-5 tw-h-48 tw-rounded-full tw-bg-gray-700"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
          </div>
          <div className="tw-flex tw-flex-col">
            <div className="tw-w-48 tw-mb-5 tw-h-48 tw-rounded-full tw-bg-gray-700"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
          </div>
        </div>
      ) : (
        <section className="tw-flex tw-flex-col sm:tw-flex-row sm:tw-w-full tw-overflow-x-auto xl:tw-overflow-visible tw-gap-4 sm:tw-gap-8 xl:tw-gap-0 xl:tw-justify-between tw-mt-8">
          {liveGames.map((auctions, index) => {
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
                  <DynamicLiveGamesCard
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
        </section>
      )}
    </div>
  );
};

export default LiveGames;
