"use client";

import React, { useEffect, useState } from "react";
import CarDesign from "../../../public/images/car-design.svg";
import Image from "next/image";

const Subscribe = () => {
    const [newEmail, setNewEmail] = useState("");
    const [emailError, setEmailError] = useState(false);
    const [emailList, setEmailList] = useState<string[]>([]);

    const fetchEmails = async () => {
        try {
            const response = await fetch("api/emails", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            if (response.ok) {
                const data = await response.json();
                // console.log("data: ", data.emails);
                setEmailList(data.emails);
            } else {
                console.error("Failed to fetch email list!");
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchEmails();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewEmail(e.target.value);
    };

    const handleSubscribeButtonClick = async (
        e: React.MouseEvent<HTMLButtonElement>
    ) => {
        e.preventDefault();

        if (!newEmail || !/\S+@\S+\.\S+/.test(newEmail)) {
            console.log("Please input a valid email");
            setEmailError(true);
            return;
        }
        setEmailError(false);

        try {
            const response = await fetch("/api/emails", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: newEmail }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("Subscription failed!");
            } else if (data.message === "Email already subscribed!") {
                console.log("Email already subscribed!", data);
                setEmailError(true);
            } else {
                console.log("Subscription successful!");
                console.log(data);
                setEmailError(false);
                setNewEmail("");
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="relative text-[#0F1923] bg-[#F2CA16] h-auto md:max-h-[664px] flex  justify-center w-full mt-[-1px] overflow-hidden">
            <div className="relative mt-[350px] md:mt-0 px-4 md:px-16 w-full 2xl:w-[1440px] py-16 md:py-[174px] z-50 ">
                <div className="grid grid-cols-1 md:grid-cols-2 ">
                    <div>
                        <h1 className="text-6xl font-bold">
                            Stay in the Fast Lane
                        </h1>
                        <p className="my-10 max-h-[100px] ellispis overflow-hidden">
                            Are you ready to dive deeper into the captivating
                            world of car auction wagering? Join the exclusive
                            HammerShift newsletter to get access to a treasure
                            trove of insider knowledge, expert tips, and
                            captivating insights that will elevate your wagering
                            game.
                        </p>
                        <div className="flex flex-col sm:flex-row w-auto">
                            <input
                                placeholder={
                                    emailError
                                        ? "Please input a valid email"
                                        : "Email Address"
                                }
                                value={newEmail}
                                onChange={handleChange}
                                className={
                                    "px-6 py-4 grow rounded font-bold"
                                }
                                style={{
                                    color: emailError ? "#F44336" : "#000000",
                                }}
                            />
                            <button
                                onClick={handleSubscribeButtonClick}
                                className="btn-dark sm:ml-3 mt-4 sm:mt-0 w-auto"
                            >
                                Subscribe
                            </button>
                        </div>
                    </div>
                    <div></div>
                </div>
            </div>

            <div>
                <div className="absolute top-0 right-0 md:right-[-200px] lg:right-0 w-full sm:w-auto h-auto">
                    <div
                        style={{
                            transform: "skew(-28deg)",
                            // backgroundColor: '#fff'
                            backgroundColor: "#F2CA16",

                            // borderBottom: '664px solid transparent',
                            // borderLeft: '360px solid #fff'
                        }}
                        className="absolute h-[664px] w-[400px] md:width right-[400px] sm:right-[542px] "
                    ></div>
                    <div
                        style={{
                            transform: "skew(-28deg)",
                            borderRight: "20px solid #F2CA16",
                        }}
                        className="absolute h-[644px] w-[300px] top-0 right-[280px] sm:right-[250px]"
                    ></div>
                    <div
                        style={{
                            transform: "skew(-28deg)",
                            borderRight: "20px solid #F2CA16",
                        }}
                        className="absolute w-[300px] h-[644px] top-0 right-[180px] sm:right-[390px]"
                    ></div>
                    <div
                        style={{
                            borderTop: "664px solid transparent",
                            borderRight: "360px solid #F2CA16",
                        }}
                        className="absolute w-[997px] h-[644px] w-top-[2px] right-[-80px] sm:right-[-60px]"
                    ></div>
                    <Image
                        src={CarDesign}
                        width={997}
                        height={644}
                        alt="design"
                        className="w-[640px] md:w-auto h-[350px] md:h-auto z-[-1] object-cover"
                    />
                </div>
            </div>
        </div>
    );
};

export default Subscribe;

export const SubscribeSmall = () => {
    return (
        <div className="w-full h-auto  bg-[#F2CA16] flex justify-center">
            <div className="section-container flex flex-col md:flex-row justify-between items-center text-[#0F1923] py-[60px]">
                <div>
                    <div className="text-[20px] font-bold">
                        Stay in the Fast Lane
                    </div>
                    <div>
                        Join the exclusive HammerShift newsletter to get access
                        to insider knowledge
                    </div>
                </div>
                <div className="flex mt-6 md:mt-0 flex-col sm:flex-row w-full md:w-auto">
                    <input
                        placeholder="Email Address"
                        className="w-full md:w-[299px] px-6 py-4 rounded"
                    />
                    <button className="btn-dark w-full sm:w-auto ml-0 sm:ml-3 mt-3 sm:mt-0">
                        Subscribe
                    </button>
                </div>
            </div>
        </div>
    );
};
