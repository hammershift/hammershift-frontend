"use client"
import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import GiftIcon from '../../../public/images/gift-02.svg'
import Image from 'next/image'
import DropdownArrow from '../../../public/images/dropdown.svg'
import MagnifyingGlass from '../../../public/images/magnifying-glass.svg'

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
    const [bgColor, setBgColor] = useState({});
    useEffect(() => {
        if (menuOpen === true) {
            setBgColor({ backgroundColor: "#1A2C3D" })
        } else {
            setBgColor({})
        }
    }, [menuOpen])
    return (
        <div className="tw-relative tw-inline-block tw-text-left">
            <div>
                <button type="button" className="tw-w-[140px] tw-inline-flex tw-justify-between tw-items-center tw-gap-x-1.5 tw-rounded-md tw-px-3 tw-py-2.5 tw-text-sm  tw-text-white-900 tw-shadow-sm tw-bg-[#172431] hover:tw-bg-[#1A2C3D]" id="menu-button" aria-expanded="true" aria-haspopup="true" style={bgColor} onClick={() => setMenuOpen(prev => !prev)}>
                    Make
                    <Image src={DropdownArrow} width={12} height={12} alt='dropdown arrow' className='tw-w-[12px] tw-h-[12px]' />
                </button>
            </div>

            {menuOpen &&

                <div className="tw-absolute tw-left-0 tw-z-10 tw-mt-2 tw-w-[640px] tw-h-[362px] tw-origin-top-right tw-rounded-md tw-bg-[#1A2C3D] tw-text-white tw-shadow-lg " role="menu" aria-labelledby="menu-button" tabIndex={-1}>
                    <div className="tw-p-4" role="none">
                        <div className='tw-flex tw-items-center tw-bg-white/5 tw-rounded tw-py-2 tw-px-3'>
                            <Image src={MagnifyingGlass} width={20} height={20} alt='dropdown arrow' className='tw-w-[20px] tw-h-[20px] tw-mr-2' />
                            <input className='tw-bg-transparent tw-w-full' placeholder='Search' />
                        </div>
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