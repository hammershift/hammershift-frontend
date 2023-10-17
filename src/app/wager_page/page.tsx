import Image from 'next/image'
import React from 'react'
import CarPhoto from '../../../public/images/wager-car-photo.svg'
import DollarIcon from '../../../public/images/dollar.svg'
import HashtagIcon from '../../../public/images/hash-02.svg'
import CalendarIcon from '../../../public/images/calendar-icon.svg'
import HourGlassIcon from '../../../public/images/hour-glass.svg'
import MoneyBag from '../../../public/images/money-bag-green.svg'
import Players from '../../../public/images/players-icon-green.svg'

const WagerPage = () => {
    const WagerPageData = {
        name: "13k-Mile 2011 Mercedes Benz SLS AMG",
        current_bid: "$64,000",
        num_bids: 48,
        ending: "Jul 5, 2023, 7:00 pm",
        time_left: "02:16:00"
    }
    return (
        <div className='tw-bg-black/50 tw-w-screen tw-h-screen tw-flex tw-justify-center tw-items-center tw-absolute tw-top-0 tw-left-0'>
            {/* container */}
            <div className='tw-relative tw-bg-[#0F1923] tw-w-[864px] tw-h-[900px] tw-py-8 tw-px-6'>
                {/* Content */}
                <div className='tw-flex tw-flex-col md:tw-flex-row'>
                    <Image src={CarPhoto} width={360} height={173} alt='fray car' className='tw-w-full md:tw-w-[136px] tw-h-auto md:tw-h-[136px] tw-object-cover' />
                    <div className='md:tw-ml-6 tw-mt-6 md:tw-mt-0 tw-text-3xl'>
                        <div className='tw-font-bold'>{WagerPageData.name}</div>
                        <div className='tw-grid tw-gap-2 tw-mt-4'>
                            <div className='tw-grid tw-grids-cols-1 md:tw-grid-cols-2 tw-text-sm tw-gap-2'>
                                <div className='tw-flex tw-items-center'>
                                    <Image src={DollarIcon} width={14} height={14} alt='' className='tw-w-[14px] tw-h-[14px]' />
                                    <div className='tw-text-sm tw-ml-2'>
                                        <span className='tw-opacity-80'>Current Bid:</span>
                                        <span className='tw-text-[#49C742] tw-font-bold tw-ml-2'>{WagerPageData.current_bid}</span>
                                    </div>
                                </div>
                                <div className='tw-flex tw-items-center'>
                                    <Image src={HashtagIcon} width={14} height={14} alt='' className='tw-w-[14px] tw-h-[14px]' />
                                    <div className='tw-text-sm tw-ml-2'>
                                        <span className='tw-opacity-80'>Bids:</span>
                                        <span className=' tw-font-bold tw-ml-2'>{WagerPageData.num_bids}</span>
                                    </div>
                                </div>

                            </div>
                            <div className='tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-2 tw-text-sm'>
                                <div className='tw-flex tw-items-center'>
                                    <Image src={CalendarIcon} width={14} height={14} alt='' className='tw-w-[14px] tw-h-[14px]' />
                                    <div className='tw-text-sm tw-ml-2'>
                                        <span className='tw-opacity-80'>Ending:</span>
                                        <span className='tw-font-bold tw-ml-2'>{WagerPageData.ending}</span>
                                    </div>
                                </div>
                                <div className='tw-flex tw-items-center'>
                                    <Image src={HourGlassIcon} width={14} height={14} alt='' className='tw-w-[14px] tw-h-[14px]' />
                                    <div className='tw-text-sm tw-ml-2'>
                                        <span className='tw-opacity-80'>Time Left:</span>
                                        <span className=' tw-font-bold tw-ml-2 tw-text-[#C2451E]'>{WagerPageData.time_left}</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
                <hr className='tw-border-white tw-my-8' />
                <div className=' tw-flex tw-flex-col tw-gap-2'>
                    <label className='tw-text-lg'>How much will this sell for?</label>
                    <div className='tw-relative tw-flex tw-items-center tw-rounded '>
                        <div className='tw-w-lg tw-h-auto tw-top-[50%] tw--translate-y-[50%] tw-left-3 tw-absolute tw-text-gray-500 tw-z-20' >$</div>
                        <input className='tw-bg-white/5 tw-py-3 tw-pl-8 tw-pr-3 tw-w-full focus:tw-bg-white focus:tw-text-black focus:tw-border-2 focus:tw-border-white/10 ' />
                    </div>
                </div>
                <div className='tw-mt-6 tw-flex tw-flex-col tw-gap-2'>
                    <label className='tw-text-lg'>Wager</label>
                    <div className='tw-relative tw-flex tw-items-center tw-rounded '>
                        <div className='tw-w-lg tw-h-auto tw-top-[50%] tw--translate-y-[50%] tw-left-3 tw-absolute tw-text-gray-500 tw-z-20' >$</div>
                        <input className='tw-bg-white/5 tw-py-3 tw-pl-8 tw-pr-3 tw-w-full focus:tw-bg-white focus:tw-text-black focus:tw-border-2 focus:tw-border-white/10 ' />
                    </div>
                </div>
                <div className='tw-text-[#49C742] tw-text-lg tw-mt-6 tw-py-3 tw-px-4 tw-bg-[#49C74233] tw-grid tw-grid-cols-2'>
                    <div className='tw-flex tw-items-center tw-gap-2'>
                        <Image src={MoneyBag} width={32} height={32} alt='money bag' className='tw-w-[32px] tw-h-[32px]' />
                        <div className=''>
                            <div className='tw-text-xs'>POTENTIAL PRIZE</div>
                            <div className='tw-font-bold'>$1.00</div>
                        </div>
                    </div>
                    <div className='tw-flex tw-items-center tw-gap-2'>
                        <Image src={Players} width={32} height={32} alt='money bag' className='tw-w-[32px] tw-h-[32px]' />
                        <div className=''>
                            <div className='tw-text-xs'>PLAYERS</div>
                            <div className='tw-font-bold'>12</div>
                        </div>
                    </div>
                </div>
                <div className='tw-absolute tw-items-center tw-flex tw-justify-between tw-bottom-0 tw-left-0 tw-h-[80px] tw-w-full tw-p-8 tw-bg-white/5'>
                    <button>CANCEL</button>
                    <button className='btn-yellow tw-h-[48px]'>PLACE MY WAGER</button>
                </div>
            </div>
        </div>
    )
}

export default WagerPage