import { getCarsWithFilter, getLiveAuctionsToDisplay } from "@/lib/data";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { TimerProvider } from "../context/TimerContext";

import SwiperCore from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import { A11y, Navigation, Pagination, Scrollbar } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import ArrowLeft from "../../../public/images/arrow-left.svg";
import ArrowRight from "../../../public/images/arrow-right.svg";
import LiveGamesIcon from "../../../public/images/currency-dollar-circle.svg";

SwiperCore.use([Navigation, Pagination, Scrollbar, A11y]);

const LiveGames = ({ numberToDisplay = 5 }: { numberToDisplay: number }) => {
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
        <div className="flex w-auto mt-8 justify-center items-center max-sm:flex-col">
          <div className="flex flex-col w-full max-sm:flex-row justify-evenly items-center">
            <div className="w-48 mb-5 h-48 rounded-full bg-gray-700 max-md:w-36 max-md:h-36"></div>
            <div className="flex flex-col w-2/3 max-md:w-1/2">
              <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
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
      className={` py-8 sm:py-16 ${pathname === "/" ? "w-3/5 max-lg:w-full" : null
        }`}
    >
      <header className="flex justify-between">
        <div className="flex items-center">
          {pathname === "/live" ? null : (
            <Image
              src={LiveGamesIcon}
              width={40}
              height={40}
              alt="dollar"
              className={`w-10 h-10`}
            />
          )}
          {pathname === "/live" ? (
            <div className="font-bold text-xl sm:text-5xl ml-4">
              Live Games
            </div>
          ) : (
            <div className="font-bold text-xl sm:text-3xl ml-4">
              {pathname === "/" && "More "}Live Games
            </div>
          )}
        </div>
        <div className="flex max-md:hidden">
          <Image
            src={ArrowLeft}
            width={32}
            height={32}
            alt="arrow left"
            className="w-8 h-8"
            onClick={handleLeftArrow}
          />
          <Image
            src={ArrowRight}
            width={32}
            height={32}
            alt="arrow right"
            className="w-8 h-8 ml-4"
            onClick={handleRightArrow}
          />
        </div>
      </header>
      {isLoading ? (
        <div className="p-4 sm:py-16">
          <div className="flex flex-col">
            <div className="flex w-full mt-8 justify-center items-center max-sm:flex-col">
              <div className="flex flex-col w-full max-sm:flex-row justify-evenly items-center">
                <div className="w-48 mb-5 h-48 rounded-full bg-gray-700 max-md:w-36 max-md:h-36"></div>
                <div className="flex flex-col w-2/3 max-md:w-1/2">
                  <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
                  <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
                  <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
                  <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
                </div>
              </div>
              <div className="flex flex-col w-full max-sm:flex-row justify-evenly items-center">
                <div className="w-48 mb-5 h-48 rounded-full bg-gray-700 max-md:w-36 max-md:h-36"></div>
                <div className="flex flex-col w-2/3 max-md:w-1/2">
                  <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
                  <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
                  <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
                  <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
                </div>
              </div>
              <div className="flex flex-col w-full max-sm:flex-row justify-evenly items-center">
                <div className="w-48 mb-5 h-48 rounded-full bg-gray-700 max-md:w-36 max-md:h-36"></div>
                <div className="flex flex-col w-2/3 max-md:w-1/2">
                  <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
                  <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
                  <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
                  <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
                </div>
              </div>
              {pathname === "/discover" || pathname === "/live" ? (
                <>
                  <div className="flex flex-col w-full max-sm:flex-row justify-evenly items-center">
                    <div className="w-48 mb-5 h-48 rounded-full bg-gray-700 max-md:w-36 max-md:h-36"></div>
                    <div className="flex flex-col w-2/3 max-md:w-1/2">
                      <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
                      <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
                      <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
                      <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex flex-col w-full max-sm:flex-row justify-evenly items-center">
                    <div className="w-48 mb-5 h-48 rounded-full bg-gray-700 max-md:w-36 max-md:h-36"></div>
                    <div className="flex flex-col w-2/3 max-md:w-1/2">
                      <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
                      <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
                      <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
                      <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <section className="mt-6">
          {isMobile ? (
            <div className="flex flex-col items-center">
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
                  <div key={index} className="mb-4">
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
