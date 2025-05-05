"use client";

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

import DollarSign from "../../../public/images/dollar.svg";
import RedHourGlass from "../../../public/images/red-hour-glass.svg";
// import AvatarOne from "../../../public/images/avatar-one.svg";
// import AvatarTwo from "../../../public/images/avatar-two.svg";
// import AvatarFour from "../../../public/images/avatar-four.svg";
import {
  getAuctionTransactions,
  getCarsWithMostPot,
  getWagers,
} from "@/lib/data";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import SwiperCore from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import { A11y, Navigation, Pagination, Scrollbar } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import TransitionPattern from "../../../public/images/transition-pattern-3.svg";
import { TimerProvider, useTimer } from "../context/TimerContext";
import WagerCycle from "./wager_cycle";

const WEBSOCKET_SERVER = "https://socket-practice-c55s.onrender.com";

SwiperCore.use([Navigation, Pagination, Scrollbar, A11y]);

const LivePageCarousel = () => {
  const [carWithMostPot, setCarWithMostPot] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);

  const swiperRef = useRef<SwiperCore>();

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

  useEffect(() => {
    const fetchData = async () => {
      const mostPot = await getCarsWithMostPot(1);
      if (mostPot) {
        setCarWithMostPot(mostPot.cars);
        setIsLoading(false);
        console.log(mostPot.cars[0]);
      }
    };
    fetchData();
  }, []);


  return (
    <>
      {isLoading ? (
        <LoadingLivePageCarousel />
      ) : (
        <div className="relative section-container max-w-[1440px] overflow-hidden m-auto mt-4 md:mt-6 md:mb-[58px]">
          <div className="w-full overflow-hidden">
            <Swiper
              modules={[Navigation, Pagination, Scrollbar, A11y]}
              spaceBetween={50}
              slidesPerView={1}
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
              }}
              style={{
                '--swiper-navigation-color': '#fff',
              } as React.CSSProperties}

            >
              <SwiperSlide className="scroll-item">
                {carWithMostPot.length > 0 ? (
                  <TimerProvider deadline={carWithMostPot[0].deadline}>
                    <SlideOne carData={carWithMostPot[0]} />
                  </TimerProvider>
                ) : null}
              </SwiperSlide>
              <SwiperSlide >
                <div className='live-carousel-slide'>
                  Section 2
                </div>
              </SwiperSlide>
              <SwiperSlide >
                <div className='live-carousel-slide'>
                  Section 3
                </div>
              </SwiperSlide>
              <SwiperSlide >
                <div className='live-carousel-slide'>
                  Section 4
                </div>
              </SwiperSlide>
              <SwiperSlide >
                <div className='live-carousel-slide'>
                  Section 5
                </div>
              </SwiperSlide>
            </Swiper>
            <div onClick={handleLeftArrow} className='swiper-button-prev' style={{ color: 'white' }}>

            </div>
            <div onClick={handleRightArrow} className='swiper-button-next' style={{ color: 'white' }}>

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LivePageCarousel;

const SlideOne = ({ carData }: any) => {
  const [prize, setPrize] = useState(0);
  const [wagers, setWagers] = useState<any>([]);
  const [currentImage, setCurrentImage] = useState(carData.image);
  const timerValues = useTimer();
  const router = useRouter();

  useEffect(() => {
    const socket = io(WEBSOCKET_SERVER);

    socket.on("connect", () => {
      console.log(`Connected to server with socket ID: ${socket.id}`);
    });

    socket.on("addWager", async (wager) => {
      if (wager.auctionID === carData._id) {
        setPrize((prev) => prev + wager.wagerAmount * 0.88);
        setWagers((prev: any) => [...prev, wager]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchPrize = async () => {
      const { totalPrize } = await getAuctionTransactions(carData._id);
      setPrize(totalPrize);

      const wagers = await getWagers(carData._id);
      setWagers(wagers);
    };
    fetchPrize();
  }, []);

  return (
    <div className="section-one xl:items-end md:justify-center w-full rounded-[20px] md:flex md:items-center z-20">
      <div className="xl:py-11 xl:px-14 md:w-full md:h-full">
        <Link
          href={`/auctions/car_view_page/${carData.auction_id}`}
          className="relative h-full"
        >
          <span className="absolute z-50 text-sm font-bold bg-[#c2451e] py-2 px-[15px] rounded-full top-[12px] left-[12px]">
            LIVE
          </span>
          <div className="relative block rounded-t-[20px] md:rounded-[20px] xl:rounded md:h-[100%] live-page-image-sizing xl:w-full">
            {carData.images_list
              .slice(0, 5)
              .map((image: any, index: number) => {
                return (
                  <Image
                    key={image.src}
                    src={index === 4 ? carData.image : image.src}
                    width={808}
                    height={538}
                    alt="dollar"
                    className={`${index !== 0
                      ? "absolute top-0 left-0 z-30 bottom-0"
                      : "z-40"
                      } object-cover rounded-t-[20px] md:rounded-[20px] md:h-[100%] live-page-image-sizing md xl:rounded pic ${"pic" + (5 - index)
                      }`}
                  />
                );
              })}
          </div>
          <WagerCycle words={wagers} />
        </Link>
      </div>
      <div className="py-8 px-4 md:max-w-[392px] xl:pt-0 xl:pl-0 xl:pb-11 xl:pr-14">
        <button
          disabled
          className="text-sm text-[#ff4308] flex gap-1 bg-[#5f3530] py-[3px] px-2 items-center rounded-full mb-3"
        >
          <Image src={RedHourGlass} alt="hour glass" width={8} height={8} />
          <div>Time Left:</div>
          <div>{`${timerValues.days}:${timerValues.hours}:${timerValues.minutes}:${timerValues.seconds}`}</div>
        </button>
        <div className="font-bold text-xl mb-1">
          {carData.year} {carData.make} {carData.model}
        </div>
        <div className="opacity-80 text-sm mb-8 line-clamp-3">
          {carData.description[0]}
        </div>

        <div className="relative p-6 bg-[#FFFFFF1A] rounded-lg live-page-shadow z-[1]">
          <span className="font-bold text-sm text-black bg-[#49c742] py-1 px-[10px] rounded">
            PRIZE POOL
          </span>
          <div className="mt-4 mb-6 font-bold text-5xl">
            $
            {prize % 1 === 0
              ? prize.toLocaleString()
              : prize.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
          </div>
          <button
            onClick={(e) =>
              router.push(`/auctions/car_view_page/${carData.auction_id}`)
            }
            className="font-bold text-black bg-[#f2ca16] py-[10px] w-full rounded mb-3"
          >
            BUY IN FOR $10
          </button>
          <div className="text-sm flex items-center gap-2">
            <Image src={DollarSign} alt="hour glass" width={14} height={14} />
            <div>Current Bid:</div>
            <div className="text-[#49c742] font-bold">
              ${new Intl.NumberFormat().format(carData.price)}
            </div>
          </div>
          <div className="absolute top-0 left-0 -z-[1] w-full">
            <Image
              src={TransitionPattern}
              alt="pattern"
              className="rounded-lg object-cover w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const LoadingLivePageCarousel = () => {
  return (
    <div className="section-container max-w-[1440px] m-auto mt-4 md:mt-6 md:mb-[58px] md:h-[462px] xl:h-[520px] 2xl:h-[627px]">
      <div className="bg-gray-800 rounded-t-[20px] md:rounded-[20px] rounded-[20px] md:flex md:items-center xl:items-end h-full">
        <div className="xl:py-11 xl:px-14 xl:w-full md:h-full load-image-sizing">
          <div className="bg-gray-700 md:w-full animate-pulse rounded-t-[20px] md:rounded-[20px] md:h-full live-page-image-sizing md xl:rounded"></div>
        </div>
        <div className="h-[462px] py-8 px-4 md:w-[392px] xl:pt-0 xl:pl-0 xl:pb-11 xl:pr-14">
          <div className="animate-pulse bg-gray-700 w-[175px] h-[26px] rounded-full mb-3"></div>
          <div className="animate-pulse bg-gray-700 w-full h-[28px] rounded mb-2"></div>
          <div className="animate-pulse bg-gray-700 w-full h-[20px] rounded mb-1"></div>
          <div className="animate-pulse bg-gray-700 w-full h-[20px] rounded mb-1"></div>
          <div className="animate-pulse bg-gray-700 w-full h-[20px] rounded mb-[32px]"></div>
          <div className="animate-pulse bg-gray-700 w-full h-[236px] rounded"></div>
        </div>
      </div>
    </div>
  );
};
