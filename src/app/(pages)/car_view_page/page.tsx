import React from 'react'
import Links from '../../components/links'
import { WatchAndWagerButtons, TitleContainer, PhotosLayout, ArticleSection, WagersSection, GuessThePriceInfoSection, DetailsSection, CommentsSection, GamesYouMightLike } from '@/app/ui/car_view_page/page'
import { carDataOne, auctionDataOne } from '../../../sample_data'
import { SubscribeSmall } from '../../components/subscribe'
import Footer from '../../components/footer'
import { LatestNews } from '../../components/how_hammeshift_works'
import { fetchCarData } from '@/app/lib/data'


const CarViewPage = async () => {
    fetchCarData();
    return (
        <div className='tw-flex tw-flex-col tw-items-center'>
            <Links />
            <div className='section-container tw-flex tw-justify-between tw-items-center tw-mt-4 md:tw-mt-8'>
                <div className='tw-w-auto tw-h-[28px] tw-flex tw-items-center tw-bg-[#184C80] tw-font-bold tw-rounded-full tw-px-2.5 tw-py-2 tw-text-[14px]'>GUESS THE PRICE</div>
                <div className='tw-hidden sm:tw-block'>
                    <WatchAndWagerButtons />
                </div>
            </div>
            <div className='section-container tw-w-full tw-mt-8 tw-flex tw-flex-col lg:tw-flex-row'>
                <div className='left-container-marker tw-w-full tw-basis-2/3 tw-pl-0 lg:tw-pr-8'>
                    <TitleContainer
                        year={carDataOne.year}
                        make={carDataOne.make}
                        model={carDataOne.model}
                        current_bid={auctionDataOne.current_bid}
                        bids_num={auctionDataOne.bids_num}
                        ending_date={auctionDataOne.ending_date}
                        time_left={auctionDataOne.time_left}
                        players_num={auctionDataOne.players_num}
                        prize={auctionDataOne.prize}
                    />
                    <div className='tw-block sm:tw-hidden tw-mt-8'>
                        <WatchAndWagerButtons />
                    </div>
                    <PhotosLayout images_list={carDataOne.images_list} img={carDataOne.img} />
                    <ArticleSection images_list={carDataOne.images_list} description={carDataOne.description} />
                    <div className='tw-block sm:tw-hidden tw-mt-8'>
                        <WagersSection />
                    </div>
                    <GuessThePriceInfoSection />
                    <div className='tw-block sm:tw-hidden tw-mt-8'>
                        <DetailsSection
                            website={carDataOne.website}
                            make={carDataOne.make}
                            model={carDataOne.model}
                            seller={carDataOne.seller}
                            location={carDataOne.location}
                            mileage="55,400"
                            listing_type={carDataOne.listing_type}
                            lot_num={carDataOne.lot_num}
                            listing_details={carDataOne.listing_details}
                            images_list={carDataOne.images_list}
                        />
                    </div>
                    <CommentsSection />

                </div>
                <div className='right-container-marker tw-w-full tw-basis-1/3 tw-pl-0 lg:tw-pl-8 tw-hidden lg:tw-block'>
                    <WagersSection />
                    <DetailsSection
                        website={carDataOne.website}
                        make={carDataOne.make}
                        model={carDataOne.model}
                        seller={carDataOne.seller}
                        location={carDataOne.location}
                        mileage="55,400"
                        listing_type={carDataOne.listing_type}
                        lot_num={carDataOne.lot_num}
                        listing_details={carDataOne.listing_details}
                        images_list={carDataOne.images_list}
                    />
                </div>
            </div>
            <GamesYouMightLike />
            <LatestNews />
            <SubscribeSmall />
            <Footer />
        </div>
    )
}

export default CarViewPage;