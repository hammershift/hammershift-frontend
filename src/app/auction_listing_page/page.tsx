"use client"
import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import GiftIcon from '../../../public/images/gift-02.svg'
import Image from 'next/image'
import Card from '../components/card'
import DropdownArrow from '../../../public/images/dropdown.svg'
import MagnifyingGlass from '../../../public/images/magnifying-glass.svg'
import CheckIcon from '../../../public/images/check-black.svg'
import GridIcon from '../../../public/images/grid-01.svg'
import ListIcon from '../../../public/images/list.svg'
import FilterFunnel from '../../../public/images/filter-funnel-02.svg'
import ArrowsDown from '../../../public/images/arrows-down.svg'
import Dollar from '../../../public/images/dollar.svg'
import HourGlass from '../../../public/images/hour-glass.svg'
import AvatarOne from '../../../public/images/avatar-one.svg'
import AvatarTwo from '../../../public/images/avatar-two.svg'
import AvatarThree from '../../../public/images/avatar-three.svg'
import AvatarFour from '../../../public/images/avatar-four.svg'
import BlackMercedes from '../../../public/images/black-mercedes.svg'
import ArrowDown from '../../../public/images/arrow-down.svg'
import CancelIcon from '../../../public/images/x-icon.svg'

import { LatestNews } from '../components/how_hammeshift_works'
import { articleData } from '@/sample_data'
import { SubscribeSmall } from '../components/subscribe'
import Footer from '../components/footer'



const AuctionListingPage = () => {
    return (
        <div className='tw-flex tw-flex-col tw-items-center'>
            <TopNavigation />
            <Filters />
            <div className='tw-pb-16 '>
                {/* To be replaced by array.map */}
                <GamesSection />
                <div className='tw-w-screen tw-px-4 md:tw-px-16 2xl:tw-w-[1440px] '>
                    <div className='tw-text-[18px] tw-opacity-50 tw-text-center tw-mt-16 tw-mb-4'>Showing 21 of 100 auctions</div>
                    <button className='btn-transparent-white tw-w-full tw-text-[18px]' style={{ paddingTop: "16px", paddingBottom: "16px" }}>Load more</button>

                </div>
            </div>
            <LatestNews articleData={articleData} />
            <SubscribeSmall />
            <Footer />

        </div>
    )
}

export default AuctionListingPage


export const TopNavigation = () => {
    return (
        <main className='section-container '>
            <div className='tw-w-full tw-overflow-hidden tw-flex'>
                <div className='tw-flex tw-justify-start xl:tw-justify-center tw-py-4 tw-w-full  tw-min-w-[901px]'>
                    <Link href="/homepage" className='tw-flex'>
                        <Image src={GiftIcon} width={20} height={20} alt="gift icon" className='tw-w-[20px] tw-h-[20px] tw-mr-2' />
                        {`TODAY\'S MINI GAME`}</Link >
                    <Link href="/homepage" className='tw-ml-4 md:tw-ml-9'>TOURNAMENTS</Link>
                    <Link href="/homepage" className='tw-ml-4 md:tw-ml-9'>HIGH-ROLLERS</Link>
                    <Link href="/homepage" className='tw-ml-4 md:tw-ml-9'>ABOUT HAMMERSHIFT</Link>
                    <Link href="/homepage" className='tw-ml-4 md:tw-ml-9'>HOW IT WORKS</Link>

                </div>

            </div>
        </main>

    )
}

const Filters = () => {
    const [filterDropdownOpen, setFilterDropdownOpen] = useState(false)
    const [sortDropdownOpen, setSortDropdownOpen] = useState(false)
    return (
        <div className='tw-flex tw-justify-between tw-w-screen tw-my-4 xl:tw-my-8 tw-px-4 md:tw-px-16 2xl:tw-w-[1440px]'>
            <div className='left-container-marker tw-flex tw-items-center'>
                <div>Live Games <span className='tw-opacity-50'> 100</span></div>
                <div className='tw-hidden xl:tw-flex'>
                    <MakeDropdown />
                    <CategoryDropdown />
                    <EraDropdown />
                    <LocationDropdown />
                </div>

            </div>
            <div className='right-container-marker tw-flex tw-items-center tw-hidden xl:tw-flex'>
                <Image src={GridIcon} width={24} height={24} alt="gift icon" className='tw-w-[24px] tw-h-[24px]' />
                <Image src={ListIcon} width={24} height={24} alt="gift icon" className='tw-w-[24px] tw-h-[24px] tw-mx-6' />
                <SortDropdown />
            </div>
            <div className='tw-flex xl:tw-hidden'>
                <button onClick={() => setFilterDropdownOpen((prev) => !prev)}>
                    <Image src={FilterFunnel} width={24} height={24} alt="gift icon" className='tw-w-[24px] tw-h-[24px]' />
                </button>
                <button onClick={() => setSortDropdownOpen((prev) => !prev)}>
                    <Image src={ArrowsDown} width={24} height={24} alt="gift icon" className='tw-w-[24px] tw-h-[24px] tw-ml-6' />

                </button>
            </div>
            {/* Filter Dropdown */}
            {
                filterDropdownOpen &&
                <div className='slide-in-top tw-w-screen tw-h-screen tw-absolute tw-z-50 tw-top-0 tw-left-0 tw-bg-[#1A2C3D] tw-p-4'>
                    <div className='tw-flex tw-justify-between'>
                        <div>FILTER</div>
                        <button onClick={() => setFilterDropdownOpen((prev) => !prev)}>
                            <Image src={CancelIcon} width={24} height={24} alt="magnifying glass" className="tw-w-6 tw-h-6" />
                        </button>
                    </div>
                    <div className="tw-bg-shade-100 tw-flex tw-p-2 tw-rounded tw-mt-8">
                        <Image src={MagnifyingGlass} width={15} height={15} alt="magnifying glass" className="tw-w-auto tw-h-auto" />
                        <input
                            className="tw-ml-2 tw-bg-shade-100 "
                            placeholder="Search make, model, year..."
                        ></input>
                    </div>
                    <div>
                        <div className='tw-flex tw-justify-between tw-mt-4'>
                            <div className='tw-font-bold'>Make</div>
                            <Image src={ArrowDown} width={32} height={32} alt="magnifying glass" className="tw-w-8 tw-h-8" />
                        </div>
                        <div className='tw-flex tw-justify-between tw-mt-4'>
                            <div className='tw-font-bold'>Category</div>
                            <Image src={ArrowDown} width={32} height={32} alt="magnifying glass" className="tw-w-8 tw-h-8" />
                        </div>
                        <div className='tw-flex tw-justify-between tw-mt-4'>
                            <div className='tw-font-bold'>Era</div>
                            <Image src={ArrowDown} width={32} height={32} alt="magnifying glass" className="tw-w-8 tw-h-8" />
                        </div>
                        <div className='tw-flex tw-justify-between tw-mt-4'>
                            <div className='tw-font-bold'>Location</div>
                            <Image src={ArrowDown} width={32} height={32} alt="magnifying glass" className="tw-w-8 tw-h-8" />
                        </div>
                    </div>

                </div>
            }
            {
                sortDropdownOpen &&
                <div className='slide-in-top tw-w-screen tw-h-screen tw-absolute tw-z-50 tw-top-0 tw-left-0 tw-bg-[#1A2C3D] tw-p-4'>
                    <div className='tw-flex tw-justify-between'>
                        <div>SORT</div>
                        <button onClick={() => setSortDropdownOpen((prev) => !prev)}>
                            <Image src={CancelIcon} width={24} height={24} alt="magnifying glass" className="tw-w-6 tw-h-6" />
                        </button>
                    </div>
                </div>
            }
        </div>
    )
}




const MakeListColumnOne = ["All", "Acura", "Audi", "BMW", "Alfa Romeo", "Aston Martin", "Honda", "Jaguar", "Jeep", "Kia", "Lamborghini", "Land Rover", "Lexus"];
const MakeListColumnTwo = ["Chrysler", "Chevrolet", "Cadillac", "Buick", "Bugatti", "Bentley", "Hyundai", "Lincoln", "Lotus", "Lucid", "Maserati", "Mazda", "McLaren"];
const MakeListColumnThree = ["Genesis", "GMX", "Ford", "Fiat", "Ferrari", "Dodge", "Infiniti", "Mercedes-Benz", "Mini", "Mitsubishi", "Nissan", "Polestar", "Porsche"];

const MakeDropdown = () => {
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
        <div className="tw-relative tw-inline-block tw-text-left tw-mx-2">
            <div>
                <button type="button" className="tw-w-[140px] tw-inline-flex tw-justify-between tw-items-center tw-gap-x-1.5 tw-rounded-md tw-px-3 tw-py-2.5  tw-text-white-900 tw-shadow-sm tw-bg-[#172431] hover:tw-bg-[#1A2C3D]" style={bgColor} onClick={() => setMenuOpen(prev => !prev)}>
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
                        <div className='tw-mt-2 tw-p-2 tw-grid tw-grid-cols-3'>
                            <div>
                                {
                                    MakeListColumnOne.map((item) => {
                                        return <div className='tw-flex tw-relative tw-items-center tw-p-2' key={item}>
                                            <input type='checkbox' className="tw-relative tw-peer tw-h-5 tw-w-5 tw-cursor-pointer tw-appearance-none tw-rounded-md tw-border tw-border-white/10 tw-bg-white/5 tw-transition-opacity checked:tw-border-[#F2CA16] checked:tw-bg-[#F2CA16]" value="All" />

                                            <div className="tw-pointer-events-none tw-absolute tw-top-5 tw-left-[22px] tw--translate-y-2/4 tw--translate-x-2/4 tw-text-white tw-opacity-0 tw-transition-opacity peer-checked:tw-opacity-100">
                                                <Image src={CheckIcon} width={10} height={7} alt='dropdown arrow' className='tw-w-[10px] tw-h-[7px] tw-mr-2' />
                                            </div>
                                            <label className='tw-pl-3'>{item}</label><br />
                                        </div>
                                    })
                                }
                            </div>
                            <div>
                                {
                                    MakeListColumnTwo.map((item) => {
                                        return <div className='tw-flex tw-relative tw-items-center tw-p-2' key={item}>
                                            <input type='checkbox' className="tw-relative tw-peer tw-h-5 tw-w-5 tw-cursor-pointer tw-appearance-none tw-rounded-md tw-border tw-border-white/10 tw-bg-white/5 tw-transition-opacity checked:tw-border-[#F2CA16] checked:tw-bg-[#F2CA16]" value="All" />

                                            <div className="tw-pointer-events-none tw-absolute tw-top-5 tw-left-[22px] tw--translate-y-2/4 tw--translate-x-2/4 tw-text-white tw-opacity-0 tw-transition-opacity peer-checked:tw-opacity-100">
                                                <Image src={CheckIcon} width={10} height={7} alt='dropdown arrow' className='tw-w-[10px] tw-h-[7px] tw-mr-2' />
                                            </div>
                                            <label className='tw-pl-3'>{item}</label><br />
                                        </div>
                                    })
                                }
                            </div>
                            <div>
                                {
                                    MakeListColumnThree.map((item) => {
                                        return <div className='tw-flex tw-relative tw-items-center tw-p-2' key={item}>
                                            <input type='checkbox' className="tw-relative tw-peer tw-h-5 tw-w-5 tw-cursor-pointer tw-appearance-none tw-rounded-md tw-border tw-border-white/10 tw-bg-white/5 tw-transition-opacity checked:tw-border-[#F2CA16] checked:tw-bg-[#F2CA16]" value="All" />

                                            <div className="tw-pointer-events-none tw-absolute tw-top-5 tw-left-[22px] tw--translate-y-2/4 tw--translate-x-2/4 tw-text-white tw-opacity-0 tw-transition-opacity peer-checked:tw-opacity-100">
                                                <Image src={CheckIcon} width={10} height={7} alt='dropdown arrow' className='tw-w-[10px] tw-h-[7px] tw-mr-2' />
                                            </div>
                                            <label className='tw-pl-3'>{item}</label><br />
                                        </div>
                                    })
                                }
                            </div>

                        </div>

                    </div>
                </div>
            }
        </div>

    )
}

const CategoryListColumnOne = ["All", "Coupes", "Crossovers", "EVs and Hybrids", "Hatchbacks", "Luxury Cars", "Minivans & Vans"];
const CategoryListColumnTwo = ["Pickup Trucks", "SUVs", "Sedans", "Small Cars", "Sports Cars", "Station Wagons"];

const CategoryDropdown = () => {
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
        <div className="tw-relative tw-inline-block tw-text-left tw-mx-2">
            <div>
                <button type="button" className="tw-w-[140px] tw-inline-flex tw-justify-between tw-items-center tw-gap-x-1.5 tw-rounded-md tw-px-3 tw-py-2.5  tw-text-white-900 tw-shadow-sm tw-bg-[#172431] hover:tw-bg-[#1A2C3D]" style={bgColor} onClick={() => setMenuOpen(prev => !prev)}>
                    Category
                    <Image src={DropdownArrow} width={12} height={12} alt='dropdown arrow' className='tw-w-[12px] tw-h-[12px]' />
                </button>
            </div>

            {menuOpen &&

                <div className="tw-absolute tw-left-0 tw-z-10 tw-mt-2 tw-w-[400px] tw-h-[312px] tw-origin-top-right tw-rounded-md tw-bg-[#1A2C3D] tw-text-white tw-shadow-lg " role="menu" aria-labelledby="menu-button" tabIndex={-1}>
                    <div>
                        <div className='tw-p-4 tw-grid tw-grid-cols-2'>
                            <div>
                                {
                                    CategoryListColumnOne.map((item) => {
                                        return <div className='tw-flex tw-relative tw-items-center tw-p-2' key={item}>
                                            <input type='checkbox' className="tw-relative tw-peer tw-h-5 tw-w-5 tw-cursor-pointer tw-appearance-none tw-rounded-md tw-border tw-border-white/10 tw-bg-white/5 tw-transition-opacity checked:tw-border-[#F2CA16] checked:tw-bg-[#F2CA16]" value="All" />

                                            <div className="tw-pointer-events-none tw-absolute tw-top-5 tw-left-[22px] tw--translate-y-2/4 tw--translate-x-2/4 tw-text-white tw-opacity-0 tw-transition-opacity peer-checked:tw-opacity-100">
                                                <Image src={CheckIcon} width={10} height={7} alt='dropdown arrow' className='tw-w-[10px] tw-h-[7px] tw-mr-2' />
                                            </div>
                                            <label className='tw-pl-3'>{item}</label><br />
                                        </div>
                                    })
                                }
                            </div>
                            <div>
                                {
                                    CategoryListColumnTwo.map((item) => {
                                        return <div className='tw-flex tw-relative tw-items-center tw-p-2' key={item}>
                                            <input type='checkbox' className="tw-relative tw-peer tw-h-5 tw-w-5 tw-cursor-pointer tw-appearance-none tw-rounded-md tw-border tw-border-white/10 tw-bg-white/5 tw-transition-opacity checked:tw-border-[#F2CA16] checked:tw-bg-[#F2CA16]" value="All" />

                                            <div className="tw-pointer-events-none tw-absolute tw-top-5 tw-left-[22px] tw--translate-y-2/4 tw--translate-x-2/4 tw-text-white tw-opacity-0 tw-transition-opacity peer-checked:tw-opacity-100">
                                                <Image src={CheckIcon} width={10} height={7} alt='dropdown arrow' className='tw-w-[10px] tw-h-[7px] tw-mr-2' />
                                            </div>
                                            <label className='tw-pl-3'>{item}</label><br />
                                        </div>
                                    })
                                }
                            </div>

                        </div>

                    </div>
                </div>
            }
        </div>

    )
}

const EraListColumnOne = ["All", "2020s", "2010s", "2000s", "1990s", "1980s", "1970s"];
const EraListColumnTwo = ["1960s", "1950s", "1940s", "1930s", "1920s", "1910s", "1900 and older"];

const EraDropdown = () => {
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
        <div className="tw-relative tw-inline-block tw-text-left tw-mx-2">
            <div>
                <button type="button" className="tw-w-[140px] tw-inline-flex tw-justify-between tw-items-center tw-gap-x-1.5 tw-rounded-md tw-px-3 tw-py-2.5  tw-text-white-900 tw-shadow-sm tw-bg-[#172431] hover:tw-bg-[#1A2C3D]" style={bgColor} onClick={() => setMenuOpen(prev => !prev)}>
                    Era
                    <Image src={DropdownArrow} width={12} height={12} alt='dropdown arrow' className='tw-w-[12px] tw-h-[12px]' />
                </button>
            </div>

            {menuOpen &&

                <div className="tw-absolute tw-left-0 tw-z-10 tw-mt-2 tw-w-[400px] tw-h-[312px] tw-origin-top-right tw-rounded-md tw-bg-[#1A2C3D] tw-text-white tw-shadow-lg " role="menu" aria-labelledby="menu-button" tabIndex={-1}>
                    <div>
                        <div className='tw-p-4 tw-grid tw-grid-cols-2'>
                            <div>
                                {
                                    EraListColumnOne.map((item) => {
                                        return <div className='tw-flex tw-relative tw-items-center tw-p-2' key={item}>
                                            <input type='checkbox' className="tw-relative tw-peer tw-h-5 tw-w-5 tw-cursor-pointer tw-appearance-none tw-rounded-md tw-border tw-border-white/10 tw-bg-white/5 tw-transition-opacity checked:tw-border-[#F2CA16] checked:tw-bg-[#F2CA16]" value="All" />

                                            <div className="tw-pointer-events-none tw-absolute tw-top-5 tw-left-[22px] tw--translate-y-2/4 tw--translate-x-2/4 tw-text-white tw-opacity-0 tw-transition-opacity peer-checked:tw-opacity-100">
                                                <Image src={CheckIcon} width={10} height={7} alt='dropdown arrow' className='tw-w-[10px] tw-h-[7px] tw-mr-2' />
                                            </div>
                                            <label className='tw-pl-3'>{item}</label><br />
                                        </div>
                                    })
                                }
                            </div>
                            <div>
                                {
                                    EraListColumnTwo.map((item) => {
                                        return <div className='tw-flex tw-relative tw-items-center tw-p-2' key={item}>
                                            <input type='checkbox' className="tw-relative tw-peer tw-h-5 tw-w-5 tw-cursor-pointer tw-appearance-none tw-rounded-md tw-border tw-border-white/10 tw-bg-white/5 tw-transition-opacity checked:tw-border-[#F2CA16] checked:tw-bg-[#F2CA16]" value="All" />

                                            <div className="tw-pointer-events-none tw-absolute tw-top-5 tw-left-[22px] tw--translate-y-2/4 tw--translate-x-2/4 tw-text-white tw-opacity-0 tw-transition-opacity peer-checked:tw-opacity-100">
                                                <Image src={CheckIcon} width={10} height={7} alt='dropdown arrow' className='tw-w-[10px] tw-h-[7px] tw-mr-2' />
                                            </div>
                                            <label className='tw-pl-3'>{item}</label><br />
                                        </div>
                                    })
                                }
                            </div>

                        </div>

                    </div>
                </div>
            }
        </div>

    )
}

const LocationListColumnOne = ["All", "Alabama", "Alaska", "Idaho", "Arizona", "Arkansas", "California"];
const LocationListColumnTwo = ["Colorado", "Connecticut", "Delaware", "Florida", "Georia", "Hawaii", "Illinois"];

const LocationDropdown = () => {
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
        <div className="tw-relative tw-inline-block tw-text-left tw-mx-2">
            <div>
                <button type="button" className="tw-w-[140px] tw-inline-flex tw-justify-between tw-items-center tw-gap-x-1.5 tw-rounded-md tw-px-3 tw-py-2.5  tw-text-white-900 tw-shadow-sm tw-bg-[#172431] hover:tw-bg-[#1A2C3D]" style={bgColor} onClick={() => setMenuOpen(prev => !prev)}>
                    Location
                    <Image src={DropdownArrow} width={12} height={12} alt='dropdown arrow' className='tw-w-[12px] tw-h-[12px]' />
                </button>
            </div>

            {menuOpen &&

                <div className="tw-absolute tw-left-0 tw-z-10 tw-mt-2 tw-w-[400px] tw-h-[312px] tw-origin-top-right tw-rounded-md tw-bg-[#1A2C3D] tw-text-white tw-shadow-lg " role="menu" aria-labelledby="menu-button" tabIndex={-1}>
                    <div>
                        <div className='tw-p-4 tw-grid tw-grid-cols-2'>
                            <div>
                                {
                                    LocationListColumnOne.map((item) => {
                                        return <div className='tw-flex tw-relative tw-items-center tw-p-2' key={item}>
                                            <input type='checkbox' className="tw-relative tw-peer tw-h-5 tw-w-5 tw-cursor-pointer tw-appearance-none tw-rounded-md tw-border tw-border-white/10 tw-bg-white/5 tw-transition-opacity checked:tw-border-[#F2CA16] checked:tw-bg-[#F2CA16]" value="All" />

                                            <div className="tw-pointer-events-none tw-absolute tw-top-5 tw-left-[22px] tw--translate-y-2/4 tw--translate-x-2/4 tw-text-white tw-opacity-0 tw-transition-opacity peer-checked:tw-opacity-100">
                                                <Image src={CheckIcon} width={10} height={7} alt='dropdown arrow' className='tw-w-[10px] tw-h-[7px] tw-mr-2' />
                                            </div>
                                            <label className='tw-pl-3'>{item}</label><br />
                                        </div>
                                    })
                                }
                            </div>
                            <div>
                                {
                                    LocationListColumnTwo.map((item) => {
                                        return <div className='tw-flex tw-relative tw-items-center tw-p-2' key={item}>
                                            <input type='checkbox' className="tw-relative tw-peer tw-h-5 tw-w-5 tw-cursor-pointer tw-appearance-none tw-rounded-md tw-border tw-border-white/10 tw-bg-white/5 tw-transition-opacity checked:tw-border-[#F2CA16] checked:tw-bg-[#F2CA16]" value="All" />

                                            <div className="tw-pointer-events-none tw-absolute tw-top-5 tw-left-[22px] tw--translate-y-2/4 tw--translate-x-2/4 tw-text-white tw-opacity-0 tw-transition-opacity peer-checked:tw-opacity-100">
                                                <Image src={CheckIcon} width={10} height={7} alt='dropdown arrow' className='tw-w-[10px] tw-h-[7px] tw-mr-2' />
                                            </div>
                                            <label className='tw-pl-3'>{item}</label><br />
                                        </div>
                                    })
                                }
                            </div>

                        </div>

                    </div>
                </div>
            }
        </div>

    )
}

const SortList = ["Top Performers", "Newly Listed", "Most Expensive", "Least Expensive", "Most Bids", "Least Bids", "Ending soon"];


const SortDropdown = () => {
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
        <div className="tw-relative tw-text-left tw-mx-2">
            <div>
                <button type="button" className="tw-w-[240px] tw-inline-flex tw-justify-between tw-items-center tw-gap-x-1.5 tw-rounded-md tw-px-3 tw-py-2.5  tw-text-white-900 tw-shadow-sm tw-bg-[#172431] hover:tw-bg-[#1A2C3D]" style={bgColor} onClick={() => setMenuOpen(prev => !prev)}>
                    Sort by:
                    <Image src={DropdownArrow} width={12} height={12} alt='dropdown arrow' className='tw-w-[12px] tw-h-[12px]' />
                </button>
            </div>

            {menuOpen &&

                <div className="tw-absolute tw-right-0 tw-z-10 tw-mt-2 tw-w-[320px] tw-h-[312px] tw-origin-top-right tw-rounded-md tw-bg-[#1A2C3D] tw-text-white tw-shadow-lg " role="menu" aria-labelledby="menu-button" tabIndex={-1}>
                    <div>
                        <div className='tw-p-4'>
                            <div>
                                {
                                    SortList.map((item) => {
                                        return <div className='hover:tw-bg-white/5 tw-rounded tw-p-2' key={item}>
                                            <button className='tw-pl-3 tw-w-full '>{item}</button>
                                        </div>
                                    })
                                }
                            </div>

                        </div>

                    </div>
                </div>
            }
        </div>

    )
}

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

const GamesCard = () => {
    const cardData = {
        id: "carddata1",
        year: "1981",
        brand: "Ferrari",
        descritpion: "512 BB",
        info: "This 1981 Ferrari 512 BB is one of 929 carbureted examples produced between 1976 and 1981, and it was imported to the US in July 1981. The car was registered in Oregon through the late 2000s and was acquired by the selling dealer in 2022, reportedly from its second owner. It has been refinished in silver over black leather",
        url: BlackMercedes,
        current_bid: "$280,000",
        time_left: "02:16:00",
        activity: [
            {
                id: "ad1",
                username: "damientine",
                avatar: AvatarOne,
                wager: "$292,000",
                time: "12m ago"
            },
            {
                id: "ad2",
                username: "addisonmx",
                avatar: AvatarTwo,
                wager: "$29,500",
                time: "16m ago"
            }
        ],
        players: [
            {
                id: "play1",
                username: "user1",
                avatar: AvatarOne
            },
            {
                id: "play2",
                username: "user2",
                avatar: AvatarTwo
            },
            {
                id: "play3",
                username: "user2",
                avatar: AvatarThree
            },
            {
                id: "play4",
                username: "user2",
                avatar: AvatarFour
            },
            {
                id: "player5",
                username: "user2",
                avatar: AvatarOne
            },
            {
                id: "play6",
                username: "user2",
                avatar: AvatarTwo
            },
            {
                id: "play7",
                username: "user2",
                avatar: AvatarThree
            }
        ]
    }
    return (
        <div>
            <Image src={cardData.url} width={416} height={219} alt='ferrari' className='tw-w-full 2xl:tw-w-[416px] tw-h-auto 2xl:tw-h-[219px]  tw-object-cover tw-aspect-auto' />
            <div className='tw-font-bold tw-text-[24px] tw-py-[12px]'>{cardData.year} {cardData.brand} {cardData.descritpion}</div>
            <p className='tw-h-[60px] sm:tw-h-[72px] tw-w-full tw-text-ellipsis tw-overflow-hidden tw-text-[14px] sm:tw-text-[16px]'>This 1981 Ferrari 512 BB is one of 929 carbureted examples produced between 1976 and 1981, and it was imported to the US in July 1981. The car was registered in Oregon through the late 2000s and was acquired by the selling dealer in 2022, reportedly from its second owner. It has been refinished in silver over black leather</p>
            <div className='tw-flex tw-mt-2'>
                <Image src={Dollar} width={20} height={20} alt='dollar' className='tw-w-5 tw-h-5' />
                <div className='tw-px-2 tw-hidden sm:tw-block'>Current Bid:</div>
                <div className='tw-text-[#49C742] tw-font-bold'>{cardData.current_bid}</div>
            </div>
            <div className='tw-flex'>
                <Image src={HourGlass} width={20} height={20} alt='dollar' className='tw-w-5 tw-h-5' />
                <div className='tw-px-2 tw-hidden sm:tw-block'>Current Bid:</div>
                <div className='tw-text-[#C2451E] tw-font-bold'>{cardData.current_bid}</div>
            </div>
            <div className=' tw-bg-[#172431] tw-p-2 sm:tw-p-4 tw-my-4 tw-text-[14px] sm:tw-text-[16px]'>
                {cardData.activity.map((item) => {

                    return <div key={item.id} className='tw-flex tw-mb-2'>
                        <Image src={item.avatar} width={24} height={24} alt='dollar' className='tw-w-[24px] tw-h-[24px]' />
                        <div className='tw-ml-1 tw-flex tw-flex-wrap'>
                            <div className='tw-text-[#42A0FF] tw-mr-2'>{`@${item.username}`}</div>
                            <div>{`wagered ${item.wager}`}</div>
                            <div className='tw-text-[#DCE0D9] tw-ml-2'>{item.time}</div>
                        </div>
                    </div>
                }
                )}

                <div className='tw-relative tw-flex tw-items-center'>
                    {/* avatar images - hidden for screens smaller than sm */}
                    <div className=' tw-w-auto tw-hidden xl:tw-flex'>
                        <Image src={cardData.players[0].avatar} width={32} height={32} alt='avatar' className='tw-w-8 tw-h-8 tw-rounded-full' style={{ border: '1px solid black' }} />
                        <div className='tw-flex'>
                            {cardData.players.slice(1, 5).map((item) => {

                                return <div key={item.id} style={{ transform: `translate(${-10 + -10 * cardData.players.slice(1, 5).indexOf(item)}px ,0)` }}>
                                    <Image src={item.avatar} width={32} height={32} alt='avatar' className='tw-w-8 tw-h-8 tw-rounded-full' style={{ border: '1px solid black' }} />
                                </div>
                            }
                            )}
                        </div>
                    </div>
                    <div className='tw-ml-1 tw--translate-x-8 xl:tw-block tw-hidden'>{`and ${cardData.players.length - 5} more players to join`}</div>
                    {/* avatar images - hidden for screens bigger than sm */}
                    <div className='tw-flex tw-w-auto xl:tw-hidden tw-block'>
                        <div className='tw-flex'>
                            {cardData.players.slice(0, 2).map((item) => {

                                return <div key={item.id} style={{ transform: `translate(${-10 + -10 * cardData.players.slice(1, 5).indexOf(item)}px ,0)` }}>
                                    <Image src={item.avatar} width={32} height={32} alt='avatar' className='tw-w-8 tw-h-8 tw-rounded-full' style={{ border: '1px solid black' }} />
                                </div>
                            }
                            )}
                        </div>
                    </div>
                    <div className='tw-ml-1 tw--translate-x-1 tw-block xl:tw-hidden'>{`${cardData.players.length} players`}</div>
                </div>
            </div>
            <button className='btn-yellow-thin tw-w-full md:tw-w-auto'>Play Game</button>
        </div>
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
