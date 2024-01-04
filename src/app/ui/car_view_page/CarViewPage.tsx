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
}) => {
    const timerValues = useTimer();

    return (
        <div className=" tw-flex tw-flex-col tw-flex-grow tw-w-auto">
            <div className="title-section-marker tw-flex tw-text-3xl md:tw-text-5xl tw-font-bold">
                {year} {make} {model}
            </div>
            <div className="info-section-marker tw-flex tw-flex-col md:tw-flex-row tw-mt-4">
                <div className="info-left-marker tw-w-[300px]">
                    <div className="tw-flex">
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
                            Ending:{" "}
                            <span className="tw-font-bold">{ending_date}</span>
                        </span>
                    </div>
                </div>
                <div className="right-section-marker">
                    <div className="top-section-marker tw-flex tw-flex-col md:tw-flex-row tw-justify-between">
                        <div className="tw-w-[160px] tw-hidden md:tw-flex">
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
                                Time Left:{" "}
                                <span className="tw-font-bold tw-text-[#C2451E]">{`${timerValues.days}:${timerValues.hours}:${timerValues.minutes}:${timerValues.seconds}`}</span>
                            </span>
                        </div>
                    </div>
                    <div className="bottom-section-marker tw-flex-col md:tw-flex-row tw-mt-0 md:tw-mt-1 tw-flex">
                        <div className="tw-flex  tw-w-[160px]">
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
        </div>
    );
};

export default TitleContainer;

interface WatchAndWagerButtonsProps {
    toggleWagerModal: () => void;
    alreadyWagered: boolean;
    auctionID: string;
}

export const WatchAndWagerButtons: React.FC<WatchAndWagerButtonsProps> = ({
    auctionID,
    toggleWagerModal,
    alreadyWagered,
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
                            className={`tw-w-5 tw-h-5 tw-mr-2 ${isWatching
                                ? "scale-animation is-watching"
                                : "scale-animation"
                                }`}
                        />
                        {isWatching ? "WATCHING" : "WATCH"}
                    </button>
                    {alreadyWagered ? (
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
}
export const PhotosLayout: React.FC<PhotosLayoutProps> = ({
    images_list,
    img,
}) => {
    return (
        <div className=" tw-my-8">
            <Image
                src={img}
                width={832}
                height={520}
                alt="car"
                className="tw-w-full tw-max-h-[520px] tw-object-cover tw-rounded tw-aspect-auto"
            />
            <div className="tw-grid tw-grid-cols-4 tw-gap-2 tw-mt-2 tw-w-full tw-h-auto">
                <Image
                    src={images_list[0].src}
                    width={202}
                    height={120}
                    alt="car"
                    className="tw-w-full tw-max-h-[120px] tw-object-cover tw-rounded tw-aspect-auto"
                />
                <Image
                    src={images_list[1].src}
                    width={202}
                    height={120}
                    alt="car"
                    className="tw-w-full tw-max-h-[120px] tw-object-cover tw-rounded tw-aspect-auto"
                />
                <Image
                    src={images_list[2].src}
                    width={202}
                    height={120}
                    alt="car"
                    className="tw-w-full tw-max-h-[120px] tw-object-cover tw-rounded tw-aspect-auto"
                />
                <div className="tw-relative">
                    <Image
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
}
export const ArticleSection: React.FC<ArticleSectionProps> = ({
    description,
    images_list,
    toggleWagerModal,
    alreadyWagered,
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
                {alreadyWagered ? null : (
                    <button className="btn-yellow" onClick={toggleWagerModal}>
                        PLACE MY WAGER
                    </button>
                )}
            </div>
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
}

export const WagersSection: React.FC<WagersSectionProps> = ({
    players_num,
    wagers,
    toggleWagerModal,
    alreadyWagered,
}) => {
    const { data: session } = useSession();
    const router = useRouter();

    return (
        <div>
            <div className="tw-relative tw-pb-8 sm:tw-pb-0">
                <div className="tw-px-5 tw-w-full tw-h-auto tw-pt-8">
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
                    <div className="tw-text-[14px]">{players_num} Players</div>
                    <div className="tw-relative tw-mt-4">
                        {wagers.slice(0, 4).map((wager) => {
                            return (
                                <div
                                    key={wager._id}
                                    className="tw-my-5 tw-flex tw-justify-between"
                                >
                                    <div className="tw-flex">
                                        <Image
                                            src={
                                                wager.user.image
                                                    ? wager.user.image
                                                    : AvatarOne
                                            }
                                            width={40}
                                            height={40}
                                            alt="dollar"
                                            className="tw-w-[40px] tw-h-[40px] tw-mr-4 tw-rounded-full"
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
                    {alreadyWagered ? null : (
                        <button
                            className="btn-yellow tw-w-full tw-mt-2"
                            onClick={toggleWagerModal}
                        >
                            JOIN GAME
                        </button>
                    )}
                </div>
                {/* Background and button*/}
                <div className="tw-absolute tw-top-0 tw-h-[416px] tw-z-[-1] tw-w-full">
                    <Image
                        src={TransitionPattern}
                        width={288}
                        height={356}
                        alt="pattern"
                        className="tw-w-full tw-h-[288px]  tw-rounded-lg tw-mr-1 tw-object-cover"
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
}) => {
    const logo = BringATrailerLogo;
    const seller_img = ProfilePhoto;
    const DetailsData = {
        auction: { name: "Bring a Trailer", logo: BringATrailerLogo },
        make: "Mercedes Benz",
        model: "E55 AMG",
        seller: { name: "John Adams", image: ProfilePhoto },
        location: "San Diego, CA, 92121",
        mileage: "55,400",
        listing_type: "Private Property",
        lot_num: "112459",
        listing_details: [
            "Chassis: WDDRJ7HA0BA000819",
            "13k Miles",
            "6.2 - Liter V8",
            "Seven - Speed Dual - Clutch Automatic Transaxle",
            "Limited - Slip Differential",
            "Iridium Silver Metallic Paint",
            "Charcoal Exclusive Leather Upholstery",
            '19" & 20" Seven - Spoke Alloy Wheels',
            "Gullwing Doors",
            "Speed - Activated Aerofoil",
            "Bi - Xenon Headlights",
            "Parktronic",
            "Heated Power - Adjustable Seats",
            "Keyless - Go",
            "COMAND Infortainment",
            "Carbon - Fiber Interior Trim",
            "Radar Detector",
            "Bang & Olufsen Sound System",
            "Dual - Zone Automatic Climate Control",
            "Clean Carfax Report",
        ],
    };
    return (
        <div className="tw-mt-8 lg:tw-mt-16 tw-bg-[#172431] tw-p-6">
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
                    <Link href={"/"}>
                        <span className="tw-underline tw-underline-offset-4">
                            {images_list.length + 1} photos
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
