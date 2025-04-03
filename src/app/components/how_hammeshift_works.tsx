import React from "react";
import Image from "next/image";
import articleImageOne from "../../../public/images/howhammershiftworks/article-image-one.svg";
import articleImageTwo from "../../../public/images/howhammershiftworks/article-image-two.svg";
import articleImageThree from "../../../public/images/howhammershiftworks/article-image-three.svg";
import articleImageFour from "../../../public/images/howhammershiftworks/article-image-four.svg";
import GavelIcon from "../../../public/images/gavel-icon.svg";
import UserCheckIcon2 from "../../../public/images/user-check-icon.svg";
import ChartIcon from "../../../public/images/chart-icon.svg";
import PeopleIcon from "../../../public/images/people-icon.svg";

// interface ArticleData {
//     id: string;
//     title: string;
//     url: string;
// }

// interface HowHammerShiftWorksProps {
//     articleData: ArticleData[];
// }

const HowHammerShiftWorks = () => {
    return (
        <div
            className="bg-[#DCE0D9] text-[#0F1923] w-full flex justify-center"
            id="how-hammershift-works"
        >
            <div className="section-container py-16 md:py-[120px]">
                <header>
                    <h1 className="text-5xl font-bold">
                        How HammerShift Works
                    </h1>
                </header>

                <section className="mt-8">
                    <div className="flex flex-col md:flex-row">
                        <div className="flex flex-wrap">
                            <div className="flex justify-between w-full min-w-[280px] xl:w-[300px]  pr-0 md:pr-4 py-4 md:py-8">
                                <div>
                                    <div className="text-[#53944F] font-bold">
                                        Registration and Access
                                    </div>
                                    <div>
                                        Quick sign-up process for immediate
                                        access to the auction prediction
                                        platform
                                    </div>
                                </div>
                                <Image
                                    src={UserCheckIcon2}
                                    width={80}
                                    height={80}
                                    alt="car"
                                    className="w-20 h-20 object-cover ml-6"
                                />
                            </div>
                            <hr
                                style={{ borderColor: "black", opacity: "10%" }}
                                className="mx-0 md:mx-4 my-4 md:my-0"
                            />
                            <div className="flex  justify-between w-full min-w-[280px] xl:w-[300px] pr-0 md:pr-4 py-4 md:py-8">
                                <div>
                                    <div className="text-[#53944F] font-bold">
                                        Live Auction Collaboration
                                    </div>
                                    <div>
                                        Partnership with Bring a Trailer (BaT)
                                        for live auction feeds, allowing users
                                        to select and predict auction outcomes.
                                    </div>
                                </div>
                                <Image
                                    src={GavelIcon}
                                    width={80}
                                    height={80}
                                    alt="car"
                                    className="w-20 h-20 object-cover ml-6"
                                />
                            </div>
                        </div>
                        <hr
                            style={{ borderColor: "black", opacity: "10%" }}
                            className="hidden lg:block mx-0 md:mx-4 my-4 md:my-0"
                        />
                        <div className="flex flex-wrap">
                            <div className="flex  justify-between w-full min-w-[280px] xl:w-[300px] pr-0 md:pr-4 py-4 md:py-8 ">
                                <div>
                                    <div className="text-[#53944F] font-bold">
                                        Prediction and Strategy
                                    </div>
                                    <div>
                                        Users make informed predictions on car
                                        auction outcomes, testing their
                                        knowledge against market trends and
                                        historical data.
                                    </div>
                                </div>
                                <Image
                                    src={ChartIcon}
                                    width={80}
                                    height={80}
                                    alt="car"
                                    className="w-20 h-20 object-cover ml-6"
                                />
                            </div>
                            <hr
                                style={{ borderColor: "black", opacity: "10%" }}
                                className="mx-0 md:mx-4 my-4 md:my-0"
                            />
                            <div className="flex  justify-between w-full min-w-[280px] xl:w-[300px] pr-0 md:pr-4 py-4 md:py-8 ">
                                <div>
                                    <div className="text-[#53944F] font-bold">
                                        Community Engagement and Learning
                                    </div>
                                    <div>
                                        HammerShift is a community platform for
                                        learning, with tools for performance
                                        analysis and opportunities for
                                        competition and discussion.
                                    </div>
                                </div>
                                <Image
                                    src={PeopleIcon}
                                    width={80}
                                    height={80}
                                    alt="car"
                                    className="w-20 h-20 object-cover ml-6"
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default HowHammerShiftWorks;

export const LatestNews = () => {
    return (
        <div
            className="bg-[#DCE0D9] text-[#0F1923] w-full flex justify-center"
            id="how-hammershift-works"
        >
            <div className="section-container py-16 md:py-[120px]">
                <header>
                    <h1 className="text-5xl font-bold">
                        How HammerShift Works
                    </h1>
                </header>

                <section className="mt-8">
                    <div className="flex flex-col md:flex-row">
                        <div className="flex flex-wrap">
                            <div className="flex justify-between w-full min-w-[280px] xl:w-[300px]  pr-0 md:pr-4 py-4 md:py-8">
                                <div>
                                    <div className="text-[#53944F] font-bold">
                                        Registration and Access
                                    </div>
                                    <div>
                                        Quick sign-up process for immediate
                                        access to the auction prediction
                                        platform
                                    </div>
                                </div>
                                <Image
                                    src={UserCheckIcon2}
                                    width={80}
                                    height={80}
                                    alt="car"
                                    className="w-20 h-20 object-cover ml-6"
                                />
                            </div>
                            <hr
                                style={{ borderColor: "black", opacity: "10%" }}
                                className="mx-0 md:mx-4 my-4 md:my-0"
                            />
                            <div className="flex  justify-between w-full min-w-[280px] xl:w-[300px] pr-0 md:pr-4 py-4 md:py-8">
                                <div>
                                    <div className="text-[#53944F] font-bold">
                                        Live Auction Collaboration
                                    </div>
                                    <div>
                                        Partnership with Bring a Trailer (BaT)
                                        for live auction feeds, allowing users
                                        to select and predict auction outcomes.
                                    </div>
                                </div>
                                <Image
                                    src={GavelIcon}
                                    width={80}
                                    height={80}
                                    alt="car"
                                    className="w-20 h-20 object-cover ml-6"
                                />
                            </div>
                        </div>
                        <hr
                            style={{ borderColor: "black", opacity: "10%" }}
                            className="hidden lg:block mx-0 md:mx-4 my-4 md:my-0"
                        />
                        <div className="flex flex-wrap">
                            <div className="flex  justify-between w-full min-w-[280px] xl:w-[300px] pr-0 md:pr-4 py-4 md:py-8 ">
                                <div>
                                    <div className="text-[#53944F] font-bold">
                                        Prediction and Strategy
                                    </div>
                                    <div>
                                        Users make informed predictions on car
                                        auction outcomes, testing their
                                        knowledge against market trends and
                                        historical data.
                                    </div>
                                </div>
                                <Image
                                    src={ChartIcon}
                                    width={80}
                                    height={80}
                                    alt="car"
                                    className="w-20 h-20 object-cover ml-6"
                                />
                            </div>
                            <hr
                                style={{ borderColor: "black", opacity: "10%" }}
                                className="mx-0 md:mx-4 my-4 md:my-0"
                            />
                            <div className="flex  justify-between w-full min-w-[280px] xl:w-[300px] pr-0 md:pr-4 py-4 md:py-8 ">
                                <div>
                                    <div className="text-[#53944F] font-bold">
                                        Community Engagement and Learning
                                    </div>
                                    <div>
                                        HammerShift is a community platform for
                                        learning, with tools for performance
                                        analysis and opportunities for
                                        competition and discussion.
                                    </div>
                                </div>
                                <Image
                                    src={PeopleIcon}
                                    width={80}
                                    height={80}
                                    alt="car"
                                    className="w-20 h-20 object-cover ml-6"
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};
