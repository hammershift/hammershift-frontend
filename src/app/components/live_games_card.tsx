import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import AvatarOne from "../../../public/images/avatar-one.svg";
import AvatarTwo from "../../../public/images/avatar-two.svg";
import AvatarThree from "../../../public/images/avatar-three.svg";
import AvatarFour from "../../../public/images/avatar-four.svg";

import HourGlassIcon from "../../../public/images/hour-glass.svg";

import { useTimer } from "../_context/TimerContext";
import { getWagers } from "@/lib/data";

const LiveGamesCard: React.FC<any> = ({
    image,
    year,
    make,
    model,
    description,
    deadline,
    auction_id,
    object_id,
    images_list,
    parentIndex,
}) => {
    const pathname = usePathname();

    const [auctionWagers, setAuctionWagers] = useState([]);
    const [currentImage, setCurrentImage] = useState(image);

    useEffect(() => {
        const fetchWagers = async () => {
            const wagers = await getWagers(object_id);
            setAuctionWagers(wagers);
        };
        fetchWagers();
    }, []);

    useEffect(() => {
        const imagesSrcList = images_list
            .slice(0, 5)
            .map((imageObj: { src: any }) => imageObj.src);

        const intervalId = setInterval(() => {
            setCurrentImage((prevImage: string) => {
                const currentIndex = imagesSrcList.indexOf(prevImage);
                if (currentIndex === imagesSrcList.length - 1) {
                    return image;
                } else {
                    return imagesSrcList[currentIndex + 1];
                }
            });
        }, 2000);

        return () => clearInterval(intervalId);
    }, [image, images_list]);

    const timerValues = useTimer();
    return (
        <Link
            href={`/auctions/car_view_page/${auction_id}`}
            className="tw-w-auto tw-flex tw-flex-row sm:tw-flex-col tw-items-center tw-justify-center hover:tw-scale-110 tw-transform tw-transition-all tw-duration-100"
        >
            <div className="tw-w-[120px] sm:tw-w-[200px] tw-h-[138px] sm:tw-h-[218px] tw-pt-3 tw-relative">
                <div className="tw-w-[61px] tw-z-50 tw-h-[36px] tw-bg-red-500 tw-rounded-s-full tw-rounded-e-full tw-flex tw-justify-center tw-items-center tw-absolute tw-bottom-0 tw-left-[30px] sm:tw-left-[70px]">
                    LIVE
                </div>
                <div className="tw-flex tw-justify-center tw-items-center">
                    <div className="tw-absolute tw-rounded-full tw-w-[130px] sm:tw-w-[200px] tw-h-[130px] sm:tw-h-[200px] tw-bg-red-500"></div>
                    <div className="tw-relative tw-w-[120px] sm:tw-w-[185px] tw-h-[120px] sm:tw-h-[185px]">
                        {images_list
                            .slice(0, 5)
                            .map((photo: any, index: number) => {
                                return (
                                    <Image
                                        key={photo.src}
                                        src={index === 4 ? image : photo.src}
                                        width={185}
                                        height={185}
                                        alt="car"
                                        className={`${
                                            index !== 0
                                                ? "tw-absolute tw-top-0 tw-left-0 tw-z-30 tw-bottom-0"
                                                : "tw-z-40"
                                        } tw-w-[120px] sm:tw-w-[185px] tw-h-[120px] sm:tw-h-[185px] tw-rounded-full tw-object-cover tw-z-10 pic ${
                                            "pic" +
                                            (5 - index) +
                                            "-" +
                                            parentIndex
                                        }`}
                                    />
                                );
                            })}
                        {/* <Image
                            src={currentImage}
                            width={185}
                            height={185}
                            alt="car"
                            className="tw-w-[120px] sm:tw-w-[185px] tw-h-[120px] sm:tw-h-[185px] tw-rounded-full tw-object-cover tw-z-10"
                        /> */}
                    </div>
                </div>
            </div>
            <div className="tw-ml-4 sm:tw-ml-0">
                <div className="info tw-my-3 tw-flex tw-flex-col tw-items-center tw-justify-center sm:tw-w-auto tw-w-[191px]">
                    <div className="tw-mt-0 sm:tw-mt-3 tw-font-medium tw-line-clamp-2 sm:tw-w-40 sm:tw-text-center tw-w-full">{`${year} ${make} ${model} `}</div>
                    <div className="tw-flex tw-items-center sm:tw-justify-center tw-pt-2 tw-w-full">
                        <Image
                            src={HourGlassIcon}
                            width={12}
                            height={14}
                            alt="hour glass"
                            className="tw-w-[12px] tw-h-[14px] tw-mr-1"
                        />
                        <div className="tw-text-sm sm:tw-text-center">{`${timerValues.days}:${timerValues.hours}:${timerValues.minutes}:${timerValues.seconds}`}</div>
                    </div>
                    <div className="avatars-container tw-mt-2 sm:tw-mt-4 tw-flex sm:tw-justify-center tw-w-full">
                        {!auctionWagers.length && (
                            <div className="tw-flex tw-items-center tw-gap-1">
                                <Image
                                    src={AvatarFour}
                                    width={32}
                                    height={32}
                                    alt="avatar"
                                    className="tw-w-8 tw-h-8 tw-rounded-full"
                                    style={{
                                        border: "1px solid black",
                                    }}
                                />
                                <div className="tw-text-base">
                                    Be the first to wager
                                </div>
                            </div>
                        )}
                        {auctionWagers.length === 1 && (
                            <div className="tw-flex tw-translate-x-[30%]">
                                {auctionWagers
                                    .slice(0, 5)
                                    .map((wager: any, index: number) => {
                                        return (
                                            <div
                                                key={wager._id}
                                                style={{
                                                    transform: `translate(${
                                                        -10 * (index + 1)
                                                    }px, 0)`,
                                                    zIndex: 1,
                                                }}
                                            >
                                                <Image
                                                    src={
                                                        wager.user.image
                                                            ? wager.user.image
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
                        )}
                        {auctionWagers.length === 2 && (
                            <div className="tw-flex sm:tw-translate-x-[24%] tw-translate-x-[17%]">
                                {auctionWagers
                                    .slice(0, 5)
                                    .map((wager: any, index: number) => {
                                        return (
                                            <div
                                                key={wager._id}
                                                style={{
                                                    transform: `translate(${
                                                        -10 * (index + 1)
                                                    }px, 0)`,
                                                    zIndex: 1,
                                                }}
                                            >
                                                <Image
                                                    src={
                                                        wager.user.image
                                                            ? wager.user.image
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
                        )}
                        {auctionWagers.length === 3 && (
                            <div className="tw-flex sm:tw-translate-x-[21%] tw-translate-x-[10%]">
                                {auctionWagers
                                    .slice(0, 5)
                                    .map((wager: any, index: number) => {
                                        return (
                                            <div
                                                key={wager._id}
                                                style={{
                                                    transform: `translate(${
                                                        -10 * (index + 1)
                                                    }px, 0)`,
                                                    zIndex: 1,
                                                }}
                                            >
                                                <Image
                                                    src={
                                                        wager.user.image
                                                            ? wager.user.image
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
                        )}
                        {auctionWagers.length === 4 && (
                            <div className="tw-flex sm:tw-translate-x-[20%] tw-translate-x-[8%]">
                                {auctionWagers
                                    .slice(0, 5)
                                    .map((wager: any, index: number) => {
                                        return (
                                            <div
                                                key={wager._id}
                                                style={{
                                                    transform: `translate(${
                                                        -10 * (index + 1)
                                                    }px, 0)`,
                                                    zIndex: 1,
                                                }}
                                            >
                                                <Image
                                                    src={
                                                        wager.user.image
                                                            ? wager.user.image
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
                        )}
                        {auctionWagers.length >= 5 && (
                            <div className="tw-flex sm:tw-translate-x-[20%] tw-translate-x-[6%]">
                                {auctionWagers
                                    .slice(0, 5)
                                    .map((wager: any, index: number) => {
                                        return (
                                            <div
                                                key={wager._id}
                                                style={{
                                                    transform: `translate(${
                                                        -10 * (index + 1)
                                                    }px, 0)`,
                                                    zIndex: 1,
                                                }}
                                            >
                                                <Image
                                                    src={
                                                        wager.user.image
                                                            ? wager.user.image
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
                        )}
                    </div>
                </div>
                <div className="tw-mt-1.5"></div>
            </div>
            {pathname === "/live" ? (
                <hr className="tw-h-px tw-mt-8 sm:tw-mt-16 tw-border-1" />
            ) : null}
        </Link>
    );
};

export default LiveGamesCard;
