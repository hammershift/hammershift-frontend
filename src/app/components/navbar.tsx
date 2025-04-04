"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "../../../public/images/hammershift-logo.svg";
import LogoSmall from "../../../public/images/logo-small.svg";
import MagnifyingGlass from "../../../public/images/magnifying-glass.svg";
import CloseIcon from "../../../public/images/close-icon.svg";
import WagersIcon from "../../../public/images/dollar-coin.svg";
import WatchlistIcon from "../../../public/images/watchlist-icon.svg";
import AccountIcon from "../../../public/images/account-icon.svg";
import HamburgerMenu from "../../../public/images/hamburger-menu.svg";
import CancelIcon from "../../../public/images/x-icon.svg";
import ThreeStars from "../../../public/images/three-star-icon.svg";
import Wallet from "../../../public/images/wallet--money-payment-finance-wallet.svg";
import MoneyBag from "../../../public/images/monetization-browser-bag-big.svg";
import Dollar from "../../../public/images/dollar.svg";
import Hourglass from "../../../public/images/hour-glass.svg";
import WalletSmall from "../../../public/images/wallet--money-payment-finance-wallet.svg";
import MoneyBagGreen from "../../../public/images/monetization-browser-bag-green.svg";
import MoneyBagBlack from "../../../public/images/money-bag-black.svg";
import PodiumIcon from "../../../public/images/podium-icon.svg";
import HammerIcon from "../../../public/images/hammer-icon.svg";
import ArrowDown from "../../../public/images/arrow-down.svg";
import DropdownArrow from "../../../public/images/dropdown.svg";
import ArrowRight from "../../../public/images/arrow-right.svg";

import MyWagerPhotoOne from "../../../public/images/my-wagers-navbar/my-wager-photo-one.svg";
import MyWagerPhotoTwo from "../../../public/images/my-wagers-navbar/my-wager-photo-two.svg";
import MyWagerPhotoThree from "../../../public/images/my-wagers-navbar/my-wager-photo-three.svg";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
    getAuctionTransactions,
    getMyWagers,
    getMyWatchlist,
    getTournamentTransactions,
    getUserPointsAndPlacing,
    refundWager,
} from "@/lib/data";
import { TimerProvider, useTimer } from "../_context/TimerContext";
import { BeatLoader, BounceLoader } from "react-spinners";
import { createPageUrl } from "./utils";

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
    const pathname = usePathname();
    const [menuIsOpen, setMenuIsOpen] = useState(false);
    const [searchedData, setSearchedData] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [searchBoxDropDown, setSearchBoxDropDown] = useState(false);
    const [dropWatchlist, setDropWatchlist] = useState(false);
    const [dropMyWagers, setDropMyWagers] = useState(false);
    const [dropMyAccount, setDropMyAccount] = useState(false);
    const [myAccountMenuOpen, setMyAccountMenuOpen] = useState(false);
    const [showClearSearchButton, setShowClearSearchButton] = useState(false);
    const [navlinkIsOpen, setNavlinkIsOpen] = useState(false);
    const logoUrl =
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/08c277_VelocityMarketsLogo-White.png";
    const navBarList = [
        { title: "Home", urlString: "" },
        { title: "Free Play", urlString: "Free Play" },
        { title: "Tournaments", urlString: "Tournaments" },
        { title: "Guess the Hammer", urlString: "Price Is Right" },
    ];
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
            const myWagersSortButton = document.getElementById("myWagers-sort");
            const myWatchlistSortButton =
                document.getElementById("myWatchlist-sort");

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
                !watchlistCompletedButton.contains(e.target as Node) &&
                myWatchlistSortButton &&
                !myWatchlistSortButton.contains(e.target as Node)
            ) {
                setDropWatchlist(false);
            }

            if (
                myWagersButton &&
                !myWagersButton.contains(e.target as Node) &&
                myWagersActiveButton &&
                !myWagersActiveButton.contains(e.target as Node) &&
                myWagersCompletedButton &&
                !myWagersCompletedButton.contains(e.target as Node) &&
                myWagersSortButton &&
                !myWagersSortButton.contains(e.target as Node)
            ) {
                setDropMyWagers(false);
            }

            const claimRefundButtons = document.getElementsByClassName(
                "claim-button"
            ) as HTMLCollectionOf<HTMLElement>;

            const isClaimButtonClicked = Array.from(claimRefundButtons).some(
                (button) => button.contains(e.target as Node)
            );

            if (isClaimButtonClicked) {
                setDropMyWagers(true);
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
        setShowClearSearchButton(true);
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
        setMenuIsOpen(false);
    };

    const closeMenu = () => {
        setMenuIsOpen(false);
    };

    const closeNavLinkDropDownMenu = () => {
        setNavlinkIsOpen(false);
    };

    const clearSearchInputs = () => {
        const searchInput = document.getElementById(
            "search-bar-input"
        ) as HTMLInputElement;
        const dropDownSearchInput = document.getElementById(
            "dropdown-search-bar"
        ) as HTMLInputElement;

        if (searchInput) searchInput.value = "";

        if (dropDownSearchInput) dropDownSearchInput.value = "";

        setShowClearSearchButton(false);
        setSearchedData([]);
    };

    const closeMyAccountMenu = () => {
        setMyAccountMenuOpen(false);
    };

    const { data: session } = useSession();
    const isLoggedIn = !!session;

    return (
        <div className="section-container mx-auto flex items-center justify-center">
            {isLoggedIn ? (
                <div className="flex w-full justify-between border-b-[1px] border-b-[#1b252e] px-4 py-3 md:px-16">
                    <div className="flex items-center justify-between">
                        <div className="pr-4">
                            <Link
                                onClick={() => {
                                    closeMenu();
                                    closeMyAccountMenu();
                                    closeNavLinkDropDownMenu();
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
                                {/* <Image
                  src={LogoSmall}
                  width={32}
                  height={32}
                  alt="logo"
                  className=" block sm:hidden w-auto h-auto"
                /> */}
                            </Link>
                        </div>
                        {/* <Link
              onClick={() => {
                closeMenu()
                closeMyAccountMenu()
                closeNavLinkDropDownMenu()
                document.body.classList.remove('stop-scrolling')
              }}
              href="/live"
            >
              <div
                className={`block mx-4 sm:mx-4 ${
                  pathname === '/live' && 'font-bold border-b-2'
                }`}
              >
                LIVE
              </div>
            </Link> */}

                        {/* <Link
              onClick={() => {
                closeMenu();
                closeMyAccountMenu();
                document.body.classList.remove("stop-scrolling");
              }}
              href="/discover"
            >
              <div
                className={`block mx-2 sm:mx-2 ${
                  pathname === "/discover" && "font-bold border-b-2"
                }`}
              >
                DISCOVER
              </div>
            </Link> */}
                        {/* <Link
              onClick={() => {
                closeMenu();
                closeMyAccountMenu();
                document.body.classList.remove("stop-scrolling");
              }}
              href="/auctions"
            >
              <div
                className={`block mx-2 sm:mx-2 ${
                  pathname === "/auctions" && "font-bold border-b-2"
                }`}
              >
                AUCTIONS
              </div>
            </Link> */}
                        {/* <Link
              onClick={() => {
                closeMenu()
                closeMyAccountMenu()
                closeNavLinkDropDownMenu()
                document.body.classList.remove('stop-scrolling')
              }}
              href="/tournaments"
            >
              <div
                className={`block mx-4 sm:mx-4 max-sm:hidden ${
                  pathname === '/tournaments' && 'font-bold border-b-2'
                }`}
              >
                TOURNAMENTS
              </div>
            </Link> */}
                        {/* <div>
              <div className="flex">
                <Link
                  onClick={() => {
                    closeMenu()
                    closeMyAccountMenu()
                    closeNavLinkDropDownMenu()
                    document.body.classList.remove('stop-scrolling')
                  }}
                  href="/discover"
                >
                  <div
                    className={`block mx-4 sm:mx-4 max-sm:hidden ${
                      pathname === '/discover' && 'font-bold border-b-2'
                    }`}
                  >
                    EXPLORE
                  </div>
                </Link>
                <button
                  onMouseEnter={() => {
                    setNavlinkIsOpen(!navlinkIsOpen)
                    closeMenu()
                    closeMyAccountMenu()
                  }}
                  id="options-menu"
                >
                  <Image src={ArrowDown} alt="arrow-down" width={18}></Image>
                </button>
                <Link
                  onClick={() => {
                    closeMenu()
                    closeMyAccountMenu()
                    closeNavLinkDropDownMenu()
                    document.body.classList.remove('stop-scrolling')
                  }}
                  href="/feedback"
                >
                  <div
                    className={`block mx-4 sm:mx-4 ${
                      pathname === '/feedback' && 'font-bold border-b-2'
                    }`}
                  >
                    FEEDBACK
                  </div>
                </Link>
                {navlinkIsOpen && (
                  <div
                    onMouseLeave={() => {
                      closeNavLinkDropDownMenu()
                    }}
                    className="max-sm:slide-in-top absolute z-50 left-[580px] top-16 w-auto max-h-[784px] overflow-auto bg-[#0F1923] rounded pt-2 p-2 shadow-xl shadow-black max-sm:w-full max-sm:left-0 max-sm:top-14"
                  >
                    <div
                      className="flex flex-col px-1 gap-2"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="options-menu"
                    >
                      <Link
                        onClick={() => {
                          closeMenu()
                          closeMyAccountMenu()
                          closeNavLinkDropDownMenu()
                          document.body.classList.remove('stop-scrolling')
                        }}
                        href="/tournaments"
                        className="sm:hidden p-1.5 hover:bg-white/5 w-full"
                        role="menuitem"
                      >
                        TOURNAMENTS
                      </Link>
                      <Link
                        onClick={() => {
                          closeMenu()
                          closeMyAccountMenu()
                          closeNavLinkDropDownMenu()
                          document.body.classList.remove('stop-scrolling')
                        }}
                        href="/discover"
                        className="sm:hidden p-1.5 hover:bg-white/5 w-full"
                        role="menuitem"
                      >
                        DISCOVER
                      </Link>
                      <Link
                        href="/auctions"
                        onClick={() => {
                          closeMenu()
                          closeMyAccountMenu()
                          closeNavLinkDropDownMenu()
                          document.body.classList.remove('stop-scrolling')
                        }}
                        className="p-1.5 hover:bg-white/5 w-full"
                        role="menuitem"
                      >
                        AUCTIONS
                      </Link>
                      <Link
                        href="/about_page"
                        onClick={() => {
                          closeMenu()
                          closeMyAccountMenu()
                          closeNavLinkDropDownMenu()
                          document.body.classList.remove('stop-scrolling')
                        }}
                        className="p-1.5 hover:bg-white/5 w-full"
                        role="menuitem"
                      >
                        ABOUT
                      </Link>
                      <Link
                        href="/leaderboards"
                        onClick={() => {
                          closeMenu()
                          closeMyAccountMenu()
                          closeNavLinkDropDownMenu()
                          document.body.classList.remove('stop-scrolling')
                        }}
                        className="p-1.5 hover:bg-white/5 w-full"
                        role="menuitem"
                      >
                        LEADERBOARDS
                      </Link>
                      <Link
                        href="/how_it_works"
                        onClick={() => {
                          closeMenu()
                          closeMyAccountMenu()
                          closeNavLinkDropDownMenu()
                          document.body.classList.remove('stop-scrolling')
                        }}
                        className="p-1.5 hover:bg-white/5 w-full"
                        role="menuitem"
                      >
                        HOW IT WORKS
                      </Link>
                      <Link
                        href="/tos"
                        onClick={() => {
                          closeMenu()
                          closeMyAccountMenu()
                          closeNavLinkDropDownMenu()
                          document.body.classList.remove('stop-scrolling')
                        }}
                        className="p-1.5 hover:bg-white/5 w-full"
                        role="menuitem"
                      >
                        TERMS OF SERVICE
                      </Link>
                      <Link
                        href="/privacy_policy"
                        onClick={() => {
                          closeMenu()
                          closeMyAccountMenu()
                          closeNavLinkDropDownMenu()
                          document.body.classList.remove('stop-scrolling')
                        }}
                        className="p-1.5 hover:bg-white/5 w-full"
                        role="menuitem"
                      >
                        PRIVACY POLICY
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div> */}
                    </div>
                    {/* <div className="relative max-w-[535px] w-full hidden lg:block">
            <form
              onSubmit={handleSumbit}
              autoComplete="off"
              className="w-full flex items-center"
            >
              <div
                className={
                  searchBoxDropDown
                    ? 'bg-shade-50 flex py-2 px-3 grow rounded-t'
                    : 'bg-shade-50 flex py-2 px-3 grow rounded'
                }
              >
                <Image
                  src={MagnifyingGlass}
                  width={15}
                  height={15}
                  alt="magnifying glass"
                  className="w-auto h-auto"
                />
                <input
                  id="search-bar-input"
                  name="search"
                  type="text"
                  className="ml-2 bg-shade-50 w-full outline-none border-none"
                  placeholder="Search make, model, year..."
                  onClick={handleInputClick}
                  onChange={handleChange}
                ></input>
                {showClearSearchButton && (
                  <Image
                    src={CloseIcon}
                    width={25}
                    height={25}
                    alt="magnifying glass"
                    className="w-[] h-auto cursor-pointer"
                    onClick={clearSearchInputs}
                  />
                )}
              </div>
            </form>
            {searchBoxDropDown && (
              <SearchDropDown
                searchedData={searchedData}
                onSearchClick={handleSearchClick}
              />
            )}
          </div> */}
                    {/* Buttons for logged in accounts */}
                    <div className="relative hidden w-[136px] items-center justify-between sm:flex md:visible">
                        <button
                            id="watchlist-button"
                            className="relative"
                            onClick={() => {
                                setDropWatchlist((prev) => !prev);
                                setDropMyAccount(false);
                                setDropMyWagers(false);
                            }}
                        >
                            <Image
                                src={WatchlistIcon}
                                width={24}
                                height={24}
                                alt="watchlist"
                                className="h-[24px] w-[24px]"
                            />
                        </button>
                        {dropWatchlist && <MyWatchlistDropdownMenu />}
                        <button
                            id="mywagers-button"
                            onClick={() => {
                                setDropMyWagers((prev) => !prev);
                                setDropMyAccount(false);
                                setDropWatchlist(false);
                            }}
                        >
                            <Image
                                src={WagersIcon}
                                width={24}
                                height={24}
                                alt="wagers"
                                className="h-[24px] w-[24px]"
                            />
                        </button>
                        {dropMyWagers && <MyWagersDropdownMenu />}
                        <button
                            id="myaccount-button"
                            className="relative"
                            onClick={() => {
                                setDropMyAccount((prev) => !prev);
                                setDropWatchlist(false);
                                setDropMyWagers(false);
                            }}
                        >
                            <Image
                                src={AccountIcon}
                                width={24}
                                height={24}
                                alt="account"
                                className="h-[24px] w-[24px]"
                            />
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
                                closeNavLinkDropDownMenu();
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
            ) : (
                <div className="flex w-full justify-between border-b-[1px] border-b-[#1b252e] py-3">
                    <div className="flex items-center justify-between">
                        <div className="pr-4">
                            <Link
                                onClick={() => {
                                    closeMenu();
                                    closeMyAccountMenu();
                                    closeNavLinkDropDownMenu();
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
                        {/* <Link
              onClick={() => {
                closeMenu()
                closeMyAccountMenu()
                closeNavLinkDropDownMenu()
                document.body.classList.remove('stop-scrolling')
              }}
              href="/live"
            >
              <div
                className={`block mx-4 sm:mx-4 ${
                  pathname === '/live' && 'font-bold border-b-2'
                }`}
              >
                LIVE
              </div>
            </Link> */}
                        {/* <Link
              onClick={() => {
                closeMenu();
                closeMyAccountMenu();
                document.body.classList.remove("stop-scrolling");
              }}
              href="/discover"
            >
              <div
                className={`block mx-2 sm:mx-2 ${
                  pathname === "/discover" && "font-bold border-b-2"
                }`}
              >
                DISCOVER
              </div>
            </Link> */}
                        {/* <Link
              onClick={() => {
                closeMenu();
                closeMyAccountMenu();
                document.body.classList.remove("stop-scrolling");
              }}
              href="/auctions"
            >
              <div
                className={`block mx-2 sm:mx-2 ${
                  pathname === "/auctions" && "font-bold border-b-2"
                }`}
              >
                AUCTIONS
              </div>
            </Link> */}
                        {/* <Link
              onClick={() => {
                closeMenu()
                closeMyAccountMenu()
                closeNavLinkDropDownMenu()
                document.body.classList.remove('stop-scrolling')
              }}
              href="/tournaments"
            >
              <div
                className={`block mx-4 sm:mx-4 max-sm:hidden ${
                  pathname === '/tournaments' && 'font-bold border-b-2'
                }`}
              >
                TOURNAMENTS
              </div>
            </Link> */}
                        {/* <div>
              <div className="flex">
                <Link
                  onClick={() => {
                    closeMenu()
                    closeMyAccountMenu()
                    closeNavLinkDropDownMenu()
                    document.body.classList.remove('stop-scrolling')
                  }}
                  href="/discover"
                >
                  <div
                    className={`block mx-4 sm:mx-4 max-sm:hidden ${
                      pathname === '/discover' && 'font-bold border-b-2'
                    }`}
                  >
                    EXPLORE
                  </div>
                </Link>
                <button
                  onMouseEnter={() => {
                    setNavlinkIsOpen(!navlinkIsOpen)
                    closeMenu()
                    closeMyAccountMenu()
                  }}
                  id="options-menu"
                >
                  <Image src={ArrowDown} alt="arrow-down" width={18}></Image>
                </button>
                {navlinkIsOpen && (
                  <div
                    onMouseLeave={() => {
                      closeNavLinkDropDownMenu()
                    }}
                    className="max-sm:slide-in-top absolute z-50 left-[580px] top-16 w-auto max-h-[784px] overflow-auto bg-[#0F1923] rounded pt-2 p-2 shadow-xl shadow-black max-sm:w-full max-sm:left-0 max-sm:top-14"
                  >
                    <div
                      className="flex flex-col px-1 gap-2"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="options-menu"
                    >
                      <Link
                        onClick={() => {
                          closeMenu()
                          closeMyAccountMenu()
                          closeNavLinkDropDownMenu()
                          document.body.classList.remove('stop-scrolling')
                        }}
                        href="/tournaments"
                        className="sm:hidden p-1.5 hover:bg-white/5 w-full"
                        role="menuitem"
                      >
                        TOURNAMENTS
                      </Link>
                      <Link
                        onClick={() => {
                          closeMenu()
                          closeMyAccountMenu()
                          closeNavLinkDropDownMenu()
                          document.body.classList.remove('stop-scrolling')
                        }}
                        href="/discover"
                        className="sm:hidden p-1.5 hover:bg-white/5 w-full"
                        role="menuitem"
                      >
                        DISCOVER
                      </Link>
                      <Link
                        href="/auctions"
                        onClick={() => {
                          closeMenu()
                          closeMyAccountMenu()
                          closeNavLinkDropDownMenu()
                          document.body.classList.remove('stop-scrolling')
                        }}
                        className="p-1.5 hover:bg-white/5 w-full"
                        role="menuitem"
                      >
                        AUCTIONS
                      </Link>
                      <Link
                        href="/about_page"
                        onClick={() => {
                          closeMenu()
                          closeMyAccountMenu()
                          closeNavLinkDropDownMenu()
                          document.body.classList.remove('stop-scrolling')
                        }}
                        className="p-1.5 hover:bg-white/5 w-full"
                        role="menuitem"
                      >
                        ABOUT
                      </Link>
                      <Link
                        href="/leaderboards"
                        onClick={() => {
                          closeMenu()
                          closeMyAccountMenu()
                          closeNavLinkDropDownMenu()
                          document.body.classList.remove('stop-scrolling')
                        }}
                        className="p-1.5 hover:bg-white/5 w-full"
                        role="menuitem"
                      >
                        LEADERBOARD
                      </Link>
                      <Link
                        href="/how_it_works"
                        onClick={() => {
                          closeMenu()
                          closeMyAccountMenu()
                          closeNavLinkDropDownMenu()
                          document.body.classList.remove('stop-scrolling')
                        }}
                        className="p-1.5 hover:bg-white/5 w-full"
                        role="menuitem"
                      >
                        HOW IT WORKS
                      </Link>
                      <Link
                        href="/tos"
                        onClick={() => {
                          closeMenu()
                          closeMyAccountMenu()
                          closeNavLinkDropDownMenu()
                          document.body.classList.remove('stop-scrolling')
                        }}
                        className="p-1.5 hover:bg-white/5 w-full"
                        role="menuitem"
                      >
                        TERMS OF SERVICE
                      </Link>
                      <Link
                        href="/privacy_policy"
                        onClick={() => {
                          closeMenu()
                          closeMyAccountMenu()
                          closeNavLinkDropDownMenu()
                          document.body.classList.remove('stop-scrolling')
                        }}
                        className="p-1.5 hover:bg-white/5 w-full"
                        role="menuitem"
                      >
                        PRIVACY POLICY
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div> */}
                    </div>
                    <div className="relative mr-4 hidden max-w-[535px] flex-1 justify-between lg:flex xl:w-full">
                        <nav className="flex items-center justify-between space-x-8">
                            {navBarList.map((data, index) => (
                                <Link
                                    key={index}
                                    href={createPageUrl(data.urlString)}
                                    className="transition-colors hover:text-[#F2CA16]"
                                >
                                    {data.title.toUpperCase()}
                                </Link>
                            ))}
                        </nav>
                    </div>
                    {/* <div className="relative max-w-[535px] xl:w-full flex-1 hidden lg:flex mr-4">
                        <form
                            onSubmit={handleSumbit}
                            autoComplete="off"
                            className="w-full flex items-center"
                        >
                            <div
                                className={
                                    searchBoxDropDown
                                        ? 'bg-shade-50 flex p-2 grow rounded-t'
                                        : 'bg-shade-50 flex p-2 grow rounded'
                                }
                            >
                                <Image
                                    src={MagnifyingGlass}
                                    width={15}
                                    height={15}
                                    alt="magnifying glass"
                                    className="w-auto h-auto"
                                />
                                <input
                                    id="search-bar-input"
                                    name="search"
                                    type="text"
                                    className="ml-2 bg-shade-50 w-full outline-none border-none"
                                    placeholder="Search make, model, year..."
                                    onClick={handleInputClick}
                                    onChange={handleChange}
                                ></input>
                                {showClearSearchButton && (
                                    <Image
                                        src={CloseIcon}
                                        width={25}
                                        height={25}
                                        alt="magnifying glass"
                                        className="w-[] h-auto cursor-pointer"
                                        onClick={clearSearchInputs}
                                    />
                                )}
                            </div>
                        </form>
                        {searchBoxDropDown && (
                            <SearchDropDown
                                searchedData={searchedData}
                                onSearchClick={handleSearchClick}
                            />
                        )}
                    </div> */}
                    <div className="flex items-center">
                        <Link href="/login_page">
                            <button className="btn-white mx-2 hidden hover:bg-gold-200 md:block">
                                LOGIN
                            </button>
                        </Link>
                        <Link href="/create_account">
                            <button className="btn-white hidden hover:bg-gold-200 md:block">
                                SIGN UP
                            </button>
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
                    showClearSearchButton={showClearSearchButton}
                    clearSearchInputs={clearSearchInputs}
                />
            )}
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
    showClearSearchButton: boolean;
    clearSearchInputs: () => void;
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
    showClearSearchButton,
    clearSearchInputs,
}) => {
    const router = useRouter();
    const [dropWatchlistOrWagers, setDropWatchlistOrWagers] = useState("");

    return (
        <div className="drop-down-custom-height slide-in-top absolute z-50 w-full flex-col bg-[#0F1923] p-4 text-white">
            <div className="relative">
                {/* <form
                    autoComplete="off"
                    onSubmit={handleSubmit}
                    className="bg-shade-100 flex justify-between p-2 rounded my-4"
                >
                    <div className="flex w-full">
                        <Image
                            src={MagnifyingGlass}
                            width={15}
                            height={15}
                            alt="magnifying glass"
                            className="w-auto h-auto"
                        />
                        <input
                            id="dropdown-search-bar"
                            className="ml-2 bg-shade-100 outline-none w-full"
                            placeholder="Search make, model, year..."
                            name="search"
                            type="text"
                            onChange={handleChange}
                            onClick={() => {
                                setSearchBoxDropDown(true)
                            }}
                        ></input>
                    </div>
                    {showClearSearchButton && (
                        <Image
                            src={CloseIcon}
                            width={20}
                            height={20}
                            alt="magnifying glass"
                            className="h-auto cursor-pointer"
                            onClick={clearSearchInputs}
                        />
                    )}
                </form> */}
                {/* {searchBoxDropDown && (
                    <SearchDropDown
                        searchedData={searchedData}
                        onSearchClick={onSearchClick}
                    />
                )} */}
            </div>
            {!isLoggedIn ? null : ( // </> //   </Link> //     <div>LEADERBOARD</div> //   > //     className="flex py-2" //     }} //       document.body.classList.remove("stop-scrolling"); //       closeMenu(); //     onClick={() => { //     href="/leaderboard" //   <Link //   </Link> //     <div>ABOUT</div> //   > //     className="flex py-2" //     }} //       document.body.classList.remove("stop-scrolling"); //       closeMenu(); //     onClick={() => { //     href="/about_page" //   <Link //   </Link> //     <div>TOURNAMENTS</div> //   > //     className="flex py-2" //     }} //       document.body.classList.remove("stop-scrolling"); //       closeMenu(); //     onClick={() => { //     href="/tournaments" //   <Link //   </Link> //     <div>AUCTIONS</div> //   > //     className="flex py-2" //     }} //       document.body.classList.remove("stop-scrolling"); //       closeMenu(); //     onClick={() => { //     href="/auctions" //   <Link //   </Link> */} //     <div>LIVE</div> //   > //     className="flex py-2" //     }} //       document.body.classList.remove("stop-scrolling"); //       closeMenu(); //     onClick={() => { //     href="/live" //   {/* <Link //   </Link> //     <div>DISCOVER</div> //   > //     className="flex py-2" //     onClick={closeMenu} //     href="/discover" //   <Link // <>
                <>
                    <button
                        onClick={() => setDropWatchlistOrWagers("watchlist")}
                        className={`flex w-full py-2 ${
                            dropWatchlistOrWagers === "watchlist" && "font-bold"
                        }`}
                    >
                        <Image
                            src={WatchlistIcon}
                            width={24}
                            height={24}
                            alt="watchlist"
                            className="h-[24px] w-[24px]"
                        />
                        <div className="ml-4">MY WATCHLIST</div>
                    </button>
                    {dropWatchlistOrWagers === "watchlist" ? (
                        <MobileMyWatchlist closeMenu={closeMenu} />
                    ) : null}
                    <button
                        onClick={() => setDropWatchlistOrWagers("wagers")}
                        className={`flex w-full py-2 ${
                            dropWatchlistOrWagers === "wagers" && "font-bold"
                        }`}
                    >
                        <Image
                            src={WagersIcon}
                            width={24}
                            height={24}
                            alt="watchlist"
                            className="h-[24px] w-[24px]"
                        />
                        <div className="ml-4">MY WAGERS</div>
                    </button>
                    {dropWatchlistOrWagers === "wagers" ? (
                        <MobileMyWagers closeMenu={closeMenu} />
                    ) : null}
                </>
            )}
            <div className="mt-4">
                {!isLoggedIn && (
                    <>
                        <button
                            onClick={() => {
                                router.push("/login_page");
                                document.body.classList.remove(
                                    "stop-scrolling"
                                );
                                closeMenu();
                            }}
                            className="btn-white my-2 w-full"
                        >
                            LOGIN
                        </button>
                        <button
                            onClick={() => {
                                router.push("/create_account");
                                document.body.classList.remove(
                                    "stop-scrolling"
                                );
                                closeMenu();
                            }}
                            className="btn-white w-full"
                        >
                            CREATE ACCOUNT
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

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
            <div className="p-1.5 text-lg font-bold">MY ACCOUNT</div>
            {isLoading ? (
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
            )}
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

// Dropdown Menus
const MyWatchlistDropdownMenu = () => {
    const router = useRouter();
    const [activeOrCompleted, setActiveOrCompleted] = useState("active");
    const [activeWatchlist, setActiveWatchlist] = useState([]);
    const [completedWatchlist, setCompletedWatchlist] = useState([]);
    const [activeTournamentWatchlist, setActiveTournamentWatchlist] = useState(
        []
    );
    const [completedTournamentWatchlist, setCompletedTournamentWatchlist] =
        useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const words = ["ALL", "AUCTIONS", "TOURNAMENTS"];
    const [wagerSort, setWagerSort] = useState(words[0]);

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
                const completedTournaments = data.tournament_watchlist.filter(
                    (watchlist: any) => {
                        const auctionDeadline = new Date(watchlist.endTime);
                        return auctionDeadline < currentDate;
                    }
                );

                const activeTournaments = data.tournament_watchlist.filter(
                    (watchlist: any) => {
                        const auctionDeadline = new Date(watchlist.endTime);
                        return auctionDeadline >= currentDate;
                    }
                );

                setActiveWatchlist(active);
                setCompletedWatchlist(completed);
                setActiveTournamentWatchlist(activeTournaments);
                setCompletedTournamentWatchlist(completedTournaments);
            }
            setIsLoading(false);
        };
        fetchWatchlist();
    }, []);

    const handleClick = () => {
        const currentIndex = words.indexOf(wagerSort);
        const nextIndex = (currentIndex + 1) % words.length;
        setWagerSort(words[nextIndex]);
    };

    return (
        <div className="watchlist-menu absolute right-[112px] top-10 z-30 max-h-[784px] w-[512px] overflow-auto rounded bg-[#1A2C3D] pb-2 pt-6 shadow-xl shadow-black">
            <div className="flex flex-col gap-4 px-6">
                <div className="flex justify-between">
                    <div className="text-left text-lg font-bold">
                        MY WATCHLIST
                    </div>
                    {(activeWatchlist.length !== 0 ||
                        completedWatchlist.length !== 0 ||
                        activeTournamentWatchlist.length !== 0 ||
                        completedTournamentWatchlist.length !== 0) && (
                        <button
                            id="myWatchlist-sort"
                            type="button"
                            className="text-white-900 w-[140px] truncate rounded-sm bg-[#172431] px-2 py-1.5 text-center shadow-sm hover:bg-[#0f1923]"
                            onClick={handleClick}
                        >
                            {wagerSort}
                        </button>
                    )}
                </div>
                <div className="flex">
                    <button
                        id="active-watchlist-button"
                        onClick={() => setActiveOrCompleted("active")}
                        className="flex w-1/2 items-center justify-center gap-2 border-b-2 border-[#314150] py-2 focus:border-white focus:font-bold"
                        autoFocus
                    >
                        <div>ACTIVE </div>
                        {!isLoading && (
                            <span className="rounded bg-[#f2ca16] px-1 text-sm font-bold text-[#0f1923]">
                                {activeWatchlist.length +
                                    activeTournamentWatchlist.length}
                            </span>
                        )}
                    </button>
                    <button
                        id="completed-watchlist-button"
                        onClick={() => setActiveOrCompleted("completed")}
                        className="w-1/2 border-b-2 border-[#314150] py-2 focus:border-white focus:font-bold"
                    >
                        COMPLETED
                    </button>
                </div>
            </div>
            {isLoading && (
                <div className="flex justify-center pb-[50px] pt-[74px]">
                    <BounceLoader color="#696969" loading={true} />
                </div>
            )}
            {activeOrCompleted === "active" &&
            (activeWatchlist.length !== 0 ||
                activeTournamentWatchlist.length !== 0) ? (
                <div className="w-full">
                    {wagerSort !== "TOURNAMENTS" &&
                        activeWatchlist.map((watchlist: any, index: number) => (
                            <div key={watchlist._id}>
                                <TimerProvider
                                    deadline={watchlist.auctionDeadline}
                                >
                                    <MyWatchlistCard
                                        title={`${watchlist.auctionYear} ${watchlist.auctionMake} ${watchlist.auctionModel}`}
                                        img={watchlist.auctionImage}
                                        current_bid={watchlist.auctionPrice}
                                        time_left={watchlist.auctionDeadline}
                                        id={watchlist.auctionIdentifierId}
                                        isActive={true}
                                        index={index}
                                    />
                                </TimerProvider>
                            </div>
                        ))}
                    {wagerSort !== "AUCTIONS" &&
                        activeTournamentWatchlist.map((watchlist: any) => {
                            return (
                                <div key={watchlist._id}>
                                    <TimerProvider deadline={watchlist.endTime}>
                                        <MyWatchlistTournamentCard
                                            watchlist={watchlist}
                                            isActive={true}
                                        />
                                    </TimerProvider>
                                </div>
                            );
                        })}
                </div>
            ) : null}
            {activeOrCompleted === "completed" &&
            (completedWatchlist.length !== 0 ||
                completedTournamentWatchlist.length !== 0) ? (
                <div className="w-full">
                    {wagerSort !== "TOURNAMENTS" &&
                        completedWatchlist.map(
                            (watchlist: any, index: number) => (
                                <div key={watchlist._id}>
                                    <TimerProvider
                                        deadline={watchlist.auctionDeadline}
                                    >
                                        <MyWatchlistCard
                                            title={`${watchlist.auctionYear} ${watchlist.auctionMake} ${watchlist.auctionModel}`}
                                            img={watchlist.auctionImage}
                                            current_bid={watchlist.auctionPrice}
                                            id={watchlist.auctionIdentifierId}
                                            time_left={
                                                watchlist.auctionDeadline
                                            }
                                            isActive={false}
                                            index={index}
                                        />
                                    </TimerProvider>
                                </div>
                            )
                        )}
                    {wagerSort !== "AUCTIONS" &&
                        completedTournamentWatchlist.map((watchlist: any) => {
                            return (
                                <div key={watchlist._id}>
                                    <TimerProvider deadline={watchlist.endTime}>
                                        <MyWatchlistTournamentCard
                                            watchlist={watchlist}
                                            isActive={false}
                                        />
                                    </TimerProvider>
                                </div>
                            );
                        })}
                </div>
            ) : null}
            {isLoading === false &&
            activeOrCompleted === "active" &&
            activeWatchlist.length === 0 &&
            activeTournamentWatchlist.length === 0 ? (
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
            ) : null}
            {isLoading === false &&
            activeOrCompleted === "completed" &&
            completedWatchlist.length === 0 &&
            completedTournamentWatchlist.length === 0 ? (
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
            ) : null}
            {isLoading === false &&
            activeOrCompleted === "completed" &&
            completedWatchlist.length === 0 &&
            wagerSort === "AUCTIONS" ? (
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
            ) : null}
            {isLoading === false &&
            activeOrCompleted === "completed" &&
            completedTournamentWatchlist.length === 0 &&
            wagerSort === "TOURNAMENTS" ? (
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
            ) : null}
            {isLoading === false &&
            activeOrCompleted === "active" &&
            activeWatchlist.length === 0 &&
            wagerSort === "AUCTIONS" ? (
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
            ) : null}
            {isLoading === false &&
            activeOrCompleted === "active" &&
            activeTournamentWatchlist.length === 0 &&
            wagerSort === "TOURNAMENTS" ? (
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
            ) : null}
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
            className={`w-full px-5 py-4 sm:px-6 ${
                index === 0 ? "" : "border-t-[1px] border-[#253747]"
            }`}
        >
            <div className="flex w-full items-center gap-6 rounded sm:py-3">
                <Link
                    href={`/auctions/car_view_page/${id}`}
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
                        href={`/auctions/car_view_page/${id}`}
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

const MyWagersDropdownMenu = () => {
    const router = useRouter();
    const [activeOrCompleted, setActiveOrCompleted] = useState("active");
    const [activeWagers, setActiveWagers] = useState([]);
    const [completedWagers, setCompletedWagers] = useState([]);
    const [activeTournamentWagers, setActiveTournamentWagers] = useState([]);
    const [completedTournamentWagers, setCompletedTournamentWagers] = useState(
        []
    );
    const [isLoading, setIsLoading] = useState(true);
    const words = ["ALL", "AUCTIONS", "TOURNAMENTS"];
    const [wagerSort, setWagerSort] = useState(words[0]);

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

                const completedTournaments = data.tournament_wagers.filter(
                    (wager: any) => {
                        const auctionDeadline = new Date(
                            wager.tournamentEndTime
                        );
                        return auctionDeadline < currentDate;
                    }
                );

                const activeTournaments = data.tournament_wagers.filter(
                    (wager: any) => {
                        const auctionDeadline = new Date(
                            wager.tournamentEndTime
                        );
                        return auctionDeadline >= currentDate;
                    }
                );

                setActiveWagers(active);
                setCompletedWagers(completed);
                setActiveTournamentWagers(activeTournaments);
                setCompletedTournamentWagers(completedTournaments);
            }
            setIsLoading(false);
        };
        fetchWagers();
    }, []);

    const handleClick = () => {
        const currentIndex = words.indexOf(wagerSort);
        const nextIndex = (currentIndex + 1) % words.length;
        setWagerSort(words[nextIndex]);
    };

    return (
        <div className="my-wagers-menu absolute right-[56px] top-10 z-30 max-h-[784px] w-[512px] overflow-auto rounded bg-[#1A2C3D] pb-2 pt-6 shadow-xl shadow-black">
            <div className="flex flex-col gap-4 px-6">
                <div className="flex justify-between">
                    <div className="text-left text-lg font-bold">MY WAGERS</div>
                    {(activeWagers.length !== 0 ||
                        completedWagers.length !== 0 ||
                        activeTournamentWagers.length !== 0 ||
                        completedTournamentWagers.length !== 0) && (
                        <button
                            id="myWagers-sort"
                            type="button"
                            className="text-white-900 w-[140px] truncate rounded-sm bg-[#172431] px-2 py-1.5 text-center shadow-sm hover:bg-[#0f1923]"
                            onClick={handleClick}
                        >
                            {wagerSort}
                        </button>
                    )}
                </div>
                <div className="flex">
                    <button
                        id="active-mywagers-button"
                        onClick={() => setActiveOrCompleted("active")}
                        className="flex w-1/2 items-center justify-center gap-2 border-b-2 border-[#314150] py-2 focus:border-white focus:font-bold"
                        autoFocus
                    >
                        <div>ACTIVE </div>
                        {!isLoading && (
                            <span className="rounded bg-[#f2ca16] px-1 text-sm font-bold text-[#0f1923]">
                                {activeWagers.length +
                                    activeTournamentWagers.length}
                            </span>
                        )}
                    </button>
                    <button
                        id="completed-mywagers-button"
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
            (activeWagers.length !== 0 ||
                activeTournamentWagers.length !== 0) ? (
                <div className="w-full">
                    {wagerSort !== "TOURNAMENTS" &&
                        activeWagers.map((wager: any, index: number) => (
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
                                        isActive={true}
                                        status={wager.auctionStatus}
                                        wagerAmount={wager.wagerAmount}
                                        objectID={wager.auctionObjectId}
                                        wagerID={wager._id}
                                        isRefunded={wager.refunded}
                                        prize={wager.prize}
                                        deadline={wager.auctionDeadline}
                                        index={index}
                                    />
                                </TimerProvider>
                            </div>
                        ))}
                    {wagerSort !== "AUCTIONS" &&
                        activeTournamentWagers.map((wager: any) => {
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
                        })}
                </div>
            ) : null}
            {activeOrCompleted === "completed" &&
            (completedWagers.length !== 0 ||
                completedTournamentWagers.length !== 0) ? (
                <div className="w-full">
                    {wagerSort !== "TOURNAMENTS" &&
                        completedWagers.map((wager: any, index: number) => (
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
                                        isActive={false}
                                        status={wager.auctionStatus}
                                        wagerAmount={wager.wagerAmount}
                                        objectID={wager.auctionObjectId}
                                        wagerID={wager._id}
                                        isRefunded={wager.refunded}
                                        prize={wager.prize}
                                        deadline={wager.auctionDeadline}
                                        index={index}
                                    />
                                </TimerProvider>
                            </div>
                        ))}
                    {wagerSort !== "AUCTIONS" &&
                        completedTournamentWagers.map((wager: any) => {
                            return (
                                <div key={wager._id}>
                                    <TimerProvider
                                        deadline={wager.tournamentEndTime}
                                    >
                                        <MyWagersTournamentCard
                                            wager={wager}
                                            isActive={false}
                                        />
                                    </TimerProvider>
                                </div>
                            );
                        })}
                </div>
            ) : null}
            {isLoading === false &&
            activeOrCompleted === "active" &&
            activeWagers.length === 0 &&
            activeTournamentWagers.length === 0 ? (
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
            ) : null}
            {isLoading === false &&
            activeOrCompleted === "completed" &&
            completedWagers.length === 0 &&
            completedTournamentWagers.length === 0 ? (
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
            ) : null}
            {isLoading === false &&
            activeOrCompleted === "completed" &&
            completedWagers.length === 0 &&
            wagerSort === "AUCTIONS" ? (
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
            ) : null}
            {isLoading === false &&
            activeOrCompleted === "completed" &&
            completedTournamentWagers.length === 0 &&
            wagerSort === "TOURNAMENTS" ? (
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
            ) : null}
            {isLoading === false &&
            activeOrCompleted === "active" &&
            activeWagers.length === 0 &&
            wagerSort === "AUCTIONS" ? (
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
            ) : null}
            {isLoading === false &&
            activeOrCompleted === "active" &&
            activeTournamentWagers.length === 0 &&
            wagerSort === "TOURNAMENTS" ? (
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
            ) : null}
        </div>
    );
};

export const MyWagersTournamentCard = ({ wager, isActive, closeMenu }: any) => {
    const { days, hours, minutes, seconds } = useTimer();
    const [prize, setPrize] = useState(0);
    const [pointsAndPlacing, setPointsAndPlacing] = useState<{
        placing: number;
        totalScore: number;
    }>({ placing: 0, totalScore: 0 });
    let formattedDateString;
    if (wager.tournamentEndTime) {
        formattedDateString = new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        }).format(new Date(wager.tournamentEndTime));
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
                wager._id,
                wager.user._id
            );
            setPointsAndPlacing(data);
        };

        fetchTotalPointsAndPlacing();
    }, []);

    useEffect(() => {
        const fetchPrize = async () => {
            const transactions = await getTournamentTransactions(wager._id);

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
                    href={`/tournaments/${wager._id}`}
                    className="grid w-[50px] grid-cols-2 gap-[2px] pt-2 sm:w-[100px] sm:p-0"
                    onClick={() => closeMenu && closeMenu()}
                >
                    {wager.tournamentImages
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
                        href={`/tournaments/${wager._id}`}
                        className="self-start"
                        onClick={() => closeMenu && closeMenu()}
                    >
                        <div
                            className={`line-clamp-1 w-full text-left text-base font-bold sm:text-lg ${
                                isActive ? "sm:mt-[14px]" : "sm:mt-[5px]"
                            }`}
                        >
                            {wager.tournamentTitle}
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
                        {wager.prize && (
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
                                    {wager.prize % 1 === 0
                                        ? wager.prize.toLocaleString()
                                        : wager.prize.toLocaleString(
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

interface MyWagersCardProps {
    title: string;
    img: string;
    my_wager: number;
    current_bid: number;
    time_left: Date;
    potential_prize: number;
    id: string;
    isActive: boolean;
    status: number;
    wagerAmount: number;
    objectID: string;
    wagerID: string;
    isRefunded: boolean;
    closeMenu?: () => void;
    prize?: number;
    deadline: Date;
    index?: number;
}
export const MyWagersCard: React.FC<MyWagersCardProps> = ({
    title,
    img,
    my_wager,
    current_bid,
    time_left,
    potential_prize,
    id,
    isActive,
    status,
    wagerAmount,
    objectID,
    wagerID,
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
            className={`w-full px-5 py-4 sm:px-6 ${
                index === 0 ? "" : "border-t-[1px] border-[#253747]"
            }`}
        >
            <div className="flex w-full items-center gap-6 rounded sm:py-3">
                <Link
                    href={`/auctions/car_view_page/${id}`}
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
                        href={`/auctions/car_view_page/${id}`}
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
                            <span className="opacity-80">My Wager:</span>
                            <span className="font-bold text-[#F2CA16]">
                                ${new Intl.NumberFormat().format(my_wager)}
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
                                ❌ AUCTION WAGER
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
                                    Wager Amount:
                                </span>
                                <span className="font-bold text-[#f92f60]">
                                    $
                                    {new Intl.NumberFormat().format(
                                        wagerAmount
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
                                            handleRefund(objectID, wagerID)
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
            await signOut({ redirect: false });
            router.push("/");
            console.log("User successfully logged out");
        } catch (error) {
            console.error("Error during sign out:", error);
        }
    };

    return (
        <div className="absolute right-0 top-8 z-10 flex h-auto w-[320px] flex-col items-start gap-4 rounded bg-[#1A2C3D] py-6 shadow-xl shadow-black">
            <div className="px-6 text-lg font-bold">MY ACCOUNT</div>
            {isLoading ? (
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
            )}
            <div className="flex w-full flex-col items-start px-6">
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
                    onClick={handleSignOut}
                    className="w-full rounded p-2 text-left hover:bg-white/5"
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
            className="absolute left-0 right-0 top-10 z-10 max-h-[344px] overflow-y-scroll rounded-b border-t-[1px] border-t-[#1b252e] bg-shade-100 px-1 sm:bg-shade-50"
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
                            className="p-2 hover:cursor-pointer hover:rounded hover:bg-shade-25"
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

interface MobileMyWatchlistProps {
    closeMenu: () => void;
}

const MobileMyWatchlist: React.FC<MobileMyWatchlistProps> = ({ closeMenu }) => {
    const router = useRouter();
    const [activeOrCompleted, setActiveOrCompleted] = useState("active");
    const [activeWatchlist, setActiveWatchlist] = useState([]);
    const [completedWatchlist, setCompletedWatchlist] = useState([]);
    const [activeTournamentWatchlist, setActiveTournamentWatchlist] = useState(
        []
    );
    const [completedTournamentWatchlist, setCompletedTournamentWatchlist] =
        useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const words = ["ALL", "AUCTIONS", "TOURNAMENTS"];
    const [wagerSort, setWagerSort] = useState(words[0]);

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
                const completedTournaments = data.tournament_watchlist.filter(
                    (watchlist: any) => {
                        const auctionDeadline = new Date(watchlist.endTime);
                        return auctionDeadline < currentDate;
                    }
                );

                const activeTournaments = data.tournament_watchlist.filter(
                    (watchlist: any) => {
                        const auctionDeadline = new Date(watchlist.endTime);
                        return auctionDeadline >= currentDate;
                    }
                );

                setActiveWatchlist(active);
                setCompletedWatchlist(completed);
                setActiveTournamentWatchlist(activeTournaments);
                setCompletedTournamentWatchlist(completedTournaments);
            }
            setIsLoading(false);
        };
        fetchWatchlist();
    }, []);

    const handleClick = () => {
        const currentIndex = words.indexOf(wagerSort);
        const nextIndex = (currentIndex + 1) % words.length;
        setWagerSort(words[nextIndex]);
    };

    return (
        <div className="relative">
            {(activeWatchlist.length !== 0 ||
                completedWatchlist.length !== 0 ||
                activeTournamentWatchlist.length !== 0 ||
                completedTournamentWatchlist.length !== 0) && (
                <button
                    id="myWatchlist-sort"
                    type="button"
                    className="text-white-900 absolute -top-[34px] right-0 w-[110px] rounded-sm bg-[#172431] px-2 py-1.5 text-center text-[12px] font-bold"
                    onClick={handleClick}
                >
                    {wagerSort}
                </button>
            )}
            <div className="flex">
                <button
                    autoFocus
                    onClick={() => setActiveOrCompleted("active")}
                    className="w-1/2 border-b-2 border-[#314150] py-2 text-center text-sm focus:border-white focus:font-bold"
                >
                    ACTIVE
                    {!isLoading && (
                        <span className="ml-1 rounded bg-[#f2ca16] px-1 text-xs font-bold text-[#0f1923]">
                            {activeWatchlist.length +
                                activeTournamentWatchlist.length}
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
                (activeWatchlist.length !== 0 ||
                    activeTournamentWatchlist.length !== 0) ? (
                    <div className="w-full">
                        {wagerSort !== "TOURNAMENTS" &&
                            activeWatchlist.map(
                                (watchlist: any, index: number) => (
                                    <div key={watchlist._id}>
                                        <TimerProvider
                                            deadline={watchlist.auctionDeadline}
                                        >
                                            <MyWatchlistCard
                                                title={`${watchlist.auctionYear} ${watchlist.auctionMake} ${watchlist.auctionModel}`}
                                                img={watchlist.auctionImage}
                                                current_bid={
                                                    watchlist.auctionPrice
                                                }
                                                time_left={
                                                    watchlist.auctionDeadline
                                                }
                                                id={
                                                    watchlist.auctionIdentifierId
                                                }
                                                isActive={true}
                                                closeMenu={closeMenu}
                                                index={index}
                                            />
                                        </TimerProvider>
                                    </div>
                                )
                            )}
                        {wagerSort !== "AUCTIONS" &&
                            activeTournamentWatchlist.map((watchlist: any) => {
                                return (
                                    <div key={watchlist._id}>
                                        <TimerProvider
                                            deadline={watchlist.endTime}
                                        >
                                            <MyWatchlistTournamentCard
                                                watchlist={watchlist}
                                                isActive={true}
                                                closeMenu={closeMenu}
                                            />
                                        </TimerProvider>
                                    </div>
                                );
                            })}
                    </div>
                ) : null}
                {activeOrCompleted === "completed" &&
                (completedWatchlist.length !== 0 ||
                    completedTournamentWatchlist.length !== 0) ? (
                    <div className="w-full">
                        {wagerSort !== "TOURNAMENTS" &&
                            completedWatchlist.map(
                                (watchlist: any, index: number) => (
                                    <div key={watchlist._id}>
                                        <TimerProvider
                                            deadline={watchlist.auctionDeadline}
                                        >
                                            <MyWatchlistCard
                                                title={`${watchlist.auctionYear} ${watchlist.auctionMake} ${watchlist.auctionModel}`}
                                                img={watchlist.auctionImage}
                                                current_bid={
                                                    watchlist.auctionPrice
                                                }
                                                id={
                                                    watchlist.auctionIdentifierId
                                                }
                                                time_left={
                                                    watchlist.auctionDeadline
                                                }
                                                isActive={false}
                                                closeMenu={closeMenu}
                                                index={index}
                                            />
                                        </TimerProvider>
                                    </div>
                                )
                            )}
                        {wagerSort !== "AUCTIONS" &&
                            completedTournamentWatchlist.map(
                                (watchlist: any) => {
                                    return (
                                        <div key={watchlist._id}>
                                            <TimerProvider
                                                deadline={watchlist.endTime}
                                            >
                                                <MyWatchlistTournamentCard
                                                    watchlist={watchlist}
                                                    isActive={false}
                                                    closeMenu={closeMenu}
                                                />
                                            </TimerProvider>
                                        </div>
                                    );
                                }
                            )}
                    </div>
                ) : null}
                {isLoading === false &&
                activeOrCompleted === "active" &&
                activeWatchlist.length === 0 &&
                activeTournamentWatchlist.length === 0 ? (
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
                ) : null}
                {isLoading === false &&
                activeOrCompleted === "completed" &&
                completedWatchlist.length === 0 &&
                completedTournamentWatchlist.length === 0 ? (
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
                ) : null}
                {isLoading === false &&
                activeOrCompleted === "completed" &&
                completedWatchlist.length === 0 &&
                wagerSort === "AUCTIONS" ? (
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
                ) : null}
                {isLoading === false &&
                activeOrCompleted === "completed" &&
                completedTournamentWatchlist.length === 0 &&
                wagerSort === "TOURNAMENTS" ? (
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
                ) : null}
                {isLoading === false &&
                activeOrCompleted === "active" &&
                activeWatchlist.length === 0 &&
                wagerSort === "AUCTIONS" ? (
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
                ) : null}
                {isLoading === false &&
                activeOrCompleted === "active" &&
                activeTournamentWatchlist.length === 0 &&
                wagerSort === "TOURNAMENTS" ? (
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
                ) : null}
            </div>
        </div>
    );
};

const MobileMyWagers: React.FC<MobileMyWatchlistProps> = ({ closeMenu }) => {
    const router = useRouter();
    const [activeOrCompleted, setActiveOrCompleted] = useState("active");
    const [activeWagers, setActiveWagers] = useState([]);
    const [completedWagers, setCompletedWagers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTournamentWagers, setActiveTournamentWagers] = useState([]);
    const [completedTournamentWagers, setCompletedTournamentWagers] = useState(
        []
    );
    const words = ["ALL", "AUCTIONS", "TOURNAMENTS"];
    const [wagerSort, setWagerSort] = useState(words[0]);

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

                const completedTournaments = data.tournament_wagers.filter(
                    (wager: any) => {
                        const auctionDeadline = new Date(
                            wager.tournamentEndTime
                        );
                        return auctionDeadline < currentDate;
                    }
                );

                const activeTournaments = data.tournament_wagers.filter(
                    (wager: any) => {
                        const auctionDeadline = new Date(
                            wager.tournamentEndTime
                        );
                        return auctionDeadline >= currentDate;
                    }
                );

                setActiveWagers(active);
                setCompletedWagers(completed);
                setActiveTournamentWagers(activeTournaments);
                setCompletedTournamentWagers(completedTournaments);
            }
            setIsLoading(false);
        };
        fetchWagers();
    }, []);

    const handleClick = () => {
        const currentIndex = words.indexOf(wagerSort);
        const nextIndex = (currentIndex + 1) % words.length;
        setWagerSort(words[nextIndex]);
    };

    return (
        <div className="relative">
            {(activeWagers.length !== 0 ||
                completedWagers.length !== 0 ||
                activeTournamentWagers.length !== 0 ||
                completedTournamentWagers.length !== 0) && (
                <button
                    id="myWatchlist-sort"
                    type="button"
                    className="text-white-900 absolute -top-[34px] right-0 w-[110px] rounded-sm bg-[#172431] px-2 py-1.5 text-center text-[12px] font-bold"
                    onClick={handleClick}
                >
                    {wagerSort}
                </button>
            )}
            <div className="flex">
                <button
                    autoFocus
                    onClick={() => setActiveOrCompleted("active")}
                    className="w-1/2 border-b-2 border-[#314150] py-2 text-center text-sm focus:border-white focus:font-bold"
                >
                    ACTIVE
                    {!isLoading && (
                        <span className="ml-1 rounded bg-[#f2ca16] px-1 text-xs font-bold text-[#0f1923]">
                            {activeWagers.length +
                                activeTournamentWagers.length}
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
                (activeWagers.length !== 0 ||
                    activeTournamentWagers.length !== 0) ? (
                    <div className="w-full">
                        {wagerSort !== "TOURNAMENTS" &&
                            activeWagers.map((wager: any, index: number) => (
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
                                            closeMenu={closeMenu}
                                            prize={wager.prize}
                                            deadline={wager.auctionDeadline}
                                            index={index}
                                        />
                                    </TimerProvider>
                                </div>
                            ))}
                        {wagerSort !== "AUCTIONS" &&
                            activeTournamentWagers.map((wager: any) => {
                                return (
                                    <div key={wager._id}>
                                        <TimerProvider
                                            deadline={wager.tournamentEndTime}
                                        >
                                            <MyWagersTournamentCard
                                                wager={wager}
                                                isActive={true}
                                                closeMenu={closeMenu}
                                            />
                                        </TimerProvider>
                                    </div>
                                );
                            })}
                    </div>
                ) : null}

                {activeOrCompleted === "completed" &&
                (completedWagers.length !== 0 ||
                    completedTournamentWagers.length !== 0) ? (
                    <div className="w-full">
                        {wagerSort !== "TOURNAMENTS" &&
                            completedWagers.map((wager: any, index: number) => (
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
                                            isActive={false}
                                            status={wager.auctionStatus}
                                            wagerAmount={wager.wagerAmount}
                                            objectID={wager.auctionObjectId}
                                            wagerID={wager._id}
                                            isRefunded={wager.refunded}
                                            closeMenu={closeMenu}
                                            prize={wager.prize}
                                            deadline={wager.auctionDeadline}
                                            index={index}
                                        />
                                    </TimerProvider>
                                </div>
                            ))}
                        {wagerSort !== "AUCTIONS" &&
                            completedTournamentWagers.map((wager: any) => {
                                return (
                                    <div key={wager._id}>
                                        <TimerProvider
                                            deadline={wager.tournamentEndTime}
                                        >
                                            <MyWagersTournamentCard
                                                wager={wager}
                                                isActive={false}
                                                closeMenu={closeMenu}
                                            />
                                        </TimerProvider>
                                    </div>
                                );
                            })}
                    </div>
                ) : null}
                {isLoading === false &&
                activeOrCompleted === "active" &&
                activeWagers.length === 0 &&
                activeTournamentWagers.length === 0 ? (
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
                ) : null}
                {isLoading === false &&
                activeOrCompleted === "completed" &&
                completedWagers.length === 0 &&
                completedTournamentWagers.length === 0 ? (
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
                ) : null}
                {isLoading === false &&
                activeOrCompleted === "completed" &&
                completedWagers.length === 0 &&
                wagerSort === "AUCTIONS" ? (
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
                ) : null}
                {isLoading === false &&
                activeOrCompleted === "completed" &&
                completedTournamentWagers.length === 0 &&
                wagerSort === "TOURNAMENTS" ? (
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
                ) : null}
                {isLoading === false &&
                activeOrCompleted === "active" &&
                activeWagers.length === 0 &&
                wagerSort === "AUCTIONS" ? (
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
                ) : null}
                {isLoading === false &&
                activeOrCompleted === "active" &&
                activeTournamentWagers.length === 0 &&
                wagerSort === "TOURNAMENTS" ? (
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
                ) : null}
            </div>
        </div>
    );
};
