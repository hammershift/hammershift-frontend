import Image from 'next/image'
import React from 'react'
import CarPhoto from '../../../public/images/wager-car-photo.svg'
import Dollar from '../../../public/images/dollar.svg'

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
            <div className='tw-relative tw-bg-[#0F1923] tw-w-[864px] tw-h-[900px] tw-py-8 tw-px-6'>
                <div className='tw-flex'>
                    <Image src={CarPhoto} width={136} height={136} alt='fray car' className='tw-w-[136px] tw-h-[136px]' />
                    <div className='tw-ml-6 tw-text-3xl tw-font-bold'>
                        <div>{WagerPageData.name}</div>
                        <div>
                            <div>
                                <div className='tw-flex tw-items-center'>
                                    <Image src={Dollar} width={14} height={14} alt='' className='tw-w-[14px] tw-h-[14px]' />
                                    <div className='tw-text-sm tw-ml-2'>
                                        <span>Current Bid:</span>
                                        <span className='tw-text-[#49C742] tw-font-bold tw-ml-2'>{WagerPageData.current_bid}</span></div>
                                </div>
                                <div></div>
                            </div>
                            <div></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default WagerPage