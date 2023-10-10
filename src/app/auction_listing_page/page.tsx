"use client"
import Link from 'next/link'
import React, { useState } from 'react'
import GiftIcon from '../../../public/images/gift-02.svg'
import Image from 'next/image'

const AuctionListingPage = () => {
    return (
        <div className='tw-flex tw-flex-col tw-items-center'>
            <TopNavigation />
            <Filters />
            <Dropdown />
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




const Dropdown = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    return (
        <div className="tw-relative tw-inline-block tw-text-left">
            <div>
                <button type="button" className="tw-w-[140px] tw-inline-flex tw-justify-between tw-gap-x-1.5 tw-rounded-md tw-px-3 tw-py-2 tw-text-sm tw-font-semibold tw-text-white-900 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 tw-bg-[#1A2C3D] hover:tw-bg-black" id="menu-button" aria-expanded="true" aria-haspopup="true" onClick={() => setMenuOpen(prev => !prev)}>
                    Options
                    <svg className="tw--mr-1 tw-h-5 tw-w-5 tw-text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
                    </svg>
                </button>
            </div>

            {menuOpen &&

                <div className="tw-absolute tw-left-0 tw-z-10 tw-mt-2 tw-w-56 tw-origin-top-right tw-rounded-md tw-bg-[#1A2C3D] tw-text-white tw-shadow-lg tw-ring-1 tw-ring-black tw-ring-opacity-5 focus:yw-outline-none" role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabIndex={-1}>
                    <div className="tw-py-1" role="none">

                        <a href="#" className="tw-text-white tw-block tw-px-4 tw-py-2 tw-text-sm" role="menuitem" tabIndex={-1} id="menu-item-0">Account settings</a>
                        <a href="#" className="tw-text-white tw-block tw-px-4 tw-py-2 tw-text-sm" role="menuitem" tabIndex={-1} id="menu-item-1">Support</a>
                        <a href="#" className="tw-text-white tw-block tw-px-4 tw-py-2 tw-text-sm" role="menuitem" tabIndex={-1} id="menu-item-2">License</a>
                        <form method="POST" action="#" role="none">
                            <button type="submit" className="tw-text-white tw-block tw-w-full tw-px-4 tw-py-2 tw-text-left tw-text-sm" role="menuitem" tabIndex={-1} id="menu-item-3">Sign out</button>
                        </form>
                    </div>
                </div>
            }
        </div>

    )
}