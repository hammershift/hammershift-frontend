"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { TournamentsListCard } from "../../components/old_card";
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
  canceledTournament: boolean;
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
  canceledTournament,
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
    <div className="flex gap-4">
      <button
        className={`btn-transparent-white flex items-center transition-all`}
        onClick={handleWatchClick}
      >
        <Image
          src={WatchListIcon}
          width={20}
          height={20}
          alt={isWatching ? "Checked" : "Watch"}
          className={`w-5 h-5 mr-2 ${isWatching ? "scale-animation is-watching" : "scale-animation"
            }`}
        />
        {isWatching ? "WATCHING" : "WATCH"}
      </button>
      {canceledTournament ? (
        <button
          disabled
          className="flex items-center px-3.5 py-2.5 gap-2 text-[#0f1923] bg-white font-bold rounded"
        >
          Tournament Cancelled
        </button>
      ) : tournamentEnded ? (
        <button disabled className="btn-yellow hover:bg-[#f2ca16]">
          ENDED 🏆
        </button>
      ) : buyInEnded ? (
        <button
          disabled
          className="flex items-center px-3.5 py-2.5 gap-2 text-[#0f1923] bg-white font-bold rounded"
        >
          Buy-in period has ended
        </button>
      ) : alreadyJoined ? (
        <button
          type="button"
          disabled
          className="flex items-center px-3.5 py-2.5 gap-2 text-[#0f1923] bg-white font-bold rounded"
        >
          JOINED{" "}
          <Image
            src={CheckIcon}
            alt=""
            className="border-2 border-[#0f1923] rounded-full p-[1.5px] w-5 h-5 black-check-filter"
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
      <div className=" flex flex-col flex-grow w-auto">
        <div className="title-section-marker flex text-3xl md:text-5xl font-bold">
          {year} {make} {model}
        </div>
        <div className="info-section-marker flex flex-col md:flex-row mt-4">
          <div className="w-[280px]">
            <div className="flex items-center">
              <div>
                <Image
                  src={DollarIcon}
                  width={20}
                  height={20}
                  alt="dollar"
                  className="w-5 h-5  mr-2"
                />
              </div>
              <div className="opacity-80 flex">
                Current Bid:
                <span className="text-[#49C742] font-bold ml-2">{`$ ${String(
                  current_bid
                )}`}</span>
                <span className="block md:hidden ml-2">{`(${bids_num} bids)`}</span>
              </div>
            </div>
            <div className="flex mt-0 md:mt-1 items-center">
              <div>
                <Image
                  src={CalendarIcon}
                  width={20}
                  height={20}
                  alt="calendar"
                  className="w-5 h-5  mr-2"
                />
              </div>
              <span className="opacity-80">
                Ending: <span className="font-bold">{ending_date}</span>
              </span>
            </div>
          </div>
          <div className="right-section-marker">
            <div className="flex flex-col md:flex-row">
              <div className="flex w-[270px] items-center">
                <div>
                  <Image
                    src={HourGlassIcon}
                    width={20}
                    height={20}
                    alt="calendar"
                    className="w-5 h-5  mr-2"
                  />
                </div>
                <span className="opacity-80">
                  Time Left:{" "}
                  {new Date(deadline) < new Date() ? (
                    <span className="font-bold text-[#C2451E]">
                      Ended {dayjs(deadline).fromNow()}
                    </span>
                  ) : (
                    <span className="font-bold text-[#C2451E]">{`${timerValues.days}:${timerValues.hours}:${timerValues.minutes}:${timerValues.seconds}`}</span>
                  )}
                </span>
              </div>
              <div className="flex items-center">
                <div>
                  <Image
                    src={PlayersIcon}
                    width={20}
                    height={20}
                    alt="calendar"
                    className="w-5 h-5  mr-2"
                  />
                </div>
                <span className="opacity-80">
                  Players: <span className="font-bold ">{players_num}</span>
                </span>
              </div>
            </div>
            <div className="flex-col md:flex-row mt-0 md:mt-1 flex">
              <div className="hidden md:flex md:w-[270px] items-center">
                <div>
                  <Image
                    src={HashtagIcon}
                    width={20}
                    height={20}
                    alt="calendar"
                    className="w-5 h-5  mr-2"
                  />
                </div>
                <span className="opacity-80">
                  Bids: <span className="font-bold">{bids_num}</span>
                </span>
              </div>
              <div className="flex items-center">
                <div>
                  <Image
                    src={PrizeIcon}
                    width={20}
                    height={20}
                    alt="calendar"
                    className="w-5 h-5 mr-2"
                  />
                </div>
                <span className="opacity-80">
                  Prize:{" "}
                  <span className="font-bold ">
                    ${pot ? new Intl.NumberFormat().format(pot || 0) : " --"}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="opacity-80 md:flex md:mt-1">
          <div className="flex gap-2 items-center w-full max-w-[280px]">
            <Image
              src={CommentsIcon}
              width={20}
              height={20}
              alt="calendar"
              className="w-5 h-5 text-white"
            />
            <div>
              Comments:{" "}
              <span className="font-bold">
                {comments ? new Intl.NumberFormat().format(comments) : "--"}{" "}
              </span>
            </div>
          </div>
          <div className="flex gap-2 items-center  w-full max-w-[270px]">
            <Image
              src={EyeIcon}
              width={20}
              height={20}
              alt="calendar"
              className="w-5 h-5 text-white"
            />
            <div>
              Views:{" "}
              <span className="font-bold">
                {views ? new Intl.NumberFormat().format(views) : "--"}
              </span>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <Image
              src={TelescopeIcon}
              width={20}
              height={20}
              alt="calendar"
              className="w-5 h-5 text-white"
            />
            <div>
              Watchers:{" "}
              <span className="font-bold">
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
  description?: string;
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
    <div className=" flex flex-col flex-grow w-auto">
      <Image
        src={CarsImage}
        width={144}
        height={32}
        alt="cars image"
        className="w-36 h-auto"
      />
      <div className="title-section-marker flex text-3xl md:text-5xl font-bold">
        {title}
      </div>
      <div className=" grid grid-cols-1 md:grid-cols-2 mt-6">
        <div className="flex">
          <div>
            <Image
              src={CarIcon}
              width={20}
              height={20}
              alt="calendar"
              className="w-5 h-5  mr-2"
            />
          </div>
          <span className="opacity-80">
            Cars:{" "}
            <span className="font-bold">
              {cars}
              {" cars"}
            </span>
          </span>
        </div>
        <div className="flex">
          <div>
            <Image
              src={HourGlassIcon}
              width={20}
              height={20}
              alt="calendar"
              className="w-5 h-5  mr-2"
            />
          </div>
          <span className="opacity-80">
            Buy-in Ends:{" "}
            {buyInEnded ? (
              <span className="font-bold text-[#C2451E]">
                Ended {dayjs(endTime).fromNow()}
              </span>
            ) : (
              <span className="font-bold text-[#C2451E]">
                {timerValues.days}:{timerValues.hours}:{timerValues.minutes}:
                {timerValues.seconds}
              </span>
            )}
          </span>
        </div>
        <div className="flex mt-0 md:mt-1">
          <div>
            <Image
              src={CalendarIcon}
              width={20}
              height={20}
              alt="calendar"
              className="w-5 h-5  mr-2"
            />
          </div>
          <span className="opacity-80">
            Tournament Ends:{" "}
            {tournamentEnded ? (
              <span className="font-bold">
                Ended {dayjs(tournamentEndTime).fromNow()}
              </span>
            ) : (
              <span className="font-bold">{formattedEndTime}</span>
            )}
          </span>
        </div>
        <div className="flex">
          <div>
            <Image
              src={PrizeIcon}
              width={20}
              height={20}
              alt="calendar"
              className="w-5 h-5 mr-2"
            />
          </div>
          <span className="opacity-80">
            Prize:{" "}
            <span className="font-bold ">
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
    <div className="mt-8 md:mt-16">
      <div className="text-3xl font-bold">Cars in Tournament</div>
      <div className="flex flex-col">
        {auctionData.map((item, index) => (
          <Link
            href={`/tournaments/${tournamentID}/${item.auction_id}/`}
            key={index}
            className="hover:cursor-pointer"
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
          className="btn-yellow w-full mt-8"
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
    <div className=" my-8">
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
        className="w-full max-h-[520px] object-cover rounded aspect-auto cursor-pointer"
      />
      <div className="grid grid-cols-4 gap-2 mt-2 w-full h-auto">
        <img
          src={images_list[0].src}
          width={202}
          height={120}
          alt="car"
          className="w-full max-h-[120px] object-cover rounded aspect-auto"
        />
        <img
          src={images_list[1].src}
          width={202}
          height={120}
          alt="car"
          className="w-full max-h-[120px] object-cover rounded aspect-auto"
        />
        <img
          src={images_list[2].src}
          width={202}
          height={120}
          alt="car"
          className="w-full max-h-[120px] object-cover rounded aspect-auto"
        />
        <div className="relative cursor-pointer" onClick={toggleModal}>
          <img
            src={images_list[3].src}
            width={202}
            height={120}
            alt="car"
            className="w-full max-h-[120px] object-cover opacity-40 rounded aspect-auto"
          />
          <div className="absolute flex z-20 left-1/2 translate-x-[-50%] top-[50%] translate-y-[-50%]">
            {images_list.length + 1}{" "}
            <span className="hidden md:block ml-1">photos</span>
            <span className="block md:hidden">+</span>
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
    <div className="flex flex-col mt-8 md:mt-16 w-full">
      <div className="w-full h-[120px] md:h-auto ellipsis overflow-hidden">
        {description[0]}
      </div>
      {showDetails &&
        images_list.map((image) => (
          <div
            key={"image" + image.placing}
            className="grid gap-8 md:gap-16"
          >
            <Image
              src={image.src}
              width={832}
              height={500}
              alt="car"
              className="w-full h-auto object-cover aspect-ratio-auto"
            />
            <div>{description[image.placing]}</div>
          </div>
        ))}
      <button
        className="btn-transparent-white mt-16"
        onClick={() => setShowDetails((prev) => !prev)}
      >
        <span className="w-full flex items-center justify-center">
          VIEW MORE DETAILS
          <Image
            src={ArrowDown}
            width={20}
            height={20}
            alt="car"
            className="w-[20px] h-[20px] ml-2"
          />
        </span>
      </button>
      {alreadyJoined || tournamentEnded ? null : (
        <button
          className="btn-yellow mt-3"
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
      <div className="p-6 bg-[#172431] rounded-lg">
        <Image
          src={ThropyIconBlue}
          width={68}
          height={68}
          alt="car"
          className="w-[68px] h-[68px]"
        />
        <div className="text-2xl font-bold mt-6">
          What is a Tournament?
        </div>
        <div className="my-4">
          Get more points the closer you are to the hammer price of a curated
          set of car auctions. Duis anim adipisicing minim nisi elit quis.
          Cillum ullamco qui dolore non incididunt incididunt non. Aute
          adipisicing et esse exercitation sunt irure proident enim eu esse
          nulla. Est excepteur est non. Adipisicing occaecat minim ex duis
          excepteur.
        </div>
        <div className="text-[#42A0FF]">View Tournaments</div>
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
      <div className="relative pb-8 sm:pb-0 min-h-[180px]">
        <div className="p-6 w-full h-auto">
          <div className="mb-6">
            <div className="flex justify-between">
              <div className="font-bold text-[18px]">PLAYERS</div>
              <Image
                src={ArrowDown}
                width={20}
                height={20}
                alt="arrow down"
                className="w-5 h-5"
              />
            </div>
            <div className="text-[14px]">
              {tournamentWagers.length ? tournamentWagers.length : 0} Players
            </div>
          </div>
          <div>
            {morePlayers &&
              tournamentWagers.map((wager) => {
                return (
                  <div
                    key={wager._id}
                    className="flex items-center py-2"
                  >
                    <div className="flex">
                      <Image
                        src={wager.user.image ? wager.user.image : AvatarOne}
                        width={44}
                        height={44}
                        alt="dollar"
                        className="w-[44px] h-[44px] mr-4 rounded-full"
                      />
                      <div className="text-sm ">
                        <div className="font-bold">
                          {session?.user.id === wager.user._id
                            ? "You"
                            : wager.user.username}
                        </div>
                        <div className="opacity-50">{`Joined ${dayjs(
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
                    className="flex items-center py-2"
                  >
                    <div className="flex">
                      <Image
                        src={wager.user.image ? wager.user.image : AvatarOne}
                        width={44}
                        height={44}
                        alt="dollar"
                        className="w-[44px] h-[44px] mr-4 rounded-full"
                      />
                      <div className="text-sm ">
                        <div className="font-bold">
                          {session?.user.id === wager.user._id
                            ? "You"
                            : wager.user.username}
                        </div>
                        <div className="opacity-50">{`Joined ${dayjs(
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
                className="btn-transparent-white w-full mt-2"
                onClick={() => setMorePlayers(false)}
              >
                Less Players...
              </button>
            ) : (
              <button
                className="btn-transparent-white w-full mt-2"
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
              className={`btn-yellow w-full ${tournamentWagers.length > 4 ? "mt-2" : "mt-6"
                }`}
            >
              {"JOIN TOURNAMENT (COMING SOON)"}
            </button>
          )}
        </div>
        {/* Background and button*/}
        <div className="absolute top-0 bottom-0 z-[-1] w-full">
          <Image
            src={TransitionPattern}
            width={288}
            height={356}
            alt="pattern"
            className="w-full h-auto rounded-lg mr-1 object-cover"
          />
          <div className="w-full h-full rounded-lg absolute top-0 bg-[#156CC333]"></div>
        </div>
      </div>
    </div>
  );
};

export const DetailsSection = (props: any) => {
  return (
    <div className="bg-[#172431] p-6 rounded-lg">
      <div className="flex justify-between py-2">
        <div className="font-bold text-[18px]">DETAILS</div>
        <Image
          src={ArrowDown}
          width={20}
          height={20}
          alt="arrow down"
          className="w-[20px] h-[20px]"
        />
      </div>
      <div>
        <hr className="border-white opacity-5" />
        <div className="flex justify-between py-2">
          <div className="opacity-50">Auction</div>
          <div className="flex items-center ">
            {props.website}
            <Image
              src={BringATrailerLogo}
              width={32}
              height={32}
              alt="bring a trailer logo"
              className="w-[32px] h-[32px] ml-2"
            />
          </div>
        </div>
        <hr className="border-white opacity-5" />
        <div className="flex justify-between py-2">
          <div className="opacity-50">Make</div>
          <div className="underline underline-offset-4">{props.make}</div>
        </div>
        <hr className="border-white opacity-5" />
        <div className="flex justify-between py-2">
          <div className="opacity-50">Model</div>
          <div>{props.model}</div>
        </div>
        <hr className="border-white opacity-5" />
        <div className="flex justify-between py-2">
          <div className="opacity-50">Seller</div>
          <div className="flex items-center">
            {props.seller}
            <Image
              src={BringATrailerLogo}
              width={32}
              height={32}
              alt="bring a trailer logo"
              className="w-[32px] h-[32px] ml-2"
            />
          </div>
        </div>
        <hr className="border-white opacity-5" />
        <div className="flex justify-between py-2">
          <div className="opacity-50">Location</div>
          <div>{props.location}</div>
        </div>
        <hr className="border-white opacity-5" />
        <div className="flex justify-between py-2">
          <div className="opacity-50">Mileage</div>
          <div>{props.mileage}</div>
        </div>
        <hr className="border-white opacity-5" />
        <div className="flex justify-between py-2">
          <div className="opacity-50">Listing Type</div>
          <div>{props.listing_type}</div>
        </div>
        <hr className="border-white opacity-5" />
        <div className="flex justify-between py-2">
          <div className="opacity-50">Lot #</div>
          <div>{props.lot_num}</div>
        </div>
        <hr className="border-white opacity-5" />
        <div className="py-2">
          <div className="opacity-50">Listing Details</div>
          <ul className="list-disc list-inside my-2 pl-2">
            {props.listing_details &&
              props.listing_details.map((item: string) => {
                return <li key={item}>{item}</li>;
              })}
          </ul>
        </div>
        <hr className="border-white opacity-5" />
        <div className="flex justify-between py-2">
          <div className="opacity-50">Photos</div>
          <Link href={"/"}>
            <span className="underline underline-offset-4">
              88 photos
            </span>
          </Link>
        </div>
        <Image
          src={CarFaxLogo}
          width={130}
          height={44}
          alt="bring a trailer logo"
          className="w-[130px] h-[44px] my-4"
        />
      </div>
    </div>
  );
};

interface Tournaments {
  _id: string;
  description?: string;
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
    <div className="section-container py-8 sm:py-12 mb-8  mt-8 ">
      <header className="max-w-[1312px]">
        <div className="flex justify-between items-end">
          <div className="flex items-center">
            <Image
              src={DiagonalLines}
              width={40}
              height={40}
              alt="dollar"
              className="w-10 h-10"
            />
            <div className="font-bold text-2xl w-[200px] sm:w-auto sm:text-3xl ml-4">
              Tournaments You Might Like
            </div>
          </div>
          <div className="text-[#49C742]">See All</div>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
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
    <div className="bg-[#156cc3] p-6 rounded-lg">
      <div className="mb-6">
        <div className="font-bold text-lg mb-1">WINNERS</div>
      </div>
      <div>
        {winners.map((winner: any, index: number) => {
          return (
            <div
              key={winner.userID}
              className="flex justify-between items-center py-2"
            >
              <div className="flex gap-4 items-center">
                <div className="text-lg opacity-30">{winner.rank}</div>
                <Image
                  src={winner.userImage ? winner.userImage : AvatarOne}
                  width={44}
                  height={44}
                  alt="arrow down"
                  className="w-[44px] h-[44px] rounded-full"
                />
                <div>
                  <div className="text-sm font-bold">
                    {session?.user.id === winner.userID
                      ? "You"
                      : winner.username}{" "}
                    🎉
                  </div>
                  <div className="text-xs inline-block bg-[#42a0ff] rounded-full py-0.5 px-2 font-medium">
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
        <div className="flex gap-6 py-4 px-6 items-center bg-[#2c7bc9] rounded-[10px] mt-6">
          <div className="text-[32px]">🏆</div>
          <div>
            <div className="font-bold">Congratulations!</div>
            <div className="text-sm opacity-70 leading-5">
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

export const TournamentLeaderboard = ({ tournamentPointsData }: any) => {
  const { data: session } = useSession();

  const sortedTournamentPointsData = tournamentPointsData.sort(
    (a: any, b: any) => a.totalScore - b.totalScore
  );

  return (
    <div>
      <div className="relative pb-8 sm:pb-0 min-h-[180px]">
        <div className="p-6 w-full h-auto">
          <div className="mb-6">
            <div className="flex justify-between">
              <div className="font-bold text-[18px]">LEADERBOARD</div>
              <Image
                src={ArrowDown}
                width={20}
                height={20}
                alt="arrow down"
                className="w-5 h-5"
              />
            </div>
            <div className="text-[14px]">Lowest point wins</div>
          </div>
          <div>
            {sortedTournamentPointsData &&
              sortedTournamentPointsData.map((item: any, index: number) => {
                return (
                  <div
                    key={item._id}
                    className="flex justify-between items-center py-2"
                  >
                    <div className="flex justify-between items-center gap-4">
                      <div className="text-lg opacity-30">
                        {index + 1}
                      </div>
                      <Image
                        src={item.user.image ? item.user.image : AvatarOne}
                        width={44}
                        height={44}
                        alt="dollar"
                        className="w-[44px] h-[44px] rounded-full"
                      />
                      <div className="text-sm">
                        <div className="font-bold">
                          {session?.user._id === item.user._id
                            ? "You"
                            : item.user.username}
                        </div>
                      </div>
                    </div>
                    <div className="w-auto px-6 py-1 text-sm font-bold text-black h-auto bg-yellow-400 rounded-md">
                      {item.auctionScores && item.auctionScores.length > 0
                        ? `${item.totalScore} pts.`
                        : "0 pts."}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
        {/* Background and button */}
        <div className="absolute top-0 bottom-0 z-[-1] w-full">
          <Image
            src={TransitionPattern}
            width={288}
            height={356}
            alt="pattern"
            className="w-full h-auto rounded-lg mr-1 object-cover"
          />
          <div className="w-full h-full rounded-lg absolute top-0 bg-[#41a0ff62]"></div>
        </div>
      </div>
    </div>
  );
};

interface TournamentDescription
  extends Required<Pick<Tournaments, "description">> { }

export const TournamentDescriptionSection: React.FC<TournamentDescription> = ({
  description,
}) => {
  return (
    <div className="flex flex-col mt-8 md:mt-16 w-full gap-16">
      {!description ? (
        <div className="w-full h-[120px] md:h-auto ellipsis overflow-hidden">
          Description not available for this tournament
        </div>
      ) : (
        <div className="w-full h-[120px] md:h-auto ellipsis overflow-hidden">
          {description}
        </div>
      )}
    </div>
  );
};
