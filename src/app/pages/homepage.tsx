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
import GamesByMakeIcon from '../../../public/images/games-by-make-icon.svg'
import Avatar from '../../../public/images/avatar.svg'

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

import WhiteCar from '../../../public/images/wager-by-category/white-car.svg'
import RedCar from '../../../public/images/wager-by-category/red-car.svg'
import YellowSportsCar from '../../../public/images/wager-by-category/yellow-sportscar.svg'
import SilverPickup from '../../../public/images/wager-by-category/silver-pickup.svg'
import SilverSUV from '../../../public/images/wager-by-category/silver-suv.svg'



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
  return (
    <div>
      <Navbar />
      <div className='tw-mt-16'>
        <Carousel />
      </div>
      <div className='tw-mt-16'>
        <LiveGames carData={carData} />
      </div>
      <div className='tw-mt-16'>
        <TeamBattles />
      </div>
      <div className='tw-mt-16'>
        <Tournaments />
      </div>
      <div className='tw-mt-16'>
        <NewEraWagering />
      </div>
      <div className='tw-mt-16'>
        <GamesByMake />
      </div>
      <div className='tw-mt-16'>
        <WagerByCatergory />
      </div>
      <div className=''>
        <SkillStrategyAndStakes />
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

const LiveGames: React.FC<LiveGamesProps> = ({ carData }) => {
  return (
    <div className="tw-px-4 md:tw-px-16 xl:tw-px-36 tw-w-screen tw-pt-8">
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
      <div className="tw-mt-14 tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 md:tw-grid-cols-3 lg:tw-grid-cols-5 tw-gap-8">
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
      </div>
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
        <div className='info tw-my-3 tw-flex tw-flex-col tw-items-center'>
          <div className='tw-mt-3 tw-font-medium'>{year} {name}</div>
          <div className='tw-my-1.5 tw-font-medium'>{description}</div>
          <div className='tw-flex tw-items-center'>
            <Image src={HourGlassIcon} width={12} height={14} alt="hour glass" className='tw-w-[12px] tw-h-[14px] tw-mr-1 ' />
            <div>{time}</div>
          </div>
        </div>
        <div className='tw-mt-1.5'>
          <Image src={PlayersIcon} width={152} height={40} alt="players" className='tw-w-[152px] tw-h-[40px]' />
        </div>
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
      <div className='left-container tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 tw-gap-8 tw-mt-16'>
        <div
          style={{ backgroundImage: `url(https://images4.alphacoders.com/110/1103803.jpg)` }}
          className='tw-h-[388px] tw-w-auto tw-bg-cover tw-rounded-lg tw-p-4 tw-flex tw-flex-col tw-justify-end'>
          <div className='tw-text-2xl tw-font-medium'>1954 Siata 300BC Convertible by Motto</div>
          <div className='tw-flex tw-items-center'>
            <Image src={HourGlassIcon} width={12} height={14} alt="hour glass" className='tw-w-[12px] tw-h-[14px] tw-mr-1 ' />
            <div>12:17:00</div>
          </div>
        </div>
        <div className='right-container tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 tw-gap-4 tw-w-auto tw-h-auto'>
          <div>
            <Image src={TransitionPattern} width={288} height={356} alt="pattern" className='tw-w-auto tw-h-auto tw-mr-1 tw-object-cover' />

          </div>
          <div>
            <Image src={TransitionPattern} width={288} height={356} alt="pattern" className='tw-w-auto tw-h-auto tw-mr-1 tw-object-cover' />

          </div>
        </div>
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
        <TournamentsCard />
      </div>
    </div>
  )
}

const TournamentsCard = () => {
  const userList = [{
    number: "1",
    img: Avatar,
    username: "Username",
    points: "936"
  },
  {
    number: "2",
    img: Avatar,
    username: "Username",
    points: "984"
  }, {
    number: "3",
    img: Avatar,
    username: "Username",
    points: "1,000"
  }]
  return (
    <div className=''>
      <div>
        {/* transition images*/}
      </div>
      <div className='tw-bg-[#1A2C3D] tw-w-[416px] tw-text-center tw-p-4 tw-rounded-lg tw-mt-12 tw-pt-16' >
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
    <div className='tw-w-screen tw-bg-[#DCE0D9] tw-text-[#0F1923] tw-pb-[120px]'>
      <div>
        <div className='tw-h-[6px]'></div>
        <div className='tw-bg-[#0F1923] tw-h-[40px]'></div>
        <div className='tw-bg-[#0F1923] tw-h-[24px] tw-mt-3.5'></div>
        <div className='tw-bg-[#0F1923] tw-h-[8px] tw-mt-8'></div>
        <div className='tw-bg-[#0F1923] tw-h-[4px] tw-mt-12'></div>
      </div>
      <div className='tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-py-24 tw-px-4 md:tw-px-16 xl:tw-px-36'>
        <div className='tw-relative'>
          <div className=' tw-font-bold tw-text-[48px] md:tw-text-[60px] lg:tw-text-[80px]' >A New Era</div>
          <div className=' tw-font-bold tw-text-[48px] md:tw-text-[60px] lg:tw-text-[80px]' >of Wagering</div>
        </div>
        <div>
          <p>Excepteur sint obcaecat cupiditat non proident culpa. At nos hinc posthac, sitientis piros Afros. Cum sociis natoque penatibus et magnis dis parturient. Quam diu etiam furor iste tuus nos eludet?<br /><br />
            Quam temere in vitiis, legem sancimus haerentia. Phasellus laoreet lorem vel dolor tempus vehicula. Qui ipsorum lingua Celtae, nostra Galli appellantur. Curabitur blandit tempus ardua ridiculus sed magna. Tu quoque, Brute, fili mi, nihil timor populi, nihil! Donec sed odio operae, eu vulputate felis rhoncus.</p>
          <div className='tw-mt-6'>
            <button className='btn-dark'>Sign up to win</button>
            <button className='btn-transparent tw-ml-4'>About HammerShift</button>
          </div>
        </div>
      </div>
      <div className='options tw-grid tw-cols-1 md:tw-grid-cols-3 tw-gap-6 tw-px-4 md:tw-px-16 xl:tw-px-36'>
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
    <div className='tw-px-4 md:tw-px-16 xl:tw-px-36 tw-w-screen tw-pt-8'>
      <div className='tw-flex tw-justify-between'>
        <div className='tw-flex tw-items-center'>
          <Image src={GamesByMakeIcon} width={40} height={40} alt="dollar" className='tw-w-10 tw-h-10' />
          <div className='tw-font-bold tw-text-2xl sm:tw-text-3xl tw-ml-4'>Games by Make</div>
        </div>
        <div className='tw-flex'>
          <Image src={ArrowLeft} width={32} height={32} alt="arrow left" className='tw-w-8 tw-h-8 ' />
          <Image src={ArrowRight} width={32} height={32} alt="arrow right" className='tw-w-8 tw-h-8 tw-ml-4' />
        </div>
      </div>
      <div className='tw-grid tw-grid-cols-2 tw-grid-rows-5 md:tw-grid-cols-5 md:tw-grid-rows-2 tw-gap-8 tw-mt-16'>
        {carList.map((car) => {
          return <div key={car.name}>
            <Image src={car.name} width={car.width} height={100} alt={car.name} style={{ width: car.width, height: "100px" }} className='tw-block tw-mx-auto' />
          </div>
        })}
      </div>
    </div>
  )
}


const WagerByCatergory = () => {
  return (
    <div className='tw-bg-[#1A2C3D] tw-px-4 md:tw-px-16 xl:tw-px-36 tw-w-screen tw-pt-8 tw-pb-16'>
      <div>
        <div className='tw-flex tw-items-center'>
          <Image src={GamesByMakeIcon} width={40} height={40} alt="dollar" className='tw-w-10 tw-h-10' />
          <div className='tw-font-bold tw-text-2xl sm:tw-text-3xl tw-ml-4'>Wager by Category</div>
        </div>
      </div>

      <div className='content-container'>

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
      </div>
    </div>
  )
}

const SkillStrategyAndStakes = () => {
  return (
    <div className='tw-w-screen tw-m-0'>
      <Image src={TransitionPattern} width={288} height={356} alt="pattern" className='tw-w-screen tw-h-auto tw-mr-1 tw-object-cover' />
      <div className=' tw-px-4 md:tw-px-16 xl:tw-px-36 tw-w-screen tw-pt-8 tw-pb-16'>
        <header>
          <h1 className=''>
            Skill, Strategy & Stakes
          </h1>

        </header>

        <div className='content-container'>

          {/* add content */}

        </div>
      </div>

    </div>
  )
}