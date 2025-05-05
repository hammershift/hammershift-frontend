import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

import AvatarFour from "../../../public/images/avatar-four.svg";
import AvatarThree from "../../../public/images/avatar-three.svg";

import HourGlassIcon from "../../../public/images/hour-glass.svg";

import { getWagers } from "@/lib/data";
import { useTimer } from "../context/TimerContext";

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
        <div className="m-6 ">
            <Link
                href={`/auctions/car_view_page/${auction_id}`}
                className="w-auto flex flex-row sm:flex-col items-center justify-center hover:scale-110 transform transition-all duration-100"
            >
                <div className="w-[120px] sm:w-[200px] h-[138px] sm:h-[218px] pt-3 relative">
                    <div className="w-[61px] z-50 h-[36px] bg-red-500 rounded-s-full rounded-e-full flex justify-center items-center absolute bottom-0 left-[30px] sm:left-[70px]">
                        LIVE
                    </div>
                    <div className="flex justify-center items-center">
                        <div className="absolute rounded-full w-[130px] sm:w-[200px] h-[130px] sm:h-[200px] bg-red-500"></div>
                        <div className="relative w-[120px] sm:w-[185px] h-[120px] sm:h-[185px]">
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
                                            className={`${index !== 0
                                                ? "absolute top-0 left-0 z-30 bottom-0"
                                                : "z-40"
                                                } w-[120px] sm:w-[185px] h-[120px] sm:h-[185px] rounded-full object-cover z-10 pic ${"pic" +
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
                            className="w-[120px] sm:w-[185px] h-[120px] sm:h-[185px] rounded-full object-cover z-10"
                        /> */}
                        </div>
                    </div>
                </div>
                <div className="ml-4 sm:ml-0">
                    <div className="info my-3 flex flex-col items-center justify-center sm:w-auto w-[191px]">
                        <div className="mt-0 sm:mt-3 font-medium line-clamp-2 sm:w-40 sm:text-center w-full">{`${year} ${make} ${model} `}</div>
                        <div className="flex items-center sm:justify-center pt-2 w-full">
                            <Image
                                src={HourGlassIcon}
                                width={12}
                                height={14}
                                alt="hour glass"
                                className="w-[12px] h-[14px] mr-1"
                            />
                            <div className="text-sm sm:text-center">{`${timerValues.days}:${timerValues.hours}:${timerValues.minutes}:${timerValues.seconds}`}</div>
                        </div>
                        <div className="avatars-container mt-2 sm:mt-4 flex sm:justify-center w-full">
                            {!auctionWagers.length && (
                                <div className="flex items-center gap-1">
                                    <Image
                                        src={AvatarFour}
                                        width={32}
                                        height={32}
                                        alt="avatar"
                                        className="w-8 h-8 rounded-full"
                                        style={{
                                            border: "1px solid black",
                                        }}
                                    />
                                    <div className="text-base">
                                        Be the first to wager
                                    </div>
                                </div>
                            )}
                            {auctionWagers.length === 1 && (
                                <div className="flex translate-x-[30%]">
                                    {auctionWagers
                                        .slice(0, 5)
                                        .map((wager: any, index: number) => {
                                            return (
                                                <div
                                                    key={wager._id}
                                                    style={{
                                                        transform: `translate(${-10 * (index + 1)
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
                                                        className="w-8 h-8 rounded-full"
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
                                <div className="flex sm:translate-x-[24%] translate-x-[17%]">
                                    {auctionWagers
                                        .slice(0, 5)
                                        .map((wager: any, index: number) => {
                                            return (
                                                <div
                                                    key={wager._id}
                                                    style={{
                                                        transform: `translate(${-10 * (index + 1)
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
                                                        className="w-8 h-8 rounded-full"
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
                                <div className="flex sm:translate-x-[21%] translate-x-[10%]">
                                    {auctionWagers
                                        .slice(0, 5)
                                        .map((wager: any, index: number) => {
                                            return (
                                                <div
                                                    key={wager._id}
                                                    style={{
                                                        transform: `translate(${-10 * (index + 1)
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
                                                        className="w-8 h-8 rounded-full"
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
                                <div className="flex sm:translate-x-[20%] translate-x-[8%]">
                                    {auctionWagers
                                        .slice(0, 5)
                                        .map((wager: any, index: number) => {
                                            return (
                                                <div
                                                    key={wager._id}
                                                    style={{
                                                        transform: `translate(${-10 * (index + 1)
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
                                                        className="w-8 h-8 rounded-full"
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
                                <div className="flex sm:translate-x-[20%] translate-x-[6%]">
                                    {auctionWagers
                                        .slice(0, 5)
                                        .map((wager: any, index: number) => {
                                            return (
                                                <div
                                                    key={wager._id}
                                                    style={{
                                                        transform: `translate(${-10 * (index + 1)
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
                                                        className="w-8 h-8 rounded-full"
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
                    <div className="mt-1.5"></div>
                </div>
                {pathname === "/live" ? (
                    <hr className="h-px mt-8 sm:mt-16 border-1" />
                ) : null}
            </Link>

        </div>
    );
};

export default LiveGamesCard;
