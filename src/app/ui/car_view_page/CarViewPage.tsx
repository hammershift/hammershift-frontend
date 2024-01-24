"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";

import Image from "next/image";
import Card from "../../components/card";
import { TimerProvider, useTimer } from "@/app/_context/TimerContext";

import CancelIcon from "../../../../public/images/x-icon.svg";
import DollarIcon from "../../../../public/images/dollar.svg";
import CalendarIcon from "../../../../public/images/calendar-icon.svg";
import HashtagIcon from "../../../../public/images/hash-02.svg";
import PlayersIcon from "../../../../public/images/users-01.svg";
import HourGlassIcon from "../../../../public/images/hour-glass.svg";
import PrizeIcon from "../../../../public/images/monetization-browser-bag.svg";
import CheckIcon from "../../../../public/images/check-black.svg";
import CheckIconGreen from "../../../../public/images/check-green.svg";
import CommentsIcon from "../../../../public/images/comments-icon.svg";
import EyeIcon from "../../../../public/images/eye-on.svg";
import TelescopeIcon from "../../../../public/images/telescope-sharp.svg";

import CameraPlus from "../../../../public/images/camera-plus.svg";
import GifIcon from "../../../../public/images/image-document-gif.svg";

import ArrowDown from "../../../../public/images/arrow-down.svg";
import ArrowUp from "../../../../public/images/chevron-up.svg";
import DiagonalLines from "../../../../public/images/green-diagonal.svg";
import TransitionPattern from "../../../../public/images/transition-pattern.svg";
import BringATrailerLogo from "../../../../public/images/bring-a-trailer-logo.svg";
import ProfilePhoto from "../../../../public/images/ellipse-415.svg";
import CarFaxLogo from "../../../../public/images/show-me-carfax.svg";
import WatchListIcon from "../../../../public/images/watchlist-icon.svg";

import AvatarOne from "../../../../public/images/avatar-one.svg";
import AvatarTwo from "../../../../public/images/avatar-two.svg";
import AvatarThree from "../../../../public/images/avatar-three.svg";
import AvatarFour from "../../../../public/images/avatar-four.svg";

import Link from "next/link";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useSession } from "next-auth/react";
import { sortByMostExpensive, sortByNewGames } from "@/lib/data";
import { BounceLoader } from "react-spinners";
import CarImageModal from "@/app/components/car_image_modal";
import { carData } from "@/sample_data";
dayjs.extend(relativeTime);

export interface CarDataOneProps {
    price: string;
    year: string;
    make: string;
    model: string;
    img: string;
    chassis: string;
    seller: string;
    location: string;
    lot_num: string;
    listing_type: string;
    auction_id: string;
    website: string;
    description: string;
    images_list: { placing: number; src: string }[];
    listing_details: string;
    status: Number;
}

interface TitleContainerProps {
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

const TitleContainer: React.FC<TitleContainerProps> = ({
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
                            Ending:{" "}
                            <span className="tw-font-bold">{ending_date}</span>
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
                                Players:{" "}
                                <span className="tw-font-bold ">
                                    {players_num}
                                </span>
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
                                Bids:{" "}
                                <span className="tw-font-bold">{bids_num}</span>
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
                                    $
                                    {pot
                                        ? new Intl.NumberFormat().format(
                                              pot || 0
                                          )
                                        : " --"}
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
                            {comments
                                ? new Intl.NumberFormat().format(comments)
                                : "--"}{" "}
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
                            {views
                                ? new Intl.NumberFormat().format(views)
                                : "--"}
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
                            {watchers
                                ? new Intl.NumberFormat().format(watchers)
                                : "--"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TitleContainer;

interface WatchAndWagerButtonsProps {
    toggleWagerModal: () => void;
    alreadyWagered: boolean;
    auctionID: string;
    auctionEnded: boolean;
}

export const WatchAndWagerButtons: React.FC<WatchAndWagerButtonsProps> = ({
    auctionID,
    toggleWagerModal,
    alreadyWagered,
    auctionEnded,
}) => {
    const [isWatching, setIsWatching] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        const storedWatchStatus = localStorage.getItem(
            `watchStatus_${auctionID}`
        );
        if (storedWatchStatus) {
            setIsWatching(true);
        }
    }, [auctionID]);

    const updateWatchlist = async (add: boolean) => {
        setIsLoading(true);

        try {
            const response = await fetch("/api/myWatchlist", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    auctionID,
                    action: add ? "add" : "remove",
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
                localStorage.setItem(`watchStatus_${auctionID}`, "watched");
            }
        } else {
            const message = await updateWatchlist(false);
            if (message) {
                localStorage.removeItem(`watchStatus_${auctionID}`);
            }
        }
    };

    return (
        <div>
            <div>
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
                                isWatching
                                    ? "scale-animation is-watching"
                                    : "scale-animation"
                            }`}
                        />
                        {isWatching ? "WATCHING" : "WATCH"}
                    </button>
                    {auctionEnded ? (
                        <button
                            disabled
                            className="btn-yellow hover:tw-bg-[#f2ca16]"
                        >
                            ENDED 🏆
                        </button>
                    ) : alreadyWagered ? (
                        <button
                            type="button"
                            disabled
                            className="tw-flex tw-items-center tw-px-3.5 tw-py-2.5 tw-gap-2 tw-text-[#0f1923] tw-bg-white tw-font-bold tw-rounded"
                        >
                            WAGERED{" "}
                            <Image
                                src={CheckIcon}
                                alt=""
                                className="tw-border-2 tw-border-[#0f1923] tw-rounded-full tw-p-[1.5px] tw-w-5 tw-h-5 black-check-filter"
                            />
                        </button>
                    ) : (
                        <button
                            className="btn-yellow"
                            onClick={toggleWagerModal}
                        >
                            PLACE MY WAGER
                        </button>
                    )}
                </div>
            </div>
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
                <div
                    className="tw-relative tw-cursor-pointer"
                    onClick={toggleModal}
                >
                    <img
                        src={images_list[3].src}
                        width={202}
                        height={120}
                        alt="car"
                        className="tw-w-full tw-max-h-[120px] tw-object-cover tw-opacity-40 tw-rounded tw-aspect-auto"
                    />
                    <div className="tw-absolute tw-flex tw-z-20 tw-left-1/2 tw-translate-x-[-50%] tw-top-[50%] tw-translate-y-[-50%]">
                        {images_list.length + 1}{" "}
                        <span className="tw-hidden md:tw-block tw-ml-1">
                            photos
                        </span>
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
    toggleWagerModal: () => void;
    alreadyWagered: boolean;
    auctionEnded: boolean;
}
export const ArticleSection: React.FC<ArticleSectionProps> = ({
    description,
    images_list,
    toggleWagerModal,
    alreadyWagered,
    auctionEnded,
}) => {
    const [showDetails, setShowDetails] = useState(false);

    return (
        <div className="tw-flex tw-flex-col tw-mt-8 md:tw-mt-16 tw-w-full tw-gap-16">
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
            <div className="tw-grid tw-gap-3">
                <button
                    className="btn-transparent-white"
                    onClick={() => setShowDetails((prev) => !prev)}
                >
                    <span className="tw-w-full tw-flex tw-items-center tw-justify-center">
                        {showDetails ? "CLOSE DETAILS" : "VIEW MORE DETAILS"}
                        {!showDetails && (
                            <Image
                                src={ArrowDown}
                                width={20}
                                height={20}
                                alt="car"
                                className="tw-w-[20px] tw-h-[20px] tw-ml-2 tw-color-white"
                            />
                        )}
                    </span>
                </button>
                {alreadyWagered || auctionEnded ? null : (
                    <button className="btn-yellow" onClick={toggleWagerModal}>
                        PLACE MY WAGER
                    </button>
                )}
            </div>
        </div>
    );
};

interface WinnersI {
    winners: any;
    price: number;
}

export const WinnersSection: React.FC<WinnersI> = ({ winners, price }) => {
    const [userWon, setUserWon] = useState(true);

    return (
        <div className="tw-bg-[#156cc3] tw-p-6 tw-rounded-lg">
            <div className="tw-mb-6">
                <div className="tw-font-bold tw-text-lg tw-mb-1">WINNERS</div>
                <span className="tw-text-[#0f1923] tw-bg-[#f2ca16] tw-font-extrabold tw-text-sm tw-py-2 tw-px-2.5 tw-rounded">
                    Hammer Price: $
                    {price ? new Intl.NumberFormat().format(price) : "--"}
                </span>
            </div>
            <div>
                {winners.map((winner: any, index: number) => {
                    return (
                        <div
                            key={winner.userID}
                            className="tw-flex tw-justify-between tw-items-center tw-py-2"
                        >
                            <div className="tw-flex tw-gap-4 tw-items-center">
                                <div className="tw-text-lg tw-opacity-30">
                                    {index + 1}
                                </div>
                                <Image
                                    src={
                                        winner.userImage
                                            ? winner.userImage
                                            : AvatarOne
                                    }
                                    width={44}
                                    height={44}
                                    alt="arrow down"
                                    className="tw-w-[44px] tw-h-[44px] tw-rounded-full"
                                />
                                <div>
                                    <div className="tw-text-sm tw-font-bold">
                                        {winner.username} 🎉
                                    </div>
                                    <div className="tw-text-xs tw-bg-[#42a0ff] tw-rounded-full tw-py-0.5 tw-px-2 tw-font-medium">
                                        Won $
                                        {winner.prize % 1 === 0
                                            ? winner.prize.toLocaleString()
                                            : winner.prize.toLocaleString(
                                                  undefined,
                                                  {
                                                      minimumFractionDigits: 2,
                                                      maximumFractionDigits: 2,
                                                  }
                                              )}
                                    </div>
                                </div>
                            </div>
                            <div className="tw-text-sm tw-text-[#0f1923] tw-font-extrabold tw-bg-white tw-py-1 tw-px-1.5 tw-rounded">
                                $
                                {new Intl.NumberFormat().format(
                                    winner.priceGuessed
                                )}
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
                            You won $200 in this game. The amount has been added
                            to your wallet. Hope to see you in more games.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

interface WagerI {
    _id: string;
    auctionID: string;
    priceGuessed: number;
    wagerAmount: number;
    user: {
        _id: string;
        fullName: string;
        username: string;
        image: string;
    };
    createdAt: string;
    updatedAt: string;
}

interface WagersSectionProps {
    toggleWagerModal: () => void;
    players_num: number;
    wagers: WagerI[];
    alreadyWagered: boolean;
    auctionEnded: boolean;
}

export const WagersSection: React.FC<WagersSectionProps> = ({
    players_num,
    wagers,
    toggleWagerModal,
    alreadyWagered,
    auctionEnded,
}) => {
    const { data: session } = useSession();
    const router = useRouter();

    return (
        <div>
            <div className="tw-relative sm:tw-pb-0">
                <div className="tw-w-full tw-h-auto tw-p-6">
                    <div className="tw-mb-6">
                        <div className="tw-flex tw-justify-between">
                            <div className="tw-font-bold tw-text-[18px]">
                                WAGERS
                            </div>
                            <Image
                                src={ArrowDown}
                                width={20}
                                height={20}
                                alt="arrow down"
                                className="tw-w-5 tw-h-5"
                            />
                        </div>
                        <div className="tw-text-[14px]">
                            {players_num} Players
                        </div>
                    </div>
                    <div className="tw-relative">
                        {wagers.slice(0, 4).map((wager) => {
                            return (
                                <div
                                    key={wager._id}
                                    className="tw-flex tw-justify-between tw-items-center tw-py-2"
                                >
                                    <div className="tw-flex tw-gap-4 tw-items-center">
                                        <Image
                                            src={
                                                wager.user.image
                                                    ? wager.user.image
                                                    : AvatarOne
                                            }
                                            width={44}
                                            height={44}
                                            alt="dollar"
                                            className="tw-w-[44px] tw-h-[44px] tw-rounded-full"
                                        />
                                        <div className="tw-text-sm ">
                                            <div className="tw-font-bold">
                                                {session?.user.id ===
                                                wager.user._id
                                                    ? "You"
                                                    : wager.user.username}
                                            </div>
                                            <div className="tw-opacity-50">
                                                {dayjs(
                                                    wager.createdAt
                                                ).fromNow()}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        className={
                                            session?.user.id === wager.user._id
                                                ? "tw-bg-[#156cc3] tw-h-[28px] tw-px-2.5 tw-rounded tw-font-bold"
                                                : "tw-bg-[#53944F] tw-h-[28px] tw-px-2.5 tw-rounded tw-font-bold"
                                        }
                                    >
                                        <span className="tw-hidden xl:tw-inline-block">
                                            Wager:
                                        </span>{" "}
                                        $
                                        {new Intl.NumberFormat().format(
                                            wager.priceGuessed
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    {alreadyWagered || auctionEnded ? null : (
                        <button
                            className="btn-yellow tw-w-full tw-mt-6"
                            onClick={toggleWagerModal}
                        >
                            JOIN GAME
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
                        className="tw-w-full tw-h-4/5 tw-rounded-lg tw-mr-1 tw-object-cover"
                    />
                    <div className="tw-w-full tw-h-full tw-rounded-lg tw-absolute tw-top-0 tw-bg-[#156CC333]"></div>
                </div>
            </div>
        </div>
    );
};

interface DetailsSectionProps {
    website: string;
    make: string;
    model: string;
    seller: string;
    location: string;
    mileage: string;
    listing_type: string;
    lot_num: string;
    listing_details: string[];
    images_list: { placing: number; src: string }[];
    toggleCarImageModal: () => void;
}

export const DetailsSection: React.FC<DetailsSectionProps> = ({
    website,
    make,
    model,
    seller,
    location,
    mileage,
    listing_type,
    lot_num,
    listing_details,
    images_list,
    toggleCarImageModal,
}) => {
    const logo = BringATrailerLogo;
    const seller_img = ProfilePhoto;

    return (
        <div className=" tw-bg-[#172431] tw-p-6 tw-rounded-lg">
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
                        {website}
                        <Image
                            src={logo}
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
                    <div className="tw-underline tw-underline-offset-4">
                        {make}
                    </div>
                </div>
                <hr className="tw-border-white tw-opacity-5" />
                <div className="tw-flex tw-justify-between tw-py-2">
                    <div className="tw-opacity-50">Model</div>
                    <div>{model}</div>
                </div>
                <hr className="tw-border-white tw-opacity-5" />
                <div className="tw-flex tw-justify-between tw-py-2">
                    <div className="tw-opacity-50">Seller</div>
                    <div className="tw-flex tw-items-center">
                        {seller}
                        <Image
                            src={seller_img}
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
                    <div>{location}</div>
                </div>
                <hr className="tw-border-white tw-opacity-5" />
                <div className="tw-flex tw-justify-between tw-py-2">
                    <div className="tw-opacity-50">Mileage</div>
                    <div>{mileage}</div>
                </div>
                <hr className="tw-border-white tw-opacity-5" />
                <div className="tw-flex tw-justify-between tw-py-2">
                    <div className="tw-opacity-50">Listing Type</div>
                    <div>{listing_type}</div>
                </div>
                <hr className="tw-border-white tw-opacity-5" />
                <div className="tw-flex tw-justify-between tw-py-2">
                    <div className="tw-opacity-50">Lot #</div>
                    <div>{lot_num}</div>
                </div>
                <hr className="tw-border-white tw-opacity-5" />
                <div className="tw-py-2">
                    <div className="tw-opacity-50">Listing Details</div>
                    <ul className="tw-list-disc tw-list-inside tw-my-2 tw-pl-2">
                        {listing_details.map((item: string) => {
                            return <li key={item}>{item}</li>;
                        })}
                    </ul>
                </div>
                <hr className="tw-border-white tw-opacity-5" />
                <div className="tw-flex tw-justify-between tw-py-2">
                    <div className="tw-opacity-50">Photos</div>
                    <button onClick={toggleCarImageModal}>
                        <span className="tw-underline tw-underline-offset-4">
                            {images_list.length + 1} photos
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export const GamesYouMightLike = () => {
    const [gamesYouMightLike, setGamesYouMightLike] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const gamesYouMightLikeData = await sortByMostExpensive();
                setGamesYouMightLike(gamesYouMightLikeData.cars);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="section-container tw-py-8 sm:tw-py-12 tw-mb-8 sm:tw-mb-16 tw-mt-8 md:tw-mt-16">
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
                            Games You Might Like
                        </div>
                    </div>
                    <div className="tw-text-[#49C742]">See All</div>
                </div>
            </header>

            <section className="tw-overflow-hidden">
                <div className=" tw-w-[632px] sm:tw-w-[1312px] ">
                    <div className=" tw-grid tw-grid-cols-3 tw-gap-4 sm:tw-gap-8 tw-mt-12 ">
                        {gamesYouMightLike.map((auction: any, index: any) => (
                            <TimerProvider
                                key={index}
                                deadline={auction.deadline}
                            >
                                <div className="tw-w-[200px] sm:tw-w-[416px]">
                                    <Card
                                        object_id={auction._id}
                                        image={auction.image}
                                        year={auction.year}
                                        make={auction.make}
                                        model={auction.model}
                                        description={auction.description}
                                        deadline={auction.deadline}
                                        auction_id={auction.auction_id}
                                        price={auction.price}
                                    />
                                </div>
                            </TimerProvider>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};
