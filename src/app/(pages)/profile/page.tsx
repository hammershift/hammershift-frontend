import React from "react";
import Image from "next/image";

import AvatarOne from "../../../../public/images/avatar-one.svg";
import WagerPhotoOne from "../../../../public/images/my-wagers-navbar/my-wager-photo-one.svg";
import WalletIcon from "../../../../public/images/wallet--money-payment-finance-wallet.svg";
import DollarIcon from "../../../../public/images/dollar.svg";
import HourglassIcon from "../../../../public/images/hour-glass.svg";
import TwitterIcon from "../../../../public/images/social-icons/twitter-icon.svg";
import IDIcon from "../../../../public/images/single-neutral-id-card-3.svg";
import TransitionPattern from "../../../../public/images/transition-pattern.svg";

interface Props {}

function Profile(props: Props) {
    const {} = props;

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
                                Ralph Edwards
                            </div>
                            <div className="tw-text-lg tw-text-[#d1d5d8]">
                                Joined September 2023
                            </div>
                            <div className="tw-flex tw-text-base tw-gap-6 tw-text-[#487f4b]">
                                <div>#1234</div>
                                <div>16 wagers</div>
                                <div>2 wins</div>
                            </div>
                        </div>
                    </div>
                    <button className="tw-text-base tw-font-medium tw-text-[#f2ca16] tw-border-[1px] tw-border-[#f2ca16] tw-py-2 tw-px-3 tw-rounded tw-mt-4 sm:tw-mt-[50px] tw-h-[44px]">
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
                        Enim consequat est in id eiusmod ut sit eu tempor est
                        amet id. Pariatur cupidatat id magna incididunt tempor
                        aliqua esse laborum tempor cillum commodo aliquip non.
                        Duis non cupidatat duis tempor dolore adipisicing
                        ullamco aute magna ullamco.
                    </div>
                    <div className="tw-flex tw-gap-6 tw-text-lg tw-font-light tw-leading-7">
                        <div className="tw-flex tw-items-center tw-gap-2">
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="tw-rotate-0"
                            >
                                <g clipPath="url(#clip0_5765_81468)">
                                    <path
                                        d="M12 0.000375001C7.58 0.000375001 4 3.58037 4 8.00037C4 11.5104 9 20.0254 11.148 23.5244C11.328 23.8144 11.647 23.9944 11.997 23.9944C12.337 23.9944 12.667 23.8144 12.847 23.5144C14.987 20.0144 19.995 11.5044 19.995 7.98438C19.985 3.56437 16.405 -0.015625 11.995 -0.015625L12 0.000375001ZM12 11.5004C10.06 11.5004 8.5 9.93038 8.5 8.00037C8.5 6.06037 10.06 4.50037 12 4.50037C13.93 4.50037 15.5 6.06037 15.5 8.00037C15.5 9.93038 13.93 11.4994 12 11.4994V11.5004Z"
                                        fill="#53944F"
                                    />
                                </g>
                                <defs>
                                    <clipPath id="clip0_5765_81468">
                                        <rect
                                            width="24"
                                            height="24"
                                            fill="white"
                                        />
                                    </clipPath>
                                </defs>
                            </svg>

                            <div>NY</div>
                        </div>
                        <div className="tw-flex tw-items-center tw-gap-2">
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="tw-rotate-0"
                            >
                                <path
                                    d="M7.55016 21.7507C16.6045 21.7507 21.5583 14.2474 21.5583 7.74259C21.5583 7.53166 21.5536 7.31603 21.5442 7.10509C22.5079 6.40819 23.3395 5.54499 24 4.55603C23.1025 4.95533 22.1496 5.21611 21.1739 5.32947C22.2013 4.71364 22.9705 3.7462 23.3391 2.6065C22.3726 3.17929 21.3156 3.58334 20.2134 3.80134C19.4708 3.01229 18.489 2.48985 17.4197 2.31478C16.3504 2.13972 15.2532 2.32178 14.2977 2.83283C13.3423 3.34387 12.5818 4.15544 12.1338 5.14204C11.6859 6.12865 11.5754 7.23535 11.8195 8.29103C9.86249 8.19282 7.94794 7.68444 6.19998 6.79883C4.45203 5.91323 2.90969 4.67017 1.67297 3.15025C1.0444 4.23398 0.852057 5.51638 1.13503 6.73682C1.418 7.95727 2.15506 9.02418 3.19641 9.72072C2.41463 9.6959 1.64998 9.48541 0.965625 9.10666V9.16759C0.964925 10.3049 1.3581 11.4073 2.07831 12.2875C2.79852 13.1677 3.80132 13.7713 4.91625 13.9957C4.19206 14.1939 3.43198 14.2227 2.69484 14.0801C3.00945 15.0582 3.62157 15.9136 4.44577 16.5271C5.26997 17.1405 6.26512 17.4813 7.29234 17.502C5.54842 18.8718 3.39417 19.6149 1.17656 19.6113C0.783287 19.6107 0.390399 19.5866 0 19.5392C2.25286 20.9845 4.87353 21.7521 7.55016 21.7507Z"
                                    fill="#53944F"
                                />
                            </svg>
                            <div>Twitter</div>
                        </div>
                        <div className="tw-flex tw-items-center tw-gap-2">
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="tw-rotate-0"
                            >
                                <g clipPath="url(#clip0_5765_81475)">
                                    <path
                                        d="M24 12C24 5.37 18.62 0 12 0C5.37 0 0 5.37 0 12C0 18.62 5.37 24 12 24C12.02 24 12.04 24 12.06 24C12.08 24 12.1 24 12.12 24C18.67 23.99 23.979 18.68 23.989 12.12C23.989 12.09 23.989 12.07 23.989 12.05C23.989 12.02 23.989 12 23.989 11.98L24 12ZM22 12C21.99 12.88 21.87 13.77 21.64 14.63C21.56 14.89 21.29 15.05 21.02 14.97C20.99 14.96 20.97 14.95 20.95 14.94C20.33 14.67 19.8 14.23 19.43 13.67L17.212 10.34C16.742 9.64 15.962 9.22 15.132 9.22H14.692C13.172 9.22 11.942 7.98 11.942 6.47C11.942 4.95 13.172 3.72 14.692 3.72H17.462C17.562 3.72 17.662 3.75 17.742 3.81C20.382 5.68 21.962 8.72 21.969 11.96L22 12ZM2.17 10.15C2.21 9.91 2.42 9.74 2.66 9.75H7C7.92 9.74 8.82 10.11 9.47 10.77L10.58 11.89C11.88 13.2 11.95 15.3 10.72 16.69L9.36 18.219C8.95 18.669 8.72 19.259 8.72 19.879V20.699C8.71 20.969 8.49 21.189 8.21 21.189C8.14 21.179 8.07 21.169 8.01 21.139C4.34 19.559 1.96 15.949 1.96 11.959C1.96 11.339 2.02 10.718 2.13 10.108L2.17 10.15Z"
                                        fill="#53944F"
                                    />
                                </g>
                                <defs>
                                    <clipPath id="clip0_5765_81475">
                                        <rect
                                            width="24"
                                            height="24"
                                            fill="white"
                                        />
                                    </clipPath>
                                </defs>
                            </svg>

                            <div>Website</div>
                        </div>
                    </div>
                </div>
                <div className="tw-flex tw-flex-col tw-gap-4 tw-p-6 tw-bg-[#172431] tw-mt-8 tw-rounded">
                    <div className="tw-text-lg tw-font-bold tw-text-[#f2ca16] tw-leading-7">
                        WAGERS
                    </div>
                    <UserWagerList />
                </div>
                <div className="tw-flex tw-flex-col tw-gap-4 tw-p-6 tw-bg-[#172431] tw-mt-8 tw-rounded">
                    <div className="tw-text-lg tw-font-bold tw-text-[#f2ca16] tw-leading-7">
                        WATCHLIST
                    </div>
                    <UserWatchList />
                </div>
            </div>
        </div>
    );
}

export default Profile;

function UserWagerList() {
    return (
        <div className="tw-flex tw-gap-4 tw-py-3 tw-items-center">
            <Image
                src={WagerPhotoOne}
                alt=""
                className="tw-rounded tw-w-[100px]"
            />
            <div>
                <div className="tw-font-bold sm:text-lg tw-leading-7">
                    620-Mile 2019 Ford GT
                </div>
                <div className="tw-flex tw-gap-2 tw-text-sm tw-leading-5">
                    <Image
                        src={WalletIcon}
                        alt=""
                        className="tw-text-[#d1d3d6] tw-w-3.5"
                    />
                    <div className="tw-text-[#d1d3d6]">Wager:</div>
                    <div className="tw-text-[#f2ca16] tw-font-bold">
                        $999,000
                    </div>
                </div>
                <div className="tw-flex tw-gap-2 tw-text-sm">
                    <Image
                        src={DollarIcon}
                        alt=""
                        className="tw-text-[#d1d3d6] tw-w-3.5"
                    />
                    <div className="tw-text-[#d1d3d6]">Bid:</div>
                    <div className="tw-text-[#49c742] tw-font-bold">
                        $904,000
                    </div>
                </div>
                <div className="tw-flex tw-gap-2 tw-text-sm tw-items-center">
                    <Image
                        src={HourglassIcon}
                        alt=""
                        className="tw-text-[#d1d3d6] tw-w-3.5 tw-h-3.5"
                    />
                    <div className="tw-text-[#d1d3d6]">Time Left:</div>
                    <div>12:17:00</div>
                </div>
            </div>
        </div>
    );
}

function UserWatchList() {
    return (
        <div className="tw-flex tw-gap-4 tw-py-3 tw-items-center">
            <Image
                src={WagerPhotoOne}
                alt=""
                className="tw-rounded tw-w-[100px]"
            />
            <div>
                <div className="tw-font-bold sm:text-lg tw-leading-7">
                    620-Mile 2019 Ford GT
                </div>
                <div className="tw-flex tw-gap-2 tw-text-sm tw-leading-5">
                    <Image
                        src={DollarIcon}
                        alt=""
                        className="tw-text-[#d1d3d6] tw-w-3.5"
                    />
                    <div className="tw-text-[#d1d3d6]">Current Bid:</div>
                    <div className="tw-text-[#49c742] tw-font-bold">
                        $904,000
                    </div>
                </div>
                <div className="tw-flex tw-gap-2 tw-text-sm tw-items-center">
                    <Image
                        src={HourglassIcon}
                        alt=""
                        className="tw-text-[#d1d3d6] tw-w-3.5 tw-h-3.5"
                    />
                    <div className="tw-text-[#d1d3d6]">Time Left:</div>
                    <div>12:17:00</div>
                </div>
            </div>
        </div>
    );
}
