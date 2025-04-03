"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
import { Auction } from "../(pages)/tournaments/[tournament_id]/page";
import { TimerProvider, useTimer } from "../_context/TimerContext";

interface TournamentWagerI {
    toggleTournamentWagerModal: () => void;
    handleInputs: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (
        e: React.FormEvent<HTMLFormElement>,
        sessionData: any
    ) => void;
    isButtonClicked: boolean;
    auctionData: Auction[];
    tournamentData: any;
    pot: number;
    closeModal: () => void;
}

const TournamentWagerModal: React.FC<TournamentWagerI> = ({
    toggleTournamentWagerModal,
    handleInputs,
    handleSubmit,
    isButtonClicked,
    auctionData,
    tournamentData,
    pot,
    closeModal,
}) => {
    const router = useRouter();
    const { data: session } = useSession();
    const sessionData = {
        _id: session?.user.id,
        fullName: session?.user.fullName,
        username: session?.user.username,
        image: session?.user.image,
    };

    useEffect(() => {
        if (!session) {
            router.push("/create_account");
        }
        console.log(session);
    }, [session]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const wagerModal = document.getElementById(
                "tournament-wager-modal"
            );
            if (
                wagerModal &&
                !wagerModal.contains(e.target as Node) &&
                wagerModal &&
                !wagerModal.contains(e.target as Node)
            ) {
                closeModal();
                document.body.classList.remove("stop-scrolling");
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [closeModal]);

    const date = new Date(tournamentData.endTime);
    const formattedDateString = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
    }).format(date);

    return (
        <div className="bg-black md:bg-black/90 w-screen h-screen flex justify-center items-start md:items-center fixed top-0 left-0 z-50">
            <form
                onSubmit={(e) => handleSubmit(e, sessionData)}
                className="relative bg-[#0F1923] w-[864px] h-screen overflow-y-auto md:min-h-[602px] md:max-h-[800px] rounded-sm"
                id="tournament-wager-modal"
            >
                <div className="flex items-center mb-6 sm:mb-1 pt-6 px-6 sm:pt-8 sm:px-8">
                    <div className="font-bold text-2xl">
                        {tournamentData.title}
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
                            className="w-[24px] h-[24px] m-3 sm:hidden"
                        />
                    </button>
                </div>
                <div className="text-base font-normal mb-6 px-6 sm:px-8">
                    Get more points the closer you are to the hammer price of a
                    curated set of car auctions. Guess the price for each of the
                    cars listed below and buy-in to lock in your wagers.{" "}
                    <span className="text-[#49C742]">Learn more</span>
                </div>
                <div className="bg-[#49C74233] text-[#49C742] font-bold rounded px-4 py-3 mb-6 sm:flex sm:items-center mx-6 sm:mx-8">
                    <div className="flex items-center gap-2 mb-4 sm:mb-0 sm:w-1/2">
                        <Image
                            src={MoneyBag}
                            width={32}
                            height={32}
                            alt="sedan"
                            className="w-[32px] h-[32px]"
                        />
                        <div>
                            <div className="text-xs tracking-widest text-[#40ab3d] font-semibold">
                                POTENTIAL PRIZE
                            </div>
                            <div className="text-lg">
                                $
                                {pot % 1 === 0
                                    ? pot.toLocaleString()
                                    : pot.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:w-1/2">
                        <Image
                            src={CalendarGreen}
                            width={32}
                            height={32}
                            alt="sedan"
                            className="w-[32px] h-[32px]"
                        />
                        <div>
                            <div className="text-xs tracking-widest text-[#40ab3d] font-semibold">
                                TOURNAMENT ENDS
                            </div>
                            <div className="text-lg">
                                {formattedDateString}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mb-[94px] sm:mb-0 sm:max-h-[488px] sm:overflow-y-auto px-6 sm:px-8">
                    {auctionData.map((auction, index: number) => {
                        return (
                            <TimerProvider
                                key={auction._id}
                                deadline={auction.sort.deadline}
                            >
                                <TournamentModalCard
                                    auction={auction}
                                    handleInputs={handleInputs}
                                    index={index}
                                    tournamentID={tournamentData._id}
                                />
                            </TimerProvider>
                        );
                    })}
                </div>
                <div className="py-4 px-8 bg-[#172431] fixed sm:static w-full bottom-0 z-30 sm:flex sm:justify-between">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            document.body.classList.remove("stop-scrolling");
                            toggleTournamentWagerModal();
                        }}
                        type="button"
                        className="hidden sm:block"
                    >
                        CANCEL
                    </button>
                    <button
                        type="submit"
                        disabled={isButtonClicked}
                        className="font-bold p-3 px-[43px] text-center w-full sm:w-auto bg-[#f2ca16] text-[#0f1923] rounded"
                    >
                        BUY-IN FOR ${tournamentData.buyInFee}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TournamentWagerModal;

interface TournamentCardI {
    handleInputs: (e: React.ChangeEvent<HTMLInputElement>) => void;
    auction: Auction;
    index: number;
    tournamentID: string;
}

export const TournamentModalCard: React.FC<TournamentCardI> = ({
    handleInputs,
    auction,
    index,
    tournamentID,
}) => {
    const timerValues = useTimer();

    return (
        <div
            key={auction._id}
            className="sm:flex sm:justify-between sm:pb-4"
        >
            <Link
                target="_blank"
                rel="noopener noreferrer"
                href={`/tournaments/${tournamentID}/${auction.auction_id}`}
                className="flex items-center gap-4 mb-2 sm:mb-0"
            >
                <Image
                    src={auction.image}
                    width={100}
                    height={100}
                    alt="sedan"
                    className="w-[100px] h-[100px] rounded object-cover"
                />
                <div>
                    <div className="mb-1 font-bold">
                        {`${auction.attributes[1].value} ${auction.attributes[2].value} ${auction.attributes[3].value}`}
                    </div>
                    <div className="flex text-sm items-center gap-1">
                        <Image
                            src={Dollar}
                            width={14}
                            height={14}
                            alt="sedan"
                            className="w-[14px] h-[14px]"
                        />
                        <div className="text-[#cfd1d3]">Current Bid:</div>
                        <div className="font-bold text-[#49C742]">
                            $
                            {new Intl.NumberFormat().format(
                                auction.attributes[0].value
                            )}
                        </div>
                    </div>
                    <div className="flex text-sm items-center gap-1">
                        <Image
                            src={HourGlass}
                            width={14}
                            height={14}
                            alt="sedan"
                            className="w-[14px] h-[14px]"
                        />
                        <div className="text-[#cfd1d3]">Time Left:</div>
                        <div>{`${timerValues.days}:${timerValues.hours}:${timerValues.minutes}:${timerValues.seconds}`}</div>
                    </div>
                </div>
            </Link>
            <div className="relative flex items-center rounded mb-4 sm:mb-0">
                <div className="w-lg h-auto top-[50%] -translate-y-[50%] left-3 absolute text-gray-500 z-20">
                    $
                </div>
                <input
                    onWheel={(e) => e.currentTarget.blur()}
                    id={auction._id}
                    onChange={(e) => handleInputs(e)}
                    placeholder="Enter your guess here"
                    onKeyDown={(event) => {
                        if (
                            !(
                                event.key === "Backspace" ||
                                event.key === "Tab" ||
                                event.key === "Enter" ||
                                /\d/.test(event.key)
                            )
                        ) {
                            event.preventDefault();
                        }
                    }}
                    required
                    name={`auction_${String(index + 1)}`}
                    type="number"
                    className="bg-[#172431] focus:outline sm:outline-[6px] outline-[3px] outline-[#273039] p-3 pl-8 w-full focus:bg-white focus:text-black focus:border-white/10 rounded"
                />
            </div>
        </div>
    );
};
