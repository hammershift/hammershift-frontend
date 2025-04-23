"use client";

import {
    getAuctionTransactions,
    getMyPredictions,
    getTournamentTransactions,
    getUserPointsAndPlacing,
    refundWager,
} from "@/lib/data";
import { CircleDollarSignIcon, LogOut, Settings, UserIcon } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { BeatLoader, BounceLoader } from "react-spinners";
import AccountIcon from "../../../public/images/account-icon.svg";
import Dollar from "../../../public/images/dollar.svg";
import HamburgerMenu from "../../../public/images/hamburger-menu.svg";
import HammerIcon from "../../../public/images/hammer-icon.svg";
import Hourglass from "../../../public/images/hour-glass.svg";
import MoneyBag from "../../../public/images/monetization-browser-bag-big.svg";
import MoneyBagGreen from "../../../public/images/monetization-browser-bag-green.svg";
import MoneyBagBlack from "../../../public/images/money-bag-black.svg";
import PodiumIcon from "../../../public/images/podium-icon.svg";
import ThreeStars from "../../../public/images/three-star-icon.svg";
import WalletSmall from "../../../public/images/wallet--money-payment-finance-wallet.svg";
import CancelIcon from "../../../public/images/x-icon.svg";
import { TimerProvider, useTimer } from "../_context/TimerContext";
import { Button } from "./ui/button";
import { createPageUrl } from "./utils";

const Navbar = () => {
    const router = useRouter();
    const [menuIsOpen, setMenuIsOpen] = useState(false);
    const [dropPredictions, setDropPredictions] = useState(false);
    const [dropMyAccount, setDropMyAccount] = useState(false);
    const [myAccountMenuOpen, setMyAccountMenuOpen] = useState(false);
    const logoUrl =
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/08c277_VelocityMarketsLogo-White.png";
    const navBarList = [
        { title: "Home", urlString: "" },
        { title: "Free Play", urlString: "Free Play" },
        { title: "Tournaments (COMING SOON)", urlString: "Tournaments" },
        { title: "Guess the Hammer (COMING SOON)", urlString: "Price Is Right" },
    ];
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const predictionsButton = document.getElementById("predictions-button");
            const predictionsActiveButton = document.getElementById(
                "active-predictions-button"
            );
            const predictionsCompletedButton = document.getElementById(
                "completed-predictions-button"
            );
            const predictionsSortButton = document.getElementById("predictions-sort");

            const myAccountButton = document.getElementById("myaccount-button");

            if (
                predictionsButton &&
                !predictionsButton.contains(e.target as Node) &&
                predictionsActiveButton &&
                !predictionsActiveButton.contains(e.target as Node) &&
                predictionsCompletedButton &&
                !predictionsCompletedButton.contains(e.target as Node) &&
                predictionsSortButton &&
                !predictionsSortButton.contains(e.target as Node)
            ) {
                setDropPredictions(false);
            }

            const claimRefundButtons = document.getElementsByClassName(
                "claim-button"
            ) as HTMLCollectionOf<HTMLElement>;

            const isClaimButtonClicked = Array.from(claimRefundButtons).some(
                (button) => button.contains(e.target as Node)
            );

            if (isClaimButtonClicked) {
                setDropPredictions(true);
            }

            if (
                myAccountButton &&
                !myAccountButton.contains(e.target as Node)
            ) {
                setDropMyAccount(false);
            }
        };

        document.addEventListener("click", handleClickOutside);

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [
        setDropPredictions,
        setDropMyAccount,
    ]);

    const closeMenu = () => {
        setMenuIsOpen(false);
    };

    const closeMyAccountMenu = () => {
        setMyAccountMenuOpen(false);
    };

    const { data: session } = useSession();
    const isLoggedIn = !!session;
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setLoading(false);
        }, 1800);
    }, []);

    return (
        <div className="navbar-container flex items-center justify-center">
            <div className="flex w-full justify-between border-b-[1px] border-b-[#1b252e] px-4 py-3 md:px-16">
                <div className="flex items-center justify-center">
                    <div className="pr-4">
                        <Link
                            onClick={() => {
                                closeMenu();
                                closeMyAccountMenu();
                                document.body.classList.remove(
                                    "stop-scrolling"
                                );
                            }}
                            href="/"
                        >
                            <Image
                                src={logoUrl}
                                width={330}
                                height={32}
                                alt="Velocity Markets"
                                className="h-auto w-auto sm:block"
                            />
                        </Link>
                    </div>
                </div>
                <div className="flex justify-center items-center">
                    <div className="relative hidden items-center justify-center lg:flex">
                        <nav className="flex items-center justify-center space-x-8">
                            {navBarList.map((data, index) => (
                                <Link
                                    key={index}
                                    href={createPageUrl(data.urlString)}
                                    className={`transition-colors hover:text-[#F2CA16] ${data.title.includes("COMING SOON") ? 'pointer-events-none opacity-50' : ''
                                        }`}
                                    aria-disabled={data.title.includes("COMING SOON")}
                                    tabIndex={data.title.includes("COMING SOON") ? -1 : undefined}
                                >
                                    {data.title.toUpperCase()}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
                {!loading && !isLoggedIn &&
                    <div className="flex justify-center items-center">
                        <Link href="/login_page">
                            <Button className="h-10 w-20 bg-[#F2CA16] text-[#0C1924] hover:bg-[#F2CA16]/90">
                                LOG IN
                            </Button>
                        </Link>
                        <Link href="/create_account">
                            <Button className="ml-2 h-10 w-20 bg-[#F2CA16] text-[#0C1924] hover:bg-[#F2CA16]/90">
                                SIGN UP
                            </Button>
                        </Link>
                        <button
                            onClick={() => {
                                setMenuIsOpen((prev) => !prev);
                                setMyAccountMenuOpen(false);
                                if (!menuIsOpen) {
                                    document.body.classList.add(
                                        "stop-scrolling"
                                    );
                                } else {
                                    document.body.classList.remove(
                                        "stop-scrolling"
                                    );
                                }
                            }}
                        >
                            {menuIsOpen ? (
                                <Image
                                    src={CancelIcon}
                                    width={24}
                                    height={24}
                                    alt="menu"
                                    className="h-auto w-auto md:hidden"
                                />
                            ) : (
                                <Image
                                    src={HamburgerMenu}
                                    width={24}
                                    height={24}
                                    alt="menu"
                                    className="h-auto w-auto md:hidden"
                                />
                            )}
                        </button>
                    </div>
                }
                {
                    !loading && isLoggedIn && (
                        <div className="flex justify-center items-center">
                            {/* Buttons for logged in accounts */}
                            <div className="flex items-center justify-center gap-4 px-4">
                                <button
                                    id="predictions-button"
                                    onClick={() => {
                                        setDropPredictions((prev) => !prev);
                                        setDropMyAccount(false);
                                    }}
                                >
                                    <CircleDollarSignIcon className="h-8 w-8 text-[#F2CA16]" />
                                </button>
                                {dropPredictions && <PredictionsDropdownMenu closeMenu={closeMenu} />}
                                <button
                                    id="myaccount-button"
                                    className="relative"
                                    onClick={() => {
                                        setDropMyAccount((prev) => !prev);
                                        setDropPredictions(false);
                                    }}
                                >
                                    {/* <Image
                                src={AccountIcon}
                                width={24}
                                height={24}
                                alt="account"
                                className="h-[24px] w-[24px]"
                            /> */}
                                    <div
                                        className={`flex h-8 w-8 items-center justify-center rounded-full bg-[#F2CA16] text-black`}
                                    >
                                        {session ? session.user.username?.[0]?.toUpperCase() : "U"}
                                    </div>
                                    {dropMyAccount && <MyAccountDropdownMenu />}
                                </button>
                            </div>
                            <div className="sm:hidden">
                                <button
                                    onClick={() => {
                                        setMyAccountMenuOpen((prev) => !prev);
                                        setMenuIsOpen(false);
                                        document.body.classList.remove(
                                            "stop-scrolling"
                                        );
                                    }}
                                    className="mr-4"
                                >
                                    <Image
                                        src={AccountIcon}
                                        width={24}
                                        height={24}
                                        alt="account"
                                        className="h-[24px] w-[24px]"
                                    />
                                </button>
                                <button
                                    onClick={() => {
                                        setMenuIsOpen((prev) => !prev);
                                        setMyAccountMenuOpen(false);
                                        if (!menuIsOpen) {
                                            document.body.classList.add(
                                                "stop-scrolling"
                                            );
                                        } else {
                                            document.body.classList.remove(
                                                "stop-scrolling"
                                            );
                                        }
                                    }}
                                >
                                    {menuIsOpen ? (
                                        <Image
                                            src={CancelIcon}
                                            width={24}
                                            height={24}
                                            alt="menu"
                                            className="h-auto w-auto"
                                        />
                                    ) : (
                                        <Image
                                            src={HamburgerMenu}
                                            width={24}
                                            height={24}
                                            alt="menu"
                                            className="h-auto w-auto"
                                        />
                                    )}
                                </button>
                            </div>
                        </div>
                    )
                }
                {loading && (
                    <div className="flex justify-end items-center space-x-2">
                        <div className="h-10 w-20 bg-gray-300 rounded animate-pulse" />
                        <div className="h-10 w-20 bg-gray-300 rounded animate-pulse" />
                    </div>
                )}
            </div>
            {myAccountMenuOpen && (
                <MyAccountMenu
                    closeMyAccountMenu={closeMyAccountMenu}
                    isLoggedIn={isLoggedIn}
                />
            )}
        </div>
    );
};
export default Navbar;

interface MyAccountMenuProps {
    isLoggedIn: boolean;
    closeMyAccountMenu: () => void;
}

const MyAccountMenu: React.FC<MyAccountMenuProps> = ({
    isLoggedIn,
    closeMyAccountMenu,
}) => {
    const [walletBalance, setWalletBalance] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        const fetchWalletBalance = async () => {
            if (session) {
                setIsLoading(true);
                try {
                    const res = await fetch("/api/wallet", {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });

                    const data = await res.json();
                    if (res.ok) {
                        setWalletBalance(data.balance);
                    } else {
                        console.error(
                            "Failed to fetch wallet balance:",
                            data.message
                        );
                    }
                } catch (error) {
                    console.error("Error fetching wallet balance:", error);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchWalletBalance();
    }, [session]);

    const handleSignOut = async () => {
        try {
            await signOut({ redirect: false });
            router.push("/");
            console.log("User successfully logged out");
        } catch (error) {
            console.error("Error during sign out:", error);
        }
    };

    return (
        <div className="slide-in-top absolute z-50 flex h-auto w-full flex-col bg-[#1A2C3D] p-4 text-white">
            {/* <div className="p-1.5 text-lg font-bold">MY ACCOUNT</div> */}
            {/* {isLoading ? (
                <div className="flex w-full items-center justify-center px-6">
                    <BeatLoader color="#696969" size={10} />
                </div>
            ) : typeof walletBalance === "number" ? (
                <div className="w-full">
                    <div className="flex w-full items-center gap-6 rounded bg-[#49C74233] px-6 py-4">
                        <Image
                            src={Wallet}
                            width={32}
                            height={32}
                            alt="wallet icon"
                            className="h-8 w-8"
                        />
                        <div className="flex grow flex-col items-start">
                            <span className="py-1 text-xl font-bold">
                                ${walletBalance.toFixed(2)}
                            </span>
                            <span className="text-[#49C742]">Withdraw</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="w-full px-6">Error fetching wallet balance</div>
            )} */}
            <Link
                href="/profile"
                className="w-full p-1.5 hover:bg-white/5"
                onClick={closeMyAccountMenu}
            >
                Profile
            </Link>
            <Link
                href="/profile"
                className="w-full p-1.5 hover:bg-white/5"
                onClick={closeMyAccountMenu}
            >
                Settings
            </Link>
            <button
                onClick={() => {
                    handleSignOut();
                    closeMyAccountMenu();
                }}
                className="w-full p-1.5 text-left hover:bg-white/5"
            >
                Logout
            </button>
        </div>
    );
};

export const MyWatchlistTournamentCard = ({
    watchlist,
    isActive,
    closeMenu,
}: any) => {
    const { days, hours, minutes, seconds } = useTimer();
    let formattedDateString;
    if (watchlist.endTime) {
        formattedDateString = new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        }).format(new Date(watchlist.endTime));
    }

    return (
        <div
            className={`w-full border-t-[1px] border-[#253747] px-5 py-4 sm:px-6`}
        >
            <div className="flex w-full items-center gap-6 rounded sm:py-3">
                <Link
                    href={`/tournaments/${watchlist.tournamentID}`}
                    className="grid w-[50px] grid-cols-2 gap-[2px] pt-2 sm:w-[100px] sm:p-0"
                    onClick={() => closeMenu && closeMenu()}
                >
                    {watchlist.tournamentImages
                        .slice(0, 4)
                        .map((image: string, index: number) => {
                            return (
                                <Image
                                    key={index}
                                    src={image}
                                    alt="car image"
                                    width={49}
                                    height={49}
                                    className="h-[24.5px] w-[24.5px] rounded object-cover sm:h-[49px] sm:w-[49px]"
                                />
                            );
                        })}
                </Link>
                <div className="flex max-w-[230px] flex-col items-start sm:max-w-[323px]">
                    <Link
                        href={`/tournaments/${watchlist.tournamentID}`}
                        className="self-start"
                        onClick={() => closeMenu && closeMenu()}
                    >
                        <div className="line-clamp-1 w-full text-left text-base font-bold sm:py-1 sm:text-lg">
                            {watchlist.title}
                        </div>
                    </Link>
                    {!isActive && (
                        <div className="text-xs opacity-80 sm:mb-2">
                            Ended {formattedDateString}
                        </div>
                    )}
                    <div className="mt-1 w-full text-sm">
                        {isActive && (
                            <div className="flex w-full items-center gap-2">
                                <Image
                                    src={Hourglass}
                                    width={14}
                                    height={14}
                                    alt="wallet icon"
                                    className="h-[14px] w-[14px]"
                                />
                                <span className="opacity-80">Time Left:</span>
                                {Number(days) < 1 ? (
                                    <span className="text-[#c2451e]">{`${days}:${hours}:${minutes}:${seconds}`}</span>
                                ) : (
                                    <span className="">{`${days}:${hours}:${minutes}:${seconds}`}</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

interface MyWatchlistCardProps {
    title: string;
    img: string;
    current_bid: number;
    time_left?: Date;
    id: string;
    isActive: boolean;
    closeMenu?: () => void;
    index?: number;
}
export const MyWatchlistCard: React.FC<MyWatchlistCardProps> = ({
    title,
    img,
    current_bid,
    time_left,
    id,
    isActive,
    closeMenu,
    index,
}) => {
    const { days, hours, minutes, seconds } = useTimer();
    let formattedDateString;
    if (time_left) {
        formattedDateString = new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        }).format(new Date(time_left));
    }

    return (
        <div
            className={`w-full px-5 py-4 sm:px-6 ${index === 0 ? "" : "border-t-[1px] border-[#253747]"
                }`}
        >
            <div className="flex w-full items-center gap-6 rounded sm:py-3">
                <Link
                    href={`/auction_details?id=${id}&mode=free_play`}
                    onClick={() => closeMenu && closeMenu()}
                    className="h-[50px] w-[50px] self-start pt-2 sm:h-[100px] sm:w-[100px] sm:pt-0"
                >
                    <Image
                        src={img}
                        width={100}
                        height={100}
                        alt="wallet icon"
                        className="h-[50px] w-[50px] rounded-[4px] object-cover sm:h-[100px] sm:w-[100px]"
                    />
                </Link>
                <div className="flex max-w-[230px] flex-col items-start sm:max-w-[323px]">
                    <Link
                        href={`/auction_details?id=${id}&mode=free_play`}
                        className="self-start"
                        onClick={() => closeMenu && closeMenu()}
                    >
                        <div className="line-clamp-1 w-full text-left text-base font-bold sm:py-1 sm:text-lg">
                            {title}
                        </div>
                    </Link>
                    {!isActive && (
                        <div className="text-xs opacity-80 sm:mb-2">
                            Ended {formattedDateString}
                        </div>
                    )}
                    <div className="mt-1 w-full text-sm">
                        {!isActive && (
                            <div className="flex w-full items-center gap-2">
                                <Image
                                    src={HammerIcon}
                                    width={14}
                                    height={14}
                                    alt="wallet icon"
                                    className="h-[14px] w-[14px]"
                                />
                                <span className="opacity-80">
                                    Hammer Price:
                                </span>
                                <span className="font-bold text-[#49C742]">
                                    $
                                    {new Intl.NumberFormat().format(
                                        current_bid
                                    )}
                                </span>
                            </div>
                        )}
                        {isActive && (
                            <div className="flex w-full items-center gap-2">
                                <Image
                                    src={Dollar}
                                    width={14}
                                    height={14}
                                    alt="wallet icon"
                                    className="h-[14px] w-[14px]"
                                />
                                <span className="opacity-80">Current Bid:</span>
                                <span className="font-bold text-[#49C742]">
                                    $
                                    {new Intl.NumberFormat().format(
                                        current_bid
                                    )}
                                </span>
                            </div>
                        )}
                        {isActive && (
                            <div className="flex w-full items-center gap-2">
                                <Image
                                    src={Hourglass}
                                    width={14}
                                    height={14}
                                    alt="wallet icon"
                                    className="h-[14px] w-[14px]"
                                />
                                <span className="opacity-80">Time Left:</span>
                                {Number(days) < 1 ? (
                                    <span className="text-[#c2451e]">{`${days}:${hours}:${minutes}:${seconds}`}</span>
                                ) : (
                                    <span className="">{`${days}:${hours}:${minutes}:${seconds}`}</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


const PredictionsDropdownMenu: React.FC<MobileMyWatchlistProps> = ({ closeMenu }) => {
    const router = useRouter();
    const [activeOrCompleted, setActiveOrCompleted] = useState("active");
    const [activePredictions, setActivePredictions] = useState([]);
    const [completedPredictions, setCompletedPredictions] = useState([]);
    const [activeTournamentPredictions, setActiveTournamentPredictions] = useState([]);
    const [completedTournamentPredictions, setCompletedTournamentPredictions] = useState(
        []
    );
    const [isLoading, setIsLoading] = useState(true);
    // const words = ["ALL", "AUCTIONS", "TOURNAMENTS"];
    // const [predictionSort, setPredictionSort] = useState(words[0]);

    useEffect(() => {
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
            setIsLoading(false);
        };
        fetchPredictions();
    }, []);

    // const handleClick = () => {
    //     const currentIndex = words.indexOf(predictionSort);
    //     const nextIndex = (currentIndex + 1) % words.length;
    //     setPredictionSort(words[nextIndex]);
    // };

    return (
        <div className="my-wagers-menu absolute right-[56px] top-10 z-30 max-h-[784px] w-[512px] overflow-auto rounded bg-[#1A2C3D] pb-2 pt-6 shadow-xl shadow-black">
            <div className="flex flex-col gap-4 px-6">
                <div className="flex justify-between">
                    <div className="text-left text-lg font-bold">PREDICTIONS</div>
                    {/* {(activePredictions.length !== 0 ||
                        completedPredictions.length !== 0 ||
                        activeTournamentPredictions.length !== 0 ||
                        completedTournamentPredictions.length !== 0) && (
                            <button
                                id="predictions-sort"
                                type="button"
                                className="text-white-900 w-[140px] truncate rounded-sm bg-[#172431] px-2 py-1.5 text-center shadow-sm hover:bg-[#0f1923]"
                                onClick={handleClick}
                            >
                                {predictionSort}
                            </button>
                        )} */}
                </div>
                <div className="flex">
                    <button
                        id="active-predictions-button"
                        onClick={() => setActiveOrCompleted("active")}
                        className="flex w-1/2 items-center justify-center gap-2 border-b-2 border-[#314150] py-2 focus:border-white focus:font-bold"
                        autoFocus
                    >
                        <div>ACTIVE </div>
                        {!isLoading && (
                            <span className="rounded bg-[#f2ca16] px-1 text-sm font-bold text-[#0f1923]">
                                {activePredictions.length +
                                    activeTournamentPredictions.length}
                            </span>
                        )}
                    </button>
                    <button
                        id="completed-predictions-button"
                        onClick={() => setActiveOrCompleted("completed")}
                        className="w-1/2 border-b-2 border-[#314150] py-2 focus:border-white focus:font-bold"
                    >
                        COMPLETED
                    </button>
                </div>
            </div>
            {isLoading && (
                <div className="flex justify-center pb-[66px] pt-[74px]">
                    <BounceLoader color="#696969" loading={true} />
                </div>
            )}
            {activeOrCompleted === "active" &&
                (activePredictions.length !== 0 ||
                    activeTournamentPredictions.length !== 0) ? (
                <div className="w-full">
                    {
                        // predictionSort !== "TOURNAMENTS" &&
                        activePredictions.map((prediction: any, index: number) => (
                            <div key={prediction._id}>
                                <TimerProvider deadline={prediction.auctionDeadline}>
                                    <PredictionsCard
                                        title={`${prediction.auctionYear} ${prediction.auctionMake} ${prediction.auctionModel}`}
                                        img={prediction.auctionImage}
                                        my_prediction={prediction.priceGuessed}
                                        current_bid={prediction.auctionPrice}
                                        time_left={prediction.auctionDeadline}
                                        potential_prize={prediction.auctionPot}
                                        id={prediction.auctionIdentifierId}
                                        isActive={true}
                                        closeMenu={closeMenu}
                                        status={prediction.auctionStatus}
                                        predictionAmount={prediction.wagerAmount}
                                        objectID={prediction.auctionObjectId}
                                        predictionID={prediction._id}
                                        isRefunded={prediction.refunded}
                                        prize={prediction.prize}
                                        deadline={prediction.auctionDeadline}
                                        index={index}
                                    />
                                </TimerProvider>
                            </div>
                        ))
                    }
                    {/* {predictionSort !== "AUCTIONS" &&
                        activeTournamentPredictions.map((wager: any) => {
                            return (
                                <div key={wager._id}>
                                    <TimerProvider
                                        deadline={wager.tournamentEndTime}
                                    >
                                        <MyWagersTournamentCard
                                            wager={wager}
                                            isActive={true}
                                        />
                                    </TimerProvider>
                                </div>
                            );
                        })} */}
                </div>
            ) : null}
            {
                //TODO: completed predictions completed card
                activeOrCompleted === "completed" &&
                    (completedPredictions.length !== 0 ||
                        completedTournamentPredictions.length !== 0) ? (
                    <div className="w-full">
                        {
                            // predictionSort !== "TOURNAMENTS" &&
                            completedPredictions.map((prediction: any, index: number) => (
                                <div key={prediction._id}>
                                    <TimerProvider deadline={prediction.auctionDeadline}>
                                        <PredictionsCard
                                            title={`${prediction.auctionYear} ${prediction.auctionMake} ${prediction.auctionModel}`}
                                            img={prediction.auctionImage}
                                            my_prediction={prediction.priceGuessed}
                                            current_bid={prediction.auctionPrice}
                                            time_left={prediction.auctionDeadline}
                                            potential_prize={prediction.auctionPot}
                                            id={prediction.auctionIdentifierId}
                                            isActive={false}
                                            status={prediction.auctionStatus}
                                            predictionAmount={prediction.wagerAmount}
                                            objectID={prediction.auctionObjectId}
                                            predictionID={prediction._id}
                                            isRefunded={prediction.refunded}
                                            prize={prediction.prize}
                                            deadline={prediction.auctionDeadline}
                                            index={index}
                                        />
                                    </TimerProvider>
                                </div>
                            ))
                        }
                        {/* {predictionSort !== "AUCTIONS" &&
                        completedTournamentPredictions.map((prediction: any) => {
                            return (
                                <div key={prediction._id}>
                                    <TimerProvider
                                        deadline={prediction.tournamentEndTime}
                                    >
                                        <MyWagersTournamentCard
                                            wager={prediction}
                                            isActive={false}
                                        />
                                    </TimerProvider>
                                </div>
                            );
                        })} */}
                    </div>
                ) : null}
            {isLoading === false &&
                activeOrCompleted === "active" &&
                activePredictions.length === 0 &&
                activeTournamentPredictions.length === 0 ? (
                <div className="flex w-full flex-col items-center justify-center gap-4 px-6 py-16">
                    <Image
                        src={MoneyBag}
                        width={80}
                        height={80}
                        alt="watchlist icon"
                        className="h-[80px] w-[80px]"
                    />
                    <div className="">
                        <div className="text-center text-xl font-bold">
                            No active predictions
                        </div>
                        {/* <div className="text-center opacity-70">
                            Quam temere in vitiis, legem sancimus haerentia
                        </div> */}
                    </div>
                    <Link
                        href="/free_play"
                        className="link-transparent-white"
                    >
                        DISCOVER AUCTIONS
                    </Link>
                </div>
            ) : null}
            {isLoading === false &&
                activeOrCompleted === "completed" &&
                completedPredictions.length === 0 &&
                completedTournamentPredictions.length === 0 ? (
                <div className="flex w-full flex-col items-center justify-center gap-4 px-6 py-16">
                    <Image
                        src={MoneyBag}
                        width={80}
                        height={80}
                        alt="watchlist icon"
                        className="h-[80px] w-[80px]"
                    />
                    <div className="">
                        <div className="text-center text-xl font-bold">
                            No completed predictions
                        </div>
                        {/* <div className="text-center opacity-70">
                            Quam temere in vitiis, legem sancimus haerentia
                        </div> */}
                    </div>
                    <Link
                        href="/free_play"
                        className="link-transparent-white"
                    >
                        DISCOVER AUCTIONS
                    </Link>
                </div>
            ) : null}
            {/* {isLoading === false &&
                activeOrCompleted === "completed" &&
                completedPredictions.length === 0 &&
                predictionSort === "AUCTIONS" ? (
                <div className="flex w-full flex-col items-center justify-center gap-4 px-6 py-16">
                    <Image
                        src={MoneyBag}
                        width={80}
                        height={80}
                        alt="watchlist icon"
                        className="h-[80px] w-[80px]"
                    />
                    <div className="">
                        <div className="text-center text-xl font-bold">
                            No completed predictions
                        </div>
                    </div>
                    <Link
                        href="/free_play"
                        className="link-transparent-white"
                    >
                        DISCOVER AUCTIONS
                    </Link>
                </div>
            ) : null} */}
            {/* {isLoading === false &&
                activeOrCompleted === "completed" &&
                completedTournamentPredictions.length === 0 &&
                predictionSort === "TOURNAMENTS" ? (
                <div className="flex w-full flex-col items-center justify-center gap-4 px-6 py-16">
                    <Image
                        src={MoneyBag}
                        width={80}
                        height={80}
                        alt="watchlist icon"
                        className="h-[80px] w-[80px]"
                    />
                    <div className="">
                        <div className="text-center text-xl font-bold">
                            No completed wagers
                        </div>
                        <div className="text-center opacity-70">
                            Quam temere in vitiis, legem sancimus haerentia
                        </div>
                    </div>
                    <button
                        onClick={() => router.push("/auctions")}
                        className="btn-transparent-white"
                    >
                        DISCOVER AUCTIONS
                    </button>
                </div>
            ) : null} */}
            {/* {isLoading === false &&
                activeOrCompleted === "active" &&
                activePredictions.length === 0 &&
                predictionSort === "AUCTIONS" ? (
                <div className="flex w-full flex-col items-center justify-center gap-4 px-6 py-16">
                    <Image
                        src={MoneyBag}
                        width={80}
                        height={80}
                        alt="watchlist icon"
                        className="h-[80px] w-[80px]"
                    />
                    <div className="">
                        <div className="text-center text-xl font-bold">
                            No active predictions
                        </div>
                    </div>
                    <Link
                        href="/free_play"
                        className="link-transparent-white"
                    >
                        DISCOVER AUCTIONS
                    </Link>
                </div>
            ) : null} */}
            {/* {isLoading === false &&
                activeOrCompleted === "active" &&
                activeTournamentPredictions.length === 0 &&
                predictionSort === "TOURNAMENTS" ? (
                <div className="flex w-full flex-col items-center justify-center gap-4 px-6 py-16">
                    <Image
                        src={MoneyBag}
                        width={80}
                        height={80}
                        alt="watchlist icon"
                        className="h-[80px] w-[80px]"
                    />
                    <div className="">
                        <div className="text-center text-xl font-bold">
                            No active wagers
                        </div>
                        <div className="text-center opacity-70">
                            Quam temere in vitiis, legem sancimus haerentia
                        </div>
                    </div>
                    <button
                        onClick={() => router.push("/auctions")}
                        className="btn-transparent-white"
                    >
                        DISCOVER AUCTIONS
                    </button>
                </div>
            ) : null} */}
        </div>
    );
};

export const PredictionsTournamentCard = ({ wager: prediction, isActive, closeMenu }: any) => {
    const { days, hours, minutes, seconds } = useTimer();
    const [prize, setPrize] = useState(0);
    const [pointsAndPlacing, setPointsAndPlacing] = useState<{
        placing: number;
        totalScore: number;
    }>({ placing: 0, totalScore: 0 });
    let formattedDateString;
    if (prediction.tournamentEndTime) {
        formattedDateString = new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        }).format(new Date(prediction.tournamentEndTime));
    }

    const addNumberSuffix = (number: number) => {
        const suffixes = [
            "th",
            "st",
            "nd",
            "rd",
            "th",
            "th",
            "th",
            "th",
            "th",
            "th",
        ];
        if (number % 100 >= 11 && number % 100 <= 13) {
            return number + "th";
        } else {
            return number + suffixes[number % 10];
        }
    };

    useEffect(() => {
        const fetchTotalPointsAndPlacing = async () => {
            const data = await getUserPointsAndPlacing(
                prediction._id,
                prediction.user._id
            );
            setPointsAndPlacing(data);
        };

        fetchTotalPointsAndPlacing();
    }, []);

    useEffect(() => {
        const fetchPrize = async () => {
            const transactions = await getTournamentTransactions(prediction._id);

            const totalPrize =
                0.88 *
                transactions
                    .map((transaction: any) => transaction.amount)
                    .reduce(
                        (accumulator: any, currentValue: any) =>
                            accumulator + currentValue,
                        0
                    );
            setPrize(totalPrize);
        };
        fetchPrize();
    }, []);

    return (
        <div className="w-full border-t-[1px] border-[#253747] px-5 py-4 sm:px-6">
            <div className="flex w-full items-start gap-6 rounded sm:py-3">
                <Link
                    href={`/tournaments/${prediction._id}`}
                    className="grid w-[50px] grid-cols-2 gap-[2px] pt-2 sm:w-[100px] sm:p-0"
                    onClick={() => closeMenu && closeMenu()}
                >
                    {prediction.tournamentImages
                        .slice(0, 4)
                        .map((image: string, index: number) => {
                            return (
                                <Image
                                    key={index}
                                    src={image}
                                    alt="car image"
                                    width={49}
                                    height={49}
                                    className="h-[24.5px] w-[24.5px] rounded object-cover sm:h-[49px] sm:w-[49px]"
                                />
                            );
                        })}
                </Link>
                <div className="flex w-auto max-w-[230px] grow flex-col items-start sm:max-w-[323px]">
                    <Link
                        href={`/tournaments/${prediction._id}`}
                        className="self-start"
                        onClick={() => closeMenu && closeMenu()}
                    >
                        <div
                            className={`line-clamp-1 w-full text-left text-base font-bold sm:text-lg ${isActive ? "sm:mt-[14px]" : "sm:mt-[5px]"
                                }`}
                        >
                            {prediction.tournamentTitle}
                        </div>
                    </Link>
                    {!isActive && (
                        <div className="text-xs opacity-80 sm:mb-2">
                            Ended {formattedDateString}
                        </div>
                    )}
                    <div className="mt-1 w-full text-sm">
                        <div className="flex items-center gap-2">
                            <Image
                                src={PodiumIcon}
                                width={14}
                                height={14}
                                alt="wallet icon"
                                className="h-[14px] w-[14px]"
                            />
                            <span className="opacity-80">Place:</span>
                            <span className="font-bold text-[#F2CA16]">
                                {isActive ? "Current: " : null}
                                {pointsAndPlacing.placing
                                    ? addNumberSuffix(pointsAndPlacing.placing)
                                    : "-"}{" "}
                                Place
                            </span>
                        </div>
                        {!isActive && (
                            <div className="flex items-center gap-2">
                                <Image
                                    src={ThreeStars}
                                    width={14}
                                    height={14}
                                    alt="wallet icon"
                                    className="h-[14px] w-[14px]"
                                />
                                <span className="opacity-80">Points:</span>{" "}
                                {pointsAndPlacing.totalScore
                                    ? new Intl.NumberFormat().format(
                                        pointsAndPlacing.totalScore
                                    )
                                    : "-"}{" "}
                                pts. away
                            </div>
                        )}
                        {prediction.prize && (
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
                                    {prediction.prize % 1 === 0
                                        ? prediction.prize.toLocaleString()
                                        : prediction.prize.toLocaleString(
                                            undefined,
                                            {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }
                                        )}{" "}
                                    🎉
                                </div>
                            </div>
                        )}
                        {isActive && (
                            <div className="flex items-center gap-2">
                                <Image
                                    src={Hourglass}
                                    width={14}
                                    height={14}
                                    alt="wallet icon"
                                    className="h-[14px] w-[14px]"
                                />
                                <span className="opacity-80">Time Left:</span>
                                {Number(days) < 1 ? (
                                    <span className="text-[#c2451e]">{`${days}:${hours}:${minutes}:${seconds}`}</span>
                                ) : (
                                    <span className="">{`${days}:${hours}:${minutes}:${seconds}`}</span>
                                )}
                            </div>
                        )}
                    </div>
                    {isActive && (
                        <div className="mt-2 flex w-full items-center justify-between rounded bg-[#49C74233] p-1 text-xs sm:mt-[30px] sm:gap-4 sm:p-2 sm:text-sm">
                            <div className="flex items-center gap-2">
                                <Image
                                    src={MoneyBagGreen}
                                    width={20}
                                    height={20}
                                    alt="money bag"
                                    className="h-[20px] w-[20px]"
                                />
                                <div className="grow-[1] text-left font-bold text-[#49C742]">
                                    POTENTIAL PRIZE
                                </div>
                            </div>
                            <div className="text-left font-bold text-[#49C742]">
                                {prize
                                    ? `$${new Intl.NumberFormat().format(prize)}`
                                    : " --"}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

interface PredictionsCardProps {
    title: string;
    img: string;
    my_prediction: number;
    current_bid: number;
    time_left: Date;
    potential_prize: number;
    id: string;
    isActive: boolean;
    status: number;
    predictionAmount: number;
    objectID: string;
    predictionID: string;
    isRefunded: boolean;
    closeMenu?: () => void;
    prize?: number;
    deadline: Date;
    index?: number;
}
export const PredictionsCard: React.FC<PredictionsCardProps> = ({
    title,
    img,
    my_prediction,
    current_bid,
    time_left,
    potential_prize,
    id,
    isActive,
    status,
    predictionAmount,
    objectID,
    predictionID,
    isRefunded,
    closeMenu,
    prize,
    deadline,
    index,
}) => {
    const { days, hours, minutes, seconds } = useTimer();
    const [refunded, setRefunded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [pot, setPot] = useState(0);

    useEffect(() => {
        const fetchPrize = async () => {
            const { totalPrize } = await getAuctionTransactions(objectID);
            setPot(totalPrize);
        };
        fetchPrize();
    }, []);

    let formattedDateString;
    if (deadline) {
        formattedDateString = new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        }).format(new Date(deadline));
    }

    useEffect(() => {
        setRefunded(isRefunded);
    }, []);

    const handleRefund = async (auctionObjectID: string, wagerID: string) => {
        setLoading(true);
        await refundWager(auctionObjectID, wagerID);
        setRefunded(true);
        setLoading(false);
    };

    return (
        <div
            className={`w-full px-5 py-4 sm:px-6 ${index === 0 ? "" : "border-t-[1px] border-[#253747]"
                }`}
        >
            <div className="flex w-full items-center gap-6 rounded sm:py-3">
                <Link
                    href={`/auction_details?id=${id}&mode=free_play`}
                    onClick={() => closeMenu && closeMenu()}
                    className="h-[50px] w-[50px] self-start pt-2 sm:h-[100px] sm:w-[100px] sm:pt-0"
                >
                    <Image
                        src={img}
                        width={100}
                        height={100}
                        alt="wallet icon"
                        className="h-[50px] w-[50px] rounded-[4px] object-cover sm:h-[100px] sm:w-[100px]"
                    />
                </Link>
                <div className="flex w-auto max-w-[230px] grow flex-col items-start sm:max-w-[323px]">
                    <Link
                        href={`/auction_details?id=${id}&mode=free_play`}
                        onClick={() => closeMenu && closeMenu()}
                        className="self-start"
                    >
                        <div className="line-clamp-1 w-full text-left text-base font-bold sm:text-lg">
                            {title}
                        </div>
                    </Link>
                    {status === 2 || status === 4 ? (
                        <div className="text-xs opacity-80 sm:mb-2">
                            Ended {formattedDateString}
                        </div>
                    ) : null}
                    <div className="mt-1 w-full text-sm">
                        <div className="flex items-center gap-2">
                            <Image
                                src={WalletSmall}
                                width={14}
                                height={14}
                                alt="wallet icon"
                                className="h-[14px] w-[14px]"
                            />
                            <span className="opacity-80">My Prediction:</span>
                            <span className="font-bold text-[#F2CA16]">
                                ${new Intl.NumberFormat().format(my_prediction)}
                            </span>
                        </div>
                        {prize ? (
                            <div className="flex items-center gap-2">
                                <Image
                                    src={HammerIcon}
                                    width={14}
                                    height={14}
                                    alt="wallet icon"
                                    className="h-[14px] w-[14px]"
                                />
                                <span className="opacity-80">
                                    Hammer Price:
                                </span>
                                <span className="font-bold text-[#49C742]">
                                    $
                                    {new Intl.NumberFormat().format(
                                        current_bid
                                    )}
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Image
                                    src={Dollar}
                                    width={14}
                                    height={14}
                                    alt="wallet icon"
                                    className="h-[14px] w-[14px]"
                                />
                                <span className="opacity-80">Current Bid:</span>
                                <span className="font-bold text-[#49C742]">
                                    $
                                    {new Intl.NumberFormat().format(
                                        current_bid
                                    )}
                                </span>
                            </div>
                        )}

                        {prize && (
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
                        {isActive && (
                            <div className="flex items-center gap-2">
                                <Image
                                    src={Hourglass}
                                    width={14}
                                    height={14}
                                    alt="wallet icon"
                                    className="h-[14px] w-[14px]"
                                />
                                <span className="opacity-80">Time Left:</span>
                                {Number(days) < 1 ? (
                                    <span className="text-[#c2451e]">{`${days}:${hours}:${minutes}:${seconds}`}</span>
                                ) : (
                                    <span className="">{`${days}:${hours}:${minutes}:${seconds}`}</span>
                                )}
                            </div>
                        )}
                    </div>
                    {isActive && !isRefunded && (
                        <div className="mt-2 flex w-full items-center justify-between rounded bg-[#49C74233] p-1 text-xs sm:mt-4 sm:gap-4 sm:p-2 sm:text-sm">
                            <div className="flex items-center gap-2">
                                <Image
                                    src={MoneyBagGreen}
                                    width={20}
                                    height={20}
                                    alt="money bag"
                                    className="h-[20px] w-[20px]"
                                />
                                <div className="grow-[1] text-left font-bold text-[#49C742]">
                                    POTENTIAL PRIZE
                                </div>
                            </div>
                            <div className="text-left font-bold text-[#49C742]">
                                $
                                {pot % 1 === 0
                                    ? pot.toLocaleString()
                                    : pot.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                            </div>
                        </div>
                    )}
                    {isActive && isRefunded && (
                        <div className="mt-2 flex w-full items-center gap-2 rounded bg-[#4b2330] p-1 text-xs sm:mt-4 sm:gap-4 sm:p-2 sm:text-sm">
                            <div className="grow-[1] text-left font-bold text-[#f92f60]">
                                ❌ AUCTION PREDICTION
                            </div>

                            <button
                                disabled
                                className="rounded-sm bg-[white] px-2 text-left text-[12px] font-bold text-[black]"
                            >
                                REFUNDED
                            </button>
                        </div>
                    )}
                    {status === 3 && (
                        <>
                            <div className="flex w-full items-center gap-2 text-sm">
                                <Image
                                    src={Dollar}
                                    width={14}
                                    height={14}
                                    alt="wallet icon"
                                    className="h-[14px] w-[14px]"
                                />
                                <span className="opacity-80">
                                    Prediction Amount:
                                </span>
                                <span className="font-bold text-[#f92f60]">
                                    $
                                    {new Intl.NumberFormat().format(
                                        predictionAmount
                                    )}
                                </span>
                            </div>
                            <div className="mt-2 flex w-full items-center gap-2 rounded bg-[#4b2330] p-1 text-xs sm:mt-4 sm:gap-4 sm:p-2 sm:text-sm">
                                <div className="grow-[1] text-left font-bold text-[#f92f60]">
                                    ❌ UNSUCCESSFUL{" "}
                                    <span className="hidden sm:inline-block">
                                        AUCTION
                                    </span>
                                </div>
                                {refunded ? (
                                    <button
                                        disabled
                                        className="rounded-sm bg-[white] px-2 text-left text-[12px] font-bold text-[black]"
                                    >
                                        REFUNDED
                                    </button>
                                ) : (
                                    <button
                                        onClick={() =>
                                            handleRefund(objectID, predictionID)
                                        }
                                        className="claim-button rounded-sm bg-[#facc15] px-2 text-left text-[12px] font-bold text-[black] hover:bg-[#ebcb48]"
                                    >
                                        {loading && (
                                            <div className="px-[14px]">
                                                <BeatLoader size={8} />
                                            </div>
                                        )}
                                        <span
                                            className={`${loading && "hidden"}`}
                                        >
                                            REFUND
                                            {/* CLAIM $
                                        {new Intl.NumberFormat().format(
                                            wagerAmount
                                        )}{" "} */}
                                        </span>
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const MyAccountDropdownMenu = () => {
    const [walletBalance, setWalletBalance] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        const fetchWalletBalance = async () => {
            if (session) {
                setIsLoading(true);
                try {
                    const res = await fetch("/api/wallet", {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });

                    const data = await res.json();
                    if (res.ok) {
                        setWalletBalance(data.balance);
                    } else {
                        console.error(
                            "Failed to fetch wallet balance:",
                            data.message
                        );
                    }
                } catch (error) {
                    console.error("Error fetching wallet balance:", error);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchWalletBalance();
    }, [session]);

    const handleSignOut = async () => {
        try {
            console.log("hello");
            await signOut({ redirect: false });
            router.push("/");
            console.log("User successfully logged out");
        } catch (error) {
            console.error("Error during sign out:", error);
        }
    };

    return (
        <div className="absolute right-0 top-8 z-10 flex h-auto w-[200px] flex-col items-start justify-between rounded bg-[#1A2C3D] shadow-xl shadow-black">
            {/* <div className="px-6 text-lg font-bold">MY ACCOUNT</div> */}
            {/* {isLoading ? (
                <div className="flex w-full items-center justify-center px-6">
                    <BeatLoader color="#696969" size={10} />
                </div>
            ) : typeof walletBalance === "number" ? (
                <div className="w-full px-6">
                    <div
                        className="flex w-full items-center gap-6 rounded bg-[#49C74233] px-6 py-4"
                        onClick={() => router.push("/my_wallet")}
                    >
                        <Image
                            src={Wallet}
                            width={32}
                            height={32}
                            alt="wallet icon"
                            className="h-8 w-8"
                        />
                        <div className="flex grow flex-col items-start">
                            <span className="py-1 text-xl font-bold">
                                ${walletBalance.toFixed(2)}
                            </span>
                            <span className="text-[#49C742]">My Wallet</span>
                        </div>
                        <Image
                            src={ArrowRight}
                            width={32}
                            height={32}
                            alt="wallet icon"
                            className="h-8 w-8"
                        />
                    </div>
                </div>
            ) : (
                <div className="w-full px-6">Error fetching wallet balance</div>
            )} */}
            <div
                onClick={() => router.push(createPageUrl("Profile"))}
                className="grid grid-cols-[auto_1fr]  w-full hover:bg-[#2A3A4A] cursor-pointer items-center justify-between rounded px-4 py-2"
            >
                <UserIcon className="h-4 w-4 text-[#F2CA16]" />
                <span className="text-white">My Profile</span>
            </div>
            <div
                onClick={() => router.push(createPageUrl("Settings"))}
                className="grid grid-cols-[auto_1fr]  w-full hover:bg-[#2A3A4A] cursor-pointer items-center justify-between rounded px-4 py-2"
            >
                <Settings className="mr-2 h-4 w-4 text-[#F2CA16]" />
                <span className="text-white">Account Settings</span>
            </div>
            <div
                onClick={handleSignOut}
                className="grid grid-cols-[auto_1fr] w-full hover:bg-[#2A3A4A] cursor-pointer items-center justify-between rounded px-4 py-2"
            >
                <LogOut className="mr-2 h-4 w-4 text-[#F2CA16]" />
                <span className="text-white">Log out</span>
            </div>
            {/* <div className="flex w-full flex-col items-start px-6">
                <Link
                    href="/profile"
                    className="w-full rounded p-2 text-left hover:bg-white/5"
                >
                    Profile
                </Link>
                <button className="w-full rounded p-2 text-left hover:bg-white/5">
                    Settings
                </button>
                <button
                    onClick={() => handleSignOut()}
                    className="w-full rounded p-2 text-left hover:bg-white/5"
                >
                    Logout
                </button>
            </div> */}
        </div>
    );
};

interface MobileMyWatchlistProps {
    closeMenu: () => void;
}

const MobileMyWagers: React.FC<MobileMyWatchlistProps> = ({ closeMenu }) => {
    const router = useRouter();
    const [activeOrCompleted, setActiveOrCompleted] = useState("active");
    const [activePredictions, setActivePredictions] = useState([]);
    const [completedPredictions, setCompletedPredictions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTournamentPredictions, setActiveTournamentPredictions] = useState([]);
    const [completedTournamentPredictions, setCompletedTournamentPredictions] = useState(
        []
    );
    // const words = ["ALL", "AUCTIONS", "TOURNAMENTS"];
    // const [predictionSort, setPredictionSort] = useState(words[0]);

    useEffect(() => {
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
            setIsLoading(false);
        };
        fetchPredictions();
    }, []);

    // const handleClick = () => {
    //     const currentIndex = words.indexOf(predictionSort);
    //     const nextIndex = (currentIndex + 1) % words.length;
    //     setPredictionSort(words[nextIndex]);
    // };

    return (
        <div className="relative">
            {/* {(activePredictions.length !== 0 ||
                completedPredictions.length !== 0 ||
                activeTournamentPredictions.length !== 0 ||
                completedTournamentPredictions.length !== 0) && (
                    <button
                        id="myWatchlist-sort"
                        type="button"
                        className="text-white-900 absolute -top-[34px] right-0 w-[110px] rounded-sm bg-[#172431] px-2 py-1.5 text-center text-[12px] font-bold"
                        onClick={handleClick}
                    >
                        {predictionSort}
                    </button>
                )} */}
            <div className="flex">
                <button
                    autoFocus
                    onClick={() => setActiveOrCompleted("active")}
                    className="w-1/2 border-b-2 border-[#314150] py-2 text-center text-sm focus:border-white focus:font-bold"
                >
                    ACTIVE
                    {!isLoading && (
                        <span className="ml-1 rounded bg-[#f2ca16] px-1 text-xs font-bold text-[#0f1923]">
                            {activePredictions.length +
                                activeTournamentPredictions.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveOrCompleted("completed")}
                    className="w-1/2 border-b-2 border-[#314150] py-2 text-center text-sm focus:border-white focus:font-bold"
                >
                    COMPLETED
                </button>
            </div>
            <div className="watchlist-custom-height mb-4 overflow-y-auto">
                {isLoading && (
                    <div className="flex justify-center pb-[50px] pt-[74px]">
                        <BounceLoader color="#696969" loading={true} />
                    </div>
                )}
                {activeOrCompleted === "active" &&
                    (activePredictions.length !== 0 ||
                        activeTournamentPredictions.length !== 0) ? (
                    <div className="w-full">
                        {
                            // predictionSort !== "TOURNAMENTS" &&
                            activePredictions.map((prediction: any, index: number) => (
                                <div key={prediction._id}>
                                    <TimerProvider
                                        deadline={prediction.auctionDeadline}
                                    >
                                        <PredictionsCard
                                            title={`${prediction.auctionYear} ${prediction.auctionMake} ${prediction.auctionModel}`}
                                            img={prediction.auctionImage}
                                            my_prediction={prediction.priceGuessed}
                                            current_bid={prediction.auctionPrice}
                                            time_left={prediction.auctionDeadline}
                                            potential_prize={prediction.auctionPot}
                                            id={prediction.auctionIdentifierId}
                                            isActive={true}
                                            status={prediction.auctionStatus}
                                            predictionAmount={prediction.wagerAmount}
                                            objectID={prediction.auctionObjectId}
                                            predictionID={prediction._id}
                                            isRefunded={prediction.refunded}
                                            closeMenu={closeMenu}
                                            prize={prediction.prize}
                                            deadline={prediction.auctionDeadline}
                                            index={index}
                                        />
                                    </TimerProvider>
                                </div>
                            ))}
                        {/* {predictionSort !== "AUCTIONS" &&
                            activeTournamentPredictions.map((wager: any) => {
                                return (
                                    <div key={wager._id}>
                                        <TimerProvider
                                            deadline={wager.tournamentEndTime}
                                        >
                                            <PredictionsTournamentCard
                                                wager={wager}
                                                isActive={true}
                                                closeMenu={closeMenu}
                                            />
                                        </TimerProvider>
                                    </div>
                                );
                            })} */}
                    </div>
                ) : null}

                {activeOrCompleted === "completed" &&
                    (completedPredictions.length !== 0 ||
                        completedTournamentPredictions.length !== 0) ? (
                    <div className="w-full">
                        {
                            // predictionSort !== "TOURNAMENTS" &&
                            completedPredictions.map((wager: any, index: number) => (
                                <div key={wager._id}>
                                    <TimerProvider
                                        deadline={wager.auctionDeadline}
                                    >
                                        <PredictionsCard
                                            title={`${wager.auctionYear} ${wager.auctionMake} ${wager.auctionModel}`}
                                            img={wager.auctionImage}
                                            my_prediction={wager.priceGuessed}
                                            current_bid={wager.auctionPrice}
                                            time_left={wager.auctionDeadline}
                                            potential_prize={wager.auctionPot}
                                            id={wager.auctionIdentifierId}
                                            isActive={false}
                                            status={wager.auctionStatus}
                                            predictionAmount={wager.wagerAmount}
                                            objectID={wager.auctionObjectId}
                                            predictionID={wager._id}
                                            isRefunded={wager.refunded}
                                            closeMenu={closeMenu}
                                            prize={wager.prize}
                                            deadline={wager.auctionDeadline}
                                            index={index}
                                        />
                                    </TimerProvider>
                                </div>
                            ))}
                        {/* {
                            predictionSort !== "AUCTIONS" &&
                            completedTournamentPredictions.map((wager: any) => {
                                return (
                                    <div key={wager._id}>
                                        <TimerProvider
                                            deadline={wager.tournamentEndTime}
                                        >
                                            <PredictionsTournamentCard
                                                wager={wager}
                                                isActive={false}
                                                closeMenu={closeMenu}
                                            />
                                        </TimerProvider>
                                    </div>
                                );
                            })} */}
                    </div>
                ) : null}
                {isLoading === false &&
                    activeOrCompleted === "active" &&
                    activePredictions.length === 0 &&
                    activeTournamentPredictions.length === 0 ? (
                    <div className="flex w-full flex-col items-center justify-center gap-4 px-6 py-16">
                        <Image
                            src={MoneyBag}
                            width={80}
                            height={80}
                            alt="watchlist icon"
                            className="h-[80px] w-[80px]"
                        />
                        <div className="">
                            <div className="text-center text-xl font-bold">
                                No active predictions
                            </div>
                            {/* <div className="text-center opacity-70">
                                Quam temere in vitiis, legem sancimus haerentia
                            </div> */}
                        </div>
                        <Link
                            href="/free_play"
                            className="link-transparent-white"
                        >
                            DISCOVER AUCTIONS
                        </Link>
                    </div>
                ) : null}
                {isLoading === false &&
                    activeOrCompleted === "completed" &&
                    completedPredictions.length === 0 &&
                    completedTournamentPredictions.length === 0 ? (
                    <div className="flex w-full flex-col items-center justify-center gap-4 px-6 py-16">
                        <Image
                            src={MoneyBag}
                            width={80}
                            height={80}
                            alt="watchlist icon"
                            className="h-[80px] w-[80px]"
                        />
                        <div className="">
                            <div className="text-center text-xl font-bold">
                                No completed predictions
                            </div>
                            {/* <div className="text-center opacity-70">
                                Quam temere in vitiis, legem sancimus haerentia
                            </div> */}
                        </div>
                        <Link
                            href="/free_play"
                            className="link-transparent-white"
                        >
                            DISCOVER AUCTIONS
                        </Link>
                    </div>
                ) : null}
                {/* {isLoading === false &&
                    activeOrCompleted === "completed" &&
                    completedPredictions.length === 0 &&
                    predictionSort === "AUCTIONS" ? (
                    <div className="flex w-full flex-col items-center justify-center gap-4 px-6 py-16">
                        <Image
                            src={MoneyBag}
                            width={80}
                            height={80}
                            alt="watchlist icon"
                            className="h-[80px] w-[80px]"
                        />
                        <div className="">
                            <div className="text-center text-xl font-bold">
                                No completed predictions
                            </div>
                            <div className="text-center opacity-70">
                                Quam temere in vitiis, legem sancimus haerentia
                            </div>
                        </div>
                        <button
                            onClick={() => router.push("/auctions")}
                            className="btn-transparent-white"
                        >
                            DISCOVER AUCTIONS
                        </button>
                    </div>
                ) : null}
                {isLoading === false &&
                    activeOrCompleted === "completed" &&
                    completedTournamentPredictions.length === 0 &&
                    predictionSort === "TOURNAMENTS" ? (
                    <div className="flex w-full flex-col items-center justify-center gap-4 px-6 py-16">
                        <Image
                            src={MoneyBag}
                            width={80}
                            height={80}
                            alt="watchlist icon"
                            className="h-[80px] w-[80px]"
                        />
                        <div className="">
                            <div className="text-center text-xl font-bold">
                                No completed predictions
                            </div>
                            <div className="text-center opacity-70">
                                Quam temere in vitiis, legem sancimus haerentia
                            </div>
                        </div>
                        <button
                            onClick={() => router.push("/auctions")}
                            className="btn-transparent-white"
                        >
                            DISCOVER AUCTIONS
                        </button>
                    </div>
                ) : null}
                {isLoading === false &&
                    activeOrCompleted === "active" &&
                    activePredictions.length === 0 &&
                    predictionSort === "AUCTIONS" ? (
                    <div className="flex w-full flex-col items-center justify-center gap-4 px-6 py-16">
                        <Image
                            src={MoneyBag}
                            width={80}
                            height={80}
                            alt="watchlist icon"
                            className="h-[80px] w-[80px]"
                        />
                        <div className="">
                            <div className="text-center text-xl font-bold">
                                No active predictions
                            </div>
                            <div className="text-center opacity-70">
                                Quam temere in vitiis, legem sancimus haerentia
                            </div>
                        </div>
                        <button
                            onClick={() => router.push("/auctions")}
                            className="btn-transparent-white"
                        >
                            DISCOVER AUCTIONS
                        </button>
                    </div>
                ) : null}
                {isLoading === false &&
                    activeOrCompleted === "active" &&
                    activeTournamentPredictions.length === 0 &&
                    predictionSort === "TOURNAMENTS" ? (
                    <div className="flex w-full flex-col items-center justify-center gap-4 px-6 py-16">
                        <Image
                            src={MoneyBag}
                            width={80}
                            height={80}
                            alt="watchlist icon"
                            className="h-[80px] w-[80px]"
                        />
                        <div className="">
                            <div className="text-center text-xl font-bold">
                                No active predictions
                            </div>
                            <div className="text-center opacity-70">
                                Quam temere in vitiis, legem sancimus haerentia
                            </div>
                        </div>
                        <button
                            onClick={() => router.push("/auctions")}
                            className="btn-transparent-white"
                        >
                            DISCOVER AUCTIONS
                        </button>
                    </div>
                ) : null} */}
            </div>
        </div>
    );
};
