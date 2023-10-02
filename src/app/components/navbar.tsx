import React, { useState } from "react";
import Image from "next/image";
import Logo from "../../../public/images/hammershift-logo.svg";
import MagnifyingGlass from "../../../public/images/magnifying-glass.svg"
import WagersIcon from "../../../public/images/wagers-icon.svg"
import WatchlistIcon from "../../../public/images/watchlist-icon.svg"
import AccountIcon from "../../../public/images/account-icon.svg"
import LogoSmall from "../../../public/images/logo-small.svg"
import HamburgerMenu from "../../../public/images/hamburger-menu.svg"


const Navbar = () => {
    const isLoggedIn = false; // state of login
    const [isOpen, setIsOpen] = useState(false);
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

                    </div>
                    <div className=" tw-hidden sm:tw-flex tw-justify-between tw-items-center tw-w-[136px] md:tw-visible">
                        <Image src={WatchlistIcon} width={24} height={24} alt="watchlist" className="tw-w-[24px] tw-h-[24px]" />
                        <Image src={WagersIcon} width={24} height={24} alt="wagers" className="tw-w-[24px] tw-h-[24px]" />
                        <Image src={AccountIcon} width={24} height={24} alt="account" className="tw-w-[24px] tw-h-[24px]" />
                    </div>
                    <Image src={HamburgerMenu} width={24} height={24} alt="menu" className="sm:tw-hidden tw-w-auto tw-h-auto" />
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
                                className="tw-ml-2 tw-bg-shade-100 "
                                placeholder="Search make, model, year..."
                            ></input>
                        </div>
                    </div>
                    <button className="btn-white hover:tw-bg-gold-200 tw-hidden md:tw-block ">CREATE ACCOUNT</button>
                    <Image src={HamburgerMenu} width={24} height={24} alt="menu" className="md:tw-hidden tw-w-auto tw-h-auto" />

                </div>

            }
        </div>

    );
};

export default Navbar;




