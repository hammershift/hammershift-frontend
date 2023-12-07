"use client";
import React, { Suspense, useEffect, useState } from "react";
import {
    WatchAndWagerButtons,
    PhotosLayout,
    ArticleSection,
    WagersSection,
    DetailsSection,
    CommentsSection,
    GamesYouMightLike,
} from "@/app/ui/car_view_page/CarViewPage";
import TitleContainer from "@/app/ui/car_view_page/CarViewPage";
import GuessThePriceInfoSection from "@/app/ui/car_view_page/GuessThePriceInfoSection";
import { auctionDataOne, carDataTwo } from "../../../../../sample_data";
import { addPrizePool, createWager, getCarData } from "@/lib/data";
import { TimerProvider } from "@/app/_context/TimerContext";
import WagerModal from "@/app/components/wager_modal";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";

const CarViewPage = ({ params }: { params: { id: string } }) => {
    const urlPath = useParams();
    const { data: session } = useSession();
    const [carData, setCarData] = useState<any>(null);
    const [toggleWagerModal, setToggleWagerModal] = useState(false);

    const ID = params.id;

    useEffect(() => {
        const fetchCarData = async () => {
            const data = await getCarData(ID);
            setCarData(data);
            setWagerInputs({ ...wagerInputs, auctionID: data?._id });
        };

        fetchCarData();
    }, [ID, toggleWagerModal]);

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

    const [wagerInputs, setWagerInputs] = useState<WagerInputsI>({
        user: {
            _id: session?.user.id,
            fullName: session?.user.fullName,
            username: session?.user.username,
        },
    });

    interface WagerInputsI {
        auctionID?: string;
        priceGuessed?: number;
        wagerAmount?: number | undefined;
        user?: {
            _id: string;
            fullName: string;
            username: string;
        };
    }

    const handleWagerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        switch (e.target.name) {
            case "price-guessed":
                setWagerInputs({
                    ...wagerInputs,
                    priceGuessed: Number(e.target.value),
                });
                console.log(wagerInputs);
                break;
            case "wager-amount":
                setWagerInputs({
                    ...wagerInputs,
                    wagerAmount: Number(e.target.value),
                });
                break;
            default:
                break;
        }
    };

    const handleWagerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (wagerInputs.wagerAmount) {
            await addPrizePool(
                {
                    pot:
                        carData.pot +
                            Math.floor(wagerInputs.wagerAmount * 0.88) ||
                        Math.floor(wagerInputs.wagerAmount * 0.88),
                },
                urlPath.id
            );
        }
        await createWager(wagerInputs);
        console.log("wager created");

        setToggleWagerModal(false);
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
                    />
                </TimerProvider>
            ) : null}
            <div className="section-container tw-flex tw-justify-between tw-items-center tw-mt-4 md:tw-mt-8">
                <div className="tw-w-auto tw-h-[28px] tw-flex tw-items-center tw-bg-[#184C80] tw-font-bold tw-rounded-full tw-px-2.5 tw-py-2 tw-text-[14px]">
                    GUESS THE PRICE
                </div>
                <div className="tw-hidden sm:tw-block">
                    <WatchAndWagerButtons toggleWagerModal={showWagerModal} />
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
                                players_num={auctionDataOne.players_num}
                                prize={auctionDataOne.prize}
                            />
                        </TimerProvider>
                    ) : null}
                    <div className="tw-block sm:tw-hidden tw-mt-8">
                        <WatchAndWagerButtons
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
                            />
                        </>
                    ) : null}
                    <div className="tw-block sm:tw-hidden tw-mt-8">
                        <WagersSection toggleWagerModal={showWagerModal} />
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
                    <CommentsSection />
                </div>
                <div className="right-container-marker tw-w-full tw-basis-1/3 tw-pl-0 lg:tw-pl-8 tw-hidden lg:tw-block">
                    <WagersSection toggleWagerModal={showWagerModal} />
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
