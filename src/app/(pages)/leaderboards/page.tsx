"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import AvatarOne from "../../../../public/images/avatar-one.svg";
import { getAuctionPoints } from "@/lib/data";

export default function LeaderBoardPage() {
    const array = [
        { id: 1, username: "SunnyTiger42", totalPoints: 987 },
        { id: 2, username: "LuckyHawk76", totalPoints: 876 },
        { id: 3, username: "BraveBear18", totalPoints: 765 },
        { id: 4, username: "HappyCat65", totalPoints: 654 },
        { id: 5, username: "KindFox91", totalPoints: 543 },
        { id: 6, username: "GentleElephant", totalPoints: 432 },
        { id: 7, username: "CleverWolf22", totalPoints: 321 },
        { id: 8, username: "WiseDog88", totalPoints: 210 },
        { id: 9, username: "CreativeRabbit77", totalPoints: 189 },
        { id: 10, username: "EagerLion55", totalPoints: 123 },
        { id: 11, username: "SunnyTiger82", totalPoints: 87 },
        { id: 12, username: "LuckyHawk99", totalPoints: 76 },
        { id: 13, username: "BraveBear64", totalPoints: 65 },
        { id: 14, username: "HappyCat37", totalPoints: 54 },
        { id: 15, username: "KindFox80", totalPoints: 43 },
        { id: 16, username: "GentleElephant28", totalPoints: 32 },
        { id: 17, username: "CleverWolf51", totalPoints: 21 },
        { id: 18, username: "WiseDog60", totalPoints: 18 },
        { id: 19, username: "CreativeRabbit11", totalPoints: 12 },
        { id: 20, username: "EagerLion19", totalPoints: 5 },
    ];

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
        <div className="tw-py-2">
            <div className="tw-bg-gray-700 tw-animate-pulse tw-p-[22px] tw-rounded"></div>
        </div>
    );

    return (
        <div className="tw-p-4 md:tw-px-16">
            {isLoading ? (
                <div className="tw-bg-gray-800 tw-rounded-lg leaderboard-skeleton tw-py-6 md:tw-flex md:tw-max-w-[1440px] tw-mx-auto">
                    <div className="leaderboard-title-skeleton tw-px-6 tw-pb-6 md:tw-px-6 md:tw-pb-0">
                        <div className="tw-bg-gray-700 tw-animate-pulse tw-p-4 tw-rounded md:tw-ml-2 md:tw-p-[20px] md:tw-h-full"></div>
                    </div>
                    <div className="leaderboard-list tw-overflow-y-auto tw-px-6 md:tw-w-[380px] md:tw-relative">
                        <div className="tw-hidden md:tw-block tw-sticky tw-top-0 tw-bg-gray-700 tw-mb-3 tw-z-50 tw-p-[20px] tw-rounded tw-w-1/2 tw-mx-auto"></div>
                        {elements.map((element, index) => (
                            <div key={index}>{element}</div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="leaderboard tw-bg-[#184c80] tw-py-6 tw-mx-auto tw-rounded-lg md:tw-flex md:tw-max-w-[1440px]">
                    <div className="tw-mb-6 md:tw-m-0 leaderboard-title md:tw-flex md:tw-flex-col tw-items-center tw-gap-4">
                        <div className="tw-font-bold tw-text-lg tw-mb-1 tw-px-6 md:tw-text-center md:tw-px-0 lg:tw-text-3xl">
                            🏆 AUCTIONS LEADERBOARD
                        </div>
                        <div className="md:tw-h-full md:tw-justify-between lg:tw-justify-around tw-flex tw-flex-col lg:tw-grid tw-gap-6 grid-container lg:tw-gap-8 xl:tw-gap-4 lg:tw-w-full">
                            {auctionPoints
                                .slice(0, 3)
                                .map((user: any, index: number) => {
                                    return (
                                        <div
                                            className={`tw-hidden md:tw-flex lg:tw-flex-col tw-items-center ${
                                                index + 1 === 3 &&
                                                "xl:tw-justify-center"
                                            } user${index + 1}`}
                                            key={user._id}
                                        >
                                            <div
                                                className={`tw-text-8xl tw-mb-4 ${
                                                    index + 1 === 1 &&
                                                    "lg:tw-text-9xl xl:tw-text-[184px] 2xl:tw-text-[222px]"
                                                } ${
                                                    index + 1 === 2 &&
                                                    "xl:tw-text-[144px]  2xl:tw-text-[184px]"
                                                } ${
                                                    index + 1 === 3 &&
                                                    "xl:tw-text-9xl 2xl:tw-text-[144px]"
                                                }`}
                                            >
                                                {index + 1 === 1 && "🥇"}
                                                {index + 1 === 2 && "🥈"}
                                                {index + 1 === 3 && "🥉"}
                                            </div>
                                            <div className="tw-flex tw-flex-col tw-gap-2 tw-items-center">
                                                <div className="tw-flex tw-gap-2 tw-items-center">
                                                    <Image
                                                        src={
                                                            user.image
                                                                ? user.image
                                                                : AvatarOne
                                                        }
                                                        width={44}
                                                        height={44}
                                                        alt="arrow down"
                                                        className="tw-w-[44px] tw-h-[44px] tw-rounded-full"
                                                    />
                                                    <div>
                                                        <div
                                                            className={`tw-text-sm tw-font-bold tw-line-clamp-1 ${
                                                                index + 1 ===
                                                                    1 &&
                                                                "lg:tw-text-xl"
                                                            } ${
                                                                index + 1 ===
                                                                    2 &&
                                                                "xl:tw-text-xl"
                                                            } ${
                                                                index + 1 ===
                                                                    3 &&
                                                                "xl:tw-text-xl"
                                                            }`}
                                                        >
                                                            {user.username}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div
                                                    className={`tw-bg-[#facc15] tw-text-black tw-text-xs tw-font-extrabold tw-px-2 tw-py-1 tw-rounded-md tw-min-[65px] tw-text-center tw-w-fit`}
                                                >
                                                    {user.totalPoints} pts.
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                    <div className="leaderboard-list tw-overflow-y-auto tw-px-6 md:tw-w-[380px] md:tw-relative">
                        <div className="tw-hidden md:tw-block tw-text-xl tw-font-bold tw-sticky tw-top-0 tw-bg-[#184c80] tw-pb-3 tw-z-10 tw-text-center">
                            Total Scores
                        </div>
                        {[...auctionPoints, ...array.slice(0, 13)].map(
                            (user: any, index: number) => {
                                return (
                                    <div
                                        key={user._id}
                                        className={`tw-flex tw-justify-between tw-items-center tw-py-2 ${
                                            index + 1 < 4 && "md:tw-hidden"
                                        }`}
                                    >
                                        <div
                                            className={`tw-flex tw-gap-4 tw-items-center`}
                                        >
                                            {index + 1 > 3 && (
                                                <div className="tw-text-lg tw-opacity-30">
                                                    {index + 1 < 10 ? (
                                                        <div>
                                                            <span className="tw-opacity-0">
                                                                0
                                                            </span>
                                                            {index + 1}
                                                        </div>
                                                    ) : (
                                                        index + 1
                                                    )}
                                                </div>
                                            )}
                                            {index + 1 < 4 && (
                                                <div className="tw-text-xl tw-w-[19px]">
                                                    {index + 1 === 1 && "🥇"}
                                                    {index + 1 === 2 && "🥈"}
                                                    {index + 1 === 3 && "🥉"}
                                                </div>
                                            )}
                                            <Image
                                                src={
                                                    user.image
                                                        ? user.image
                                                        : AvatarOne
                                                }
                                                width={44}
                                                height={44}
                                                alt="arrow down"
                                                className="tw-w-[44px] tw-h-[44px] tw-rounded-full"
                                            />
                                            <div>
                                                <div className="tw-text-sm tw-font-bold tw-line-clamp-1">
                                                    {user.username}
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            className={`tw-bg-[#facc15] tw-text-black tw-text-xs tw-font-extrabold tw-px-2 tw-py-1 tw-rounded-md tw-min-[65px] tw-text-center ${
                                                index + 1 < 4 && "md:tw-hidden"
                                            }`}
                                        >
                                            {user.totalPoints} pts.
                                        </div>
                                    </div>
                                );
                            }
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
