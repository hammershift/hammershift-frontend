import FiltersAndSort from "@/app/components/filter_and_sort"
import { GamesSection } from "@/app/ui/auction_listing_page/page"

const AuctionListingPage = () => {
    return (
        <div className='tw-flex tw-flex-col tw-items-center'>
            <FiltersAndSort />
            <div className='tw-pb-16 '>
                {/* To be replaced by array.map */}
                <GamesSection />
                <div className='tw-w-screen tw-px-4 md:tw-px-16 2xl:tw-w-[1440px] '>
                    <div className='tw-text-[18px] tw-opacity-50 tw-text-center tw-mt-16 tw-mb-4'>Showing 21 of 100 auctions</div>
                    <button className='btn-transparent-white tw-w-full tw-text-[18px]' style={{ paddingTop: "16px", paddingBottom: "16px" }}>Load more</button>

                </div>
            </div>


        </div>
    )
}

export default AuctionListingPage