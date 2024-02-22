import "../styles/app.css";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Dollar from "../../../public/images/dollar.svg";
import HourGlass from "../../../public/images/hour-glass.svg";
import { TimerProvider, useTimer } from "../_context/TimerContext";
import { CardWagersSection } from "./card";

const AuctionsListCard = (props: any) => {
  const router = useRouter();
  const timerValues = useTimer();

  const currencyString = new Intl.NumberFormat().format(props.price);

  return (
    <TimerProvider deadline={new Date()}>
      <div className="tw-flex tw-flex-row tw-gap-4 sm:tw-gap-8 tw-w-full tw-max-w-[944px] ">
        <div className="tw-max-w-[156px] sm:tw-max-w-[416px] tw-w-full tw-min-w-[156px] tw-h-auto tw-h-[147px] sm:tw-h-[240px]">
          <img
            src={props.image}
            width={416}
            height={240}
            alt={props.make}
            className="tw-max-w-[156px] sm:tw-max-w-[416px] tw-w-full tw-min-w-[156px] tw-h-auto  tw-min-h-[147px] xl:tw-h-[240px] tw-rounded tw-object-cover tw-aspect-auto hover:tw-cursor-pointer"
            onClick={() =>
              router.push(`/auctions/car_view_page/${props.auction_id}`)
            }
          />
        </div>
        <div className="tw-flex tw-flex-col tw-w-auto tw-flex-grow">
          <div
            className=" tw-font-bold tw-text-[18px] sm:tw-text-[24px] hover:tw-cursor-pointer "
            onClick={() =>
              router.push(`/auctions/car_view_page/${props.auction_id}`)
            }
          >
            {props.year} {props.make} {props.model}
          </div>
          <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-4 sm:tw-gap-8 tw-mt-3 sm:tw-mt-4">
            <div className="tw-flex tw-gap-2">
              <Image
                src={Dollar}
                width={20}
                height={20}
                alt="dollar"
                className="tw-w-5 tw-h-5"
              />
              {/* <div className="tw-px-2 tw-hidden sm:tw-block">Current Bid:</div> */}
              <div className="tw-text-[#49C742] tw-font-bold">
                ${currencyString}
              </div>
            </div>
            <div className="tw-flex tw-gap-2">
              <Image
                src={HourGlass}
                width={20}
                height={20}
                alt="dollar"
                className="tw-w-5 tw-h-5"
              />
              {/* <div className="tw-px-2 tw-hidden sm:tw-block">Time Left:</div> */}
              <div className="tw-text-[#C2451E] tw-font-bold">{`${timerValues.days}:${timerValues.hours}:${timerValues.minutes}:${timerValues.seconds}`}</div>
            </div>
          </div>
          {/* <p className="tw-h-[60px] sm:tw-h-[72px] tw-w-full tw-line-clamp-3 tw-overflow-hidden tw-text-[14px] sm:tw-text-[16px]">
              {props.description[0]}
            </p> */}
          <div className="tw-hidden lg:tw-flex tw-flex-col tw-w-auto tw-flex-grow ">
            <CardWagersSection objectID={props.object_id} />
          </div>
          {/* <div>
              <button
                className="btn-yellow-thin tw-w-full tw-mt-4 md:tw-w-auto"
                onClick={() =>
                  router.push(`/auctions/car_view_page/${props.auction_id}`)
                }
              >
                Play Game
              </button>
            </div> */}
        </div>
      </div>
    </TimerProvider>
  );
};

export default AuctionsListCard;
