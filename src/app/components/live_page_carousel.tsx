"use client";

import React, { useState } from "react";
import Image from "next/image";

import YellowSportsCarFull from "../../../public/images/featured-photo.png";
import ArrowRight from "../../../public/images/arrow-right.svg";
import ArrowLeft from "../../../public/images/arrow-left.svg";
import RedHourGlass from "../../../public/images/red-hour-glass.svg";
import DollarSign from "../../../public/images/dollar.svg";
import AvatarOne from "../../../public/images/avatar-one.svg";
import AvatarTwo from "../../../public/images/avatar-two.svg";
import AvatarFour from "../../../public/images/avatar-four.svg";

const LivePageCarousel = () => {
    const [sliderTransform, setSlidertransform] = useState(0);
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
        <div className="tw-relative section-container tw-max-w-[1440px] tw-overflow-hidden tw-m-auto tw-mt-4 md:tw-mt-6">
            <div className="tw-relative tw-w-full tw-overflow-hidden">
                <div
                    className="tw-transition tw-duration-[2000ms] tw-flex"
                    style={{
                        transform: `translate(${sliderTransform}%)`,
                        width: "500%",
                    }}
                >
                    <SlideOne />
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

const SlideOne = () => {
    return (
        <div className=" tw-bg-gradient-to-br xl:tw-items-end md:tw-justify-center tw-from-[#1a2c3d] tw-from-30% tw-via-[#2b3b6c] tw-via-60% tw-to-[#b91f6c] to-30% tw-w-full tw-rounded-[20px] md:tw-flex md:tw-items-center">
            <div className="xl:tw-py-11 xl:tw-px-14 xl:tw-w-full md:tw-h-full">
                <div className="tw-relative tw-h-full">
                    <span className="tw-absolute tw-text-sm tw-font-bold tw-bg-[#c2451e] tw-py-2 tw-px-[15px] tw-rounded-full tw-top-[12px] tw-left-[12px]">
                        LIVE
                    </span>
                    <Image
                        src={YellowSportsCarFull}
                        alt="dollar"
                        className="tw-object-cover tw-rounded-t-[20px] md:tw-rounded-[20px] md:tw-h-[100%] live-page-image-sizing md xl:tw-rounded xl:tw-w-full"
                    />
                    <div className="tw-absolute tw-bottom-[21px] tw-left-[16px] tw-text-sm tw-font-light tw-flex tw-flex-col tw-gap-[10px]">
                        <div className="tw-flex tw-items-center tw-gap-2">
                            <Image
                                src={AvatarOne}
                                alt="avatar one"
                                width={24}
                                height={24}
                            />
                            <div>@damientine wagered $292,000</div>
                        </div>
                        <div className="tw-flex tw-items-center tw-gap-2">
                            <Image
                                src={AvatarTwo}
                                alt="avatar two"
                                width={24}
                                height={24}
                            />
                            <div>@fizzion: Lorem ipsum dolor sit amet!</div>
                        </div>
                        <div className="tw-flex tw-items-center tw-gap-2">
                            <Image
                                src={AvatarFour}
                                alt="avatar three"
                                width={24}
                                height={24}
                            />
                            <div>@addisonmx wagered $293,500</div>
                        </div>
                    </div>
                </div>
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
                    <div>12:17:00</div>
                </button>
                <div className="tw-font-bold tw-text-xl tw-mb-1">
                    2005 Ford GT Speed Yellow
                </div>
                <div className="tw-opacity-80 tw-text-sm tw-mb-8">
                    This GT is one of just 19 Speed Yellow cars produced for
                    2005 with full Le Mans stripes and gray-painted brake
                    calipers. Race-bre...
                </div>

                <div className="tw-p-6 tw-bg-[#FFFFFF1A] tw-rounded-lg live-page-shadow">
                    <span className="tw-font-bold tw-text-sm tw-text-black tw-bg-[#49c742] tw-py-1 tw-px-[10px] tw-rounded">
                        PRIZE POOL
                    </span>
                    <div className="tw-mt-4 tw-mb-6 tw-font-bold tw-text-5xl">
                        $1,200
                    </div>
                    <button className="tw-font-bold tw-text-black tw-bg-[#f2ca16] tw-py-[10px] tw-w-full tw-rounded tw-mb-3">
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
                            $280,000
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
