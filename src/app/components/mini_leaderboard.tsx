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
    <div className="sm:w-full md:w-full md:my-24 md:mx-6 lg:w-1/3">
      <div className="relative pb-8 sm:pb-0 min-h-[180px]">
        <div className="p-6 w-full h-auto">
          <div className="mb-6">
            <div className="flex justify-between">
              <div className="font-bold text-[18px]">
                AUCTIONS LEADERBOARD
              </div>
              <Image
                src={ArrowDown}
                width={20}
                height={20}
                alt="arrow down"
                className="w-5 h-5 hover:cursor-pointer"
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
                    className="flex justify-between items-center py-2"
                  >
                    <div className="flex justify-between items-center gap-4">
                      <div className="text-lg opacity-30">
                        {index + 1}
                      </div>
                      <Image
                        src={item.image ? item.image : AvatarOne}
                        width={44}
                        height={44}
                        alt="dollar"
                        className="w-[44px] h-[44px] rounded-full"
                      />
                      <div className="text-sm">
                        <div className="font-bold">
                          {session?.user._id === item._id
                            ? "You"
                            : item.username}
                        </div>
                      </div>
                    </div>
                    <div className="w-auto px-6 py-1 text-sm font-bold text-black h-auto bg-yellow-400 rounded-md">
                      {item.totalPoints ? `${item.totalPoints} pts.` : "0 pts."}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
        {/* Background and button */}
        <div className="absolute top-0 bottom-0 z-[-1] w-full">
          <Image
            src={TransitionPattern}
            width={288}
            height={356}
            alt="pattern"
            className="w-full h-auto rounded-lg mr-1 object-cover"
          />
          <div className="w-full h-full rounded-lg absolute top-0 bg-[#41a0ff62]"></div>
        </div>
      </div>
    </div>
  );
};

export default MiniLeaderboard;
