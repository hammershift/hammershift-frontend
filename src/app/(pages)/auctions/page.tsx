import { getCars } from "@/lib/data"
import { carDataThree } from "@/sample_data";

import { AuctionListing } from '@/app/ui/auction_listing_page/AuctionListingPage';

const AuctionListingPage = async () => {


    return (
        <div className='tw-flex tw-flex-col tw-items-center'>
            <AuctionListing />
        </div>
    )
}

export default AuctionListingPage