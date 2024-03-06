"use client";

import React from "react";
import Image from "next/image";

import TeamBattlesIcon from "../../../public/images/team-battles-icon.svg";
import AvatarOne from "../../../public/images/avatar-one.svg";
import AvatarTwo from "../../../public/images/avatar-two.svg";
import AvatarThree from "../../../public/images/avatar-three.svg";
import AvatarFour from "../../../public/images/avatar-four.svg";
import ArrowRight from "../../../public/images/arrow-right.svg";
import ArrowLeft from "../../../public/images/arrow-left.svg";
import HourGlassIcon from "../../../public/images/hour-glass.svg";
import TrophyIconGreen from "../../../public/images/trophy-icon-green.svg";
import TrophyIconBlue from "../../../public/images/trophy-icon-blue.svg";
import TransitionPattern from "../../../public/images/transition-pattern.svg";

const TeamBattles = () => {
  const teamPlayers = [
    {
      id: "t1",
      username: "Username",
      avatar: AvatarOne,
      amount: "$168,00",
    },
    {
      id: "t2",
      username: "Username",
      avatar: AvatarTwo,
      amount: "$157,00",
    },
    {
      id: "t3",
      username: "Username",
      avatar: AvatarThree,
      amount: "$152,00",
    },
    {
      id: "t4",
      username: "Username",
      avatar: AvatarFour,
      amount: "$132,00",
    },
  ];
  return (
    <div className="tw-py-8 sm:tw-py-16">
      <header className="tw-flex tw-justify-between">
        <div className="tw-flex tw-items-center">
          <Image
            src={TeamBattlesIcon}
            width={40}
            height={40}
            alt="dollar"
            className="tw-w-10 tw-h-10"
          />
          <div className="tw-font-bold tw-text-2xl sm:tw-text-3xl tw-ml-4">
            Team Battles (Coming Soon)
          </div>
        </div>
        <div className="tw-flex">
          <Image
            src={ArrowLeft}
            width={32}
            height={32}
            alt="arrow left"
            className="tw-w-8 tw-h-8 "
          />
          <Image
            src={ArrowRight}
            width={32}
            height={32}
            alt="arrow right"
            className="tw-w-8 tw-h-8 tw-ml-4"
          />
        </div>
      </header>
      <section className="left-container tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-8 md:tw-gap-16 tw-mt-8 sm:tw-mt-16">
        <div
          style={{
            backgroundImage: `url(https://images4.alphacoders.com/110/1103803.jpg)`,
          }}
          className="tw-h-[388px] tw-w-auto tw-bg-cover tw-rounded-lg tw-p-4 tw-flex tw-flex-col tw-justify-end"
        >
          <div className="tw-text-2xl tw-font-medium">
            1954 Siata 300BC Convertible by Motto
          </div>
          <div className="tw-flex tw-items-center">
            <Image
              src={HourGlassIcon}
              width={12}
              height={14}
              alt="hour glass"
              className="tw-w-[12px] tw-h-[14px] tw-mr-1 "
            />
            <div>12:17:00</div>
          </div>
        </div>
        <div className="right-container tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 tw-gap-16 xl:tw-gap-16 tw-w-auto tw-h-auto">
          {/* Team A */}
          <div className="tw-relative">
            <div className="tw-px-5 tw-w-full tw-h-[356px]">
              <Image
                src={TrophyIconGreen}
                width={52}
                height={52}
                alt="dollar"
                className="tw-w-[52px] tw-h-[52px] "
              />
              <div className="tw-font-bold tw-text-[18px]">Team A</div>
              <div className="tw-text-[14px]">11 Players</div>
              <div className="tw-relative tw-mt-4">
                {teamPlayers.map((player) => {
                  return (
                    <div key={player.id} className="tw-mb-4 tw-flex">
                      <Image
                        src={player.avatar}
                        width={40}
                        height={40}
                        alt="dollar"
                        className="tw-w-[40px] tw-h-[40px] tw-mr-4"
                      />
                      <div className="tw-text-sm ">
                        <div className="tw-font-bold">{player.amount}</div>
                        <div>{player.username}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Background and button*/}
            <div className="tw-absolute tw-top-[26px] tw-h-[362px] tw-z-[-1]">
              <Image
                src={TransitionPattern}
                width={288}
                height={356}
                alt="pattern"
                className="tw-w-auto tw-h-[288px]  tw-rounded-lg tw-mr-1 tw-object-cover"
              />
              <div className="tw-w-full tw-h-full tw-rounded-lg tw-absolute tw-top-0 tw-bg-[#49C74233]"></div>
              <button
                className="btn-green tw-absolute tw-bottom-[-20px] tw-right-[16px]"
                disabled
              >
                Wager on Team B
              </button>
            </div>
          </div>

          {/* Team B */}
          <div className="tw-relative tw-pb-8 sm:tw-pb-0">
            <div className="tw-px-5 tw-w-full tw-h-[356px]">
              <Image
                src={TrophyIconBlue}
                width={52}
                height={52}
                alt="dollar"
                className="tw-w-[52px] tw-h-[52px] "
              />
              <div className="tw-font-bold tw-text-[18px]">Team B</div>
              <div className="tw-text-[14px]">10 Players</div>
              <div className="tw-relative tw-mt-4">
                {teamPlayers.map((player) => {
                  return (
                    <div key={player.id} className="tw-mb-4 tw-flex">
                      <Image
                        src={player.avatar}
                        width={40}
                        height={40}
                        alt="dollar"
                        className="tw-w-[40px] tw-h-[40px] tw-mr-4"
                      />
                      <div className="tw-text-sm ">
                        <div className="tw-font-bold">{player.amount}</div>
                        <div>{player.username}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Background and button*/}
            <div className="tw-absolute tw-top-[26px] tw-h-[362px] tw-z-[-1]">
              <Image
                src={TransitionPattern}
                width={288}
                height={356}
                alt="pattern"
                className="tw-w-auto tw-h-[288px]  tw-rounded-lg tw-mr-1 tw-object-cover"
              />
              <div className="tw-w-full tw-h-full tw-rounded-lg tw-absolute tw-top-0 tw-bg-[#156CC333]"></div>
              <button
                className="btn-blue tw-absolute tw-bottom-[-20px] tw-right-[16px]"
                disabled
              >
                Wager on Team B
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TeamBattles;
