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
                            Ending:{" "}
                            <span className="font-bold">{ending_date}</span>
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
                                Players:{" "}
                                <span className="font-bold ">
                                    {players_num}
                                </span>
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
                                Bids:{" "}
                                <span className="font-bold">{bids_num}</span>
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
                                    $
                                    {pot % 1 === 0
                                        ? pot.toLocaleString()
                                        : pot.toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
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
                        Comments on Auction:{" "}
                        <span className="font-bold">
                            {comments
                                ? new Intl.NumberFormat().format(comments)
                                : "--"}{" "}
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
                            {views
                                ? new Intl.NumberFormat().format(views)
                                : "--"}
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
                            className={`w-5 h-5 mr-2 ${isWatching
                                    ? "scale-animation is-watching"
                                    : "scale-animation"
                                }`}
                        />
                        {isWatching ? "WATCHING" : "WATCH"}
                    </button>
                    {auctionEnded ? (
                        <button
                            disabled
                            className="btn-yellow hover:bg-[#f2ca16]"
                        >
                            ENDED 🏆
                        </button>
                    ) : alreadyWagered ? (
                        <button
                            type="button"
                            disabled
                            className="flex items-center px-3.5 py-2.5 gap-2 text-[#0f1923] bg-white font-bold rounded"
                        >
                            WAGERED{" "}
                            <Image
                                src={CheckIcon}
                                alt=""
                                className="border-2 border-[#0f1923] rounded-full p-[1.5px] w-5 h-5 black-check-filter"
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
                <div
                    className="relative cursor-pointer"
                    onClick={toggleModal}
                >
                    <img
                        src={images_list[3].src}
                        width={202}
                        height={120}
                        alt="car"
                        className="w-full max-h-[120px] object-cover opacity-40 rounded aspect-auto"
                    />
                    <div className="absolute flex z-20 left-1/2 translate-x-[-50%] top-[50%] translate-y-[-50%]">
                        {images_list.length + 1}{" "}
                        <span className="hidden md:block ml-1">
                            photos
                        </span>
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
        <div className="flex flex-col mt-8 md:mt-16 w-full gap-16">
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
            <div className="grid gap-3">
                <button
                    className="btn-transparent-white"
                    onClick={() => setShowDetails((prev) => !prev)}
                >
                    <span className="w-full flex items-center justify-center">
                        {showDetails ? "CLOSE DETAILS" : "VIEW MORE DETAILS"}
                        {!showDetails && (
                            <Image
                                src={ArrowDown}
                                width={20}
                                height={20}
                                alt="car"
                                className="w-[20px] h-[20px] ml-2 color-white"
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
                <span className="text-[#0f1923] bg-[#f2ca16] font-extrabold text-sm py-2 px-2.5 rounded">
                    Hammer Price: $
                    {price ? new Intl.NumberFormat().format(price) : "--"}
                </span>
            </div>
            <div>
                {winners.map((winner: any, index: number) => {
                    return (
                        <div
                            key={winner.userID}
                            className="flex justify-between items-center py-2"
                        >
                            <div className="flex gap-4 items-center">
                                <div className="text-lg opacity-30">
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
                            <div className="text-sm text-[#0f1923] font-extrabold bg-white py-1 px-1.5 rounded">
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
                            in this game. The amount has been added to your
                            wallet. Hope to see you in more games.
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
            <div className="relative sm:pb-0">
                <div className="w-full h-auto p-6">
                    <div className="mb-6">
                        <div className="flex justify-between">
                            <div className="font-bold text-[18px]">
                                WAGERS
                            </div>
                            <Image
                                src={ArrowDown}
                                width={20}
                                height={20}
                                alt="arrow down"
                                className="w-5 h-5"
                            />
                        </div>
                        <div className="text-[14px]">
                            {players_num} Players
                        </div>
                    </div>
                    <div className="relative">
                        {wagers.slice(0, 4).map((wager) => {
                            return (
                                <div
                                    key={wager._id}
                                    className="flex justify-between items-center py-2"
                                >
                                    <div className="flex gap-4 items-center">
                                        <Image
                                            src={
                                                wager.user.image
                                                    ? wager.user.image
                                                    : AvatarOne
                                            }
                                            width={44}
                                            height={44}
                                            alt="dollar"
                                            className="w-[44px] h-[44px] rounded-full"
                                        />
                                        <div className="text-sm ">
                                            <div className="font-bold">
                                                {session?.user.id ===
                                                    wager.user._id
                                                    ? "You"
                                                    : wager.user.username}
                                            </div>
                                            <div className="opacity-50">
                                                {dayjs(
                                                    wager.createdAt
                                                ).fromNow()}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        className={
                                            session?.user.id === wager.user._id
                                                ? "bg-[#156cc3] h-[28px] px-2.5 rounded font-bold flex items-center gap-1 line-clamp-1"
                                                : "bg-[#53944F] h-[28px] px-2.5 rounded font-bold flex items-center gap-1"
                                        }
                                    >
                                        <div className="hidden 2xl:inline-block">
                                            Wager:
                                        </div>{" "}
                                        <div>
                                            $
                                            {new Intl.NumberFormat().format(
                                                wager.priceGuessed
                                            )}
                                        </div>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    {alreadyWagered || auctionEnded ? null : (
                        <button
                            className="btn-yellow w-full mt-6"
                            onClick={toggleWagerModal}
                        >
                            JOIN GAME
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
        <div className=" bg-[#172431] p-6 rounded-lg">
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
                        {website}
                        <Image
                            src={logo}
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
                    <div className="underline underline-offset-4">
                        {make}
                    </div>
                </div>
                <hr className="border-white opacity-5" />
                <div className="flex justify-between py-2">
                    <div className="opacity-50">Model</div>
                    <div>{model}</div>
                </div>
                <hr className="border-white opacity-5" />
                <div className="flex justify-between py-2">
                    <div className="opacity-50">Seller</div>
                    <div className="flex items-center">
                        {seller}
                        <Image
                            src={seller_img}
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
                    <div>{location}</div>
                </div>
                <hr className="border-white opacity-5" />
                <div className="flex justify-between py-2">
                    <div className="opacity-50">Mileage</div>
                    <div>{mileage}</div>
                </div>
                <hr className="border-white opacity-5" />
                <div className="flex justify-between py-2">
                    <div className="opacity-50">Listing Type</div>
                    <div>{listing_type}</div>
                </div>
                <hr className="border-white opacity-5" />
                <div className="flex justify-between py-2">
                    <div className="opacity-50">Lot #</div>
                    <div>{lot_num}</div>
                </div>
                <hr className="border-white opacity-5" />
                <div className="py-2">
                    <div className="opacity-50">Listing Details</div>
                    <ul className="list-disc list-inside my-2 pl-2">
                        {listing_details.map((item: string) => {
                            return <li key={item}>{item}</li>;
                        })}
                    </ul>
                </div>
                <hr className="border-white opacity-5" />
                <div className="flex justify-between py-2">
                    <div className="opacity-50">Photos</div>
                    <button onClick={toggleCarImageModal}>
                        <span className="underline underline-offset-4">
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
        <div className="section-container py-8 sm:py-12 mb-8 sm:mb-16 mt-8 md:mt-16">
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
                            Games You Might Like
                        </div>
                    </div>
                    <div className="text-[#49C742]">See All</div>
                </div>
            </header>

            <section className="overflow-hidden">
                <div className=" w-[632px] sm:w-[1312px] ">
                    <div className=" grid grid-cols-3 gap-4 sm:gap-8 mt-12 ">
                        {gamesYouMightLike.map((auction: any, index: any) => (
                            <TimerProvider
                                key={index}
                                deadline={auction.deadline}
                            >
                                <div className="w-[200px] sm:w-[416px]">
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
