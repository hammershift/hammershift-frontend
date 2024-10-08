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
      <div className="tw-flex tw-flex-col tw-justify-between tw-h-auto">
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
              className="tw-w-full 2xl:tw-w-[416px] tw-h-auto 2xl:tw-h-[219px] tw-rounded tw-object-cover tw-aspect-auto hover:tw-cursor-pointer"
              onMouseEnter={handleOnHover}
              onMouseLeave={handleOnLeave}
            />
          </Link>
          <Link
            target="_blank"
            rel="noopener noreferrer"
            href={`/auctions/car_view_page/${auction_id}`}
            className="tw-font-bold tw-text-[24px] tw-py-[12px] hover:tw-cursor-pointer tw-inline-block"
          >
            {year} {make} {model}
          </Link>
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
            <div className="tw-px-2 tw-hidden sm:tw-block">Current Bid:</div>
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
            <div className="tw-px-2 tw-hidden sm:tw-block">Time Left:</div>
            {new Date(deadline) < new Date() ? (
              <div className="tw-font-bold tw-text-[#C2451E]">
                Ended {dayjs(deadline).fromNow()}
              </div>
            ) : (
              <div className="tw-font-bold tw-text-[#C2451E]">{`${timerValues.days}:${timerValues.hours}:${timerValues.minutes}:${timerValues.seconds}`}</div>
            )}
          </div>
          <CardWagersSection objectID={object_id} />
        </div>
        <div>
          <button
            className="btn-yellow-thin tw-w-full tw-mt-4 sm:tw-w-auto"
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
        <div className="tw-bg-[#172431] tw-p-4 tw-flex tw-gap-2 tw-rounded-[4px] tw-my-4">
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
                  key={wager.auctionObjectId}
                  className="tw-flex  tw-items-center tw-gap-2"
                >
                  <Image
                    src={wager.user?.image ? wager.user.image : AvatarTwo}
                    width={24}
                    height={24}
                    alt="dollar"
                    className="tw-w-[24px] tw-h-[24px] tw-rounded-full"
                  />
                  <div className="tw-flex tw-flex-col sm:tw-flex-row tw-text-sm tw-gap-1 sm:tw-items-center">
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
                        ? (auctionWagers[2] as any).user.image
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
                {auctionWagers.length - 2 == 1 && (
                  <div className={`xl:tw-block tw-hidden tw-text-sm`}>
                    {`and ${auctionWagers.length - 2} more player to join`}
                  </div>
                )}
                {auctionWagers.length - 2 == 2 && (
                  <div
                    className={`xl:tw-block tw-hidden tw-text-sm -tw-ml-[10px]`}
                  >
                    {`and ${auctionWagers.length - 2} more players to join`}
                  </div>
                )}
                {auctionWagers.length - 2 == 3 && (
                  <div
                    className={`xl:tw-block tw-hidden tw-text-sm -tw-ml-[20px]`}
                  >
                    {`and ${auctionWagers.length - 2} more players to join`}
                  </div>
                )}
                {auctionWagers.length - 2 == 4 && (
                  <div
                    className={`xl:tw-block tw-hidden tw-text-sm -tw-ml-[30px]`}
                  >
                    {`and ${auctionWagers.length - 2} more players to join`}
                  </div>
                )}
                {auctionWagers.length - 2 >= 5 && (
                  <div
                    className={`xl:tw-block tw-hidden tw-text-sm -tw-ml-[40px]`}
                  >
                    {`and ${auctionWagers.length - 2} more players to join`}
                  </div>
                )}
              </div>
              {/* avatar images - hidden for screens bigger than sm */}
              <div className="tw-flex tw-w-auto xl:tw-hidden">
                <Image
                  src={
                    (auctionWagers[2] as any).user.image
                      ? (auctionWagers[2] as any).user.image
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
    <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 tw-gap-8 tw-mt-8">
      <Image
        src={img}
        width={416}
        height={240}
        alt="car"
        className="tw-w-full tw-h-auto tw-object-cover tw-aspect-auto"
      />
      <div>
        <div className="tw-opacity-30 tw-text-2xl tw-font-bold">
          {index + 1}
        </div>
        <div className="tw-text-2xl tw-font-bold tw-mt-4">
          {year} {make} {model}
        </div>
        <div className="tw-h-[72px] tw-ellipsis tw-overflow-hidden">
          {description}
        </div>
        <div className="tw-flex tw-mt-4">
          {auctionEnded ? (
            <span className="tw-text-black tw-bg-yellow-400 tw-rounded-md tw-px-2 tw-py-1 tw-font-bold">
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
                className="tw-w-5 tw-h-5"
              />
              <span className="tw-text-[#F2CA16] tw-font-bold tw-ml-2">{`${timerValues.days}:${timerValues.hours}:${timerValues.minutes}:${timerValues.seconds}`}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
