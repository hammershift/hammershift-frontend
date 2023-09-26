import React from "react";
import Image from "next/image";
import Logo from "../../../public/images/hammershift-logo.svg";
import MagnifyingGlass from "../../../public/images/magnifying-glass.svg"
import WagersIcon from "../../../public/images/wagers-icon.svg"
import WatchlistIcon from "../../../public/images/watchlist-icon.svg"
import AccountIcon from "../../../public/images/account-icon.svg"
import LogoSmall from "../../../public/images/logo-small.svg"


const Navbar = () => {
    return (
        <div className=" tw-flex tw-px-16 xl:tw-px-36 tw-w-screen tw-justify-between tw-py-3">
            <div className="lg:tw-w-[411px] tw-flex tw-items-center tw-justify-between">
                <div className="tw-pr-4">
                    <Image src={Logo} width={200} height={50} alt="logo" className="tw-hidden lg:tw-block" />
                    <Image src={LogoSmall} width={32} height={32} alt="logo" className=" tw-block lg:tw-hidden" />
                </div>
                <div className="tw-mx-4">DISCOVER</div>
                <div className="tw-mx-4">AUCTIONS</div>
            </div>
            <div className="tw-flex tw-flex-1 tw-items-center xl:tw-max-w-[535px] tw-mx-12">
                <div className="tw-bg-shade-100 tw-flex tw-p-2 tw-grow tw-rounded">
                    <Image src={MagnifyingGlass} width={15} height={15} alt="magnifying glass" />
                    <input
                        className="tw-ml-2 tw-bg-shade-100 "
                        placeholder="Search make, model, year..."
                    ></input>
                </div>
            </div>
            <button className="btn-white hover:tw-bg-gold-200 tw-hidden lg:tw-block ">CREATE ACCOUNT</button>
            <div className="tw-flex tw-justify-between tw-w-[136px] tw-visible lg:tw-hidden">
                <Image src={WatchlistIcon} width={24} height={24} alt="watchlist" />
                <Image src={WagersIcon} width={24} height={24} alt="wagers" />
                <Image src={AccountIcon} width={24} height={24} alt="account" />
            </div>

        </div>
    );
};

export default Navbar;
