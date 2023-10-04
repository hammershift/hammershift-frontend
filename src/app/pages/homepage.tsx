import React, { useState } from 'react'
import Navbar from '../components/navbar'
import Card from '../components/card'
import HowHammerShiftWorks from '../components/how_hammeshift_works'
import Footer from '../components/footer'
import Subscribe from '../components/subscribe'
import { carData } from '@/sample_data'
import { articleData } from '@/sample_data';
import Image from 'next/image'

import LiveGamesIcon from '../../../public/images/live-games-icon.svg'
import ArrowRight from '../../../public/images/arrow-right.svg'
import ArrowLeft from '../../../public/images/arrow-left.svg'
import TeamBattlesIcon from '../../../public/images/team-battles-icon.svg'
import TournamentsIcon from '../../../public/images/tournaments-icon.svg'
import HourGlassIcon from '../../../public/images/hour-glass.svg'
import PlayersIcon from '../../../public/images/players.svg'
import GamesByMakeIcon from '../../../public/images/games-by-make-icon.svg'
import Avatar from '../../../public/images/avatar.svg'
import TrophyIconGreen from '../../../public/images/trophy-icon-green.svg'
import TrophyIconBlue from '../../../public/images/trophy-icon-blue.svg'
import DiagonalLinesCarousel from '../../../public/images/diagonal-lines-carousel.svg'
import MagnifyingGlass from "../../../public/images/magnifying-glass.svg"
import WatchlistIcon from "../../../public/images/watchlist-icon.svg"

import BMWLogo from '../../../public/images/brand-logos/bmw-logo.svg'
import AudiLogo from '../../../public/images/brand-logos/audi-logo.svg'
import DodgeLogo from '../../../public/images/brand-logos/dodge-logo.svg'
import HondaLogo from '../../../public/images/brand-logos/honda-logo.svg'
import JeepLogo from '../../../public/images/brand-logos/jeep-logo.svg'
import NissanLogo from '../../../public/images/brand-logos/nissan-logo.svg'
import SubaruLogo from '../../../public/images/brand-logos/subaru-logo.svg'
import TeslaLogo from '../../../public/images/brand-logos/tesla-logo.svg'
import ToyotaLogo from '../../../public/images/brand-logos/toyota-logo.svg'
import FordLogo from '../../../public/images/brand-logos/ford-logo.svg'

import TransitionPattern from '../../../public/images/transition-pattern.svg'
import YellowSportsCarFull from '../../../public/images/yellow-sportscar-full.svg'


import WhiteCar from '../../../public/images/wager-by-category/white-car.svg'
import RedCar from '../../../public/images/wager-by-category/red-car.svg'
import YellowSportsCar from '../../../public/images/wager-by-category/yellow-sportscar.svg'
import SilverPickup from '../../../public/images/wager-by-category/silver-pickup.svg'
import SilverSUV from '../../../public/images/wager-by-category/silver-suv.svg'


import AvatarOne from '../../../public/images/avatar-one.svg'
import AvatarTwo from '../../../public/images/avatar-two.svg'
import AvatarThree from '../../../public/images/avatar-three.svg'
import AvatarFour from '../../../public/images/avatar-four.svg'



interface carDataProps {
  id: string,
  url: string,
  year: string,
  name: string,
  description: string,
  time: string
}

interface LiveGamesProps {
  carData: carDataProps[];
}

interface LiveGamesCardProps {
  url: string;
  year: string;
  name: string;
  description: string;
  time: string;
}

const Homepage = () => {

  const isLoggedIn = false; // state of login
  return (
    <div className='2xl:tw-flex tw-flex-col tw-items-center'>
      <Navbar isLoggedIn={isLoggedIn} />
      <Carousel />
      <LiveGames carData={carData} />
      <TeamBattles />
      <Tournaments />
      <NewEraWagering />
      <GamesByMake />
      <WagerByCatergory />
      <SkillStrategyAndStakes />
      <NewGames />
      <WhatsTrending />
      <MostExpensiveCars />
      <MostBids />
      <HowHammerShiftWorks articleData={articleData} />
      <Subscribe />
      <Footer />

    </div>
  )
}
export default Homepage


const Carousel = () => {
  const [sliderTransform, setSlidertransform] = useState(0);
  const leftArrowHandler = () => {
    if (sliderTransform === -75) {
      setSlidertransform(0)
    } else {
      setSlidertransform((prev) => prev - 25)
    }
  }
  const rightArrowHandler = () => {
    if (sliderTransform === 0) {
      setSlidertransform(-75)
    } else {
      setSlidertransform((prev) => prev + 25)
    }
  }
  return (
    <div className='tw-relative tw-w-screen tw-px-4 md:tw-px-16 tw-pt-8 md:tw-pt-16 2xl:tw-w-[1440px] tw-h-[344px]'>
      <div className='carousel-container tw-relative tw-w-full tw-h-full tw-border-solid tw-border-inherit tw-border-2'>
        <div className='slider-containerr tw-flex tw-h-full tw-w-[400%]' style={{ transform: `translate(${sliderTransform}%)` }}>
          <div className='section-container tw-basis-full tw-flex tw-justify-center tw-items-center'>Section 1</div>
          <div className='section-container tw-basis-full tw-flex tw-justify-center tw-items-center'>Section 2</div>
          <div className='section-container tw-basis-full tw-flex tw-justify-center tw-items-center'>Section 3</div>
          <div className='section-container tw-basis-full tw-flex tw-justify-center tw-items-center'>Section 4</div>
        </div>
        <div className='controller-container'>
          <button className='arrow-left' onClick={leftArrowHandler}>
            <Image src={ArrowLeft} alt='arrow left' width={40} height={40} className='tw-absolute tw-top-[115px]' />
          </button>
          <button className='arrow-right' onClick={rightArrowHandler}>
            <Image src={ArrowRight} alt='arrow left' width={40} height={40} className='tw-absolute tw-top-[115px] tw-right-0' />
          </button>
        </div>
      </div>



      {/* <div className='tw-relative tw-bg-[#1A2C3D] tw-flex tw-justify-between  sm:tw-items-center tw-overflow-hidden'>
        <div className='tw-w-full tw-mt-12 lg:tw-mt-0 tw-py-8 lg:tw-py-16 tw-px-6 sm:tw-px-8 tw-z-[1]'>
          <div className='tw-text-xs tw-text-[#F2CA16] tw-pb-2'>NEW PLAYERS</div>
          <div className='tw-font-euro tw-text-[32px] tw-w-4/6 sm:tw-text-[40px] tw-leading-none'>100 WELCOME <br />CREDITS</div>
          <button className='btn-yellow tw-mt-6'>SIGN UP & WAGER</button>
        </div>
        <Image src={YellowSportsCarFull} width={569} height={213} alt="dollar" className='tw-w-auto tw-h-[93px] sm:tw-h-[120px] md:tw-h-[150px] lg:tw-h-[213px] tw-top-8 sm:tw-top-12 tw-absolute sm:tw-block tw-right-[-32px] sm:tw-right-0 tw-z-[1]' />
        <Image src={DiagonalLinesCarousel} width={733} height={664} alt="dollar" className='tw-w-auto tw-h-[300px] tw-absolute tw-top-0 tw-right-0 sm:tw-right-4 md:tw-right-8 lg:tw-right-36' />
      </div> */}
    </div>
  )
}

const LiveGames: React.FC<LiveGamesProps> = ({ carData }) => {
  return (
    <div className="tw-px-4 md:tw-px-16 tw-w-screen 2xl:tw-w-[1440px] tw-py-8 sm:tw-py-16">
      <header className='tw-flex tw-justify-between'>
        <div className='tw-flex tw-items-center'>
          <Image src={LiveGamesIcon} width={40} height={40} alt="dollar" className='tw-w-10 tw-h-10' />
          <div className='tw-font-bold tw-text-2xl sm:tw-text-3xl tw-ml-4'>Live Games</div>
        </div>
        <div className='tw-flex'>
          <Image src={ArrowLeft} width={32} height={32} alt="arrow left" className='tw-w-8 tw-h-8 ' />
          <Image src={ArrowRight} width={32} height={32} alt="arrow right" className='tw-w-8 tw-h-8 tw-ml-4' />
        </div>
      </header>
      <section className="tw-mt-8 sm:tw-mt-14 tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 md:tw-grid-cols-3 lg:tw-grid-cols-5 tw-gap-4 sm:tw-gap-8">
        {carData.map((item) => (
          <LiveGamesCard
            key={item.id}
            url={item.url}
            year={item.year}
            name={item.name}
            description={item.description}
            time={item.time}
          />
        ))}
      </section>
    </div>
  );
};

const LiveGamesCard: React.FC<LiveGamesCardProps> = ({ url, year, name, description, time }) => {

  return (
    <div className='tw-w-auto tw-flex tw-flex-row sm:tw-flex-col tw-items-center tw-justify-center'>
      <div className='tw-w-[120px] sm:tw-w-[200px] tw-h-[138px] sm:tw-h-[218px] tw-relative'>
        <div className='tw-w-[61px] tw-h-[36px] tw-bg-red-500 tw-rounded-s-full tw-rounded-e-full tw-flex tw-justify-center tw-items-center tw-absolute tw-bottom-0 tw-left-[30px] sm:tw-left-[70px]'>LIVE</div>
        <img src={url} width={200} height={200} alt="car" className='tw-w-[120px] sm:tw-w-[200px] tw-h-[120px] sm:tw-h-[200px] tw-rounded-full tw-object-cover tw-border-solid tw-border-4 tw-border-red-500' />
      </div>
      <div className='tw-ml-4 sm:tw-ml-0'>
        <div className='info tw-my-3 tw-flex tw-flex-col tw-items-start sm:tw-items-center'>
          <div className='tw-mt-0 sm:tw-mt-3 tw-font-medium'>{year} {name}</div>
          <div className='tw-my-1.5 tw-font-medium'>{description}</div>
          <div className='tw-flex tw-items-center'>
            <Image src={HourGlassIcon} width={12} height={14} alt="hour glass" className='tw-w-[12px] tw-h-[14px] tw-mr-1 ' />
            <div>{time}</div>
          </div>
          <Image src={PlayersIcon} width={152} height={40} alt="players" className='tw-w-auto tw-mt-2 sm:tw-mt-4 tw-h-[32px] sm:tw-h-[40px]' />
        </div>
        <div className='tw-mt-1.5'>
        </div>
      </div>


    </div>
  )
}


const TeamBattles = () => {
  const teamPlayers = [{
    id: "t1",
    username: "Username",
    avatar: AvatarOne,
    amount: "$168,00"
  }, {
    id: "t2",
    username: "Username",
    avatar: AvatarTwo,
    amount: "$157,00"
  }, {
    id: "t3",
    username: "Username",
    avatar: AvatarThree,
    amount: "$152,00"
  }, {
    id: "t4",
    username: "Username",
    avatar: AvatarFour,
    amount: "$132,00"
  },
  ]
  return (
    <div className='tw-px-4 md:tw-px-16 tw-w-screen 2xl:tw-w-[1440px] tw-py-8 sm:tw-py-16'>
      <header className='tw-flex tw-justify-between'>
        <div className='tw-flex tw-items-center'>
          <Image src={TeamBattlesIcon} width={40} height={40} alt="dollar" className='tw-w-10 tw-h-10' />
          <div className='tw-font-bold tw-text-2xl sm:tw-text-3xl tw-ml-4'>Team Battles</div>
        </div>
        <div className='tw-flex'>
          <Image src={ArrowLeft} width={32} height={32} alt="arrow left" className='tw-w-8 tw-h-8 ' />
          <Image src={ArrowRight} width={32} height={32} alt="arrow right" className='tw-w-8 tw-h-8 tw-ml-4' />
        </div>
      </header>
      <section className='left-container tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-8 md:tw-gap-16 tw-mt-8 sm:tw-mt-16'>
        <div
          style={{ backgroundImage: `url(https://images4.alphacoders.com/110/1103803.jpg)` }}
          className='tw-h-[388px] tw-w-auto tw-bg-cover tw-rounded-lg tw-p-4 tw-flex tw-flex-col tw-justify-end'>
          <div className='tw-text-2xl tw-font-medium'>1954 Siata 300BC Convertible by Motto</div>
          <div className='tw-flex tw-items-center'>
            <Image src={HourGlassIcon} width={12} height={14} alt="hour glass" className='tw-w-[12px] tw-h-[14px] tw-mr-1 ' />
            <div>12:17:00</div>
          </div>
        </div>
        <div className='right-container tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 tw-gap-16 xl:tw-gap-16 tw-w-auto tw-h-auto'>
          {/* Team A */}
          <div className='tw-relative'>
            <div className='tw-px-5 tw-w-full tw-h-[356px]'>
              <Image src={TrophyIconGreen} width={52} height={52} alt="dollar" className='tw-w-[52px] tw-h-[52px] ' />
              <div className='tw-font-bold tw-text-[18px]'>Team A</div>
              <div className='tw-text-[14px]'>11 Players</div>
              <div className='tw-relative tw-mt-4'>
                {teamPlayers.map((player) => {
                  return <div key={player.id} className='tw-mb-4 tw-flex'>
                    <Image src={player.avatar} width={40} height={40} alt="dollar" className='tw-w-[40px] tw-h-[40px] tw-mr-4' />
                    <div className='tw-text-sm '>
                      <div className='tw-font-bold'>{player.amount}</div>
                      <div>{player.username}</div>
                    </div>
                  </div>
                })}
              </div>
            </div>
            {/* Background and button*/}
            <div className='tw-absolute tw-top-[26px] tw-h-[362px] tw-z-[-1]'>
              <Image src={TransitionPattern} width={288} height={356} alt="pattern" className='tw-w-auto tw-h-[288px]  tw-rounded-lg tw-mr-1 tw-object-cover' />
              <div className='tw-w-full tw-h-full tw-rounded-lg tw-absolute tw-top-0 tw-bg-[#49C74233]'></div>
              <button className='btn-green tw-absolute tw-bottom-[-20px] tw-right-[16px]'>Wager on Team B</button>
            </div>
          </div>

          {/* Team B */}
          <div className='tw-relative tw-pb-8 sm:tw-pb-0'>
            <div className='tw-px-5 tw-w-full tw-h-[356px]'>
              <Image src={TrophyIconBlue} width={52} height={52} alt="dollar" className='tw-w-[52px] tw-h-[52px] ' />
              <div className='tw-font-bold tw-text-[18px]'>Team B</div>
              <div className='tw-text-[14px]'>10 Players</div>
              <div className='tw-relative tw-mt-4'>
                {teamPlayers.map((player) => {
                  return <div key={player.id} className='tw-mb-4 tw-flex'>
                    <Image src={player.avatar} width={40} height={40} alt="dollar" className='tw-w-[40px] tw-h-[40px] tw-mr-4' />
                    <div className='tw-text-sm '>
                      <div className='tw-font-bold'>{player.amount}</div>
                      <div>{player.username}</div>
                    </div>
                  </div>
                })}
              </div>
            </div>
            {/* Background and button*/}
            <div className='tw-absolute tw-top-[26px] tw-h-[362px] tw-z-[-1]'>
              <Image src={TransitionPattern} width={288} height={356} alt="pattern" className='tw-w-auto tw-h-[288px]  tw-rounded-lg tw-mr-1 tw-object-cover' />
              <div className='tw-w-full tw-h-full tw-rounded-lg tw-absolute tw-top-0 tw-bg-[#156CC333]'></div>
              <button className='btn-blue tw-absolute tw-bottom-[-20px] tw-right-[16px]'>Wager on Team B</button>
            </div>
          </div>

        </div>
      </section>
    </div>
  )
}

const Tournaments = () => {
  return (
    <div className='tw-px-4 md:tw-px-16 tw-w-screen 2xl:tw-w-[1440px] tw-py-8 sm:tw-py-16'>
      <header className='tw-flex tw-justify-between'>
        <div className='tw-flex tw-items-center'>
          <Image src={TournamentsIcon} width={40} height={40} alt="dollar" className='tw-w-10 tw-h-10' />
          <div className='tw-font-bold tw-text-2xl sm:tw-text-3xl tw-ml-4'>Tournaments</div>
        </div>
        <div className='tw-flex'>
          <Image src={ArrowLeft} width={32} height={32} alt="arrow left" className='tw-w-8 tw-h-8' />
          <Image src={ArrowRight} width={32} height={32} alt="arrow right" className='tw-w-8 tw-h-8 tw-ml-4' />
        </div>
      </header>
      <section className='tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-8 tw-mt-8'>
        {/* to be replaced by array.map */}
        <TournamentsCard />
        <TournamentsCard />
        <TournamentsCard />
      </section>
    </div>
  )
}

const TournamentsCard = () => {
  const userList = [{
    number: "1",
    img: AvatarOne,
    username: "Username",
    points: "936"
  },
  {
    number: "2",
    img: AvatarTwo,
    username: "Username",
    points: "984"
  }, {
    number: "3",
    img: AvatarThree,
    username: "Username",
    points: "1,000"
  }]
  return (
    <div className=''>
      <div className='tw-relative tw-grid tw-grid-cols-3 tw-gap-4 tw-px-2 sm:tw-px-4'>
        <div className='tw-flex tw-justify-end '>
          <img src='https://classifieds.singaporeexpats.com/data/16/15950784501YKvxw.jpg' width={90} height={90} alt='image' className='tw-w-[90px] tw-h-[90px] tw-absolute tw-object-cover tw-rounded-full tw-top-[10px] tw-opacity-[50%]' />
        </div>
        <div className='tw-flex tw-justify-center'>
          <img src='https://classifieds.singaporeexpats.com/data/16/15950784501YKvxw.jpg' width={100} height={100} alt='image' className='tw-w-[100px] tw-h-[100px] tw-absolute tw-object-cover tw-rounded-full ' />
        </div>
        <div className='tw-flex tw-justify-start'>
          <img src='https://classifieds.singaporeexpats.com/data/16/15950784501YKvxw.jpg' width={90} height={90} alt='image' className='tw-w-[90px] tw-h-[90px] tw-absolute tw-object-cover tw-rounded-full tw-top-[10px] tw-opacity-[50%]' />
        </div>
      </div>
      <div className='tw-bg-[#1A2C3D] tw-w-auto tw-text-center tw-p-4 tw-rounded-lg tw-mt-12 tw-pt-20' >
        <div className='tw-text-[18px] tw-font-bold'>2000s Tournament</div>
        <div className='tw-text-[#53944F]'>Just Ended</div>
        <div>

          {
            userList.map((user) => (
              <div key={user.username} className='tw-flex tw-items-center tw-justify-between tw-my-3'>
                <div className='tw-flex tw-items-center'>
                  <div>{user.number}</div>
                  <Image src={user.img} width={40} height={40} alt="avatar" className='tw-w-[40px] tw-h-[40px] tw-mx-3' />
                  <div>{user.username}</div>
                </div>
                <div className='tw-text-[#F2CA16] tw-font-bold'>{`${user.points} pts.`}</div>
              </div>
            ))
          }

          {/* other users*/}
        </div>
        <div>
          <button className='btn-yellow tw-w-full'>View Results</button>
        </div>

      </div>
    </div>
  )
}



const NewEraWagering = () => {
  return (

    <div className='tw-w-screen tw-bg-[#DCE0D9] tw-text-[#0F1923] tw-pb-[120px] tw-flex tw-flex-col'>
      <div className='design-container'>
        <div className='tw-h-[6px]'></div>
        <div className='tw-bg-[#0F1923] tw-h-[40px]'></div>
        <div className='tw-bg-[#0F1923] tw-h-[24px] tw-mt-3.5'></div>
        <div className='tw-bg-[#0F1923] tw-h-[8px] tw-mt-8'></div>
        <div className='tw-bg-[#0F1923] tw-h-[4px] tw-mt-12'></div>
      </div>

      <div className='tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-pt-16 sm:tw-pt-[120px] tw-px-4 md:tw-px-16 tw-w-screen 2xl:tw-w-[1440px] tw-self-center'>
        <div className='tw-relative'>
          <div className=' tw-font-bold tw-text-[48px] md:tw-text-[56px] lg:tw-text-[60px] lg:tw-text-[80px] tw-leading-tight' >A New Era <br />of Wagering</div>
          <div className=' tw-font-bold tw-text-[48px] md:tw-text-[60px] lg:tw-text-[80px]' ></div>
        </div>
        <div>
          <p className='tw-mt-8 lg:tw-mt-0'>Excepteur sint obcaecat cupiditat non proident culpa. At nos hinc posthac, sitientis piros Afros. Cum sociis natoque penatibus et magnis dis parturient. Quam diu etiam furor iste tuus nos eludet?<br /><br />
            Quam temere in vitiis, legem sancimus haerentia. Phasellus laoreet lorem vel dolor tempus vehicula. Qui ipsorum lingua Celtae, nostra Galli appellantur. Curabitur blandit tempus ardua ridiculus sed magna. Tu quoque, Brute, fili mi, nihil timor populi, nihil! Donec sed odio operae, eu vulputate felis rhoncus.</p>
          <div className='tw-mt-6 tw-flex tw-flex-col sm:tw-flex-row tw-justify-start'>
            <button className='btn-dark'>Sign up to win</button>
            <button className='btn-transparent tw-mt-4 sm:tw-mt-0 sm:tw-ml-4'>About HammerShift</button>
          </div>
        </div>
      </div>

      <div className='options tw-grid tw-cols-1 lg:tw-grid-cols-3 tw-gap-6 tw-px-4 md:tw-px-16 tw-pt-16 sm:tw-pt-[120px] tw-w-screen 2xl:tw-w-[1440px] tw-self-center'>
        <div className=' tw-bg-white tw-rounded-lg tw-text-center tw-py-[32px] tw-px-[24px]'>
          <Image src={LiveGamesIcon} width={68} height={68} alt="dollar" className='tw-block tw-mx-auto tw-w-[68px] tw-h-[68px] tw-shadow-lg tw-rounded-[16px] ' />
          <h1 className='tw-font-bold tw-text-[24px] tw-mt-3'>Guess the Price</h1>
          <p>Wager on the car auction and guess the final hammer price. Closest player wins the prize.</p>
          <button className='btn-yellow tw-mt-4'>View games</button>
        </div>
        <div className='tw-bg-white tw-rounded-lg tw-text-center tw-py-[32px] tw-px-[24px]'>
          <Image src={TeamBattlesIcon} width={68} height={68} alt="dollar" className='tw-block tw-mx-auto tw-w-[68px] tw-h-[68px] tw-shadow-lg tw-rounded-[16px]' />
          <h1 className='tw-font-bold tw-text-[24px] tw-mt-3'>Team Battles</h1>
          <p>Pick between teams betting on the same car. Player in the team with the closest wager wins the prize.</p>
          <button className='btn-yellow  tw-mt-4'>Pick a team</button>
        </div>
        <div className='tw-bg-white tw-rounded-lg tw-text-center tw-py-[32px] tw-px-[24px]'>
          <Image src={TournamentsIcon} width={68} height={68} alt="dollar" className='tw-block tw-mx-auto tw-w-[68px] tw-h-[68px] tw-shadow-lg tw-rounded-[16px]' />
          <h1 className='tw-font-bold tw-text-[24px] tw-mt-3'>Tournaments</h1>
          <p>Get more points the closer you are to the hammer price of a curated set of car auctions.</p>
          <button className='btn-yellow tw-mt-4'>Buy-in for $100</button>
        </div>
      </div>
    </div>


  )
}


const GamesByMake = () => {
  // sample data
  const carList = [{ name: BMWLogo, width: 100 }, { name: AudiLogo, width: 120 }, { name: DodgeLogo, width: 180 }, { name: FordLogo, width: 160 }, { name: HondaLogo, width: 120 }, { name: JeepLogo, width: 100 }, { name: NissanLogo, width: 120 }, { name: SubaruLogo, width: 120 }, { name: TeslaLogo, width: 160 }, { name: ToyotaLogo, width: 120 }]


  return (
    <div className='tw-px-4 md:tw-px-16 tw-w-screen 2xl:tw-w-[1440px] tw-py-8 md:tw-py-[120px]'>
      <header className='tw-flex tw-justify-between'>
        <div className='tw-flex tw-items-center'>
          <Image src={GamesByMakeIcon} width={40} height={40} alt="dollar" className='tw-w-10 tw-h-10' />
          <div className='tw-font-bold tw-text-2xl sm:tw-text-3xl tw-ml-4'>Games by Make</div>
        </div>
        <div className='tw-flex'>
          <Image src={ArrowLeft} width={32} height={32} alt="arrow left" className='tw-w-8 tw-h-8 ' />
          <Image src={ArrowRight} width={32} height={32} alt="arrow right" className='tw-w-8 tw-h-8 tw-ml-4' />
        </div>
      </header>
      <section className='tw-grid tw-grid-cols-3 sm:tw-grid-cols-2 md:tw-grid-cols-5 tw-gap-8 tw-mt-16'>
        {carList.map((car) => {
          return <div key={car.name}>
            <Image src={car.name} width={car.width} height={100} alt={car.name} style={{ width: car.width, height: "100px" }} className='tw-block tw-mx-auto' />
          </div>
        })}
      </section>
    </div>
  )
}


const WagerByCatergory = () => {
  return (
    <div className='tw-w-screen tw-bg-[#1A2C3D] tw-flex tw-flex-col tw-items-center'>
      <div className=' tw-px-4 md:tw-px-16 tw-w-auto tw-w-screen 2xl:tw-w-[1440px] tw-py-8 md:tw-py-[120px]'>
        <header>
          <div className='tw-flex tw-items-center'>
            <Image src={GamesByMakeIcon} width={40} height={40} alt="dollar" className='tw-w-10 tw-h-10' />
            <div className='tw-font-bold tw-text-2xl sm:tw-text-3xl tw-ml-4'>Wager by Category</div>
          </div>
        </header>
        <section>
          <div className='first-row tw-mt-8 tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6'>
            <div className='tw-h-[280px] tw-grid tw-grid-cols-2 tw-bg-[#FFFFFF]/5'>
              <div className='tw-flex tw-flex-col tw-justify-end tw-pl-6 tw-pb-6'>
                <div className='tw-text-[30px] tw-font-bold tw-x-auto'>Sedans</div>
                <div className='tw-my-4 '>Unam incolunt Belgae, aliam Aquitani, tertiam. Cras mattis iudicium purus sit amet fermentum.</div>
                <div className='tw-font-bold tw-text-[#F2CA16]'>Explore Sedans</div>
              </div>
              <div className='tw-relative'>
                <Image src={WhiteCar} width={511} height={255} alt="arrow left" className='tw-w-auto tw-h-auto tw-absolute tw-right-0' />
              </div>
            </div>
            <div className='tw-h-[280px] tw-grid tw-grid-cols-2 tw-bg-[#FFFFFF]/5'>
              <div className='tw-flex tw-flex-col tw-justify-end tw-pl-6 tw-pb-6'>
                <div className='tw-text-[30px] tw-font-bold tw-x-auto'>SUVs</div>
                <div className='tw-my-4'>Unam incolunt Belgae, aliam Aquitani, tertiam. Cras mattis iudicium purus sit amet fermentum.</div>
                <div className='tw-font-bold tw-text-[#F2CA16]'>Explore SUVs</div>
              </div>
              <div className='tw-relative'>
                <Image src={SilverSUV} width={511} height={255} alt="arrow left" className='tw-w-auto tw-h-auto tw-absolute tw-right-0' />
              </div>
            </div>
          </div>

          <div className='second-row tw-mt-8 tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-6'>
            <div className='tw-relative tw-h-[280px] tw-grid tw-grid-cols-2 tw-bg-[#FFFFFF]/5'>
              <div className='tw-flex tw-flex-col tw-justify-end tw-pl-6 tw-pb-6 tw-h-[288px]'>
                <div className='tw-text-[30px] tw-font-bold tw-x-auto'>EVs & Hybrids</div>
                <div className='tw-my-4 tw-text-ellipsis tw-overflow-hidden'>Unam incolunt Belgae, aliam Aquitani, tertiam. Cras mattis iudicium purus sit amet fermentum.</div>
                <div className='tw-font-bold tw-text-[#F2CA16]'>Explore EVs & Hybrids</div>
              </div>
              <div className='tw-relative'>
                <Image src={RedCar} width={511} height={255} alt="arrow left" className='tw-w-auto tw-h-auto tw-absolute tw-right-0' />
              </div>
            </div>
            <div className='tw-h-[280px] tw-grid tw-grid-cols-2 tw-bg-[#FFFFFF]/5'>
              <div className='tw-flex tw-flex-col tw-justify-end tw-pl-6 tw-pb-6 tw-h-[288px]'>
                <div className='tw-text-[30px] tw-font-bold tw-x-auto'>Luxury</div>
                <div className='tw-my-4 tw-text-ellipsis tw-overflow-hidden'>Unam incolunt Belgae, aliam Aquitani, tertiam. Cras mattis iudicium purus sit amet fermentum.</div>
                <div className='tw-font-bold tw-text-[#F2CA16]'>Explore Luxury</div>
              </div>
              <div className='tw-relative'>
                <Image src={YellowSportsCar} width={511} height={255} alt="arrow left" className='tw-w-auto tw-h-auto tw-absolute tw-right-0' />
              </div>
            </div>
            <div className='tw-h-[280px] tw-grid tw-grid-cols-2 tw-bg-[#FFFFFF]/5'>
              <div className='tw-flex tw-flex-col tw-justify-end tw-pl-6 tw-pb-6 tw-h-[288px]'>
                <div className='tw-text-[30px] tw-font-bold tw-x-auto'>Pickup Trucks</div>
                <div className='tw-my-4 tw-text-ellipsis tw-overflow-hidden'>Unam incolunt Belgae, aliam Aquitani, tertiam. Cras mattis iudicium purus sit amet fermentum.</div>
                <div className='tw-font-bold tw-text-[#F2CA16]'>Explore Pickup Trucks</div>
              </div>
              <div className='tw-relative'>
                <Image src={SilverPickup} width={511} height={255} alt="arrow left" className='tw-w-auto tw-h-auto tw-absolute tw-right-0' />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

  )
}

const SkillStrategyAndStakes = () => {
  return (
    <div className='tw-w-screen 2xl:tw-w-[1440px] tw-mt-[-1px] tw-flex tw-justify-center'>
      <Image src={TransitionPattern} width={288} height={356} alt="pattern" className='tw-absolute tw-z-[-1] tw-w-screen tw-h-auto tw-mr-1 tw-object-cover' />
      <div className=' tw-px-4 md:tw-px-16 xl:tw-px-36 tw-w-screen tw-pt-8 tw-pb-16'>
        <header>
          <h1 className='tw-pt-16 tw-w-auto tw-text-5xl md:tw-text-7xl tw-leading-normal tw-font-bold'>
            Skill, Strategy <br />& Stakes
          </h1>
        </header>

        <section>
          <p className='tw-max-w-[752px] tw-my-12'>The excitement of sports betting meets the thrill of car auctions. Car enthusiasts, put your skills to the test by predicting the outcomes of car auctions with unmatched precision. Combine knowledge, strategy, and a keen eye for value as the gavel drops and the bidding wars ignite. Join the action by placing wagers on the final price the vehicles will go for, which vehicles will command the highest bids, achieve record-breaking prices, or even which ones will surprise the crowd with unexpected deals. Sharpen your instincts, analyze market trends, and immerse yourself in the world of rare classics, luxury exotics, and iconic muscle cars.</p>
          <button className='btn-yellow tw-w-full sm:tw-w-auto'>Join and get 100 credits</button>
        </section>
      </div>

    </div>
  )
}

const NewGames = () => {
  return (
    <div className='tw-px-4 md:tw-px-16 tw-w-screen 2xl:tw-w-[1440px] tw-py-8 sm:tw-py-12'>

      <header className='tw-max-w-[1312px]'>
        <div className='tw-flex tw-justify-between'>
          <div className='tw-flex tw-items-center'>
            <Image src={GamesByMakeIcon} width={40} height={40} alt="dollar" className='tw-w-10 tw-h-10' />
            <div className='tw-font-bold tw-text-2xl sm:tw-text-3xl tw-ml-4'>New Games</div>
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

const WhatsTrending = () => {
  return (
    <div className='tw-px-4 md:tw-px-16 tw-w-screen 2xl:tw-w-[1440px] tw-py-12'>

      <header className='tw-max-w-[1312px]'>
        <div className='tw-flex tw-justify-between'>
          <div className='tw-flex tw-items-center'>
            <Image src={GamesByMakeIcon} width={40} height={40} alt="dollar" className='tw-w-10 tw-h-10' />
            <div className='tw-font-bold tw-text-2xl sm:tw-text-3xl tw-ml-4'>{`What\'s Trending`}</div>
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

const MostExpensiveCars = () => {
  return (
    <div className='tw-px-4 md:tw-px-16 tw-w-screen 2xl:tw-w-[1440px] tw-py-12'>

      <header className='tw-max-w-[1312px]'>
        <div className='tw-flex tw-justify-between'>
          <div className='tw-flex tw-items-center'>
            <Image src={GamesByMakeIcon} width={40} height={40} alt="dollar" className='tw-w-10 tw-h-10' />
            <div className='tw-font-bold tw-text-2xl sm:tw-text-3xl tw-ml-4'>Most Expensive Cars</div>
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

const MostBids = () => {
  return (
    <div className='tw-px-4 md:tw-px-16 tw-w-screen 2xl:tw-w-[1440px] tw-py-12'>

      <header className='tw-max-w-[1312px]'>
        <div className='tw-flex tw-justify-between'>
          <div className='tw-flex tw-items-center'>
            <Image src={GamesByMakeIcon} width={40} height={40} alt="dollar" className='tw-w-10 tw-h-10' />
            <div className='tw-font-bold tw-text-2xl sm:tw-text-3xl tw-ml-4'>Most Bids</div>
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

