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
    <div className="w-full flex justify-center items-center mt-4">
      <div className="hover:scale-105 transform transition-all duration-100">
        <div className="relative grid grid-cols-3 gap-4 px-2 sm:px-4 z-10">
          {images && images.length > 0 && (
            <>
              <div className="flex justify-end ">
                <Image
                  src={images[0] === undefined ? DefaultOne : images[0]}
                  width={90}
                  height={90}
                  alt="image"
                  className={`w-[90px] h-[90px] absolute object-cover rounded-full top-[10px] opacity-[50%] ${pathname === "/tournaments"
                    ? "lg:left-[160px] lg:w-[90px] lg:h-[90px] lg:absolute lg:object-cover lg:rounded-full lg:top-[10px]"
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
                  className="w-[100px] h-[100px] absolute object-cover rounded-full "
                />
              </div>
              <div className="flex justify-start">
                <Image
                  src={images[2] === undefined ? DefaultThree : images[2]}
                  width={90}
                  height={90}
                  alt="image"
                  className={`w-[90px] h-[90px] absolute object-cover rounded-full top-[10px] opacity-[50%] ${pathname === "/tournaments"
                    ? "lg:right-[160px] lg:w-[90px] lg:h-[90px] lg:absolute lg:object-cover lg:rounded-full lg:top-[10px]"
                    : null
                    }`}
                />
              </div>
            </>
          )}
        </div>
        <div
          className={`bg-[#1A2C3D] ${pathname === "/tournaments" ? "lg:w-[650px]" : "lg:w-[416px]"
            } text-center p-4 rounded-lg mt-12 pt-20 w-[346px]`}
        >
          <div className="text-[18px] font-bold">{title}</div>
          <div className="flex items-center justify-center">
            <Image
              src={PrizeIcon}
              width={20}
              height={20}
              alt="dollar"
              className="w-5 h-5 mx-1"
            />
            <div className="text-white font-bold">${pot}</div>
          </div>
          {tournamentEnded ? (
            <p className="text-red-600 font-bold">Tournament has ended</p>
          ) : buyInEnded ? (
            <p className="text-green-600 font-bold">
              Buy-in period has ended
            </p>
          ) : (
            <div className="flex items-center justify-center">
              <Image
                src={HourGlass}
                width={20}
                height={20}
                alt="dollar"
                className="w-5 h-5 mx-1"
              />
              <div className="text-green-600 font-bold">
                {timerValues.days}:{timerValues.hours}:{timerValues.minutes}:
                {timerValues.seconds}
              </div>
            </div>
          )}
          <div className="h-40 px-2 py-1 my-3 bg-[#1A2C3D]">
            {tournamentEnded ? (
              tournamentPoints && tournamentPoints.length === 0 ? (
                <div className="bg-[#1A2C3D] p-4 h-36 flex justify-center items-center gap-2 rounded-[4px] my-3">
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
                          className="flex items-center justify-between my-3"
                        >
                          <div className="flex items-center">
                            <div>{index + 1}</div>
                            <Image
                              src={
                                item.user.image ? item.user.image : avatars[index]
                              }
                              width={40}
                              height={40}
                              alt={"avatar"}
                              className="w-[40px] h-[40px] mx-3 rounded-full"
                            />
                            <div>
                              {sortedTournamentPoints.length > 2 && index === 0
                                ? item.user.username + " 🎉"
                                : item.user.username}{" "}
                            </div>
                          </div>
                          <div className="text-[#F2CA16] font-bold">
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
                  <div className="bg-[#1A2C3D] p-4 h-36 flex justify-center items-center gap-2 rounded-[4px] my-3">
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
                            className="flex items-center justify-between my-3"
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
                                className="w-[40px] h-[40px] mx-3 rounded-full"
                              />
                              <div>{item.user.username}</div>
                            </div>
                            <div className="text-[#F2CA16] font-bold">
                              {item.auctionScores && item.auctionScores.length > 0
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
                  <div className="bg-[#1A2C3D] p-4 h-36 flex justify-center items-center gap-2 rounded-[4px] my-3">
                    <div className="flex items-center">
                      {" "}
                      <Image
                        src={AvatarThree}
                        width={40}
                        height={40}
                        alt={"avatar"}
                        className="w-[40px] h-[40px] mx-1 rounded-full"
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
                            className="flex items-center justify-between my-3"
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
                                className="w-[40px] h-[40px] mx-3 rounded-full"
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
                className="text-black bg-white font-bold rounded-md h-10 w-full"
                onClick={() => router.push(`/tournaments/${tournament_id}`)}
              >
                Tournament Cancelled
              </button>
            ) : tournamentEnded ? (
              <button
                className="text-black bg-[#f2ca16] font-bold rounded-md h-10 w-full"
                onClick={() => router.push(`/tournaments/${tournament_id}`)}
              >
                View Results 🏆
              </button>
            ) : (
              <button
                className="text-black bg-white font-bold rounded-md h-10 w-full"
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
