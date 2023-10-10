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
import HowHammerShiftWorks from '../components/how_hammeshift_works'
import { articleData } from '@/sample_data'
import { SubscribeSmall } from '../components/subscribe'
import Footer from '../components/footer'

const AuctionListingPage = () => {
    return (
        <div className='tw-flex tw-flex-col tw-items-center'>
            <TopNavigation />
            <Filters />
            <div className='tw-my-16'>
                {/* To be replaced by array.map */}
                <GamesSection />
                <GamesSection />
                <GamesSection />
                <div className='tw-text-[18px] tw-opacity-50 tw-text-center tw-mt-16 tw-mb-4'>Showing 21 of 100 auctions</div>
                <button className='btn-transparent-white tw-w-full tw-text-[18px]' style={{ paddingTop: "16px", paddingBottom: "16px" }}>Load more</button>
            </div>
            <HowHammerShiftWorks articleData={articleData} />
            <SubscribeSmall />
            <Footer />

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
            <div className='left-container-marker tw-flex tw-items-center'>
                <div>Live Games <span className='tw-opacity-50'> 100</span></div>
                <MakeDropdown />
                <CategoryDropdown />
                <EraDropdown />
                <LocationDropdown />

            </div>
            <div className='right-container-marker tw-flex tw-items-center'>
                <Image src={GridIcon} width={24} height={24} alt="gift icon" className='tw-w-[24px] tw-h-[24px]' />
                <Image src={ListIcon} width={24} height={24} alt="gift icon" className='tw-w-[24px] tw-h-[24px] tw-mx-6' />
                <SortDropdown />
            </div>

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
        <section className='tw-overflow-hidden'>
            <div className=' tw-w-[632px] sm:tw-w-[1312px] '>
                <div className=' tw-grid tw-grid-cols-3 tw-gap-4 sm:tw-gap-8 tw-mt-12 '>
                    {/* to be replaced by array.map */}
                    <div className='tw-w-[200px] sm:tw-w-[416px]'>
                        <Card />
                    </div>
                    <div className='tw-w-[200px] sm:tw-w-[416px]'>
                        <Card />
                    </div>
                    <div className='tw-w-[200px] sm:tw-w-[416px]'>
                        <Card />
                    </div>
                </div>
            </div>
        </section>
    )
}