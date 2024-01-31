"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import dayjs from 'dayjs';
import { useSession } from "next-auth/react";

import AvatarOne from "../../../../public/images/avatar-one.svg";
import WalletIcon from "../../../../public/images/wallet--money-payment-finance-wallet.svg";
import DollarIcon from "../../../../public/images/dollar.svg";
import HourglassIcon from "../../../../public/images/hour-glass.svg";
import IDIcon from "../../../../public/images/single-neutral-id-card-3.svg";
import TransitionPattern from "../../../../public/images/transition-pattern.svg";
import Twitter from "../../../../public/images/twitter-social.svg";
import Globe from "../../../../public/images/earth11.svg";
import Pin from "../../../../public/images/pin1.svg";
import MoneyBagBlack from "../../../../public/images/money-bag-black.svg";
import { getMyWagers, getMyWatchlist, getUserInfo, refundWager } from "@/lib/data";
import { TimerProvider } from "@/app/_context/TimerContext";
import { MyWagersCard, MyWatchlistCard } from "@/app/components/navbar";
import { useRouter } from "next/navigation";
import { BeatLoader, PulseLoader } from "react-spinners";
import Dollar from "../../../../public/images/dollar.svg";


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
        <div className="tw-bg-[#1A2C3D] tw-pb-[60px] tw-flex tw-justify-center">
            <Image
                src={TransitionPattern}
                className="black-filter tw-absolute tw-max-h-[280px] tw-object-cover tw-object-bottom"
                alt=""
            />
            <div className="tw-max-w-[862px] tw-w-full sm:tw-mt-[200px] tw-mt-[120px] tw-z-[1]">
                <div className="tw-px-6 sm:tw-flex sm:tw-px-0 sm:tw-justify-between">
                    <div className="sm:tw-flex sm:tw-items-center sm:tw-gap-6">
                        <Image
                            src={AvatarOne}
                            alt=""
                            className="tw-rounded-full tw-w-[100px] sm:tw-w-[200px]"
                        />
                        <div className="tw-mt-6 sm:tw-mt-0">
                            <div className="tw-text-4xl tw-font-bold">
                                {name}
                            </div>
                            <div className="tw-text-lg tw-text-[#d1d5d8]">
                                {`Joined ${joinedDate}`}
                            </div>
                            <div className="tw-flex tw-text-base tw-gap-6 tw-text-[#487f4b]">
                                <div>@{username}</div>
                                <div>{totalWagersAndWatchlist} wagers</div>
                                <div>{winsNum} wins</div>
                            </div>
                        </div>
                    </div>
                    <button className="tw-text-base tw-font-medium tw-text-[#f2ca16] tw-border-[1px] tw-border-[#f2ca16] tw-py-2 tw-px-3 tw-rounded tw-mt-4 sm:tw-mt-[50px] tw-h-[44px]  tw-cursor-pointer "
                        onClick={e => router.push("/profile/edit")}>
                        Edit Profile
                    </button>
                </div>
                <div className="tw-flex tw-items-center tw-gap-6 tw-bg-[#184c80] tw-mx-6 tw-mt-[80px] tw-px-6 tw-py-4 tw-rounded-lg md:tw-mx-0">
                    <Image
                        src={IDIcon}
                        alt=""
                        className="tw-w-8 yellow-filter"
                        style={{ fill: "#53944f" }}
                    />
                    <div>
                        <div className="tw-text-base tw-font-bold tw-leading-6">
                            Verify your identity
                        </div>
                        <div className="tw-text-[#bac9d9] tw-text-sm tw-leading-5">
                            To wager on car auctions, you need to verify your
                            identity
                        </div>
                        <div className="tw-text-[#f2ca16] tw-text-base tw-font-medium tw-leading-6">
                            Verify now
                        </div>
                    </div>
                </div>
                <div className="tw-flex tw-flex-col tw-gap-4 tw-p-6 tw-bg-[#172431] tw-mt-8 tw-rounded">
                    <div className="tw-text-lg tw-font-bold tw-text-[#f2ca16] tw-leading-7">
                        ABOUT
                    </div>
                    <div className="tw-leading-7">
                        {userInfo && userInfo.aboutMe
                            ? userInfo.aboutMe
                            : "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud."}
                    </div>
                    <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-2 sm:tw-gap-6 tw-text-sm sm:tw-text-lg tw-font-light tw-leading-7">
                        <div className="tw-flex tw-items-center tw-gap-2">
                            <Image
                                src={Pin}
                                width={24}
                                height={24}
                                alt="pin"
                                className="tw-h-6 tw-h-6"
                            />
                            <div>
                                {userInfo
                                    ? `${userInfo.state}, ${userInfo.country}`
                                    : "--"}
                            </div>
                        </div>
                        <div className="tw-flex tw-items-center tw-gap-2">
                            <Image
                                src={Twitter}
                                width={24}
                                height={24}
                                alt="twitter"
                                className="tw-h-6 tw-h-6 tw-opacity-20"
                            />
                            <div className="tw-opacity-20">Twitter</div>
                        </div>
                        <div className="tw-flex tw-items-center tw-gap-2">
                            <Image
                                src={Globe}
                                width={24}
                                height={24}
                                alt="globe"
                                className="tw-h-6 tw-h-6 tw-opacity-20"
                            />
                            <div className="tw-opacity-20">Website</div>
                        </div>
                    </div>
                </div>
                <div className="tw-flex tw-flex-col tw-gap-4 tw-p-6 tw-bg-[#172431] tw-mt-8 tw-rounded">
                    <div className="tw-text-lg tw-font-bold tw-text-[#f2ca16] tw-leading-7">
                        WAGERS
                    </div>
                    <div className="tw-flex">
                        <button
                            id="active-watchlist-button"
                            onClick={() => setIsActiveWager(true)}
                            className={`tw-border-b-2 tw-w-1/2 tw-py-2 tw-border-[#314150] tw-flex tw-justify-center tw-items-center tw-gap-2 ${isActiveWager == true
                                ? "tw-font-bold tw-text-lg tw-border-white"
                                : ""
                                }`}
                        >
                            <div>ACTIVE </div>
                            {!dataIsLoading && (
                                <span className="tw-px-1 tw-text-sm tw-bg-[#f2ca16] tw-rounded tw-font-bold tw-text-[#0f1923]">
                                    {activeWagers.length}
                                </span>
                            )}
                        </button>
                        <button
                            id="completed-watchlist-button"
                            onClick={() => setIsActiveWager(false)}
                            className={`tw-border-b-2 tw-w-1/2 tw-py-2 tw-border-[#314150] ${isActiveWager == false
                                ? "tw-font-bold tw-text-lg tw-border-white"
                                : ""
                                }`}
                        >
                            COMPLETED
                        </button>
                    </div>
                    <div>
                        {dataIsLoading ? (
                            <div className="tw-w-full tw-h-[100px] tw-flex tw-justify-center tw-items-center">
                                <PulseLoader color="#f2ca16" />
                            </div>
                        ) : isActiveWager == true ? (
                            activeWagers.length == 0 ? (
                                <div className="tw-w-full tw-py-4 tw-flex tw-justify-center">No Active Wagers</div>
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
                        )}
                    </div>
                    {/* <UserWagerList /> */}
                </div>
                <div className="tw-flex tw-flex-col tw-gap-4 tw-p-6 tw-bg-[#172431] tw-mt-8 tw-rounded">
                    <div className="tw-text-lg tw-font-bold tw-text-[#f2ca16] tw-leading-7">
                        WATCHLIST
                    </div>
                    <div>
                        {dataIsLoading ? (
                            <div className="tw-w-full tw-h-[100px] tw-flex tw-justify-center tw-items-center">
                                <PulseLoader color="#f2ca16" />
                            </div>
                        ) : (
                            activeWatchlist.length === 0 ? (
                                <div className="tw-w-full tw-py-4 tw-flex tw-justify-center">No Active Watchlist</div>
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
            <div className="tw-flex tw-gap-6 tw-py-6 tw-px-6">
                <Image
                    src={img}
                    width={100}
                    height={100}
                    alt={title}
                    className="tw-rounded tw-w-[100px] tw-h-[100px] tw-object-cover"
                />
                <div className="tw-flex tw-flex-col tw-flex-auto tw-gap-1.5">
                    <div className="tw-font-bold tw-text-xl tw-leading-7">
                        {title}
                    </div>
                    <div>
                        <div className="tw-flex tw-gap-2 tw-leading-5">
                            <Image
                                src={WalletIcon}
                                alt=""
                                className="tw-text-[#d1d3d6] tw-w-3.5"
                            />
                            <div className="tw-text-[#d1d3d6]">Your Price Guess:</div>
                            <div className="tw-text-[#f2ca16] tw-font-bold">
                                ${currencyMyWager}
                            </div>
                        </div>
                        <div className="tw-flex tw-gap-2 tw-text-sm">
                            <Image
                                src={DollarIcon}
                                alt=""
                                className="tw-text-[#d1d3d6] tw-w-3.5"
                            />
                            <div className="tw-text-[#d1d3d6]">
                                Final Price:
                            </div>
                            <div className="tw-text-[#49c742] tw-font-bold">
                                ${currencyFinalPrice}
                            </div>
                        </div>
                        <div className="tw-flex tw-items-center tw-gap-2 tw-w-full tw-text-sm">
                            <Image
                                src={Dollar}
                                width={14}
                                height={14}
                                alt="wallet icon"
                                className="tw-w-[14px] tw-h-[14px]"
                            />
                            <span className="tw-opacity-80">
                                Wager Amount:
                            </span>
                            <span className=" tw-font-bold">
                                $
                                {currencyWagerAmount}
                            </span>
                        </div>
                        <div className="tw-flex tw-gap-2 tw-text-sm tw-items-center">
                            <Image
                                src={HourglassIcon}
                                alt=""
                                className="tw-text-[#d1d3d6] tw-w-3.5 tw-h-3.5"
                            />
                            <div className="tw-text-[#d1d3d6]">Status:</div>
                            <div>{auctionStatus}</div>
                        </div>
                    </div>
                    {status === 3 && (
                        <>

                            <div className="sm:tw-mt-4 tw-mt-2 tw-w-full sm:tw-p-2 tw-p-1 tw-items-center tw-flex sm:tw-gap-4 tw-gap-2 tw-bg-[#4b2330] tw-rounded sm:tw-text-sm tw-text-xs">
                                <div className="tw-text-[#f92f60] tw-font-bold tw-text-left tw-grow-[1]">
                                    ❌ UNSUCCESSFUL{" "}
                                    <span className="tw-hidden sm:tw-inline-block">
                                        AUCTION
                                    </span>
                                </div>

                            </div>
                        </>
                    )}
                    {status == 4 && prize && (
                        <div className="sm:tw-mt-4 tw-mt-2 tw-w-full sm:tw-p-2 tw-font-bold tw-p-1 tw-justify-between tw-items-center tw-flex sm:tw-gap-4 tw-bg-[#49c742] tw-text-[#0f1923] tw-rounded sm:tw-text-sm tw-text-xs">
                            <div className="tw-flex tw-gap-2">
                                <Image
                                    src={MoneyBagBlack}
                                    width={20}
                                    height={20}
                                    alt="money bag"
                                    className="tw-w-[20px] tw-h-[20px]"
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
            <div className="tw-h-[2px] tw-bg-white/10"></div>
        </div>
    );
};

// function UserWatchList() {
//     return (
//         <div className="tw-flex tw-gap-4 tw-py-3 tw-items-center">
//             <Image
//                 src={WagerPhotoOne}
//                 alt=""
//                 className="tw-rounded tw-w-[100px]"
//             />
//             <div>
//                 <div className="tw-font-bold sm:text-lg tw-leading-7">
//                     620-Mile 2019 Ford GT
//                 </div>
//                 <div className="tw-flex tw-gap-2 tw-text-sm tw-leading-5">
//                     <Image
//                         src={DollarIcon}
//                         alt=""
//                         className="tw-text-[#d1d3d6] tw-w-3.5"
//                     />
//                     <div className="tw-text-[#d1d3d6]">Current Bid:</div>
//                     <div className="tw-text-[#49c742] tw-font-bold">
//                         $904,000
//                     </div>
//                 </div>
//                 <div className="tw-flex tw-gap-2 tw-text-sm tw-items-center">
//                     <Image
//                         src={HourglassIcon}
//                         alt=""
//                         className="tw-text-[#d1d3d6] tw-w-3.5 tw-h-3.5"
//                     />
//                     <div className="tw-text-[#d1d3d6]">Time Left:</div>
//                     <div>12:17:00</div>
//                 </div>
//             </div>
//         </div>
//     );
// }
