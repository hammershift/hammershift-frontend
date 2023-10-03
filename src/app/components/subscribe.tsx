import React from 'react'
import CarDesign from '../../../public/images/car-three-lines.png'
import Image from 'next/image'

const Subscribe = () => {
    return (
        <div className='tw-relative tw-text-[#0F1923] tw-bg-[#F2CA16] tw-flex tw-justify-center tw-w-screen tw-mt-[-1px] tw-overflow-hidden'>
            <div className='tw-relative  tw-px-4 md:tw-px-16 tw-w-screen 2xl:tw-w-[1440px] tw-py-32  '>
                <div className='tw-grid tw-grid-cols-1 md:tw-grid-cols-2'>
                    <div>
                        <h1 className='tw-text-6xl tw-font-bold'>Stay in the Fast Lane</h1>
                        <p className='tw-my-10'>Are you ready to dive deeper into the captivating world of car auction wagering? Join the exclusive HammerShift newsletter to get access to a treasure trove of insider knowledge, expert tips, and captivating insights that will elevate your wagering game.</p>
                        <div className='tw-flex tw-flex-col sm:tw-flex-row tw-w-auto'>
                            <input placeholder='Email Address' className='tw-px-6 tw-py-4 tw-grow tw-rounded tw-font-bold' />
                            <button className='btn-dark sm:tw-ml-3 tw-mt-4 sm:tw-mt-0 tw-w-auto'>Subscribe</button>
                        </div>
                    </div>
                    <div>

                    </div>
                    <Image src={CarDesign} width={998} height={664} alt='car design' className='tw-w-auto tw-h-full tw-object-cover tw-absolute tw-right-0 tw-top-0' />
                </div>
            </div>

        </div>
    )
}

export default Subscribe