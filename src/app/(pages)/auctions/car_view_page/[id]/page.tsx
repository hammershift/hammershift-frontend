"use client";
import React, { Suspense, useEffect, useState } from 'react'
import { WatchAndWagerButtons, PhotosLayout, ArticleSection, WagersSection, DetailsSection, CommentsSection, GamesYouMightLike } from '@/app/ui/car_view_page/CarViewPage'
import TitleContainer from '@/app/ui/car_view_page/CarViewPage'
import GuessThePriceInfoSection from '@/app/ui/car_view_page/GuessThePriceInfoSection'
import { auctionDataOne, carDataTwo } from '../../../../../sample_data'
import { getCarData } from '@/lib/data'



const CarViewPage = ({ params }: { params: { id: string } }) => {
    const [carData, setCarData] = useState<any>(null);

    const ID = params.id;


    useEffect(() => {
        getCarData(ID)
            .then((data) => {
                return setCarData(data);
            })
    }, [])

    const currencyString = new Intl.NumberFormat().format(carData?.price || 0)

    const date = new Date(carData?.deadline || "2023-12-01T03:27:01.087+00:00");
    const formattedDateString = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    }).format(date);

    return (
        <>
            <div className='section-container tw-flex tw-justify-between tw-items-center tw-mt-4 md:tw-mt-8'>
                <div className='tw-w-auto tw-h-[28px] tw-flex tw-items-center tw-bg-[#184C80] tw-font-bold tw-rounded-full tw-px-2.5 tw-py-2 tw-text-[14px]'>GUESS THE PRICE</div>
                <div className='tw-hidden sm:tw-block'>
                    <WatchAndWagerButtons />
                </div>
            </div>
            <div className='section-container tw-w-full tw-mt-8 tw-flex tw-flex-col lg:tw-flex-row'>
                <div className='left-container-marker tw-w-full tw-basis-2/3 tw-pl-0 lg:tw-pr-8'>
                    {
                        carData ? (

                            <TitleContainer
                                year={carData.year}
                                make={carData.make}
                                model={carData.model}
                                current_bid={currencyString}
                                bids_num={carData.bids}
                                ending_date={formattedDateString}
                                deadline={carData.deadline}
                                players_num={auctionDataOne.players_num}
                                prize={auctionDataOne.prize}
                            />

                        ) : null
                    }
                    <div className='tw-block sm:tw-hidden tw-mt-8'>
                        <WatchAndWagerButtons />
                    </div>
                    {
                        carData ? (
                            <>
                                <PhotosLayout images_list={carData.images_list} img={carData.image} />
                                <ArticleSection images_list={carData.images_list} description={carData.description} />

                            </>

                        ) : null
                    }
                    <div className='tw-block sm:tw-hidden tw-mt-8'>
                        <WagersSection />
                    </div>
                    <GuessThePriceInfoSection />

                    {
                        carData ? (
                            <div className='tw-block sm:tw-hidden tw-mt-8'>
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

                        ) : null
                    }
                    <CommentsSection />

                </div>
                <div className='right-container-marker tw-w-full tw-basis-1/3 tw-pl-0 lg:tw-pl-8 tw-hidden lg:tw-block'>
                    <WagersSection />
                    {
                        carData ? (
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

                        ) : null
                    }
                </div>
            </div>
            <GamesYouMightLike />

        </>
    )
}

export default CarViewPage;