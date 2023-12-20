
import React from 'react'
import AuctionsList from './AuctionsList'
import { FiltersAndSortProps } from '@/app/components/filter_and_sort'
import { getCarsWithFilter } from '@/lib/data'

interface AuctionsListingProps extends FiltersAndSortProps {
    loadMore: number;
}

const AuctionsListing: React.FC<AuctionsListingProps> = async ({ filters, setFilters, loadMore }) => {

    const response = await getCarsWithFilter({ ...filters, limit: loadMore })
    const listing = response?.cars
    const totalAuctions = response?.total

    return (
        <div>
            <div className='tw-pb-32 '>
                <section className='tw-w-screen tw-px-4 md:tw-px-16 2xl:tw-w-[1440px] tw-overflow-hidden'>
                    <div className=' tw-w-full 2xl:tw-w-[1312px] '>
                        {
                            listing
                            && <AuctionsList listing={listing} />
                        }
                    </div>
                </section>
                {/* <div className='tw-w-screen tw-px-4 md:tw-px-16 2xl:tw-w-[1440px] '>
                    <div className='tw-text-[18px] tw-opacity-50 tw-text-center tw-mt-16 tw-mb-4'>{`Showing ${listing.length > 0 ? listing?.length : '0'} of ${totalAuctions || '0'
                        } auctions`}</div>

                    </div>  */}
            </div>
        </div>
    )
}

export default AuctionsListing