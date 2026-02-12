"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

import { Auction } from "../(pages)/tournaments/[tournament_id]/oldpage";
import CalendarGreen from "../../../public/images/calendar-icon-green.svg";
import Dollar from "../../../public/images/dollar.svg";
import HourGlass from "../../../public/images/hour-glass.svg";
import MoneyBag from "../../../public/images/money-bag-green.svg";
import CancelIcon from "../../../public/images/x-icon.svg";
import { TimerProvider, useTimer } from "../context/TimerContext";

interface TournamentWagerI {
  toggleTournamentWagerModal: () => void;
  handleInputs: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>, sessionData: any) => void;
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
    fullName: session?.user.name,
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
      const wagerModal = document.getElementById("tournament-wager-modal");
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
    <div className="fixed left-0 top-0 z-50 flex h-screen w-screen items-start justify-center bg-black md:items-center md:bg-black/90">
      <form
        onSubmit={(e) => handleSubmit(e, sessionData)}
        className="relative h-screen w-[864px] overflow-y-auto rounded-sm bg-[#0F1923] md:max-h-[800px] md:min-h-[602px]"
        id="tournament-wager-modal"
      >
        <div className="mb-6 flex items-center px-6 pt-6 sm:mb-1 sm:px-8 sm:pt-8">
          <div className="text-2xl font-bold">{tournamentData.title}</div>
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
              className="m-3 h-[24px] w-[24px] sm:hidden"
            />
          </button>
        </div>
        <div className="mb-6 px-6 text-base font-normal sm:px-8">
          Get more points the closer you are to the hammer price of a curated
          set of car auctions. Guess the price for each of the cars listed below
          and buy-in to lock in your wagers.{" "}
          <span className="text-[#49C742]">Learn more</span>
        </div>
        <div className="mx-6 mb-6 rounded bg-[#49C74233] px-4 py-3 font-bold text-[#49C742] sm:mx-8 sm:flex sm:items-center">
          <div className="mb-4 flex items-center gap-2 sm:mb-0 sm:w-1/2">
            <Image
              src={MoneyBag}
              width={32}
              height={32}
              alt="sedan"
              className="h-[32px] w-[32px]"
            />
            <div>
              <div className="text-xs font-semibold tracking-widest text-[#40ab3d]">
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
              className="h-[32px] w-[32px]"
            />
            <div>
              <div className="text-xs font-semibold tracking-widest text-[#40ab3d]">
                TOURNAMENT ENDS
              </div>
              <div className="text-lg">{formattedDateString}</div>
            </div>
          </div>
        </div>
        <div className="mb-[94px] px-6 sm:mb-0 sm:max-h-[488px] sm:overflow-y-auto sm:px-8">
          {auctionData.map((auction, index: number) => {
            return (
              <TimerProvider key={auction._id} deadline={auction.sort.deadline}>
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
        <div className="fixed bottom-0 z-30 w-full bg-[#172431] px-8 py-4 sm:static sm:flex sm:justify-between">
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
            className="w-full rounded bg-[#f2ca16] p-3 px-[43px] text-center font-bold text-[#0f1923] sm:w-auto"
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
    <div key={auction._id} className="sm:flex sm:justify-between sm:pb-4">
      <Link
        target="_blank"
        rel="noopener noreferrer"
        href={`/tournaments/${tournamentID}/${auction.auction_id}`}
        className="mb-2 flex items-center gap-4 sm:mb-0"
      >
        <Image
          src={auction.image}
          width={100}
          height={100}
          alt="sedan"
          className="h-[100px] w-[100px] rounded object-cover"
        />
        <div>
          <div className="mb-1 font-bold">
            {`${auction.attributes[1].value} ${auction.attributes[2].value} ${auction.attributes[3].value}`}
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Image
              src={Dollar}
              width={14}
              height={14}
              alt="sedan"
              className="h-[14px] w-[14px]"
            />
            <div className="text-[#cfd1d3]">Current Bid:</div>
            <div className="font-bold text-[#49C742]">
              ${new Intl.NumberFormat().format(auction.attributes[0].value)}
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Image
              src={HourGlass}
              width={14}
              height={14}
              alt="sedan"
              className="h-[14px] w-[14px]"
            />
            <div className="text-[#cfd1d3]">Time Left:</div>
            <div>{`${timerValues.days}:${timerValues.hours}:${timerValues.minutes}:${timerValues.seconds}`}</div>
          </div>
        </div>
      </Link>
      <div className="relative mb-4 flex items-center rounded sm:mb-0">
        <div className="w-lg absolute left-3 top-[50%] z-20 h-auto -translate-y-[50%] text-gray-500">
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
          className="w-full rounded bg-[#172431] p-3 pl-8 outline-[3px] outline-[#273039] focus:border-white/10 focus:bg-white focus:text-black focus:outline sm:outline-[6px]"
        />
      </div>
    </div>
  );
};
