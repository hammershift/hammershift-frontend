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

      const claimRefundButtons = document.getElementsByClassName(
        "claim-button"
      ) as HTMLCollectionOf<HTMLElement>;

      const isClaimButtonClicked = Array.from(claimRefundButtons).some(
        (button) => button.contains(e.target as Node)
      );

      if (isClaimButtonClicked) {
        setDropMyWagers(true);
      }

      if (myAccountButton && !myAccountButton.contains(e.target as Node)) {
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
      const response = await fetch(`/api/cars/filter?search=${searchKeyword}`);
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
    const response = await fetch(`/api/cars/filter?search=${searchKeyword}`);
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
    <div>
      {isLoggedIn ? (
        <div className=" tw-flex tw-px-4 md:tw-px-16 tw-w-full tw-justify-between tw-py-3 tw-border-b-[1px] tw-border-b-[#1b252e]">
          <div className=" tw-flex tw-items-center tw-justify-between">
            <div className="tw-pr-4">
              <Link
                onClick={() => {
                  closeMenu();
                  closeMyAccountMenu();
                  closeNavLinkDropDownMenu();
                  document.body.classList.remove("stop-scrolling");
                }}
                href="/"
              >
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
            <Link
              onClick={() => {
                closeMenu();
                closeMyAccountMenu();
                closeNavLinkDropDownMenu();
                document.body.classList.remove("stop-scrolling");
              }}
              href="/live"
            >
              <div
                className={`tw-block tw-mx-4 sm:tw-mx-4 ${
                  pathname === "/live" && "tw-font-bold tw-border-b-2"
                }`}
              >
                LIVE
              </div>
            </Link>
            {/* <Link
              onClick={() => {
                closeMenu();
                closeMyAccountMenu();
                document.body.classList.remove("stop-scrolling");
              }}
              href="/discover"
            >
              <div
                className={`tw-block tw-mx-2 sm:tw-mx-2 ${
                  pathname === "/discover" && "tw-font-bold tw-border-b-2"
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
                className={`tw-block tw-mx-2 sm:tw-mx-2 ${
                  pathname === "/auctions" && "tw-font-bold tw-border-b-2"
                }`}
              >
                AUCTIONS
              </div>
            </Link> */}
            <Link
              onClick={() => {
                closeMenu();
                closeMyAccountMenu();
                closeNavLinkDropDownMenu();
                document.body.classList.remove("stop-scrolling");
              }}
              href="/tournaments"
            >
              <div
                className={`tw-block tw-mx-4 sm:tw-mx-4 max-sm:tw-hidden ${
                  pathname === "/tournaments" && "tw-font-bold tw-border-b-2"
                }`}
              >
                TOURNAMENTS
              </div>
            </Link>
            <div>
              <div className="tw-flex">
                <Link
                  onClick={() => {
                    closeMenu();
                    closeMyAccountMenu();
                    closeNavLinkDropDownMenu();
                    document.body.classList.remove("stop-scrolling");
                  }}
                  href="/discover"
                >
                  <div
                    className={`tw-block tw-mx-4 sm:tw-mx-4 max-sm:tw-hidden ${
                      pathname === "/discover" && "tw-font-bold tw-border-b-2"
                    }`}
                  >
                    EXPLORE
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => setNavlinkIsOpen(!navlinkIsOpen)}
                  id="options-menu"
                >
                  <Image src={ArrowDown} alt="arrow-down" width={18}></Image>
                </button>
                {navlinkIsOpen && (
                  <div className="tw-absolute tw-z-30 tw-left-[580px] tw-top-16 tw-w-auto tw-max-h-[784px] tw-overflow-auto tw-bg-[#1A2C3D] tw-rounded tw-pt-2 tw-p-2 tw-shadow-xl tw-shadow-black">
                    <div
                      className="tw-flex tw-flex-col tw-px-1 tw-gap-2"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="options-menu"
                    >
                      <Link
                        href="/auctions"
                        onClick={() => {
                          closeMenu();
                          closeMyAccountMenu();
                          closeNavLinkDropDownMenu();
                          document.body.classList.remove("stop-scrolling");
                        }}
                        className="tw-p-1.5 hover:tw-bg-white/5 tw-w-full"
                        role="menuitem"
                      >
                        AUCTIONS
                      </Link>
                      <Link
                        href="/about_page"
                        onClick={() => {
                          closeMenu();
                          closeMyAccountMenu();
                          closeNavLinkDropDownMenu();
                          document.body.classList.remove("stop-scrolling");
                        }}
                        className="tw-p-1.5 hover:tw-bg-white/5 tw-w-full"
                        role="menuitem"
                      >
                        ABOUT
                      </Link>
                      <Link
                        href="/leaderboard"
                        onClick={() => {
                          closeMenu();
                          closeMyAccountMenu();
                          closeNavLinkDropDownMenu();
                          document.body.classList.remove("stop-scrolling");
                        }}
                        className="tw-p-1.5 hover:tw-bg-white/5 tw-w-full"
                        role="menuitem"
                      >
                        LEADERBOARD
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
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
                    ? "tw-bg-shade-50 tw-flex tw-py-2 tw-px-3 tw-grow tw-rounded-t"
                    : "tw-bg-shade-50 tw-flex tw-py-2 tw-px-3 tw-grow tw-rounded"
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
                {showClearSearchButton && (
                  <Image
                    src={CloseIcon}
                    width={25}
                    height={25}
                    alt="magnifying glass"
                    className="tw-w-[] tw-h-auto tw-cursor-pointer"
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
              onClick={() => {
                setMyAccountMenuOpen((prev) => !prev);
                setMenuIsOpen(false);
                document.body.classList.remove("stop-scrolling");
              }}
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
            <button
              onClick={() => {
                setMenuIsOpen((prev) => !prev);
                setMyAccountMenuOpen(false);
                if (!menuIsOpen) {
                  document.body.classList.add("stop-scrolling");
                } else {
                  document.body.classList.remove("stop-scrolling");
                }
              }}
            >
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
        <div className=" tw-flex tw-px-4 md:tw-px-16 2xl:tw-px-36 tw-w-full tw-justify-between tw-py-3 tw-border-b-[1px] tw-border-b-[#1b252e]">
          <div className=" tw-flex tw-items-center tw-justify-between">
            <div className="tw-pr-4">
              <Link
                onClick={() => {
                  closeMenu();
                  closeMyAccountMenu();
                  closeNavLinkDropDownMenu();
                  document.body.classList.remove("stop-scrolling");
                }}
                href="/"
              >
                <Image
                  src={Logo}
                  width={176}
                  height={64}
                  alt="logo"
                  className="tw-block tw-w-auto tw-h-auto"
                />
              </Link>
            </div>
            <Link
              onClick={() => {
                closeMenu();
                closeMyAccountMenu();
                closeNavLinkDropDownMenu();
                document.body.classList.remove("stop-scrolling");
              }}
              href="/live"
            >
              <div
                className={`tw-block tw-mx-4 sm:tw-mx-4 ${
                  pathname === "/live" && "tw-font-bold tw-border-b-2"
                }`}
              >
                LIVE
              </div>
            </Link>
            {/* <Link
              onClick={() => {
                closeMenu();
                closeMyAccountMenu();
                document.body.classList.remove("stop-scrolling");
              }}
              href="/discover"
            >
              <div
                className={`tw-block tw-mx-2 sm:tw-mx-2 ${
                  pathname === "/discover" && "tw-font-bold tw-border-b-2"
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
                className={`tw-block tw-mx-2 sm:tw-mx-2 ${
                  pathname === "/auctions" && "tw-font-bold tw-border-b-2"
                }`}
              >
                AUCTIONS
              </div>
            </Link> */}
            <Link
              onClick={() => {
                closeMenu();
                closeMyAccountMenu();
                closeNavLinkDropDownMenu();
                document.body.classList.remove("stop-scrolling");
              }}
              href="/tournaments"
            >
              <div
                className={`tw-block tw-mx-4 sm:tw-mx-4 max-sm:tw-hidden ${
                  pathname === "/tournaments" && "tw-font-bold tw-border-b-2"
                }`}
              >
                TOURNAMENTS
              </div>
            </Link>
            <div>
              <div className="tw-flex">
                <Link
                  onClick={() => {
                    closeMenu();
                    closeMyAccountMenu();
                    closeNavLinkDropDownMenu();
                    document.body.classList.remove("stop-scrolling");
                  }}
                  href="/discover"
                >
                  <div
                    className={`tw-block tw-mx-4 sm:tw-mx-4 max-sm:tw-hidden ${
                      pathname === "/discover" && "tw-font-bold tw-border-b-2"
                    }`}
                  >
                    EXPLORE
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => setNavlinkIsOpen(!navlinkIsOpen)}
                  id="options-menu"
                >
                  <Image src={ArrowDown} alt="arrow-down" width={18}></Image>
                </button>
                {navlinkIsOpen && (
                  <div className="tw-absolute tw-z-30 tw-left-[580px] tw-top-16 tw-w-auto tw-max-h-[784px] tw-overflow-auto tw-bg-[#1A2C3D] tw-rounded tw-pt-2 tw-p-2 tw-shadow-xl tw-shadow-black">
                    <div
                      className="tw-flex tw-flex-col tw-px-1 tw-gap-2"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="options-menu"
                    >
                      <Link
                        href="/auctions"
                        onClick={() => {
                          closeMenu();
                          closeMyAccountMenu();
                          closeNavLinkDropDownMenu();
                          document.body.classList.remove("stop-scrolling");
                        }}
                        className="tw-p-1.5 hover:tw-bg-white/5 tw-w-full"
                        role="menuitem"
                      >
                        AUCTIONS
                      </Link>
                      <Link
                        href="/about_page"
                        onClick={() => {
                          closeMenu();
                          closeMyAccountMenu();
                          closeNavLinkDropDownMenu();
                          document.body.classList.remove("stop-scrolling");
                        }}
                        className="tw-p-1.5 hover:tw-bg-white/5 tw-w-full"
                        role="menuitem"
                      >
                        ABOUT
                      </Link>
                      <Link
                        href="/leaderboard"
                        onClick={() => {
                          closeMenu();
                          closeMyAccountMenu();
                          closeNavLinkDropDownMenu();
                          document.body.classList.remove("stop-scrolling");
                        }}
                        className="tw-p-1.5 hover:tw-bg-white/5 tw-w-full"
                        role="menuitem"
                      >
                        LEADERBOARD
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
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
                {showClearSearchButton && (
                  <Image
                    src={CloseIcon}
                    width={25}
                    height={25}
                    alt="magnifying glass"
                    className="tw-w-[] tw-h-auto tw-cursor-pointer"
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
          </div>
          <div className="tw-flex tw-items-center">
            <Link href="/create_account">
              <button className="btn-white  hover:tw-bg-gold-200 tw-hidden md:tw-block ">
                CREATE ACCOUNT
              </button>
            </Link>
            <button
              onClick={() => {
                setMenuIsOpen((prev) => !prev);
                setMyAccountMenuOpen(false);
                if (!menuIsOpen) {
                  document.body.classList.add("stop-scrolling");
                } else {
                  document.body.classList.remove("stop-scrolling");
                }
              }}
            >
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
    <div className="drop-down-custom-height slide-in-top tw-absolute tw-z-50 tw-flex-col tw-text-white tw-bg-[#0F1923] tw-p-4 tw-w-full ">
      <div className="tw-relative">
        <div className="tw-flex tw-justify-evenly tw-py-2 tw-w-full tw-min-w-auto">
          <Link
            href="/tournaments"
            className="tw-ml-4 md:tw-ml-9 tw-text-sm"
            onClick={closeMenu}
          >
            TOURNAMENTS
          </Link>
          <Link
            href="/about_page"
            className="tw-ml-4 md:tw-ml-9 tw-text-sm"
            onClick={closeMenu}
          >
            ABOUT
          </Link>
          {/* <Link href="/" className="tw-ml-4 md:tw-ml-9">
            HOW IT WORKS
          </Link> */}
          <Link
            href="/leaderboard"
            className="tw-ml-4 md:tw-ml-9 tw-text-sm"
            onClick={closeMenu}
          >
            LEADERBOARD
          </Link>
        </div>
        <form
          autoComplete="off"
          onSubmit={handleSubmit}
          className="tw-bg-shade-100 tw-flex tw-justify-between tw-p-2 tw-rounded tw-my-4"
        >
          <div className="tw-flex tw-w-full">
            <Image
              src={MagnifyingGlass}
              width={15}
              height={15}
              alt="magnifying glass"
              className="tw-w-auto tw-h-auto"
            />
            <input
              id="dropdown-search-bar"
              className="tw-ml-2 tw-bg-shade-100 tw-outline-none tw-w-full"
              placeholder="Search make, model, year..."
              name="search"
              type="text"
              onChange={handleChange}
              onClick={() => {
                setSearchBoxDropDown(true);
              }}
            ></input>
          </div>
          {showClearSearchButton && (
            <Image
              src={CloseIcon}
              width={20}
              height={20}
              alt="magnifying glass"
              className="tw-h-auto tw-cursor-pointer"
              onClick={clearSearchInputs}
            />
          )}
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
          {/* <Link
            href="/live"
            onClick={() => {
              closeMenu();
              document.body.classList.remove("stop-scrolling");
            }}
            className="tw-flex tw-py-2"
          >
            <div>LIVE</div>
          </Link> */}
          <Link
            href="/auctions"
            onClick={() => {
              closeMenu();
              document.body.classList.remove("stop-scrolling");
            }}
            className="tw-flex tw-py-2"
          >
            <div>AUCTIONS</div>
          </Link>
          <Link
            href="/tournaments"
            onClick={() => {
              closeMenu();
              document.body.classList.remove("stop-scrolling");
            }}
            className="tw-flex tw-py-2"
          >
            <div>TOURNAMENTS</div>
          </Link>
          <Link
            href="/about_page"
            onClick={() => {
              closeMenu();
              document.body.classList.remove("stop-scrolling");
            }}
            className="tw-flex tw-py-2"
          >
            <div>ABOUT</div>
          </Link>
          <Link
            href="/leaderboard"
            onClick={() => {
              closeMenu();
              document.body.classList.remove("stop-scrolling");
            }}
            className="tw-flex tw-py-2"
          >
            <div>LEADERBOARD</div>
          </Link>
        </>
      ) : (
        <>
          <button
            onClick={() => setDropWatchlistOrWagers("watchlist")}
            className={`tw-flex tw-py-2 tw-w-full ${
              dropWatchlistOrWagers === "watchlist" && "tw-font-bold"
            }`}
          >
            <Image
              src={WatchlistIcon}
              width={24}
              height={24}
              alt="watchlist"
              className="tw-w-[24px] tw-h-[24px]"
            />
            <div className="tw-ml-4">MY WATCHLIST</div>
          </button>
          {dropWatchlistOrWagers === "watchlist" ? (
            <MobileMyWatchlist closeMenu={closeMenu} />
          ) : null}
          <button
            onClick={() => setDropWatchlistOrWagers("wagers")}
            className={`tw-flex tw-py-2 tw-w-full ${
              dropWatchlistOrWagers === "wagers" && "tw-font-bold"
            }`}
          >
            <Image
              src={WagersIcon}
              width={24}
              height={24}
              alt="watchlist"
              className="tw-w-[24px] tw-h-[24px]"
            />
            <div className="tw-ml-4">MY WAGERS</div>
          </button>
          {dropWatchlistOrWagers === "wagers" ? (
            <MobileMyWagers closeMenu={closeMenu} />
          ) : null}
        </>
      )}
      <div className="tw-mt-4">
        {!isLoggedIn && (
          <button
            onClick={() => {
              router.push("/create_account");
              document.body.classList.remove("stop-scrolling");
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
            console.error("Failed to fetch wallet balance:", data.message);
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
    <div className="slide-in-top tw-absolute tw-z-30 tw-flex tw-flex-col tw-text-white tw-bg-[#1A2C3D] tw-p-4 tw-w-full tw-h-auto">
      <div className="tw-text-lg tw-font-bold tw-p-1.5">MY ACCOUNT</div>
      {isLoading ? (
        <div className="tw-px-6 tw-w-full tw-flex tw-justify-center tw-items-center">
          <BeatLoader color="#696969" size={10} />
        </div>
      ) : typeof walletBalance === "number" ? (
        <div className="tw-w-full">
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
                ${walletBalance.toFixed(2)}
              </span>
              <span className="tw-text-[#49C742]">Withdraw</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="tw-px-6 tw-w-full">Error fetching wallet balance</div>
      )}
      <Link
        href="/profile"
        className="tw-p-1.5 hover:tw-bg-white/5 tw-w-full"
        onClick={closeMyAccountMenu}
      >
        Profile
      </Link>
      <Link
        href="/profile"
        className="tw-p-1.5 hover:tw-bg-white/5 tw-w-full"
        onClick={closeMyAccountMenu}
      >
        Settings
      </Link>
      <button
        onClick={() => {
          handleSignOut();
          closeMyAccountMenu();
        }}
        className="tw-p-1.5 tw-text-left hover:tw-bg-white/5 tw-w-full"
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

  return (
    <div className="watchlist-menu tw-absolute tw-z-30 tw-right-[112px] tw-top-10 tw-w-[512px] tw-max-h-[784px] tw-overflow-auto tw-bg-[#1A2C3D] tw-rounded tw-pt-6 tw-pb-2 tw-shadow-xl tw-shadow-black">
      <div className="tw-px-6 tw-flex tw-flex-col tw-gap-4">
        <div className="tw-font-bold tw-text-lg tw-text-left">MY WATCHLIST</div>
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
                {activeWatchlist.length + activeTournamentWatchlist.length}
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
      {activeOrCompleted === "active" &&
      (activeWatchlist.length !== 0 ||
        activeTournamentWatchlist.length !== 0) ? (
        <div className="tw-w-full">
          {activeWatchlist.map((watchlist: any, index: number) => (
            <div key={watchlist._id}>
              <TimerProvider deadline={watchlist.auctionDeadline}>
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
          {activeTournamentWatchlist.map((watchlist: any) => {
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
        <div className="tw-w-full">
          {completedWatchlist.map((watchlist: any, index: number) => (
            <div key={watchlist._id}>
              <TimerProvider deadline={watchlist.auctionDeadline}>
                <MyWatchlistCard
                  title={`${watchlist.auctionYear} ${watchlist.auctionMake} ${watchlist.auctionModel}`}
                  img={watchlist.auctionImage}
                  current_bid={watchlist.auctionPrice}
                  id={watchlist.auctionIdentifierId}
                  time_left={watchlist.auctionDeadline}
                  isActive={false}
                  index={index}
                />
              </TimerProvider>
            </div>
          ))}
          {completedTournamentWatchlist.map((watchlist: any) => {
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
            <div className="tw-opacity-70 tw-text-center">
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
              No completed wagers
            </div>
            <div className="tw-opacity-70 tw-text-center">
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
      className={`sm:tw-px-6 tw-px-5 tw-w-full tw-py-4 tw-border-t-[1px] tw-border-[#253747]`}
    >
      <div className=" tw-w-full sm:tw-py-3 tw-rounded tw-flex tw-items-center tw-gap-6">
        <Link
          href={`/tournaments/${watchlist.tournamentID}`}
          className="tw-grid tw-gap-[2px] tw-grid-cols-2 sm:tw-w-[100px] tw-w-[50px] tw-pt-2 sm:tw-p-0"
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
                  className="tw-rounded tw-w-[24.5px] tw-h-[24.5px] sm:tw-h-[49px] sm:tw-w-[49px] tw-object-cover"
                />
              );
            })}
        </Link>
        <div className="tw-flex tw-flex-col tw-items-start sm:tw-max-w-[323px] tw-max-w-[230px]">
          <Link
            href={`/tournaments/${watchlist.tournamentID}`}
            className="tw-self-start"
            onClick={() => closeMenu && closeMenu()}
          >
            <div className="tw-w-full tw-font-bold sm:tw-text-lg tw-text-base sm:tw-py-1 tw-text-left tw-line-clamp-1">
              {watchlist.title}
            </div>
          </Link>
          {!isActive && (
            <div className="tw-text-xs sm:tw-mb-2 tw-opacity-80">
              Ended {formattedDateString}
            </div>
          )}
          <div className="tw-w-full tw-mt-1 tw-text-sm">
            {isActive && (
              <div className="tw-flex tw-items-center tw-gap-2 tw-w-full">
                <Image
                  src={Hourglass}
                  width={14}
                  height={14}
                  alt="wallet icon"
                  className="tw-w-[14px] tw-h-[14px]"
                />
                <span className="tw-opacity-80">Time Left:</span>
                {Number(days) < 1 ? (
                  <span className="tw-text-[#c2451e]">{`${days}:${hours}:${minutes}:${seconds}`}</span>
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
      className={`sm:tw-px-6 tw-px-5 tw-w-full tw-py-4 ${
        index === 0 ? "" : "tw-border-t-[1px] tw-border-[#253747]"
      }`}
    >
      <div className=" tw-w-full sm:tw-py-3 tw-rounded tw-flex tw-items-center tw-gap-6">
        <Link
          href={`/auctions/car_view_page/${id}`}
          onClick={() => closeMenu && closeMenu()}
          className="tw-self-start sm:tw-w-[100px] sm:tw-h-[100px] tw-w-[50px] tw-h-[50px] tw-pt-2 sm:tw-pt-0"
        >
          <Image
            src={img}
            width={100}
            height={100}
            alt="wallet icon"
            className="sm:tw-w-[100px] tw-w-[50px] tw-h-[50px] sm:tw-h-[100px] tw-object-cover tw-rounded-[4px]"
          />
        </Link>
        <div className="tw-flex tw-flex-col tw-items-start sm:tw-max-w-[323px] tw-max-w-[230px]">
          <Link
            href={`/auctions/car_view_page/${id}`}
            className="tw-self-start"
            onClick={() => closeMenu && closeMenu()}
          >
            <div className="tw-w-full tw-font-bold sm:tw-text-lg tw-text-base sm:tw-py-1 tw-text-left tw-line-clamp-1">
              {title}
            </div>
          </Link>
          {!isActive && (
            <div className="tw-text-xs sm:tw-mb-2 tw-opacity-80">
              Ended {formattedDateString}
            </div>
          )}
          <div className="tw-w-full tw-mt-1 tw-text-sm">
            {!isActive && (
              <div className="tw-flex tw-items-center tw-gap-2 tw-w-full">
                <Image
                  src={HammerIcon}
                  width={14}
                  height={14}
                  alt="wallet icon"
                  className="tw-w-[14px] tw-h-[14px]"
                />
                <span className="tw-opacity-80">Hammer Price:</span>
                <span className="tw-text-[#49C742] tw-font-bold">
                  ${new Intl.NumberFormat().format(current_bid)}
                </span>
              </div>
            )}
            {isActive && (
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
            )}
            {isActive && (
              <div className="tw-flex tw-items-center tw-gap-2 tw-w-full">
                <Image
                  src={Hourglass}
                  width={14}
                  height={14}
                  alt="wallet icon"
                  className="tw-w-[14px] tw-h-[14px]"
                />
                <span className="tw-opacity-80">Time Left:</span>
                {Number(days) < 1 ? (
                  <span className="tw-text-[#c2451e]">{`${days}:${hours}:${minutes}:${seconds}`}</span>
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
            const auctionDeadline = new Date(wager.tournamentEndTime);
            return auctionDeadline < currentDate;
          }
        );

        const activeTournaments = data.tournament_wagers.filter(
          (wager: any) => {
            const auctionDeadline = new Date(wager.tournamentEndTime);
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

  return (
    <div className="my-wagers-menu tw-absolute tw-z-30 tw-right-[56px] tw-top-10 tw-w-[512px] tw-max-h-[784px] tw-overflow-auto tw-bg-[#1A2C3D] tw-rounded tw-pt-6 tw-pb-2 tw-shadow-xl tw-shadow-black">
      <div className="tw-px-6 tw-flex tw-flex-col tw-gap-4">
        <div className="tw-font-bold tw-text-lg tw-text-left">MY WAGERS</div>
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
                {activeWagers.length + activeTournamentWagers.length}
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
        <div className="tw-pb-[66px] tw-pt-[74px] tw-flex tw-justify-center">
          <BounceLoader color="#696969" loading={true} />
        </div>
      )}
      {activeOrCompleted === "active" &&
      (activeWagers.length !== 0 || activeTournamentWagers.length !== 0) ? (
        <div className="tw-w-full">
          {activeWagers.map((wager: any, index: number) => (
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
          {activeTournamentWagers.map((wager: any) => {
            return (
              <div key={wager._id}>
                <TimerProvider deadline={wager.tournamentEndTime}>
                  <MyWagersTournamentCard wager={wager} isActive={true} />
                </TimerProvider>
              </div>
            );
          })}
        </div>
      ) : null}
      {activeOrCompleted === "completed" &&
      (completedWagers.length !== 0 ||
        completedTournamentWagers.length !== 0) ? (
        <div className="tw-w-full">
          {completedWagers.map((wager: any, index: number) => (
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
          {completedTournamentWagers.map((wager: any) => {
            return (
              <div key={wager._id}>
                <TimerProvider deadline={wager.tournamentEndTime}>
                  <MyWagersTournamentCard wager={wager} isActive={false} />
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
            <div className="tw-opacity-70 tw-text-center">
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
              No completed wagers
            </div>
            <div className="tw-opacity-70 tw-text-center">
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
      const data = await getUserPointsAndPlacing(wager._id, wager.user._id);
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
            (accumulator: any, currentValue: any) => accumulator + currentValue,
            0
          );
      setPrize(totalPrize);
    };
    fetchPrize();
  }, []);

  return (
    <div className="sm:tw-px-6 tw-px-5 tw-w-full tw-py-4 tw-border-t-[1px] tw-border-[#253747]">
      <div className=" tw-w-full sm:tw-py-3 tw-rounded tw-flex tw-items-start tw-gap-6">
        <Link
          href={`/tournaments/${wager._id}`}
          className="tw-grid tw-gap-[2px] tw-grid-cols-2 sm:tw-w-[100px] tw-w-[50px] tw-pt-2 sm:tw-p-0"
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
                  className="tw-rounded tw-w-[24.5px] tw-h-[24.5px] sm:tw-h-[49px] sm:tw-w-[49px] tw-object-cover"
                />
              );
            })}
        </Link>
        <div className="tw-flex tw-flex-col tw-items-start tw-grow tw-w-auto sm:tw-max-w-[323px] tw-max-w-[230px]">
          <Link
            href={`/tournaments/${wager._id}`}
            className="tw-self-start"
            onClick={() => closeMenu && closeMenu()}
          >
            <div
              className={`tw-w-full tw-font-bold sm:tw-text-lg tw-text-base tw-text-left tw-line-clamp-1 ${
                isActive ? "sm:tw-mt-[14px]" : "sm:tw-mt-[5px]"
              }`}
            >
              {wager.tournamentTitle}
            </div>
          </Link>
          {!isActive && (
            <div className="tw-text-xs sm:tw-mb-2 tw-opacity-80">
              Ended {formattedDateString}
            </div>
          )}
          <div className="tw-w-full tw-mt-1 tw-text-sm">
            <div className="tw-flex tw-items-center tw-gap-2">
              <Image
                src={PodiumIcon}
                width={14}
                height={14}
                alt="wallet icon"
                className="tw-w-[14px] tw-h-[14px]"
              />
              <span className="tw-opacity-80">Place:</span>
              <span className="tw-text-[#F2CA16] tw-font-bold">
                {isActive ? "Current: " : null}
                {pointsAndPlacing.placing
                  ? addNumberSuffix(pointsAndPlacing.placing)
                  : "-"}{" "}
                Place
              </span>
            </div>
            {!isActive && (
              <div className="tw-flex tw-items-center tw-gap-2">
                <Image
                  src={ThreeStars}
                  width={14}
                  height={14}
                  alt="wallet icon"
                  className="tw-w-[14px] tw-h-[14px]"
                />
                <span className="tw-opacity-80">Points:</span>{" "}
                {pointsAndPlacing.totalScore
                  ? new Intl.NumberFormat().format(pointsAndPlacing.totalScore)
                  : "-"}{" "}
                pts. away
              </div>
            )}
            {wager.prize && (
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
                  {wager.prize % 1 === 0
                    ? wager.prize.toLocaleString()
                    : wager.prize.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                  🎉
                </div>
              </div>
            )}
            {isActive && (
              <div className="tw-flex tw-items-center tw-gap-2">
                <Image
                  src={Hourglass}
                  width={14}
                  height={14}
                  alt="wallet icon"
                  className="tw-w-[14px] tw-h-[14px]"
                />
                <span className="tw-opacity-80">Time Left:</span>
                {Number(days) < 1 ? (
                  <span className="tw-text-[#c2451e]">{`${days}:${hours}:${minutes}:${seconds}`}</span>
                ) : (
                  <span className="">{`${days}:${hours}:${minutes}:${seconds}`}</span>
                )}
              </div>
            )}
          </div>
          {isActive && (
            <div className="sm:tw-mt-[30px] tw-mt-2 tw-w-full sm:tw-p-2 tw-p-1 tw-items-center tw-flex tw-justify-between sm:tw-gap-4 tw-bg-[#49C74233] tw-rounded sm:tw-text-sm tw-text-xs">
              <div className="tw-flex tw-gap-2 tw-items-center">
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
              </div>
              <div className="tw-text-[#49C742] tw-font-bold tw-text-left">
                {prize ? `$${new Intl.NumberFormat().format(prize)}` : " --"}
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
      const transactions = await getAuctionTransactions(objectID);

      const totalPrize =
        0.88 *
        transactions
          .map((transaction: any) => transaction.amount)
          .reduce(
            (accumulator: any, currentValue: any) => accumulator + currentValue,
            0
          );
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
      className={`sm:tw-px-6 tw-px-5 tw-w-full tw-py-4 ${
        index === 0 ? "" : "tw-border-t-[1px] tw-border-[#253747]"
      }`}
    >
      <div className=" tw-w-full sm:tw-py-3 tw-rounded tw-flex tw-items-center tw-gap-6">
        <Link
          href={`/auctions/car_view_page/${id}`}
          onClick={() => closeMenu && closeMenu()}
          className="tw-self-start sm:tw-w-[100px] sm:tw-h-[100px] tw-w-[50px] tw-h-[50px] sm:tw-pt-0 tw-pt-2"
        >
          <Image
            src={img}
            width={100}
            height={100}
            alt="wallet icon"
            className="sm:tw-w-[100px] tw-w-[50px] tw-h-[50px] sm:tw-h-[100px] tw-object-cover tw-rounded-[4px]"
          />
        </Link>
        <div className="tw-flex tw-flex-col tw-items-start tw-grow tw-w-auto sm:tw-max-w-[323px] tw-max-w-[230px]">
          <Link
            href={`/auctions/car_view_page/${id}`}
            onClick={() => closeMenu && closeMenu()}
            className="tw-self-start"
          >
            <div className="tw-w-full tw-font-bold sm:tw-text-lg tw-text-base tw-text-left tw-line-clamp-1">
              {title}
            </div>
          </Link>
          {status === 2 || status === 4 ? (
            <div className="tw-text-xs sm:tw-mb-2 tw-opacity-80">
              Ended {formattedDateString}
            </div>
          ) : null}
          <div className="tw-w-full tw-mt-1 tw-text-sm">
            <div className="tw-flex tw-items-center tw-gap-2">
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
            {prize ? (
              <div className="tw-flex tw-items-center tw-gap-2">
                <Image
                  src={HammerIcon}
                  width={14}
                  height={14}
                  alt="wallet icon"
                  className="tw-w-[14px] tw-h-[14px]"
                />
                <span className="tw-opacity-80">Hammer Price:</span>
                <span className="tw-text-[#49C742] tw-font-bold">
                  ${new Intl.NumberFormat().format(current_bid)}
                </span>
              </div>
            ) : (
              <div className="tw-flex tw-items-center tw-gap-2">
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
            )}

            {prize && (
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
            {isActive && (
              <div className="tw-flex tw-items-center tw-gap-2">
                <Image
                  src={Hourglass}
                  width={14}
                  height={14}
                  alt="wallet icon"
                  className="tw-w-[14px] tw-h-[14px]"
                />
                <span className="tw-opacity-80">Time Left:</span>
                {Number(days) < 1 ? (
                  <span className="tw-text-[#c2451e]">{`${days}:${hours}:${minutes}:${seconds}`}</span>
                ) : (
                  <span className="">{`${days}:${hours}:${minutes}:${seconds}`}</span>
                )}
              </div>
            )}
          </div>
          {isActive && (
            <div className="sm:tw-mt-4 tw-mt-2 tw-w-full sm:tw-p-2 tw-p-1 tw-items-center tw-flex tw-justify-between sm:tw-gap-4 tw-bg-[#49C74233] tw-rounded sm:tw-text-sm tw-text-xs">
              <div className="tw-flex tw-gap-2 tw-items-center">
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
              </div>
              <div className="tw-text-[#49C742] tw-font-bold tw-text-left">
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
          {status === 3 && (
            <>
              <div className="tw-flex tw-items-center tw-gap-2 tw-w-full tw-text-sm">
                <Image
                  src={Dollar}
                  width={14}
                  height={14}
                  alt="wallet icon"
                  className="tw-w-[14px] tw-h-[14px]"
                />
                <span className="tw-opacity-80">Wager Amount:</span>
                <span className="tw-text-[#f92f60] tw-font-bold">
                  ${new Intl.NumberFormat().format(wagerAmount)}
                </span>
              </div>
              <div className="sm:tw-mt-4 tw-mt-2 tw-w-full sm:tw-p-2 tw-p-1 tw-items-center tw-flex sm:tw-gap-4 tw-gap-2 tw-bg-[#4b2330] tw-rounded sm:tw-text-sm tw-text-xs">
                <div className="tw-text-[#f92f60] tw-font-bold tw-text-left tw-grow-[1]">
                  ❌ UNSUCCESSFUL{" "}
                  <span className="tw-hidden sm:tw-inline-block">AUCTION</span>
                </div>
                {refunded ? (
                  <button
                    disabled
                    className="tw-bg-[white] tw-text-[black] tw-text-[12px] tw-font-bold tw-text-left tw-px-2 tw-rounded-sm"
                  >
                    REFUNDED
                  </button>
                ) : (
                  <button
                    onClick={() => handleRefund(objectID, wagerID)}
                    className="claim-button hover:tw-bg-[#ebcb48] tw-bg-[#facc15] tw-text-[black] tw-text-[12px] tw-font-bold tw-text-left tw-px-2 tw-rounded-sm"
                  >
                    {loading && (
                      <div className="tw-px-[14px]">
                        <BeatLoader size={8} />
                      </div>
                    )}
                    <span className={`${loading && "tw-hidden"}`}>
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
            console.error("Failed to fetch wallet balance:", data.message);
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
    <div className="tw-absolute tw-z-10 tw-right-0 tw-top-8 tw-w-[320px] tw-h-auto tw-bg-[#1A2C3D] tw-rounded tw-py-6 tw-flex tw-flex-col tw-items-start tw-gap-4 tw-shadow-xl tw-shadow-black">
      <div className="tw-px-6 tw-font-bold tw-text-lg">MY ACCOUNT</div>
      {isLoading ? (
        <div className="tw-px-6 tw-w-full tw-flex tw-justify-center tw-items-center">
          <BeatLoader color="#696969" size={10} />
        </div>
      ) : typeof walletBalance === "number" ? (
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
                ${walletBalance.toFixed(2)}
              </span>
              <span className="tw-text-[#49C742]">Withdraw</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="tw-px-6 tw-w-full">Error fetching wallet balance</div>
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

  return (
    <div>
      <div className="tw-flex">
        <button
          autoFocus
          onClick={() => setActiveOrCompleted("active")}
          className="tw-py-2 tw-w-1/2 tw-text-center tw-text-sm tw-border-b-2 tw-border-[#314150] focus:tw-font-bold focus:tw-border-white"
        >
          ACTIVE
          {!isLoading && (
            <span className="tw-ml-1 tw-px-1 tw-text-xs tw-bg-[#f2ca16] tw-rounded tw-font-bold tw-text-[#0f1923]">
              {activeWatchlist.length + activeTournamentWatchlist.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveOrCompleted("completed")}
          className="tw-py-2 tw-w-1/2 tw-text-center tw-text-sm tw-border-b-2 tw-border-[#314150] focus:tw-font-bold focus:tw-border-white"
        >
          COMPLETED
        </button>
      </div>
      <div className="tw-mb-4 watchlist-custom-height tw-overflow-y-auto">
        {isLoading && (
          <div className="tw-pb-[50px] tw-pt-[74px] tw-flex tw-justify-center">
            <BounceLoader color="#696969" loading={true} />
          </div>
        )}
        {activeOrCompleted === "active" &&
        (activeWatchlist.length !== 0 ||
          activeTournamentWatchlist.length !== 0) ? (
          <div className="tw-w-full">
            {activeWatchlist.map((watchlist: any, index: number) => (
              <div key={watchlist._id}>
                <TimerProvider deadline={watchlist.auctionDeadline}>
                  <MyWatchlistCard
                    title={`${watchlist.auctionYear} ${watchlist.auctionMake} ${watchlist.auctionModel}`}
                    img={watchlist.auctionImage}
                    current_bid={watchlist.auctionPrice}
                    time_left={watchlist.auctionDeadline}
                    id={watchlist.auctionIdentifierId}
                    isActive={true}
                    closeMenu={closeMenu}
                    index={index}
                  />
                </TimerProvider>
              </div>
            ))}
            {activeTournamentWatchlist.map((watchlist: any) => {
              return (
                <div key={watchlist._id}>
                  <TimerProvider deadline={watchlist.endTime}>
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
          <div className="tw-w-full">
            {completedWatchlist.map((watchlist: any, index: number) => (
              <div key={watchlist._id}>
                <TimerProvider deadline={watchlist.auctionDeadline}>
                  <MyWatchlistCard
                    title={`${watchlist.auctionYear} ${watchlist.auctionMake} ${watchlist.auctionModel}`}
                    img={watchlist.auctionImage}
                    current_bid={watchlist.auctionPrice}
                    id={watchlist.auctionIdentifierId}
                    time_left={watchlist.auctionDeadline}
                    isActive={false}
                    closeMenu={closeMenu}
                    index={index}
                  />
                </TimerProvider>
              </div>
            ))}
            {completedTournamentWatchlist.map((watchlist: any) => {
              return (
                <div key={watchlist._id}>
                  <TimerProvider deadline={watchlist.endTime}>
                    <MyWatchlistTournamentCard
                      watchlist={watchlist}
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
        activeWatchlist.length === 0 &&
        activeTournamentWatchlist.length === 0 ? (
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
              <div className="tw-opacity-70 tw-text-center">
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
                No completed wagers
              </div>
              <div className="tw-opacity-70 tw-text-center">
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
            const auctionDeadline = new Date(wager.tournamentEndTime);
            return auctionDeadline < currentDate;
          }
        );

        const activeTournaments = data.tournament_wagers.filter(
          (wager: any) => {
            const auctionDeadline = new Date(wager.tournamentEndTime);
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

  return (
    <div>
      <div className="tw-flex">
        <button
          autoFocus
          onClick={() => setActiveOrCompleted("active")}
          className="tw-py-2 tw-w-1/2 tw-text-center tw-text-sm tw-border-b-2 tw-border-[#314150] focus:tw-font-bold focus:tw-border-white"
        >
          ACTIVE
          {!isLoading && (
            <span className="tw-ml-1 tw-px-1 tw-text-xs tw-bg-[#f2ca16] tw-rounded tw-font-bold tw-text-[#0f1923]">
              {activeWagers.length + activeTournamentWagers.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveOrCompleted("completed")}
          className="tw-py-2 tw-w-1/2 tw-text-center tw-text-sm tw-border-b-2 tw-border-[#314150] focus:tw-font-bold focus:tw-border-white"
        >
          COMPLETED
        </button>
      </div>
      <div className="tw-mb-4 watchlist-custom-height tw-overflow-y-auto">
        {isLoading && (
          <div className="tw-pb-[50px] tw-pt-[74px] tw-flex tw-justify-center">
            <BounceLoader color="#696969" loading={true} />
          </div>
        )}
        {activeOrCompleted === "active" &&
        (activeWagers.length !== 0 || activeTournamentWagers.length !== 0) ? (
          <div className="tw-w-full">
            {activeWagers.map((wager: any, index: number) => (
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
                    closeMenu={closeMenu}
                    prize={wager.prize}
                    deadline={wager.auctionDeadline}
                    index={index}
                  />
                </TimerProvider>
              </div>
            ))}
            {activeTournamentWagers.map((wager: any) => {
              return (
                <div key={wager._id}>
                  <TimerProvider deadline={wager.tournamentEndTime}>
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
          <div className="tw-w-full">
            {completedWagers.map((wager: any, index: number) => (
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
                    closeMenu={closeMenu}
                    prize={wager.prize}
                    deadline={wager.auctionDeadline}
                    index={index}
                  />
                </TimerProvider>
              </div>
            ))}
            {completedTournamentWagers.map((wager: any) => {
              return (
                <div key={wager._id}>
                  <TimerProvider deadline={wager.tournamentEndTime}>
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
              <div className="tw-opacity-70 tw-text-center">
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
                No completed wagers
              </div>
              <div className="tw-opacity-70 tw-text-center">
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
