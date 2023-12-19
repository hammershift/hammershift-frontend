"use client"
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { getCarsWithFilterProps } from '@/lib/data'
import { useRouter } from 'next/navigation'
import { NextRouter } from 'next/router';

import CheckIcon from '../../../public/images/check-black.svg'
import GridIcon from '../../../public/images/grid-01.svg'
import ListIcon from '../../../public/images/list.svg'
import FilterFunnel from '../../../public/images/filter-funnel-02.svg'
import ArrowsDown from '../../../public/images/arrows-down.svg'
import DropdownArrow from '../../../public/images/dropdown.svg'
import ArrowDown from '../../../public/images/arrow-down.svg'
import CancelIcon from '../../../public/images/x-icon.svg'
import MagnifyingGlass from '../../../public/images/magnifying-glass.svg'



export type filtersProps = {
    make: string[],
    category: string[],
    era: string[],
    location: string[],
    sort: string
}

interface FiltersAndSortProps {
    filters: filtersProps;
    setFilters: React.Dispatch<React.SetStateAction<filtersProps>>;
}

type DropdownMenuProps = null | "Make" | "Era" | "Category" | "Location" | "Sort";

const FiltersAndSort: React.FC<FiltersAndSortProps> = ({ filters, setFilters }) => {


    const [filterDropdownOpen, setFilterDropdownOpen] = useState(false)
    const [sortDropdownOpen, setSortDropdownOpen] = useState(false)
    const [dropdownMenuRegular, setDropdownMenuRegular] = useState<DropdownMenuProps>(null);

    const [dropdownMenuSmall, setDropdownMenuSmall] = useState<DropdownMenuProps>(null)
    const [menuOpen, setMenuOpen] = useState(false);
    const [bgColor, setBgColor] = useState({});


    return (
        <div className='tw-flex tw-justify-between tw-w-screen tw-my-4 xl:tw-my-8 tw-px-4 md:tw-px-16 2xl:tw-w-[1440px]'>
            <div className='left-container-marker tw-flex tw-items-center'>
                <div>Live Games <span className='tw-opacity-50'> 100</span></div>
                <div className='tw-hidden xl:tw-flex'>
                    {/* Filter Dropdown for regular screens*/}
                    {/* Dropdown for Make filter*/}
                    <div className=" tw-relative tw-inline-block tw-text-left tw-mx-2">
                        <div>
                            <button type="button" className="tw-w-[140px] tw-inline-flex tw-justify-between tw-items-center tw-gap-x-1.5 tw-rounded-md tw-px-3 tw-py-2.5  tw-text-white-900 tw-shadow-sm tw-bg-[#172431] hover:tw-bg-[#1A2C3D]" style={dropdownMenuRegular === "Make" ? { backgroundColor: "#1A2C3D" } : {}} onClick={() => setDropdownMenuRegular((prev) => { if (prev === "Make") return null; else return "Make" })}>
                                Make
                                <Image src={DropdownArrow} width={12} height={12} alt='dropdown arrow' className='tw-w-[12px] tw-h-[12px]' />
                            </button>
                        </div>
                        {dropdownMenuRegular === "Make" &&
                            <MakeDropdown filters={filters} setFilters={setFilters} />
                        }
                    </div>
                    {/* Dropdown for Category filter*/}
                    <div className="tw-relative tw-inline-block tw-text-left tw-mx-2" >
                        <div>
                            <button type="button" className="tw-w-[140px] tw-inline-flex tw-justify-between tw-items-center tw-gap-x-1.5 tw-rounded-md tw-px-3 tw-py-2.5  tw-text-white-900 tw-shadow-sm tw-bg-[#172431] hover:tw-bg-[#1A2C3D]" style={dropdownMenuRegular === "Category" ? { backgroundColor: "#1A2C3D" } : {}} onClick={() => setDropdownMenuRegular((prev) => { if (prev === "Category") return null; else return "Category" })}>
                                Category
                                <Image src={DropdownArrow} width={12} height={12} alt='dropdown arrow' className='tw-w-[12px] tw-h-[12px]' />
                            </button>
                        </div>
                        {dropdownMenuRegular === "Category" &&
                            <CategoryDropdown filters={filters} setFilters={setFilters} />
                        }
                    </div>
                    {/* Dropdown for Era filter*/}
                    <div className="tw-relative tw-inline-block tw-text-left tw-mx-2" >
                        <div>
                            <button type="button" className="tw-w-[140px] tw-inline-flex tw-justify-between tw-items-center tw-gap-x-1.5 tw-rounded-md tw-px-3 tw-py-2.5  tw-text-white-900 tw-shadow-sm tw-bg-[#172431] hover:tw-bg-[#1A2C3D]" style={dropdownMenuRegular === "Era" ? { backgroundColor: "#1A2C3D" } : {}} onClick={() => setDropdownMenuRegular((prev) => { if (prev === "Era") return null; else return "Era" })}>
                                Era
                                <Image src={DropdownArrow} width={12} height={12} alt='dropdown arrow' className='tw-w-[12px] tw-h-[12px]' />
                            </button>
                        </div>
                        {dropdownMenuRegular === "Era" &&
                            <EraDropdown filters={filters} setFilters={setFilters} />

                        }
                    </div>
                    {/* Dropdown for Location filter*/}
                    <div className="tw-relative tw-inline-block tw-text-left tw-mx-2" >
                        <div>
                            <button type="button" className="tw-w-[140px] tw-inline-flex tw-justify-between tw-items-center tw-gap-x-1.5 tw-rounded-md tw-px-3 tw-py-2.5  tw-text-white-900 tw-shadow-sm tw-bg-[#172431] hover:tw-bg-[#1A2C3D]" style={dropdownMenuRegular === "Location" ? { backgroundColor: "#1A2C3D" } : {}} onClick={() => setDropdownMenuRegular((prev) => { if (prev === "Location") return null; else return "Location" })}>
                                Location
                                <Image src={DropdownArrow} width={12} height={12} alt='dropdown arrow' className='tw-w-[12px] tw-h-[12px]' />
                            </button>
                        </div>
                        {dropdownMenuRegular === "Location" &&
                            <LocationDropdown filters={filters} setFilters={setFilters} />
                        }
                    </div>
                </div>

            </div>
            <div className='right-container-marker tw-flex tw-items-center tw-hidden xl:tw-flex'>
                <Image src={GridIcon} width={24} height={24} alt="gift icon" className='tw-w-[24px] tw-h-[24px]' />
                <Image src={ListIcon} width={24} height={24} alt="gift icon" className='tw-w-[24px] tw-h-[24px] tw-mx-6' />
                {/* Dropdown for Sort*/}
                <div className="tw-relative tw-text-left tw-mx-2">
                    <div>
                        <button type="button" className="tw-w-[240px] tw-inline-flex tw-justify-between tw-items-center tw-gap-x-1.5 tw-rounded-md tw-px-3 tw-py-2.5  tw-text-white-900 tw-shadow-sm tw-bg-[#172431] hover:tw-bg-[#1A2C3D]" style={dropdownMenuRegular === "Sort" ? { backgroundColor: "#1A2C3D" } : {}} onClick={() => setDropdownMenuRegular((prev) => { if (prev === "Sort") return null; else return "Sort" })}>
                            Sort by:
                            <Image src={DropdownArrow} width={12} height={12} alt='dropdown arrow' className='tw-w-[12px] tw-h-[12px]' />
                        </button>
                    </div>
                    {dropdownMenuRegular === "Sort" &&
                        <SortDropdown filters={filters} setFilters={setFilters} />
                    }
                </div>
            </div>
            <div className='tw-flex xl:tw-hidden'>
                <button onClick={() => setFilterDropdownOpen((prev) => !prev)}>
                    <Image src={FilterFunnel} width={24} height={24} alt="gift icon" className='tw-w-[24px] tw-h-[24px]' />
                </button>
                <button onClick={() => setSortDropdownOpen((prev) => !prev)}>
                    <Image src={ArrowsDown} width={24} height={24} alt="gift icon" className='tw-w-[24px] tw-h-[24px] tw-ml-6' />

                </button>
            </div>
            {/* Filter Dropdown for small screens*/}
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
                        {/* Dropdown for MAKE */}
                        <button className='tw-flex tw-justify-between tw-mt-4 tw-w-full' onClick={() => setDropdownMenuSmall((prev) => { if (prev === "Make") return null; else return "Make" })} >
                            <div className='tw-font-bold'>Make</div>
                            <Image src={ArrowDown} width={32} height={32} alt="magnifying glass" className="tw-w-8 tw-h-8" />
                        </button>
                        {dropdownMenuSmall === "Make" &&
                            <div className="tw-absolute tw-left-0 tw-z-50  tw-w-screen tw-origin-top-right tw-rounded-md tw-bg-[#1A2C3D] tw-text-white tw-p-4 tw-h-4/5 tw-overflow-y-auto"  >
                                <MakeContent columns={1} filters={filters} setFilters={setFilters} />
                            </div>
                        }
                        {/* Dropdown for CATEGORY */}
                        <button className='tw-flex tw-justify-between tw-mt-4 tw-w-full' onClick={() => setDropdownMenuSmall((prev) => { if (prev === "Category") return null; else return "Category" })} >
                            <div className='tw-font-bold'>Category</div>
                            <Image src={ArrowDown} width={32} height={32} alt="magnifying glass" className="tw-w-8 tw-h-8" />
                        </button>
                        {dropdownMenuSmall === "Category" &&
                            <div className="tw-absolute tw-left-0 tw-z-50  tw-w-screen tw-origin-top-right tw-rounded-md tw-bg-[#1A2C3D] tw-text-white tw-p-4 tw-h-3/5 tw-overflow-y-auto" >
                                <CategoryContent columns={1} filters={filters} setFilters={setFilters} />
                            </div>
                        }
                        {/* Dropdown for ERA */}
                        <button className='tw-flex tw-justify-between tw-mt-4 tw-w-full' onClick={() => setDropdownMenuSmall((prev) => { if (prev === "Era") return null; else return "Era" })} >
                            <div className='tw-font-bold'>Era</div>
                            <Image src={ArrowDown} width={32} height={32} alt="magnifying glass" className="tw-w-8 tw-h-8" />
                        </button>
                        {dropdownMenuSmall === "Era" &&
                            <div className="tw-absolute tw-left-0 tw-z-50  tw-w-screen tw-origin-top-right tw-rounded-md tw-bg-[#1A2C3D] tw-text-white tw-p-4 tw-h-3/5 tw-overflow-y-auto" >
                                <EraContent columns={1} filters={filters} setFilters={setFilters} />
                            </div>
                        }
                        {/* Dropdown for LOCATION */}
                        <button className='tw-flex tw-justify-between tw-mt-4 tw-w-full' onClick={() => setDropdownMenuSmall((prev) => { if (prev === "Location") return null; else return "Location" })} >
                            <div className='tw-font-bold'>Location</div>
                            <Image src={ArrowDown} width={32} height={32} alt="magnifying glass" className="tw-w-8 tw-h-8" />
                        </button>
                        {dropdownMenuSmall === "Location" &&
                            <div className="tw-absolute tw-left-0 tw-z-50  tw-w-screen tw-origin-top-right tw-rounded-md tw-bg-[#1A2C3D] tw-text-white tw-p-4 tw-h-1/2 tw-overflow-y-auto" >
                                <LocationContent columns={1} filters={filters} setFilters={setFilters} />
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
                    <SortContent filters={filters} setFilters={setFilters} />
                </div>
            }
        </div>
    )
}
export default FiltersAndSort

// function to add value to filters. This is used in all 4 dropdowns
const addToFilters = (value: string, key: 'make' | 'category' | 'era' | 'location', filters: filtersProps, setFilters: React.Dispatch<React.SetStateAction<filtersProps>>, router: any) => {

    setFilters(prevFilters => {
        if (value === "All") {
            return {
                ...filters,
                [key]: ["All"]
            };
        } else if (filters[key].includes(value)) {
            return {
                ...filters,
                [key]: filters[key].filter(item => item !== value)
            };
        } else {
            let newFilters = [...filters[key]];
            const allIndex = newFilters.indexOf("All");
            if (allIndex > -1) {
                newFilters.splice(allIndex, 1);
            }
            newFilters.push(value);
            return {
                ...filters,
                [key]: newFilters
            };
        }
    });

    const queries = Object.entries(filters)
        .map(([key, value]) => {
            if (Array.isArray(value)) {
                // Handle array values, for example, joining them with commas
                return `${key}=${value
                    .map((item) => encodeURIComponent(item))
                    .join("$")}`;
            } else {
                // Handle single values
                return `${key}=${encodeURIComponent(value as string)}`;
            }
        })
        .join("&");
    console.log("Filter Queries:", queries);

    router.push("/auctions/" + queries)


}

// const handleFiltersClick = () => {
//     const filtersList: any = {
//         "make": [
//             "All", "BMW"
//         ],
//         "category": [
//             "Sedans", "Pickup Trucks"
//         ],
//         "era": [
//             "All"
//         ],
//         "location": [
//             "All"
//         ],
//         "sort": "Newly Listed"
//     }

//     const queries = Object.entries(filtersList)
//         .map(([key, value]) => {
//             if (Array.isArray(value)) {
//                 // Handle array values, for example, joining them with commas
//                 return `${key}=${value
//                     .map((item) => encodeURIComponent(item))
//                     .join("$")}`;
//             } else {
//                 // Handle single values
//                 return `${key}=${encodeURIComponent(value as string)}`;
//             }
//         })
//         .join("&");
//     console.log(queries);

// }
// handleFiltersClick();




export interface FiltersDropdownProps {
    filters: filtersProps;
    setFilters: React.Dispatch<React.SetStateAction<filtersProps>>;
}

const MakeDropdownContent = ["All", "Acura", "Audi", "BMW", "Alfa Romeo", "Aston Martin", "Honda", "Jaguar", "Jeep", "Kia", "Lamborghini", "Land Rover", "Lexus", "Chrysler", "Chevrolet", "Cadillac", "Buick", "Bugatti", "Bentley", "Hyundai", "Lincoln", "Lotus", "Lucid", "Maserati", "Mazda", "McLaren", "Genesis", "GMX", "Ford", "Fiat", "Ferrari", "Dodge", "Infiniti", "Mercedes-Benz", "Mini", "Mitsubishi", "Nissan", "Polestar", "Porsche"]

const MakeDropdown: React.FC<FiltersDropdownProps> = ({ filters, setFilters }) => {
    return (

        <div className="tw-absolute tw-left-0 tw-z-10 tw-mt-2 tw-w-[640px] tw-h-[362px] tw-origin-top-right tw-rounded-md tw-bg-[#1A2C3D] tw-text-white tw-shadow-lg"
        >
            <div className="tw-p-4" role="none">
                <div className='tw-flex tw-items-center tw-bg-white/5 tw-rounded tw-py-2 tw-px-3'>
                    <Image src={MagnifyingGlass} width={20} height={20} alt='dropdown arrow' className='tw-w-[20px] tw-h-[20px] tw-mr-2' />
                    <input className='tw-bg-transparent tw-w-full' placeholder='Search' />
                </div>
                <div className='tw-mt-2 tw-h-[280px] tw-overflow-y-auto'>
                    <MakeContent columns={3} filters={filters} setFilters={setFilters} />
                </div>
            </div>
        </div>


    )
}

interface FiltersContentProps {
    columns?: number;
    filters: filtersProps;
    setFilters: React.Dispatch<React.SetStateAction<filtersProps>>;
}
const MakeContent: React.FC<FiltersContentProps> = ({ columns, filters, setFilters }) => {

    const router = useRouter();

    return (
        <div className={`tw-h-fit tw-px-2 tw-grid tw-grid-cols-${columns} tw-grid-rows-${columns === 1 ? 39 : 13}`} >
            {
                MakeDropdownContent.map((value) => (
                    <div className='tw-flex tw-relative tw-items-center tw-p-2' key={value}>
                        <div onClick={() => addToFilters(value, "make", filters, setFilters, router)}>
                            <input
                                type='checkbox'
                                className={` ${filters['make'].includes(value) ? "tw-bg-[#f2ca16] tw-border-[#f2ca16]" : "tw-bg-white/5 tw-border-white/10"} tw-relative tw-peer tw-h-5 tw-w-5 tw-cursor-pointer tw-appearance-none tw-rounded-md tw-border   tw-transition-opacity `} />
                            {
                                filters['make'].includes(value) &&

                                <div className="tw-pointer-events-none tw-absolute tw-top-5 tw-left-[22px] tw--translate-y-2/4 tw--translate-x-2/4 tw-text-white tw-opacity-0 tw-transition-opacity tw-opacity-100">
                                    <Image src={CheckIcon} width={10} height={7} alt='dropdown arrow' className='tw-w-[10px] tw-h-[7px] tw-mr-2' />
                                </div>
                            }
                        </div>
                        <label className='tw-pl-3' >{value}</label><br />
                    </div>
                ))
            }
        </div>
    )
}



const CategoryDropdownContent = ["All", "Coupes", "Crossovers", "EVs and Hybrids", "Hatchbacks", "Luxury Cars", "Minivans & Vans", "Pickup Trucks", "SUVs", "Sedans", "Small Cars", "Sports Cars", "Station Wagons"];

const CategoryDropdown: React.FC<FiltersDropdownProps> = ({ filters, setFilters }) => {

    return (
        <>
            <div className="tw-absolute tw-p-4 tw-left-0 tw-z-10 tw-mt-2 tw-w-[400px] tw-h-[312px] tw-origin-top-right tw-rounded-md tw-bg-[#1A2C3D] tw-text-white tw-shadow-lg " role="menu" aria-labelledby="menu-button" tabIndex={-1}>
                <CategoryContent columns={2} filters={filters} setFilters={setFilters} />
            </div>
        </>


    )
}


const CategoryContent: React.FC<FiltersContentProps> = ({ columns, filters, setFilters }) => {
    const router = useRouter();

    return (
        <div className={`tw-px-2 tw-grid tw-grid-cols-${columns}`}>
            {
                CategoryDropdownContent.map((value) => (
                    <div className='tw-flex tw-relative tw-items-center tw-p-2' key={value}>
                        <div onClick={() => addToFilters(value, "category", filters, setFilters, router)}>
                            <input
                                type='checkbox'
                                className={` ${filters['category'].includes(value) ? "tw-bg-[#f2ca16] tw-border-[#f2ca16]" : "tw-bg-white/5 tw-border-white/10"} tw-relative tw-peer tw-h-5 tw-w-5 tw-cursor-pointer tw-appearance-none tw-rounded-md tw-border   tw-transition-opacity `} />
                            {
                                filters['category'].includes(value) &&

                                <div className="tw-pointer-events-none tw-absolute tw-top-5 tw-left-[22px] tw--translate-y-2/4 tw--translate-x-2/4 tw-text-white tw-opacity-0 tw-transition-opacity tw-opacity-100">
                                    <Image src={CheckIcon} width={10} height={7} alt='dropdown arrow' className='tw-w-[10px] tw-h-[7px] tw-mr-2' />
                                </div>
                            }
                        </div>
                        <label className='tw-pl-3' >{value}</label><br />
                    </div>
                ))
            }
        </div>
    )
}


const EraDropdownContent = ["All", "2020s", "2010s", "2000s", "1990s", "1980s", "1970s", "1960s", "1950s", "1940s", "1930s", "1920s", "1910s", "1900 and older"];

const EraDropdown: React.FC<FiltersDropdownProps> = ({ filters, setFilters }) => {

    return (

        <div>
            <div className="tw-absolute tw-p-4 tw-left-0 tw-z-10 tw-mt-2 tw-w-[400px] tw-h-[312px] tw-origin-top-right tw-rounded-md tw-bg-[#1A2C3D] tw-text-white tw-shadow-lg " role="menu" aria-labelledby="menu-button" tabIndex={-1}>
                <EraContent columns={2} filters={filters} setFilters={setFilters} />
            </div>
        </div>
    )
}


const EraContent: React.FC<FiltersContentProps> = ({ columns, filters, setFilters }) => {
    const router = useRouter();

    return (
        <div className={`tw-px-2 tw-grid tw-grid-cols-${columns}`}>
            {
                EraDropdownContent.map((value) => (
                    <div className='tw-flex tw-relative tw-items-center tw-p-2' key={value}>
                        <div onClick={() => addToFilters(value, "era", filters, setFilters, router)}>
                            <input
                                type='checkbox'
                                className={` ${filters['era'].includes(value) ? "tw-bg-[#f2ca16] tw-border-[#f2ca16]" : "tw-bg-white/5 tw-border-white/10"} tw-relative tw-peer tw-h-5 tw-w-5 tw-cursor-pointer tw-appearance-none tw-rounded-md tw-border   tw-transition-opacity `} />
                            {
                                filters['era'].includes(value) &&

                                <div className="tw-pointer-events-none tw-absolute tw-top-5 tw-left-[22px] tw--translate-y-2/4 tw--translate-x-2/4 tw-text-white tw-opacity-0 tw-transition-opacity tw-opacity-100">
                                    <Image src={CheckIcon} width={10} height={7} alt='dropdown arrow' className='tw-w-[10px] tw-h-[7px] tw-mr-2' />
                                </div>
                            }
                        </div>
                        <label className='tw-pl-3'>{value}</label><br />
                    </div>
                ))
            }
        </div>
    )
}

const LocationDropdownContent = ["All", "Alabama", "Alaska", "Idaho", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georia", "Hawaii", "Illinois"];

const LocationDropdown: React.FC<FiltersDropdownProps> = ({ filters, setFilters }) => {
    return (
        <div>
            <div className="tw-absolute tw-p-4 tw-left-0 tw-z-10 tw-mt-2 tw-w-[400px] tw-h-[312px] tw-origin-top-right tw-rounded-md tw-bg-[#1A2C3D] tw-text-white tw-shadow-lg " >
                <LocationContent columns={2} filters={filters} setFilters={setFilters} />
            </div>
        </div>
    )
}

const LocationContent: React.FC<FiltersContentProps> = ({ columns, filters, setFilters }) => {
    const router = useRouter();

    return (
        <div className={`tw-px-2 tw-grid tw-grid-cols-${columns}`}>
            {
                LocationDropdownContent.map((value) => {
                    return <div className='tw-flex tw-relative tw-items-center tw-p-2' key={value}>
                        <div onClick={() => addToFilters(value, "location", filters, setFilters, router)}>
                            <input
                                type='checkbox'
                                className={` ${filters['location'].includes(value) ? "tw-bg-[#f2ca16] tw-border-[#f2ca16]" : "tw-bg-white/5 tw-border-white/10"} tw-relative tw-peer tw-h-5 tw-w-5 tw-cursor-pointer tw-appearance-none tw-rounded-md tw-border   tw-transition-opacity `} />
                            {
                                filters['location'].includes(value) &&

                                <div className="tw-pointer-events-none tw-absolute tw-top-5 tw-left-[22px] tw--translate-y-2/4 tw--translate-x-2/4 tw-text-white tw-opacity-0 tw-transition-opacity tw-opacity-100">
                                    <Image src={CheckIcon} width={10} height={7} alt='dropdown arrow' className='tw-w-[10px] tw-h-[7px] tw-mr-2' />
                                </div>
                            }
                        </div>
                        <label className='tw-pl-3'>{value}</label><br />
                    </div>
                })
            }
        </div>
    )
}




const SortDropdown: React.FC<FiltersDropdownProps> = ({ filters, setFilters }) => {

    return (
        <div className="tw-absolute tw-right-0 tw-z-10 tw-mt-2 tw-w-[320px] tw-h-[312px]  tw-rounded-md tw-bg-[#1A2C3D] tw-text-white tw-shadow-lg ">
            <div className='tw-p-4'>
                <SortContent filters={filters} setFilters={setFilters} />
            </div>

        </div>
    )
}

const SortContent: React.FC<FiltersContentProps> = ({ filters, setFilters }) => {
    const SortList = ["Top Performers", "Newly Listed", "Most Expensive", "Least Expensive", "Most Bids", "Least Bids", "Ending soon"];

    const addSort = (value: string) => {
        setFilters({
            ...filters,
            ['sort']: value
        });
    }

    return (
        <>
            {
                SortList.map((value) => {
                    return <div className={`${filters['sort'] === value ? "tw-bg-white/10" : ""} hover:tw-bg-white/5 tw-rounded tw-p-2 `} key={value}>
                        <button onClick={() => addSort(value)}>{value}</button>
                    </div>
                })
            }
        </>
    )
}