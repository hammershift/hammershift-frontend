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
          <div className='tw-font-bold tw-text-3xl tw-ml-4'>Live Games</div>
        </div>
        <div className='tw-flex'>
          <Image src={ArrowLeft} width={32} height={32} alt="arrow left" className='tw-w-8 tw-h-8 ' />
          <Image src={ArrowRight} width={32} height={32} alt="arrow right" className='tw-w-8 tw-h-8 tw-ml-4' />
        </div>
      </div>
      <div>

        {/* carData.map((item) => {
            <LiveGamesCard key={item.id} url={item.url} year={item.year} name={item.name} description={item.description} time={item.time} />
          }) */}

      </div>
    </div>
  )
}

const LiveGamesCard = (url, year, name, description, time) => {
  return (
    <div className='tw-w-auto'>
      <div>
        <div> </div>
        <div></div>
        <div></div>
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
          <div className='tw-font-bold tw-text-3xl tw-ml-4'>Team Battles</div>
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
          <div className='tw-font-bold tw-text-3xl tw-ml-4'>Tournaments</div>
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
