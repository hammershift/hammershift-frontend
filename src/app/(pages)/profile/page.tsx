"use client";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import Image from "next/image";
import React, { useEffect, useState } from "react";

import { TimerProvider } from "@/app/_context/TimerContext";
import { MyWagersCard, MyWatchlistCard } from "@/app/components/navbar";
import { getMyWagers, getMyWatchlist, getUserInfo } from "@/lib/data";
import { useRouter } from "next/navigation";
import { PulseLoader } from "react-spinners";
import AvatarOne from "../../../../public/images/avatar-one.svg";
import {
  default as Dollar,
  default as DollarIcon,
} from "../../../../public/images/dollar.svg";
import Globe from "../../../../public/images/earth11.svg";
import HourglassIcon from "../../../../public/images/hour-glass.svg";
import MoneyBagBlack from "../../../../public/images/money-bag-black.svg";
import Pin from "../../../../public/images/pin1.svg";
import IDIcon from "../../../../public/images/single-neutral-id-card-3.svg";
import TransitionPattern from "../../../../public/images/transition-pattern.svg";
import Twitter from "../../../../public/images/twitter-social.svg";
import WalletIcon from "../../../../public/images/wallet--money-payment-finance-wallet.svg";
import { Button } from "@/app/components/ui/button";
import { getMyPredictions } from "@/lib/data";

interface Props {}

function Profile(props: Props) {
  const [name, setName] = useState("User");
  const [username, setUsername] = useState("Username");
  const [totalPredictionsAndWatchlist, setTotalPredictionsAndWatchlist] =
    useState(0);
  const [dataIsLoading, setDataIsLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activePredictions, setActivePredictions] = useState([]);
  const [completedPredictions, setCompletedPredictions] = useState([]);
  const [activeWatchlist, setActiveWatchlist] = useState([]);
  const [completedWatchlist, setCompletedWatchlist] = useState([]);
  const [isActivePrediction, setIsActivePrediction] = useState(true);
  const [userInfo, setUserInfo] = useState<any | null>(null);
  const [winsNum, setWinsNum] = useState<number>(0);
  const [joinedDate, setJoinedDate] = useState<string>("");

  const {} = props;
  const { data } = useSession();
  const router = useRouter();

  useEffect(() => {
    console.log(data);
    if (data) {
      setName(data?.user.fullName);
      setUsername(data?.user.username);
    }
  }, [name, data]);

  // fetch wagers
  useEffect(() => {
    setDataIsLoading(true);
    const fetchPredictions = async () => {
      const data = await getMyPredictions();
      console.log(data);
      const currentDate = new Date();

      if (!data.predictions || data.predictions.length !== 0) {
        const completed = data.predictions.filter((prediction: any) => {
          const auctionDeadline = new Date(prediction.auctionDeadline);
          return auctionDeadline < currentDate;
        });
        const active = data.predictions.filter((prediction: any) => {
          const auctionDeadline = new Date(prediction.auctionDeadline);
          return auctionDeadline >= currentDate;
        });

        setActivePredictions(active);
        setCompletedPredictions(completed);
      }
      setDataIsLoading(false);
    };
    fetchPredictions();
  }, []);

  // logs active and completed wagers for checking
  // useEffect(() => {
  //     console.log("active:", activeWagers, "completed:", completedWagers)
  // }, [activeWagers, completedWagers])

  //calculates total wagers and watchlist
  useEffect(() => {
    setTotalPredictionsAndWatchlist(
      activePredictions.length +
        completedPredictions.length +
        activeWatchlist.length +
        completedWatchlist.length
    );
  }, [
    activePredictions,
    completedPredictions,
    activeWatchlist,
    completedWatchlist,
  ]);

  // fetch watchlist
  useEffect(() => {
    const fetchWatchlist = async () => {
      const data = await getMyWatchlist();
      const currentDate = new Date();

      if (!data.watchlist || data.watchlist.length !== 0) {
        const completed = data.watchlist.filter((watchlist: any) => {
          const auctionDeadline = new Date(watchlist.auctionDeadline);
          return auctionDeadline < currentDate;
        });
        const active = data.watchlist.filter((watchlist: any) => {
          const auctionDeadline = new Date(watchlist.auctionDeadline);
          return auctionDeadline >= currentDate;
        });

        setActiveWatchlist(active);
        setCompletedWatchlist(completed);
      }
      setDataIsLoading(false);
    };
    fetchWatchlist();
  }, []);

  //fetch user data
  // useEffect(() => {
  //   const fetchUser = async () => {
  //     const res = await getUserInfo(data?.user.id);
  //     setUserInfo(res.user);
  //     setJoinedDate(dayjs(res.user.createdAt).format("MMMM YYYY"));
  //   };
  //   if (data) {
  //     fetchUser();
  //   }
  // }, [data]);

  //fetch winnings number
  useEffect(() => {
    const fetchWinnings = async () => {
      const res = await fetch("/api/winnings");
      const data = await res.json();
      setWinsNum(data.winnings);
    };

    fetchWinnings();
  }, []);

  return (
    <div className="flex justify-center bg-[#1A2C3D] pb-[60px]">
      <Image
        src={TransitionPattern}
        className="black-filter absolute max-h-[280px] object-cover object-bottom"
        alt=""
      />
      <div className="z-[1] mt-[120px] w-full max-w-[862px] sm:mt-[200px]">
        <div className="px-6 sm:flex sm:justify-between sm:px-0">
          <div className="sm:flex sm:items-center sm:gap-6">
            <Image
              src={AvatarOne}
              alt=""
              className="w-[100px] rounded-full sm:w-[200px]"
            />
            <div className="mt-6 sm:mt-0">
              <div className="text-4xl font-bold">{name}</div>
              <div className="text-lg text-[#d1d5d8]">
                {`Joined ${joinedDate}`}
              </div>
              <div className="flex gap-6 text-base text-[#487f4b]">
                <div>@{username}</div>
                <div>{totalPredictionsAndWatchlist} wagers</div>
                <div>{winsNum} wins</div>
              </div>
            </div>
          </div>
          <Button
            className="pointer-events-none mt-4 h-[44px] cursor-pointer rounded border-[1px] border-[#f2ca16] px-3 py-2 text-base font-medium text-[#f2ca16] opacity-50 sm:mt-[50px]"
            onClick={() => router.push("/profile/edit")}
            aria-disabled={true}
          >
            Edit Profile
          </Button>
        </div>
        <div className="mx-6 mt-[80px] flex items-center gap-6 rounded-lg bg-[#184c80] px-6 py-4 md:mx-0">
          <Image
            src={IDIcon}
            alt=""
            className="yellow-filter w-8"
            style={{ fill: "#53944f" }}
          />
          <div>
            <div className="text-base font-bold leading-6">
              Verify your identity
            </div>
            <div className="text-sm leading-5 text-[#bac9d9]">
              To wager on car auctions, you need to verify your identity
            </div>
            <div className="text-base font-medium leading-6 text-[#f2ca16]">
              Verify now
            </div>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-4 rounded bg-[#172431] p-6">
          <div className="text-lg font-bold leading-7 text-[#f2ca16]">
            ABOUT
          </div>
          <div className="leading-7">
            {userInfo && userInfo.aboutMe
              ? userInfo.aboutMe
              : "Join us and fuel your passion for cars!"}
          </div>
          <div className="flex flex-col gap-2 text-sm font-light leading-7 sm:flex-row sm:gap-6 sm:text-lg">
            <div className="flex items-center gap-2">
              <Image
                src={Pin}
                width={24}
                height={24}
                alt="pin"
                className="h-6"
              />
              <div>
                {userInfo ? `${userInfo.state}, ${userInfo.country}` : "--"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Image
                src={Twitter}
                width={24}
                height={24}
                alt="twitter"
                className="h-6 opacity-20"
              />
              <div className="opacity-20">Twitter</div>
            </div>
            <div className="flex items-center gap-2">
              <Image
                src={Globe}
                width={24}
                height={24}
                alt="globe"
                className="h-6 opacity-20"
              />
              <div className="opacity-20">Website</div>
            </div>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-4 rounded bg-[#172431] p-6">
          <div className="text-lg font-bold leading-7 text-[#f2ca16]">
            PREDICTIONS
          </div>
          <div className="flex">
            <button
              id="active-watchlist-button"
              onClick={() => setIsActivePrediction(true)}
              className={`flex w-1/2 items-center justify-center gap-2 border-b-2 border-[#314150] py-2 ${
                isActivePrediction == true
                  ? "border-white text-lg font-bold"
                  : ""
              }`}
            >
              <div>ACTIVE </div>
              {!dataIsLoading && (
                <span className="rounded bg-[#f2ca16] px-1 text-sm font-bold text-[#0f1923]">
                  {activePredictions.length}
                </span>
              )}
            </button>
            <button
              id="completed-watchlist-button"
              onClick={() => setIsActivePrediction(false)}
              className={`w-1/2 border-b-2 border-[#314150] py-2 ${
                isActivePrediction == false
                  ? "border-white text-lg font-bold"
                  : ""
              }`}
            >
              COMPLETED
            </button>
          </div>
          <div>
            {dataIsLoading ? (
              <div className="flex h-[100px] w-full items-center justify-center">
                <PulseLoader color="#f2ca16" />
              </div>
            ) : isActivePrediction == true ? (
              activePredictions.length == 0 ? (
                <div className="flex w-full justify-center py-4">
                  No Active Predictions
                </div>
              ) : (
                activePredictions.map((prediction: any) => (
                  <div key={prediction._id + "active"}>
                    <TimerProvider deadline={prediction.auctionDeadline}>
                      <MyWagersCard
                        title={`${prediction.auctionYear} ${prediction.auctionMake} ${prediction.auctionModel}`}
                        img={prediction.auctionImage}
                        my_wager={prediction.priceGuessed}
                        current_bid={prediction.auctionPrice}
                        time_left={prediction.auctionDeadline}
                        potential_prize={prediction.auctionPot}
                        id={prediction.auctionIdentifierId}
                        isActive={true}
                        status={prediction.auctionStatus}
                        wagerAmount={prediction.predictionAmount}
                        objectID={prediction.auctionObjectId}
                        wagerID={prediction._id}
                        isRefunded={prediction.refunded}
                        prize={prediction.prize}
                        deadline={prediction.auctionDeadline}
                      />
                    </TimerProvider>
                  </div>
                ))
              )
            ) : completedPredictions.length == 0 ? (
              <div className="flex w-full justify-center py-4">
                No Completed Predictions
              </div>
            ) : (
              completedPredictions.map((prediction: any) => (
                <div key={prediction._id + "completed"}>
                  <TimerProvider deadline={prediction.auctionDeadline}>
                    <CompletedWagerCard
                      title={`${prediction.auctionYear} ${prediction.auctionMake} ${prediction.auctionModel}`}
                      img={prediction.auctionImage}
                      priceGuess={prediction.priceGuessed}
                      id={prediction.auctionIdentifierId}
                      status={prediction.auctionStatus}
                      finalPrice={prediction.auctionPrice}
                      wagerAmount={prediction.predictionAmount}
                      auctionObjectID={prediction.auctionObjectId}
                      wagerID={prediction._id}
                      prize={prediction.prize}
                    />
                  </TimerProvider>
                </div>
              ))
            )}
          </div>
          {/* <UserWagerList /> */}
        </div>
        <div className="mt-8 flex flex-col gap-4 rounded bg-[#172431] p-6">
          <div className="text-lg font-bold leading-7 text-[#f2ca16]">
            WATCHLIST
          </div>
          <div>
            {dataIsLoading ? (
              <div className="flex h-[100px] w-full items-center justify-center">
                <PulseLoader color="#f2ca16" />
              </div>
            ) : activeWatchlist.length === 0 ? (
              <div className="flex w-full justify-center py-4">
                No Active Watchlist
              </div>
            ) : (
              activeWatchlist.map((watchlist: any) => (
                <div key={watchlist._id}>
                  <TimerProvider deadline={watchlist.auctionDeadline}>
                    <MyWatchlistCard
                      title={`${watchlist.auctionYear} ${watchlist.auctionMake} ${watchlist.auctionModel}`}
                      img={watchlist.auctionImage}
                      current_bid={watchlist.auctionPrice}
                      time_left={watchlist.auctionDeadline}
                      id={watchlist.auctionIdentifierId}
                      isActive={true}
                    />
                  </TimerProvider>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;

type CompletedWagerCardProps = {
  title: string;
  img: string;
  priceGuess: number;
  id: string;
  status: number;
  finalPrice: number;
  wagerAmount: number;
  auctionObjectID: string;
  wagerID: string;
  prize?: number;
};

const CompletedWagerCard: React.FC<CompletedWagerCardProps> = ({
  title,
  img,
  priceGuess,
  id,
  status,
  finalPrice,
  wagerAmount,
  auctionObjectID,
  wagerID,
  prize,
}) => {
  const [auctionStatus, setAuctionStatus] = useState("Completed");
  const [refunded, setRefunded] = useState(false);
  const [loading, setLoading] = useState(false);

  const statusMap: any = {
    1: "Ongoing",
    2: "Completed",
    3: "Unsuccessful Auction",
    4: "Completed and Prize Distributed",
    default: "Status Unknown",
  };

  useEffect(() => {
    setAuctionStatus(statusMap[status] || statusMap.default);
  }, [status]);

  //convert number to currency
  const currencyMyWager = new Intl.NumberFormat().format(priceGuess);
  const currencyFinalPrice = new Intl.NumberFormat().format(finalPrice);
  const currencyWagerAmount = new Intl.NumberFormat().format(wagerAmount);

  // refund for when auction is unsuccessful

  return (
    <div>
      <div className="flex gap-6 px-6 py-6">
        <Image
          src={img}
          width={100}
          height={100}
          alt={title}
          className="h-[100px] w-[100px] rounded object-cover"
        />
        <div className="flex flex-auto flex-col gap-1.5">
          <div className="text-xl font-bold leading-7">{title}</div>
          <div>
            <div className="flex gap-2 leading-5">
              <Image src={WalletIcon} alt="" className="w-3.5 text-[#d1d3d6]" />
              <div className="text-[#d1d3d6]">Your Price Guess:</div>
              <div className="font-bold text-[#f2ca16]">${currencyMyWager}</div>
            </div>
            <div className="flex gap-2 text-sm">
              <Image src={DollarIcon} alt="" className="w-3.5 text-[#d1d3d6]" />
              <div className="text-[#d1d3d6]">Final Price:</div>
              <div className="font-bold text-[#49c742]">
                ${currencyFinalPrice}
              </div>
            </div>
            <div className="flex w-full items-center gap-2 text-sm">
              <Image
                src={Dollar}
                width={14}
                height={14}
                alt="wallet icon"
                className="h-[14px] w-[14px]"
              />
              <span className="opacity-80">Wager Amount:</span>
              <span className="font-bold">${currencyWagerAmount}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Image
                src={HourglassIcon}
                alt=""
                className="h-3.5 w-3.5 text-[#d1d3d6]"
              />
              <div className="text-[#d1d3d6]">Status:</div>
              <div>{auctionStatus}</div>
            </div>
          </div>
          {status === 3 && (
            <>
              <div className="mt-2 flex w-full items-center gap-2 rounded bg-[#4b2330] p-1 text-xs sm:mt-4 sm:gap-4 sm:p-2 sm:text-sm">
                <div className="grow-[1] text-left font-bold text-[#f92f60]">
                  ❌ UNSUCCESSFUL{" "}
                  <span className="hidden sm:inline-block">AUCTION</span>
                </div>
              </div>
            </>
          )}
          {status == 4 && prize && (
            <div className="mt-2 flex w-full items-center justify-between rounded bg-[#49c742] p-1 text-xs font-bold text-[#0f1923] sm:mt-4 sm:gap-4 sm:p-2 sm:text-sm">
              <div className="flex gap-2">
                <Image
                  src={MoneyBagBlack}
                  width={20}
                  height={20}
                  alt="money bag"
                  className="h-[20px] w-[20px]"
                />
                <div>WINNINGS</div>
              </div>
              <div>
                $
                {prize % 1 === 0
                  ? prize.toLocaleString()
                  : prize.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                🎉
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="h-[2px] bg-white/10"></div>
    </div>
  );
};

// function UserWatchList() {
//     return (
//         <div className="flex gap-4 py-3 items-center">
//             <Image
//                 src={WagerPhotoOne}
//                 alt=""
//                 className="rounded w-[100px]"
//             />
//             <div>
//                 <div className="font-bold sm:text-lg leading-7">
//                     620-Mile 2019 Ford GT
//                 </div>
//                 <div className="flex gap-2 text-sm leading-5">
//                     <Image
//                         src={DollarIcon}
//                         alt=""
//                         className="text-[#d1d3d6] w-3.5"
//                     />
//                     <div className="text-[#d1d3d6]">Current Bid:</div>
//                     <div className="text-[#49c742] font-bold">
//                         $904,000
//                     </div>
//                 </div>
//                 <div className="flex gap-2 text-sm items-center">
//                     <Image
//                         src={HourglassIcon}
//                         alt=""
//                         className="text-[#d1d3d6] w-3.5 h-3.5"
//                     />
//                     <div className="text-[#d1d3d6]">Time Left:</div>
//                     <div>12:17:00</div>
//                 </div>
//             </div>
//         </div>
//     );
// }
