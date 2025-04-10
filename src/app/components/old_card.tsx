"use client";

import "../styles/app.css";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Dollar from "../../../public/images/dollar.svg";
import HourGlass from "../../../public/images/hour-glass.svg";
import AvatarTwo from "../../../public/images/avatar-two.svg";
import AvatarThree from "../../../public/images/avatar-three.svg";
import AvatarFour from "../../../public/images/avatar-four.svg";
import { TimerProvider, useTimer } from "../_context/TimerContext";
import { getWagers } from "@/lib/data";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

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
  images_list,
}) => {
  const [imageSrc, setImageSrc] = useState(image);
  const [index, setIndex] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const timerValues = useTimer();
  dayjs.extend(relativeTime);

  const handleOnHover = () => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      setIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % images_list.length;
        setImageSrc(images_list[nextIndex].src);
        return nextIndex;
      });
    }, 1000);
  };

  const handleOnLeave = () => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
    }
    setImageSrc(image);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <TimerProvider deadline={new Date(deadline)}>
      <div className="flex flex-col justify-between h-auto">
        <div>
          <Link
            target="_blank"
            rel="noopener noreferrer"
            href={`/auctions/car_view_page/${auction_id}`}
          >
            <img
              src={imageSrc}
              width={416}
              height={219}
              alt={make}
              className="w-full 2xl:w-[416px] h-auto 2xl:h-[219px] rounded object-cover aspect-auto hover:cursor-pointer"
              onMouseEnter={handleOnHover}
              onMouseLeave={handleOnLeave}
            />
          </Link>
          <Link
            target="_blank"
            rel="noopener noreferrer"
            href={`/auctions/car_view_page/${auction_id}`}
            className="font-bold text-[24px] py-[12px] hover:cursor-pointer inline-block"
          >
            {year} {make} {model}
          </Link>
          <p className="h-[60px] sm:h-[72px] w-full line-clamp-3 overflow-hidden text-[14px] sm:text-[16px]">
            {description}
          </p>
          <div className="flex mt-3">
            <Image
              src={Dollar}
              width={20}
              height={20}
              alt="dollar"
              className="w-5 h-5"
            />
            <div className="px-2 hidden sm:block">Current Bid:</div>
            <div className="text-[#49C742] font-bold">
              ${new Intl.NumberFormat().format(price)}
            </div>
          </div>
          <div className="flex">
            <Image
              src={HourGlass}
              width={20}
              height={20}
              alt="dollar"
              className="w-5 h-5"
            />
            <div className="px-2 hidden sm:block">Time Left:</div>
            {new Date(deadline) < new Date() ? (
              <div className="font-bold text-[#C2451E]">
                Ended {dayjs(deadline).fromNow()}
              </div>
            ) : (
              <div className="font-bold text-[#C2451E]">{`${timerValues.days}:${timerValues.hours}:${timerValues.minutes}:${timerValues.seconds}`}</div>
            )}
          </div>
          <CardWagersSection objectID={object_id} />
        </div>
        <div>
          <button
            className="btn-yellow-thin w-full mt-4 sm:w-auto"
            onClick={() => router.push(`/auctions/car_view_page/${auction_id}`)}
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
        <div className="bg-[#172431] p-4 flex gap-2 rounded-[4px] my-4">
          <Image
            src={AvatarFour}
            width={24}
            height={24}
            alt="dollar"
            className="w-[24px] h-[24px] rounded-full"
          />
          <div>Be the first to wager a price</div>
        </div>
      )}
      {auctionWagers.length !== 0 && (
        <div className="gap-2 bg-[#172431] p-2 sm:p-4 my-4 text-[14px] sm:text-[16px] rounded-[4px]">
          <div
            className={`flex flex-col gap-2 ${auctionWagers.length >= 3 && "mb-3"
              }`}
          >
            {auctionWagers.slice(0, 2).map((wager: any) => {
              return (
                <div
                  key={wager.auctionObjectId}
                  className="flex  items-center gap-2"
                >
                  <Image
                    src={wager.user?.image ? wager.user.image : AvatarTwo}
                    width={24}
                    height={24}
                    alt="dollar"
                    className="w-[24px] h-[24px] rounded-full"
                  />
                  <div className="flex flex-col sm:flex-row text-sm gap-1 sm:items-center">
                    <div className="text-[#42A0FF]">{`@${wager.user.username}`}</div>
                    <div>{`wagered $${new Intl.NumberFormat().format(
                      wager.priceGuessed
                    )}`}</div>
                    <div className="text-[#DCE0D9]">
                      {dayjs(wager.createdAt).fromNow()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {auctionWagers.length >= 3 && (
            <div className="relative flex items-center">
              {/* avatar images - hidden for screens smaller than sm */}
              <div className="flex items-center gap-2">
                <div className=" w-auto hidden xl:flex">
                  <Image
                    src={
                      (auctionWagers[2] as any).user.image
                        ? (auctionWagers[2] as any).user.image
                        : AvatarTwo
                    }
                    width={32}
                    height={32}
                    alt="avatar"
                    className="w-8 h-8 rounded-full"
                    style={{
                      border: "1px solid black",
                    }}
                  />
                  <div className="flex">
                    {auctionWagers
                      .slice(3, 8)
                      .map((wager: any, index: number) => {
                        return (
                          <div
                            key={wager._id + "sm"}
                            style={{
                              transform: `translate(${-10 * (index + 1)}px, 0)`,
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
                </div>
                {auctionWagers.length - 2 == 1 && (
                  <div className={`xl:block hidden text-sm`}>
                    {`and ${auctionWagers.length - 2} more player to join`}
                  </div>
                )}
                {auctionWagers.length - 2 == 2 && (
                  <div
                    className={`xl:block hidden text-sm -ml-[10px]`}
                  >
                    {`and ${auctionWagers.length - 2} more players to join`}
                  </div>
                )}
                {auctionWagers.length - 2 == 3 && (
                  <div
                    className={`xl:block hidden text-sm -ml-[20px]`}
                  >
                    {`and ${auctionWagers.length - 2} more players to join`}
                  </div>
                )}
                {auctionWagers.length - 2 == 4 && (
                  <div
                    className={`xl:block hidden text-sm -ml-[30px]`}
                  >
                    {`and ${auctionWagers.length - 2} more players to join`}
                  </div>
                )}
                {auctionWagers.length - 2 >= 5 && (
                  <div
                    className={`xl:block hidden text-sm -ml-[40px]`}
                  >
                    {`and ${auctionWagers.length - 2} more players to join`}
                  </div>
                )}
              </div>
              {/* avatar images - hidden for screens bigger than sm */}
              <div className="flex w-auto xl:hidden">
                <Image
                  src={
                    (auctionWagers[2] as any).user.image
                      ? (auctionWagers[2] as any).user.image
                      : AvatarTwo
                  }
                  width={32}
                  height={32}
                  alt="avatar"
                  className="w-8 h-8 rounded-full"
                  style={{
                    border: "1px solid black",
                  }}
                />
                <div className="flex">
                  {auctionWagers
                    .slice(3, 8)
                    .map((wager: any, index: number) => {
                      return (
                        <div
                          key={wager._id + "md"}
                          style={{
                            transform: `translate(${-10 * (index + 1)}px, 0)`,
                            zIndex: 2,
                          }}
                        >
                          <Image
                            src={
                              wager.user.image ? wager.user.image : AvatarThree
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
              </div>
              <div className="ml-1 -translate-x-1 block xl:hidden text-sm">{`${auctionWagers.length - 2
                } players`}</div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export const TournamentsListCard = (props: any) => {
  const {
    index,
    auction_id,
    hammer_price,
    img,
    year,
    make,
    model,
    description,
    deadline,
  } = props;
  const [auctionEnded, setAuctionEnded] = useState(false);
  const timerValues = useTimer();

  useEffect(() => {
    const auctionDeadlineDate = new Date(deadline);
    if (new Date() > auctionDeadlineDate) {
      setAuctionEnded(true);
    }
  }, [deadline]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-8">
      <Image
        src={img}
        width={416}
        height={240}
        alt="car"
        className="w-full h-auto object-cover aspect-auto"
      />
      <div>
        <div className="opacity-30 text-2xl font-bold">
          {index + 1}
        </div>
        <div className="text-2xl font-bold mt-4">
          {year} {make} {model}
        </div>
        <div className="h-[72px] ellipsis overflow-hidden">
          {description}
        </div>
        <div className="flex mt-4">
          {auctionEnded ? (
            <span className="text-black bg-yellow-400 rounded-md px-2 py-1 font-bold">
              Hammer Price: $
              {hammer_price
                ? new Intl.NumberFormat().format(hammer_price)
                : "--"}
            </span>
          ) : (
            <>
              <Image
                src={HourGlass}
                width={20}
                height={20}
                alt="car"
                className="w-5 h-5"
              />
              <span className="text-[#F2CA16] font-bold ml-2">{`${timerValues.days}:${timerValues.hours}:${timerValues.minutes}:${timerValues.seconds}`}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
