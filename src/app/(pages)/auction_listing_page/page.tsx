"use client"
import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'

import Links from '../../components/links'
import FiltersAndSort from '../../components/filter_and_sort'
import GamesCard from '../../components/card'
import { LatestNews } from '../../components/how_hammeshift_works'
import { SubscribeSmall } from '../../components/subscribe'
import Footer from '../../components/footer'

import MagnifyingGlass from '../../../../public/images/magnifying-glass.svg'


const AuctionListingPage = () => {
    return (
        <div className='tw-flex tw-flex-col tw-items-center'>
            <Links />
            <FiltersAndSort />
            <div className='tw-pb-16 '>
                {/* To be replaced by array.map */}
                <GamesSection />
                <div className='tw-w-screen tw-px-4 md:tw-px-16 2xl:tw-w-[1440px] '>
                    <div className='tw-text-[18px] tw-opacity-50 tw-text-center tw-mt-16 tw-mb-4'>Showing 21 of 100 auctions</div>
                    <button className='btn-transparent-white tw-w-full tw-text-[18px]' style={{ paddingTop: "16px", paddingBottom: "16px" }}>Load more</button>

                </div>
            </div>
            <LatestNews />
            <SubscribeSmall />
            <Footer />

        </div>
    )
}

export default AuctionListingPage




const GamesSection = () => {
    return (
        <section className='tw-w-screen tw-px-4 md:tw-px-16 2xl:tw-w-[1440px] tw-overflow-hidden'>
            <div className=' tw-w-full 2xl:tw-w-[1312px] '>
                <div className=' tw-grid tw-grid-cols-2 md:tw-grid-cols-3 tw-gap-x-4 md:tw-gap-x-6 tw-gap-y-8 md:tw-gap-y-16 tw-mt-12 '>
                    {/* to be replaced by array.map */}
                    <GamesCard />
                    <GamesCard />
                    <GamesCard />
                    <GamesCard />
                    <GamesCard />
                    <GamesCard />
                    <GamesCard />
                    <GamesCard />
                    <GamesCard />
                    <GamesCard />
                    <GamesCard />
                    <GamesCard />

                </div>
            </div>
        </section>
    )
}



const FilterDropdownMenu = () => {
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

