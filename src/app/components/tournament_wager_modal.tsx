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
        <div className="tw-bg-black md:tw-bg-black/90 tw-w-screen tw-h-screen tw-flex tw-justify-center tw-items-start md:tw-items-center tw-fixed tw-top-0 tw-left-0 tw-z-50">
            <form
                onSubmit={(e) => handleSubmit(e, sessionData)}
                className="tw-relative tw-bg-[#0F1923] tw-w-[864px] tw-h-screen tw-overflow-y-auto md:tw-min-h-[602px] md:tw-max-h-[800px] tw-rounded-sm"
                id="tournament-wager-modal"
            >
                <div className="tw-flex tw-items-center tw-mb-6 sm:tw-mb-1 tw-pt-6 tw-px-6 sm:tw-pt-8 sm:tw-px-8">
                    <div className="tw-font-bold tw-text-2xl">
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
                            <div className="tw-text-lg">
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
                                {formattedDateString}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="tw-mb-[94px] sm:tw-mb-0 sm:tw-max-h-[488px] sm:tw-overflow-y-auto tw-px-6 sm:tw-px-8">
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
                    <button
                        type="submit"
                        disabled={isButtonClicked}
                        className="tw-font-bold tw-p-3 tw-px-[43px] tw-text-center tw-w-full sm:tw-w-auto tw-bg-[#f2ca16] tw-text-[#0f1923] tw-rounded"
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
            className="sm:tw-flex sm:tw-justify-between sm:tw-pb-4"
        >
            <Link
                target="_blank"
                rel="noopener noreferrer"
                href={`/tournaments/${tournamentID}/${auction.auction_id}`}
                className="tw-flex tw-items-center tw-gap-4 tw-mb-2 sm:tw-mb-0"
            >
                <Image
                    src={auction.image}
                    width={100}
                    height={100}
                    alt="sedan"
                    className="tw-w-[100px] tw-h-[100px] tw-rounded tw-object-cover"
                />
                <div>
                    <div className="tw-mb-1 tw-font-bold">
                        {`${auction.attributes[1].value} ${auction.attributes[2].value} ${auction.attributes[3].value}`}
                    </div>
                    <div className="tw-flex tw-text-sm tw-items-center tw-gap-1">
                        <Image
                            src={Dollar}
                            width={14}
                            height={14}
                            alt="sedan"
                            className="tw-w-[14px] tw-h-[14px]"
                        />
                        <div className="tw-text-[#cfd1d3]">Current Bid:</div>
                        <div className="tw-font-bold tw-text-[#49C742]">
                            $
                            {new Intl.NumberFormat().format(
                                auction.attributes[0].value
                            )}
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
                        <div className="tw-text-[#cfd1d3]">Time Left:</div>
                        <div>{`${timerValues.days}:${timerValues.hours}:${timerValues.minutes}:${timerValues.seconds}`}</div>
                    </div>
                </div>
            </Link>
            <div className="tw-relative tw-flex tw-items-center tw-rounded tw-mb-4 sm:tw-mb-0">
                <div className="tw-w-lg tw-h-auto tw-top-[50%] tw--translate-y-[50%] tw-left-3 tw-absolute tw-text-gray-500 tw-z-20">
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
                    className="tw-bg-[#172431] focus:tw-outline sm:tw-outline-[6px] tw-outline-[3px] tw-outline-[#273039] tw-p-3 tw-pl-8 tw-w-full focus:tw-bg-white focus:tw-text-black focus:tw-border-white/10 tw-rounded"
                />
            </div>
        </div>
    );
};
