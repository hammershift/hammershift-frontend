"use client";

import "../styles/app.css";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Dollar from "../../../public/images/dollar.svg";
import HourGlass from "../../../public/images/hour-glass.svg";
import { TimerProvider, useTimer } from "../_context/TimerContext";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { CardWagersSection } from "./card";

const GamesCard = (props: any) => {
  const [imageSrc, setImageSrc] = useState(props.image);
  const [index, setIndex] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const timerValues = useTimer();
  dayjs.extend(relativeTime);
  const currencyString = new Intl.NumberFormat().format(props.price);

  const handleOnHover = () => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      setIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % props.imageList.length;
        setImageSrc(props.imageList[nextIndex].src);
        return nextIndex;
      });
    }, 1000);
  };

  const handleOnLeave = () => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
    }
    setImageSrc(props.image);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <TimerProvider deadline={new Date()}>
      <div className="tw-flex tw-flex-col tw-justify-between tw-place-items-stretch tw-h-full tw-divide-slate-700">
        <div>
          <Link
            target="_blank"
            rel="noopener noreferrer"
            href={`/auctions/car_view_page/${props.auction_id}`}
          >
            <img
              src={imageSrc}
              width={416}
              height={219}
              alt={props.make}
              className="tw-w-full 2xl:tw-w-[416px] tw-h-auto 2xl:tw-h-[219px] tw-rounded tw-object-cover tw-aspect-auto hover:tw-cursor-pointer"
              onMouseEnter={handleOnHover}
              onMouseLeave={handleOnLeave}
            />
          </Link>
          <Link
            target="_blank"
            rel="noopener noreferrer"
            href={`/auctions/car_view_page/${props.auction_id}`}
            className="tw-font-bold tw-text-[24px] tw-py-[12px] hover:tw-cursor-pointer tw-inline-block"
          >
            {props.year} {props.make} {props.model}
          </Link>
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
            <div className="tw-px-2 tw-hidden sm:tw-block">Current Bid:</div>
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
            <div className="tw-px-2 tw-hidden sm:tw-block">Time Left:</div>
            {new Date(props.deadline) < new Date() ? (
              <div className="tw-font-bold tw-text-[#C2451E]">
                Ended {dayjs(props.deadline).fromNow()}
              </div>
            ) : (
              <div className="tw-font-bold tw-text-[#C2451E]">{`${timerValues.days}:${timerValues.hours}:${timerValues.minutes}:${timerValues.seconds}`}</div>
            )}
          </div>
          <CardWagersSection objectID={props.object_id} />
        </div>
        <div className="tw-items-end">
          <button
            className="btn-yellow-thin tw-w-full md:tw-w-auto"
            onClick={() =>
              router.push(`/auctions/car_view_page/${props.auction_id}`)
            }
          >
            Play Game
          </button>
          <hr className="tw-h-px tw-mt-8 sm:tw-mt-16 tw-border-1" />
        </div>
      </div>
    </TimerProvider>
  );
};

export default GamesCard;
