import { getCars } from "@/app/lib/data"

import { AuctionListing } from '@/app/ui/auction_listing_page/page';

const AuctionListingPage = async () => {
    const listCarData = await getCars({ limit: 21 })

    return (
        <div className='tw-flex tw-flex-col tw-items-center'>
            <AuctionListing defaultListing={listCarData.cars} carsCount={listCarData.total} />
        </div>
    )
}

export default AuctionListingPage