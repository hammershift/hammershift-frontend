"use client";

import React from "react";
import Image from "next/image";

import TransitionPattern from "../../../public/images/transition-pattern.svg";
import Link from "next/link";

const SkillStrategyAndStakes = () => {
    return (
        <div className="tw-w-full 2xl:tw-w-[1440px] tw-mt-[-1px] tw-flex tw-justify-center">
            <Image
                src={TransitionPattern}
                width={288}
                height={356}
                alt="pattern"
                className="tw-absolute tw-z-[-1] tw-w-full tw-h-auto tw-object-cover"
            />
            <div className=" tw-px-4 md:tw-px-16 tw-w-full 2xl:tw-w-[1440px] tw-pt-8 tw-pb-16">
                <header>
                    <h1 className="tw-pt-16 tw-w-auto tw-text-5xl md:tw-text-7xl tw-leading-normal tw-font-bold">
                        Skill, Strategy <br />& Stakes
                    </h1>
                </header>

                <section>
                    <p className="tw-max-w-[752px] tw-my-12">
                        The excitement of sports betting meets the thrill of car
                        auctions. Car enthusiasts, put your skills to the test
                        by predicting the outcomes of car auctions with
                        unmatched precision. Combine knowledge, strategy, and a
                        keen eye for value as the gavel drops and the bidding
                        wars ignite. Join the action by placing wagers on the
                        final price the vehicles will go for, which vehicles
                        will command the highest bids, achieve record-breaking
                        prices, or even which ones will surprise the crowd with
                        unexpected deals. Sharpen your instincts, analyze market
                        trends, and immerse yourself in the world of rare
                        classics, luxury exotics, and iconic muscle cars.
                    </p>
                    <Link
                        href="/create_account"
                        className="btn-yellow tw-w-full sm:tw-w-auto"
                    >
                        Join and get 100 credits
                    </Link>
                </section>
            </div>
        </div>
    );
};

export default SkillStrategyAndStakes;
