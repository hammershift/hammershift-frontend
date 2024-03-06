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

const LivePageCarousel = () => {
    const [sliderTransform, setSlidertransform] = useState(0);
    const [carWithMostPot, setCarWithMostPot] = useState<any>([]);

    useEffect(() => {
        const fetchData = async () => {
            const mostPot = await getCarsWithMostPot(1);
            if (mostPot) {
                setCarWithMostPot(mostPot.cars);
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
        <div className="tw-relative section-container tw-max-w-[1440px] tw-overflow-hidden tw-m-auto tw-mt-4 md:tw-mt-6 md:tw-mb-[58px]">
            <div className="tw-relative tw-w-full tw-overflow-hidden">
                <div
                    className="tw-transition tw-duration-[2000ms] tw-flex"
                    style={{
                        transform: `translate(${sliderTransform}%)`,
                        width: "500%",
                    }}
                >
                    {carWithMostPot.length > 0 ? (
                        <TimerProvider deadline={carWithMostPot[0].deadline}>
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
                        className="tw-absolute tw-top-[50%] tw-rounded-full tw-p-[10px] tw-bg-[#FFFFFF4D] md:tw-bg-[#FFFFFF4D]"
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
                        className="tw-absolute tw-top-[50%] tw-right-0 tw-rounded-full tw-p-[10px] tw-bg-[#FFFFFF4D]"
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
    );
};

export default LivePageCarousel;

const SlideOne = ({ carData }: any) => {
    const [prize, setPrize] = useState(0);
    const [wagers, setWagers] = useState([]);
    const timerValues = useTimer();
    const router = useRouter();

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
        <div className="tw-bg-gradient-to-br xl:tw-items-end md:tw-justify-center tw-from-[#1a2c3d] tw-from-30% tw-via-[#2b3b6c] tw-via-60% tw-to-[#b91f6c] to-30% tw-w-full tw-rounded-[20px] md:tw-flex md:tw-items-center">
            <div className="xl:tw-py-11 xl:tw-px-14 xl:tw-w-full md:tw-h-full">
                <Link
                    href={`/auctions/car_view_page/${carData.auction_id}`}
                    className="tw-relative tw-h-full"
                >
                    <span className="tw-absolute tw-text-sm tw-font-bold tw-bg-[#c2451e] tw-py-2 tw-px-[15px] tw-rounded-full tw-top-[12px] tw-left-[12px]">
                        LIVE
                    </span>
                    <Image
                        src={carData.image}
                        width={1000}
                        height={1000}
                        alt="dollar"
                        className="tw-object-cover tw-rounded-t-[20px] md:tw-rounded-[20px] md:tw-h-[100%] live-page-image-sizing md xl:tw-rounded xl:tw-w-full"
                    />
                    <div className="tw-absolute tw-bottom-[21px] tw-left-[16px] tw-text-sm tw-font-light tw-flex tw-flex-col tw-gap-[10px]">
                        {wagers.slice(0, 3).map((wager: any) => {
                            return (
                                <div
                                    key={wager._id}
                                    className="tw-flex tw-items-center tw-gap-2"
                                >
                                    <Image
                                        src={
                                            wager.user.image
                                                ? wager.user.image
                                                : AvatarTwo
                                        }
                                        alt="avatar one"
                                        width={24}
                                        height={24}
                                        className="tw-rounded-full"
                                    />
                                    <div>
                                        @{wager.user.username} wagered $
                                        {new Intl.NumberFormat().format(
                                            wager.priceGuessed
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
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
                        PLACE A WAGER
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
