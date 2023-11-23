import FiltersAndSort from "@/app/components/filter_and_sort"
import { getAllCars } from "@/app/lib/data"
import { GamesCard } from "@/app/components/card"

const AuctionListingPage = async () => {
    const listCarData = await getAllCars({ limit: 21, offset: 0 })
    return (
        <div className='tw-flex tw-flex-col tw-items-center'>
            <FiltersAndSort />
            <div className='tw-pb-16 '>
                <section className='tw-w-screen tw-px-4 md:tw-px-16 2xl:tw-w-[1440px] tw-overflow-hidden'>
                    <div className=' tw-w-full 2xl:tw-w-[1312px] '>
                        <div className=' tw-grid tw-grid-cols-2 md:tw-grid-cols-3 tw-gap-x-4 md:tw-gap-x-6 tw-gap-y-8 md:tw-gap-y-16 tw-mt-12 '>
                            {listCarData.map((car: any) => <div key={car._id}>
                                <GamesCard
                                    auction_id={car.auction_id}
                                    make={car.make}
                                    year={car.year}
                                    model={car.model}
                                    description={car.description}
                                    img={car.img}
                                    price={car.price}
                                />
                            </div>
                            )}

                        </div>
                    </div>
                </section>
                <div className='tw-w-screen tw-px-4 md:tw-px-16 2xl:tw-w-[1440px] '>
                    <div className='tw-text-[18px] tw-opacity-50 tw-text-center tw-mt-16 tw-mb-4'>Showing 21 of 100 auctions</div>
                    <button className='btn-transparent-white tw-w-full tw-text-[18px]' style={{ paddingTop: "16px", paddingBottom: "16px" }}>Load more</button>

                </div>
            </div>


        </div>
    )
}

export default AuctionListingPage