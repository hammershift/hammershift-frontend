"use client"
import React, { useState } from "react";
import Image from "next/image";
import Logo from "../../../public/images/hammershift-logo.svg";
import LogoSmall from "../../../public/images/logo-small.svg";
import MagnifyingGlass from "../../../public/images/magnifying-glass.svg"
import WagersIcon from "../../../public/images/dollar-coin.svg"
import WatchlistIcon from "../../../public/images/watchlist-icon.svg"
import AccountIcon from "../../../public/images/account-icon.svg"
import HamburgerMenu from "../../../public/images/hamburger-menu.svg"
import CancelIcon from "../../../public/images/x-icon.svg"

export interface NavbarProps {
    isLoggedIn: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ isLoggedIn }) => {

    const [menuIsOpen, setMenuIsOpen] = useState(false)
    const [myAccountMenuOpen, setMyAccountMenuOpen] = useState(false)
    return (
        <div>
            {isLoggedIn
                ? <div className=" tw-flex tw-px-4 md:tw-px-16 2xl:tw-px-36 tw-w-screen tw-justify-between tw-py-3">
                    <div className="lg:tw-w-[411px] tw-flex tw-items-center tw-justify-between">
                        <div className="tw-pr-4">
                            <Image src={Logo} width={176} height={64} alt="logo" className="tw-hidden sm:tw-block tw-w-auto tw-h-auto" />
                            <Image src={LogoSmall} width={32} height={32} alt="logo" className=" tw-block sm:tw-hidden tw-w-auto tw-h-auto" />
                        </div>
                        <div className="tw-block tw-mx-2 sm:tw-mx-4 ">DISCOVER</div>
                        <div className="tw-block tw-mx-2 sm:tw-mx-4 ">AUCTIONS</div>
                    </div>
                    <div className="tw-hidden lg:tw-flex lg:tw-flex-1 lg:tw-items-center xl:tw-max-w-[535px] tw-mx-6 lg:tw-mx-12">
                        <div className="tw-bg-shade-100 tw-flex tw-p-2 tw-grow tw-rounded">
                            <Image src={MagnifyingGlass} width={15} height={15} alt="magnifying glass" className="tw-w-auto tw-h-auto" />
                            <input
                                className="tw-ml-2 tw-bg-shade-100 tw-w-full "
                                placeholder="Search make, model, year..."
                            ></input>
                        </div>
                    </div>
                    <div className=" tw-hidden sm:tw-flex tw-justify-between tw-items-center tw-w-[136px] md:tw-visible">
                        <Image src={WatchlistIcon} width={24} height={24} alt="watchlist" className="tw-w-[24px] tw-h-[24px]" />
                        <Image src={WagersIcon} width={24} height={24} alt="wagers" className="tw-w-[24px] tw-h-[24px]" />
                        <Image src={AccountIcon} width={24} height={24} alt="account" className="tw-w-[24px] tw-h-[24px]" />
                    </div>
                    <div className="sm:tw-hidden">
                        <button onClick={() => setMyAccountMenuOpen((prev) => !prev)} className="tw-mr-4">
                            <Image src={AccountIcon} width={24} height={24} alt="account" className="tw-w-[24px] tw-h-[24px]" />
                        </button>
                        <button onClick={() => setMenuIsOpen((prev) => !prev)}>
                            {
                                menuIsOpen
                                    ? <Image src={CancelIcon} width={24} height={24} alt="menu" className=" tw-w-auto tw-h-auto" />
                                    : <Image src={HamburgerMenu} width={24} height={24} alt="menu" className=" tw-w-auto tw-h-auto" />

                            }
                        </button>
                    </div>
                </div>

                :
                <div className=" tw-flex tw-px-4 md:tw-px-16 2xl:tw-px-36 tw-w-screen tw-justify-between tw-py-3">
                    <div className="lg:tw-w-[411px] tw-flex tw-items-center tw-justify-between">
                        <div className="tw-pr-4">
                            <Image src={Logo} width={176} height={64} alt="logo" className="tw-block tw-w-auto tw-h-auto" />
                        </div>
                        <div className="tw-hidden sm:tw-block tw-mx-1 md:tw-mx-4 ">DISCOVER</div>
                        <div className="tw-hidden sm:tw-block tw-mx-1 md:tw-mx-4 ">AUCTIONS</div>
                    </div>
                    <div className="tw-hidden lg:tw-flex lg:tw-flex-1 lg:tw-items-center xl:tw-max-w-[535px] tw-mx-6 lg:tw-mx-12">
                        <div className="tw-bg-shade-100 tw-flex tw-p-2 tw-grow tw-rounded">
                            <Image src={MagnifyingGlass} width={15} height={15} alt="magnifying glass" className="tw-w-auto tw-h-auto" />
                            <input
                                className="tw-ml-2 tw-bg-shade-100 tw-w-full"
                                placeholder="Search make, model, year..."
                            ></input>
                        </div>
                    </div>
                    <div className="tw-flex tw-items-center">
                        <button className="btn-white  hover:tw-bg-gold-200 tw-hidden md:tw-block ">CREATE ACCOUNT</button>
                        <button onClick={() => setMenuIsOpen((prev) => !prev)}>
                            {
                                menuIsOpen
                                    ? <Image src={CancelIcon} width={24} height={24} alt="menu" className="md:tw-hidden tw-w-auto tw-h-auto" />
                                    : <Image src={HamburgerMenu} width={24} height={24} alt="menu" className="md:tw-hidden tw-w-auto tw-h-auto" />
                            }
                        </button>
                    </div>
                </div>

            }
            {
                menuIsOpen
                && <DropdownMenu isLoggedIn={isLoggedIn} />
            }
            {
                myAccountMenuOpen
                && <MyAccountMenu isLoggedIn={isLoggedIn} />
            }
        </div>

    );
};
export default Navbar;


interface DropdownMenuProps {
    isLoggedIn: boolean;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ isLoggedIn }) => {
    return (
        <div className="slide-in-top tw-absolute tw-flex tw-flex-col tw-text-white tw-bg-[#0F1923] tw-p-4 tw-w-full tw-h-full tw-z-50">
            <div className="tw-bg-shade-100 tw-flex tw-p-2 tw-rounded tw-mt-8">
                <Image src={MagnifyingGlass} width={15} height={15} alt="magnifying glass" className="tw-w-auto tw-h-auto" />
                <input
                    className="tw-ml-2 tw-bg-shade-100 "
                    placeholder="Search make, model, year..."
                ></input>
            </div>
            <div className="tw-flex tw-pt-4">
                <Image src={WatchlistIcon} width={24} height={24} alt="watchlist" className="tw-w-[24px] tw-h-[24px]" />
                <div className="tw-ml-4">MY WATCHLIST</div>
            </div>
            <div className="tw-flex tw-pt-4">
                <Image src={WagersIcon} width={24} height={24} alt="watchlist" className="tw-w-[24px] tw-h-[24px]" />
                <div className="tw-ml-4">MY WAGERS</div>
            </div>
            <div className="tw-mt-4">
                {
                    !isLoggedIn
                    && <button className="btn-white tw-w-full">CREATE ACCOUNT</button>
                }
            </div>
        </div>
    )
}



interface MyAccountMenuProps {
    isLoggedIn: boolean;
}

const MyAccountMenu: React.FC<DropdownMenuProps> = ({ isLoggedIn }) => {
    return (
        <div className="slide-in-top tw-absolute tw-flex tw-flex-col tw-text-white tw-bg-[#1A2C3D] tw-p-4 tw-w-full tw-h-auto tw-z-50">
            <div className="tw-text-lg tw-font-bold">MY ACCOUNT</div>
            <div className="tw-m-1.5">Profile</div>
            <div className="tw-m-1.5" >Setting</div>
            <div className="tw-m-1.5" >Logout</div>
        </div>
    )
}