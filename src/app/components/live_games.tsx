import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
    getCarsWithFilter,
    getCarsWithMostPot,
    sortByNewGames,
} from "@/lib/data";
import { TimerProvider } from "../_context/TimerContext";
import LiveGamesIcon from "../../../public/images/currency-dollar-circle.svg";
import ArrowRight from "../../../public/images/arrow-right.svg";
import ArrowLeft from "../../../public/images/arrow-left.svg";

import { MoonLoader } from "react-spinners";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const LiveGames = () => {
    const [liveGames, setLiveGames] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const pathname = usePathname();

    const DynamicLiveGamesCard = dynamic(
        () => import("@/app/components/live_games_card"),
        {
            ssr: false,
            loading: () => (
                <div className="tw-flex tw-w-auto tw-mt-8 tw-justify-center tw-items-center max-sm:tw-flex-col">
                    <div className="tw-flex tw-flex-col tw-w-full max-sm:tw-flex-row tw-justify-evenly tw-items-center">
                        <div className="tw-w-48 tw-mb-5 tw-h-48 tw-rounded-full tw-bg-gray-700 max-md:tw-w-36 max-md:tw-h-36"></div>
                        <div className="tw-flex tw-flex-col tw-w-2/3 max-md:tw-w-1/2">
                            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
                            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
                            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
                            <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
                        </div>
                    </div>
                </div>
            ),
        }
    );

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (pathname === "/live") {
                    const liveGamesData = await getCarsWithMostPot(10);
                    setIsLoading(true);

                    if (liveGamesData && "cars" in liveGamesData) {
                        setLiveGames(liveGamesData.cars);
                        setIsLoading(false);
                        return;
                    } else {
                        console.error(
                            "Unexpected data structure:",
                            liveGamesData
                        );
                        return;
                    }
                }

                if (pathname === "/" || pathname === "/discover") {
                    const liveGamesData = await getCarsWithFilter({ limit: 5 });
                    setIsLoading(true);

                    if (liveGamesData && "cars" in liveGamesData) {
                        setLiveGames(liveGamesData.cars);
                        setIsLoading(false);
                    } else {
                        console.error(
                            "Unexpected data structure:",
                            liveGamesData
                        );
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="tw-py-8 sm:tw-py-16">
            <header className="tw-flex tw-justify-between">
                <div className="tw-flex tw-items-center">
                    {pathname === "/live" ? null : (
                        <Image
                            src={LiveGamesIcon}
                            width={40}
                            height={40}
                            alt="dollar"
                            className={`tw-w-10 tw-h-10`}
                        />
                    )}
                    {pathname === "/live" ? (
                        <div className="tw-font-bold tw-text-xl sm:tw-text-5xl tw-ml-4">
                            Live Games
                        </div>
                    ) : (
                        <div className="tw-font-bold tw-text-xl sm:tw-text-3xl tw-ml-4">
                            {pathname === "/" && "More "}Live Games
                        </div>
                    )}
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
            {isLoading ? (
                <div className="tw-p-4 sm:tw-py-16">
                    <div className="tw-flex tw-flex-col">
                        <div className="tw-flex tw-w-full tw-mt-8 tw-justify-center tw-items-center max-sm:tw-flex-col">
                            <div className="tw-flex tw-flex-col tw-w-full max-sm:tw-flex-row tw-justify-evenly tw-items-center">
                                <div className="tw-w-48 tw-mb-5 tw-h-48 tw-rounded-full tw-bg-gray-700 max-md:tw-w-36 max-md:tw-h-36"></div>
                                <div className="tw-flex tw-flex-col tw-w-2/3 max-md:tw-w-1/2">
                                    <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
                                    <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
                                    <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
                                    <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
                                </div>
                            </div>
                            <div className="tw-flex tw-flex-col tw-w-full max-sm:tw-flex-row tw-justify-evenly tw-items-center">
                                <div className="tw-w-48 tw-mb-5 tw-h-48 tw-rounded-full tw-bg-gray-700 max-md:tw-w-36 max-md:tw-h-36"></div>
                                <div className="tw-flex tw-flex-col tw-w-2/3 max-md:tw-w-1/2">
                                    <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
                                    <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
                                    <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
                                    <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
                                </div>
                            </div>
                            <div className="tw-flex tw-flex-col tw-w-full max-sm:tw-flex-row tw-justify-evenly tw-items-center">
                                <div className="tw-w-48 tw-mb-5 tw-h-48 tw-rounded-full tw-bg-gray-700 max-md:tw-w-36 max-md:tw-h-36"></div>
                                <div className="tw-flex tw-flex-col tw-w-2/3 max-md:tw-w-1/2">
                                    <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
                                    <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
                                    <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
                                    <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
                                </div>
                            </div>
                            <div className="tw-flex tw-flex-col tw-w-full max-sm:tw-flex-row tw-justify-evenly tw-items-center">
                                <div className="tw-w-48 tw-mb-5 tw-h-48 tw-rounded-full tw-bg-gray-700 max-md:tw-w-36 max-md:tw-h-36"></div>
                                <div className="tw-flex tw-flex-col tw-w-2/3 max-md:tw-w-1/2">
                                    <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
                                    <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
                                    <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
                                    <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
                                </div>
                            </div>
                            <div className="tw-flex tw-flex-col tw-w-full max-sm:tw-flex-row tw-justify-evenly tw-items-center">
                                <div className="tw-w-48 tw-mb-5 tw-h-48 tw-rounded-full tw-bg-gray-700 max-md:tw-w-36 max-md:tw-h-36"></div>
                                <div className="tw-flex tw-flex-col tw-w-2/3 max-md:tw-w-1/2">
                                    <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
                                    <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
                                    <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
                                    <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <section className="tw-grid sm:tw-grid-cols-3 lg:tw-grid-cols-4 xl:tw-grid-cols-5 tw-gap-x-4 md:tw-gap-x-6 tw-gap-y-8 md:tw-gap-y-16 tw-mt-12">
                    {liveGames.map((auctions, index) => {
                        const {
                            image,
                            year,
                            make,
                            model,
                            description,
                            deadline,
                            auction_id,
                            price,
                            _id,
                            images_list,
                        } = auctions;
                        return (
                            <TimerProvider key={index} deadline={deadline}>
                                <div
                                    className={`${
                                        pathname === "/"
                                            ? index < 3
                                                ? "lg:tw-block"
                                                : "sm:tw-hidden"
                                            : null
                                    } ${
                                        pathname === "/" && index === 3
                                            ? "lg:tw-block"
                                            : null
                                    }
                                    ${
                                        pathname === "/" && index === 4
                                            ? "xl:tw-block"
                                            : null
                                    }`}
                                >
                                    <DynamicLiveGamesCard
                                        parentIndex={index}
                                        object_id={_id}
                                        image={image}
                                        year={year}
                                        make={make}
                                        model={model}
                                        description={description}
                                        deadline={deadline}
                                        auction_id={auction_id}
                                        price={price}
                                        images_list={images_list}
                                    />
                                </div>
                            </TimerProvider>
                        );
                    })}
                </section>
            )}
        </div>
    );
};

export default LiveGames;
