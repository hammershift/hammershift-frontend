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
      <div className="flex flex-col justify-between place-items-stretch h-full divide-slate-700">
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
              className="w-full 2xl:w-[416px] h-auto 2xl:h-[219px] rounded object-cover aspect-auto hover:cursor-pointer"
              onMouseEnter={handleOnHover}
              onMouseLeave={handleOnLeave}
            />
          </Link>
          <Link
            target="_blank"
            rel="noopener noreferrer"
            href={`/auctions/car_view_page/${props.auction_id}`}
            className="font-bold text-[24px] py-[12px] hover:cursor-pointer inline-block"
          >
            {props.year} {props.make} {props.model}
          </Link>
          <p className="h-[60px] sm:h-[72px] w-full line-clamp-3 overflow-hidden text-[14px] sm:text-[16px]">
            {props.description[0]}
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
              ${currencyString}
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
            {new Date(props.deadline) < new Date() ? (
              <div className="font-bold text-[#C2451E]">
                Ended {dayjs(props.deadline).fromNow()}
              </div>
            ) : (
              <div className="font-bold text-[#C2451E]">{`${timerValues.days}:${timerValues.hours}:${timerValues.minutes}:${timerValues.seconds}`}</div>
            )}
          </div>
          <CardWagersSection objectID={props.object_id} />
        </div>
        <div className="items-end">
          <button
            className="btn-yellow-thin w-full md:w-auto"
            onClick={() =>
              router.push(`/auctions/car_view_page/${props.auction_id}`)
            }
          >
            Play Game
          </button>
          <hr className="h-px mt-8 sm:mt-16 border-1" />
        </div>
      </div>
    </TimerProvider>
  );
};

export default GamesCard;
