"use client";

import "../styles/app.css";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import HourGlass from "../../../public/images/hour-glass.svg";
import AvatarOne from "../../../public/images/avatar-one.svg";
import AvatarTwo from "../../../public/images/avatar-two.svg";
import AvatarThree from "../../../public/images/avatar-three.svg";
import { useTimer } from "../_context/TimerContext";

const TournamentsCard = ({
  tournament_id,
  pot,
  title,
  deadline,
  tournament_deadline,
  images,
}: any) => {
  const [buyInEnded, setIsBuyInEnded] = useState(false);
  const [tournamentEnded, setIsTournamentEnded] = useState(false);
  const timerValues = useTimer();

  const router = useRouter();

  useEffect(() => {
    const intervalId = setInterval(() => {
      const buyInDeadlineDate = new Date(deadline);
      const tournamentDeadlineDate = new Date(tournament_deadline);
      if (new Date() > buyInDeadlineDate) {
        setIsBuyInEnded(true);
      }
      if (
        new Date() > tournamentDeadlineDate &&
        tournamentDeadlineDate > buyInDeadlineDate
      ) {
        setIsBuyInEnded(false);
        setIsTournamentEnded(true);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [deadline, tournament_deadline]);

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
    <div>
      <div className="tw-relative tw-grid tw-grid-cols-3 tw-gap-4 tw-px-2 sm:tw-px-4">
        {images && images.length > 0 && (
          <>
            <div className="tw-flex tw-justify-end ">
              <Image
                src={images[0]}
                width={90}
                height={90}
                alt="image"
                className="tw-w-[90px] tw-h-[90px] tw-absolute tw-object-cover tw-rounded-full tw-top-[10px] tw-opacity-[50%]"
              />
            </div>
            <div className="tw-flex tw-justify-center">
              <Image
                src={images[1]}
                width={100}
                height={100}
                alt="image"
                className="tw-w-[100px] tw-h-[100px] tw-absolute tw-object-cover tw-rounded-full "
              />
            </div>
            <div className="tw-flex tw-justify-start">
              <Image
                src={images[2]}
                width={90}
                height={90}
                alt="image"
                className="tw-w-[90px] tw-h-[90px] tw-absolute tw-object-cover tw-rounded-full tw-top-[10px] tw-opacity-[50%]"
              />
            </div>
          </>
        )}
      </div>
      <div className="tw-bg-[#1A2C3D] tw-w-auto sm:tw-w-[416px] tw-text-center tw-p-4 tw-rounded-lg tw-mt-12 tw-pt-20">
        <div className="tw-text-[18px] tw-font-bold">{title}</div>
        {tournamentEnded ? (
          <p className="tw-text-green-600 tw-font-bold">Tournament has ended</p>
        ) : buyInEnded ? (
          <p className="tw-text-green-600 tw-font-bold">
            Buy-in period has ended
          </p>
        ) : (
          <div className="tw-flex tw-items-center tw-justify-center">
            <Image
              src={HourGlass}
              width={20}
              height={20}
              alt="dollar"
              className="tw-w-5 tw-h-5 tw-mx-1"
            />
            <div className="tw-text-green-600 tw-font-bold">
              {timerValues.days}:{timerValues.hours}:{timerValues.minutes}:
              {timerValues.seconds}
            </div>
          </div>
        )}

        <div>
          {userList.map((user) => (
            <div
              key={user.number}
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
            className="tw-text-black tw-bg-white tw-font-bold tw-rounded-md tw-h-10 tw-w-full"
            onClick={() => router.push(`/tournaments/${tournament_id}`)}
          >
            {/* View Results */}
            View Tournament
          </button>
        </div>
      </div>
    </div>
  );
};

export default TournamentsCard;
