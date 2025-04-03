"use client";
import dayjs from 'dayjs';
import { useSession } from "next-auth/react";
import Image from "next/image";
import React, { useEffect, useState } from "react";

import { TimerProvider } from "@/app/_context/TimerContext";
import { MyWagersCard, MyWatchlistCard } from "@/app/components/navbar";
import { getMyWagers, getMyWatchlist, getUserInfo } from "@/lib/data";
import { useRouter } from "next/navigation";
import { PulseLoader } from "react-spinners";
import AvatarOne from "../../../../public/images/avatar-one.svg";
import { default as Dollar, default as DollarIcon } from "../../../../public/images/dollar.svg";
import Globe from "../../../../public/images/earth11.svg";
import HourglassIcon from "../../../../public/images/hour-glass.svg";
import MoneyBagBlack from "../../../../public/images/money-bag-black.svg";
import Pin from "../../../../public/images/pin1.svg";
import IDIcon from "../../../../public/images/single-neutral-id-card-3.svg";
import TransitionPattern from "../../../../public/images/transition-pattern.svg";
import Twitter from "../../../../public/images/twitter-social.svg";
import WalletIcon from "../../../../public/images/wallet--money-payment-finance-wallet.svg";


interface Props { }

function Profile(props: Props) {
    const [name, setName] = useState("User");
    const [username, setUsername] = useState("Username");
    const [totalWagersAndWatchlist, setTotalWagersAndWatchlist] = useState(0);
    const [dataIsLoading, setDataIsLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [activeWagers, setActiveWagers] = useState([]);
    const [completedWagers, setCompletedWagers] = useState([]);
    const [activeWatchlist, setActiveWatchlist] = useState([]);
    const [completedWatchlist, setCompletedWatchlist] = useState([]);
    const [isActiveWager, setIsActiveWager] = useState(true);
    const [userInfo, setUserInfo] = useState<any | null>(null);
    const [winsNum, setWinsNum] = useState<number>(0);
    const [joinedDate, setJoinedDate] = useState<string>("");

    const { } = props;
    const { data } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (data) {
            setName(data?.user.fullName);
            setUsername(data?.user.username);
        }
    }, [name, data]);

    // fetch wagers
    useEffect(() => {
        setDataIsLoading(true);
        const fetchWagers = async () => {
            const data = await getMyWagers();
            // console.log(data);
            const currentDate = new Date();

            if (!data.wagers || data.wagers.length !== 0) {
                const completed = data.wagers.filter((wager: any) => {
                    const auctionDeadline = new Date(wager.auctionDeadline);
                    return auctionDeadline < currentDate;
                });
                const active = data.wagers.filter((wager: any) => {
                    const auctionDeadline = new Date(wager.auctionDeadline);
                    return auctionDeadline >= currentDate;
                });


                setActiveWagers(active);
                setCompletedWagers(completed);
            }
            setDataIsLoading(false);
        };
        fetchWagers();
    }, []);

    // logs active and completed wagers for checking
    // useEffect(() => {
    //     console.log("active:", activeWagers, "completed:", completedWagers)
    // }, [activeWagers, completedWagers])

    //calculates total wagers and watchlist
    useEffect(() => {
        setTotalWagersAndWatchlist(
            activeWagers.length +
            completedWagers.length +
            activeWatchlist.length +
            completedWatchlist.length
        );
    }, [activeWagers, completedWagers, activeWatchlist, completedWatchlist]);

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
    useEffect(() => {
        const fetchUser = async () => {
            const res = await getUserInfo(data?.user.id);
            setUserInfo(res.user);
            setJoinedDate(dayjs(res.user.createdAt).format('MMMM YYYY'));
        };
        if (data) {
            fetchUser();
        }
    }, [data]);

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
        <div className="bg-[#1A2C3D] pb-[60px] flex justify-center">
            <Image
                src={TransitionPattern}
                className="black-filter absolute max-h-[280px] object-cover object-bottom"
                alt=""
            />
            <div className="max-w-[862px] w-full sm:mt-[200px] mt-[120px] z-[1]">
                <div className="px-6 sm:flex sm:px-0 sm:justify-between">
                    <div className="sm:flex sm:items-center sm:gap-6">
                        <Image
                            src={AvatarOne}
                            alt=""
                            className="rounded-full w-[100px] sm:w-[200px]"
                        />
                        <div className="mt-6 sm:mt-0">
                            <div className="text-4xl font-bold">
                                {name}
                            </div>
                            <div className="text-lg text-[#d1d5d8]">
                                {`Joined ${joinedDate}`}
                            </div>
                            <div className="flex text-base gap-6 text-[#487f4b]">
                                <div>@{username}</div>
                                <div>{totalWagersAndWatchlist} wagers</div>
                                <div>{winsNum} wins</div>
                            </div>
                        </div>
                    </div>
                    <button className="text-base font-medium text-[#f2ca16] border-[1px] border-[#f2ca16] py-2 px-3 rounded mt-4 sm:mt-[50px] h-[44px]  cursor-pointer "
                        onClick={e => router.push("/profile/edit")}>
                        Edit Profile
                    </button>
                </div>
                <div className="flex items-center gap-6 bg-[#184c80] mx-6 mt-[80px] px-6 py-4 rounded-lg md:mx-0">
                    <Image
                        src={IDIcon}
                        alt=""
                        className="w-8 yellow-filter"
                        style={{ fill: "#53944f" }}
                    />
                    <div>
                        <div className="text-base font-bold leading-6">
                            Verify your identity
                        </div>
                        <div className="text-[#bac9d9] text-sm leading-5">
                            To wager on car auctions, you need to verify your
                            identity
                        </div>
                        <div className="text-[#f2ca16] text-base font-medium leading-6">
                            Verify now
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-4 p-6 bg-[#172431] mt-8 rounded">
                    <div className="text-lg font-bold text-[#f2ca16] leading-7">
                        ABOUT
                    </div>
                    <div className="leading-7">
                        {userInfo && userInfo.aboutMe
                            ? userInfo.aboutMe
                            : "Join us and fuel your passion for cars!"}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-sm sm:text-lg font-light leading-7">
                        <div className="flex items-center gap-2">
                            <Image
                                src={Pin}
                                width={24}
                                height={24}
                                alt="pin"
                                className="h-6 h-6"
                            />
                            <div>
                                {userInfo
                                    ? `${userInfo.state}, ${userInfo.country}`
                                    : "--"}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Image
                                src={Twitter}
                                width={24}
                                height={24}
                                alt="twitter"
                                className="h-6 h-6 opacity-20"
                            />
                            <div className="opacity-20">Twitter</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Image
                                src={Globe}
                                width={24}
                                height={24}
                                alt="globe"
                                className="h-6 h-6 opacity-20"
                            />
                            <div className="opacity-20">Website</div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-4 p-6 bg-[#172431] mt-8 rounded">
                    <div className="text-lg font-bold text-[#f2ca16] leading-7">
                        WAGERS
                    </div>
                    <div className="flex">
                        <button
                            id="active-watchlist-button"
                            onClick={() => setIsActiveWager(true)}
                            className={`border-b-2 w-1/2 py-2 border-[#314150] flex justify-center items-center gap-2 ${isActiveWager == true
                                ? "font-bold text-lg border-white"
                                : ""
                                }`}
                        >
                            <div>ACTIVE </div>
                            {!dataIsLoading && (
                                <span className="px-1 text-sm bg-[#f2ca16] rounded font-bold text-[#0f1923]">
                                    {activeWagers.length}
                                </span>
                            )}
                        </button>
                        <button
                            id="completed-watchlist-button"
                            onClick={() => setIsActiveWager(false)}
                            className={`border-b-2 w-1/2 py-2 border-[#314150] ${isActiveWager == false
                                ? "font-bold text-lg border-white"
                                : ""
                                }`}
                        >
                            COMPLETED
                        </button>
                    </div>
                    <div>
                        {dataIsLoading ? (
                            <div className="w-full h-[100px] flex justify-center items-center">
                                <PulseLoader color="#f2ca16" />
                            </div>
                        ) : isActiveWager == true ? (
                            activeWagers.length == 0 ? (
                                <div className="w-full py-4 flex justify-center">No Active Wagers</div>
                            ) : (
                                activeWagers.map((wager: any) => (
                                    <div key={wager._id + "active"}>
                                        <TimerProvider
                                            deadline={wager.auctionDeadline}
                                        >
                                            <MyWagersCard
                                                title={`${wager.auctionYear} ${wager.auctionMake} ${wager.auctionModel}`}
                                                img={wager.auctionImage}
                                                my_wager={wager.priceGuessed}
                                                current_bid={wager.auctionPrice}
                                                time_left={wager.auctionDeadline}
                                                potential_prize={wager.auctionPot}
                                                id={wager.auctionIdentifierId}
                                                isActive={true}
                                                status={wager.auctionStatus}
                                                wagerAmount={wager.wagerAmount}
                                                objectID={wager.auctionObjectId}
                                                wagerID={wager._id}
                                                isRefunded={wager.refunded}
                                                prize={wager.prize}
                                                deadline={wager.auctionDeadline}
                                            />
                                        </TimerProvider>
                                    </div>
                                ))
                            )
                        ) : (completedWagers.length == 0 ? (
                            <div className="w-full py-4 flex justify-center">No Completed Wagers</div>
                        ) : (
                            completedWagers.map((wager: any) => (
                                <div key={wager._id + "completed"}>
                                    <TimerProvider
                                        deadline={wager.auctionDeadline}
                                    >
                                        <CompletedWagerCard
                                            title={`${wager.auctionYear} ${wager.auctionMake} ${wager.auctionModel}`}
                                            img={wager.auctionImage}
                                            priceGuess={wager.priceGuessed}
                                            id={wager.auctionIdentifierId}
                                            status={wager.auctionStatus}
                                            finalPrice={wager.auctionPrice}
                                            wagerAmount={wager.wagerAmount}
                                            auctionObjectID={wager.auctionObjectId}
                                            wagerID={wager._id}
                                            prize={wager.prize}
                                        />
                                    </TimerProvider>
                                </div>
                            ))
                        )
                        )}
                    </div>
                    {/* <UserWagerList /> */}
                </div>
                <div className="flex flex-col gap-4 p-6 bg-[#172431] mt-8 rounded">
                    <div className="text-lg font-bold text-[#f2ca16] leading-7">
                        WATCHLIST
                    </div>
                    <div>
                        {dataIsLoading ? (
                            <div className="w-full h-[100px] flex justify-center items-center">
                                <PulseLoader color="#f2ca16" />
                            </div>
                        ) : (
                            activeWatchlist.length === 0 ? (
                                <div className="w-full py-4 flex justify-center">No Active Watchlist</div>
                            ) : (
                                activeWatchlist.map((watchlist: any) => (
                                    <div key={watchlist._id}>
                                        <TimerProvider
                                            deadline={watchlist.auctionDeadline}
                                        >
                                            <MyWatchlistCard
                                                title={`${watchlist.auctionYear} ${watchlist.auctionMake} ${watchlist.auctionModel}`}
                                                img={watchlist.auctionImage}
                                                current_bid={watchlist.auctionPrice}
                                                time_left={
                                                    watchlist.auctionDeadline
                                                }
                                                id={watchlist.auctionIdentifierId}
                                                isActive={true}
                                            />
                                        </TimerProvider>
                                    </div>
                                ))
                            )
                        )
                        }
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
    wagerID: string
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
        default: "Status Unknown"
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
            <div className="flex gap-6 py-6 px-6">
                <Image
                    src={img}
                    width={100}
                    height={100}
                    alt={title}
                    className="rounded w-[100px] h-[100px] object-cover"
                />
                <div className="flex flex-col flex-auto gap-1.5">
                    <div className="font-bold text-xl leading-7">
                        {title}
                    </div>
                    <div>
                        <div className="flex gap-2 leading-5">
                            <Image
                                src={WalletIcon}
                                alt=""
                                className="text-[#d1d3d6] w-3.5"
                            />
                            <div className="text-[#d1d3d6]">Your Price Guess:</div>
                            <div className="text-[#f2ca16] font-bold">
                                ${currencyMyWager}
                            </div>
                        </div>
                        <div className="flex gap-2 text-sm">
                            <Image
                                src={DollarIcon}
                                alt=""
                                className="text-[#d1d3d6] w-3.5"
                            />
                            <div className="text-[#d1d3d6]">
                                Final Price:
                            </div>
                            <div className="text-[#49c742] font-bold">
                                ${currencyFinalPrice}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 w-full text-sm">
                            <Image
                                src={Dollar}
                                width={14}
                                height={14}
                                alt="wallet icon"
                                className="w-[14px] h-[14px]"
                            />
                            <span className="opacity-80">
                                Wager Amount:
                            </span>
                            <span className=" font-bold">
                                $
                                {currencyWagerAmount}
                            </span>
                        </div>
                        <div className="flex gap-2 text-sm items-center">
                            <Image
                                src={HourglassIcon}
                                alt=""
                                className="text-[#d1d3d6] w-3.5 h-3.5"
                            />
                            <div className="text-[#d1d3d6]">Status:</div>
                            <div>{auctionStatus}</div>
                        </div>
                    </div>
                    {status === 3 && (
                        <>

                            <div className="sm:mt-4 mt-2 w-full sm:p-2 p-1 items-center flex sm:gap-4 gap-2 bg-[#4b2330] rounded sm:text-sm text-xs">
                                <div className="text-[#f92f60] font-bold text-left grow-[1]">
                                    ❌ UNSUCCESSFUL{" "}
                                    <span className="hidden sm:inline-block">
                                        AUCTION
                                    </span>
                                </div>

                            </div>
                        </>
                    )}
                    {status == 4 && prize && (
                        <div className="sm:mt-4 mt-2 w-full sm:p-2 font-bold p-1 justify-between items-center flex sm:gap-4 bg-[#49c742] text-[#0f1923] rounded sm:text-sm text-xs">
                            <div className="flex gap-2">
                                <Image
                                    src={MoneyBagBlack}
                                    width={20}
                                    height={20}
                                    alt="money bag"
                                    className="w-[20px] h-[20px]"
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
