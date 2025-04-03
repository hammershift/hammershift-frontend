"use client";

import React from "react";
import Image from "next/image";

import TransitionPattern from "../../../public/images/transition-pattern.svg";
import Link from "next/link";

const SkillStrategyAndStakes = () => {
  return (
    <div className="w-screen 2xl:w-[1440px] mt-[-1px] flex justify-center">
      <Image
        src={TransitionPattern}
        width={288}
        height={356}
        alt="pattern"
        className="absolute z-[-1] w-full h-auto object-cover"
      />
      <div className=" px-4 md:px-16 w-screen 2xl:w-[1440px] pt-8 pb-16">
        <header>
          <h1 className="pt-16 w-auto text-5xl md:text-7xl leading-normal font-bold">
            Skill, Strategy <br />& Stakes
          </h1>
        </header>

        <section>
          <p className="max-w-[752px] my-12">
            The excitement of sports betting meets the thrill of car auctions.
            Car enthusiasts, put your skills to the test by predicting the
            outcomes of car auctions with unmatched precision. Combine
            knowledge, strategy, and a keen eye for value as the gavel drops and
            the bidding wars ignite. Join the action by placing wagers on the
            final price the vehicles will go for, which vehicles will command
            the highest bids, achieve record-breaking prices, or even which ones
            will surprise the crowd with unexpected deals. Sharpen your
            instincts, analyze market trends, and immerse yourself in the world
            of rare classics, luxury exotics, and iconic muscle cars.
          </p>
          <Link href="/create_account">
            <button className="btn-yellow w-full sm:w-auto hover:scale-110 transform transition-all duration-100">
              Join and get 100 credits
            </button>
          </Link>
        </section>
      </div>
    </div>
  );
};

export default SkillStrategyAndStakes;
