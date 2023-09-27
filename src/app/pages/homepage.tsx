import React from 'react'
import Navbar from '../components/navbar'
import Banner from '../../../public/images/banner.svg'
import Image from 'next/image'
import { carData } from '@/sample_data'
import LiveGamesIcon from '../../../public/images/live-games-icon.svg'
import ArrowRight from '../../../public/images/arrow-right.svg'
import ArrowLeft from '../../../public/images/arrow-left.svg'
import TeamBattlesIcon from '../../../public/images/team-battles-icon.svg'
import TournamentsIcon from '../../../public/images/tournaments-icon.svg'
import HourGlassIcon from '../../../public/images/hour-glass.svg'
import PlayersIcon from '../../../public/images/players.svg'


const Homepage = () => {
  return (
    <div>
      <Navbar />
      <div className='tw-mt-16'>
        <Carousel />
      </div>
      <div className='tw-mt-24'>
        <LiveGames />
      </div>
      <div className='tw-mt-24'>
        <TeamBattles />
      </div>
      <div className='tw-mt-24'>
        <Tournaments />
      </div>
    </div>
  )
}

export default Homepage


const Carousel = () => {
  return (
    <div className='tw-px-4 md:tw-px-16 xl:tw-px-36 tw-w-screen'>
      <div>
        <Image src={Banner} width={1312} height={280} alt='banner' className='tw-w-full' />
      </div>
    </div>
  )
}

const LiveGames = () => {
  return (
    <div className='tw-px-4 md:tw-px-16 xl:tw-px-36 tw-w-screen tw-pt-8'>
      <div className='tw-flex tw-justify-between'>
        <div className='tw-flex tw-items-center'>
          <Image src={LiveGamesIcon} width={40} height={40} alt="dollar" className='tw-w-10 tw-h-10' />
          <div className='tw-font-bold tw-text-2xl sm:tw-text-3xl tw-ml-4'>Live Games</div>
        </div>
        <div className='tw-flex'>
          <Image src={ArrowLeft} width={32} height={32} alt="arrow left" className='tw-w-8 tw-h-8 ' />
          <Image src={ArrowRight} width={32} height={32} alt="arrow right" className='tw-w-8 tw-h-8 tw-ml-4' />
        </div>
      </div>
      <div className='tw-mt-6'>
        <LiveGamesCard />
        {/* carData.map((item) => {
            <LiveGamesCard key={item.id} url={item.url} year={item.year} name={item.name} description={item.description} time={item.time} />
          }) */}

      </div>
    </div>
  )
}

const LiveGamesCard = () => {
  const carData = {
    id: 1,
    url: "https://classifieds.singaporeexpats.com/data/16/15950784501YKvxw.jpg",
    year: "1969",
    name: "Shelby Mustang",
    description: "GT350",
    time: "12:17:00",
    isLive: true
  }

  return (
    <div className='tw-w-[200px] tw-flex tw-flex-col tw-items-center'>
      <div className='tw-w-[200px] tw-h-[218px] tw-relative'>
        <div className='tw-w-[61px] tw-h-[36px] tw-bg-red-500 tw-rounded-s-full tw-rounded-e-full tw-flex tw-justify-center tw-items-center tw-absolute tw-bottom-0 tw-left-[70px]'>LIVE</div>
        <img src={carData.url} width={200} height={200} alt="car" className='tw-w-[200px] tw-h-[200px] tw-rounded-full tw-object-cover tw-border-solid tw-border-4 tw-border-red-500' />
      </div>
      <div className='info tw-my-3 tw-flex tw-flex-col tw-items-center'>
        <div className='tw-mt-3 tw-font-medium'>{carData.year} {carData.name}</div>
        <div className='tw-my-1.5 tw-font-medium'>{carData.description}</div>
        <div className='tw-flex tw-items-center'>
          <Image src={HourGlassIcon} width={12} height={12} alt="hour glass" className='tw-w-[12px] tw-h-[14px] tw-mr-1 ' />
          <div>{carData.time}</div>
        </div>
      </div>
      <div className='tw-mt-1.5'>
        <Image src={PlayersIcon} width={152} height={40} alt="players" className='' />
      </div>

    </div>
  )
}


const TeamBattles = () => {
  return (
    <div className='tw-px-4 md:tw-px-16 xl:tw-px-36 tw-w-screen tw-pt-8'>
      <div className='tw-flex tw-justify-between'>
        <div className='tw-flex tw-items-center'>
          <Image src={TeamBattlesIcon} width={40} height={40} alt="dollar" className='tw-w-10 tw-h-10' />
          <div className='tw-font-bold tw-text-2xl sm:tw-text-3xl tw-ml-4'>Team Battles</div>
        </div>
        <div className='tw-flex'>
          <Image src={ArrowLeft} width={32} height={32} alt="arrow left" className='tw-w-8 tw-h-8 ' />
          <Image src={ArrowRight} width={32} height={32} alt="arrow right" className='tw-w-8 tw-h-8 tw-ml-4' />
        </div>
      </div>
      <div>
        {/* insert content */}
      </div>
    </div>
  )
}

const Tournaments = () => {
  return (
    <div className='tw-px-4 md:tw-px-16 xl:tw-px-36 tw-w-screen tw-pt-8'>
      <div className='tw-flex tw-justify-between'>
        <div className='tw-flex tw-items-center'>
          <Image src={TournamentsIcon} width={40} height={40} alt="dollar" className='tw-w-10 tw-h-10' />
          <div className='tw-font-bold tw-text-2xl sm:tw-text-3xl tw-ml-4'>Tournaments</div>
        </div>
        <div className='tw-flex'>
          <Image src={ArrowLeft} width={32} height={32} alt="arrow left" className='tw-w-8 tw-h-8 ' />
          <Image src={ArrowRight} width={32} height={32} alt="arrow right" className='tw-w-8 tw-h-8 tw-ml-4' />
        </div>
      </div>
      <div>
        {/* insert content */}
      </div>
    </div>
  )
}
