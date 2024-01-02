"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Logo from "../../../public/images/hammershift-logo.svg";
import LogoSmall from "../../../public/images/logo-small.svg";
import MagnifyingGlass from "../../../public/images/magnifying-glass.svg";
import WagersIcon from "../../../public/images/dollar-coin.svg";
import WatchlistIcon from "../../../public/images/watchlist-icon.svg";
import AccountIcon from "../../../public/images/account-icon.svg";
import HamburgerMenu from "../../../public/images/hamburger-menu.svg";
import CancelIcon from "../../../public/images/x-icon.svg";
import WatchlistBig from "../../../public/images/watchlist-icon-big.svg";
import Wallet from "../../../public/images/wallet--money-payment-finance-wallet.svg";
import MoneyBag from "../../../public/images/monetization-browser-bag-big.svg";
import Dollar from "../../../public/images/dollar.svg";
import Hourglass from "../../../public/images/hour-glass.svg";
import WalletSmall from "../../../public/images/wallet--money-payment-finance-wallet.svg";
import MoneyBagGreen from "../../../public/images/monetization-browser-bag-green.svg";
import RankingStarTop from "../../../public/images/ranking-star-top.svg";

import MyWagerPhotoOne from "../../../public/images/my-wagers-navbar/my-wager-photo-one.svg";
import MyWagerPhotoTwo from "../../../public/images/my-wagers-navbar/my-wager-photo-two.svg";
import MyWagerPhotoThree from "../../../public/images/my-wagers-navbar/my-wager-photo-three.svg";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { getMyWagers, getMyWatchlist } from "@/lib/data";
import { TimerProvider, useTimer } from "../_context/TimerContext";
import { BounceLoader } from "react-spinners";

// export interface NavbarProps {
//     isLoggedIn: boolean;
// }

type NavbarDropdownMenuProps =
    | null
    | "My Watchlist"
    | "My Wagers"
    | "My Account"
    | "Search";

const Navbar = () => {
    const router = useRouter();
    const [menuIsOpen, setMenuIsOpen] = useState(false);
    const [searchedData, setSearchedData] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [searchBoxDropDown, setSearchBoxDropDown] = useState(false);
    const [dropWatchlist, setDropWatchlist] = useState(false);
    const [dropMyWagers, setDropMyWagers] = useState(false);
    const [dropMyAccount, setDropMyAccount] = useState(false);
    const [myAccountMenuOpen, setMyAccountMenuOpen] = useState(false);
    const [navDropdownMenu, setNavDropdownMenu] =
        useState<NavbarDropdownMenuProps>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const searchBox = document.getElementById("search-box");
            const searchBar = document.getElementById("search-bar-input");

            const watchlistButton = document.getElementById("watchlist-button");
            const watchlistActiveButton = document.getElementById(
                "active-watchlist-button"
            );
            const watchlistCompletedButton = document.getElementById(
                "completed-watchlist-button"
            );

            const myWagersButton = document.getElementById("mywagers-button");
            const myWagersActiveButton = document.getElementById(
                "active-mywagers-button"
            );
            const myWagersCompletedButton = document.getElementById(
                "completed-mywagers-button"
            );

            const myAccountButton = document.getElementById("myaccount-button");

            if (
                searchBox &&
                !searchBox.contains(e.target as Node) &&
                searchBar &&
                !searchBar.contains(e.target as Node)
            ) {
                setSearchBoxDropDown(false);
            }

            if (
                watchlistButton &&
                !watchlistButton.contains(e.target as Node) &&
                watchlistActiveButton &&
                !watchlistActiveButton.contains(e.target as Node) &&
                watchlistCompletedButton &&
                !watchlistCompletedButton.contains(e.target as Node)
            ) {
                setDropWatchlist(false);
            }

            if (
                myWagersButton &&
                !myWagersButton.contains(e.target as Node) &&
                myWagersActiveButton &&
                !myWagersActiveButton.contains(e.target as Node) &&
                myWagersCompletedButton &&
                !myWagersCompletedButton.contains(e.target as Node)
            ) {
                setDropMyWagers(false);
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
        setSearchBoxDropDown,
        setDropWatchlist,
        setDropMyWagers,
        setDropMyAccount,
    ]);

    useEffect(() => {
        const fetchSearchedAuctions = async () => {
            const response = await fetch(
                `/api/cars/filter?search=${searchKeyword}`
            );
            const data = await response.json();
            setSearchedData(data.cars);
        };

        if (searchKeyword.length) {
            fetchSearchedAuctions();
            setSearchBoxDropDown(true);
        } else {
            setSearchBoxDropDown(false);
        }
    }, [searchKeyword]);

    const handleSumbit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const response = await fetch(
            `/api/cars/filter?search=${searchKeyword}`
        );
        const data = await response.json();

        setSearchedData(data.cars);
        setSearchBoxDropDown(false);
        router.push("/auctions");
    };

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchKeyword(e.target.value);
        // const response = await fetch(
        //     `/api/cars/filter?search=${searchKeyword}`
        // );
        // const data = await response.json();

        // if (data.length !== 0) {
        //     setSearchBoxDropDown(true);
        // } else {
        //     setSearchBoxDropDown(false);
        // }
        // setSearchedData(data.cars);
    };

    const handleInputClick = () => {
        if (searchedData.length !== 0) {
            setSearchBoxDropDown(true);
        } else {
            setSearchBoxDropDown(false);
        }
    };

    const handleSearchClick = async (
        carMake: string,
        carModel: string,
        carID: string
    ) => {
        router.push(`/auctions/car_view_page/${carID}`);
        const searchInput = document.getElementById(
            "search-bar-input"
        ) as HTMLInputElement;
        const dropdownSearchInput = document.getElementById(
            "dropdown-search-bar"
        ) as HTMLInputElement;
        if (searchInput) {
            searchInput.value = `${carMake} ${carModel}`;
        }
        if (dropdownSearchInput) {
            dropdownSearchInput.value = `${carMake} ${carModel}`;
        }
        setSearchBoxDropDown(false);
        // setMenuIsOpen(false)
    };

    const closeMenu = () => {
        setMenuIsOpen(false);
    };

    const { data: session } = useSession();
    const isLoggedIn = !!session;

    return (
        <div>
            {isLoggedIn ? (
                <div className=" tw-flex tw-px-4 md:tw-px-16 2xl:tw-px-36 tw-w-screen tw-justify-between tw-py-3">
                    <div className="lg:tw-w-[411px] tw-flex tw-items-center tw-justify-between">
                        <div className="tw-pr-4">
                            <Link href="/">
                                <Image
                                    src={Logo}
                                    width={176}
                                    height={64}
                                    alt="logo"
                                    className="tw-hidden sm:tw-block tw-w-auto tw-h-auto"
                                />
                                <Image
                                    src={LogoSmall}
                                    width={32}
                                    height={32}
                                    alt="logo"
                                    className=" tw-block sm:tw-hidden tw-w-auto tw-h-auto"
                                />
                            </Link>
                        </div>
                        <Link href={"/discover"}>
                            <div className="tw-block tw-mx-2 sm:tw-mx-4 ">
                                DISCOVER
                            </div>
                        </Link>
                        <Link href="/auctions">
                            <div className="tw-block tw-mx-2 sm:tw-mx-4 ">
                                AUCTIONS
                            </div>
                        </Link>
                    </div>
                    <div className="tw-relative tw-max-w-[535px] tw-w-full tw-hidden lg:tw-block">
                        <form
                            onSubmit={handleSumbit}
                            autoComplete="off"
                            className="tw-w-full tw-flex tw-items-center"
                        >
                            <div
                                className={
                                    searchBoxDropDown
                                        ? "tw-bg-shade-50 tw-flex tw-p-2 tw-grow tw-rounded-t"
                                        : "tw-bg-shade-50 tw-flex tw-p-2 tw-grow tw-rounded"
                                }
                            >
                                <Image
                                    src={MagnifyingGlass}
                                    width={15}
                                    height={15}
                                    alt="magnifying glass"
                                    className="tw-w-auto tw-h-auto"
                                />
                                <input
                                    id="search-bar-input"
                                    name="search"
                                    type="text"
                                    className="tw-ml-2 tw-bg-shade-50 tw-w-full tw-outline-none tw-border-none"
                                    placeholder="Search make, model, year..."
                                    onClick={handleInputClick}
                                    onChange={handleChange}
                                ></input>
                            </div>
                        </form>
                        {searchBoxDropDown && (
                            <SearchDropDown
                                searchedData={searchedData}
                                onSearchClick={handleSearchClick}
                            />
                        )}
                    </div>
                    {/* Buttons for logged in accounts */}
                    <div className="tw-hidden sm:tw-flex tw-justify-between tw-items-center tw-w-[136px] md:tw-visible tw-relative">
                        <button
                            id="watchlist-button"
                            className="tw-relative"
                            onClick={() => setDropWatchlist((prev) => !prev)}
                        >
                            <Image
                                src={WatchlistIcon}
                                width={24}
                                height={24}
                                alt="watchlist"
                                className="tw-w-[24px] tw-h-[24px]"
                            />
                        </button>
                        {dropWatchlist && <MyWatchlistDropdownMenu />}
                        <button
                            id="mywagers-button"
                            onClick={() => setDropMyWagers((prev) => !prev)}
                        >
                            <Image
                                src={WagersIcon}
                                width={24}
                                height={24}
                                alt="wagers"
                                className="tw-w-[24px] tw-h-[24px]"
                            />
                        </button>
                        {dropMyWagers && <MyWagersDropdownMenu />}
                        <button
                            id="myaccount-button"
                            className="tw-relative"
                            onClick={() => setDropMyAccount((prev) => !prev)}
                        >
                            <Image
                                src={AccountIcon}
                                width={24}
                                height={24}
                                alt="account"
                                className="tw-w-[24px] tw-h-[24px]"
                            />
                            {dropMyAccount && <MyAccountDropdownMenu />}
                        </button>
                    </div>
                    <div className="sm:tw-hidden">
                        <button
                            onClick={() =>
                                setMyAccountMenuOpen((prev) => !prev)
                            }
                            className="tw-mr-4"
                        >
                            <Image
                                src={AccountIcon}
                                width={24}
                                height={24}
                                alt="account"
                                className="tw-w-[24px] tw-h-[24px]"
                            />
                        </button>
                        <button onClick={() => setMenuIsOpen((prev) => !prev)}>
                            {menuIsOpen ? (
                                <Image
                                    src={CancelIcon}
                                    width={24}
                                    height={24}
                                    alt="menu"
                                    className=" tw-w-auto tw-h-auto"
                                />
                            ) : (
                                <Image
                                    src={HamburgerMenu}
                                    width={24}
                                    height={24}
                                    alt="menu"
                                    className=" tw-w-auto tw-h-auto"
                                />
                            )}
                        </button>
                    </div>
                </div>
            ) : (
                <div className=" tw-flex tw-px-4 md:tw-px-16 2xl:tw-px-36 tw-w-screen tw-justify-between tw-py-3">
                    <div className="lg:tw-w-[411px] tw-flex tw-items-center tw-justify-between">
                        <div className="tw-pr-4">
                            <Link href="/">
                                <Image
                                    src={Logo}
                                    width={176}
                                    height={64}
                                    alt="logo"
                                    className="tw-block tw-w-auto tw-h-auto"
                                />
                            </Link>
                        </div>
                        <Link href="/discover">
                            <div className="tw-hidden sm:tw-block tw-mx-1 md:tw-mx-4 ">
                                DISCOVER
                            </div>
                        </Link>
                        <Link href="/auctions">
                            <div className="tw-hidden sm:tw-block tw-mx-1 md:tw-mx-4 ">
                                AUCTIONS
                            </div>
                        </Link>
                    </div>
                    <div className="tw-relative tw-max-w-[535px] xl:tw-w-full tw-flex-1 tw-hidden lg:tw-flex tw-mr-4">
                        <form
                            onSubmit={handleSumbit}
                            autoComplete="off"
                            className="tw-w-full tw-flex tw-items-center"
                        >
                            <div
                                className={
                                    searchBoxDropDown
                                        ? "tw-bg-shade-50 tw-flex tw-p-2 tw-grow tw-rounded-t"
                                        : "tw-bg-shade-50 tw-flex tw-p-2 tw-grow tw-rounded"
                                }
                            >
                                <Image
                                    src={MagnifyingGlass}
                                    width={15}
                                    height={15}
                                    alt="magnifying glass"
                                    className="tw-w-auto tw-h-auto"
                                />
                                <input
                                    id="search-bar-input"
                                    name="search"
                                    type="text"
                                    className="tw-ml-2 tw-bg-shade-50 tw-w-full tw-outline-none tw-border-none"
                                    placeholder="Search make, model, year..."
                                    onClick={handleInputClick}
                                    onChange={handleChange}
                                ></input>
                            </div>
                        </form>
                        {searchBoxDropDown && (
                            <SearchDropDown
                                searchedData={searchedData}
                                onSearchClick={handleSearchClick}
                            />
                        )}
                    </div>
                    <div className="tw-flex tw-items-center">
                        <Link href="/create_account">
                            <button className="btn-white  hover:tw-bg-gold-200 tw-hidden md:tw-block ">
                                CREATE ACCOUNT
                            </button>
                        </Link>
                        <button onClick={() => setMenuIsOpen((prev) => !prev)}>
                            {menuIsOpen ? (
                                <Image
                                    src={CancelIcon}
                                    width={24}
                                    height={24}
                                    alt="menu"
                                    className="md:tw-hidden tw-w-auto tw-h-auto"
                                />
                            ) : (
                                <Image
                                    src={HamburgerMenu}
                                    width={24}
                                    height={24}
                                    alt="menu"
                                    className="md:tw-hidden tw-w-auto tw-h-auto"
                                />
                            )}
                        </button>
                    </div>
                </div>
            )}
            {menuIsOpen && (
                <DropdownMenu
                    searchedData={searchedData}
                    isLoggedIn={isLoggedIn}
                    handleSubmit={handleSumbit}
                    handleChange={handleChange}
                    onSearchClick={handleSearchClick}
                    searchBoxDropDown={searchBoxDropDown}
                    setSearchBoxDropDown={setSearchBoxDropDown}
                    handleInputClick={handleInputClick}
                    closeMenu={closeMenu}
                />
            )}
            {myAccountMenuOpen && <MyAccountMenu isLoggedIn={isLoggedIn} />}
        </div>
    );
};
export default Navbar;

interface DropdownMenuProps {
    isLoggedIn: boolean;
    searchBoxDropDown: boolean;
    closeMenu: () => void;
    setSearchBoxDropDown: React.Dispatch<React.SetStateAction<boolean>>;
    searchedData: SearchDatas[];
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSearchClick: (carMake: string, carModel: string, carID: string) => void;
    handleInputClick: () => void;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
    isLoggedIn,
    searchedData,
    handleSubmit,
    handleChange,
    onSearchClick,
    searchBoxDropDown,
    setSearchBoxDropDown,
    handleInputClick,
    closeMenu,
}) => {
    const router = useRouter();

    return (
        <div className="slide-in-top tw-absolute tw-flex-col tw-text-white tw-bg-[#0F1923] tw-p-4 tw-w-full tw-h-full tw-z-50">
            <div className="tw-relative">
                <form
                    autoComplete="off"
                    onSubmit={handleSubmit}
                    className="tw-bg-shade-100 tw-flex tw-p-2 tw-rounded tw-mt-8 tw-mb-2"
                >
                    <Image
                        src={MagnifyingGlass}
                        width={15}
                        height={15}
                        alt="magnifying glass"
                        className="tw-w-auto tw-h-auto"
                    />
                    <input
                        id="dropdown-search-bar"
                        className="tw-ml-2 tw-bg-shade-100 tw-outline-none"
                        placeholder="Search make, model, year..."
                        name="search"
                        type="text"
                        onChange={handleChange}
                        onClick={() => {
                            setSearchBoxDropDown(true);
                        }}
                    ></input>
                </form>
                {searchBoxDropDown && (
                    <SearchDropDown
                        searchedData={searchedData}
                        onSearchClick={onSearchClick}
                    />
                )}
            </div>
            {!isLoggedIn ? (
                <>
                    <Link
                        href="/discover"
                        onClick={closeMenu}
                        className="tw-flex tw-py-2"
                    >
                        <div>DISCOVER</div>
                    </Link>
                    <Link
                        href="/auctions"
                        onClick={closeMenu}
                        className="tw-flex tw-py-2"
                    >
                        <div>AUCTIONS</div>
                    </Link>
                </>
            ) : (
                <>
                    <div className="tw-flex tw-pt-4">
                        <Image
                            src={WatchlistIcon}
                            width={24}
                            height={24}
                            alt="watchlist"
                            className="tw-w-[24px] tw-h-[24px]"
                        />
                        <div className="tw-ml-4">MY WATCHLIST</div>
                    </div>
                    <div className="tw-flex tw-pt-4">
                        <Image
                            src={WagersIcon}
                            width={24}
                            height={24}
                            alt="watchlist"
                            className="tw-w-[24px] tw-h-[24px]"
                        />
                        <div className="tw-ml-4">MY WAGERS</div>
                    </div>
                </>
            )}
            <div className="tw-mt-4">
                {!isLoggedIn && (
                    <button
                        onClick={() => {
                            router.push("/create_account");
                            closeMenu();
                        }}
                        className="btn-white tw-w-full"
                    >
                        CREATE ACCOUNT
                    </button>
                )}
            </div>
        </div>
    );
};

interface MyAccountMenuProps {
    isLoggedIn: boolean;
}

const MyAccountMenu: React.FC<MyAccountMenuProps> = ({ isLoggedIn }) => {
    return (
        <div className="slide-in-top tw-absolute tw-flex tw-flex-col tw-text-white tw-bg-[#1A2C3D] tw-p-4 tw-w-full tw-h-auto tw-z-50">
            <div className="tw-text-lg tw-font-bold">MY ACCOUNT</div>
            <div className="tw-m-1.5">Profile</div>
            <div className="tw-m-1.5">Setting</div>
            <div className="tw-m-1.5">Logout</div>
        </div>
    );
};

// Dropdown Menus
const MyWatchlistDropdownMenu = () => {
    const router = useRouter();
    const [activeOrCompleted, setActiveOrCompleted] = useState("active");
    const [activeWatchlist, setActiveWatchlist] = useState([]);
    const [completedWatchlist, setCompletedWatchlist] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

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

    return (
        <div className="tw-absolute tw-z-10 tw-right-[112px] tw-top-10 tw-w-[512px] tw-max-h-[784px] tw-overflow-auto tw-bg-[#1A2C3D] tw-rounded tw-py-6 tw-shadow-xl tw-shadow-black">
            <div className="tw-px-6 tw-flex tw-flex-col tw-gap-4">
                <div className="tw-font-bold tw-text-lg tw-text-left">
                    MY WATCHLIST
                </div>
                <div className="tw-flex">
                    <button
                        id="active-watchlist-button"
                        onClick={() => setActiveOrCompleted("active")}
                        className="tw-border-b-2 tw-w-1/2 tw-py-2 tw-border-[#314150] focus:tw-font-bold focus:tw-border-white tw-flex tw-justify-center tw-items-center tw-gap-2"
                        autoFocus
                    >
                        <div>ACTIVE </div>
                        {!isLoading && (
                            <span className="tw-px-1 tw-text-sm tw-bg-[#f2ca16] tw-rounded tw-font-bold tw-text-[#0f1923]">
                                {activeWatchlist.length}
                            </span>
                        )}
                    </button>
                    <button
                        id="completed-watchlist-button"
                        onClick={() => setActiveOrCompleted("completed")}
                        className="tw-border-b-2 tw-w-1/2 tw-py-2 tw-border-[#314150] focus:tw-font-bold focus:tw-border-white"
                    >
                        COMPLETED
                    </button>
                </div>
            </div>
            {isLoading && (
                <div className="tw-pb-[50px] tw-pt-[74px] tw-flex tw-justify-center">
                    <BounceLoader color="#696969" loading={true} />
                </div>
            )}
            {activeOrCompleted === "active" && activeWatchlist.length !== 0 && (
                <div className="tw-w-full">
                    {activeWatchlist.map((watchlist: any) => (
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
                    ))}
                </div>
            )}
            {activeOrCompleted === "completed" &&
                completedWatchlist.length !== 0 && (
                    <div className="tw-w-full">
                        {completedWatchlist.map((watchlist: any) => (
                            <div key={watchlist._id}>
                                <TimerProvider
                                    deadline={watchlist.auctionDeadline}
                                >
                                    <MyWatchlistCard
                                        title={`${watchlist.auctionYear} ${watchlist.auctionMake} ${watchlist.auctionModel}`}
                                        img={watchlist.auctionImage}
                                        current_bid={watchlist.auctionPrice}
                                        id={watchlist.auctionIdentifierId}
                                        time_left={watchlist.auctionDeadline}
                                        isActive={false}
                                    />
                                </TimerProvider>
                            </div>
                        ))}
                    </div>
                )}
            {isLoading === false &&
                activeOrCompleted === "active" &&
                activeWatchlist.length === 0 && (
                    <div className="tw-px-6 tw-py-16 tw-flex tw-flex-col tw-justify-center tw-items-center tw-w-full tw-gap-4">
                        <Image
                            src={MoneyBag}
                            width={80}
                            height={80}
                            alt="watchlist icon"
                            className="tw-w-[80px] tw-h-[80px]"
                        />
                        <div className="">
                            <div className="tw-font-bold tw-text-xl tw-text-center">
                                No active wagers
                            </div>
                            <div className="tw-opacity-70">
                                Quam temere in vitiis, legem sancimus haerentia
                            </div>
                        </div>
                        <button
                            onClick={() => router.push("/discover")}
                            className="btn-transparent-white"
                        >
                            DISCOVER AUCTIONS
                        </button>
                    </div>
                )}
            {activeOrCompleted === "completed" &&
                completedWatchlist.length === 0 && (
                    <div className="tw-px-6 tw-py-16 tw-flex tw-flex-col tw-justify-center tw-items-center tw-w-full tw-gap-4">
                        No watchlist in completed
                    </div>
                )}
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
}
const MyWatchlistCard: React.FC<MyWatchlistCardProps> = ({
    title,
    img,
    current_bid,
    time_left,
    id,
    isActive,
}) => {
    const { days, hours, minutes, seconds } = useTimer();

    return (
        <div className="tw-px-6 tw-w-full tw-py-4 tw-border-b-[1px] tw-border-[#253747]">
            <div className=" tw-w-full tw-py-3 tw-rounded tw-flex tw-items-center tw-gap-6">
                <Link
                    href={`/auctions/car_view_page/${id}`}
                    className="tw-self-start tw-w-[100px]"
                >
                    <Image
                        src={img}
                        width={100}
                        height={100}
                        alt="wallet icon"
                        className="tw-w-[100px] tw-h-[100px] tw-object-cover tw-rounded-[4px]"
                    />
                </Link>
                <div className="tw-flex tw-flex-col tw-items-start tw-grow tw-max-w-[323px]">
                    <Link
                        href={`/auctions/car_view_page/${id}`}
                        className="tw-self-start"
                    >
                        <div className="tw-w-full tw-font-bold tw-text-xl tw-py-1 tw-text-left tw-line-clamp-1">
                            {title}
                        </div>
                    </Link>
                    <div className="tw-w-full tw-mt-1">
                        <div className="tw-flex tw-items-center tw-gap-2 tw-w-full">
                            <Image
                                src={Dollar}
                                width={14}
                                height={14}
                                alt="wallet icon"
                                className="tw-w-[14px] tw-h-[14px]"
                            />
                            <span className="tw-opacity-80">Current Bid:</span>
                            <span className="tw-text-[#49C742] tw-font-bold">
                                ${new Intl.NumberFormat().format(current_bid)}
                            </span>
                        </div>
                        {isActive && (
                            <div className="tw-flex tw-items-center tw-gap-2 tw-w-full">
                                <Image
                                    src={Hourglass}
                                    width={14}
                                    height={14}
                                    alt="wallet icon"
                                    className="tw-w-[14px] tw-h-[14px]"
                                />
                                <span className="tw-opacity-80">
                                    Time Left:
                                </span>
                                <span className="">{`${days}:${hours}:${minutes}:${seconds}`}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* {type === "Tournament" && (
                <div className=" tw-w-full tw-py-4 tw-rounded tw-flex tw-items-center tw-gap-6">
                    <Link href={"/tournament_page"} className="tw-self-start">
                        <Image
                            src={img}
                            width={100}
                            height={100}
                            alt="wallet icon"
                            className="tw-w-[100px] tw-h-[100px] tw-self-start"
                        />
                    </Link>
                    <div className="tw-w-full tw-flex tw-flex-col tw-items-start tw-grow">
                        <Link
                            href={"/tournament_page"}
                            className="tw-self-start"
                        >
                            <div className="tw-w-full tw-font-bold tw-text-xl tw-py-1 tw-text-left">
                                {title}
                            </div>
                        </Link>
                        <div className="tw-w-full tw-mt-1">
                            <div className="tw-flex tw-items-center tw-gap-2 tw-w-full">
                                <Image
                                    src={Hourglass}
                                    width={14}
                                    height={14}
                                    alt="wallet icon"
                                    className="tw-w-[14px] tw-h-[14px]"
                                />
                                <span className="tw-opacity-80">
                                    Time Left:
                                </span>
                                <span className="">{time_left}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )} */}
        </div>
    );
};

const MyWagersDropdownMenu = () => {
    const router = useRouter();
    const [activeOrCompleted, setActiveOrCompleted] = useState("active");
    const [activeWagers, setActiveWagers] = useState([]);
    const [completedWagers, setCompletedWagers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchWagers = async () => {
            const data = await getMyWagers();
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
            setIsLoading(false);
        };
        fetchWagers();
    }, []);

    return (
        <div className="tw-absolute tw-z-10 tw-right-[56px] tw-top-10 tw-w-[512px] tw-max-h-[784px] tw-overflow-auto tw-bg-[#1A2C3D] tw-rounded tw-py-6 tw-shadow-xl tw-shadow-black">
            <div className="tw-px-6 tw-flex tw-flex-col tw-gap-4">
                <div className="tw-font-bold tw-text-lg tw-text-left">
                    MY WAGERS
                </div>
                <div className="tw-flex">
                    <button
                        id="active-mywagers-button"
                        onClick={() => setActiveOrCompleted("active")}
                        className="tw-border-b-2 tw-w-1/2 tw-py-2 tw-border-[#314150] focus:tw-font-bold focus:tw-border-white tw-flex tw-justify-center tw-items-center tw-gap-2"
                        autoFocus
                    >
                        <div>ACTIVE </div>
                        {!isLoading && (
                            <span className="tw-px-1 tw-text-sm tw-bg-[#f2ca16] tw-rounded tw-font-bold tw-text-[#0f1923]">
                                {activeWagers.length}
                            </span>
                        )}
                    </button>
                    <button
                        id="completed-mywagers-button"
                        onClick={() => setActiveOrCompleted("completed")}
                        className="tw-border-b-2 tw-w-1/2 tw-py-2 tw-border-[#314150] focus:tw-font-bold focus:tw-border-white"
                    >
                        COMPLETED
                    </button>
                </div>
            </div>
            {isLoading && (
                <div className="tw-pb-[50px] tw-pt-[74px] tw-flex tw-justify-center">
                    <BounceLoader color="#696969" loading={true} />
                </div>
            )}
            {activeOrCompleted === "active" && activeWagers.length !== 0 && (
                <div className="tw-w-full">
                    {activeWagers.map((wager: any) => (
                        <div key={wager._id}>
                            <TimerProvider deadline={wager.auctionDeadline}>
                                <MyWagersCard
                                    title={`${wager.auctionYear} ${wager.auctionMake} ${wager.auctionModel}`}
                                    img={wager.auctionImage}
                                    my_wager={wager.priceGuessed}
                                    current_bid={wager.auctionPrice}
                                    time_left={wager.auctionDeadline}
                                    potential_prize={wager.auctionPot}
                                    id={wager.auctionIdentifierId}
                                />
                            </TimerProvider>
                        </div>
                    ))}
                </div>
            )}
            {activeOrCompleted === "completed" &&
                completedWagers.length !== 0 && (
                    <div className="tw-w-full">
                        {completedWagers.map((wager: any) => (
                            <div key={wager._id}>
                                <TimerProvider deadline={wager.auctionDeadline}>
                                    <MyWagersCard
                                        title={`${wager.auctionYear} ${wager.auctionMake} ${wager.auctionModel}`}
                                        img={wager.auctionImage}
                                        my_wager={wager.priceGuessed}
                                        current_bid={wager.auctionPrice}
                                        time_left={wager.auctionDeadline}
                                        potential_prize={wager.auctionPot}
                                        id={wager.auctionIdentifierId}
                                    />
                                </TimerProvider>
                            </div>
                        ))}
                    </div>
                )}
            {isLoading === false &&
                activeOrCompleted === "active" &&
                activeWagers.length === 0 && (
                    <div className="tw-px-6 tw-py-16 tw-flex tw-flex-col tw-justify-center tw-items-center tw-w-full tw-gap-4">
                        <Image
                            src={MoneyBag}
                            width={80}
                            height={80}
                            alt="watchlist icon"
                            className="tw-w-[80px] tw-h-[80px]"
                        />
                        <div className="tw-">
                            <div className="tw-font-bold tw-text-xl">
                                No active wagers
                            </div>
                            <div className="tw-opacity-70">
                                Quam temere in vitiis, legem sancimus haerentia
                            </div>
                        </div>
                        <button
                            onClick={() => router.push("/discover")}
                            className="btn-transparent-white"
                        >
                            DISCOVER AUCTIONS
                        </button>
                    </div>
                )}
            {activeOrCompleted === "completed" &&
                completedWagers.length === 0 && (
                    <div className="tw-px-6 tw-py-16 tw-flex tw-flex-col tw-justify-center tw-items-center tw-w-full tw-gap-4">
                        No wagers in completed
                    </div>
                )}
        </div>
    );
};

interface MyWagersCardProps {
    title: string;
    img: string;
    my_wager: number;
    current_bid: number;
    time_left: Date;
    potential_prize: number;
    id: string;
}
const MyWagersCard: React.FC<MyWagersCardProps> = ({
    title,
    img,
    my_wager,
    current_bid,
    time_left,
    potential_prize,
    id,
}) => {
    const { days, hours, minutes, seconds } = useTimer();

    return (
        <div className="tw-px-6 tw-w-full tw-py-4 tw-border-b-[1px] tw-border-[#253747]">
            <div className=" tw-w-full tw-py-3 tw-rounded tw-flex tw-items-center tw-gap-6">
                <Link
                    href={`/auctions/car_view_page/${id}`}
                    className="tw-self-start tw-w-[100px]"
                >
                    <Image
                        src={img}
                        width={100}
                        height={100}
                        alt="wallet icon"
                        className="tw-w-[100px] tw-h-[100px] tw-object-cover tw-rounded-[4px]"
                    />
                </Link>
                <div className="tw-flex tw-flex-col tw-items-start tw-grow tw-max-w-[323px]">
                    <Link
                        href={`/auctions/car_view_page/${id}`}
                        className="tw-self-start"
                    >
                        <div className="tw-w-full tw-font-bold tw-text-xl tw-py-1 tw-text-left tw-line-clamp-1">
                            {title}
                        </div>
                    </Link>
                    <div className="tw-w-full tw-mt-1">
                        <div className="tw-flex tw-items-center tw-gap-2 tw-w-full">
                            <Image
                                src={WalletSmall}
                                width={14}
                                height={14}
                                alt="wallet icon"
                                className="tw-w-[14px] tw-h-[14px]"
                            />
                            <span className="tw-opacity-80">My Wager:</span>
                            <span className="tw-text-[#F2CA16] tw-font-bold">
                                ${new Intl.NumberFormat().format(my_wager)}
                            </span>
                        </div>
                        <div className="tw-flex tw-items-center tw-gap-2 tw-w-full">
                            <Image
                                src={Dollar}
                                width={14}
                                height={14}
                                alt="wallet icon"
                                className="tw-w-[14px] tw-h-[14px]"
                            />
                            <span className="tw-opacity-80">Current Bid:</span>
                            <span className="tw-text-[#49C742] tw-font-bold">
                                ${new Intl.NumberFormat().format(current_bid)}
                            </span>
                        </div>
                        <div className="tw-flex tw-items-center tw-gap-2 tw-w-full">
                            <Image
                                src={Hourglass}
                                width={14}
                                height={14}
                                alt="wallet icon"
                                className="tw-w-[14px] tw-h-[14px]"
                            />
                            <span className="tw-opacity-80">Time Left:</span>
                            <span className="">{`${days}:${hours}:${minutes}:${seconds}`}</span>
                        </div>
                    </div>
                    <div className="tw-mt-4 tw-w-full tw-p-2 tw-flex tw-gap-4 tw-bg-[#49C74233] tw-rounded">
                        <Image
                            src={MoneyBagGreen}
                            width={20}
                            height={20}
                            alt="money bag"
                            className="tw-w-[20px] tw-h-[20px]"
                        />
                        <div className="tw-text-[#49C742] tw-font-bold tw-text-left tw-grow-[1]">
                            POTENTIAL PRIZE
                        </div>
                        <div className="tw-text-[#49C742] tw-font-bold tw-text-left">
                            ${new Intl.NumberFormat().format(potential_prize)}
                        </div>
                    </div>
                </div>
            </div>
            {/* {type === "Tournament" && (
                <div className=" tw-w-full tw-py-4 tw-rounded tw-flex tw-items-center tw-gap-6">
                    <Link
                        href={"/tournament_page"}
                        className="tw-self-start tw-w-[100px]"
                    >
                        <Image
                            src={img}
                            width={100}
                            height={100}
                            alt="wallet icon"
                            className="tw-w-[100px] tw-h-[100px] tw-self-start"
                        />
                    </Link>
                    <div className="tw-flex tw-flex-col tw-items-start tw-grow">
                        <Link
                            href={"/tournament_page"}
                            className="tw-self-start"
                        >
                            <div className="tw-w-full tw-font-bold tw-text-xl tw-py-1 tw-text-left">
                                {title}
                            </div>
                        </Link>
                        <div className="tw-w-full tw-mt-1">
                            <div className="tw-flex tw-items-center tw-gap-2 tw-w-full">
                                <Image
                                    src={RankingStarTop}
                                    width={14}
                                    height={14}
                                    alt="wallet icon"
                                    className="tw-w-[14px] tw-h-[14px]"
                                />
                                <span className="tw-opacity-80">Place:</span>
                                <span className="tw-text-[#F2CA16] tw-font-bold">
                                    {place}
                                </span>
                            </div>
                            <div className="tw-flex tw-items-center tw-gap-2 tw-w-full">
                                <Image
                                    src={Hourglass}
                                    width={14}
                                    height={14}
                                    alt="wallet icon"
                                    className="tw-w-[14px] tw-h-[14px]"
                                />
                                <span className="tw-opacity-80">
                                    Time Left:
                                </span>
                                <span className="">{time_left}</span>
                            </div>
                        </div>
                        <div className="tw-mt-4 tw-w-full tw-p-2 tw-flex tw-gap-4 tw-bg-[#49C74233] tw-rounded">
                            <Image
                                src={MoneyBagGreen}
                                width={20}
                                height={20}
                                alt="money bag"
                                className="tw-w-[20px] tw-h-[20px]"
                            />
                            <div className="tw-text-[#49C742] tw-font-bold tw-text-left tw-grow-[1]">
                                POTENTIAL PRIZE
                            </div>
                            <div className="tw-text-[#49C742] tw-font-bold tw-text-left">
                                {potential_prize}
                            </div>
                        </div>
                    </div>
                </div>
            )} */}
        </div>
    );
};

const MyAccountDropdownMenu = () => {
    const [walletBalance, setWalletBalance] = useState<number>(0);
    const { data: session } = useSession();
    //   const account_load = 100;
    const router = useRouter();

    useEffect(() => {
        const fetchWalletBalance = async () => {
            if (session) {
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
        <div className="tw-absolute tw-z-10 tw-right-0 tw-top-8 tw-w-[320px] tw-h-auto tw-bg-[#1A2C3D] tw-rounded tw-py-6 tw-flex tw-flex-col tw-items-start tw-gap-4 tw-shadow-xl tw-shadow-black ">
            <div className="tw-px-6 tw-font-bold tw-text-lg">MY ACCOUNT</div>
            {walletBalance !== null && (
                <div className="tw-px-6 tw-w-full">
                    <div className="tw-bg-[#49C74233] tw-w-full tw-px-6 tw-py-4 tw-rounded tw-flex tw-items-center tw-gap-6">
                        <Image
                            src={Wallet}
                            width={32}
                            height={32}
                            alt="wallet icon"
                            className="tw-w-8 tw-h-8"
                        />
                        <div className="tw-flex tw-flex-col tw-items-start tw-grow">
                            <span className="tw-font-bold tw-text-xl tw-py-1">
                                {" "}
                                ${walletBalance.toFixed(2)}
                            </span>
                            <span className="tw-text-[#49C742]">Withdraw</span>
                        </div>
                    </div>
                </div>
            )}
            <div className="tw-px-6 tw-flex tw-flex-col tw-items-start tw-w-full">
                <Link
                    href="/profile"
                    className="tw-text-left tw-p-2 hover:tw-bg-white/5 tw-rounded tw-w-full"
                >
                    Profile
                </Link>
                <button className="tw-text-left tw-p-2 hover:tw-bg-white/5 tw-rounded tw-w-full">
                    Settings
                </button>
                <button
                    onClick={handleSignOut}
                    className="tw-text-left tw-p-2 hover:tw-bg-white/5 tw-rounded tw-w-full"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

const SearchDropDown: React.FC<SearchDropDownProps> = ({
    searchedData,
    onSearchClick,
}) => {
    return (
        <div
            id="search-box"
            className="tw-bg-shade-100 tw-absolute tw-top-10 tw-left-0 tw-right-0 sm:tw-bg-shade-50 tw-max-h-[344px] tw-overflow-y-scroll tw-z-10 tw-rounded-b tw-px-1 tw-border-t-[1px] tw-border-t-[#1b252e]"
        >
            {Array.isArray(searchedData) &&
                searchedData &&
                searchedData.map((carData) => {
                    return (
                        <div
                            key={carData.auction_id}
                            onClick={() =>
                                onSearchClick(
                                    `${carData.make}`,
                                    `${carData.model}`,
                                    `${carData.auction_id}`
                                )
                            }
                            className="tw-p-2 hover:tw-bg-shade-25 hover:tw-cursor-pointer hover:tw-rounded"
                        >
                            {carData.make} {carData.model}
                        </div>
                    );
                })}
        </div>
    );
};

interface SearchDatas {
    auction_id: string;
    make: string;
    model: string;
    year: string;
    price: number;
    bids: number;
    deadline: string;
}

interface SearchDropDownProps {
    searchedData: SearchDatas[];
    onSearchClick: (carMake: string, carModel: string, carID: string) => void;
}
