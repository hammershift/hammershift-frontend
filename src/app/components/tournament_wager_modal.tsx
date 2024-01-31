import React from "react";
import Link from "next/link";
import Image from "next/image";

import MoneyBag from "../../../public/images/money-bag-green.svg";
import PlayersIcon from "../../../public/images/players-icon-green.svg";
import HourGlass from "../../../public/images/hour-glass.svg";
import Dollar from "../../../public/images/dollar.svg";
import CancelIcon from "../../../public/images/x-icon.svg";
import SedanPhotoOne from "../../../public/images/tournament-wager/sedan-photo-one.svg";
import SedanPhotoTwo from "../../../public/images/tournament-wager/sedan-photo-two.svg";
import SedanPhotoThree from "../../../public/images/tournament-wager/sedan-photo-three.svg";
import SedanPhotoFour from "../../../public/images/tournament-wager/sedan-photo-four.svg";
import SedanPhotoFive from "../../../public/images/tournament-wager/sedan-photo-five.svg";

interface TournamentWagerI {
    toggleTournamentWagerModal: () => void;
}

const TournamentWagerModal: React.FC<TournamentWagerI> = ({
    toggleTournamentWagerModal,
}) => {
    const tournamentWagerPageData = [
        {
            img: SedanPhotoOne,
            name: "620-Mile 2019 Ford GT",
            current_bid: "$904,000",
            time_left: "12:17:00",
        },
        {
            img: SedanPhotoTwo,
            name: "620-Mile 2019 Ford GT",
            current_bid: "$904,000",
            time_left: "12:17:00",
        },
        {
            img: SedanPhotoThree,
            name: "620-Mile 2019 Ford GT",
            current_bid: "$904,000",
            time_left: "12:17:00",
        },
        {
            img: SedanPhotoFour,
            name: "620-Mile 2019 Ford GT",
            current_bid: "$904,000",
            time_left: "12:17:00",
        },
        {
            img: SedanPhotoFive,
            name: "620-Mile 2019 Ford GT",
            current_bid: "$904,000",
            time_left: "12:17:00",
        },
    ];

    return (
        <div className="tw-bg-black md:tw-bg-black/90 tw-w-screen tw-h-screen tw-flex tw-justify-center tw-items-start md:tw-items-center tw-fixed tw-top-0 tw-left-0 tw-z-50">
            <div className="tw-relative tw-bg-[#0F1923] tw-w-full sm:tw-w-[864px] tw-h-full sm:tw-h-[900px] tw-pt-8">
                <div className="tw-flex tw-flex-col tw-gap-4  tw-px-6">
                    <div className="tw-flex tw-items-center tw-justify-between sm:tw-justify-start">
                        <div className="tw-text-2xl sm:tw-text-4xl tw-font-bold">
                            Sedan Champions Tournament
                        </div>
                        <Link href={"/tournament_page"}>
                            <Image
                                src={CancelIcon}
                                width={20}
                                height={20}
                                alt=""
                                className="tw-w-[20px] tw-h-[20px] sm:tw-hidden"
                            />
                        </Link>
                    </div>
                    <div>
                        Get more points the closer you are to the hammer price
                        of a curated set of car auctions. Guess the price for
                        each of the cars listed below and buy-in to lock in your
                        wagers.{" "}
                        <span className="tw-text-[#49C742]">Learn more</span>
                    </div>
                    <div className="tw-text-[#49C742] tw-text-lg tw-py-3 tw-px-4 tw-bg-[#49C74233] tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 tw-gap-4">
                        <div className="tw-flex tw-items-center tw-gap-2">
                            <Image
                                src={MoneyBag}
                                width={32}
                                height={32}
                                alt="money bag"
                                className="tw-w-[32px] tw-h-[32px]"
                            />
                            <div className="">
                                <div className="tw-text-xs">
                                    POTENTIAL PRIZE
                                </div>
                                <div className="tw-font-bold">$1.00</div>
                            </div>
                        </div>
                        <div className="tw-flex tw-items-center tw-gap-2">
                            <Image
                                src={PlayersIcon}
                                width={32}
                                height={32}
                                alt="money bag"
                                className="tw-w-[32px] tw-h-[32px]"
                            />
                            <div className="">
                                <div className="tw-text-xs">PLAYERS</div>
                                <div className="tw-font-bold">12</div>
                            </div>
                        </div>
                    </div>
                    <div className="tw-flex tw-flex-col tw-gap-4">
                        {tournamentWagerPageData.map((data) => (
                            <div key={data.img}>
                                <TournamentWagerPageCard
                                    img={data.img}
                                    name={data.name}
                                    current_bid={data.current_bid}
                                    time_left={data.time_left}
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="tw-fixed tw-bottom-0 tw-left-0 sm:tw-static tw-items-center tw-flex tw-justify-between tw-h-[80px] tw-w-full tw-p-6 tw-bg-[#172431] tw-mt-6 tw-z-20">
                    <button
                        onClick={() => {
                            document.body.classList.remove("stop-scrolling");
                            toggleTournamentWagerModal();
                        }}
                        className="tw-hidden sm:tw-block"
                    >
                        CANCEL
                    </button>
                    <button className="btn-yellow tw-h-[48px] tw-w-full sm:tw-w-[224px]">
                        BUY-IN FOR $100
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TournamentWagerModal;

interface TournamentWagerPageCardProps {
    img: string;
    name: string;
    current_bid: string;
    time_left: string;
}

const TournamentWagerPageCard: React.FC<TournamentWagerPageCardProps> = ({
    img,
    name,
    current_bid,
    time_left,
}) => {
    return (
        <div className="tw-text-sm tw-flex tw-flex-col sm:tw-flex-row sm:tw-justify-between tw-items-center tw-gap-4">
            <div className="tw-flex tw-gap-4">
                <Image
                    src={img}
                    width={100}
                    height={100}
                    alt="sedan"
                    className="tw-w-[100px] tw-h-[100px]"
                />
                <div className="tw-flex tw-flex-col tw-justify-center">
                    <div className="tw-text-lg tw-font-bold">{name}</div>
                    <div className="tw-flex tw-gap-2 tw-items-center">
                        <Image
                            src={Dollar}
                            width={14}
                            height={14}
                            alt="sedan"
                            className="tw-w-[14px] tw-h-[14px]"
                        />
                        <span className="tw-opacity-80">Current Bid:</span>
                        <span className="tw-font-bold tw-text-[#49C742]">
                            {current_bid}
                        </span>
                    </div>
                    <div className="tw-flex tw-gap-2 tw-items-center">
                        <Image
                            src={HourGlass}
                            width={14}
                            height={14}
                            alt="sedan"
                            className="tw-w-[14px] tw-h-[14px]"
                        />
                        <span className="tw-opacity-80">Time Left:</span>
                        <span>{time_left}</span>
                    </div>
                </div>
            </div>
            <div className="tw-relative tw-flex tw-items-center tw-rounded tw-w-full sm:tw-w-[224px]">
                <div className="tw-w-lg tw-h-auto tw-top-[50%] tw--translate-y-[50%] tw-left-3 tw-absolute tw-text-gray-500 tw-z-10">
                    $
                </div>
                <input className="tw-bg-white/5 tw-py-3 tw-pl-8 tw-pr-3 tw-w-full focus:tw-bg-white focus:tw-text-black focus:tw-border-2 focus:tw-border-white/10 " />
            </div>
        </div>
    );
};
