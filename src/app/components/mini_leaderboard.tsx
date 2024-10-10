"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import ArrowDown from "../../../public/images/arrow-down.svg";
import AvatarOne from "../../../public/images/avatar-one.svg";
import TransitionPattern from "../../../public/images/transition-pattern.svg";
import { getAuctionPoints } from "@/lib/data";
import { useRouter } from "next/navigation";

const MiniLeaderboard = () => {
  const [auctionPoints, setAuctionPoints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const auctionPoints = await getAuctionPoints(5);
      setAuctionPoints(auctionPoints);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="sm:tw-w-full md:tw-w-full md:tw-my-24 md:tw-mx-6 lg:tw-w-1/3">
      <div className="tw-relative tw-pb-8 sm:tw-pb-0 tw-min-h-[180px]">
        <div className="tw-p-6 tw-w-full tw-h-auto">
          <div className="tw-mb-6">
            <div className="tw-flex tw-justify-between">
              <div className="tw-font-bold tw-text-[18px]">
                AUCTIONS LEADERBOARD
              </div>
              <Image
                src={ArrowDown}
                width={20}
                height={20}
                alt="arrow down"
                className="tw-w-5 tw-h-5 hover:tw-cursor-pointer"
                onClick={() => router.push("/leaderboards")}
              />
            </div>
          </div>
          <div>
            {auctionPoints &&
              auctionPoints.map((item: any, index: number) => {
                return (
                  <div
                    key={item._id}
                    className="tw-flex tw-justify-between tw-items-center tw-py-2"
                  >
                    <div className="tw-flex tw-justify-between tw-items-center tw-gap-4">
                      <div className="tw-text-lg tw-opacity-30">
                        {index + 1}
                      </div>
                      <Image
                        src={item.image ? item.image : AvatarOne}
                        width={44}
                        height={44}
                        alt="dollar"
                        className="tw-w-[44px] tw-h-[44px] tw-rounded-full"
                      />
                      <div className="tw-text-sm">
                        <div className="tw-font-bold">
                          {session?.user._id === item._id
                            ? "You"
                            : item.username}
                        </div>
                      </div>
                    </div>
                    <div className="tw-w-auto tw-px-6 tw-py-1 tw-text-sm tw-font-bold tw-text-black tw-h-auto tw-bg-yellow-400 tw-rounded-md">
                      {item.totalPoints ? `${item.totalPoints} pts.` : "0 pts."}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
        {/* Background and button */}
        <div className="tw-absolute tw-top-0 tw-bottom-0 tw-z-[-1] tw-w-full">
          <Image
            src={TransitionPattern}
            width={288}
            height={356}
            alt="pattern"
            className="tw-w-full tw-h-auto tw-rounded-lg tw-mr-1 tw-object-cover"
          />
          <div className="tw-w-full tw-h-full tw-rounded-lg tw-absolute tw-top-0 tw-bg-[#41a0ff62]"></div>
        </div>
      </div>
    </div>
  );
};

export default MiniLeaderboard;
