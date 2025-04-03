"use client";
import React, { useState } from "react";
import Image from "next/image";
import { SubscribeSmall } from "../../components/subscribe";
import Footer from "../../components/footer";
import HowHammerShiftWorks from "../../components/how_hammeshift_works";

import Plus from "../../../../public/images/plus-icon.svg";
import Minus from "../../../../public/images/minus-icon.svg";
import Mail from "../../../../public/images/mail-01.svg";
import Marker from "../../../../public/images/marker-pin-02.svg";
import Phone from "../../../../public/images/phone.svg";

const Support_Page = () => {
    // type questionProps = "how it works" | "anyone can participate" | "multiple users" | "limit to wagers" | "how winners are determined" | "cancel wager" | "different payment methods" | null
    const [howDoesItWork, setHowDoesItWork] = useState(false);
    const [eligibilityRequirement, setEligibilityRequirement] = useState(false);
    const [multipleUsers, setMultipleUsers] = useState(false);
    const [limitedNumbers, setLimitedNumbers] = useState(false);
    const [howWinnersAreDetermined, setHowWinnersAreDetermined] =
        useState(false);
    const [cancelWager, setCancelWager] = useState(false);
    const [auctionTransactions, setAuctionTransactions] = useState(false);
    return (
        <div className="w-full flex flex-col items-center">
            <div className="py-16 w-full md:w-[640px] px-6 md:px-0">
                <div className="text-center flex flex-col gap-4">
                    <div className="text-5xl font-bold">Get Support</div>
                    <div className="opacity-80">
                        Qui ipsorum lingua Celtae, nostra Galli appellantur.
                        Vivamus sagittis lacus vel augue laoreet rutrum
                        faucibus. A communi observantia non est recedendum.
                    </div>
                </div>
                <div className="flex gap-4 mt-8 flex-col sm:flex-row justify-center">
                    <button className="btn-yellow">
                        FREQUENTLY ASKED QUESTONS
                    </button>
                    <button className="btn-transparent-white">
                        CONTACT US
                    </button>
                </div>
            </div>
            <div className="bg-[#1A2C3D] w-full flex justify-center">
                <div className="section-container py-[120px] px-16">
                    <div>
                        <div className="text-4xl font-bold">
                            Frequently asked questions
                        </div>
                        <div className="text-lg opacity-80">
                            Excepteur sint obcaecat cupiditat non proident
                            culpa. At nos hinc posthac, sitientis piros afros.
                        </div>
                    </div>
                    <div className="mt-16">
                        <div className="py-8">
                            <div className="flex justify-between">
                                <span className="text-xl">
                                    How does the car auction guessing and
                                    wagering system work?
                                </span>
                                <button
                                    onClick={() =>
                                        setHowDoesItWork((prev) => !prev)
                                    }
                                >
                                    {howDoesItWork ? (
                                        <Image
                                            src={Plus}
                                            width={20}
                                            height={20}
                                            alt="plus sign"
                                            className="w-[20px] h-[20px]"
                                        />
                                    ) : (
                                        <Image
                                            src={Minus}
                                            width={20}
                                            height={20}
                                            alt="minus sign"
                                            className="w-[20px] h-[20px]"
                                        />
                                    )}
                                </button>
                            </div>
                            {howDoesItWork && (
                                <div className="opacity-80 mt-4">
                                    Excepteur sint obcaecat cupiditat non
                                    proident culpa. At nos hinc posthac,
                                    sitientis piros afros.
                                </div>
                            )}
                        </div>
                        <hr className="opacity-10" />
                        <div className="py-8">
                            <div className="flex justify-between">
                                <span className="text-xl">
                                    Can anyone participate in the car auctions,
                                    or are there any eligibility requirements?
                                </span>
                                <button
                                    onClick={() =>
                                        setEligibilityRequirement(
                                            (prev) => !prev
                                        )
                                    }
                                >
                                    {eligibilityRequirement ? (
                                        <Image
                                            src={Plus}
                                            width={20}
                                            height={20}
                                            alt="plus sign"
                                            className="w-[20px] h-[20px]"
                                        />
                                    ) : (
                                        <Image
                                            src={Minus}
                                            width={20}
                                            height={20}
                                            alt="minus sign"
                                            className="w-[20px] h-[20px]"
                                        />
                                    )}
                                </button>
                            </div>
                            {eligibilityRequirement && (
                                <div className="opacity-80 mt-4">
                                    Excepteur sint obcaecat cupiditat non
                                    proident culpa. At nos hinc posthac,
                                    sitientis piros afros.
                                </div>
                            )}
                        </div>
                        <hr className="opacity-10" />
                        <div className="py-8">
                            <div className="flex justify-between">
                                <span className="text-xl">
                                    What happens if multiple users guess the
                                    same amount for a particular car auction?
                                </span>
                                <button
                                    onClick={() =>
                                        setMultipleUsers((prev) => !prev)
                                    }
                                >
                                    {multipleUsers ? (
                                        <Image
                                            src={Plus}
                                            width={20}
                                            height={20}
                                            alt="plus sign"
                                            className="w-[20px] h-[20px]"
                                        />
                                    ) : (
                                        <Image
                                            src={Minus}
                                            width={20}
                                            height={20}
                                            alt="minus sign"
                                            className="w-[20px] h-[20px]"
                                        />
                                    )}
                                </button>
                            </div>
                            {multipleUsers && (
                                <div className="opacity-80 mt-4">
                                    Excepteur sint obcaecat cupiditat non
                                    proident culpa. At nos hinc posthac,
                                    sitientis piros afros.
                                </div>
                            )}
                        </div>
                        <hr className="opacity-10" />
                        <div className="py-8">
                            <div className="flex justify-between">
                                <span className="text-xl">
                                    Is there a limit to the number of wagers I
                                    can place on different car auctions?
                                </span>
                                <button
                                    onClick={() =>
                                        setLimitedNumbers((prev) => !prev)
                                    }
                                >
                                    {limitedNumbers ? (
                                        <Image
                                            src={Plus}
                                            width={20}
                                            height={20}
                                            alt="plus sign"
                                            className="w-[20px] h-[20px]"
                                        />
                                    ) : (
                                        <Image
                                            src={Minus}
                                            width={20}
                                            height={20}
                                            alt="minus sign"
                                            className="w-[20px] h-[20px]"
                                        />
                                    )}
                                </button>
                            </div>
                            {limitedNumbers && (
                                <div className="opacity-80 mt-4">
                                    Excepteur sint obcaecat cupiditat non
                                    proident culpa. At nos hinc posthac,
                                    sitientis piros afros.
                                </div>
                            )}
                        </div>
                        <hr className="opacity-10" />
                        <div className="py-8">
                            <div className="flex justify-between">
                                <span className="text-xl">
                                    How are the winners determined in the car
                                    auctions?
                                </span>
                                <button
                                    onClick={() =>
                                        setHowWinnersAreDetermined(
                                            (prev) => !prev
                                        )
                                    }
                                >
                                    {howWinnersAreDetermined ? (
                                        <Image
                                            src={Plus}
                                            width={20}
                                            height={20}
                                            alt="plus sign"
                                            className="w-[20px] h-[20px]"
                                        />
                                    ) : (
                                        <Image
                                            src={Minus}
                                            width={20}
                                            height={20}
                                            alt="minus sign"
                                            className="w-[20px] h-[20px]"
                                        />
                                    )}
                                </button>
                            </div>
                            {howWinnersAreDetermined && (
                                <div className="opacity-80 mt-4">
                                    Excepteur sint obcaecat cupiditat non
                                    proident culpa. At nos hinc posthac,
                                    sitientis piros afros.
                                </div>
                            )}
                        </div>
                        <hr className="opacity-10" />
                        <div className="py-8">
                            <div className="flex justify-between">
                                <span className="text-xl">
                                    {
                                        "Can I change or cancel my wager once it's been placed?"
                                    }
                                </span>
                                <button
                                    onClick={() =>
                                        setCancelWager((prev) => !prev)
                                    }
                                >
                                    {cancelWager ? (
                                        <Image
                                            src={Plus}
                                            width={20}
                                            height={20}
                                            alt="plus sign"
                                            className="w-[20px] h-[20px]"
                                        />
                                    ) : (
                                        <Image
                                            src={Minus}
                                            width={20}
                                            height={20}
                                            alt="minus sign"
                                            className="w-[20px] h-[20px]"
                                        />
                                    )}
                                </button>
                            </div>
                            {cancelWager && (
                                <div className="opacity-80 mt-4">
                                    Excepteur sint obcaecat cupiditat non
                                    proident culpa. At nos hinc posthac,
                                    sitientis piros afros.
                                </div>
                            )}
                        </div>
                        <hr className="opacity-10" />
                        <div className="py-8">
                            <div className="flex justify-between">
                                <span className="text-xl">
                                    What are the different payment methods
                                    accepted for wagers and auction
                                    transactions?
                                </span>
                                <button
                                    onClick={() =>
                                        setAuctionTransactions((prev) => !prev)
                                    }
                                >
                                    {auctionTransactions ? (
                                        <Image
                                            src={Plus}
                                            width={20}
                                            height={20}
                                            alt="plus sign"
                                            className="w-[20px] h-[20px]"
                                        />
                                    ) : (
                                        <Image
                                            src={Minus}
                                            width={20}
                                            height={20}
                                            alt="minus sign"
                                            className="w-[20px] h-[20px]"
                                        />
                                    )}
                                </button>
                            </div>
                            {auctionTransactions && (
                                <div className="opacity-80 mt-4">
                                    Excepteur sint obcaecat cupiditat non
                                    proident culpa. At nos hinc posthac,
                                    sitientis piros afros.
                                </div>
                            )}
                        </div>
                        <button className="btn-transparent-white w-full">
                            LOAD MORE
                        </button>
                    </div>
                </div>
            </div>
            {/* ContactUs */}
            <div className="py-[120px] flex justify-center">
                <div className="w-full md:w-[640px] px-6 md:px-0">
                    <div className="grid gap-2">
                        <span className="text-4xl font-bold">
                            Contact Us
                        </span>
                        <span>
                            {
                                "We’d love to hear from you. Our friendly team is always here to chat."
                            }
                        </span>
                    </div>
                    <div className="grid gap-6 text-sm mt-12">
                        <div className="flex flex-col">
                            <label>Name</label>
                            <input
                                placeholder="Full name"
                                className="bg-[#172431] mt-2 py-2.5 px-3"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label>Email</label>
                            <input
                                placeholder="you@email.com"
                                className="bg-[#172431] mt-2 py-2.5 px-3"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label>Message</label>
                            <textarea
                                className="bg-[#172431] mt-2 py-2.5 px-3"
                                rows={5}
                            />
                        </div>
                    </div>
                    <button className="btn-yellow w-full mt-8">
                        SEND MESSAGE
                    </button>
                </div>
            </div>
            <div className="section-container mb-[120px]">
                <div className="w-full bg-[#1A2C3D] py-16 px-8 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="flex flex-col items-center gap-5">
                        <div className="bg-[#53944F] w-16 h-16 rounded-full flex justify-center items-center">
                            <Image
                                src={Mail}
                                width={24}
                                height={24}
                                alt=""
                                className="w-[24px] h-[24px]"
                            />
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-lg">Email</div>
                            <div className="opacity-50">
                                Our friendly team is here to help.
                            </div>
                        </div>
                        <div className="text-[#53944F] font-bold">
                            support@hammershift.com
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-5">
                        <div className="bg-[#53944F] w-16 h-16 rounded-full flex justify-center items-center">
                            <Image
                                src={Marker}
                                width={24}
                                height={24}
                                alt=""
                                className="w-[24px] h-[24px]"
                            />
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-lg">
                                Office
                            </div>
                            <div className="opacity-50">Our HQ</div>
                        </div>
                        <div className="text-[#53944F] font-bold text-center">
                            100 Smith Street
                            <br />
                            Collingwood VIC 3066 NJ
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-5">
                        <div className="bg-[#53944F] w-16 h-16 rounded-full flex justify-center items-center">
                            <Image
                                src={Phone}
                                width={24}
                                height={24}
                                alt=""
                                className="w-[24px] h-[24px]"
                            />
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-lg">Phone</div>
                            <div className="opacity-50">
                                Mon-Fri from 8am to 5pm.
                            </div>
                        </div>
                        <div className="text-[#53944F] font-bold">
                            +1 (555) 000-0000
                        </div>
                    </div>
                </div>
            </div>
            <HowHammerShiftWorks />
            <SubscribeSmall />
            <Footer />
        </div>
    );
};

export default Support_Page;
