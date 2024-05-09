"use client";

import React, { useState } from "react";
import Image from "next/image";

import YellowSportsCarFull from "../../../public/images/yellow-sportscar-full.svg";
import ArrowRight from "../../../public/images/arrow-right.svg";
import ArrowLeft from "../../../public/images/arrow-left.svg";
import DiagonalLinesCarousel from "../../../public/images/diagonal-lines-carousel.svg";
import Link from "next/link";
import BannerAdOne from "@/../public/images/Banner_Ad.jpg";
import BannerAdTwo from "@/../public/images/Banner_Ad2.jpg";
import BannerAdThree from "@/../public/images/Banner_Ad3.jpg";

const Carousel = () => {
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
    const sliderButtonsData = [
        { id: "slide1", transform: 0 },
        { id: "slide2", transform: -20 },
        { id: "slide3", transform: -40 },
        { id: "slide4", transform: -60 },
        { id: "slide5", transform: -80 },
    ];
    return (
        <div className="tw-relative tw-pt-8 tw-h-[344px] tw-overflow-hidden">
            <div className="carousel-container tw-relative tw-w-full tw-h-[280px] tw-overflow-hidden">
                <div
                    className="slider-container tw-transition tw-duration-[2000ms] tw-flex tw-h-[280px]"
                    style={{
                        transform: `translate(${sliderTransform}%)`,
                        width: "500%",
                    }}
                >
                    <SlideOne />
                    <div className="tw-basis-full tw-flex tw-justify-center tw-items-center">
                        <Image src={BannerAdOne} alt="banner ad" className="" />
                    </div>
                    <div className="tw-basis-full tw-flex tw-justify-center tw-items-center">
                        <Image src={BannerAdTwo} alt="banner ad" className="" />
                    </div>
                    <div className="tw-basis-full tw-flex tw-justify-center tw-items-center">
                        <Image
                            src={BannerAdThree}
                            alt="banner ad"
                            className=""
                        />
                    </div>
                    <div className="tw-basis-full tw-flex tw-justify-center tw-items-center">
                        Section 5
                    </div>
                </div>
                <div className="controller-container">
                    <button onClick={leftArrowHandler}>
                        <Image
                            src={ArrowLeft}
                            alt="arrow left"
                            width={40}
                            height={40}
                            className="tw-absolute tw-top-[115px] arrow-slider tw-rounded-full"
                        />
                    </button>
                    <button onClick={rightArrowHandler}>
                        <Image
                            src={ArrowRight}
                            alt="arrow left"
                            width={40}
                            height={40}
                            className="tw-absolute tw-top-[115px] tw-right-0 arrow-slider tw-rounded-full"
                        />
                    </button>
                    <ul className="tw-w-[72px] tw-flex tw-justify-between tw-items-end tw-absolute tw-bottom-[6px] sm:tw-bottom-[16px] tw-left-1/2 tw-translate-x-[-50%]">
                        {sliderButtonsData.map((slide) => {
                            return (
                                <li key={slide.id}>
                                    <button
                                        onClick={() =>
                                            setSlidertransform(slide.transform)
                                        }
                                    >
                                        <div
                                            className="tw-w-[7px] tw-h-[7px] tw-bg-white tw-rounded-full"
                                            style={{
                                                opacity: `${
                                                    sliderTransform ===
                                                    slide.transform
                                                        ? "100%"
                                                        : "20%"
                                                }`,
                                            }}
                                        ></div>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Carousel;

const SlideOne = () => {
    return (
        <div className="tw-relative tw-bg-[#1A2C3D] tw-flex tw-justify-between tw-h-[280px] tw-w-full sm:tw-items-center tw-overflow-hidden">
            <div className="tw-w-full tw-mt-12 lg:tw-mt-0 tw-py-4 lg:tw-py-8 tw-px-6 sm:tw-px-8 tw-z-[1]">
                <div className="tw-text-xs tw-text-[#F2CA16] tw-pb-2">
                    NEW PLAYERS
                </div>
                <div className="tw-font-euro tw-text-[32px] tw-w-[280px] md:tw-w-4/6 md:tw-text-[40px] tw-leading-none">
                    100 WELCOME <br />
                    CREDITS
                </div>
                <Link href={"/create_account"}>
                    <button className="btn-yellow tw-mt-4 sm:tw-mt-6 hover:tw-scale-110 tw-transform tw-transition-all tw-duration-100">
                        SIGN UP & WAGER
                    </button>
                </Link>
            </div>
            <Image
                src={YellowSportsCarFull}
                width={569}
                height={213}
                alt="dollar"
                className="tw-w-auto tw-h-[93px] sm:tw-h-[150px] lg:tw-h-[213px] tw-top-6 sm:tw-top-10 sm:tw-right-[-40px] tw-absolute sm:tw-block tw-right-[-32px] sm:tw-right-0 tw-z-[1]"
            />
            <Image
                src={DiagonalLinesCarousel}
                width={733}
                height={664}
                alt="dollar"
                className="tw-w-auto tw-h-[300px] tw-absolute tw-top-0 tw-right-0 sm:tw-right-4 md:tw-right-8 lg:tw-right-36"
            />
        </div>
    );
};
