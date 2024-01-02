import React, { useEffect, useState } from "react";
import Image from "next/image";
import { getCarsWithFilter } from "@/lib/data";
import { TimerProvider, useTimer } from "../_context/TimerContext";
import Link from "next/link";

import HourGlassIcon from "../../../public/images/hour-glass.svg";
import LiveGamesIcon from "../../../public/images/currency-dollar-circle.svg";
import ArrowRight from "../../../public/images/arrow-right.svg";
import ArrowLeft from "../../../public/images/arrow-left.svg";
import AvatarOne from "../../../public/images/avatar-one.svg";
import AvatarTwo from "../../../public/images/avatar-two.svg";
import AvatarThree from "../../../public/images/avatar-three.svg";
import AvatarFour from "../../../public/images/avatar-four.svg";
import { MoonLoader } from "react-spinners";
import dynamic from "next/dynamic";

const LiveGames = () => {
  const [liveGames, setLiveGames] = useState([]);

  const DynamicLiveGamesCard = dynamic(
    () => import("@/app/components/live_games_card"),
    {
      loading: () => <MoonLoader color="#ffe500" />,
    }
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const liveGamesData = await getCarsWithFilter({ limit: 5 });

        if (liveGamesData && "cars" in liveGamesData) {
          setLiveGames(liveGamesData.cars);
        } else {
          console.error("Unexpected data structure:", liveGamesData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);
  return (
    <div className="section-container tw-py-8 sm:tw-py-16">
      <header className="tw-flex tw-justify-between">
        <div className="tw-flex tw-items-center">
          <Image
            src={LiveGamesIcon}
            width={40}
            height={40}
            alt="dollar"
            className="tw-w-10 tw-h-10"
          />
          <div className="tw-font-bold tw-text-2xl sm:tw-text-3xl tw-ml-4">
            Live Games
          </div>
        </div>
        <div className="tw-flex">
          <Image
            src={ArrowLeft}
            width={32}
            height={32}
            alt="arrow left"
            className="tw-w-8 tw-h-8 "
          />
          <Image
            src={ArrowRight}
            width={32}
            height={32}
            alt="arrow right"
            className="tw-w-8 tw-h-8 tw-ml-4"
          />
        </div>
      </header>
      <section className="tw-flex tw-flex-col sm:tw-flex-row sm:tw-w-full tw-overflow-x-auto xl:tw-overflow-visible tw-gap-4 sm:tw-gap-8 xl:tw-gap-0 xl:tw-justify-between tw-mt-8">
        {liveGames.map((auctions, index) => {
          const {
            image,
            year,
            make,
            model,
            description,
            deadline,
            auction_id,
            price,
            _id,
          } = auctions;
          return (
            <TimerProvider key={index} deadline={deadline}>
              <div className="tw-w-[200px] sm:tw-w-[416px]">
                <DynamicLiveGamesCard
                  object_id={_id}
                  image={image}
                  year={year}
                  make={make}
                  model={model}
                  description={description}
                  deadline={deadline}
                  auction_id={auction_id}
                  price={price}
                />
              </div>
            </TimerProvider>
          );
        })}
      </section>
    </div>
  );
};

export default LiveGames;

const LiveGamesCard: React.FC<any> = ({
  image,
  year,
  make,
  model,
  description,
  deadline,
  auction_id,
}) => {
  const playersData = [
    {
      id: "pl1",
      username: "user1",
      avatar: AvatarOne,
    },
    {
      id: "pl2",
      username: "user2",
      avatar: AvatarTwo,
    },
    {
      id: "pl3",
      username: "user2",
      avatar: AvatarThree,
    },
    {
      id: "pl4",
      username: "user2",
      avatar: AvatarFour,
    },
    {
      id: "pl5",
      username: "user2",
      avatar: AvatarOne,
    },
    {
      id: "pl6",
      username: "user2",
      avatar: AvatarTwo,
    },
    {
      id: "pl7",
      username: "user2",
      avatar: AvatarThree,
    },
  ];

  const timerValues = useTimer();
  return (
    <Link
      href={`/auctions/car_view_page/${auction_id}`}
      className="tw-w-auto tw-flex tw-flex-row sm:tw-flex-col tw-items-center tw-justify-center"
    >
      <div className="tw-w-[120px] sm:tw-w-[200px] tw-h-[138px] sm:tw-h-[218px] tw-relative">
        <div className="tw-w-[61px] tw-h-[36px] tw-bg-red-500 tw-rounded-s-full tw-rounded-e-full tw-flex tw-justify-center tw-items-center tw-absolute tw-bottom-0 tw-left-[30px] sm:tw-left-[70px]">
          LIVE
        </div>
        <Image
          src={image}
          width={200}
          height={200}
          alt="car"
          className="tw-w-[120px] sm:tw-w-[200px] tw-h-[120px] sm:tw-h-[200px] tw-rounded-full tw-object-cover tw-border-solid tw-border-4 tw-border-red-500"
        />
      </div>
      <div className="tw-ml-4 sm:tw-ml-0">
        <div className="info tw-my-3 tw-flex tw-flex-col tw-items-start sm:tw-items-center">
          <div className="tw-mt-0 sm:tw-mt-3 tw-font-medium tw-line-clamp-2 tw-w-40 tw-text-center">{`${year} ${make} ${model} `}</div>
          <div className="tw-flex tw-items-center">
            <Image
              src={HourGlassIcon}
              width={12}
              height={14}
              alt="hour glass"
              className="tw-w-[12px] tw-h-[14px] tw-mr-1 "
            />
            <div>{`${timerValues.days}:${timerValues.hours}:${timerValues.minutes}:${timerValues.seconds}`}</div>
          </div>
          <div className="avatars-container tw-mt-2 sm:tw-mt-4 tw-flex sm:tw-justify-center tw-w-full">
            <div className="tw-flex sm:tw-translate-x-[20%]">
              {playersData.slice(0, 5).map((item) => {
                return (
                  <div
                    key={item.id}
                    style={{
                      transform: `translate(${
                        -10 + -10 * playersData.slice(0, 5).indexOf(item)
                      }px ,0)`,
                    }}
                  >
                    <Image
                      src={item.avatar}
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
        </div>
        <div className="tw-mt-1.5"></div>
      </div>
    </Link>
  );
};
