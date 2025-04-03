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
    wagerAmountAlreadyExists: boolean;
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
    wagerAmountAlreadyExists,
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
                <div className="bg-black md:bg-black/90 w-screen h-screen flex justify-center items-start md:items-center fixed top-0 left-0 z-50">
                    {/* Content */}
                    <form
                        onSubmit={(e) => handleWagerSubmit(e, sessionData)}
                        className="relative bg-[#0F1923] w-[864px] h-screen overflow-y-auto md:min-h-[602px] md:max-h-[800px] pt-8 flex flex-col gap-6 rounded-sm"
                        id="wager-modal"
                    >
                        <div className="flex flex-col md:flex-row md:gap-6 gap-[220px] px-6">
                            <div className="flex md:hidden items-center justify-between md:justify-start w-full">
                                <div className="text-2xl sm:text-4xl font-bold">
                                    Guess the Price
                                </div>
                                <button onClick={showWagerModal}>
                                    <Image
                                        src={CancelIcon}
                                        width={20}
                                        height={20}
                                        alt=""
                                        className="w-[20px] h-[20px] "
                                    />
                                </button>
                            </div>
                            <Image
                                src={image}
                                width={360}
                                height={173}
                                alt="fray car"
                                className="w-full md:w-[136px] absolute top-[90px] left-0 right-0 md:static h-[172px] md:h-[136px] object-cover aspect-3/4 md:aspect-auto"
                            />
                            <div className="md:ml-6 md:mt-0 text-3xl">
                                <div className="font-bold">
                                    {make} {model}
                                </div>
                                <div className="grid gap-2 mt-4">
                                    <div className="grid grids-cols-1 md:grid-cols-2 text-sm gap-2">
                                        <div className="flex items-center">
                                            <Image
                                                src={DollarIcon}
                                                width={14}
                                                height={14}
                                                alt=""
                                                className="w-[14px] h-[14px]"
                                            />
                                            <div className="text-sm ml-2 flex flex-row gap-2">
                                                <span className="opacity-80">
                                                    Current Bid:
                                                </span>
                                                <span className="text-[#49C742] font-bold">
                                                    ${price}
                                                </span>
                                                <span className="md:hidden">{`(${bids} bids)`}</span>
                                            </div>
                                        </div>
                                        <div className="hidden md:flex items-center ">
                                            <Image
                                                src={HashtagIcon}
                                                width={14}
                                                height={14}
                                                alt=""
                                                className="w-[14px] h-[14px]"
                                            />
                                            <div className="text-sm ml-2">
                                                <span className="opacity-80">
                                                    Bids:
                                                </span>
                                                <span className=" font-bold ml-2">
                                                    {bids}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                        <div className="flex items-center">
                                            <Image
                                                src={CalendarIcon}
                                                width={14}
                                                height={14}
                                                alt=""
                                                className="w-[14px] h-[14px]"
                                            />
                                            <div className="text-sm ml-2">
                                                <span className="opacity-80">
                                                    Ending:
                                                </span>
                                                <span className="font-bold ml-2">
                                                    {ending}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <Image
                                                src={HourGlassIcon}
                                                width={14}
                                                height={14}
                                                alt=""
                                                className="w-[14px] h-[14px]"
                                            />
                                            <div className="text-sm ml-2">
                                                <span className="opacity-80">
                                                    Time Left:
                                                </span>
                                                <span className=" font-bold ml-2 text-[#C2451E]">{`${timerValues.days}:${timerValues.hours}:${timerValues.minutes}:${timerValues.seconds}`}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <Image
                                            src={Wallet}
                                            width={14}
                                            height={14}
                                            alt="wallet icon"
                                            className="w-3.5 h-3.5"
                                        />
                                        <div className="text-sm ml-2">
                                            <span className="opacity-80">
                                                Wallet Balance:
                                            </span>
                                            <span className="font-bold ml-2">
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
                        <hr className="border-t-[#1b252e]" />
                        <div className=" flex flex-col gap-3 px-6">
                            <label className="text-lg">
                                How much will this sell for?
                            </label>
                            <div className="relative flex items-center rounded ">
                                <div className="w-lg h-auto top-[50%] -translate-y-[50%] left-3 absolute text-gray-500 z-20">
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
                                    className="bg-white/5 focus:outline outline-[6px] outline-[#273039] py-3 pl-8 pr-3 w-full focus:bg-white focus:text-black focus:border-white/10 rounded"
                                    onChange={handleWagerInputChange}
                                />
                                {invalidPrice && (
                                    <div className="absolute text-sm text-red-500 font-medium -bottom-5">
                                        *Invalid input. Please enter numeric
                                        values only.
                                    </div>
                                )}
                                {wagerAmountAlreadyExists && (
                                    <div className="absolute text-sm text-red-500 font-medium -bottom-5">
                                        *This wager amount has already been used
                                        for this auction. Please enter a
                                        different one.
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 px-6">
                            <label className="text-lg">Wager</label>
                            <div className="relative flex items-center rounded ">
                                <div className="w-lg h-auto top-[50%] -translate-y-[50%] left-3 absolute text-gray-500 z-20">
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
                                    className="bg-white/5 focus:outline opacity-50 outline-[6px] outline-[#273039] py-3 pl-8 pr-3 w-full focus:bg-white focus:text-black focus:border-white/10 rounded outline-[#273039]"
                                    onChange={handleWagerInputChange}
                                />
                                {invalidWager && (
                                    <div className="absolute text-sm text-red-500 font-medium -bottom-5">
                                        *Invalid input. Please enter numeric
                                        values only.
                                    </div>
                                )}
                            </div>
                            {!isWagerValid && (
                                <div className="text-red-500 mt-2 text-sm">
                                    {wagerErrorMessage}
                                    <Link href="/payment">
                                        <a className="text-white hover:underline">
                                            Top-up your wallet
                                        </a>
                                    </Link>
                                </div>
                            )}
                        </div>
                        <div className="text-[#49C742] text-lg  py-3 px-4 bg-[#49C74233] grid grid-cols-1 md:grid-cols-2 gap-4 mx-6 px-6 rounded">
                            <div className="flex items-center gap-2">
                                <Image
                                    src={MoneyBag}
                                    width={32}
                                    height={32}
                                    alt="money bag"
                                    className="w-[32px] h-[32px]"
                                />
                                <div className="">
                                    <div className="text-xs">
                                        POTENTIAL PRIZE
                                    </div>
                                    <div className="font-bold">
                                        $
                                        {prize
                                            ? new Intl.NumberFormat().format(
                                                prize
                                            )
                                            : " --"}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Image
                                    src={Players}
                                    width={32}
                                    height={32}
                                    alt="money bag"
                                    className="w-[32px] h-[32px]"
                                />
                                <div className="">
                                    <div className="text-xs">PLAYERS</div>
                                    <div className="font-bold">
                                        {players_num}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="md:absolute relative md:bottom-0 flex-col md:flex-row md:left-0 items-center flex justify-between h-auto w-full px-6 pt-8 pb-6 bg-white/5">
                            <button
                                className="hidden md:block"
                                onClick={showWagerModal}
                                type="button"
                            >
                                CANCEL
                            </button>
                            {insufficientFunds && (
                                <div className="md:text-base text-sm text-red-500 font-medium absolute md:static top-2">
                                    <span className="hidden md:inline-block">
                                        ✕
                                    </span>{" "}
                                    Insufficient funds. Top up your wallet to
                                    continue.
                                </div>
                            )}
                            <button
                                className="btn-yellow h-[48px] w-full md:w-auto"
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
