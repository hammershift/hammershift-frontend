import React, { Suspense } from 'react'
import Links from '../../../../components/links'
import { WatchAndWagerButtons, TitleContainer, PhotosLayout, ArticleSection, WagersSection, DetailsSection, CommentsSection, GamesYouMightLike } from '@/app/ui/car_view_page/page'
import GuessThePriceInfoSection from '@/app/ui/car_view_page/GuessThePriceInfoSection'
import { auctionDataOne, carDataTwo } from '../../../../../sample_data'
import { SubscribeSmall } from '../../../../components/subscribe'
import Footer from '../../../../components/footer'
import { LatestNews } from '../../../../components/how_hammeshift_works'
import { getCarData } from '@/app/lib/data'
import { useRouter } from 'next/router'


const CarViewPage = async ({ params }: { params: { id: string } }) => {
    const ID = params.id;
    const carDataOne = await getCarData(ID) || carDataTwo;
    const currencyString = new Intl.NumberFormat().format(carDataOne.price)

    const date = new Date(carDataOne.deadline);
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
                    <Suspense fallback={<p>Loading...</p>}>
                        <TitleContainer
                            year={carDataOne.year}
                            make={carDataOne.make}
                            model={carDataOne.model}
                            current_bid={currencyString}
                            bids_num={carDataOne.bids}
                            ending_date={formattedDateString}
                            deadline={carDataOne.deadline}
                            players_num={auctionDataOne.players_num}
                            prize={auctionDataOne.prize}
                        />
                    </Suspense>
                    <div className='tw-block sm:tw-hidden tw-mt-8'>
                        <WatchAndWagerButtons />
                    </div>
                    <Suspense fallback={<p>Loading...</p>}>
                        <PhotosLayout images_list={carDataOne.images_list} img={carDataOne.img} />
                    </Suspense>
                    <Suspense fallback={<p>Loading...</p>}>
                        <ArticleSection images_list={carDataOne.images_list} description={carDataOne.description} />
                    </Suspense>
                    <div className='tw-block sm:tw-hidden tw-mt-8'>
                        <WagersSection />
                    </div>
                    <GuessThePriceInfoSection />
                    <Suspense fallback={<p>Loading...</p>}>
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
                    </Suspense>
                    <CommentsSection />

                </div>
                <div className='right-container-marker tw-w-full tw-basis-1/3 tw-pl-0 lg:tw-pl-8 tw-hidden lg:tw-block'>
                    <WagersSection />
                    <Suspense fallback={<p>Loading...</p>}>
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
                    </Suspense>
                </div>
            </div>
            <GamesYouMightLike />

        </>
    )
}

export default CarViewPage;