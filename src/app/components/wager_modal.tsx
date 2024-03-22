"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CreateAccount from "../(pages)/create_account/page";
import CarPhoto from "../../../public/images/wager-car-photo.svg";
import DollarIcon from "../../../public/images/dollar.svg";
import HashtagIcon from "../../../public/images/hash-02.svg";
import CalendarIcon from "../../../public/images/calendar-icon.svg";
import HourGlassIcon from "../../../public/images/hour-glass.svg";
import MoneyBag from "../../../public/images/money-bag-green.svg";
import Players from "../../../public/images/players-icon-green.svg";
import CancelIcon from "../../../public/images/x-icon.svg";
import { useTimer } from "@/app/_context/TimerContext";
import { useSession } from "next-auth/react";
import Wallet from "../../../public/images/wallet--money-payment-finance-wallet.svg";

interface SessionDataI {
    user: {
        _id?: string;
        fullName?: string;
        username?: string;
        image?: string;
    };
}

interface WagerModalProps {
    showWagerModal: () => void;
    handleWagerInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleWagerSubmit: (
        e: React.FormEvent<HTMLFormElement>,
        sessionData: SessionDataI
    ) => void;
    price: string;
    bids: number;
    make: string;
    model: string;
    ending: string;
    image: string;
    players_num: number;
    prize: number;
    walletBalance: number; // TEST IMPLEMENTATION
    insufficientFunds: boolean;
    invalidPrice: boolean;
    invalidWager: boolean;
    isButtonClicked: boolean;
    closeWagerModal: () => void;
}

const WagerModal: React.FC<WagerModalProps> = ({
    showWagerModal,
    price,
    bids,
    make,
    model,
    image,
    ending,
    handleWagerInputChange,
    handleWagerSubmit,
    players_num,
    prize,
    walletBalance, // TEST IMPLEMENTATION
    insufficientFunds,
    invalidPrice,
    invalidWager,
    isButtonClicked,
    closeWagerModal,
}) => {
    const router = useRouter();
    const timerValues = useTimer();
    const { data: session } = useSession();
    const [isWagerValid, setIsWagerValid] = useState(true);
    const [wagerErrorMessage, setWagerErrorMessage] = useState("");

    const sessionData = {
        user: {
            _id: session?.user.id,
            fullName: session?.user.fullName,
            username: session?.user.username,
            image: session?.user.image,
        },
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const wagerModal = document.getElementById("wager-modal");
            if (
                wagerModal &&
                !wagerModal.contains(e.target as Node) &&
                wagerModal &&
                !wagerModal.contains(e.target as Node)
            ) {
                closeWagerModal();
                document.body.classList.remove("stop-scrolling");
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [closeWagerModal]);

    useEffect(() => {
        if (!session) {
            router.push("/create_account");
        }
        console.log(session);
    }, [session]);

    return (
        <>
            {session ? (
                <div className="tw-bg-black md:tw-bg-black/90 tw-w-screen tw-h-screen tw-flex tw-justify-center tw-items-start md:tw-items-center tw-fixed tw-top-0 tw-left-0 tw-z-50">
                    {/* Content */}
                    <form
                        onSubmit={(e) => handleWagerSubmit(e, sessionData)}
                        className="tw-relative tw-bg-[#0F1923] tw-w-[864px] tw-h-screen tw-overflow-y-auto md:tw-min-h-[602px] md:tw-max-h-[800px] tw-pt-8 tw-flex tw-flex-col tw-gap-6 tw-rounded-sm"
                        id="wager-modal"
                    >
                        <div className="tw-flex tw-flex-col md:tw-flex-row md:tw-gap-6 tw-gap-[220px] tw-px-6">
                            <div className="tw-flex md:tw-hidden tw-items-center tw-justify-between md:tw-justify-start tw-w-full">
                                <div className="tw-text-2xl sm:tw-text-4xl tw-font-bold">
                                    Guess the Price
                                </div>
                                <button onClick={showWagerModal}>
                                    <Image
                                        src={CancelIcon}
                                        width={20}
                                        height={20}
                                        alt=""
                                        className="tw-w-[20px] tw-h-[20px] "
                                    />
                                </button>
                            </div>
                            <Image
                                src={image}
                                width={360}
                                height={173}
                                alt="fray car"
                                className="tw-w-full md:tw-w-[136px] tw-absolute tw-top-[90px] tw-left-0 tw-right-0 md:tw-static tw-h-[172px] md:tw-h-[136px] tw-object-cover tw-aspect-3/4 md:tw-aspect-auto"
                            />
                            <div className="md:tw-ml-6 md:tw-mt-0 tw-text-3xl">
                                <div className="tw-font-bold">
                                    {make} {model}
                                </div>
                                <div className="tw-grid tw-gap-2 tw-mt-4">
                                    <div className="tw-grid tw-grids-cols-1 md:tw-grid-cols-2 tw-text-sm tw-gap-2">
                                        <div className="tw-flex tw-items-center">
                                            <Image
                                                src={DollarIcon}
                                                width={14}
                                                height={14}
                                                alt=""
                                                className="tw-w-[14px] tw-h-[14px]"
                                            />
                                            <div className="tw-text-sm tw-ml-2 tw-flex tw-flex-row tw-gap-2">
                                                <span className="tw-opacity-80">
                                                    Current Bid:
                                                </span>
                                                <span className="tw-text-[#49C742] tw-font-bold">
                                                    ${price}
                                                </span>
                                                <span className="md:tw-hidden">{`(${bids} bids)`}</span>
                                            </div>
                                        </div>
                                        <div className="tw-hidden md:tw-flex tw-items-center ">
                                            <Image
                                                src={HashtagIcon}
                                                width={14}
                                                height={14}
                                                alt=""
                                                className="tw-w-[14px] tw-h-[14px]"
                                            />
                                            <div className="tw-text-sm tw-ml-2">
                                                <span className="tw-opacity-80">
                                                    Bids:
                                                </span>
                                                <span className=" tw-font-bold tw-ml-2">
                                                    {bids}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-2 tw-text-sm">
                                        <div className="tw-flex tw-items-center">
                                            <Image
                                                src={CalendarIcon}
                                                width={14}
                                                height={14}
                                                alt=""
                                                className="tw-w-[14px] tw-h-[14px]"
                                            />
                                            <div className="tw-text-sm tw-ml-2">
                                                <span className="tw-opacity-80">
                                                    Ending:
                                                </span>
                                                <span className="tw-font-bold tw-ml-2">
                                                    {ending}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="tw-flex tw-items-center">
                                            <Image
                                                src={HourGlassIcon}
                                                width={14}
                                                height={14}
                                                alt=""
                                                className="tw-w-[14px] tw-h-[14px]"
                                            />
                                            <div className="tw-text-sm tw-ml-2">
                                                <span className="tw-opacity-80">
                                                    Time Left:
                                                </span>
                                                <span className=" tw-font-bold tw-ml-2 tw-text-[#C2451E]">{`${timerValues.days}:${timerValues.hours}:${timerValues.minutes}:${timerValues.seconds}`}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="tw-flex tw-items-center">
                                        <Image
                                            src={Wallet}
                                            width={14}
                                            height={14}
                                            alt="wallet icon"
                                            className="tw-w-3.5 tw-h-3.5"
                                        />
                                        <div className="tw-text-sm tw-ml-2">
                                            <span className="tw-opacity-80">
                                                Wallet Balance:
                                            </span>
                                            <span className="tw-font-bold tw-ml-2">
                                                $
                                                {walletBalance % 1 === 0
                                                    ? walletBalance.toLocaleString()
                                                    : walletBalance.toLocaleString(
                                                          undefined,
                                                          {
                                                              minimumFractionDigits: 2,
                                                              maximumFractionDigits: 2,
                                                          }
                                                      )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <hr className="tw-border-t-[#1b252e]" />
                        <div className=" tw-flex tw-flex-col tw-gap-3 tw-px-6">
                            <label className="tw-text-lg">
                                How much will this sell for?
                            </label>
                            <div className="tw-relative tw-flex tw-items-center tw-rounded ">
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
                                    onInput={(event) => {
                                        const inputValue = (
                                            event.target as HTMLInputElement
                                        ).value;
                                        if (
                                            inputValue.length > 0 &&
                                            !/\d/.test(inputValue.slice(-1))
                                        ) {
                                            event.preventDefault();
                                        }
                                    }}
                                    required
                                    name="price-guessed"
                                    type="number"
                                    className="tw-bg-white/5 focus:tw-outline tw-outline-[6px] tw-outline-[#273039] tw-py-3 tw-pl-8 tw-pr-3 tw-w-full focus:tw-bg-white focus:tw-text-black focus:tw-border-white/10 tw-rounded"
                                    onChange={handleWagerInputChange}
                                />
                                {invalidPrice && (
                                    <div className="tw-absolute tw-text-sm tw-text-red-500 tw-font-medium -tw-bottom-5">
                                        *Invalid input. Please enter numeric
                                        values only.
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="tw-flex tw-flex-col tw-gap-3 tw-px-6">
                            <label className="tw-text-lg">Wager</label>
                            <div className="tw-relative tw-flex tw-items-center tw-rounded ">
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
                                    onInput={(event) => {
                                        const inputValue = (
                                            event.target as HTMLInputElement
                                        ).value;
                                        if (
                                            inputValue.length > 0 &&
                                            !/\d/.test(inputValue.slice(-1))
                                        ) {
                                            event.preventDefault();
                                        }
                                    }}
                                    disabled
                                    value={10}
                                    name="wager-amount"
                                    type="number"
                                    className="tw-bg-white/5 focus:tw-outline tw-opacity-50 tw-outline-[6px] tw-outline-[#273039] tw-py-3 tw-pl-8 tw-pr-3 tw-w-full focus:tw-bg-white focus:tw-text-black focus:tw-border-white/10 tw-rounded tw-outline-[#273039]"
                                    onChange={handleWagerInputChange}
                                />
                                {invalidWager && (
                                    <div className="tw-absolute tw-text-sm tw-text-red-500 tw-font-medium -tw-bottom-5">
                                        *Invalid input. Please enter numeric
                                        values only.
                                    </div>
                                )}
                            </div>
                            {!isWagerValid && (
                                <div className="tw-text-red-500 tw-mt-2 tw-text-sm">
                                    {wagerErrorMessage}
                                    <Link href="/payment">
                                        <a className="tw-text-white hover:tw-underline">
                                            Top-up your wallet
                                        </a>
                                    </Link>
                                </div>
                            )}
                        </div>
                        <div className="tw-text-[#49C742] tw-text-lg  tw-py-3 tw-px-4 tw-bg-[#49C74233] tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4 tw-mx-6 tw-px-6 tw-rounded">
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
                                    <div className="tw-font-bold">
                                        $
                                        {prize
                                            ? new Intl.NumberFormat().format(
                                                  prize
                                              )
                                            : " --"}
                                    </div>
                                </div>
                            </div>
                            <div className="tw-flex tw-items-center tw-gap-2">
                                <Image
                                    src={Players}
                                    width={32}
                                    height={32}
                                    alt="money bag"
                                    className="tw-w-[32px] tw-h-[32px]"
                                />
                                <div className="">
                                    <div className="tw-text-xs">PLAYERS</div>
                                    <div className="tw-font-bold">
                                        {players_num}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="md:tw-absolute tw-relative md:tw-bottom-0 tw-flex-col md:tw-flex-row md:tw-left-0 tw-items-center tw-flex tw-justify-between tw-h-auto tw-w-full tw-px-6 tw-pt-8 tw-pb-6 tw-bg-white/5">
                            <button
                                className="tw-hidden md:tw-block"
                                onClick={showWagerModal}
                                type="button"
                            >
                                CANCEL
                            </button>
                            {insufficientFunds && (
                                <div className="md:tw-text-base tw-text-sm tw-text-red-500 tw-font-medium tw-absolute md:tw-static tw-top-2">
                                    <span className="tw-hidden md:tw-inline-block">
                                        ✕
                                    </span>{" "}
                                    Insufficient funds. Top up your wallet to
                                    continue.
                                </div>
                            )}
                            <button
                                className="btn-yellow tw-h-[48px] tw-w-full md:tw-w-auto"
                                type="submit"
                                disabled={isButtonClicked}
                            >
                                PLACE MY WAGER
                            </button>
                        </div>
                    </form>
                </div>
            ) : null}
        </>
    );
};

export default WagerModal;
