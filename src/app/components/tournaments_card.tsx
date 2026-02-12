"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AvatarOne from "../../../public/images/avatar-one.svg";
import AvatarThree from "../../../public/images/avatar-three.svg";
import AvatarTwo from "../../../public/images/avatar-two.svg";
import HourGlass from "../../../public/images/hour-glass.svg";
import PrizeIcon from "../../../public/images/monetization-browser-bag.svg";
import DefaultOne from "../../../public/images/tournament-wager/sedan-photo-one.svg";
import DefaultThree from "../../../public/images/tournament-wager/sedan-photo-three.svg";
import DefaultTwo from "../../../public/images/tournament-wager/sedan-photo-two.svg";
import { useTimer } from "../context/TimerContext";
import "../styles/app.css";

const TournamentsCard = ({
  tournament_id,
  pot,
  title,
  deadline,
  tournament_deadline,
  images,
  tournamentPoints,
  canceledTournament,
}: any) => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const timerValues = useTimer();
  const router = useRouter();
  const avatars = [AvatarOne, AvatarTwo, AvatarThree];

  const [buyInEnded, setIsBuyInEnded] = useState(false);
  const [tournamentEnded, setIsTournamentEnded] = useState(false);

  const sortedTournamentPoints = tournamentPoints
    ? tournamentPoints.sort((a: any, b: any) => a.totalScore - b.totalScore)
    : [];

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
    <div className="mt-4 flex w-full items-center justify-center">
      <div className="transform transition-all duration-100 hover:scale-105">
        <div className="relative z-10 grid grid-cols-3 gap-4 px-2 sm:px-4">
          {images && images.length > 0 && (
            <>
              <div className="flex justify-end">
                <Image
                  src={images[0] === undefined ? DefaultOne : images[0]}
                  width={90}
                  height={90}
                  alt="image"
                  className={`absolute top-[10px] h-[90px] w-[90px] rounded-full object-cover opacity-[50%] ${
                    pathname === "/tournaments"
                      ? "lg:absolute lg:left-[160px] lg:top-[10px] lg:h-[90px] lg:w-[90px] lg:rounded-full lg:object-cover"
                      : null
                  }`}
                />
              </div>
              <div className="flex justify-center">
                <Image
                  src={images[1] === undefined ? DefaultTwo : images[1]}
                  width={100}
                  height={100}
                  alt="image"
                  className="absolute h-[100px] w-[100px] rounded-full object-cover"
                />
              </div>
              <div className="flex justify-start">
                <Image
                  src={images[2] === undefined ? DefaultThree : images[2]}
                  width={90}
                  height={90}
                  alt="image"
                  className={`absolute top-[10px] h-[90px] w-[90px] rounded-full object-cover opacity-[50%] ${
                    pathname === "/tournaments"
                      ? "lg:absolute lg:right-[160px] lg:top-[10px] lg:h-[90px] lg:w-[90px] lg:rounded-full lg:object-cover"
                      : null
                  }`}
                />
              </div>
            </>
          )}
        </div>
        <div
          className={`bg-[#1A2C3D] ${
            pathname === "/tournaments" ? "lg:w-[650px]" : "lg:w-[416px]"
          } mt-12 w-[346px] rounded-lg p-4 pt-20 text-center`}
        >
          <div className="text-[18px] font-bold">{title}</div>
          <div className="flex items-center justify-center">
            <Image
              src={PrizeIcon}
              width={20}
              height={20}
              alt="dollar"
              className="mx-1 h-5 w-5"
            />
            <div className="font-bold text-white">${pot}</div>
          </div>
          {tournamentEnded ? (
            <p className="font-bold text-red-600">Tournament has ended</p>
          ) : buyInEnded ? (
            <p className="font-bold text-green-600">Buy-in period has ended</p>
          ) : (
            <div className="flex items-center justify-center">
              <Image
                src={HourGlass}
                width={20}
                height={20}
                alt="dollar"
                className="mx-1 h-5 w-5"
              />
              <div className="font-bold text-green-600">
                {timerValues.days}:{timerValues.hours}:{timerValues.minutes}:
                {timerValues.seconds}
              </div>
            </div>
          )}
          <div className="my-3 h-40 bg-[#1A2C3D] px-2 py-1">
            {tournamentEnded ? (
              tournamentPoints && tournamentPoints.length === 0 ? (
                <div className="my-3 flex h-36 items-center justify-center gap-2 rounded-[4px] bg-[#1A2C3D] p-4">
                  <div>Tournament has ended, no players joined</div>
                </div>
              ) : (
                <>
                  {sortedTournamentPoints &&
                    sortedTournamentPoints
                      .slice(0, 3)
                      .map((item: any, index: number) => (
                        <div
                          key={index}
                          className="my-3 flex items-center justify-between"
                        >
                          <div className="flex items-center">
                            <div>{index + 1}</div>
                            <Image
                              src={
                                item.user.image
                                  ? item.user.image
                                  : avatars[index]
                              }
                              width={40}
                              height={40}
                              alt={"avatar"}
                              className="mx-3 h-[40px] w-[40px] rounded-full"
                            />
                            <div>
                              {sortedTournamentPoints.length > 2 && index === 0
                                ? item.user.username + " 🎉"
                                : item.user.username}{" "}
                            </div>
                          </div>
                          <div className="font-bold text-[#F2CA16]">
                            {item.auctionScores && item.auctionScores.length > 0
                              ? `${item.totalScore} pts.`
                              : "0 pts."}
                          </div>
                        </div>
                      ))}
                </>
              )
            ) : buyInEnded ? (
              <>
                {tournamentPoints && tournamentPoints.length === 0 ? (
                  <div className="my-3 flex h-36 items-center justify-center gap-2 rounded-[4px] bg-[#1A2C3D] p-4">
                    <div>Buy-in has ended, no players joined</div>
                  </div>
                ) : (
                  <>
                    {sortedTournamentPoints &&
                      sortedTournamentPoints
                        .slice(0, 3)
                        .map((item: any, index: number) => (
                          <div
                            key={index}
                            className="my-3 flex items-center justify-between"
                          >
                            <div className="flex items-center">
                              <div>{index + 1}</div>
                              <Image
                                src={
                                  item.user.image
                                    ? item.user.image
                                    : avatars[index]
                                }
                                width={40}
                                height={40}
                                alt={"avatar"}
                                className="mx-3 h-[40px] w-[40px] rounded-full"
                              />
                              <div>{item.user.username}</div>
                            </div>
                            <div className="font-bold text-[#F2CA16]">
                              {item.auctionScores &&
                              item.auctionScores.length > 0
                                ? `${item.totalScore} pts.`
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
                  <div className="my-3 flex h-36 items-center justify-center gap-2 rounded-[4px] bg-[#1A2C3D] p-4">
                    <div className="flex items-center">
                      {" "}
                      <Image
                        src={AvatarThree}
                        width={40}
                        height={40}
                        alt={"avatar"}
                        className="mx-1 h-[40px] w-[40px] rounded-full"
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
                            className="my-3 flex items-center justify-between"
                          >
                            <div className="flex items-center">
                              <Image
                                src={
                                  item.user.image
                                    ? item.user.image
                                    : avatars[index]
                                }
                                width={40}
                                height={40}
                                alt={"avatar"}
                                className="mx-3 h-[40px] w-[40px] rounded-full"
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
            {canceledTournament ? (
              <button
                className="h-10 w-full rounded-md bg-white font-bold text-black"
                onClick={() => router.push(`/tournaments/${tournament_id}`)}
              >
                Tournament Cancelled
              </button>
            ) : tournamentEnded ? (
              <button
                className="h-10 w-full rounded-md bg-[#f2ca16] font-bold text-black"
                onClick={() => router.push(`/tournaments/${tournament_id}`)}
              >
                View Results 🏆
              </button>
            ) : (
              <button
                className="h-10 w-full rounded-md bg-white font-bold text-black"
                onClick={() => router.push(`/tournaments/${tournament_id}`)}
              >
                {/* View Results */}
                View Tournament
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentsCard;
