import Link from 'next/link'
import React from 'react'
import GiftIcon from '../../../public/images/gift-02.svg'
import Image from 'next/image'

const AuctionListingPage = () => {
    return (
        <div className='tw-flex tw-flex-col tw-items-center'>
            <TopNavigation />
            <Filters />
        </div>
    )
}

export default AuctionListingPage


export const TopNavigation = () => {
    return (
        <main className='section-container tw-flex tw-justify-center'>
            <div className='tw-grid tw-grid-cols-5 tw-gap-10 tw-py-4'>
                <Link href="/homepage" className='tw-flex'>
                    <Image src={GiftIcon} width={20} height={20} alt="gift icon" className='tw-w-[20px] tw-h-[20px] tw-mr-2' />
                    {`TODAY\'S MINI GAME`}</Link >
                <Link href="/homepage">{`TOURNAMENTS`}</Link>
                <Link href="/homepage">{`HIGH-ROLLERS`}</Link>
                <Link href="/homepage">{`ABOUT HAMMERSHIFT`}</Link>
                <Link href="/homepage">{`HOW IT WORKS`}</Link>

            </div>
        </main>

    )
}

const Filters = () => {
    return (
        <div className='tw-flex tw-justify-between tw-w-screen tw-px-4 md:tw-px-16 2xl:tw-w-[1440px]'>
            <div className='left-container-marker tw-flex'>
                <div>Live Games</div>
                <div>100</div>
                <div>Dropdown</div>
                <div>Dropdown</div>
                <div>Dropdown</div>
                <div>Dropdown</div>

            </div>
            <div className='right-container-marker tw-flex'>
                <div>image</div>
                <div>image</div>
                <div>Dropdown</div>
            </div>

        </div>

    )
}