"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

import ArrowRight from "../../../public/images/arrow-right.svg";
import ArrowLeft from "../../../public/images/arrow-left.svg";
import RedHourGlass from "../../../public/images/red-hour-glass.svg";
import DollarSign from "../../../public/images/dollar.svg";
import AvatarOne from "../../../public/images/avatar-one.svg";
import AvatarTwo from "../../../public/images/avatar-two.svg";
import AvatarFour from "../../../public/images/avatar-four.svg";
import TransitionPattern from "../../../public/images/transition-pattern-3.svg";
import {
    getAuctionTransactions,
    getCarsWithMostPot,
    getWagers,
} from "@/lib/data";
import { TimerProvider, useTimer } from "../_context/TimerContext";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import WagerCycle from "./wager_cycle";
import { io } from "socket.io-client";

const WEBSOCKET_SERVER = "https://socket-practice-c55s.onrender.com";

const LivePageCarousel = () => {
    const [sliderTransform, setSlidertransform] = useState(0);
    const [carWithMostPot, setCarWithMostPot] = useState<any>([]);
    const [isLoading, setIsLoading] = useState(true);

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

    const rightArrowHandler = () => {
        if (sliderTransform === -80) {
            setSlidertransform(0);
        } else {
            setSlidertransform((prev) => prev - 20);
        }
    };
    const leftArrowHandler = () => {
        if (sliderTransform === 0) {
            setSlidertransform(-80);
        } else {
            setSlidertransform((prev) => prev + 20);
        }
    };

    return (
        <>
            {isLoading ? (
                <LoadingLivePageCarousel />
            ) : (
                <div className="tw-relative section-container tw-max-w-[1440px] tw-overflow-hidden tw-m-auto tw-mt-4 md:tw-mt-6 md:tw-mb-[58px]">
                    <div className="tw-w-full tw-overflow-hidden">
                        <div
                            className="tw-transition tw-duration-[2000ms] tw-flex"
                            style={{
                                transform: `translate(${sliderTransform}%)`,
                                width: "500%",
                            }}
                        >
                            {carWithMostPot.length > 0 ? (
                                <TimerProvider
                                    deadline={carWithMostPot[0].deadline}
                                >
                                    <SlideOne carData={carWithMostPot[0]} />
                                </TimerProvider>
                            ) : null}
                            <div className="tw-basis-full tw-flex tw-justify-center tw-items-center">
                                Section 2
                            </div>
                            <div className="tw-basis-full tw-flex tw-justify-center tw-items-center">
                                Section 3
                            </div>
                            <div className="tw-basis-full tw-flex tw-justify-center tw-items-center">
                                Section 4
                            </div>
                            <div className="tw-basis-full tw-flex tw-justify-center tw-items-center">
                                Section 5
                            </div>
                        </div>
                        <div>
                            <button
                                className="tw-absolute tw-top-[50%] md:tw-left-11 tw-left-0 tw-z-50 tw-rounded-full tw-p-[10px] tw-bg-[#FFFFFF4D] md:tw-bg-[#FFFFFF4D] tw-backdrop-blur"
                                onClick={leftArrowHandler}
                            >
                                <Image
                                    src={ArrowLeft}
                                    alt="arrow left"
                                    width={20}
                                    height={20}
                                />
                            </button>
                            <button
                                className="tw-absolute tw-top-[50%] md:tw-right-11 tw-right-0 tw-rounded-full tw-p-[10px] tw-bg-[#FFFFFF4D] tw-backdrop-blur"
                                onClick={rightArrowHandler}
                            >
                                <Image
                                    src={ArrowRight}
                                    alt="arrow left"
                                    width={20}
                                    height={20}
                                />
                            </button>
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
            const transactions = await getAuctionTransactions(carData._id);
            const totalPrize =
                0.88 *
                transactions
                    .map((transaction: any) => transaction.amount)
                    .reduce(
                        (accumulator: any, currentValue: any) =>
                            accumulator + currentValue,
                        0
                    );
            setPrize(totalPrize);

            const wagers = await getWagers(carData._id);
            setWagers(wagers);
        };
        fetchPrize();
    }, []);

    return (
        <div className="section-one xl:tw-items-end md:tw-justify-center tw-w-full tw-rounded-[20px] md:tw-flex md:tw-items-center tw-z-20">
            <div className="xl:tw-py-11 xl:tw-px-14 md:tw-w-full md:tw-h-full">
                <Link
                    href={`/auctions/car_view_page/${carData.auction_id}`}
                    className="tw-relative tw-h-full"
                >
                    <span className="tw-absolute tw-z-50 tw-text-sm tw-font-bold tw-bg-[#c2451e] tw-py-2 tw-px-[15px] tw-rounded-full tw-top-[12px] tw-left-[12px]">
                        LIVE
                    </span>
                    <div className="tw-relative tw-block tw-rounded-t-[20px] md:tw-rounded-[20px] xl:tw-rounded md:tw-h-[100%] live-page-image-sizing xl:tw-w-full">
                        {carData.images_list
                            .slice(0, 5)
                            .map((image: any, index: number) => {
                                return (
                                    <Image
                                        key={image.src}
                                        src={
                                            index === 4
                                                ? carData.image
                                                : image.src
                                        }
                                        width={808}
                                        height={538}
                                        alt="dollar"
                                        className={`${
                                            index !== 0
                                                ? "tw-absolute tw-top-0 tw-left-0 tw-z-30 tw-bottom-0"
                                                : "tw-z-40"
                                        } tw-object-cover tw-rounded-t-[20px] md:tw-rounded-[20px] md:tw-h-[100%] live-page-image-sizing md xl:tw-rounded pic ${
                                            "pic" + (5 - index)
                                        }`}
                                    />
                                );
                            })}
                    </div>
                    <WagerCycle words={wagers} />
                </Link>
            </div>
            <div className="tw-py-8 tw-px-4 md:tw-max-w-[392px] xl:tw-pt-0 xl:tw-pl-0 xl:tw-pb-11 xl:tw-pr-14">
                <button
                    disabled
                    className="tw-text-sm tw-text-[#ff4308] tw-flex tw-gap-1 tw-bg-[#5f3530] tw-py-[3px] tw-px-2 tw-items-center tw-rounded-full tw-mb-3"
                >
                    <Image
                        src={RedHourGlass}
                        alt="hour glass"
                        width={8}
                        height={8}
                    />
                    <div>Time Left:</div>
                    <div>{`${timerValues.days}:${timerValues.hours}:${timerValues.minutes}:${timerValues.seconds}`}</div>
                </button>
                <div className="tw-font-bold tw-text-xl tw-mb-1">
                    {carData.year} {carData.make} {carData.model}
                </div>
                <div className="tw-opacity-80 tw-text-sm tw-mb-8 tw-line-clamp-3">
                    {carData.description[0]}
                </div>

                <div className="tw-relative tw-p-6 tw-bg-[#FFFFFF1A] tw-rounded-lg live-page-shadow tw-z-[1]">
                    <span className="tw-font-bold tw-text-sm tw-text-black tw-bg-[#49c742] tw-py-1 tw-px-[10px] tw-rounded">
                        PRIZE POOL
                    </span>
                    <div className="tw-mt-4 tw-mb-6 tw-font-bold tw-text-5xl">
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
                            router.push(
                                `/auctions/car_view_page/${carData.auction_id}`
                            )
                        }
                        className="tw-font-bold tw-text-black tw-bg-[#f2ca16] tw-py-[10px] tw-w-full tw-rounded tw-mb-3"
                    >
                        BUY IN FOR $10
                    </button>
                    <div className="tw-text-sm tw-flex tw-items-center tw-gap-2">
                        <Image
                            src={DollarSign}
                            alt="hour glass"
                            width={14}
                            height={14}
                        />
                        <div>Current Bid:</div>
                        <div className="tw-text-[#49c742] tw-font-bold">
                            ${new Intl.NumberFormat().format(carData.price)}
                        </div>
                    </div>
                    <div className="tw-absolute tw-top-0 tw-left-0 -tw-z-[1] tw-w-full">
                        <Image
                            src={TransitionPattern}
                            alt="pattern"
                            className="tw-rounded-lg tw-object-cover tw-w-full"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const LoadingLivePageCarousel = () => {
    return (
        <div className="section-container tw-max-w-[1440px] tw-m-auto tw-mt-4 md:tw-mt-6 md:tw-mb-[58px] md:tw-h-[462px] xl:tw-h-[520px] 2xl:tw-h-[627px]">
            <div className="tw-bg-gray-800 tw-rounded-t-[20px] md:tw-rounded-[20px] tw-rounded-[20px] md:tw-flex md:tw-items-center xl:tw-items-end tw-h-full">
                <div className="xl:tw-py-11 xl:tw-px-14 xl:tw-w-full md:tw-h-full load-image-sizing">
                    <div className="tw-bg-gray-700 md:tw-w-full tw-animate-pulse tw-rounded-t-[20px] md:tw-rounded-[20px] md:tw-h-full live-page-image-sizing md xl:tw-rounded"></div>
                </div>
                <div className="tw-h-[462px] tw-py-8 tw-px-4 md:tw-w-[392px] xl:tw-pt-0 xl:tw-pl-0 xl:tw-pb-11 xl:tw-pr-14">
                    <div className="tw-animate-pulse tw-bg-gray-700 tw-w-[175px] tw-h-[26px] tw-rounded-full tw-mb-3"></div>
                    <div className="tw-animate-pulse tw-bg-gray-700 tw-w-full tw-h-[28px] tw-rounded tw-mb-2"></div>
                    <div className="tw-animate-pulse tw-bg-gray-700 tw-w-full tw-h-[20px] tw-rounded tw-mb-1"></div>
                    <div className="tw-animate-pulse tw-bg-gray-700 tw-w-full tw-h-[20px] tw-rounded tw-mb-1"></div>
                    <div className="tw-animate-pulse tw-bg-gray-700 tw-w-full tw-h-[20px] tw-rounded tw-mb-[32px]"></div>
                    <div className="tw-animate-pulse tw-bg-gray-700 tw-w-full tw-h-[236px] tw-rounded"></div>
                </div>
            </div>
        </div>
    );
};
