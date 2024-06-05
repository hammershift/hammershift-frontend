import React, { useEffect, useState } from "react";
import Image from "next/image";
import { getCarsWithFilter, getLiveAuctionsToDisplay } from "@/lib/data";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { TimerProvider } from "../_context/TimerContext";

import LiveGamesIcon from "../../../public/images/currency-dollar-circle.svg";
import ArrowRight from "../../../public/images/arrow-right.svg";
import ArrowLeft from "../../../public/images/arrow-left.svg";

const LiveGames = () => {
  const [liveGames, setLiveGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sliderTransform, setSlidertransform] = useState(0);
  const [offset, setOffset] = useState(0);
  const pathname = usePathname();

  const DynamicLiveGamesCard = dynamic(
    () => import("@/app/components/live_games_card"),
    {
      ssr: false,
      loading: () => (
        <div className="tw-flex tw-w-auto tw-mt-8 tw-justify-center tw-items-center max-sm:tw-flex-col">
          <div className="tw-flex tw-flex-col tw-w-full max-sm:tw-flex-row tw-justify-evenly tw-items-center">
            <div className="tw-w-48 tw-mb-5 tw-h-48 tw-rounded-full tw-bg-gray-700 max-md:tw-w-36 max-md:tw-h-36"></div>
            <div className="tw-flex tw-flex-col tw-w-2/3 max-md:tw-w-1/2">
              <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
              <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
              <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
              <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
            </div>
          </div>
        </div>
      ),
    }
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (
          pathname === "/" ||
          pathname === "/discover" ||
          pathname === "/live"
        ) {
          setIsLoading(true);
          let liveGamesData;
          try {
            if (pathname === "/") {
              console.log("Fetching live auctions with limit 10");
              liveGamesData = await getLiveAuctionsToDisplay(10, offset);
            } else if (pathname === "/discover") {
              console.log("Fetching live auctions with limit 20");
              liveGamesData = await getLiveAuctionsToDisplay(20, 0);
            }
          } catch (error) {
            console.error("Error fetching liveGamesData:", error);
          }

          if (
            liveGamesData &&
            "cars" in liveGamesData &&
            liveGamesData.total > 0
          ) {
            setLiveGames(liveGamesData.cars);
            setIsLoading(false);
          } else {
            console.log("Fetching default live games data");
            // If liveGamesData.total is 0, fetch from defaultLiveGamesData
            try {
              let defaultLiveGamesData;
              if (pathname === "/") {
                defaultLiveGamesData = await getCarsWithFilter({ limit: 10 });
                console.log("/live: ", defaultLiveGamesData);
              }
              if (pathname === "/discover") {
                defaultLiveGamesData = await getCarsWithFilter({ limit: 10 });
              }
              if (pathname === "/live") {
                defaultLiveGamesData = await getCarsWithFilter({ limit: 20 });
              }

              if (defaultLiveGamesData && "cars" in defaultLiveGamesData) {
                setLiveGames(defaultLiveGamesData.cars);
              } else {
                console.error(
                  "Unexpected data structure:",
                  defaultLiveGamesData
                );
              }
            } catch (error) {
              console.error("Error fetching default liveGamesData:", error);
            }
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };
    fetchData();
  }, [offset, pathname]);

  const rightArrowHandler = () => {
    if (sliderTransform === -60) {
      setSlidertransform(0);
    } else {
      setSlidertransform((prev) => prev - 30);
    }
  };
  const leftArrowHandler = () => {
    if (sliderTransform === 0) {
      setSlidertransform(-60);
    } else {
      setSlidertransform((prev) => prev + 30);
    }
  };

  return (
    <div
      className={`md:tw-overflow-hidden tw-py-8 sm:tw-py-16 ${
        pathname === "/" ? "tw-w-1/2 max-lg:tw-w-full" : null
      }`}
    >
      <header className="tw-flex tw-justify-between">
        <div className="tw-flex tw-items-center">
          {pathname === "/live" ? null : (
            <Image
              src={LiveGamesIcon}
              width={40}
              height={40}
              alt="dollar"
              className={`tw-w-10 tw-h-10`}
            />
          )}
          {pathname === "/live" ? (
            <div className="tw-font-bold tw-text-xl sm:tw-text-5xl tw-ml-4">
              Live Games
            </div>
          ) : (
            <div className="tw-font-bold tw-text-xl sm:tw-text-3xl tw-ml-4">
              {pathname === "/" && "More "}Live Games
            </div>
          )}
        </div>
        <div className="tw-flex max-md:tw-hidden">
          <Image
            src={ArrowLeft}
            width={32}
            height={32}
            alt="arrow left"
            className="tw-w-8 tw-h-8"
            onClick={leftArrowHandler}
          />
          <Image
            src={ArrowRight}
            width={32}
            height={32}
            alt="arrow right"
            className="tw-w-8 tw-h-8 tw-ml-4"
            onClick={rightArrowHandler}
          />
        </div>
      </header>
      {isLoading ? (
        <div className="tw-p-4 sm:tw-py-16">
          <div className="tw-flex tw-flex-col">
            <div className="tw-flex tw-w-full tw-mt-8 tw-justify-center tw-items-center max-sm:tw-flex-col">
              <div className="tw-flex tw-flex-col tw-w-full max-sm:tw-flex-row tw-justify-evenly tw-items-center">
                <div className="tw-w-48 tw-mb-5 tw-h-48 tw-rounded-full tw-bg-gray-700 max-md:tw-w-36 max-md:tw-h-36"></div>
                <div className="tw-flex tw-flex-col tw-w-2/3 max-md:tw-w-1/2">
                  <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
                  <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
                  <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
                  <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
                </div>
              </div>
              <div className="tw-flex tw-flex-col tw-w-full max-sm:tw-flex-row tw-justify-evenly tw-items-center">
                <div className="tw-w-48 tw-mb-5 tw-h-48 tw-rounded-full tw-bg-gray-700 max-md:tw-w-36 max-md:tw-h-36"></div>
                <div className="tw-flex tw-flex-col tw-w-2/3 max-md:tw-w-1/2">
                  <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
                  <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
                  <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
                  <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
                </div>
              </div>
              <div className="tw-flex tw-flex-col tw-w-full max-sm:tw-flex-row tw-justify-evenly tw-items-center">
                <div className="tw-w-48 tw-mb-5 tw-h-48 tw-rounded-full tw-bg-gray-700 max-md:tw-w-36 max-md:tw-h-36"></div>
                <div className="tw-flex tw-flex-col tw-w-2/3 max-md:tw-w-1/2">
                  <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
                  <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
                  <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
                  <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
                </div>
              </div>
              {pathname === "/discover" || pathname === "/live" ? (
                <>
                  <div className="tw-flex tw-flex-col tw-w-full max-sm:tw-flex-row tw-justify-evenly tw-items-center">
                    <div className="tw-w-48 tw-mb-5 tw-h-48 tw-rounded-full tw-bg-gray-700 max-md:tw-w-36 max-md:tw-h-36"></div>
                    <div className="tw-flex tw-flex-col tw-w-2/3 max-md:tw-w-1/2">
                      <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
                      <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
                      <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
                      <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
                    </div>
                  </div>
                  <div className="tw-flex tw-flex-col tw-w-full max-sm:tw-flex-row tw-justify-evenly tw-items-center">
                    <div className="tw-w-48 tw-mb-5 tw-h-48 tw-rounded-full tw-bg-gray-700 max-md:tw-w-36 max-md:tw-h-36"></div>
                    <div className="tw-flex tw-flex-col tw-w-2/3 max-md:tw-w-1/2">
                      <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
                      <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
                      <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
                      <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <section
          className={`sm:tw-w-auto md:tw-w-[2200px] tw-mt-12 tw-grid tw-gap-y-8 md:tw-gap-y-16 md:tw-transition md:tw-duration-[2000ms] tw-overflow-hidden  ${
            pathname === "/"
              ? "md:tw-grid-cols-10 max-sm:tw-grid-cols-1"
              : "sm:tw-grid-cols-1 md:tw-grid-cols-10 lg:tw-grid-cols-10 xl:tw-grid-cols-10 tw-gap-x-4 md:tw-gap-x-6"
          }`}
          style={{
            transform: `translate(${sliderTransform}%)`,
          }}
        >
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
              images_list,
            } = auctions;
            return (
              <TimerProvider key={index} deadline={deadline}>
                <DynamicLiveGamesCard
                  parentIndex={index}
                  object_id={_id}
                  image={image}
                  year={year}
                  make={make}
                  model={model}
                  description={description}
                  deadline={deadline}
                  auction_id={auction_id}
                  price={price}
                  images_list={images_list}
                />
              </TimerProvider>
            );
          })}
        </section>
      )}
    </div>
  );
};

export default LiveGames;
