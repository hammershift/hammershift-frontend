import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { getCarsWithFilter, getLiveAuctionsToDisplay } from "@/lib/data";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { TimerProvider } from "../_context/TimerContext";

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import SwiperCore from 'swiper';

import LiveGamesIcon from "../../../public/images/currency-dollar-circle.svg";
import ArrowRight from "../../../public/images/arrow-right.svg";
import ArrowLeft from "../../../public/images/arrow-left.svg";

SwiperCore.use([Navigation, Pagination, Scrollbar, A11y]);

const LiveGames = ({ numberToDisplay = 3 }: { numberToDisplay: number }) => {
  const [liveGames, setLiveGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sliderTransform, setSlidertransform] = useState(0);
  const [offset, setOffset] = useState(0);
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  const swiperRef = useRef<SwiperCore>();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize(); // Check on initial render
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleLeftArrow = () => {
    if (swiperRef.current) {
      swiperRef.current.slidePrev();
    }
  };

  const handleRightArrow = () => {
    if (swiperRef.current) {
      swiperRef.current.slideNext();
    }
  };

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



  return (
    <div
      className={`md:tw-overflow-hidden tw-py-8 sm:tw-py-16 ${pathname === "/" ? "tw-w-1/2 max-lg:tw-w-full" : null
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
            onClick={handleLeftArrow}
          />
          <Image
            src={ArrowRight}
            width={32}
            height={32}
            alt="arrow right"
            className="tw-w-8 tw-h-8 tw-ml-4"
            onClick={handleRightArrow}
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
        <section className="tw-mt-6">
          {isMobile ? (
            <div className="tw-flex tw-flex-col tw-items-center">
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
                  <div key={index} className="tw-mb-4">
                    <TimerProvider deadline={deadline}>
                      <DynamicLiveGamesCard
                        parentIndex={index >= 10 ? index - 10 : index}
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
                  </div>
                );
              })}
            </div>
          ) : (
            <Swiper
              modules={[Navigation, Pagination, Scrollbar, A11y]}
              spaceBetween={25}
              slidesPerView={numberToDisplay}
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
              }}
              style={{
                '--swiper-navigation-color': '#fff',
                '--swiper-pagination-color': '#fff',
                '--swiper-pagination-bullet-inactive-color': '#fff',
                '--swiper-pagination-bullet-inactive-opacity': '0.2',
              } as React.CSSProperties}
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
                  <SwiperSlide key={index}>
                    <TimerProvider deadline={deadline}>
                      <DynamicLiveGamesCard
                        parentIndex={index >= 10 ? index - 10 : index}
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
                  </SwiperSlide>
                );
              })}
            </Swiper>
          )}
        </section>
      )}
    </div>
  );
};

export default LiveGames;
