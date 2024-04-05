"use client";

import React, { Suspense, useEffect, useState } from "react";
import {
    WatchAndWagerButtons,
    PhotosLayout,
    ArticleSection,
    WagersSection,
    DetailsSection,
    GamesYouMightLike,
    WinnersSection,
} from "@/app/ui/car_view_page/CarViewPage";
import { CommentsSection } from "@/app/components/CommentsSection";
import TitleContainer from "@/app/ui/car_view_page/CarViewPage";
import GuessThePriceInfoSection from "@/app/ui/car_view_page/GuessThePriceInfoSection";
import { auctionDataOne, carDataTwo } from "../../../../../sample_data";
import {
    addPrizePool,
    createWager,
    getAuctionTransactions,
    getCarData,
    getComments,
    getOneUserWager,
    getTournamentTransactions,
    getWagers,
    sortByNewGames,
} from "@/lib/data";
import { TimerProvider } from "@/app/_context/TimerContext";
import WagerModal from "@/app/components/wager_modal";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { set } from "mongoose";
import { io } from "socket.io-client";

const WEBSOCKET_SERVER = "https://socket-practice-c55s.onrender.com";

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
    const [insufficientFunds, setInsufficientFunds] = useState(false);
    const [invalidPrice, setInvalidPrice] = useState(false);
    const [invalidWager, setInvalidWager] = useState(false);
    const [showCarImageModal, setShowCarImageModal] = useState(false);
    const [winners, setWinners] = useState([]);
    const [isButtonClicked, setIsButtonClicked] = useState(false);
    const [prize, setPrize] = useState(0);
    const [newSocket, setNewSocket] = useState<any>();
    const [wagerAmountAlreadyExists, setWagerAmountAlreadyExists] =
        useState(false);

    // const router = useRouter();

    const ID = params.id;

    useEffect(() => {
        const socket = io(WEBSOCKET_SERVER);
        setNewSocket(socket);

        socket.on("connect", () => {
            console.log(`Connected to server with socket ID: ${socket.id}`);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    // TEST IMPLEMENTATION
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

    useEffect(() => {
        const fetchCarData = async () => {
            const data = await getCarData(ID);
            const currentDate = new Date();
            const auctionDeadline = new Date(data?.deadline);

            setCarData(data);
            setWagerInputs({ ...wagerInputs, auctionID: data?._id });
            setWinners(data?.winners);

            if (session) {
                const userWager = await getOneUserWager(
                    data?._id,
                    session?.user.id
                );
                !userWager.length
                    ? setAlreadyWagered(false)
                    : setAlreadyWagered(true);
            }

            if (data) {
                const transactions = await getAuctionTransactions(data._id);
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

    const closeWagerModal = () => {
        setToggleWagerModal(false);
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
        setIsButtonClicked(true);
        const fixedWagerAmount = 10;

        const pattern = /^[0-9]+$/;
        if (pattern.test(String(wagerInputs.priceGuessed))) {
            setInvalidPrice(false);
        } else {
            setInvalidPrice(true);
            return;
        }

        if (pattern.test(String(fixedWagerAmount))) {
            setInvalidWager(false);
        } else {
            setInvalidWager(true);
            return;
        }
        // ensure wagerAmount is defined and is a number greater than zero
        const wagerAmount = wagerInputs.wagerAmount ?? 0;
        if (fixedWagerAmount > walletBalance) {
            console.log("Insufficient funds. Please top-up your wallet."); // check if the defined wager amount is more than the wallet balance
            setInsufficientFunds(true);
            return;
        } else {
            setInsufficientFunds(false);
        }

        try {
            // the wallet has been successfully updated, place the wager
            const wagerResponse = await createWager({
                ...wagerInputs,
                wagerAmount: fixedWagerAmount,
                user: sessionData.user,
                auctionIdentifierId: carData.auction_id,
            });
            const data = await wagerResponse.json();

            if (
                data.message ===
                "This wager amount has already been used for this auction"
            ) {
                setWagerAmountAlreadyExists(true);
                setIsButtonClicked(false);
                return;
            }
            setWagerAmountAlreadyExists(false);

            if (!wagerResponse.ok) {
                console.error("Failed to place wager");
                return;
            }

            // update the prize pool
            await addPrizePool(
                {
                    pot:
                        carData.pot + Math.floor(fixedWagerAmount * 0.88) ||
                        Math.floor(fixedWagerAmount * 0.88),
                },
                urlPath.id
            );

            // deduct the wagerAmount from the wallet
            const walletResponse = await fetch("/api/wallet", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ wagerAmount: fixedWagerAmount }),
            });

            const walletData = await walletResponse.json();
            if (!walletResponse.ok) {
                console.error("Failed to update wallet balance:", walletData); // if the wallet update was not successful, log the error and stop
                return;
            }

            //websocket
            newSocket.emit("wager", {
                ...wagerInputs,
                wagerAmount: fixedWagerAmount,
                user: sessionData.user,
                auctionIdentifierId: carData.auction_id,
            });

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

    const toggleCarImageModal = () => {
        setShowCarImageModal((prev) => !prev);
    };

    return (
        <div className="tw-w-full tw-flex tw-flex-col tw-items-center">
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
                        prize={prize}
                        walletBalance={walletBalance}
                        insufficientFunds={insufficientFunds}
                        invalidPrice={invalidPrice}
                        invalidWager={invalidWager}
                        isButtonClicked={isButtonClicked}
                        closeWagerModal={closeWagerModal}
                        wagerAmountAlreadyExists={wagerAmountAlreadyExists}
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
                        auctionEnded={auctionEnded}
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
                                pot={prize}
                                comments={carData.comments}
                                views={carData.views}
                                watchers={carData.watchers}
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
                            auctionEnded={auctionEnded}
                        />
                    </div>
                    {carData ? (
                        <>
                            <PhotosLayout
                                images_list={carData.images_list}
                                img={carData.image}
                                showCarImageModal={showCarImageModal}
                                toggleModal={toggleCarImageModal}
                            />
                            <ArticleSection
                                images_list={carData.images_list}
                                description={carData.description}
                                toggleWagerModal={showWagerModal}
                                alreadyWagered={alreadyWagered}
                                auctionEnded={auctionEnded}
                            />
                        </>
                    ) : null}
                    <div className="tw-block sm:tw-hidden tw-mt-8">
                        {winners && wagersData ? (
                            <WinnersSection
                                price={carData?.price}
                                winners={winners}
                            />
                        ) : null}
                    </div>
                    <div className="tw-block sm:tw-hidden tw-mt-8">
                        {wagersData ? (
                            <WagersSection
                                toggleWagerModal={showWagerModal}
                                players_num={playerNum}
                                wagers={wagersData}
                                alreadyWagered={alreadyWagered}
                                auctionEnded={auctionEnded}
                            />
                        ) : null}
                    </div>
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
                                toggleCarImageModal={toggleCarImageModal}
                            />
                        </div>
                    ) : null}
                    <GuessThePriceInfoSection />
                    <CommentsSection pageID={ID} pageType="auction" />
                </div>
                <div className="right-container-marker tw-w-full tw-basis-1/3 tw-pl-0 lg:tw-pl-8 tw-hidden lg:tw-flex lg:tw-flex-col lg:tw-gap-8">
                    {winners && wagersData ? (
                        <WinnersSection
                            price={carData?.price}
                            winners={winners}
                        />
                    ) : null}
                    {wagersData ? (
                        <WagersSection
                            toggleWagerModal={showWagerModal}
                            players_num={playerNum}
                            wagers={wagersData}
                            alreadyWagered={alreadyWagered}
                            auctionEnded={auctionEnded}
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
                            toggleCarImageModal={toggleCarImageModal}
                        />
                    ) : null}
                </div>
            </div>
            <GamesYouMightLike />
        </div>
    );
};

export default CarViewPage;
