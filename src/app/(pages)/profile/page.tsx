"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
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
import { getMyWagers, getMyWatchlist, getUserInfo } from "@/lib/data";
import { TimerProvider } from "@/app/_context/TimerContext";
import { MyWagersCard, MyWatchlistCard } from "@/app/components/navbar";
import { useRouter } from "next/navigation";
import { PulseLoader } from "react-spinners";
import { set } from "mongoose";

interface Props {}

function Profile(props: Props) {
    const [name, setName] = useState("User");
    const [username, setUsername] = useState("Username");
    const [totalWagersAndWatchlist, setTotalWagersAndWatchlist] = useState(0);
    const [dataIsLoading, setDataIsLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [activeWagers, setActiveWagers] = useState([]);
    const [completedWagers, setCompletedWagers] = useState([]);
    const [activeWatchlist, setActiveWatchlist] = useState([]);
    const [completedWatchlist, setCompletedWatchlist] = useState([]);
    const [isActiveWager, setIsActiveWager] = useState(true);
    const [userInfo, setUserInfo] = useState<any | null>(null);
    const {} = props;
    const { data } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (data) {
            setName(data?.user.fullName);
            setUsername(data?.user.username);
        }
        console.log("data:", data);
        // console.log(data?.user.name);
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
                setDataIsLoading(false);
            }
            setIsLoading(false);
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
            setIsLoading(false);
        };
        fetchWatchlist();
    }, []);

    //fetch user data
    useEffect(() => {
        const fetchUser = async () => {
            const res = await getUserInfo(data?.user.id);
            console.log("userData:", res);
            setUserInfo(res.user);
        };
        if (data) {
            fetchUser();
        }
    }, [data]);

    return (
        <div className="tw-bg-[#1A2C3D] tw-pb-[60px] tw-flex tw-justify-center">
            <div className="tw-max-w-[862px]">
                <Image
                    src={TransitionPattern}
                    className="black-filter"
                    alt=""
                />
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
                                {"Joined September 2023 (default)"}
                            </div>
                            <div className="tw-flex tw-text-base tw-gap-6 tw-text-[#487f4b]">
                                <div>@{username}</div>
                                <div>{totalWagersAndWatchlist} wagers</div>
                                <div>-- wins</div>
                            </div>
                        </div>
                    </div>
                    <button className="tw-text-base tw-font-medium tw-text-[#f2ca16] tw-border-[1px] tw-border-[#f2ca16] tw-py-2 tw-px-3 tw-rounded tw-mt-4 sm:tw-mt-[50px] tw-h-[44px] tw-disabled tw-cursor-auto tw-opacity-30">
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
                    <div className="tw-flex tw-gap-6 tw-text-lg tw-font-light tw-leading-7">
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
                            className={`tw-border-b-2 tw-w-1/2 tw-py-2 tw-border-[#314150] tw-flex tw-justify-center tw-items-center tw-gap-2 ${
                                isActiveWager == true
                                    ? "tw-font-bold tw-text-lg tw-border-white"
                                    : ""
                            }`}
                        >
                            <div>ACTIVE </div>
                            {!isLoading && (
                                <span className="tw-px-1 tw-text-sm tw-bg-[#f2ca16] tw-rounded tw-font-bold tw-text-[#0f1923]">
                                    {activeWagers.length}
                                </span>
                            )}
                        </button>
                        <button
                            id="completed-watchlist-button"
                            onClick={() => setIsActiveWager(false)}
                            className={`tw-border-b-2 tw-w-1/2 tw-py-2 tw-border-[#314150] ${
                                isActiveWager == false
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
                            activeWagers.map((wager: any) => (
                                <div key={wager._id}>
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
                                        />
                                    </TimerProvider>
                                </div>
                            ))
                        ) : (
                            completedWagers.map((wager: any) => (
                                <div key={wager._id}>
                                    <TimerProvider
                                        deadline={wager.auctionDeadline}
                                    >
                                        <CompletedWagerCard
                                            title={`${wager.auctionYear} ${wager.auctionMake} ${wager.auctionModel}`}
                                            img={wager.auctionImage}
                                            my_wager={wager.priceGuessed}
                                            id={wager.auctionIdentifierId}
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
    my_wager: number;
    id: string;
};

const CompletedWagerCard: React.FC<CompletedWagerCardProps> = ({
    title,
    img,
    my_wager,
    id,
}) => {
    return (
        <div>
            <div className="tw-flex tw-gap-6 tw-py-6 tw-px-6 tw-items-center">
                <Image
                    src={img}
                    width={100}
                    height={100}
                    alt={title}
                    className="tw-rounded tw-w-[100px] tw-h-[100px] tw-object-cover"
                />
                <div className="tw-grid tw-gap-1.5">
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
                            <div className="tw-text-[#d1d3d6]">Wager:</div>
                            <div className="tw-text-[#f2ca16] tw-font-bold">
                                ${my_wager}
                            </div>
                        </div>
                        <div className="tw-flex tw-gap-2 tw-text-sm">
                            <Image
                                src={DollarIcon}
                                alt=""
                                className="tw-text-[#d1d3d6] tw-w-3.5"
                            />
                            <div className="tw-text-[#d1d3d6]">
                                Winning Bid:
                            </div>
                            <div className="tw-text-[#49c742] tw-font-bold">
                                --
                            </div>
                        </div>
                        <div className="tw-flex tw-gap-2 tw-text-sm tw-items-center">
                            <Image
                                src={HourglassIcon}
                                alt=""
                                className="tw-text-[#d1d3d6] tw-w-3.5 tw-h-3.5"
                            />
                            <div className="tw-text-[#d1d3d6]">Status:</div>
                            <div>Completed</div>
                        </div>
                    </div>
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
