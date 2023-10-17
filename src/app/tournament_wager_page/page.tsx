import React from 'react'
import Image from 'next/image'
import MoneyBag from '../../../public/images/money-bag-green.svg'
import PlayersIcon from '../../../public/images/players-icon-green.svg'

const TournamentWagerPage = () => {
    return (
        <div className='tw-bg-black/50 tw-w-screen tw-h-screen tw-flex tw-justify-center tw-items-center tw-absolute tw-top-0 tw-left-0'>
            <div className='tw-relative tw-bg-[#0F1923] tw-w-[864px] tw-h-[900px] tw-py-8 tw-px-6'>
                <div>
                    <div>Sedan Champions Tournament</div>
                    <div>Get more points the closer you are to the hammer price of a curated set of car auctions. Guess the price for each of the cars listed below and buy-in to lock in your wagers. <span>Learn more</span></div>
                    <div className='tw-text-[#49C742] tw-text-lg tw-mt-6 tw-py-3 tw-px-4 tw-bg-[#49C74233] tw-grid tw-grid-cols-2'>
                        <div className='tw-flex tw-items-center tw-gap-2'>
                            <Image src={MoneyBag} width={32} height={32} alt='money bag' className='tw-w-[32px] tw-h-[32px]' />
                            <div className=''>
                                <div className='tw-text-xs'>POTENTIAL PRIZE</div>
                                <div className='tw-font-bold'>$1.00</div>
                            </div>
                        </div>
                        <div className='tw-flex tw-items-center tw-gap-2'>
                            <Image src={PlayersIcon} width={32} height={32} alt='money bag' className='tw-w-[32px] tw-h-[32px]' />
                            <div className=''>
                                <div className='tw-text-xs'>PLAYERS</div>
                                <div className='tw-font-bold'>12</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default TournamentWagerPage