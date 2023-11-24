import { Suspense } from 'react';
import FiltersAndSort from "@/app/components/filter_and_sort"
import { getCars, getCarsCount } from "@/app/lib/data"
import { GamesCard } from "@/app/components/card"
import { AuctionListing } from '@/app/ui/auction_listing_page/page';

const AuctionListingPage = async () => {
    const listCarData = await getCars({ limit: 21 })
    const carsCount = await getCarsCount();
    return (
        <div className='tw-flex tw-flex-col tw-items-center'>

            <AuctionListing defaultListing={listCarData} carsCount={carsCount} />
        </div>
    )
}

export default AuctionListingPage