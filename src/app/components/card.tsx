"use client";
import "../styles/app.css";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Dollar from "../../../public/images/dollar.svg";
import HourGlass from "../../../public/images/hour-glass.svg";
import AvatarOne from "../../../public/images/avatar-one.svg";
import AvatarTwo from "../../../public/images/avatar-two.svg";
import AvatarThree from "../../../public/images/avatar-three.svg";
import AvatarFour from "../../../public/images/avatar-four.svg";
import BlackMercedes from "../../../public/images/black-mercedes.svg";
import CarTournamnetsListOne from "../../../public/images/tournaments-list/tournaments-list-car-1.svg";
import { TimerProvider, useTimer } from "../_context/TimerContext";
import { getWagers } from "@/lib/data";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ClipLoader, SyncLoader } from "react-spinners";
import { useSession } from "next-auth/react";

const cardData = {
    activity: [
        {
            id: "a1",
            username: "damientine",
            avatar: AvatarOne,
            wager: "$292,000",
            time: "12m ago",
        },
        {
            id: "a2",
            username: "addisonmx",
            avatar: AvatarTwo,
            wager: "$29,500",
            time: "16m ago",
        },
    ],
    players: [
        {
            id: "player1",
            username: "user1",
            avatar: AvatarOne,
        },
        {
            id: "player2",
            username: "user2",
            avatar: AvatarTwo,
        },
        {
            id: "player3",
            username: "user2",
            avatar: AvatarThree,
        },
        {
            id: "player4",
            username: "user2",
            avatar: AvatarFour,
        },
        {
            id: "player5",
            username: "user2",
            avatar: AvatarOne,
        },
        {
            id: "player6",
            username: "user2",
            avatar: AvatarTwo,
        },
        {
            id: "player7",
            username: "user2",
            avatar: AvatarThree,
        },
    ],
};

const Card: React.FC<any> = ({
    image,
    year,
    make,
    model,
    description,
    deadline,
    auction_id,
    price,
    object_id,
}) => {
    const router = useRouter();
    const timerValues = useTimer();
    return (
        <TimerProvider deadline={new Date(deadline)}>
            <div className="tw-flex tw-flex-col tw-justify-between tw-h-[654px]">
                <div>
                    <Image
                        onClick={() => console.log(object_id)}
                        src={image}
                        width={416}
                        height={219}
                        alt="ferrari"
                        className="tw-w-[200px] sm:tw-w-[416px] tw-h-[147px] sm:tw-h-[219px] tw-rounded tw-object-cover"
                    />
                    <div className="tw-font-bold tw-text-[24px] tw-py-[12px]">
                        {year} {make} {model}
                    </div>
                    <p className="tw-h-[60px] sm:tw-h-[72px] tw-w-full tw-line-clamp-3 tw-overflow-hidden tw-text-[14px] sm:tw-text-[16px]">
                        {description}
                    </p>
                    <div className="tw-flex tw-mt-3">
                        <Image
                            src={Dollar}
                            width={20}
                            height={20}
                            alt="dollar"
                            className="tw-w-5 tw-h-5"
                        />
                        <div className="tw-px-2 tw-hidden sm:tw-block">
                            Current Bid:
                        </div>
                        <div className="tw-text-[#49C742] tw-font-bold">
                            ${new Intl.NumberFormat().format(price)}
                        </div>
                    </div>
                    <div className="tw-flex">
                        <Image
                            src={HourGlass}
                            width={20}
                            height={20}
                            alt="dollar"
                            className="tw-w-5 tw-h-5"
                        />
                        <div className="tw-px-2 tw-hidden sm:tw-block">
                            Time Left:
                        </div>
                        <div className="tw-text-[#C2451E] tw-font-bold">{`${timerValues.days}:${timerValues.hours}:${timerValues.minutes}:${timerValues.seconds}`}</div>
                    </div>
                    <CardWagersSection objectID={object_id} />
                </div>
                <div>
                    <button
                        className="btn-yellow-thin tw-w-full sm:tw-w-auto"
                        onClick={() =>
                            router.push(`/auctions/car_view_page/${auction_id}`)
                        }
                    >
                        Play Game
                    </button>
                </div>
            </div>
        </TimerProvider>
    );
};

export default Card;

export const CardWagersSection = ({ objectID }: any) => {
    dayjs.extend(relativeTime);
    const [auctionWagers, setAuctionWagers] = useState([]);

    useEffect(() => {
        const fetchWagers = async () => {
            const wagers = await getWagers(objectID);
            setAuctionWagers(wagers);
        };

        fetchWagers();
    }, []);

    return (
        <>
            {auctionWagers.length === 0 && (
                <div className="tw-bg-[#172431] tw-p-4 tw-flex tw-gap-2 tw-rounded-[4px] tw-mt-4">
                    <Image
                        src={AvatarFour}
                        width={24}
                        height={24}
                        alt="dollar"
                        className="tw-w-[24px] tw-h-[24px] tw-rounded-full"
                    />
                    <div>Be the first to wager a price</div>
                </div>
            )}
            {auctionWagers.length !== 0 && (
                <div className="tw-gap-2 tw-bg-[#172431] tw-p-2 sm:tw-p-4 tw-my-4 tw-text-[14px] sm:tw-text-[16px] tw-rounded-[4px]">
                    <div
                        className={`tw-flex tw-flex-col tw-gap-2 ${
                            auctionWagers.length >= 3 && "tw-mb-3"
                        }`}
                    >
                        {auctionWagers.slice(0, 2).map((wager: any) => {
                            return (
                                <div
                                    key={wager._id}
                                    className="tw-flex tw-gap-2"
                                >
                                    <Image
                                        src={
                                            wager.user?.image
                                                ? wager.user.image
                                                : AvatarTwo
                                        }
                                        width={24}
                                        height={24}
                                        alt="dollar"
                                        className="tw-w-[24px] tw-h-[24px] tw-rounded-full"
                                    />
                                    <div className="tw-flex tw-text-sm tw-gap-1 tw-items-center">
                                        <div className="tw-text-[#42A0FF]">{`@${wager.user.username}`}</div>
                                        <div>{`wagered $${new Intl.NumberFormat().format(
                                            wager.priceGuessed
                                        )}`}</div>
                                        <div className="tw-text-[#DCE0D9]">
                                            {dayjs(wager.createdAt).fromNow()}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {auctionWagers.length >= 3 && (
                        <div className="tw-relative tw-flex tw-items-center">
                            {/* avatar images - hidden for screens smaller than sm */}
                            <div className="tw-flex tw-items-center tw-gap-2">
                                <div className=" tw-w-auto tw-hidden xl:tw-flex">
                                    <Image
                                        src={
                                            (auctionWagers[2] as any).user.image
                                                ? (auctionWagers[2] as any).user
                                                      .image
                                                : AvatarTwo
                                        }
                                        width={32}
                                        height={32}
                                        alt="avatar"
                                        className="tw-w-8 tw-h-8 tw-rounded-full"
                                        style={{
                                            border: "1px solid black",
                                        }}
                                    />
                                    <div className="tw-flex">
                                        {auctionWagers
                                            .slice(3, 8)
                                            .map(
                                                (wager: any, index: number) => {
                                                    return (
                                                        <div
                                                            key={wager._id}
                                                            style={{
                                                                transform: `translate(${
                                                                    -10 *
                                                                    (index + 1)
                                                                }px, 0)`,
                                                                zIndex: 1,
                                                            }}
                                                        >
                                                            <Image
                                                                src={
                                                                    wager.user
                                                                        .image
                                                                        ? wager
                                                                              .user
                                                                              .image
                                                                        : AvatarThree
                                                                }
                                                                width={32}
                                                                height={32}
                                                                alt="avatar"
                                                                className="tw-w-8 tw-h-8 tw-rounded-full"
                                                                style={{
                                                                    border: "1px solid black",
                                                                }}
                                                            />
                                                        </div>
                                                    );
                                                }
                                            )}
                                    </div>
                                </div>
                                {auctionWagers.length - 2 == 2 && (
                                    <div
                                        className={`xl:tw-block tw-hidden tw-text-sm -tw-ml-[10px]`}
                                    >
                                        {`and ${
                                            auctionWagers.length - 2
                                        } more players to join`}
                                    </div>
                                )}
                                {auctionWagers.length - 2 == 3 && (
                                    <div
                                        className={`xl:tw-block tw-hidden tw-text-sm -tw-ml-[20px]`}
                                    >
                                        {`and ${
                                            auctionWagers.length - 2
                                        } more players to join`}
                                    </div>
                                )}
                                {auctionWagers.length - 2 == 4 && (
                                    <div
                                        className={`xl:tw-block tw-hidden tw-text-sm -tw-ml-[30px]`}
                                    >
                                        {`and ${
                                            auctionWagers.length - 2
                                        } more players to join`}
                                    </div>
                                )}
                                {auctionWagers.length - 2 >= 5 && (
                                    <div
                                        className={`xl:tw-block tw-hidden tw-text-sm -tw-ml-[40px]`}
                                    >
                                        {`and ${
                                            auctionWagers.length - 2
                                        } more players to join`}
                                    </div>
                                )}
                            </div>
                            {/* avatar images - hidden for screens bigger than sm */}
                            <div className="tw-flex tw-w-auto xl:tw-hidden">
                                <Image
                                    src={
                                        (auctionWagers[2] as any).user.image
                                            ? (auctionWagers[2] as any).user
                                                  .image
                                            : AvatarTwo
                                    }
                                    width={32}
                                    height={32}
                                    alt="avatar"
                                    className="tw-w-8 tw-h-8 tw-rounded-full"
                                    style={{
                                        border: "1px solid black",
                                    }}
                                />
                                <div className="tw-flex">
                                    {auctionWagers
                                        .slice(3, 8)
                                        .map((wager: any, index: number) => {
                                            return (
                                                <div
                                                    key={wager._id}
                                                    style={{
                                                        transform: `translate(${
                                                            -10 * (index + 1)
                                                        }px, 0)`,
                                                        zIndex: 2,
                                                    }}
                                                >
                                                    <Image
                                                        src={
                                                            wager.user.image
                                                                ? wager.user
                                                                      .image
                                                                : AvatarThree
                                                        }
                                                        width={32}
                                                        height={32}
                                                        alt="avatar"
                                                        className="tw-w-8 tw-h-8 tw-rounded-full"
                                                        style={{
                                                            border: "1px solid black",
                                                        }}
                                                    />
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                            <div className="tw-ml-1 tw--translate-x-1 tw-block xl:tw-hidden tw-text-sm">{`${
                                auctionWagers.length - 2
                            } players`}</div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export const GamesCard = (props: any) => {
    const router = useRouter();
    const timerValues = useTimer();

    const currencyString = new Intl.NumberFormat().format(props.price);

    return (
        <TimerProvider deadline={new Date()}>
            <div className="tw-flex tw-flex-col tw-justify-between tw-h-[654px]">
                <div>
                    <Image
                        src={props.image}
                        width={416}
                        height={219}
                        alt={props.make}
                        className="tw-w-full 2xl:tw-w-[416px] tw-h-auto 2xl:tw-h-[219px] tw-rounded tw-object-cover tw-aspect-auto"
                    />
                    <div className="tw-font-bold tw-text-[24px] tw-py-[12px]">
                        {props.year} {props.make} {props.model}
                    </div>
                    <p className="tw-h-[60px] sm:tw-h-[72px] tw-w-full tw-line-clamp-3 tw-overflow-hidden tw-text-[14px] sm:tw-text-[16px]">
                        {props.description[0]}
                    </p>
                    <div className="tw-flex tw-mt-3">
                        <Image
                            src={Dollar}
                            width={20}
                            height={20}
                            alt="dollar"
                            className="tw-w-5 tw-h-5"
                        />
                        <div className="tw-px-2 tw-hidden sm:tw-block">
                            Current Bid:
                        </div>
                        <div className="tw-text-[#49C742] tw-font-bold">
                            ${currencyString}
                        </div>
                    </div>
                    <div className="tw-flex">
                        <Image
                            src={HourGlass}
                            width={20}
                            height={20}
                            alt="dollar"
                            className="tw-w-5 tw-h-5"
                        />
                        <div className="tw-px-2 tw-hidden sm:tw-block">
                            Time Left:
                        </div>
                        <div className="tw-text-[#C2451E] tw-font-bold">{`${timerValues.days}:${timerValues.hours}:${timerValues.minutes}:${timerValues.seconds}`}</div>
                    </div>
                    <GameCardWagersSection objectID={props.object_id} />
                </div>
                <div>
                    <button
                        className="btn-yellow-thin tw-w-full md:tw-w-auto"
                        onClick={() =>
                            router.push(
                                `/auctions/car_view_page/${props.auction_id}`
                            )
                        }
                    >
                        Play Game
                    </button>
                </div>
            </div>
        </TimerProvider>
    );
};

export const GameCardWagersSection = ({ objectID }: any) => {
    dayjs.extend(relativeTime);
    const [auctionWagers, setAuctionWagers] = useState([]);

    useEffect(() => {
        const fetchWagers = async () => {
            const wagers = await getWagers(objectID);
            setAuctionWagers(wagers);
        };
        fetchWagers();
    }, []);

    return (
        <>
            {auctionWagers.length === 0 && (
                <div className="tw-bg-[#172431] tw-p-4 tw-flex tw-gap-2 tw-rounded-[4px] tw-mt-4">
                    <Image
                        src={AvatarFour}
                        width={24}
                        height={24}
                        alt="dollar"
                        className="tw-w-[24px] tw-h-[24px] tw-rounded-full"
                    />
                    <div>Be the first to wager a price</div>
                </div>
            )}
            {auctionWagers.length !== 0 && (
                <div className="tw-gap-2 tw-bg-[#172431] tw-p-2 sm:tw-p-4 tw-my-4 tw-text-[14px] sm:tw-text-[16px] tw-rounded-[4px]">
                    <div
                        className={`tw-flex tw-flex-col tw-gap-2 ${
                            auctionWagers.length >= 3 && "tw-mb-3"
                        }`}
                    >
                        {auctionWagers.slice(0, 2).map((wager: any) => {
                            return (
                                <div
                                    key={wager._id}
                                    className="tw-flex tw-gap-2"
                                >
                                    <Image
                                        onClick={() =>
                                            console.log(auctionWagers)
                                        }
                                        src={
                                            wager.user.image
                                                ? wager.user.image
                                                : AvatarTwo
                                        }
                                        width={24}
                                        height={24}
                                        alt="dollar"
                                        className="tw-w-[24px] tw-h-[24px] tw-rounded-full"
                                    />
                                    <div className="tw-flex tw-text-sm tw-gap-1 tw-items-center">
                                        <div className="tw-text-[#42A0FF]">{`@${wager.user.username}`}</div>
                                        <div>{`wagered $${new Intl.NumberFormat().format(
                                            wager.priceGuessed
                                        )}`}</div>
                                        <div className="tw-text-[#DCE0D9]">
                                            {dayjs(wager.createdAt).fromNow()}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {auctionWagers.length >= 3 && (
                        <div className="tw-relative tw-flex tw-items-center">
                            {/* avatar images - hidden for screens smaller than sm */}
                            <div className="tw-flex tw-items-center tw-gap-2">
                                <div className=" tw-w-auto tw-hidden xl:tw-flex">
                                    <Image
                                        src={
                                            (auctionWagers[2] as any).user.image
                                                ? (auctionWagers[2] as any).user
                                                      .image
                                                : AvatarTwo
                                        }
                                        width={32}
                                        height={32}
                                        alt="avatar"
                                        className="tw-w-8 tw-h-8 tw-rounded-full"
                                        style={{
                                            border: "1px solid black",
                                        }}
                                    />
                                    <div className="tw-flex">
                                        {auctionWagers
                                            .slice(3, 8)
                                            .map(
                                                (wager: any, index: number) => {
                                                    return (
                                                        <div
                                                            key={wager._id}
                                                            style={{
                                                                transform: `translate(${
                                                                    -10 *
                                                                    (index + 1)
                                                                }px, 0)`,
                                                                zIndex: 1,
                                                            }}
                                                        >
                                                            <Image
                                                                src={
                                                                    wager.user
                                                                        .image
                                                                        ? wager
                                                                              .user
                                                                              .image
                                                                        : AvatarThree
                                                                }
                                                                width={32}
                                                                height={32}
                                                                alt="avatar"
                                                                className="tw-w-8 tw-h-8 tw-rounded-full"
                                                                style={{
                                                                    border: "1px solid black",
                                                                }}
                                                            />
                                                        </div>
                                                    );
                                                }
                                            )}
                                    </div>
                                </div>
                                {auctionWagers.length - 2 == 2 && (
                                    <div
                                        className={`xl:tw-block tw-hidden tw-text-sm -tw-ml-[10px]`}
                                    >
                                        {`and ${
                                            auctionWagers.length - 2
                                        } more players to join`}
                                    </div>
                                )}
                                {auctionWagers.length - 2 == 3 && (
                                    <div
                                        className={`xl:tw-block tw-hidden tw-text-sm -tw-ml-[20px]`}
                                    >
                                        {`and ${
                                            auctionWagers.length - 2
                                        } more players to join`}
                                    </div>
                                )}
                                {auctionWagers.length - 2 == 4 && (
                                    <div
                                        className={`xl:tw-block tw-hidden tw-text-sm -tw-ml-[30px]`}
                                    >
                                        {`and ${
                                            auctionWagers.length - 2
                                        } more players to join`}
                                    </div>
                                )}
                                {auctionWagers.length - 2 >= 5 && (
                                    <div
                                        className={`xl:tw-block tw-hidden tw-text-sm -tw-ml-[40px]`}
                                    >
                                        {`and ${
                                            auctionWagers.length - 2
                                        } more players to join`}
                                    </div>
                                )}
                            </div>
                            {/* avatar images - hidden for screens bigger than sm */}
                            <div className="tw-flex tw-w-auto xl:tw-hidden">
                                <Image
                                    src={
                                        (auctionWagers[2] as any).user.image
                                            ? (auctionWagers[2] as any).user
                                                  .image
                                            : AvatarTwo
                                    }
                                    width={32}
                                    height={32}
                                    alt="avatar"
                                    className="tw-w-8 tw-h-8 tw-rounded-full"
                                    style={{
                                        border: "1px solid black",
                                    }}
                                />
                                <div className="tw-flex">
                                    {auctionWagers
                                        .slice(3, 8)
                                        .map((wager: any, index: number) => {
                                            return (
                                                <div
                                                    key={wager._id}
                                                    style={{
                                                        transform: `translate(${
                                                            -10 * (index + 1)
                                                        }px, 0)`,
                                                        zIndex: 2,
                                                    }}
                                                >
                                                    <Image
                                                        src={
                                                            wager.user.image
                                                                ? wager.user
                                                                      .image
                                                                : AvatarThree
                                                        }
                                                        width={32}
                                                        height={32}
                                                        alt="avatar"
                                                        className="tw-w-8 tw-h-8 tw-rounded-full"
                                                        style={{
                                                            border: "1px solid black",
                                                        }}
                                                    />
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                            <div className="tw-ml-1 tw--translate-x-1 tw-block xl:tw-hidden tw-text-sm">{`${
                                auctionWagers.length - 2
                            } players`}</div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export const TournamentsCard = () => {
    const router = useRouter();

    const userList = [
        {
            number: "1",
            img: AvatarOne,
            username: "Username",
            points: "936",
        },
        {
            number: "2",
            img: AvatarTwo,
            username: "Username",
            points: "984",
        },
        {
            number: "3",
            img: AvatarThree,
            username: "Username",
            points: "1,000",
        },
    ];
    return (
        <div className="">
            <div className="tw-relative tw-grid tw-grid-cols-3 tw-gap-4 tw-px-2 sm:tw-px-4">
                <div className="tw-flex tw-justify-end ">
                    <Image
                        src={BlackMercedes}
                        width={90}
                        height={90}
                        alt="image"
                        className="tw-w-[90px] tw-h-[90px] tw-absolute tw-object-cover tw-rounded-full tw-top-[10px] tw-opacity-[50%]"
                    />
                </div>
                <div className="tw-flex tw-justify-center">
                    <Image
                        src={BlackMercedes}
                        width={100}
                        height={100}
                        alt="image"
                        className="tw-w-[100px] tw-h-[100px] tw-absolute tw-object-cover tw-rounded-full "
                    />
                </div>
                <div className="tw-flex tw-justify-start">
                    <Image
                        src={BlackMercedes}
                        width={90}
                        height={90}
                        alt="image"
                        className="tw-w-[90px] tw-h-[90px] tw-absolute tw-object-cover tw-rounded-full tw-top-[10px] tw-opacity-[50%]"
                    />
                </div>
            </div>
            <div className="tw-bg-[#1A2C3D] tw-w-auto sm:tw-w-[416px] tw-text-center tw-p-4 tw-rounded-lg tw-mt-12 tw-pt-20">
                <div className="tw-text-[18px] tw-font-bold">
                    2000s Tournament
                </div>
                <div className="tw-text-[#53944F]">Just Ended</div>
                <div>
                    {userList.map((user) => (
                        <div
                            key={user.username}
                            className="tw-flex tw-items-center tw-justify-between tw-my-3"
                        >
                            <div className="tw-flex tw-items-center">
                                <div>{user.number}</div>
                                <Image
                                    src={user.img}
                                    width={40}
                                    height={40}
                                    alt="avatar"
                                    className="tw-w-[40px] tw-h-[40px] tw-mx-3"
                                />
                                <div>{user.username}</div>
                            </div>
                            <div className="tw-text-[#F2CA16] tw-font-bold">{`${user.points} pts.`}</div>
                        </div>
                    ))}

                    {/* other users*/}
                </div>
                <div>
                    <button
                        className="btn-yellow tw-w-full"
                        onClick={() => router.push("/tournament_page")}
                    >
                        View Results
                    </button>
                </div>
            </div>
        </div>
    );
};

export const TournamentsListCard = () => {
    const tournamentsListCardData = {
        name: "1974 Maserati Bora 4.9",
        description:
            "Nisi anim cupidatat elit proident ipsum reprehenderit adipisicing ullamco do pariatur quis sunt exercitation officia. Tempor magna duis mollit culpa. Laborum esse eu occaecat dolor laborum exercitation. Sunt labore et sunt consequat culpa velit non do culpa ex tempor irure. Deserunt est exercitation consectetur nisi id.",
        deadline: "05:16:00",
    };

    const timerValues = useTimer();
    return (
        <TimerProvider deadline={new Date()}>
            <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 tw-gap-8 tw-mt-8">
                <Image
                    src={CarTournamnetsListOne}
                    width={416}
                    height={240}
                    alt="car"
                    className="tw-w-full tw-h-auto tw-object-cover tw-aspect-auto"
                />
                <div>
                    <div className="tw-opacity-30 tw-text-2xl tw-font-bold">
                        1
                    </div>
                    <div className="tw-text-2xl tw-font-bold tw-mt-4">
                        {tournamentsListCardData.name}
                    </div>
                    <div className="tw-h-[72px] tw-ellipsis tw-overflow-hidden">
                        {tournamentsListCardData.description}
                    </div>
                    <div className="tw-flex tw-mt-4">
                        <Image
                            src={HourGlass}
                            width={20}
                            height={20}
                            alt="car"
                            className="tw-w-5 tw-h-5"
                        />
                        <span className="tw-text-[#F2CA16] tw-font-bold tw-ml-2">{`${timerValues.days}:${timerValues.hours}:${timerValues.minutes}:${timerValues.seconds}`}</span>
                    </div>
                </div>
            </div>
        </TimerProvider>
    );
};
