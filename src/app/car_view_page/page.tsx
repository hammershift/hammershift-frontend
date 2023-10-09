import React from 'react'
import { TopNavigation } from '../auction_listing_page/page'
import Image from 'next/image'
import Card from '../components/card'

import DollarIcon from '../../../public/images/dollar.svg'
import CalendarIcon from '../../../public/images/calendar-icon.svg'
import HashtagIcon from '../../../public/images/hash-02.svg'
import PlayersIcon from '../../../public/images/users-01.svg'
import HourGlassIcon from '../../../public/images/hour-glass.svg'
import PrizeIcon from '../../../public/images/monetization-browser-bag.svg'
import LiveGamesIcon from '../../../public/images/currency-dollar-circle.svg'
import CameraPlus from '../../../public/images/camera-plus.svg'
import GifIcon from '../../../public/images/image-document-gif.svg'
import BellIcon from '../../../public/images/bell-02.svg'
import ThumbsUp from '../../../public/images/thumbs-up.svg'
import ThumbsDown from '../../../public/images/thumbs-down.svg'
import CornerDownRight from '../../../public/images/corner-down-right.svg'
import ThreeDots from '../../../public/images/dots-vertical.svg'
import OpenWebLogo from '../../../public/images/open-web-logo.svg'
import ArrowDown from '../../../public/images/arrow-down.svg'
import DiagonalLines from '../../../public/images/green-diagonal.svg'


import PhotoOne from '../../../public/images/car-view-page/photoOne.svg'
import PhotoTwo from '../../../public/images/car-view-page/photoTwo.svg'
import PhotoThree from '../../../public/images/car-view-page/photoThree.svg'
import PhotoFour from '../../../public/images/car-view-page/photoFour.svg'
import PhotoFive from '../../../public/images/car-view-page/photoOne.svg'

import AvatarOne from '../../../public/images/avatar-one.svg'
import AvatarTwo from '../../../public/images/avatar-two.svg'
import AvatarThree from '../../../public/images/avatar-three.svg'
import AvatarFour from '../../../public/images/avatar-four.svg'
import HowHammerShiftWorks from '../components/how_hammeshift_works'
import { articleData } from '@/sample_data'
import Subscribe from '../components/subscribe'
import Footer from '../components/footer'

const CarViewData = {
    name: "13k-Mile 2011 Mercedes Benz SLS AMG",
    currentBid: "$64,000",
    endingDate: "Jul 5, 2023, 7:00 PM",
    bids: 48,
    players: 4,
    timeLeft: "02:16:00",
    prize: "$1,000",
    images: [PhotoOne, PhotoTwo, PhotoThree, PhotoFour, PhotoFive],
    description: "This 2011 Mercedes-Benz SLS AMG was initially sold by Ray Catena Mercedes Benz Union in New Jersey, and remained registered in the state prior to being acquired by the selling dealer in 2023 and now has 13k miles. It is powered by a 6.2-liter V8 linked with a seven-speed dual-clutch automatic transaxle and a limited-slip differential. Finished in Iridium Silver Metallic over Charcoal Exclusive leather upholstery, the car is equipped with 19″ and 20″ seven-spoke alloy wheels, gullwing doors, a speed-activated aerofoil, bi-xenon headlights, Parktronic, heated power-adjustable seats, Keyless-Go, a rearview camera, COMAND infotainment, navigation, a radar detector, a Bang & Olufsen sound system, carbon-fiber interior trim, and dual-zone automatic climate control. This SLS AMG is now offered in Texas by the selling dealer at no reserve with a clean Carfax report and a clean New Jersey title."

}


const CarViewPage = () => {
    return (
        <div className='tw-flex tw-flex-col tw-items-center'>
            <TopNavigation />
            <GuessThePrice />
            <div className='section-container tw-flex tw-mt-8'>
                <div className='left-container  tw-bg-gray-500 tw-mr-8'>
                    <TitleContainer />
                    <PhotosLayout />
                    <ArticleSection />
                    <CommentsSection />

                </div>
                <div className='right-container tw-w-[416px] tw-bg-gray-500 tw-ml-8'>
                    <RightContainer />

                </div>
            </div>
            <GamesYouMightLike />
            <HowHammerShiftWorks articleData={articleData} />
            <Subscribe />
            <Footer />
        </div>
    )
}

export default CarViewPage


const GuessThePrice = () => {
    return (
        <div className='section-container tw-flex tw-justify-between'>
            <div className='tw-w-auto tw-flex tw-items-center tw-bg-[#184C80] tw-font-bold tw-rounded-full tw-px-2.5 tw-py-2 tw-text-[14px]'>GUESS THE PRICE</div>
            <div>
                <button className='btn-transparent-white'>WATCH</button>
                <button className='btn-yellow tw-ml-2'>PLACE MY WAGER</button>
            </div>

        </div>
    )
}

const TitleContainer = () => {
    return (
        <div className=' tw-flex tw-flex-col tw-flex-grow'>
            <div className='title-section-marker tw-flex  tw-text-5xl tw-font-bold'>{CarViewData.name}</div>
            <div className='info-section-marker tw-flex tw-mt-4'>
                <div className='info-left-marker tw-w-[300px]'>
                    <div className='tw-flex'>
                        <div>
                            <Image src={DollarIcon} width={20} height={20} alt="dollar" className='tw-w-5 tw-h-5  tw-mr-2' />
                        </div>
                        <span className='tw-opacity-80'>Current Bid: <span className='tw-text-[#49C742] tw-font-bold'>{CarViewData.currentBid}</span></span>
                    </div>
                    <div className='tw-flex tw-mt-1'>
                        <div>
                            <Image src={CalendarIcon} width={20} height={20} alt="calendar" className='tw-w-5 tw-h-5  tw-mr-2' />
                        </div>
                        <span className='tw-opacity-80'>Ending: <span className='tw-font-bold'>{CarViewData.endingDate}</span></span>
                    </div>
                </div>
                <div className='right-section-marker'>
                    <div className='top-section-marker tw-flex tw-justify-between'>
                        <div className='tw-flex tw-w-[160px]'>
                            <div>
                                <Image src={HashtagIcon} width={20} height={20} alt="calendar" className='tw-w-5 tw-h-5  tw-mr-2' />
                            </div>
                            <span className='tw-opacity-80'>Bids: <span className='tw-font-bold'>{CarViewData.bids}</span></span>
                        </div>
                        <div className='tw-flex'>
                            <div>
                                <Image src={HourGlassIcon} width={20} height={20} alt="calendar" className='tw-w-5 tw-h-5  tw-mr-2' />
                            </div>
                            <span className='tw-opacity-80'>Time Left: <span className='tw-font-bold tw-text-[#C2451E]'>{CarViewData.timeLeft}</span></span>
                        </div>
                    </div>
                    <div className='bottom-section-marker tw-mt-1 tw-flex'>
                        <div className='tw-flex  tw-w-[160px]'>
                            <div>
                                <Image src={PlayersIcon} width={20} height={20} alt="calendar" className='tw-w-5 tw-h-5  tw-mr-2' />
                            </div>
                            <span className='tw-opacity-80'>Time Left: <span className='tw-font-bold '>{CarViewData.players}</span></span>
                        </div>
                        <div className='tw-flex'>
                            <div>
                                <Image src={PrizeIcon} width={20} height={20} alt="calendar" className='tw-w-5 tw-h-5 tw-mr-2' />
                            </div>
                            <span className='tw-opacity-80'>Time Left: <span className='tw-font-bold '>{CarViewData.prize}</span></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const PhotosLayout = () => {
    return (
        <div className=' tw-my-8'>
            <Image src={PhotoOne} width={832} height={520} alt="car" className='tw-w-auto tw-h-[520px] tw-object-cover tw-rounded' />
            <div className='tw-grid tw-grid-cols-4 tw-gap-2 tw-mt-2'>
                <Image src={PhotoTwo} width={202} height={120} alt="car" className='tw-w-auto tw-h-[120px] tw-object-cover tw-rounded' />
                <Image src={PhotoThree} width={202} height={120} alt="car" className='tw-w-auto tw-h-[120px] tw-object-cover tw-rounded' />
                <Image src={PhotoFour} width={202} height={120} alt="car" className='tw-w-auto tw-h-[120px] tw-object-cover tw-rounded' />
                <div className='tw-relative'>
                    <Image src={PhotoFive} width={202} height={120} alt="car" className='tw-w-auto tw-h-[120px] tw-object-cover tw-opacity-40 tw-rounded' />
                    <div className='tw-absolute  tw-z-50 tw-left-1/2 tw-translate-x-[-50%] tw-top-[50%] tw-translate-y-[-50%]'>88 photos</div>
                </div>
            </div>
        </div>
    )
}

const ArticleSection = () => {
    return (
        <div className='tw-flex tw-flex-col tw-mt-16 tw-max-w-[832px]'>
            <div className='tw-w-[832px]'>{CarViewData.description}</div>
            <button className='btn-transparent-white tw-mt-16'>VIEW MORE DETAILS</button>
            <button className='btn-yellow tw-mt-3'>PLACE MY WAGER</button>
            <div className='tw-mt-16 tw-p-6 tw-bg-[#172431]'>
                <Image src={LiveGamesIcon} width={68} height={68} alt="car" className='tw-w-[68px] tw-h-[68px]' />
                <div className='tw-text-2xl tw-font-bold tw-mt-8'>What is Guess the Price</div>
                <div className='tw-my-4'>Wager on the car auction and guess the final hammer price. Closest player wins the prize. Duis anim adipisicing minim nisi elit quis. Cillum ullamco qui dolore non incididunt incididunt non. Aute adipisicing et esse exercitation sunt irure proident enim eu esse nulla. Est excepteur est non. Adipisicing occaecat minim ex duis excepteur.</div>
                <div className='tw-text-[#42A0FF]'>View Auctions</div>
            </div>
        </div>
    )
}


const CommentsSection = () => {
    return (
        <div className='tw-mt-16 tw-max-w-[832px]'>
            <div className='tw-flex tw-justify-between'>
                <div className='tw-text-3xl'><span className='tw-font-bold'>Comments</span>{`(16)`}</div>
                <div className='tw-flex tw-items-center'>
                    <Image src={BellIcon} width={16} height={16} alt='Bell' className='tw-w-4 tw-h-4' />
                    <div className='tw-text-[14px] tw-opacity-50 tw-ml-4'>Log in</div>
                    <div className='tw-text-[14px] tw-opacity-50 tw-ml-4'>Sign Up</div>

                </div>
            </div>
            <div className='tw-flex tw-mt-2'>
                <div className='tw-flex tw-flex-grow tw-bg-[#172431] tw-py-2.5 tw-px-3 tw-rounded'>
                    <input placeholder='Add a comment' className='tw-bg-[#172431] tw-flex-grow' />
                    <Image src={CameraPlus} width={20} height={20} alt="camera plus" className='tw-w-5 tw-h-5' />
                    <Image src={GifIcon} width={20} height={20} alt="gif" className='tw-w-5 tw-h-5 tw-ml-2' />
                </div>
                <button className='btn-white tw-ml-2'>Comment</button>
            </div>
            <div className='tw-mt-2 tw-flex tw-items-center'>Sort by
                <span className='tw-font-bold tw-ml-2'>Best</span>
                <Image src={ArrowDown} width={14} height={14} alt="arrow down" className='tw-w-[14px] tw-h-[14px] tw-ml-2' />
            </div>
            <section>
                <div>
                    {/* To be replaced by map */}
                    <CommentsCard />
                    <CommentsCard />
                    <CommentsCard />

                </div>
                <button className='btn-transparent-white tw-w-full tw-mt-8 tw-text-[14px]'>Load 12 more comments</button>
                <div className='tw-flex tw-items-center tw-mt-8'>
                    <span>Powered by</span>
                    <Image src={OpenWebLogo} width={97} height={28} alt="camera plus" className='tw-w-[97px] tw-h-[28px] tw-ml-2' />
                </div>
            </section>

        </div>
    )
}

const CommentsCard = () => {
    const commentsData = [{
        id: "com1",
        username: "@johnadams",
        text: " Nihil hic munitissimus habendi senatus locus, nihil horum? Qui ipsorum lingua Celtae, nostra Galli appellantur. Ambitioni dedisse scripsisse iudicaretur. Paullum deliquit, ponderibus modulisque suis ratio utitur.Nihil hic munitissimus habendi senatus locus, nihil horum? Praeterea iter est quasdam res quas ex communi.Cum sociis natoque penatibus et magnis dis parturient.Contra legem facit qui id facit quod lex prohibet.Ambitioni dedisse scripsisse iudicaretur.Quid securi etiam tamquam eu fugiat nulla pariatur.Quam diu etiam furor iste tuus nos eludet? Tu quoque, Brute, fili mi, nihil timor populi, nihil! Nihilne te nocturnum praesidium Palati, nihil urbis vigiliae.Unam incolunt Belgae, aliam Aquitani, tertiam.Excepteur sint obcaecat cupiditat non proident culpa.Petierunt uti sibi concilium totius Galliae in diem certam indicere.Phasellus laoreet lorem vel dolor tempus vehicula.Quis aute iure reprehenderit in voluptate velit esse.Quo usque tandem abutere, Catilina, patientia nostra? Prima luce, cum quibus mons aliud consensu ab eo."
    }]
    return (
        <div className='tw-flex tw-mt-8 tw-text-[14px]'>
            <Image src={AvatarOne} width={40} height={40} alt="camera plus" className='tw-w-10 tw-h-10 tw-ml-2' />
            <div className='tw-ml-4'>
                <div className='tw-flex tw-justify-between'>
                    <div>
                        <span className='tw-font-bold'>Jane Doe</span>
                        <span className='tw-text-[#F2CA16] tw-ml-2'>Seller</span>
                        <span className='tw-opacity-50 tw-ml-2'>14 hours ago</span>
                    </div>
                    <Image src={ThreeDots} width={16} height={16} alt="thumbs up" className='tw-w-4 tw-h-4 tw-ml-4' />
                </div>
                <div className='tw-my-3'><span className='tw-text-[#42A0FF]'>{commentsData[0].username}</span>{commentsData[0].text}</div>
                <div className='tw-flex tw-opacity-50'>Reply
                    <span className='tw-ml-4'>·</span>
                    <Image src={ThumbsUp} width={16} height={16} alt="thumbs up" className='tw-w-4 tw-h-4 tw-ml-4' />
                    <Image src={ThumbsDown} width={16} height={16} alt="thumbs down" className='tw-w-4 tw-h-4 tw-ml-4' />
                </div>

                <div className='tw-text-[#42A0FF] tw-mt-3 tw-flex'>
                    <Image src={CornerDownRight} width={16} height={16} alt="camera plus" className='tw-w-4 tw-h-4 tw-mr-2 ' />
                    1 Replay
                </div>
            </div>
        </div>
    )
}

const RightContainer = () => {
    return (
        <div className=''>

            Right Container
        </div>
    )
}


const GamesYouMightLike = () => {
    return (
        <div className='section-container tw-py-8 sm:tw-py-12 tw-mb-8 sm:tw-mb-16 tw-mt-16'>

            <header className='tw-max-w-[1312px]'>
                <div className='tw-flex tw-justify-between'>
                    <div className='tw-flex tw-items-center'>
                        <Image src={DiagonalLines} width={40} height={40} alt="dollar" className='tw-w-10 tw-h-10' />
                        <div className='tw-font-bold tw-text-2xl sm:tw-text-3xl tw-ml-4'>Games You Might Like</div>
                    </div>
                    <div className='tw-text-[#49C742]'>See All</div>
                </div>
            </header>

            <section className='tw-overflow-hidden'>
                <div className=' tw-w-[632px] sm:tw-w-[1312px] '>
                    <div className=' tw-grid tw-grid-cols-3 tw-gap-4 sm:tw-gap-8 tw-mt-12 '>
                        {/* to be replaced by array.map */}
                        <div className='tw-w-[200px] sm:tw-w-[416px]'>
                            <Card />
                        </div>
                        <div className='tw-w-[200px] sm:tw-w-[416px]'>
                            <Card />
                        </div>
                        <div className='tw-w-[200px] sm:tw-w-[416px]'>
                            <Card />
                        </div>
                    </div>
                </div>
            </section>



        </div>
    )
}
