import React from 'react'
import { TopNavigation } from '../auction_listing_page/page'

const CarViewPage = () => {
    return (
        <div className='tw-flex tw-flex-col tw-items-center'>
            <TopNavigation />
            <GuessThePrice />

        </div>
    )
}

export default CarViewPage


const GuessThePrice = () => {
    return (
        <div className='tw-w-screen tw-flex tw-justify-between tw-px-4 md:tw-px-16 tw-pt-8 md:tw-pt-16 2xl:tw-w-[1440px]'>
            <div className='tw-w-auto tw-flex tw-items-center tw-bg-[#184C80] tw-font-bold tw-rounded-full tw-px-2.5 tw-py-2 tw-text-[14px]'>GUESS THE PRICE</div>
            <div>
                <button className='btn-transparent-white'>WATCH</button>
                <button className='btn-yellow tw-ml-2'>PLACE MY WAGER</button>
            </div>

        </div>
    )
}

const LeftContainer = () => {
    return (
        <div>
            Left container
        </div>
    )
}


