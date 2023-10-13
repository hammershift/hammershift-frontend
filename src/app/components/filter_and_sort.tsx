import React, { useState, useEffect } from 'react'
import Image from 'next/image'

import CheckIcon from '../../../public/images/check-black.svg'
import GridIcon from '../../../public/images/grid-01.svg'
import ListIcon from '../../../public/images/list.svg'
import FilterFunnel from '../../../public/images/filter-funnel-02.svg'
import ArrowsDown from '../../../public/images/arrows-down.svg'
import DropdownArrow from '../../../public/images/dropdown.svg'
import ArrowDown from '../../../public/images/arrow-down.svg'
import CancelIcon from '../../../public/images/x-icon.svg'
import MagnifyingGlass from '../../../public/images/magnifying-glass.svg'


const FiltersAndSort = () => {
    const [filterDropdownOpen, setFilterDropdownOpen] = useState(false)
    const [makeDropdownOpen, setMakeDropdownOpen] = useState(false)
    const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false)
    const [eraDropdownOpen, setEraDropdownOpen] = useState(false)
    const [locationDropdownOpen, setLocationDropdownOpen] = useState(false)
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
                <div className='slide-in-top tw-w-screen tw-h-screen tw-fixed tw-z-40 tw-top-0 tw-left-0 tw-bg-[#1A2C3D] tw-p-4'>
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
                        <button className='tw-flex tw-justify-between tw-mt-4 tw-w-full' onClick={() => setMakeDropdownOpen((prev) => !prev)} >
                            <div className='tw-font-bold'>Make</div>
                            <Image src={ArrowDown} width={32} height={32} alt="magnifying glass" className="tw-w-8 tw-h-8" />
                        </button>
                        {makeDropdownOpen &&
                            <div className="tw-absolute tw-left-0 tw-z-50  tw-w-screen tw-origin-top-right tw-rounded-md tw-bg-[#1A2C3D] tw-text-white tw-p-4 tw-h-4/5 tw-overflow-y-auto"  >
                                <MakeContent columns={1} />
                            </div>
                        }
                        <button className='tw-flex tw-justify-between tw-mt-4 tw-w-full' onClick={() => setCategoryDropdownOpen((prev) => !prev)}>
                            <div className='tw-font-bold'>Category</div>
                            <Image src={ArrowDown} width={32} height={32} alt="magnifying glass" className="tw-w-8 tw-h-8" />
                        </button>
                        {categoryDropdownOpen &&
                            <div className="tw-absolute tw-left-0 tw-z-50  tw-w-screen tw-origin-top-right tw-rounded-md tw-bg-[#1A2C3D] tw-text-white tw-p-4 tw-h-3/5 tw-overflow-y-auto" >
                                <CategoryContent columns={1} />
                            </div>
                        }
                        <button className='tw-flex tw-justify-between tw-mt-4 tw-w-full' onClick={() => setEraDropdownOpen((prev) => !prev)}>
                            <div className='tw-font-bold'>Era</div>
                            <Image src={ArrowDown} width={32} height={32} alt="magnifying glass" className="tw-w-8 tw-h-8" />
                        </button>
                        {eraDropdownOpen &&
                            <div className="tw-absolute tw-left-0 tw-z-50  tw-w-screen tw-origin-top-right tw-rounded-md tw-bg-[#1A2C3D] tw-text-white tw-p-4 tw-h-3/5 tw-overflow-y-auto" >
                                <EraContent columns={1} />
                            </div>
                        }
                        <button className='tw-flex tw-justify-between tw-mt-4 tw-w-full' onClick={() => setLocationDropdownOpen((prev) => !prev)}>
                            <div className='tw-font-bold'>Location</div>
                            <Image src={ArrowDown} width={32} height={32} alt="magnifying glass" className="tw-w-8 tw-h-8" />
                        </button>
                        {locationDropdownOpen &&
                            <div className="tw-absolute tw-left-0 tw-z-50  tw-w-screen tw-origin-top-right tw-rounded-md tw-bg-[#1A2C3D] tw-text-white tw-p-4 tw-h-1/2 tw-overflow-y-auto" >
                                <LocationContent columns={1} />
                            </div>
                        }
                    </div>

                </div>
            }
            {/* Sort Dropdown */}
            {
                sortDropdownOpen &&
                <div className='slide-in-top tw-w-screen tw-h-screen tw-fixed tw-z-50 tw-top-0 tw-left-0 tw-bg-[#1A2C3D] tw-p-4'>
                    <div className='tw-flex tw-justify-between tw-py-4'>
                        <div>SORT</div>
                        <button onClick={() => setSortDropdownOpen((prev) => !prev)}>
                            <Image src={CancelIcon} width={24} height={24} alt="magnifying glass" className="tw-w-6 tw-h-6" />
                        </button>
                    </div>
                    <SortContent />
                </div>
            }
        </div>
    )
}
export default FiltersAndSort



const MakeDropdownContent = ["All", "Acura", "Audi", "BMW", "Alfa Romeo", "Aston Martin", "Honda", "Jaguar", "Jeep", "Kia", "Lamborghini", "Land Rover", "Lexus", "Chrysler", "Chevrolet", "Cadillac", "Buick", "Bugatti", "Bentley", "Hyundai", "Lincoln", "Lotus", "Lucid", "Maserati", "Mazda", "McLaren", "Genesis", "GMX", "Ford", "Fiat", "Ferrari", "Dodge", "Infiniti", "Mercedes-Benz", "Mini", "Mitsubishi", "Nissan", "Polestar", "Porsche"]

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
        <div className=" tw-relative tw-inline-block tw-text-left tw-mx-2">
            <div>
                <button type="button" className="tw-w-[140px] tw-inline-flex tw-justify-between tw-items-center tw-gap-x-1.5 tw-rounded-md tw-px-3 tw-py-2.5  tw-text-white-900 tw-shadow-sm tw-bg-[#172431] hover:tw-bg-[#1A2C3D]" style={bgColor} onClick={() => setMenuOpen(prev => !prev)}>
                    Make
                    <Image src={DropdownArrow} width={12} height={12} alt='dropdown arrow' className='tw-w-[12px] tw-h-[12px]' />
                </button>
            </div>

            {menuOpen &&

                <div className="tw-absolute tw-left-0 tw-z-10 tw-mt-2 tw-w-[640px] tw-h-[362px] tw-origin-top-right tw-rounded-md tw-bg-[#1A2C3D] tw-text-white tw-shadow-lg " >
                    <div className="tw-p-4" role="none">
                        <div className='tw-flex tw-items-center tw-bg-white/5 tw-rounded tw-py-2 tw-px-3'>
                            <Image src={MagnifyingGlass} width={20} height={20} alt='dropdown arrow' className='tw-w-[20px] tw-h-[20px] tw-mr-2' />
                            <input className='tw-bg-transparent tw-w-full' placeholder='Search' />
                        </div>
                        <div className='tw-mt-2 tw-h-[280px] tw-overflow-y-auto'>
                            <MakeContent columns={3} />
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}

interface MakeContentProps {
    columns: number;
}
const MakeContent: React.FC<MakeContentProps> = ({ columns }) => {
    return (
        <div className={` tw-h-fit tw-px-2 tw-grid tw-grid-cols-${columns} tw-grid-rows-${columns === 1 ? 39 : 13}`} >

            {
                MakeDropdownContent.map((item) => {
                    return <div className='tw-flex tw-relative tw-items-center tw-p-2' key={item}>
                        <input type='checkbox' className="tw-relative tw-peer tw-h-5 tw-w-5 tw-cursor-pointer tw-appearance-none tw-rounded-md tw-border tw-border-white/10 tw-bg-white/5 tw-transition-opacity checked:tw-border-[#F2CA16] checked:tw-bg-[#F2CA16]" />

                        <div className="tw-pointer-events-none tw-absolute tw-top-5 tw-left-[22px] tw--translate-y-2/4 tw--translate-x-2/4 tw-text-white tw-opacity-0 tw-transition-opacity peer-checked:tw-opacity-100">
                            <Image src={CheckIcon} width={10} height={7} alt='dropdown arrow' className='tw-w-[10px] tw-h-[7px] tw-mr-2' />
                        </div>
                        <label className='tw-pl-3'>{item}</label><br />
                    </div>
                })
            }
        </div>
    )
}



const CategoryDropdownContent = ["All", "Coupes", "Crossovers", "EVs and Hybrids", "Hatchbacks", "Luxury Cars", "Minivans & Vans", "Pickup Trucks", "SUVs", "Sedans", "Small Cars", "Sports Cars", "Station Wagons"];

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

                <div className="tw-absolute tw-p-4 tw-left-0 tw-z-10 tw-mt-2 tw-w-[400px] tw-h-[312px] tw-origin-top-right tw-rounded-md tw-bg-[#1A2C3D] tw-text-white tw-shadow-lg " role="menu" aria-labelledby="menu-button" tabIndex={-1}>
                    <CategoryContent columns={2} />
                </div>
            }
        </div>

    )
}

interface CategoryContentProps {
    columns: number;
}

const CategoryContent: React.FC<CategoryContentProps> = ({ columns }) => {
    return (
        <div className={`tw-px-2 tw-grid tw-grid-cols-${columns}`}>
            {
                CategoryDropdownContent.map((item) => {
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
    )
}


const EraDropdownContent = ["All", "2020s", "2010s", "2000s", "1990s", "1980s", "1970s", "1960s", "1950s", "1940s", "1930s", "1920s", "1910s", "1900 and older"];

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

                <div className="tw-absolute tw-p-4 tw-left-0 tw-z-10 tw-mt-2 tw-w-[400px] tw-h-[312px] tw-origin-top-right tw-rounded-md tw-bg-[#1A2C3D] tw-text-white tw-shadow-lg " role="menu" aria-labelledby="menu-button" tabIndex={-1}>
                    <EraContent columns={2} />
                </div>
            }
        </div>
    )
}

interface EraContentProps {
    columns: number;
}

const EraContent: React.FC<EraContentProps> = ({ columns }) => {
    return (
        <div className={`tw-px-2 tw-grid tw-grid-cols-${columns}`}>
            {
                EraDropdownContent.map((item) => {
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
    )
}

const LocationDropdownContent = ["All", "Alabama", "Alaska", "Idaho", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georia", "Hawaii", "Illinois"];

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

                <div className="tw-absolute tw-p-4 tw-left-0 tw-z-10 tw-mt-2 tw-w-[400px] tw-h-[312px] tw-origin-top-right tw-rounded-md tw-bg-[#1A2C3D] tw-text-white tw-shadow-lg " >
                    <LocationContent columns={2} />
                </div>
            }
        </div>
    )
}

interface LocationContentProps {
    columns: number;
}

const LocationContent: React.FC<LocationContentProps> = ({ columns }) => {
    return (
        <div className={`tw-px-2 tw-grid tw-grid-cols-${columns}`}>
            {
                LocationDropdownContent.map((item) => {
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
                <div className="tw-absolute tw-right-0 tw-z-10 tw-mt-2 tw-w-[320px] tw-h-[312px]  tw-rounded-md tw-bg-[#1A2C3D] tw-text-white tw-shadow-lg ">
                    <div className='tw-p-4'>
                        <SortContent />
                    </div>

                </div>
            }
        </div>
    )
}

const SortContent = () => {
    return (
        <div >
            {
                SortList.map((item) => {
                    return <div className='hover:tw-bg-white/5 tw-rounded tw-p-2 ' key={item}>
                        <button className=''>{item}</button>
                    </div>
                })
            }
        </div>
    )
}