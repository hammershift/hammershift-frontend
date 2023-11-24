"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Suspense } from 'react'
import { getCars } from '@/app/lib/data'
import { GamesCard } from '../../components/card'
import MagnifyingGlass from '../../../../public/images/magnifying-glass.svg'
import { carDataTwo } from '@/sample_data'

// interface GamesCardProps {
//     make: string,
//     year: string
//     model: string,
//     description: string[],
//     img: string,
//     price: number,

// }


export const AuctionListing = ({ defaultListing, carsCount }: { defaultListing: any, carsCount: number }) => {
    const [loadMore, setLoadMore] = useState(21)
    const [listing, setListing] = useState(Array());
    const [loading, setLoading] = useState(false);
    const [totalAuctions, setTotalAuctions] = useState(0)

    useEffect(() => {
        if (defaultListing) setListing(defaultListing)
        if (carsCount) setTotalAuctions(carsCount)
    }, [])

    const clickHandler = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        if (!loading) setLoadMore((prev) => prev + 21);
    }

    useEffect(() => {
        setLoading(true);
        getCars({ limit: loadMore })
            .then((data) => {
                setLoading(false)
                setListing((prev) => data)
            })
    }, [loadMore])

    return (
        <div className='tw-pb-16 '>
            <section className='tw-w-screen tw-px-4 md:tw-px-16 2xl:tw-w-[1440px] tw-overflow-hidden'>
                <div className=' tw-w-full 2xl:tw-w-[1312px] '>
                    <Suspense fallback={<div>Loading...</div>}>
                        <div className=' tw-grid tw-grid-cols-2 md:tw-grid-cols-3 tw-gap-x-4 md:tw-gap-x-6 tw-gap-y-8 md:tw-gap-y-16 tw-mt-12 '>
                            {
                                listing &&
                                listing.map((car: any) => <div key={car._id}>
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
                    </Suspense>
                </div>
            </section>
            <div className='tw-w-screen tw-px-4 md:tw-px-16 2xl:tw-w-[1440px] '>
                <div className='tw-text-[18px] tw-opacity-50 tw-text-center tw-mt-16 tw-mb-4'>{`Showing ${listing.length} of ${totalAuctions} auctions`}</div>
                <button className={`btn-transparent-white tw-w-full tw-text-[18px] ${listing.length >= totalAuctions && "tw-hidden"}`} style={{ paddingTop: "16px", paddingBottom: "16px" }} onClick={clickHandler}>Load more</button>

            </div>
        </div>
    )
}




export const FilterDropdownMenu = () => {
    return (
        <div className="slide-in-top tw-absolute tw-flex tw-flex-col tw-text-white tw-bg-[#0F1923] tw-p-4 tw-w-full tw-h-full tw-z-50">
            <div className="tw-bg-shade-100 tw-flex tw-p-2 tw-rounded tw-mt-8">
                <Image src={MagnifyingGlass} width={15} height={15} alt="magnifying glass" className="tw-w-auto tw-h-auto" />
                <input
                    className="tw-ml-2 tw-bg-shade-100 "
                    placeholder="Search make, model, year..."
                ></input>
            </div>

        </div>
    )
}
