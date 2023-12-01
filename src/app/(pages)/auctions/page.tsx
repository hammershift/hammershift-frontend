import { getCars } from "@/lib/data"
import { carDataThree } from "@/sample_data";

import { AuctionListing } from '@/app/ui/auction_listing_page/AuctionListingPage';

const AuctionListingPage = async () => {
    const listCarData = await getCars({ limit: 21 }) || carDataThree;

    return (
        <div className='tw-flex tw-flex-col tw-items-center'>
            <AuctionListing defaultListing={listCarData.cars} carsCount={listCarData.total} />
        </div>
    )
}

export default AuctionListingPage

