"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { TournamentsListCard } from "../../components/card";
import Image from "next/image";
import TournamentsCard from "@/app/components/tournaments_card";
import Link from "next/link";

import DollarIcon from "../../../../public/images/dollar.svg";
import CalendarIcon from "../../../../public/images/calendar-icon.svg";
import HashtagIcon from "../../../../public/images/hash-02.svg";
import PlayersIcon from "../../../../public/images/users-01.svg";
import HourGlassIcon from "../../../../public/images/hour-glass.svg";
import PrizeIcon from "../../../../public/images/monetization-browser-bag.svg";

import ArrowDown from "../../../../public/images/arrow-down.svg";
import DiagonalLines from "../../../../public/images/green-diagonal.svg";
import TransitionPattern from "../../../../public/images/transition-pattern.svg";
import BringATrailerLogo from "../../../../public/images/bring-a-trailer-logo.svg";
import CarFaxLogo from "../../../../public/images/show-me-carfax.svg";
import WatchListIcon from "../../../../public/images/watchlist-icon.svg";
import ThropyIconBlue from "../../../../public/images/thropy-blue-big.svg";
import CarsImage from "../../../../public/images/cars-icon.svg";
import CarIcon from "../../../../public/images/car-01.svg";
import CommentsIcon from "../../../../public/images/comments-icon.svg";
import EyeIcon from "../../../../public/images/eye-on.svg";
import TelescopeIcon from "../../../../public/images/telescope-sharp.svg";
import CheckIcon from "../../../../public/images/check-black.svg";

import AvatarOne from "../../../../public/images/avatar-one.svg";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { TimerProvider, useTimer } from "@/app/_context/TimerContext";
import CarImageModal from "@/app/components/car_image_modal";
import {
  getAuctionsByTournamentId,
  getLimitedTournaments,
  getTournamentPointsByTournamentId,
} from "@/lib/data";
dayjs.extend(relativeTime);

interface TournamentButtonsI {
  toggleTournamentWagerModal: () => void;
  buyInFee?: number;
  alreadyJoined?: boolean;
  buyInEnded: boolean;
  tournamentID: string;
  tournamentImages: string[];
  tournamentEnded: boolean;
}

interface TitleSingleCarContainerProps {
  year: string;
  make: string;
  model: string;
  current_bid: string;
  bids_num: number;
  ending_date: string;
  deadline: Date | string;
  players_num: number;
  prize: string;
  pot: number;
  comments: number;
  views: number;
  watchers: number;
}

export const TournamentButtons: React.FC<TournamentButtonsI> = ({
  toggleTournamentWagerModal,
  buyInFee,
  alreadyJoined,
  buyInEnded,
  tournamentID,
  tournamentImages,
  tournamentEnded,
}) => {
  const [isWatching, setIsWatching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const storedWatchStatus = localStorage.getItem(
      `watchStatus_${tournamentID}`
    );
    if (storedWatchStatus) {
      setIsWatching(true);
    }
  }, [tournamentID]);

  const updateWatchlist = async (add: boolean) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/myWatchlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tournamentID,
          tournamentImages,
          action: add ? "add_tournament" : "remove_tournament",
        }),
      });

      const data = await response.json();
      console.log(data.message);
      setIsLoading(false);
      return data.message;
    } catch (error) {
      console.error("Error while updating watchlist:", error);
      setIsLoading(false);
      return null;
    }
  };

  const handleWatchClick = async () => {
    if (!session) {
      router.push("/create_account");
      return;
    }

    const newWatchStatus = !isWatching;
    setIsWatching(newWatchStatus);

    if (newWatchStatus) {
      const message = await updateWatchlist(true);
      if (message) {
        localStorage.setItem(`watchStatus_${tournamentID}`, "watched");
      }
    } else {
      const message = await updateWatchlist(false);
      if (message) {
        localStorage.removeItem(`watchStatus_${tournamentID}`);
      }
    }
  };

  return (
    <div className="tw-flex tw-gap-4">
      <button
        className={`btn-transparent-white tw-flex tw-items-center tw-transition-all`}
        onClick={handleWatchClick}
      >
        <Image
          src={WatchListIcon}
          width={20}
          height={20}
          alt={isWatching ? "Checked" : "Watch"}
          className={`tw-w-5 tw-h-5 tw-mr-2 ${
            isWatching ? "scale-animation is-watching" : "scale-animation"
          }`}
        />
        {isWatching ? "WATCHING" : "WATCH"}
      </button>
      {tournamentEnded ? (
        <button disabled className="btn-yellow hover:tw-bg-[#f2ca16]">
          ENDED 🏆
        </button>
      ) : buyInEnded ? (
        <button
          disabled
          className="tw-flex tw-items-center tw-px-3.5 tw-py-2.5 tw-gap-2 tw-text-[#0f1923] tw-bg-white tw-font-bold tw-rounded"
        >
          Buy-in period has ended
        </button>
      ) : alreadyJoined ? (
        <button
          type="button"
          disabled
          className="tw-flex tw-items-center tw-px-3.5 tw-py-2.5 tw-gap-2 tw-text-[#0f1923] tw-bg-white tw-font-bold tw-rounded"
        >
          JOINED{" "}
          <Image
            src={CheckIcon}
            alt=""
            className="tw-border-2 tw-border-[#0f1923] tw-rounded-full tw-p-[1.5px] tw-w-5 tw-h-5 black-check-filter"
          />
        </button>
      ) : (
        <button
          className="btn-yellow"
          onClick={() => {
            if (!session) {
              router.push("/create_account");
            } else {
              document.body.classList.add("stop-scrolling");
              toggleTournamentWagerModal();
            }
          }}
        >
          BUY-IN FOR ${buyInFee}
        </button>
      )}
    </div>
  );
};

export const TitleSingleCarContainer: React.FC<
  TitleSingleCarContainerProps
> = ({
  year,
  make,
  model,
  current_bid,
  bids_num,
  ending_date,
  deadline,
  players_num,
  prize,
  pot,
  comments,
  views,
  watchers,
}) => {
  const timerValues = useTimer();
  return (
    <div className=" tw-flex tw-flex-col tw-flex-grow tw-w-auto">
      <div className="title-section-marker tw-flex tw-text-3xl md:tw-text-5xl tw-font-bold">
        {year} {make} {model}
      </div>
      <div className="info-section-marker tw-flex tw-flex-col md:tw-flex-row tw-mt-4">
        <div className="tw-w-[280px]">
          <div className="tw-flex tw-items-center">
            <div>
              <Image
                src={DollarIcon}
                width={20}
                height={20}
                alt="dollar"
                className="tw-w-5 tw-h-5  tw-mr-2"
              />
            </div>
            <div className="tw-opacity-80 tw-flex">
              Current Bid:
              <span className="tw-text-[#49C742] tw-font-bold tw-ml-2">{`$ ${String(
                current_bid
              )}`}</span>
              <span className="tw-block md:tw-hidden tw-ml-2">{`(${bids_num} bids)`}</span>
            </div>
          </div>
          <div className="tw-flex tw-mt-0 md:tw-mt-1 tw-items-center">
            <div>
              <Image
                src={CalendarIcon}
                width={20}
                height={20}
                alt="calendar"
                className="tw-w-5 tw-h-5  tw-mr-2"
              />
            </div>
            <span className="tw-opacity-80">
              Ending: <span className="tw-font-bold">{ending_date}</span>
            </span>
          </div>
        </div>
        <div className="right-section-marker">
          <div className="tw-flex tw-flex-col md:tw-flex-row">
            <div className="tw-flex tw-w-[270px] tw-items-center">
              <div>
                <Image
                  src={HourGlassIcon}
                  width={20}
                  height={20}
                  alt="calendar"
                  className="tw-w-5 tw-h-5  tw-mr-2"
                />
              </div>
              <span className="tw-opacity-80">
                Time Left:{" "}
                {new Date(deadline) < new Date() ? (
                  <span className="tw-font-bold tw-text-[#C2451E]">
                    Ended {dayjs(deadline).fromNow()}
                  </span>
                ) : (
                  <span className="tw-font-bold tw-text-[#C2451E]">{`${timerValues.days}:${timerValues.hours}:${timerValues.minutes}:${timerValues.seconds}`}</span>
                )}
              </span>
            </div>
            <div className="tw-flex tw-items-center">
              <div>
                <Image
                  src={PlayersIcon}
                  width={20}
                  height={20}
                  alt="calendar"
                  className="tw-w-5 tw-h-5  tw-mr-2"
                />
              </div>
              <span className="tw-opacity-80">
                Players: <span className="tw-font-bold ">{players_num}</span>
              </span>
            </div>
          </div>
          <div className="tw-flex-col md:tw-flex-row tw-mt-0 md:tw-mt-1 tw-flex">
            <div className="tw-hidden md:tw-flex md:tw-w-[270px] tw-items-center">
              <div>
                <Image
                  src={HashtagIcon}
                  width={20}
                  height={20}
                  alt="calendar"
                  className="tw-w-5 tw-h-5  tw-mr-2"
                />
              </div>
              <span className="tw-opacity-80">
                Bids: <span className="tw-font-bold">{bids_num}</span>
              </span>
            </div>
            <div className="tw-flex tw-items-center">
              <div>
                <Image
                  src={PrizeIcon}
                  width={20}
                  height={20}
                  alt="calendar"
                  className="tw-w-5 tw-h-5 tw-mr-2"
                />
              </div>
              <span className="tw-opacity-80">
                Prize:{" "}
                <span className="tw-font-bold ">
                  ${pot ? new Intl.NumberFormat().format(pot || 0) : " --"}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="tw-opacity-80 md:tw-flex md:tw-mt-1">
        <div className="tw-flex tw-gap-2 tw-items-center tw-w-full tw-max-w-[280px]">
          <Image
            src={CommentsIcon}
            width={20}
            height={20}
            alt="calendar"
            className="tw-w-5 tw-h-5 tw-text-white"
          />
          <div>
            Comments:{" "}
            <span className="tw-font-bold">
              {comments ? new Intl.NumberFormat().format(comments) : "--"}{" "}
            </span>
          </div>
        </div>
        <div className="tw-flex tw-gap-2 tw-items-center  tw-w-full tw-max-w-[270px]">
          <Image
            src={EyeIcon}
            width={20}
            height={20}
            alt="calendar"
            className="tw-w-5 tw-h-5 tw-text-white"
          />
          <div>
            Views:{" "}
            <span className="tw-font-bold">
              {views ? new Intl.NumberFormat().format(views) : "--"}
            </span>
          </div>
        </div>
        <div className="tw-flex tw-gap-2 tw-items-center">
          <Image
            src={TelescopeIcon}
            width={20}
            height={20}
            alt="calendar"
            className="tw-w-5 tw-h-5 tw-text-white"
          />
          <div>
            Watchers:{" "}
            <span className="tw-font-bold">
              {watchers ? new Intl.NumberFormat().format(watchers) : "--"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface Tournaments {
  cars: number;
  _id: string;
  title: string;
  pot: number;
  endTime: Date;
  tournamentEndTime: Date;
  // Add other properties of the tournament here
}

export const TitleTournamentsList: React.FC<Tournaments> = ({
  title,
  cars,
  pot,
  endTime,
  tournamentEndTime,
}) => {
  const [buyInEnded, setBuyInEnded] = useState(false);
  const [tournamentEnded, setTournamentEnded] = useState(false);
  const formattedEndTime = new Date(tournamentEndTime).toUTCString();
  const timerValues = useTimer();

  useEffect(() => {
    const buyInEndDate = new Date(endTime);
    if (new Date() > buyInEndDate) {
      setBuyInEnded(true);
    }
    const tournamentEndDate = new Date(tournamentEndTime);
    if (new Date() > tournamentEndDate) {
      setTournamentEnded(true);
    }
  }, [endTime, tournamentEndTime]);

  return (
    <div className=" tw-flex tw-flex-col tw-flex-grow tw-w-auto">
      <Image
        src={CarsImage}
        width={144}
        height={32}
        alt="cars image"
        className="tw-w-36 tw-h-auto"
      />
      <div className="title-section-marker tw-flex tw-text-3xl md:tw-text-5xl tw-font-bold">
        {title}
      </div>
      <div className=" tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-mt-6">
        <div className="tw-flex">
          <div>
            <Image
              src={CarIcon}
              width={20}
              height={20}
              alt="calendar"
              className="tw-w-5 tw-h-5  tw-mr-2"
            />
          </div>
          <span className="tw-opacity-80">
            Cars:{" "}
            <span className="tw-font-bold">
              {cars}
              {" cars"}
            </span>
          </span>
        </div>
        <div className="tw-flex">
          <div>
            <Image
              src={HourGlassIcon}
              width={20}
              height={20}
              alt="calendar"
              className="tw-w-5 tw-h-5  tw-mr-2"
            />
          </div>
          <span className="tw-opacity-80">
            Buy-in Ends:{" "}
            {buyInEnded ? (
              <span className="tw-font-bold tw-text-[#C2451E]">
                Ended {dayjs(endTime).fromNow()}
              </span>
            ) : (
              <span className="tw-font-bold tw-text-[#C2451E]">
                {timerValues.days}:{timerValues.hours}:{timerValues.minutes}:
                {timerValues.seconds}
              </span>
            )}
          </span>
        </div>
        <div className="tw-flex tw-mt-0 md:tw-mt-1">
          <div>
            <Image
              src={CalendarIcon}
              width={20}
              height={20}
              alt="calendar"
              className="tw-w-5 tw-h-5  tw-mr-2"
            />
          </div>
          <span className="tw-opacity-80">
            Tournament Ends:{" "}
            {tournamentEnded ? (
              <span className="tw-font-bold">
                Ended {dayjs(tournamentEndTime).fromNow()}
              </span>
            ) : (
              <span className="tw-font-bold">{formattedEndTime}</span>
            )}
          </span>
        </div>
        <div className="tw-flex">
          <div>
            <Image
              src={PrizeIcon}
              width={20}
              height={20}
              alt="calendar"
              className="tw-w-5 tw-h-5 tw-mr-2"
            />
          </div>
          <span className="tw-opacity-80">
            Prize:{" "}
            <span className="tw-font-bold ">
              {" "}
              $
              {pot
                ? pot % 1 === 0
                  ? pot.toLocaleString()
                  : pot.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                : "--"}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

interface Auction {
  auction_id: string;
  description: string;
  image: string;
  tournamentID: string;
  attributes: any[];
}

interface TournamentListI {
  buyInFee?: number;
  toggleTournamentWagerModal: () => void;
  auctionData: Auction[];
  alreadyJoined: boolean;
  tournamentID: string;
  tournamentEnded: boolean;
}

export const TournamentsList: React.FC<TournamentListI> = ({
  buyInFee,
  toggleTournamentWagerModal,
  auctionData,
  alreadyJoined,
  tournamentID,
  tournamentEnded,
}) => {
  const router = useRouter();

  return (
    <div className="tw-mt-8 md:tw-mt-16">
      <div className="tw-text-3xl tw-font-bold">Cars in Tournament</div>
      <div className="tw-flex tw-flex-col">
        {auctionData.map((item, index) => (
          <Link
            href={`/tournaments/${tournamentID}/${item.auction_id}/`}
            key={index}
            className="hover:tw-cursor-pointer"
          >
            <TimerProvider deadline={item.attributes[12].value}>
              <TournamentsListCard
                index={index}
                auction_id={item.auction_id}
                img={item.image}
                hammer_price={item.attributes[0].value}
                year={item.attributes[1].value}
                make={item.attributes[2].value}
                model={item.attributes[3].value}
                description={item.description}
                deadline={item.attributes[12].value}
              />
            </TimerProvider>
          </Link>
        ))}
      </div>
      {alreadyJoined || tournamentEnded ? null : (
        <button
          className="btn-yellow tw-w-full tw-mt-8"
          onClick={() => {
            document.body.classList.add("stop-scrolling");
            toggleTournamentWagerModal();
          }}
        >
          BUY-IN FOR ${buyInFee}
        </button>
      )}
    </div>
  );
};

interface PhotosLayoutProps {
  images_list: { placing: number; src: string }[];
  img: string;
  showCarImageModal: boolean;
  toggleModal: () => void;
}
export const PhotosLayout: React.FC<PhotosLayoutProps> = ({
  images_list,
  img,
  showCarImageModal,
  toggleModal,
}) => {
  return (
    <div className=" tw-my-8">
      <CarImageModal
        isOpen={showCarImageModal}
        onClose={toggleModal}
        image={images_list}
      />
      <img
        onClick={toggleModal}
        src={img}
        width={832}
        height={520}
        alt="car"
        className="tw-w-full tw-max-h-[520px] tw-object-cover tw-rounded tw-aspect-auto tw-cursor-pointer"
      />
      <div className="tw-grid tw-grid-cols-4 tw-gap-2 tw-mt-2 tw-w-full tw-h-auto">
        <img
          src={images_list[0].src}
          width={202}
          height={120}
          alt="car"
          className="tw-w-full tw-max-h-[120px] tw-object-cover tw-rounded tw-aspect-auto"
        />
        <img
          src={images_list[1].src}
          width={202}
          height={120}
          alt="car"
          className="tw-w-full tw-max-h-[120px] tw-object-cover tw-rounded tw-aspect-auto"
        />
        <img
          src={images_list[2].src}
          width={202}
          height={120}
          alt="car"
          className="tw-w-full tw-max-h-[120px] tw-object-cover tw-rounded tw-aspect-auto"
        />
        <div className="tw-relative tw-cursor-pointer" onClick={toggleModal}>
          <img
            src={images_list[3].src}
            width={202}
            height={120}
            alt="car"
            className="tw-w-full tw-max-h-[120px] tw-object-cover tw-opacity-40 tw-rounded tw-aspect-auto"
          />
          <div className="tw-absolute tw-flex tw-z-20 tw-left-1/2 tw-translate-x-[-50%] tw-top-[50%] tw-translate-y-[-50%]">
            {images_list.length + 1}{" "}
            <span className="tw-hidden md:tw-block tw-ml-1">photos</span>
            <span className="tw-block md:tw-hidden">+</span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ArticleSectionProps {
  description: string[];
  images_list: { placing: number; src: string }[];
  toggleTournamentWagerModal: () => void;
  alreadyJoined: boolean;
  tournamentEnded: boolean;
}

export const ArticleSection: React.FC<ArticleSectionProps> = ({
  toggleTournamentWagerModal,
  description,
  images_list,
  alreadyJoined,
  tournamentEnded,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  return (
    <div className="tw-flex tw-flex-col tw-mt-8 md:tw-mt-16 tw-w-full">
      <div className="tw-w-full tw-h-[120px] md:tw-h-auto tw-ellipsis tw-overflow-hidden">
        {description[0]}
      </div>
      {showDetails &&
        images_list.map((image) => (
          <div
            key={"image" + image.placing}
            className="tw-grid tw-gap-8 md:tw-gap-16"
          >
            <Image
              src={image.src}
              width={832}
              height={500}
              alt="car"
              className="tw-w-full tw-h-auto tw-object-cover tw-aspect-ratio-auto"
            />
            <div>{description[image.placing]}</div>
          </div>
        ))}
      <button
        className="btn-transparent-white tw-mt-16"
        onClick={() => setShowDetails((prev) => !prev)}
      >
        <span className="tw-w-full tw-flex tw-items-center tw-justify-center">
          VIEW MORE DETAILS
          <Image
            src={ArrowDown}
            width={20}
            height={20}
            alt="car"
            className="tw-w-[20px] tw-h-[20px] tw-ml-2"
          />
        </span>
      </button>
      {alreadyJoined || tournamentEnded ? null : (
        <button
          className="btn-yellow tw-mt-3"
          onClick={toggleTournamentWagerModal}
        >
          PLACE MY WAGER
        </button>
      )}
    </div>
  );
};

export const TournamentInfoSection = () => {
  return (
    <div>
      <div className="tw-p-6 tw-bg-[#172431] tw-rounded-lg">
        <Image
          src={ThropyIconBlue}
          width={68}
          height={68}
          alt="car"
          className="tw-w-[68px] tw-h-[68px]"
        />
        <div className="tw-text-2xl tw-font-bold tw-mt-6">
          What is a Tournament?
        </div>
        <div className="tw-my-4">
          Get more points the closer you are to the hammer price of a curated
          set of car auctions. Duis anim adipisicing minim nisi elit quis.
          Cillum ullamco qui dolore non incididunt incididunt non. Aute
          adipisicing et esse exercitation sunt irure proident enim eu esse
          nulla. Est excepteur est non. Adipisicing occaecat minim ex duis
          excepteur.
        </div>
        <div className="tw-text-[#42A0FF]">View Tournaments</div>
      </div>
    </div>
  );
};

interface TournamentWagerSectionI {
  toggleTournamentWagerModal: () => void;
  tournamentWagers: any[];
  alreadyJoined: boolean;
  tournamentEnded: boolean;
  auctionID?: string;
}

export const TournamentWagersSection: React.FC<TournamentWagerSectionI> = ({
  toggleTournamentWagerModal,
  tournamentWagers,
  alreadyJoined,
  tournamentEnded,
  auctionID,
}) => {
  const { data: session } = useSession();
  const [morePlayers, setMorePlayers] = useState(false);

  return (
    <div>
      <div className="tw-relative tw-pb-8 sm:tw-pb-0 tw-min-h-[180px]">
        <div className="tw-p-6 tw-w-full tw-h-auto">
          <div className="tw-mb-6">
            <div className="tw-flex tw-justify-between">
              <div className="tw-font-bold tw-text-[18px]">PLAYERS</div>
              <Image
                src={ArrowDown}
                width={20}
                height={20}
                alt="arrow down"
                className="tw-w-5 tw-h-5"
              />
            </div>
            <div className="tw-text-[14px]">
              {tournamentWagers.length ? tournamentWagers.length : 0} Players
            </div>
          </div>
          <div>
            {morePlayers &&
              tournamentWagers.map((wager) => {
                return (
                  <div
                    key={wager._id}
                    className="tw-flex tw-items-center tw-py-2"
                  >
                    <div className="tw-flex">
                      <Image
                        src={wager.user.image ? wager.user.image : AvatarOne}
                        width={44}
                        height={44}
                        alt="dollar"
                        className="tw-w-[44px] tw-h-[44px] tw-mr-4 tw-rounded-full"
                      />
                      <div className="tw-text-sm ">
                        <div className="tw-font-bold">
                          {session?.user.id === wager.user._id
                            ? "You"
                            : wager.user.username}
                        </div>
                        <div className="tw-opacity-50">{`Joined ${dayjs(
                          wager.createdAt
                        ).fromNow()}`}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            {!morePlayers &&
              tournamentWagers.slice(0, 4).map((wager) => {
                return (
                  <div
                    key={wager._id}
                    className="tw-flex tw-items-center tw-py-2"
                  >
                    <div className="tw-flex">
                      <Image
                        src={wager.user.image ? wager.user.image : AvatarOne}
                        width={44}
                        height={44}
                        alt="dollar"
                        className="tw-w-[44px] tw-h-[44px] tw-mr-4 tw-rounded-full"
                      />
                      <div className="tw-text-sm ">
                        <div className="tw-font-bold">
                          {session?.user.id === wager.user._id
                            ? "You"
                            : wager.user.username}
                        </div>
                        <div className="tw-opacity-50">{`Joined ${dayjs(
                          wager.createdAt
                        ).fromNow()}`}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
          {tournamentWagers.length > 4 ? (
            morePlayers ? (
              <button
                className="btn-transparent-white tw-w-full tw-mt-2"
                onClick={() => setMorePlayers(false)}
              >
                Less Players...
              </button>
            ) : (
              <button
                className="btn-transparent-white tw-w-full tw-mt-2"
                onClick={() => setMorePlayers(true)}
              >
                More Players...
              </button>
            )
          ) : null}

          {alreadyJoined || tournamentEnded ? null : (
            <button
              onClick={() => {
                document.body.classList.add("stop-scrolling");
                toggleTournamentWagerModal();
              }}
              className={`btn-yellow tw-w-full ${
                tournamentWagers.length > 4 ? "tw-mt-2" : "tw-mt-6"
              }`}
            >
              JOIN TOURNAMENT
            </button>
          )}
        </div>
        {/* Background and button*/}
        <div className="tw-absolute tw-top-0 tw-bottom-0 tw-z-[-1] tw-w-full">
          <Image
            src={TransitionPattern}
            width={288}
            height={356}
            alt="pattern"
            className="tw-w-full tw-h-auto tw-rounded-lg tw-mr-1 tw-object-cover"
          />
          <div className="tw-w-full tw-h-full tw-rounded-lg tw-absolute tw-top-0 tw-bg-[#156CC333]"></div>
        </div>
      </div>
    </div>
  );
};

export const DetailsSection = (props: any) => {
  return (
    <div className="tw-bg-[#172431] tw-p-6 tw-rounded-lg">
      <div className="tw-flex tw-justify-between tw-py-2">
        <div className="tw-font-bold tw-text-[18px]">DETAILS</div>
        <Image
          src={ArrowDown}
          width={20}
          height={20}
          alt="arrow down"
          className="tw-w-[20px] tw-h-[20px]"
        />
      </div>
      <div>
        <hr className="tw-border-white tw-opacity-5" />
        <div className="tw-flex tw-justify-between tw-py-2">
          <div className="tw-opacity-50">Auction</div>
          <div className="tw-flex tw-items-center ">
            {props.website}
            <Image
              src={BringATrailerLogo}
              width={32}
              height={32}
              alt="bring a trailer logo"
              className="tw-w-[32px] tw-h-[32px] tw-ml-2"
            />
          </div>
        </div>
        <hr className="tw-border-white tw-opacity-5" />
        <div className="tw-flex tw-justify-between tw-py-2">
          <div className="tw-opacity-50">Make</div>
          <div className="tw-underline tw-underline-offset-4">{props.make}</div>
        </div>
        <hr className="tw-border-white tw-opacity-5" />
        <div className="tw-flex tw-justify-between tw-py-2">
          <div className="tw-opacity-50">Model</div>
          <div>{props.model}</div>
        </div>
        <hr className="tw-border-white tw-opacity-5" />
        <div className="tw-flex tw-justify-between tw-py-2">
          <div className="tw-opacity-50">Seller</div>
          <div className="tw-flex tw-items-center">
            {props.seller}
            <Image
              src={BringATrailerLogo}
              width={32}
              height={32}
              alt="bring a trailer logo"
              className="tw-w-[32px] tw-h-[32px] tw-ml-2"
            />
          </div>
        </div>
        <hr className="tw-border-white tw-opacity-5" />
        <div className="tw-flex tw-justify-between tw-py-2">
          <div className="tw-opacity-50">Location</div>
          <div>{props.location}</div>
        </div>
        <hr className="tw-border-white tw-opacity-5" />
        <div className="tw-flex tw-justify-between tw-py-2">
          <div className="tw-opacity-50">Mileage</div>
          <div>{props.mileage}</div>
        </div>
        <hr className="tw-border-white tw-opacity-5" />
        <div className="tw-flex tw-justify-between tw-py-2">
          <div className="tw-opacity-50">Listing Type</div>
          <div>{props.listing_type}</div>
        </div>
        <hr className="tw-border-white tw-opacity-5" />
        <div className="tw-flex tw-justify-between tw-py-2">
          <div className="tw-opacity-50">Lot #</div>
          <div>{props.lot_num}</div>
        </div>
        <hr className="tw-border-white tw-opacity-5" />
        <div className="tw-py-2">
          <div className="tw-opacity-50">Listing Details</div>
          <ul className="tw-list-disc tw-list-inside tw-my-2 tw-pl-2">
            {props.listing_details &&
              props.listing_details.map((item: string) => {
                return <li key={item}>{item}</li>;
              })}
          </ul>
        </div>
        <hr className="tw-border-white tw-opacity-5" />
        <div className="tw-flex tw-justify-between tw-py-2">
          <div className="tw-opacity-50">Photos</div>
          <Link href={"/"}>
            <span className="tw-underline tw-underline-offset-4">
              88 photos
            </span>
          </Link>
        </div>
        <Image
          src={CarFaxLogo}
          width={130}
          height={44}
          alt="bring a trailer logo"
          className="tw-w-[130px] tw-h-[44px] tw-my-4"
        />
      </div>
    </div>
  );
};

interface Tournaments {
  _id: string;
  title: string;
  pot: number;
  endTime: Date;
  // Add other properties of the tournament here
}

interface Auctions {
  _id: string;
  image: string;
}

interface AuctionScore {
  auctionID: string;
  score: number;
}
interface TournamentPoints {
  player: string;
  points: number;
  auctionScores: AuctionScore[];
}

export const TournamentsYouMightLike = () => {
  const [tournamentsData, setTournamentsData] = useState<Tournaments[]>([]);
  const [auctionData, setAuctionData] = useState<Record<string, Auctions[]>>(
    {}
  );
  const [playerLimit, setPlayerLimit] = useState(3);
  const [tournamentPointsData, setTournamentPointsData] = useState<
    TournamentPoints[]
  >([]);

  useEffect(() => {
    const fetchTournamentsData = async () => {
      try {
        const res = await getLimitedTournaments(3);
        const tournamentsArray = res.tournaments;
        setTournamentsData(tournamentsArray);

        const tournamentPointsPromises = tournamentsArray.map(
          (tournament: { _id: string }) =>
            getTournamentPointsByTournamentId(tournament._id, playerLimit)
        );
        const tournamentPointsArray = await Promise.all(
          tournamentPointsPromises
        );
        setTournamentPointsData(tournamentPointsArray);
        return;
      } catch (error) {
        console.error("Failed to fetch tournament data:", error);
      }
    };
    fetchTournamentsData();
  }, [playerLimit]);

  useEffect(() => {
    const fetchAuctionData = async () => {
      try {
        const auctionsByTournament: Record<string, Auctions[]> = {};
        for (const tournament of tournamentsData) {
          const auctionDataForTournament = await getAuctionsByTournamentId(
            tournament._id
          );
          auctionsByTournament[tournament._id] = auctionDataForTournament;
        }
        setAuctionData(auctionsByTournament);
      } catch (error) {
        console.error("Failed to fetch auction data:", error);
      }
    };
    fetchAuctionData();
  }, [tournamentsData]);

  return (
    <div className="section-container tw-py-8 sm:tw-py-12 tw-mb-8  tw-mt-8 ">
      <header className="tw-max-w-[1312px]">
        <div className="tw-flex tw-justify-between tw-items-end">
          <div className="tw-flex tw-items-center">
            <Image
              src={DiagonalLines}
              width={40}
              height={40}
              alt="dollar"
              className="tw-w-10 tw-h-10"
            />
            <div className="tw-font-bold tw-text-2xl tw-w-[200px] sm:tw-w-auto sm:tw-text-3xl tw-ml-4">
              Tournaments You Might Like
            </div>
          </div>
          <div className="tw-text-[#49C742]">See All</div>
        </div>
      </header>

      <section className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-8 tw-mt-8">
        {tournamentsData &&
          tournamentsData.slice(0, 3).map((tournament, index) => {
            const imagesForTournament =
              auctionData[tournament._id]?.map((auction) => auction.image) ||
              [];
            const tournamentPoints = tournamentPointsData[index];
            return (
              <div key={tournament._id}>
                <TimerProvider deadline={tournament.endTime}>
                  <TournamentsCard
                    tournament_id={tournament._id}
                    pot={tournament.pot}
                    title={tournament.title}
                    deadline={tournament.endTime}
                    images={imagesForTournament}
                    tournamentPoints={tournamentPoints}
                  />
                </TimerProvider>
              </div>
            );
          })}
      </section>
    </div>
  );
};

export const TournamentWinnersSection = ({ winners }: any) => {
  const [userWon, setUserWon] = useState<any>(false);
  const { data: session } = useSession();

  useEffect(() => {
    winners.forEach((winner: any) => {
      if (session?.user.id === winner.userID) {
        setUserWon(winner);
      }
    });
  }, [winners, session]);

  return (
    <div className="tw-bg-[#156cc3] tw-p-6 tw-rounded-lg">
      <div className="tw-mb-6">
        <div className="tw-font-bold tw-text-lg tw-mb-1">WINNERS</div>
      </div>
      <div>
        {winners.map((winner: any, index: number) => {
          return (
            <div
              key={winner.userID}
              className="tw-flex tw-justify-between tw-items-center tw-py-2"
            >
              <div className="tw-flex tw-gap-4 tw-items-center">
                <div className="tw-text-lg tw-opacity-30">{winner.rank}</div>
                <Image
                  src={winner.userImage ? winner.userImage : AvatarOne}
                  width={44}
                  height={44}
                  alt="arrow down"
                  className="tw-w-[44px] tw-h-[44px] tw-rounded-full"
                />
                <div>
                  <div className="tw-text-sm tw-font-bold">
                    {session?.user.id === winner.userID
                      ? "You"
                      : winner.username}{" "}
                    🎉
                  </div>
                  <div className="tw-text-xs tw-inline-block tw-bg-[#42a0ff] tw-rounded-full tw-py-0.5 tw-px-2 tw-font-medium">
                    Won $
                    {winner.prize % 1 === 0
                      ? winner.prize.toLocaleString()
                      : winner.prize.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {userWon && (
        <div className="tw-flex tw-gap-6 tw-py-4 tw-px-6 tw-items-center tw-bg-[#2c7bc9] tw-rounded-[10px] tw-mt-6">
          <div className="tw-text-[32px]">🏆</div>
          <div>
            <div className="tw-font-bold">Congratulations!</div>
            <div className="tw-text-sm tw-opacity-70 tw-leading-5">
              You won $
              {userWon.prize % 1 === 0
                ? userWon.prize.toLocaleString()
                : userWon.prize.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
              in this game. The amount has been added to your wallet. Hope to
              see you in more games.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const TournamentLeadboard = ({ tournamentPointsData }: any) => {
  const { data: session } = useSession();

  const sortedTournamentPointsData = tournamentPointsData.sort(
    (a: any, b: any) => {
      const aPoints = Array.isArray(a.auctionScores)
        ? a.auctionScores.reduce(
            (acc: number, scoreObj: any) => acc + scoreObj.score,
            0
          )
        : 0;
      const bPoints = Array.isArray(b.auctionScores)
        ? b.auctionScores.reduce(
            (acc: number, scoreObj: any) => acc + scoreObj.score,
            0
          )
        : 0;
      return aPoints - bPoints;
    }
  );

  return (
    <div>
      <div className="tw-relative tw-pb-8 sm:tw-pb-0 tw-min-h-[180px]">
        <div className="tw-p-6 tw-w-full tw-h-auto">
          <div className="tw-mb-6">
            <div className="tw-flex tw-justify-between">
              <div className="tw-font-bold tw-text-[18px]">LEADERBOARD</div>
              <Image
                src={ArrowDown}
                width={20}
                height={20}
                alt="arrow down"
                className="tw-w-5 tw-h-5"
              />
            </div>
            <div className="tw-text-[14px]">Lowest point wins</div>
          </div>
          <div>
            {sortedTournamentPointsData &&
              sortedTournamentPointsData.map((item: any, index: number) => {
                return (
                  <div
                    key={item._id}
                    className="tw-flex tw-justify-between tw-items-center tw-py-2"
                  >
                    <div className="tw-flex tw-justify-between tw-items-center tw-gap-4">
                      <div className="tw-text-lg tw-opacity-30">
                        {index + 1}
                      </div>
                      <Image
                        src={item.user.image ? item.user.image : AvatarOne}
                        width={44}
                        height={44}
                        alt="dollar"
                        className="tw-w-[44px] tw-h-[44px] tw-rounded-full"
                      />
                      <div className="tw-text-sm">
                        <div className="tw-font-bold">
                          {session?.user._id === item.user._id
                            ? "You"
                            : item.user.username}
                        </div>
                      </div>
                    </div>
                    <div className="tw-w-auto tw-px-6 tw-py-1 tw-text-sm tw-font-bold tw-text-black tw-h-auto tw-bg-yellow-400 tw-rounded-md">
                      {Array.isArray(item.auctionScores) &&
                      item.auctionScores.length > 0
                        ? `${item.auctionScores.reduce(
                            (acc: number, scoreObj: { score: number }) =>
                              acc + scoreObj.score,
                            0
                          )} pts.`
                        : "0 pts."}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
        {/* Background and button*/}
        <div className="tw-absolute tw-top-0 tw-bottom-0 tw-z-[-1] tw-w-full">
          <Image
            src={TransitionPattern}
            width={288}
            height={356}
            alt="pattern"
            className="tw-w-full tw-h-auto tw-rounded-lg tw-mr-1 tw-object-cover"
          />
          <div className="tw-w-full tw-h-full tw-rounded-lg tw-absolute tw-top-0 tw-bg-[#41a0ff62]"></div>
        </div>
      </div>
    </div>
  );
};
