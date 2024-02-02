import React from "react";
import Link from "next/link";
import Image from "next/image";

import MoneyBag from "../../../public/images/money-bag-green.svg";
import PlayersIcon from "../../../public/images/players-icon-green.svg";
import HourGlass from "../../../public/images/hour-glass.svg";
import Dollar from "../../../public/images/dollar.svg";
import CalendarGreen from "../../../public/images/calendar-icon-green.svg";
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
            _id: 1,
            img: SedanPhotoOne,
            name: "620-Mile 2019 Ford GT",
            current_bid: "$904,000",
            time_left: "12:17:00",
        },
        {
            _id: 2,
            img: SedanPhotoTwo,
            name: "620-Mile 2019 Ford GT",
            current_bid: "$904,000",
            time_left: "12:17:00",
        },
        {
            _id: 3,
            img: SedanPhotoThree,
            name: "620-Mile 2019 Ford GT",
            current_bid: "$904,000",
            time_left: "12:17:00",
        },
        {
            _id: 4,
            img: SedanPhotoFour,
            name: "620-Mile 2019 Ford GT",
            current_bid: "$904,000",
            time_left: "12:17:00",
        },
        {
            _id: 5,
            img: SedanPhotoFive,
            name: "620-Mile 2019 Ford GT",
            current_bid: "$904,000",
            time_left: "12:17:00",
        },
    ];

    return (
        <div className="tw-bg-black md:tw-bg-black/90 tw-w-screen tw-h-screen tw-flex tw-justify-center tw-items-start md:tw-items-center tw-fixed tw-top-0 tw-left-0 tw-z-50">
            <form className="tw-relative tw-bg-[#0F1923] tw-w-[864px] tw-h-screen tw-overflow-y-auto md:tw-min-h-[602px] md:tw-max-h-[800px] tw-rounded-sm">
                <div className="tw-flex tw-items-center tw-mb-6 sm:tw-mb-1 tw-pt-6 tw-px-6 sm:tw-pt-8 sm:tw-px-8">
                    <div className="tw-font-bold tw-text-2xl">
                        Sedan Champions Tournament
                    </div>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            document.body.classList.remove("stop-scrolling");
                            toggleTournamentWagerModal();
                        }}
                    >
                        <Image
                            src={CancelIcon}
                            width={24}
                            height={24}
                            alt="sedan"
                            className="tw-w-[24px] tw-h-[24px] tw-m-3 sm:tw-hidden"
                        />
                    </button>
                </div>
                <div className="tw-text-base tw-font-normal tw-mb-6 tw-px-6 sm:tw-px-8">
                    Get more points the closer you are to the hammer price of a
                    curated set of car auctions. Guess the price for each of the
                    cars listed below and buy-in to lock in your wagers.{" "}
                    <span className="tw-text-[#49C742]">Learn more</span>
                </div>
                <div className="tw-bg-[#49C74233] tw-text-[#49C742] tw-font-bold tw-rounded tw-px-4 tw-py-3 tw-mb-6 sm:tw-flex sm:tw-items-center tw-mx-6 sm:tw-mx-8">
                    <div className="tw-flex tw-items-center tw-gap-2 tw-mb-4 sm:tw-mb-0 sm:tw-w-1/2">
                        <Image
                            src={MoneyBag}
                            width={32}
                            height={32}
                            alt="sedan"
                            className="tw-w-[32px] tw-h-[32px]"
                        />
                        <div>
                            <div className="tw-text-xs tw-tracking-widest tw-text-[#40ab3d] tw-font-semibold">
                                POTENTIAL PRIZE
                            </div>
                            <div className="tw-text-lg">$1,000</div>
                        </div>
                    </div>
                    <div className="tw-flex tw-items-center tw-gap-2 sm:tw-w-1/2">
                        <Image
                            src={CalendarGreen}
                            width={32}
                            height={32}
                            alt="sedan"
                            className="tw-w-[32px] tw-h-[32px]"
                        />
                        <div>
                            <div className="tw-text-xs tw-tracking-widest tw-text-[#40ab3d] tw-font-semibold">
                                TOURNAMENT ENDS
                            </div>
                            <div className="tw-text-lg">
                                Jul 5, 2023, 7:00 pm
                            </div>
                        </div>
                    </div>
                </div>
                <div className="tw-mb-[94px] sm:tw-mb-0 sm:tw-max-h-[488px] sm:tw-overflow-y-auto tw-px-6 sm:tw-px-8">
                    {tournamentWagerPageData.map((auction) => {
                        return (
                            <div
                                key={auction._id}
                                className="sm:tw-flex sm:tw-justify-between sm:tw-pb-4"
                            >
                                <div className="tw-flex tw-items-center tw-gap-4 tw-mb-2 sm:tw-mb-0">
                                    <Image
                                        src={auction.img}
                                        width={100}
                                        height={100}
                                        alt="sedan"
                                        className="tw-w-[100px] tw-h-[100px]"
                                    />
                                    <div>
                                        <div className="tw-mb-1 tw-font-bold">
                                            {auction.name}
                                        </div>
                                        <div className="tw-flex tw-text-sm tw-items-center tw-gap-1">
                                            <Image
                                                src={Dollar}
                                                width={14}
                                                height={14}
                                                alt="sedan"
                                                className="tw-w-[14px] tw-h-[14px]"
                                            />
                                            <div className="tw-text-[#cfd1d3]">
                                                Current Bid:
                                            </div>
                                            <div className="tw-font-bold tw-text-[#49C742]">
                                                {auction.current_bid}
                                            </div>
                                        </div>
                                        <div className="tw-flex tw-text-sm tw-items-center tw-gap-1">
                                            <Image
                                                src={HourGlass}
                                                width={14}
                                                height={14}
                                                alt="sedan"
                                                className="tw-w-[14px] tw-h-[14px]"
                                            />
                                            <div className="tw-text-[#cfd1d3]">
                                                Time Left:
                                            </div>
                                            <div>{auction.time_left}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="tw-relative tw-flex tw-items-center tw-rounded tw-mb-4 sm:tw-mb-0">
                                    <div className="tw-w-lg tw-h-auto tw-top-[50%] tw--translate-y-[50%] tw-left-3 tw-absolute tw-text-gray-500 tw-z-20">
                                        $
                                    </div>
                                    <input
                                        onKeyDown={(event) => {
                                            if (
                                                !(
                                                    event.key === "Backspace" ||
                                                    event.key === "Tab" ||
                                                    /\d/.test(event.key)
                                                )
                                            ) {
                                                event.preventDefault();
                                            }
                                        }}
                                        required
                                        name={auction.name}
                                        type="number"
                                        className="tw-bg-[#172431] focus:tw-outline sm:tw-outline-[6px] tw-outline-[3px] tw-outline-[#273039] tw-p-3 tw-pl-8 tw-w-full focus:tw-bg-white focus:tw-text-black focus:tw-border-white/10 tw-rounded"
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="tw-py-4 tw-px-8 tw-bg-[#172431] tw-fixed sm:tw-static tw-w-full tw-bottom-0 tw-z-30 sm:tw-flex sm:tw-justify-between">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            document.body.classList.remove("stop-scrolling");
                            toggleTournamentWagerModal();
                        }}
                        type="button"
                        className="tw-hidden sm:tw-block"
                    >
                        CANCEL
                    </button>
                    <button className="tw-font-bold tw-p-3 tw-px-[43px] tw-text-center tw-w-full sm:tw-w-auto tw-bg-[#f2ca16] tw-text-[#0f1923] tw-rounded">
                        BUY-IN FOR $100
                    </button>
                </div>
            </form>
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
                    <div className="tw-text-lg tw-font-bold tw-mb-1">
                        {name}
                    </div>
                    <div className="tw-flex tw-gap-2 tw-items-center tw-text-sm">
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
                    <div className="tw-flex tw-gap-2 tw-items-center tw-text-sm">
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
                <input
                    onKeyDown={(event) => {
                        if (
                            !(
                                event.key === "Backspace" ||
                                event.key === "Tab" ||
                                /\d/.test(event.key)
                            )
                        ) {
                            event.preventDefault();
                        }
                    }}
                    required
                    type="number"
                    className="tw-bg-white/5 focus:tw-outline tw-outline-[6px] tw-outline-[#273039] tw-py-3 tw-pl-8 tw-pr-3 tw-w-full focus:tw-bg-white focus:tw-text-black focus:tw-border-white/10 tw-rounded"
                />
            </div>
        </div>
    );
};
