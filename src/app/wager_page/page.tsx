'use client'
import Image from 'next/image'
import React from 'react'
import { useRouter } from 'next/navigation'
import CarPhoto from '../../../public/images/wager-car-photo.svg'
import DollarIcon from '../../../public/images/dollar.svg'
import HashtagIcon from '../../../public/images/hash-02.svg'
import CalendarIcon from '../../../public/images/calendar-icon.svg'
import HourGlassIcon from '../../../public/images/hour-glass.svg'
import MoneyBag from '../../../public/images/money-bag-green.svg'
import Players from '../../../public/images/players-icon-green.svg'
import GoogleSocial from '../../../public/images/social-google-logo.svg'
import FacebookSocial from '../../../public/images/social-facebook-logo.svg'
import TwitterSocial from '../../../public/images/social-twitter-logo.svg'
import AppleSocial from '../../../public/images/social-apple-logo.svg'
import CancelIcon from '../../../public/images/x-icon.svg'
import Link from 'next/link'

const WagerPage = () => {
    const router = useRouter()

    // Change to false to see create account
    const user = {
        isregistered: true
    }

    const WagerPageData = {
        name: "13k-Mile 2011 Mercedes Benz SLS AMG",
        current_bid: "$64,000",
        num_bids: 48,
        ending: "Jul 5, 2023, 7:00 pm",
        time_left: "02:16:00"
    }
    return (
        <div className='tw-bg-black md:tw-bg-black/50 tw-w-screen tw-h-screen tw-flex tw-justify-center tw-items-start md:tw-items-center tw-absolute tw-top-0 tw-left-0'>

            {/* Content */}
            {user.isregistered
                ?
                <div className='tw-relative tw-bg-[#0F1923] tw-w-[864px] tw-h-auto md:tw-h-[900px] tw-pt-8 tw-flex tw-flex-col tw-gap-6'>
                    <div className='tw-flex tw-flex-col md:tw-flex-row tw-gap-6 tw-px-6'>
                        <div className='tw-flex md:tw-hidden tw-items-center tw-justify-between  md:tw-justify-start tw-w-full'>
                            <div className='tw-text-2xl sm:tw-text-4xl tw-font-bold'>Guess the Price</div>
                            <Link href={"/car_view_page"}>
                                <Image src={CancelIcon} width={20} height={20} alt='' className='tw-w-[20px] tw-h-[20px] ' />
                            </Link>
                        </div>
                        <Image src={CarPhoto} width={360} height={173} alt='fray car' className='tw-w-full md:tw-w-[136px] tw-h-auto md:tw-h-[136px] tw-object-cover tw-aspect-3/4 md:tw-aspect-auto' />
                        <div className='md:tw-ml-6 md:tw-mt-0 tw-text-3xl'>
                            <div className='tw-font-bold'>{WagerPageData.name}</div>
                            <div className='tw-grid tw-gap-2 tw-mt-4'>
                                <div className='tw-grid tw-grids-cols-1 md:tw-grid-cols-2 tw-text-sm tw-gap-2'>
                                    <div className='tw-flex tw-items-center'>
                                        <Image src={DollarIcon} width={14} height={14} alt='' className='tw-w-[14px] tw-h-[14px]' />
                                        <div className='tw-text-sm tw-ml-2 tw-flex tw-flex-row tw-gap-2'>
                                            <span className='tw-opacity-80'>Current Bid:</span>
                                            <span className='tw-text-[#49C742] tw-font-bold'>{WagerPageData.current_bid}</span>
                                            <span className='md:tw-hidden'>{`(${WagerPageData.num_bids} bids)`}</span>
                                        </div>
                                    </div>
                                    <div className='tw-hidden md:tw-flex tw-items-center '>
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
                    <hr className='tw-border-white' />
                    <div className=' tw-flex tw-flex-col tw-gap-3 tw-px-6'>
                        <label className='tw-text-lg'>How much will this sell for?</label>
                        <div className='tw-relative tw-flex tw-items-center tw-rounded '>
                            <div className='tw-w-lg tw-h-auto tw-top-[50%] tw--translate-y-[50%] tw-left-3 tw-absolute tw-text-gray-500 tw-z-20' >$</div>
                            <input className='tw-bg-white/5 tw-py-3 tw-pl-8 tw-pr-3 tw-w-full focus:tw-bg-white focus:tw-text-black focus:tw-border-2 focus:tw-border-white/10 tw-rounded' />
                        </div>
                    </div>
                    <div className=' tw-flex tw-flex-col tw-gap-3 tw-px-6'>
                        <label className='tw-text-lg'>Wager</label>
                        <div className='tw-relative tw-flex tw-items-center tw-rounded '>
                            <div className='tw-w-lg tw-h-auto tw-top-[50%] tw--translate-y-[50%] tw-left-3 tw-absolute tw-text-gray-500 tw-z-20' >$</div>
                            <input className='tw-bg-white/5 tw-py-3 tw-pl-8 tw-pr-3 tw-w-full focus:tw-bg-white focus:tw-text-black focus:tw-border-2 focus:tw-border-white/10 tw-rounded' />
                        </div>
                    </div>
                    <div className='tw-text-[#49C742] tw-text-lg  tw-py-3 tw-px-4 tw-bg-[#49C74233] tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4 tw-mx-6 tw-px-6 tw-rounded'>
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
                    <div className='md:tw-absolute md:tw-bottom-0 md:tw-left-0 tw-items-center tw-flex tw-justify-between tw-h-[80px] tw-w-full tw-p-6 tw-bg-white/5'>
                        <button className='tw-hidden md:tw-block' onClick={() => router.push('/car_view_page')}>CANCEL</button>
                        <button className='btn-yellow tw-h-[48px] tw-w-full md:tw-w-auto' onClick={() => router.push('/payment')}>PLACE MY WAGER</button>
                    </div>

                </div>
                :
                <WagerCreateAccount />
            }

        </div>
    )
}

export default WagerPage




const WagerCreateAccount = () => {
    return (
        <div className='tw-w-screen md:tw-w-[640px] tw-px-6 tw-h-[505px] tw-flex tw-flex-col tw-gap-8 tw-pt-6'>
            <div>
                <div className='tw-flex tw-justify-between md:tw-justify-start'>
                    <div className='tw-font-bold tw-text-2xl md:tw-text-4xl'>Create Account</div>
                    <Image src={CancelIcon} width={20} height={20} alt='' className='tw-w-[20px] tw-h-[20px] sm:tw-hidden' />
                </div>
                <div className='tw-mt-1'>Already a member?
                    <button className='tw-text-[#F2CA16] tw-ml-2'>Login Here</button>
                </div>
            </div>
            <div className='tw-flex tw-flex-col tw-gap-6 tw-text-sm'>
                <div className='tw-flex tw-flex-col tw-gap-2'>
                    <label>Email</label>
                    <input className='tw-py-2.5 tw-px-3 tw-bg-[#172431]' placeholder='you@email.com' />
                </div>
                <div className='tw-flex tw-flex-col tw-gap-2'>
                    <label>Password</label>
                    <input className='tw-py-2.5 tw-px-3 tw-bg-[#172431]' />
                </div>
                <button className='btn-yellow'>CREATE ACCOUNT</button>
            </div>
            <div className='tw-w-full tw-grid tw-grid-cols-4 tw-gap-2'>
                <div className='tw-bg-white tw-flex tw-justify-center tw-items-center tw-rounded tw-h-[48px]'>
                    <Image src={GoogleSocial} width={24} height={24} alt='google logo' className='tw-w-6 tw-h-6' />
                </div>
                <div className='tw-bg-[#1877F2] tw-flex tw-justify-center tw-items-center tw-rounded tw-h-[48px]'>
                    <Image src={FacebookSocial} width={24} height={24} alt='facebook logo' className='tw-w-6 tw-h-6' />
                </div>
                <div className='tw-bg-white tw-flex tw-justify-center tw-items-center tw-rounded tw-h-[48px]'>
                    <Image src={AppleSocial} width={24} height={24} alt='apple logo' className='tw-w-6 tw-h-6' />
                </div>
                <div className='tw-bg-[#1DA1F2] tw-flex tw-justify-center tw-items-center tw-rounded tw-h-[48px]'>
                    <Image src={TwitterSocial} width={24} height={24} alt='twitter logo' className='tw-w-6 tw-h-6' />
                </div>
            </div>
            <div className='tw-text-center tw-opacity-50'>
                {"By creating an account, you agree to HammerShift’s Privacy Policy and Terms of Use."}
            </div>
        </div>
    )
}