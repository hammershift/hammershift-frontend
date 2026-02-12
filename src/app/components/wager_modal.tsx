"use client";

import { useTimer } from "@/app/context/TimerContext";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import CalendarIcon from "../../../public/images/calendar-icon.svg";
import DollarIcon from "../../../public/images/dollar.svg";
import HashtagIcon from "../../../public/images/hash-02.svg";
import HourGlassIcon from "../../../public/images/hour-glass.svg";
import MoneyBag from "../../../public/images/money-bag-green.svg";
import Players from "../../../public/images/players-icon-green.svg";
import Wallet from "../../../public/images/wallet--money-payment-finance-wallet.svg";
import CancelIcon from "../../../public/images/x-icon.svg";

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
      fullName: session?.user.name!,
      username: session?.user.username!,
      image: session?.user.image!,
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
        <div className="fixed left-0 top-0 z-50 flex h-screen w-screen items-start justify-center bg-black md:items-center md:bg-black/90">
          {/* Content */}
          <form
            onSubmit={(e) => handleWagerSubmit(e, sessionData)}
            className="relative flex h-screen w-[864px] flex-col gap-6 overflow-y-auto rounded-sm bg-[#0F1923] pt-8 md:max-h-[800px] md:min-h-[602px]"
            id="wager-modal"
          >
            <div className="flex flex-col gap-[220px] px-6 md:flex-row md:gap-6">
              <div className="flex w-full items-center justify-between md:hidden md:justify-start">
                <div className="text-2xl font-bold sm:text-4xl">
                  Guess the Price
                </div>
                <button onClick={showWagerModal}>
                  <Image
                    src={CancelIcon}
                    width={20}
                    height={20}
                    alt=""
                    className="h-[20px] w-[20px]"
                  />
                </button>
              </div>
              <Image
                src={image}
                width={360}
                height={173}
                alt="fray car"
                className="aspect-3/4 absolute left-0 right-0 top-[90px] h-[172px] w-full object-cover md:static md:aspect-auto md:h-[136px] md:w-[136px]"
              />
              <div className="text-3xl md:ml-6 md:mt-0">
                <div className="font-bold">
                  {make} {model}
                </div>
                <div className="mt-4 grid gap-2">
                  <div className="grids-cols-1 grid gap-2 text-sm md:grid-cols-2">
                    <div className="flex items-center">
                      <Image
                        src={DollarIcon}
                        width={14}
                        height={14}
                        alt=""
                        className="h-[14px] w-[14px]"
                      />
                      <div className="ml-2 flex flex-row gap-2 text-sm">
                        <span className="opacity-80">Current Bid:</span>
                        <span className="font-bold text-[#49C742]">
                          ${price}
                        </span>
                        <span className="md:hidden">{`(${bids} bids)`}</span>
                      </div>
                    </div>
                    <div className="hidden items-center md:flex">
                      <Image
                        src={HashtagIcon}
                        width={14}
                        height={14}
                        alt=""
                        className="h-[14px] w-[14px]"
                      />
                      <div className="ml-2 text-sm">
                        <span className="opacity-80">Bids:</span>
                        <span className="ml-2 font-bold">{bids}</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                    <div className="flex items-center">
                      <Image
                        src={CalendarIcon}
                        width={14}
                        height={14}
                        alt=""
                        className="h-[14px] w-[14px]"
                      />
                      <div className="ml-2 text-sm">
                        <span className="opacity-80">Ending:</span>
                        <span className="ml-2 font-bold">{ending}</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Image
                        src={HourGlassIcon}
                        width={14}
                        height={14}
                        alt=""
                        className="h-[14px] w-[14px]"
                      />
                      <div className="ml-2 text-sm">
                        <span className="opacity-80">Time Left:</span>
                        <span className="ml-2 font-bold text-[#C2451E]">{`${timerValues.days}:${timerValues.hours}:${timerValues.minutes}:${timerValues.seconds}`}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Image
                      src={Wallet}
                      width={14}
                      height={14}
                      alt="wallet icon"
                      className="h-3.5 w-3.5"
                    />
                    <div className="ml-2 text-sm">
                      <span className="opacity-80">Wallet Balance:</span>
                      <span className="ml-2 font-bold">
                        $
                        {walletBalance % 1 === 0
                          ? walletBalance.toLocaleString()
                          : walletBalance.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <hr className="border-t-[#1b252e]" />
            <div className="flex flex-col gap-3 px-6">
              <label className="text-lg">How much will this sell for?</label>
              <div className="relative flex items-center rounded">
                <div className="w-lg absolute left-3 top-[50%] z-20 h-auto -translate-y-[50%] text-gray-500">
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
                    const inputValue = (event.target as HTMLInputElement).value;
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
                  className="w-full rounded bg-white/5 py-3 pl-8 pr-3 outline-[6px] outline-[#273039] focus:border-white/10 focus:bg-white focus:text-black focus:outline"
                  onChange={handleWagerInputChange}
                />
                {invalidPrice && (
                  <div className="absolute -bottom-5 text-sm font-medium text-red-500">
                    *Invalid input. Please enter numeric values only.
                  </div>
                )}
                {wagerAmountAlreadyExists && (
                  <div className="absolute -bottom-5 text-sm font-medium text-red-500">
                    *This wager amount has already been used for this auction.
                    Please enter a different one.
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-3 px-6">
              <label className="text-lg">Wager</label>
              <div className="relative flex items-center rounded">
                <div className="w-lg absolute left-3 top-[50%] z-20 h-auto -translate-y-[50%] text-gray-500">
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
                    const inputValue = (event.target as HTMLInputElement).value;
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
                  className="w-full rounded bg-white/5 py-3 pl-8 pr-3 opacity-50 outline-[6px] outline-[#273039] focus:border-white/10 focus:bg-white focus:text-black focus:outline"
                  onChange={handleWagerInputChange}
                />
                {invalidWager && (
                  <div className="absolute -bottom-5 text-sm font-medium text-red-500">
                    *Invalid input. Please enter numeric values only.
                  </div>
                )}
              </div>
              {!isWagerValid && (
                <div className="mt-2 text-sm text-red-500">
                  {wagerErrorMessage}
                  <Link href="/payment">
                    <a className="text-white hover:underline">
                      Top-up your wallet
                    </a>
                  </Link>
                </div>
              )}
            </div>
            <div className="mx-6 grid grid-cols-1 gap-4 rounded bg-[#49C74233] px-4 px-6 py-3 text-lg text-[#49C742] md:grid-cols-2">
              <div className="flex items-center gap-2">
                <Image
                  src={MoneyBag}
                  width={32}
                  height={32}
                  alt="money bag"
                  className="h-[32px] w-[32px]"
                />
                <div className="">
                  <div className="text-xs">POTENTIAL PRIZE</div>
                  <div className="font-bold">
                    ${prize ? new Intl.NumberFormat().format(prize) : " --"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Image
                  src={Players}
                  width={32}
                  height={32}
                  alt="money bag"
                  className="h-[32px] w-[32px]"
                />
                <div className="">
                  <div className="text-xs">PLAYERS</div>
                  <div className="font-bold">{players_num}</div>
                </div>
              </div>
            </div>
            <div className="relative flex h-auto w-full flex-col items-center justify-between bg-white/5 px-6 pb-6 pt-8 md:absolute md:bottom-0 md:left-0 md:flex-row">
              <button
                className="hidden md:block"
                onClick={showWagerModal}
                type="button"
              >
                CANCEL
              </button>
              {insufficientFunds && (
                <div className="absolute top-2 text-sm font-medium text-red-500 md:static md:text-base">
                  <span className="hidden md:inline-block">✕</span> Insufficient
                  funds. Top up your wallet to continue.
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
