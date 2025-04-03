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
    <div className="py-8 sm:py-16">
      <header className="flex justify-between">
        <div className="flex items-center">
          <Image
            src={TeamBattlesIcon}
            width={40}
            height={40}
            alt="dollar"
            className="w-10 h-10"
          />
          <div className="font-bold text-2xl sm:text-3xl ml-4">
            Team Battles (Coming Soon)
          </div>
        </div>
        <div className="flex">
          <Image
            src={ArrowLeft}
            width={32}
            height={32}
            alt="arrow left"
            className="w-8 h-8 "
          />
          <Image
            src={ArrowRight}
            width={32}
            height={32}
            alt="arrow right"
            className="w-8 h-8 ml-4"
          />
        </div>
      </header>
      <section className="left-container grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 mt-8 sm:mt-16">
        <div
          style={{
            backgroundImage: `url(https://images4.alphacoders.com/110/1103803.jpg)`,
          }}
          className="h-[388px] w-auto bg-cover rounded-lg p-4 flex flex-col justify-end"
        >
          <div className="text-2xl font-medium">
            1954 Siata 300BC Convertible by Motto
          </div>
          <div className="flex items-center">
            <Image
              src={HourGlassIcon}
              width={12}
              height={14}
              alt="hour glass"
              className="w-[12px] h-[14px] mr-1 "
            />
            <div>12:17:00</div>
          </div>
        </div>
        <div className="right-container grid grid-cols-1 sm:grid-cols-2 gap-16 xl:gap-16 w-auto h-auto">
          {/* Team A */}
          <div className="relative">
            <div className="px-5 w-full h-[356px]">
              <Image
                src={TrophyIconGreen}
                width={52}
                height={52}
                alt="dollar"
                className="w-[52px] h-[52px] "
              />
              <div className="font-bold text-[18px]">Team A</div>
              <div className="text-[14px]">11 Players</div>
              <div className="relative mt-4">
                {teamPlayers.map((player) => {
                  return (
                    <div key={player.id} className="mb-4 flex">
                      <Image
                        src={player.avatar}
                        width={40}
                        height={40}
                        alt="dollar"
                        className="w-[40px] h-[40px] mr-4"
                      />
                      <div className="text-sm ">
                        <div className="font-bold">{player.amount}</div>
                        <div>{player.username}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Background and button*/}
            <div className="absolute top-[26px] h-[362px] z-[-1]">
              <Image
                src={TransitionPattern}
                width={288}
                height={356}
                alt="pattern"
                className="w-auto h-[288px]  rounded-lg mr-1 object-cover"
              />
              <div className="w-full h-full rounded-lg absolute top-0 bg-[#49C74233]"></div>
              <button
                className="btn-green absolute bottom-[-20px] right-[16px]"
                disabled
              >
                Wager on Team B
              </button>
            </div>
          </div>

          {/* Team B */}
          <div className="relative pb-8 sm:pb-0">
            <div className="px-5 w-full h-[356px]">
              <Image
                src={TrophyIconBlue}
                width={52}
                height={52}
                alt="dollar"
                className="w-[52px] h-[52px] "
              />
              <div className="font-bold text-[18px]">Team B</div>
              <div className="text-[14px]">10 Players</div>
              <div className="relative mt-4">
                {teamPlayers.map((player) => {
                  return (
                    <div key={player.id} className="mb-4 flex">
                      <Image
                        src={player.avatar}
                        width={40}
                        height={40}
                        alt="dollar"
                        className="w-[40px] h-[40px] mr-4"
                      />
                      <div className="text-sm ">
                        <div className="font-bold">{player.amount}</div>
                        <div>{player.username}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Background and button*/}
            <div className="absolute top-[26px] h-[362px] z-[-1]">
              <Image
                src={TransitionPattern}
                width={288}
                height={356}
                alt="pattern"
                className="w-auto h-[288px]  rounded-lg mr-1 object-cover"
              />
              <div className="w-full h-full rounded-lg absolute top-0 bg-[#156CC333]"></div>
              <button
                className="btn-blue absolute bottom-[-20px] right-[16px]"
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
