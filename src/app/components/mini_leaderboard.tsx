"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useSession } from "@/lib/auth-client";
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
    <div className="sm:w-full md:mx-6 md:my-24 md:w-full lg:w-1/3">
      <div className="relative min-h-[180px] pb-8 sm:pb-0">
        <div className="h-auto w-full p-6">
          <div className="mb-6">
            <div className="flex justify-between">
              <div className="text-[18px] font-bold">AUCTIONS LEADERBOARD</div>
              <Image
                src={ArrowDown}
                width={20}
                height={20}
                alt="arrow down"
                className="h-5 w-5 hover:cursor-pointer"
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
                    className="flex items-center justify-between py-2"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-lg opacity-30">{index + 1}</div>
                      <Image
                        src={item.image ? item.image : AvatarOne}
                        width={44}
                        height={44}
                        alt="dollar"
                        className="h-[44px] w-[44px] rounded-full"
                      />
                      <div className="text-sm">
                        <div className="font-bold">
                          {session?.user.id === item._id
                            ? "You"
                            : item.username}
                        </div>
                      </div>
                    </div>
                    <div className="h-auto w-auto rounded-md bg-yellow-400 px-6 py-1 text-sm font-bold text-black">
                      {item.totalPoints ? `${item.totalPoints} pts.` : "0 pts."}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
        {/* Background and button */}
        <div className="absolute bottom-0 top-0 z-[-1] w-full">
          <Image
            src={TransitionPattern}
            width={288}
            height={356}
            alt="pattern"
            className="mr-1 h-auto w-full rounded-lg object-cover"
          />
          <div className="absolute top-0 h-full w-full rounded-lg bg-[#41a0ff62]"></div>
        </div>
      </div>
    </div>
  );
};

export default MiniLeaderboard;
