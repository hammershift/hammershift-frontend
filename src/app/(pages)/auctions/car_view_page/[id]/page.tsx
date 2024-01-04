"use client";
import React, { Suspense, useEffect, useState } from "react";
import {
    WatchAndWagerButtons,
    PhotosLayout,
    ArticleSection,
    WagersSection,
    DetailsSection,
    GamesYouMightLike,
} from "@/app/ui/car_view_page/CarViewPage";
import { CommentsSection } from "@/app/ui/car_view_page/CommentsSection";
import TitleContainer from "@/app/ui/car_view_page/CarViewPage";
import GuessThePriceInfoSection from "@/app/ui/car_view_page/GuessThePriceInfoSection";
import { auctionDataOne, carDataTwo } from "../../../../../sample_data";
import {
    addPrizePool,
    createWager,
    getCarData,
    getComments,
    getOneUserWager,
    getWagers,
    sortByNewGames,
} from "@/lib/data";
import { TimerProvider } from "@/app/_context/TimerContext";
import WagerModal from "@/app/components/wager_modal";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { set } from "mongoose";

const CarViewPage = ({ params }: { params: { id: string } }) => {
    const urlPath = useParams();
    const { data: session, status } = useSession();
    const [carData, setCarData] = useState<any>(null);
    const [wagersData, setWagersData] = useState<any>(null);
    const [playerNum, setPlayerNum] = useState(0);
    const [toggleWagerModal, setToggleWagerModal] = useState(false);
    const [alreadyWagered, setAlreadyWagered] = useState(false);
    const [auctionEnded, setAuctionEnded] = useState(false);
    const [walletBalance, setWalletBalance] = useState(0);
    const [isWagerValid, setIsWagerValid] = useState(true); // TEST IMPLEMENTATION
    const [wagerErrorMessage, setWagerErrorMessage] = useState(""); // TEST IMPLEMENTATION
    const [comments, setComments] = useState<any | null>(null);
    const [loadingComments, setLoadingComments] = useState(false);

    // const router = useRouter();

    const ID = params.id;

    // TEST IMPLEMENTATION
    useEffect(() => {
        const fetchWalletBalance = async () => {
            if (session?.user?.id) {
                try {
                    const response = await fetch(
                        `/api/wallet?userId=${session.user.id}`
                    );
                    const data = await response.json();
                    if (response.ok) {
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

    useEffect(() => {
        const fetchCarData = async () => {
            const data = await getCarData(ID);
            const currentDate = new Date();
            const auctionDeadline = new Date(data?.deadline);

            setCarData(data);
            setWagerInputs({ ...wagerInputs, auctionID: data?._id });

            if (session) {
                const userWager = await getOneUserWager(
                    data?._id,
                    session?.user.id
                );
                !userWager.length
                    ? setAlreadyWagered(false)
                    : setAlreadyWagered(true);
            }

            setAuctionEnded(auctionDeadline < currentDate);

            const wagers = await getWagers(data?._id);
            setWagersData(wagers);
            setPlayerNum(wagers.length);
        };

        fetchCarData();
    }, [ID, toggleWagerModal, session]);

    const currencyString = new Intl.NumberFormat().format(carData?.price || 0);

    const date = new Date(carData?.deadline || "2023-12-01T03:27:01.087+00:00");
    const formattedDateString = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
    }).format(date);

    useEffect(() => {
        if (toggleWagerModal) {
            document.body.classList.add("stop-scrolling");
        } else {
            document.body.classList.remove("stop-scrolling");
        }

        return () => {
            document.body.classList.remove("body-no-scroll");
        };
    }, [toggleWagerModal]);

    const showWagerModal = () => {
        setToggleWagerModal(!toggleWagerModal);
    };

    const [wagerInputs, setWagerInputs] = useState<WagerInputsI>({});

    interface WagerInputsI {
        auctionID?: string;
        priceGuessed?: number;
        wagerAmount?: number | undefined;
    }

    const handleWagerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        switch (e.target.name) {
            case "price-guessed":
                setWagerInputs({
                    ...wagerInputs,
                    priceGuessed: value,
                });
                break;
            case "wager-amount":
                if (value <= 0) {
                    // check for positive numbers
                    setIsWagerValid(false);
                    setWagerErrorMessage("Please enter a valid wager amount.");
                } else if (value > walletBalance) {
                    // check if the user has enough funds
                    setIsWagerValid(false);
                    setWagerErrorMessage(
                        "Insufficient funds. Please top-up your wallet."
                    );
                } else {
                    // if the input is valid and the user has enough funds
                    setIsWagerValid(true);
                    setWagerErrorMessage("");
                }
                setWagerInputs({
                    ...wagerInputs,
                    wagerAmount: value,
                });
                break;
            default:
                break;
        }
    };

    const handleWagerSubmit = async (
        e: React.FormEvent<HTMLFormElement>,
        sessionData: any
    ) => {
        e.preventDefault();

        // ensure wagerAmount is defined and is a number greater than zero
        const wagerAmount = wagerInputs.wagerAmount ?? 0;
        if (wagerAmount > walletBalance) {
            console.log("Insufficient funds. Please top-up your wallet."); // check if the defined wager amount is more than the wallet balance
            return;
        }

        try {
            // update the prize pool
            await addPrizePool(
                {
                    pot:
                        carData.pot + Math.floor(wagerAmount * 0.88) ||
                        Math.floor(wagerAmount * 0.88),
                },
                urlPath.id
            );

            // deduct the wagerAmount from the wallet
            const walletResponse = await fetch("/api/wallet", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ wagerAmount: wagerAmount }),
            });

            const walletData = await walletResponse.json();
            if (!walletResponse.ok) {
                console.error("Failed to update wallet balance:", walletData); // if the wallet update was not successful, log the error and stop
                return;
            }

            // the wallet has been successfully updated, place the wager
            const wagerResponse = await createWager({
                ...wagerInputs,
                wagerAmount,
                user: sessionData.user,
            });
            if (!wagerResponse.ok) {
                console.error("Failed to place wager");
                return;
            }

            // wallet update and wager placement were both successful
            console.log(
                "Wager placed successfully. Wallet updated:",
                walletData
            );
            setWalletBalance(walletData.newBalance);
            setToggleWagerModal(false);
        } catch (error) {
            console.error("Error in wager placement or wallet update:", error);
        }
    };

    return (
        <div>
            {toggleWagerModal ? (
                <TimerProvider deadline={carData.deadline}>
                    <WagerModal
                        showWagerModal={showWagerModal}
                        make={carData.make}
                        model={carData.model}
                        price={currencyString}
                        bids={carData.bids}
                        ending={formattedDateString}
                        image={carData.image}
                        handleWagerInputChange={handleWagerInputChange}
                        handleWagerSubmit={handleWagerSubmit}
                        players_num={playerNum}
                        prize={carData.pot}
                        // walletBalance={walletBalance}
                    />
                </TimerProvider>
            ) : null}
            <div className="section-container tw-flex tw-justify-between tw-items-center tw-mt-4 md:tw-mt-8">
                <div className="tw-w-auto tw-h-[28px] tw-flex tw-items-center tw-bg-[#184C80] tw-font-bold tw-rounded-full tw-px-2.5 tw-py-2 tw-text-[14px]">
                    GUESS THE PRICE
                </div>
                <div className="tw-hidden sm:tw-block">
                    <WatchAndWagerButtons
                        auctionID={carData?._id}
                        alreadyWagered={alreadyWagered}
                        toggleWagerModal={showWagerModal}
                    />
                </div>
            </div>
            <div className="section-container tw-w-full tw-mt-8 tw-flex tw-flex-col lg:tw-flex-row">
                <div className="left-container-marker tw-w-full tw-basis-2/3 tw-pl-0 lg:tw-pr-8">
                    {carData ? (
                        <TimerProvider deadline={carData.deadline}>
                            {" "}
                            <TitleContainer
                                year={carData.year}
                                make={carData.make}
                                model={carData.model}
                                pot={carData.pot}
                                current_bid={currencyString}
                                bids_num={carData.bids}
                                ending_date={formattedDateString}
                                deadline={carData.deadline}
                                players_num={playerNum}
                                prize={auctionDataOne.prize}
                            />
                        </TimerProvider>
                    ) : null}
                    <div className="tw-block sm:tw-hidden tw-mt-8">
                        <WatchAndWagerButtons
                            auctionID={carData?._id}
                            alreadyWagered={alreadyWagered}
                            toggleWagerModal={showWagerModal}
                        />
                    </div>
                    {carData ? (
                        <>
                            <PhotosLayout
                                images_list={carData.images_list}
                                img={carData.image}
                            />
                            <ArticleSection
                                images_list={carData.images_list}
                                description={carData.description}
                                toggleWagerModal={showWagerModal}
                                alreadyWagered={alreadyWagered}
                            />
                        </>
                    ) : null}
                    <div className="tw-block sm:tw-hidden tw-mt-8">
                        {wagersData ? (
                            <WagersSection
                                toggleWagerModal={showWagerModal}
                                players_num={playerNum}
                                wagers={wagersData}
                                alreadyWagered={alreadyWagered}
                            />
                        ) : null}
                    </div>
                    <GuessThePriceInfoSection />

                    {carData ? (
                        <div className="tw-block sm:tw-hidden tw-mt-8">
                            <DetailsSection
                                website={carData.website}
                                make={carData.make}
                                model={carData.model}
                                seller={carData.seller}
                                location={carData.location}
                                mileage="55,400"
                                listing_type={carData.listing_type}
                                lot_num={carData.lot_num}
                                listing_details={carData.listing_details}
                                images_list={carData.images_list}
                            />
                        </div>
                    ) : null}
                    <CommentsSection
                        comments={comments}
                        id={ID}
                        loading={loadingComments}
                    />
                </div>
                <div className="right-container-marker tw-w-full tw-basis-1/3 tw-pl-0 lg:tw-pl-8 tw-hidden lg:tw-block">
                    {wagersData ? (
                        <WagersSection
                            toggleWagerModal={showWagerModal}
                            players_num={playerNum}
                            wagers={wagersData}
                            alreadyWagered={alreadyWagered}
                        />
                    ) : null}
                    {carData ? (
                        <DetailsSection
                            website={carData.website}
                            make={carData.make}
                            model={carData.model}
                            seller={carData.seller}
                            location={carData.location}
                            mileage="55,400"
                            listing_type={carData.listing_type}
                            lot_num={carData.lot_num}
                            listing_details={carData.listing_details}
                            images_list={carData.images_list}
                        />
                    ) : null}
                </div>
            </div>
            <GamesYouMightLike />
        </div>
    );
};

export default CarViewPage;
