"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import AvatarOne from "../../../../public/images/avatar-one.svg";
import { getAuctionPoints } from "@/lib/data";

export default function LeaderBoardPage() {
  const [auctionPoints, setAuctionPoints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const auctionPoints = await getAuctionPoints(20);
      setAuctionPoints(auctionPoints);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const elements: JSX.Element[] = Array(20).fill(
    <div className="py-2">
      <div className="bg-gray-700 animate-pulse p-[22px] rounded"></div>
    </div>
  );

  return (
    <div className="p-4 md:px-16">
      {isLoading ? (
        <div className="bg-gray-800 rounded-lg leaderboard-skeleton py-6 md:flex md:max-w-[1440px] mx-auto">
          <div className="leaderboard-title-skeleton px-6 pb-6 md:px-6 md:pb-0">
            <div className="bg-gray-700 animate-pulse p-4 rounded md:ml-2 md:p-[20px] md:h-full"></div>
          </div>
          <div className="leaderboard-list overflow-y-auto px-6 md:w-[380px] md:relative">
            <div className="hidden md:block sticky top-0 bg-gray-700 mb-3 z-50 p-[20px] rounded w-1/2 mx-auto"></div>
            {elements.map((element, index) => (
              <div key={index}>{element}</div>
            ))}
          </div>
        </div>
      ) : (
        <div className="leaderboard bg-[#184c80] py-6 mx-auto rounded-lg md:flex md:max-w-[1440px]">
          <div className="mb-6 md:m-0 leaderboard-title md:flex md:flex-col items-center gap-4">
            <div className="font-bold text-lg mb-1 px-6 md:text-center md:px-0 lg:text-3xl">
              🏆 AUCTIONS LEADERBOARD
            </div>
            <div className="md:h-full md:justify-between lg:justify-around flex flex-col lg:grid gap-6 grid-container lg:gap-8 xl:gap-4 lg:w-full">
              {auctionPoints.slice(0, 3).map((user: any, index: number) => {
                return (
                  <div
                    className={`hidden md:flex lg:flex-col items-center ${index + 1 === 3 && "xl:justify-center"
                      } user${index + 1}`}
                    key={user._id}
                  >
                    <div
                      className={`text-8xl mb-4 ${index + 1 === 1 &&
                        "lg:text-9xl xl:text-[184px] 2xl:text-[222px]"
                        } ${index + 1 === 2 &&
                        "xl:text-[144px]  2xl:text-[184px]"
                        } ${index + 1 === 3 && "xl:text-9xl 2xl:text-[144px]"
                        }`}
                    >
                      {index + 1 === 1 && "🥇"}
                      {index + 1 === 2 && "🥈"}
                      {index + 1 === 3 && "🥉"}
                    </div>
                    <div className="flex flex-col gap-2 items-center">
                      <div className="flex gap-2 items-center">
                        <Image
                          src={user.image ? user.image : AvatarOne}
                          width={44}
                          height={44}
                          alt="arrow down"
                          className="w-[44px] h-[44px] rounded-full"
                        />
                        <div>
                          <div
                            className={`text-sm font-bold line-clamp-1 ${index + 1 === 1 && "lg:text-xl"
                              } ${index + 1 === 2 && "xl:text-xl"} ${index + 1 === 3 && "xl:text-xl"
                              }`}
                          >
                            {user.username}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`bg-[#facc15] text-black text-xs font-extrabold px-2 py-1 rounded-md min-[65px] text-center w-fit`}
                      >
                        {user.totalPoints} pts.
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="leaderboard-list overflow-y-auto px-6 md:w-[380px] md:relative">
            <div className="hidden md:block text-xl font-bold sticky top-0 bg-[#184c80] pb-3 z-10 text-center">
              Total Scores
            </div>
            {...auctionPoints.map((user: any, index: number) => {
              return (
                <div
                  key={user._id}
                  className={`flex justify-between items-center py-2 ${index + 1 < 4 && "md:hidden"
                    }`}
                >
                  <div className={`flex gap-4 items-center`}>
                    {index + 1 > 3 && (
                      <div className="text-lg opacity-30">
                        {index + 1 < 10 ? (
                          <div>
                            <span className="opacity-0">0</span>
                            {index + 1}
                          </div>
                        ) : (
                          index + 1
                        )}
                      </div>
                    )}
                    {index + 1 < 4 && (
                      <div className="text-xl w-[19px]">
                        {index + 1 === 1 && "🥇"}
                        {index + 1 === 2 && "🥈"}
                        {index + 1 === 3 && "🥉"}
                      </div>
                    )}
                    <Image
                      src={user.image ? user.image : AvatarOne}
                      width={44}
                      height={44}
                      alt="arrow down"
                      className="w-[44px] h-[44px] rounded-full"
                    />
                    <div>
                      <div className="text-sm font-bold line-clamp-1">
                        {user.username}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`bg-[#facc15] text-black text-xs font-extrabold px-2 py-1 rounded-md min-[65px] text-center ${index + 1 < 4 && "md:hidden"
                      }`}
                  >
                    {user.totalPoints} pts.
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
