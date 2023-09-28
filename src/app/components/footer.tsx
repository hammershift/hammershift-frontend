import React from 'react'
import Logo from '../../../public/images/hammershift-logo.svg'
import Image from 'next/image'

const companyList = ["HOW IT WORKS", "ABOUT", "PRESS KIT", "PRIVACY NOTICE", "TERMS & CONDITIONS", "CONTRACT"];
const productList = ["DISCOVER", "AUCTIONS", "NEWLY LISTED", "MOST EXPENSIVE", "MOST BIDS", "ENDING SOON", "MOST WAGERS",]
const vehiclesList = ["MAKE", "TYPE", "ERA", "LOCATION"]

const Footer = () => {
    return (
        <div className='tw-px-4 md:tw-px-16 xl:tw-px-36 tw-w-screen tw-pt-[120px] tw-pb-20'>
            <div className='tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-8 md:tw-gap-0 tw-mb-16'>
                <div>
                    <Image src={Logo} width={177} height={32} alt="hammershift logo" className='tw-w-[177px] tw-h-[32px]' />
                </div>
                <div className='tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-8 md:tw-gap-0'>
                    <div>
                        <div className='tw-font-bold'>COMPANY</div>
                        {companyList.map((item) => {
                            return <div key={item} className='tw-mt-3'>{item}</div>
                        })}
                    </div>
                    <div>
                        <div className='tw-font-bold'>PRODUCT</div>
                        {productList.map((item) => {
                            return <div key={item} className='tw-mt-3'>{item}</div>
                        })}
                    </div>
                    <div>
                        <div className='tw-font-bold'>VEHICLES</div>
                        {vehiclesList.map((item) => {
                            return <div key={item} className='tw-mt-3'>{item}</div>
                        })}
                    </div>
                </div>
            </div>
            <hr />
            <div className='tw-flex tw-flex-col md:tw-flex-row tw-justify-between tw-items-end'>
                <div className='tw-my-8'>
                    <div className='tw-font-bold tw-text-xl'>The Ultimate Playground for Car Enthusiasts</div>
                    <div>Skill-based wagering for those in the know</div>
                    <div>{/* insert sm icons */}</div>

                </div>
                <div className='tw-flex tw-flex-col tw-items-end'>
                    <div className='tw-opacity-20'>Designed by Toffeenut Design</div>
                    <div>© 2023 HammerShift. All rights reserved.</div>
                </div>
            </div>
        </div>
    )
}

export default Footer