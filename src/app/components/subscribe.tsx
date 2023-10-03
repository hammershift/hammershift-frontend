import React from 'react'
import CarDesign from '../../../public/images/car-design.svg'
import Image from 'next/image'

const Subscribe = () => {
    return (

        <div className='tw-relative tw-text-[#0F1923] tw-bg-[#F2CA16] tw-h-auto md:tw-max-h-[664px] tw-flex  tw-justify-center tw-w-screen tw-mt-[-1px] tw-overflow-hidden'>
            <div className='tw-relative tw-mt-80 md:tw-mt-0 tw-px-4 md:tw-px-16 tw-w-screen 2xl:tw-w-[1440px] tw-py-16 md:tw-py-32 tw-z-50 '>
                <div className='tw-grid tw-grid-cols-1 md:tw-grid-cols-2 '>
                    <div>
                        <h1 className='tw-text-6xl tw-font-bold'>Stay in the Fast Lane</h1>
                        <p className='tw-my-10 tw-max-h-[120px] tw-ellispis tw-overflow-hidden'>Are you ready to dive deeper into the captivating world of car auction wagering? Join the exclusive HammerShift newsletter to get access to a treasure trove of insider knowledge, expert tips, and captivating insights that will elevate your wagering game.</p>
                        <div className='tw-flex tw-flex-col sm:tw-flex-row tw-w-auto'>
                            <input placeholder='Email Address' className='tw-px-6 tw-py-4 tw-grow tw-rounded tw-font-bold' />
                            <button className='btn-dark sm:tw-ml-3 tw-mt-4 sm:tw-mt-0 tw-w-auto'>Subscribe</button>
                        </div>
                    </div>
                    <div></div>
                </div>
            </div>

            <div>
                <div className='tw-absolute tw-top-0 tw-right-0 tw-w-full sm:tw-w-auto tw-h-auto'>
                    <div style={{

                        transform: 'skew(-28deg)',
                        // backgroundColor: '#fff'
                        backgroundColor: '#F2CA16'


                        // borderBottom: '664px solid transparent',
                        // borderLeft: '360px solid #fff'

                    }} className='tw-absolute tw-h-[664px] tw-w-[400px] md:tw-width tw-right-[400px] sm:tw-right-[542px] '>
                    </div>
                    <div style={{

                        transform: 'skew(-28deg)',
                        borderRight: '20px solid #F2CA16'

                    }} className='tw-absolute tw-h-[644px] tw-w-[300px] tw-top-0 tw-right-[280px] sm:tw-right-[250px]'>
                    </div>
                    <div style={{

                        transform: 'skew(-28deg)',
                        borderRight: '20px solid #F2CA16'

                    }} className='tw-absolute tw-w-[300px] tw-h-[644px] tw-top-0 tw-right-[180px] sm:tw-right-[390px]'>
                    </div>
                    <div style={{

                        borderTop: '664px solid transparent',
                        borderRight: '360px solid #F2CA16'
                    }} className='tw-absolute tw-w-[997px] tw-h-[644px] w-top-[2px] tw-right-[-80px] sm:tw-right-[-60px]'>
                    </div>
                    <Image src={CarDesign} width={997} height={644} alt='design' className='tw-w-[640px] md:tw-w-auto tw-h-[350px] md:tw-h-auto tw-z-[-1] tw-object-cover' />
                </div>
            </div>
        </div >
    )
}

export default Subscribe