"use client"
import React, { useState } from 'react'
import Image from 'next/image'

import FeaturedPhoto from '../../../public/images/featured-photo.svg'
import DollarIcon from '../../../public/images/dollar.svg'
import HourGlass from '../../../public/images/hour-glass.svg'
import ArrowLeft from '../../../public/images/arrow-left.svg'
import ArrowRight from '../../../public/images/arrow-right.svg'
import Links from '../components/links'

const DiscoveryPageData = {
    title: "2005 Ford GT Speed Yellow",
    description: "This GT is one of just 19 Speed Yellow cars produced for 2005 with full Le Mans stripes and gray-painted brake calipers. Race-bred engineering includes an aluminum 5.4L V-8 engine belting out a factory-rated 550 HP with electronic multi-port fuel injection, a Lysholm screw-type supercharger, intercooler and stainless dual exhaust. Other competition-derived engineering features include a Ricardo 6-speed rear transaxle, extruded aluminum space frame, precision-cast aluminum double-wishbone “SLA” suspension with coilovers, dry-sump engine lubrication and big 4-wheel Brembo ventilated disc brakes with 4-piston calipers.",
    current_bid: "$490,000",
    bids: 48,
    wagers: 16,
    time_left: "12:17:00",
    photos: [{ id: "imagedis1", url: FeaturedPhoto }, { id: "imagedis2", url: FeaturedPhoto }, { id: "imagedis3", url: FeaturedPhoto }]
}


const DiscoverPage = () => {
    return (
        <div className='page-container '>
            <Links />
            <div className='section-container tw-flex tw-flex-col lg:tw-flex-row-reverse tw-items-end tw-gap-8 md:tw-gap-16 lg:tw-gap-24 xl:tw-gap-36'>

                <div className='tw-basis-2/3 tw-h-auto'>
                    <Carousel imageList={DiscoveryPageData.photos} />
                </div>
                <div className='tw-basis-1/3 tw-mt-4 lg:tw-mt-0'>
                    <div className='tw-text-[#49C742] tw-font-bold'>FEATURE</div>
                    <div className='tw-text-3xl xl:tw-text-4xl 2xl:tw-text-5xl tw-font-bold tw-mt-4'>{DiscoveryPageData.title}</div>
                    <div className='tw-opacity-80 tw-h-[120px] tw-ellipsis tw-overflow-hidden tw-mt-4 tw-text-sm sm:tw-text-base'>
                        {DiscoveryPageData.description}
                    </div>
                    <div className='tw-mt-4 tw-text-sm sm:tw-text-base'>
                        <div className='tw-flex'>
                            <Image src={DollarIcon} width={20} height={20} alt='dollar icon' className='tw-w-5 tw-h-5 ' />
                            <span className='tw-opacity-80 tw-ml-2'>Current Bid:</span>
                            <span className='tw-text-[#F2CA16] tw-ml-2 tw-font-bold'>{DiscoveryPageData.current_bid}</span>
                            <span className='tw-opacity-50 tw-ml-2'>{`${DiscoveryPageData.bids} bids`}</span>
                        </div>
                        <div className='tw-flex tw-mt-2'>
                            <Image src={HourGlass} width={20} height={20} alt='dollar icon' className='tw-w-5 tw-h-5 ' />
                            <span className='tw-opacity-80 tw-ml-2 '>Time Left:</span>
                            <span className=' tw-ml-2  tw-font-bold'>{DiscoveryPageData.current_bid}</span>
                        </div>
                    </div>
                    <div className='tw-mt-8'>
                        <button className='btn-yellow'>PLACE MY WAGER</button>
                        <span className='tw-ml-4 tw-opacity-50'>{`${DiscoveryPageData.wagers} wagers`}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DiscoverPage

interface CarouselProps {
    imageList: { id: string; url: string }[]
}


const Carousel: React.FC<CarouselProps> = ({ imageList }) => {
    const [sliderTransform, setSlidertransform] = useState(0);
    let listNum = imageList.length;
    const imgWidth = 100 / listNum
    const lastImgLoc = 100 - imgWidth;
    const wholeWidth = 100 * listNum


    const rightArrowHandler = () => {
        if (sliderTransform <= -lastImgLoc) {
            setSlidertransform(0)
        } else {
            setSlidertransform((prev) => prev - imgWidth)
        }

    }
    const leftArrowHandler = () => {
        if (sliderTransform >= 0) {
            setSlidertransform(-lastImgLoc)
        } else {
            setSlidertransform((prev) => prev + imgWidth)
        }

    }

    return (
        <div className=' tw-relative tw-pt-8 md:tw-pt-16 tw-h-auto'>
            <div className='carousel-container tw-relative tw-w-full tw-h-auto tw-overflow-hidden'>
                <div className='slider-container tw-transition tw-duration-[2000ms] tw-flex tw-h-auto tw-w-full' style={{ transform: `translate(${sliderTransform}%)`, width: `${wholeWidth}%` }}>
                    {
                        imageList.map((photo) => (
                            <div key={photo.id} className='tw-w-full'>
                                <Image src={photo.url} width={752} height={540} alt='feature car' className='tw-w-full tw-h-auto tw-object-cover tw-aspect-auto' priority={true} />
                            </div>
                        ))
                    }
                </div>
            </div>
            {/* Controller arrows */}
            <div className='tw-absolute tw-mt-4 tw-z-50 tw-bottom-[-48px] tw-right-0'>
                <button onClick={leftArrowHandler}>
                    <Image src={ArrowLeft} alt='arrow left' width={32} height={32} className='tw-w-auto tw-h-auto arrow-slider tw-rounded-full' />
                </button>
                <button onClick={rightArrowHandler} className='tw-ml-4'>
                    <Image src={ArrowRight} alt='arrow left' width={32} height={32} className='tw-w-auto tw-h-auto arrow-slider tw-rounded-full' />
                </button>

            </div>
        </div>
    )
}