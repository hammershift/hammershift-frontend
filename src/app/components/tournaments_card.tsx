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
import { useSession } from "next-auth/react";

const TournamentsCard = ({
  tournament_id,
  pot,
  title,
  deadline,
  tournament_deadline,
  images,
  tournamentPoints,
}: any) => {
  const { data: session } = useSession();
  const [buyInEnded, setIsBuyInEnded] = useState(false);
  const [tournamentEnded, setIsTournamentEnded] = useState(false);
  const timerValues = useTimer();

  const router = useRouter();

  useEffect(() => {
    const intervalId = setInterval(() => {
      const currentDate = new Date();
      const buyInDeadlineDate = new Date(deadline);
      const tournamentDeadlineDate = new Date(tournament_deadline);

      if (currentDate > buyInDeadlineDate) {
        setIsBuyInEnded(true);
      }

      if (currentDate > tournamentDeadlineDate) {
        setIsTournamentEnded(true);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [deadline, tournament_deadline]);

  return (
    <div className="hover:tw-scale-110 tw-transform tw-transition-all tw-duration-100">
      <div className="tw-relative tw-grid tw-grid-cols-3 tw-gap-4 tw-px-2 sm:tw-px-4 tw-z-10">
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
          <p className="tw-text-red-600 tw-font-bold">Tournament has ended</p>
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

        <div className="tw-h-40 tw-px-2 tw-py-1 tw-my-3 tw-bg-[#1A2C3D]">
          {buyInEnded ? (
            <>
              {tournamentPoints && tournamentPoints.length === 0 ? (
                <div className="tw-bg-[#1A2C3D] tw-p-4 tw-h-36 tw-flex tw-justify-center tw-items-center tw-gap-2 tw-rounded-[4px] tw-my-3">
                  <div>Buy-in has ended, no players joined</div>
                </div>
              ) : (
                <>
                  {tournamentPoints &&
                    tournamentPoints
                      .slice(0, 3)
                      .map((item: any, index: number) => (
                        <div
                          key={index}
                          className="tw-flex tw-items-center tw-justify-between tw-my-3"
                        >
                          <div className="tw-flex tw-items-center">
                            <div>{index + 1}</div>
                            <Image
                              src={item.user.image}
                              width={40}
                              height={40}
                              alt={"avatar"}
                              className="tw-w-[40px] tw-h-[40px] tw-mx-3 tw-rounded-full"
                            />
                            <div>{item.user.username}</div>
                          </div>
                          <div className="tw-text-[#F2CA16] tw-font-bold">
                            {Array.isArray(item.auctionScores) &&
                            item.auctionScores.length > 0
                              ? `${item.auctionScores.reduce(
                                  (acc: number, scoreObj: { score: number }) =>
                                    acc + scoreObj.score,
                                  0
                                )} pts.`
                              : "0 pts."}
                          </div>
                        </div>
                      ))}
                </>
              )}
            </>
          ) : (
            <>
              {tournamentPoints && tournamentPoints.length === 0 ? (
                <div className="tw-bg-[#1A2C3D] tw-p-4 tw-h-36 tw-flex tw-justify-center tw-items-center tw-gap-2 tw-rounded-[4px] tw-my-3">
                  <div className="tw-flex tw-items-center">
                    {" "}
                    <Image
                      src={AvatarThree}
                      width={40}
                      height={40}
                      alt={"avatar"}
                      className="tw-w-[40px] tw-h-[40px] tw-mx-1 tw-rounded-full"
                    />
                    <div>Join this tournament</div>
                  </div>
                </div>
              ) : (
                <>
                  {tournamentPoints &&
                    tournamentPoints
                      .slice(0, 3)
                      .map((item: any, index: number) => (
                        <div
                          key={index}
                          className="tw-flex tw-items-center tw-justify-between tw-my-3"
                        >
                          <div className="tw-flex tw-items-center">
                            <Image
                              src={item.user.image}
                              width={40}
                              height={40}
                              alt={"avatar"}
                              className="tw-w-[40px] tw-h-[40px] tw-mx-3 tw-rounded-full"
                            />
                            <div>
                              {session?.user.username === item.user.username
                                ? "You joined the tournament"
                                : `${item.user.username} has joined the tournament`}
                            </div>
                          </div>
                        </div>
                      ))}
                </>
              )}
            </>
          )}
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
