'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Logo from '../../../public/images/hammershift-logo.svg';
import LogoSmall from '../../../public/images/logo-small.svg';
import MagnifyingGlass from '../../../public/images/magnifying-glass.svg';
import WagersIcon from '../../../public/images/dollar-coin.svg';
import WatchlistIcon from '../../../public/images/watchlist-icon.svg';
import AccountIcon from '../../../public/images/account-icon.svg';
import HamburgerMenu from '../../../public/images/hamburger-menu.svg';
import CancelIcon from '../../../public/images/x-icon.svg';
import WatchlistBig from '../../../public/images/watchlist-icon-big.svg';
import Wallet from '../../../public/images/wallet--money-payment-finance-wallet.svg';
import MoneyBag from '../../../public/images/monetization-browser-bag-big.svg';
import Dollar from '../../../public/images/dollar.svg';
import Hourglass from '../../../public/images/hour-glass.svg';
import WalletSmall from '../../../public/images/wallet--money-payment-finance-wallet.svg';
import MoneyBagGreen from '../../../public/images/monetization-browser-bag-green.svg';
import RankingStarTop from '../../../public/images/ranking-star-top.svg';

import MyWagerPhotoOne from '../../../public/images/my-wagers-navbar/my-wager-photo-one.svg';
import MyWagerPhotoTwo from '../../../public/images/my-wagers-navbar/my-wager-photo-two.svg';
import MyWagerPhotoThree from '../../../public/images/my-wagers-navbar/my-wager-photo-three.svg';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

// export interface NavbarProps {
//     isLoggedIn: boolean;
// }

type NavbarDropdownMenuProps = null | 'My Watchlist' | 'My Wagers' | 'My Account' | 'Search';

const Navbar = () => {
  const router = useRouter();
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [searchedData, setSearchedData] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchBoxDropDown, setSearchBoxDropDown] = useState(false);
  const [myAccountMenuOpen, setMyAccountMenuOpen] = useState(false);
  const [navDropdownMenu, setNavDropdownMenu] = useState<NavbarDropdownMenuProps>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const searchBox = document.getElementById('search-box');
      const searchBar = document.getElementById('search-bar-input');

      if (searchBox && !searchBox.contains(e.target as Node) && searchBar && !searchBar.contains(e.target as Node)) {
        setSearchBoxDropDown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [setSearchBoxDropDown]);

  const handleSumbit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await fetch(`/api/cars/filter?search=${searchKeyword}`);
    const data = await response.json();

    setSearchedData(data.cars);
    setSearchBoxDropDown(false);
    router.push('/auctions');
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
    const response = await fetch(`/api/cars/filter?search=${searchKeyword}`);
    const data = await response.json();

    if (data.length !== 0) {
      setSearchBoxDropDown(true);
    } else {
      setSearchBoxDropDown(false);
    }
    setSearchedData(data.cars);
  };

  const handleInputClick = () => {
    if (searchedData.length !== 0) {
      setSearchBoxDropDown(true);
    } else {
      setSearchBoxDropDown(false);
    }
  };

  const handleSearchClick = async (carMake: string, carModel: string) => {
    router.push('/auctions');
    const searchInput = document.getElementById('search-bar-input') as HTMLInputElement;
    const dropdownSearchInput = document.getElementById('dropdown-search-bar') as HTMLInputElement;
    if (searchInput) {
      searchInput.value = `${carMake} ${carModel}`;
    }
    if (dropdownSearchInput) {
      dropdownSearchInput.value = `${carMake} ${carModel}`;
    }
    setSearchBoxDropDown(false);
    // setMenuIsOpen(false)
  };

  const { data: session } = useSession();
  const isLoggedIn = !!session;

  return (
    <div>
      {isLoggedIn ? (
        <div className=' tw-flex tw-px-4 md:tw-px-16 2xl:tw-px-36 tw-w-screen tw-justify-between tw-py-3'>
          <div className='lg:tw-w-[411px] tw-flex tw-items-center tw-justify-between'>
            <div className='tw-pr-4'>
              <Link href='/'>
                <Image src={Logo} width={176} height={64} alt='logo' className='tw-hidden sm:tw-block tw-w-auto tw-h-auto' />
                <Image src={LogoSmall} width={32} height={32} alt='logo' className=' tw-block sm:tw-hidden tw-w-auto tw-h-auto' />
              </Link>
            </div>
            <Link href={'/discover_page'}>
              <div className='tw-block tw-mx-2 sm:tw-mx-4 '>DISCOVER</div>
            </Link>
            <Link href='/auctions'>
              <div className='tw-block tw-mx-2 sm:tw-mx-4 '>AUCTIONS</div>
            </Link>
          </div>
          <div className='tw-relative tw-max-w-[535px] tw-w-full tw-hidden lg:tw-block'>
            <form onSubmit={handleSumbit} autoComplete='off' className='tw-w-full tw-flex tw-items-center'>
              <div className={searchBoxDropDown ? 'tw-bg-shade-50 tw-flex tw-p-2 tw-grow tw-rounded-t' : 'tw-bg-shade-50 tw-flex tw-p-2 tw-grow tw-rounded'}>
                <Image src={MagnifyingGlass} width={15} height={15} alt='magnifying glass' className='tw-w-auto tw-h-auto' />
                <input
                  id='search-bar-input'
                  name='search'
                  type='text'
                  className='tw-ml-2 tw-bg-shade-50 tw-w-full tw-outline-none tw-border-none'
                  placeholder='Search make, model, year...'
                  onClick={handleInputClick}
                  onChange={handleChange}
                ></input>
              </div>
            </form>
            {searchBoxDropDown && <SearchDropDown searchedData={searchedData} onSearchClick={handleSearchClick} />}
          </div>
          {/* Buttons for logged in accounts */}
          <div className=' tw-hidden sm:tw-flex tw-justify-between tw-items-center tw-w-[136px] md:tw-visible'>
            <button
              className='tw-relative'
              onClick={() =>
                setNavDropdownMenu((prev) => {
                  if (prev === 'My Watchlist') return null;
                  else return 'My Watchlist';
                })
              }
            >
              <Image src={WatchlistIcon} width={24} height={24} alt='watchlist' className='tw-w-[24px] tw-h-[24px]' />
              {navDropdownMenu === 'My Watchlist' && <MyWatchlistDropdownMenu />}
            </button>
            <button
              className='tw-relative'
              onClick={() =>
                setNavDropdownMenu((prev) => {
                  if (prev === 'My Wagers') return null;
                  else return 'My Wagers';
                })
              }
            >
              <Image src={WagersIcon} width={24} height={24} alt='wagers' className='tw-w-[24px] tw-h-[24px]' />
              {navDropdownMenu === 'My Wagers' && <MyWagersDropdownMenu />}
            </button>
            <button
              className='tw-relative'
              onClick={() =>
                setNavDropdownMenu((prev) => {
                  if (prev === 'My Account') return null;
                  else return 'My Account';
                })
              }
            >
              <Image src={AccountIcon} width={24} height={24} alt='account' className='tw-w-[24px] tw-h-[24px]' />
              {navDropdownMenu === 'My Account' && <MyAccountDropdownMenu />}
            </button>
          </div>
          <div className='sm:tw-hidden'>
            <button onClick={() => setMyAccountMenuOpen((prev) => !prev)} className='tw-mr-4'>
              <Image src={AccountIcon} width={24} height={24} alt='account' className='tw-w-[24px] tw-h-[24px]' />
            </button>
            <button onClick={() => setMenuIsOpen((prev) => !prev)}>
              {menuIsOpen ? (
                <Image src={CancelIcon} width={24} height={24} alt='menu' className=' tw-w-auto tw-h-auto' />
              ) : (
                <Image src={HamburgerMenu} width={24} height={24} alt='menu' className=' tw-w-auto tw-h-auto' />
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className=' tw-flex tw-px-4 md:tw-px-16 2xl:tw-px-36 tw-w-screen tw-justify-between tw-py-3'>
          <div className='lg:tw-w-[411px] tw-flex tw-items-center tw-justify-between'>
            <div className='tw-pr-4'>
              <Link href='/'>
                <Image src={Logo} width={176} height={64} alt='logo' className='tw-block tw-w-auto tw-h-auto' />
              </Link>
            </div>
            <div className='tw-hidden sm:tw-block tw-mx-1 md:tw-mx-4 '>DISCOVER</div>
            <Link href='/auctions'>
              <div className='tw-hidden sm:tw-block tw-mx-1 md:tw-mx-4 '>AUCTIONS</div>
            </Link>
          </div>
          <div className='tw-hidden lg:tw-flex lg:tw-flex-1 lg:tw-items-center xl:tw-max-w-[535px] tw-mx-6 lg:tw-mx-12'>
            <div className='tw-bg-shade-100 tw-flex tw-p-2 tw-grow tw-rounded'>
              <Image src={MagnifyingGlass} width={15} height={15} alt='magnifying glass' className='tw-w-auto tw-h-auto' />
              <input className='tw-ml-2 tw-bg-shade-100 tw-w-full' placeholder='Search make, model, year...'></input>
            </div>
          </div>
          <div className='tw-flex tw-items-center'>
            <Link href='/create_account'>
              <button className='btn-white  hover:tw-bg-gold-200 tw-hidden md:tw-block '>CREATE ACCOUNT</button>
            </Link>
            <button onClick={() => setMenuIsOpen((prev) => !prev)}>
              {menuIsOpen ? (
                <Image src={CancelIcon} width={24} height={24} alt='menu' className='md:tw-hidden tw-w-auto tw-h-auto' />
              ) : (
                <Image src={HamburgerMenu} width={24} height={24} alt='menu' className='md:tw-hidden tw-w-auto tw-h-auto' />
              )}
            </button>
          </div>
        </div>
      )}
      {menuIsOpen && (
        <DropdownMenu
          searchedData={searchedData}
          isLoggedIn={isLoggedIn}
          handleSubmit={handleSumbit}
          handleChange={handleChange}
          onSearchClick={handleSearchClick}
          searchBoxDropDown={searchBoxDropDown}
          setSearchBoxDropDown={setSearchBoxDropDown}
          handleInputClick={handleInputClick}
        />
      )}
      {myAccountMenuOpen && <MyAccountMenu isLoggedIn={isLoggedIn} />}
    </div>
  );
};
export default Navbar;

interface DropdownMenuProps {
  isLoggedIn: boolean;
  searchBoxDropDown: boolean;
  setSearchBoxDropDown: React.Dispatch<React.SetStateAction<boolean>>;
  searchedData: SearchDatas[];
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchClick: (carMake: string, carModel: string) => void;
  handleInputClick: () => void;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  isLoggedIn,
  searchedData,
  handleSubmit,
  handleChange,
  onSearchClick,
  searchBoxDropDown,
  setSearchBoxDropDown,
  handleInputClick,
}) => {
  return (
    <div className='slide-in-top tw-absolute tw-flex-col tw-text-white tw-bg-[#0F1923] tw-p-4 tw-w-full tw-h-full tw-z-50'>
      <div className='tw-relative'>
        <form autoComplete='off' onSubmit={handleSubmit} className='tw-bg-shade-100 tw-flex tw-p-2 tw-rounded tw-mt-8'>
          <Image src={MagnifyingGlass} width={15} height={15} alt='magnifying glass' className='tw-w-auto tw-h-auto' />
          <input
            id='dropdown-search-bar'
            className='tw-ml-2 tw-bg-shade-100 tw-outline-none'
            placeholder='Search make, model, year...'
            name='search'
            type='text'
            onChange={handleChange}
            onClick={() => {
              setSearchBoxDropDown(true);
            }}
          ></input>
        </form>
        {searchBoxDropDown && <SearchDropDown searchedData={searchedData} onSearchClick={onSearchClick} />}
      </div>
      <div className='tw-flex tw-pt-4'>
        <Image src={WatchlistIcon} width={24} height={24} alt='watchlist' className='tw-w-[24px] tw-h-[24px]' />
        <div className='tw-ml-4'>MY WATCHLIST</div>
      </div>
      <div className='tw-flex tw-pt-4'>
        <Image src={WagersIcon} width={24} height={24} alt='watchlist' className='tw-w-[24px] tw-h-[24px]' />
        <div className='tw-ml-4'>MY WAGERS</div>
      </div>
      <div className='tw-mt-4'>{!isLoggedIn && <button className='btn-white tw-w-full'>CREATE ACCOUNT</button>}</div>
    </div>
  );
};

interface MyAccountMenuProps {
  isLoggedIn: boolean;
}

const MyAccountMenu: React.FC<MyAccountMenuProps> = ({ isLoggedIn }) => {
  return (
    <div className='slide-in-top tw-absolute tw-flex tw-flex-col tw-text-white tw-bg-[#1A2C3D] tw-p-4 tw-w-full tw-h-auto tw-z-50'>
      <div className='tw-text-lg tw-font-bold'>MY ACCOUNT</div>
      <div className='tw-m-1.5'>Profile</div>
      <div className='tw-m-1.5'>Setting</div>
      <div className='tw-m-1.5'>Logout</div>
    </div>
  );
};

// Dropdown Menus
const MyWatchlistDropdownMenu = () => {
  const watchlist = [
    {
      type: 'Single',
      title: '620-Mile 2019 Ford GT',
      img: MyWagerPhotoOne,
      my_wager: '$999,000',
      current_bid: '$904,000',
      time_left: '12:17:00',
      potential_prize: '$1,000',
      place: '',
    },
    {
      type: 'Single',
      title: '1954 Siata 300BC Convertible by Motto',
      img: MyWagerPhotoTwo,
      my_wager: '20,000',
      current_bid: '$22,000',
      time_left: '2:00:30',
      potential_prize: '$200',
      place: '',
    },
    {
      type: 'Tournament',
      title: 'Sedan Champions Tournament',
      img: MyWagerPhotoThree,
      my_wager: '$999,000',
      current_bid: '$904,000',
      time_left: '12:17:00',
      potential_prize: '$1,000',
      place: 'Current 5th place',
    },
  ];
  return (
    <div className='tw-absolute tw-z-10 tw-right-0 tw-top-8 tw-w-[512px] tw-h-auto tw-bg-[#1A2C3D] tw-rounded tw-py-6 tw-flex tw-flex-col tw-items-start tw-gap-4 tw-shadow-xl tw-shadow-black '>
      <div className='tw-px-6 tw-font-bold tw-text-lg'>MY WATCHLIST</div>
      <div className='tw-px-6 tw-grid tw-grid-cols-2 tw-w-full'>
        <div>
          <button>ACTIVE</button>
        </div>
        <div>
          <button>COMPLETED</button>
        </div>
      </div>
      {watchlist.length === 0 ? (
        <div className='tw-px-6 tw-py-16 tw-flex tw-flex-col tw-justify-center tw-items-center tw-w-full tw-gap-4'>
          <Image src={WatchlistBig} width={80} height={80} alt='watchlist icon' className='tw-w-[80px] tw-h-[80px]' />
          <div className='tw-'>
            <div className='tw-font-bold tw-text-xl'>Watchlist is empty</div>
            <div className='tw-opacity-70'>Quam temere in vitiis, legem sancimus haerentia</div>
          </div>
          <button className='btn-transparent-white'>DISCOVER AUCTIONS</button>
        </div>
      ) : (
        <div className='tw-w-full'>
          {watchlist.map((item) => (
            <div key={item.title}>
              <hr className='tw-opacity-10' />
              <MyWatchlistCard
                type={item.type}
                title={item.title}
                img={item.img}
                my_wager={item.my_wager}
                current_bid={item.current_bid}
                time_left={item.time_left}
                potential_prize={item.potential_prize}
                place={item.place}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface MyWatchlistCardProps {
  type: string;
  title: string;
  img: string;
  my_wager: string;
  current_bid: string;
  time_left: string;
  potential_prize: string;
  place: string;
}
const MyWatchlistCard: React.FC<MyWatchlistCardProps> = ({ type, title, img, my_wager, current_bid, time_left, potential_prize, place }) => {
  return (
    <div className='tw-px-6 tw-w-full tw-my-4'>
      {type === 'Single' && (
        <div className=' tw-w-full tw-py-4 tw-rounded tw-flex tw-items-center tw-gap-6'>
          <Link href={'/car_view_page'} className='tw-self-start'>
            <Image src={img} width={100} height={100} alt='wallet icon' className='tw-w-[100px] tw-h-[100px] tw-self-start' />
          </Link>
          <div className='tw-w-full tw-flex tw-flex-col tw-items-start tw-grow'>
            <Link href={'/car_view_page'} className='tw-self-start'>
              <div className='tw-w-full tw-font-bold tw-text-xl tw-py-1 tw-text-left'>{title}</div>
            </Link>
            <div className='tw-w-full tw-mt-1'>
              <div className='tw-flex tw-items-center tw-gap-2 tw-w-full'>
                <Image src={Dollar} width={14} height={14} alt='wallet icon' className='tw-w-[14px] tw-h-[14px]' />
                <span className='tw-opacity-80'>Current Bid:</span>
                <span className='tw-text-[#49C742] tw-font-bold'>{current_bid}</span>
              </div>
              <div className='tw-flex tw-items-center tw-gap-2 tw-w-full'>
                <Image src={Hourglass} width={14} height={14} alt='wallet icon' className='tw-w-[14px] tw-h-[14px]' />
                <span className='tw-opacity-80'>Time Left:</span>
                <span className=''>{time_left}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      {type === 'Tournament' && (
        <div className=' tw-w-full tw-py-4 tw-rounded tw-flex tw-items-center tw-gap-6'>
          <Link href={'/tournament_page'} className='tw-self-start'>
            <Image src={img} width={100} height={100} alt='wallet icon' className='tw-w-[100px] tw-h-[100px] tw-self-start' />
          </Link>
          <div className='tw-w-full tw-flex tw-flex-col tw-items-start tw-grow'>
            <Link href={'/tournament_page'} className='tw-self-start'>
              <div className='tw-w-full tw-font-bold tw-text-xl tw-py-1 tw-text-left'>{title}</div>
            </Link>
            <div className='tw-w-full tw-mt-1'>
              <div className='tw-flex tw-items-center tw-gap-2 tw-w-full'>
                <Image src={Hourglass} width={14} height={14} alt='wallet icon' className='tw-w-[14px] tw-h-[14px]' />
                <span className='tw-opacity-80'>Time Left:</span>
                <span className=''>{time_left}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface WagersProps {
  type: 'Single' | 'Tournament';
  title: string;
  img: string;
  my_wager: string;
  current_bid: string;
  time_left: string;
  potential_prize: string;
  place: string;
}
const MyWagersDropdownMenu = () => {
  //For 0 wagers
  // const wagers = [];
  // With wagers
  const wagers = [
    {
      type: 'Single',
      title: '620-Mile 2019 Ford GT',
      img: MyWagerPhotoOne,
      my_wager: '$999,000',
      current_bid: '$904,000',
      time_left: '12:17:00',
      potential_prize: '$1,000',
      place: '',
    },
    {
      type: 'Single',
      title: '1954 Siata 300BC Convertible by Motto',
      img: MyWagerPhotoTwo,
      my_wager: '20,000',
      current_bid: '$22,000',
      time_left: '2:00:30',
      potential_prize: '$200',
      place: '',
    },
    {
      type: 'Tournament',
      title: 'Sedan Champions Tournament',
      img: MyWagerPhotoThree,
      my_wager: '$999,000',
      current_bid: '$904,000',
      time_left: '12:17:00',
      potential_prize: '$1,000',
      place: 'Current 5th place',
    },
  ];
  return (
    <div className='tw-absolute tw-z-10 tw-right-0 tw-top-8 tw-w-[512px] tw-h-auto tw-bg-[#1A2C3D] tw-rounded tw-py-6 tw-flex tw-flex-col tw-items-start tw-gap-4 tw-shadow-xl tw-shadow-black '>
      <div className='tw-px-6 tw-font-bold tw-text-lg'>MY WAGERS</div>
      <div className='tw-px-6 tw-grid tw-grid-cols-2 tw-w-full'>
        <div>
          <button>ACTIVE</button>
        </div>
        <div>
          <button>COMPLETED</button>
        </div>
      </div>
      {wagers.length === 0 ? (
        <div className='tw-px-6 tw-py-16 tw-flex tw-flex-col tw-justify-center tw-items-center tw-w-full tw-gap-4'>
          <Image src={MoneyBag} width={80} height={80} alt='watchlist icon' className='tw-w-[80px] tw-h-[80px]' />
          <div className='tw-'>
            <div className='tw-font-bold tw-text-xl'>No active wagers</div>
            <div className='tw-opacity-70'>Quam temere in vitiis, legem sancimus haerentia</div>
          </div>
          <button className='btn-transparent-white'>DISCOVER AUCTIONS</button>
        </div>
      ) : (
        <div className='tw-w-full'>
          {wagers.map((item) => (
            <div key={item.title}>
              <hr className='tw-opacity-10' />
              <MyWagersCard
                type={item.type}
                title={item.title}
                img={item.img}
                my_wager={item.my_wager}
                current_bid={item.current_bid}
                time_left={item.time_left}
                potential_prize={item.potential_prize}
                place={item.place}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface MyWagersCardProps {
  type: string;
  title: string;
  img: string;
  my_wager: string;
  current_bid: string;
  time_left: string;
  potential_prize: string;
  place: string;
}
const MyWagersCard: React.FC<MyWagersCardProps> = ({ type, title, img, my_wager, current_bid, time_left, potential_prize, place }) => {
  return (
    <div className='tw-px-6 tw-w-full tw-my-4'>
      {type === 'Single' && (
        <div className=' tw-w-full tw-py-4 tw-rounded tw-flex tw-items-center tw-gap-6'>
          <Link href={'/car_view_page'} className='tw-self-start'>
            <Image src={img} width={100} height={100} alt='wallet icon' className='tw-w-[100px] tw-h-[100px]' />
          </Link>
          <div className='tw-w-full tw-flex tw-flex-col tw-items-start tw-grow'>
            <Link href={'/car_view_page'} className='tw-self-start'>
              <div className='tw-w-full tw-font-bold tw-text-xl tw-py-1 tw-text-left'>{title}</div>
            </Link>
            <div className='tw-w-full tw-mt-1'>
              <div className='tw-flex tw-items-center tw-gap-2 tw-w-full'>
                <Image src={WalletSmall} width={14} height={14} alt='wallet icon' className='tw-w-[14px] tw-h-[14px]' />
                <span className='tw-opacity-80'>My Wager:</span>
                <span className='tw-text-[#F2CA16] tw-font-bold'>{my_wager}</span>
              </div>
              <div className='tw-flex tw-items-center tw-gap-2 tw-w-full'>
                <Image src={Dollar} width={14} height={14} alt='wallet icon' className='tw-w-[14px] tw-h-[14px]' />
                <span className='tw-opacity-80'>Current Bid:</span>
                <span className='tw-text-[#49C742] tw-font-bold'>{current_bid}</span>
              </div>
              <div className='tw-flex tw-items-center tw-gap-2 tw-w-full'>
                <Image src={Hourglass} width={14} height={14} alt='wallet icon' className='tw-w-[14px] tw-h-[14px]' />
                <span className='tw-opacity-80'>Time Left:</span>
                <span className=''>{time_left}</span>
              </div>
            </div>
            <div className='tw-mt-4 tw-w-full tw-p-2 tw-flex tw-gap-4 tw-bg-[#49C74233] tw-rounded'>
              <Image src={MoneyBagGreen} width={20} height={20} alt='money bag' className='tw-w-[20px] tw-h-[20px]' />
              <div className='tw-text-[#49C742] tw-font-bold tw-text-left tw-grow-[1]'>POTENTIAL PRIZE</div>
              <div className='tw-text-[#49C742] tw-font-bold tw-text-left'>{potential_prize}</div>
            </div>
          </div>
        </div>
      )}
      {type === 'Tournament' && (
        <div className=' tw-w-full tw-py-4 tw-rounded tw-flex tw-items-center tw-gap-6'>
          <Link href={'/tournament_page'} className='tw-self-start'>
            <Image src={img} width={100} height={100} alt='wallet icon' className='tw-w-[100px] tw-h-[100px] tw-self-start' />
          </Link>
          <div className='tw-w-full tw-flex tw-flex-col tw-items-start tw-grow'>
            <Link href={'/tournament_page'} className='tw-self-start'>
              <div className='tw-w-full tw-font-bold tw-text-xl tw-py-1 tw-text-left'>{title}</div>
            </Link>
            <div className='tw-w-full tw-mt-1'>
              <div className='tw-flex tw-items-center tw-gap-2 tw-w-full'>
                <Image src={RankingStarTop} width={14} height={14} alt='wallet icon' className='tw-w-[14px] tw-h-[14px]' />
                <span className='tw-opacity-80'>Place:</span>
                <span className='tw-text-[#F2CA16] tw-font-bold'>{place}</span>
              </div>
              <div className='tw-flex tw-items-center tw-gap-2 tw-w-full'>
                <Image src={Hourglass} width={14} height={14} alt='wallet icon' className='tw-w-[14px] tw-h-[14px]' />
                <span className='tw-opacity-80'>Time Left:</span>
                <span className=''>{time_left}</span>
              </div>
            </div>
            <div className='tw-mt-4 tw-w-full tw-p-2 tw-flex tw-gap-4 tw-bg-[#49C74233] tw-rounded'>
              <Image src={MoneyBagGreen} width={20} height={20} alt='money bag' className='tw-w-[20px] tw-h-[20px]' />
              <div className='tw-text-[#49C742] tw-font-bold tw-text-left tw-grow-[1]'>POTENTIAL PRIZE</div>
              <div className='tw-text-[#49C742] tw-font-bold tw-text-left'>{potential_prize}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MyAccountDropdownMenu = () => {
  const account_load = 100;

  const handleSignOut = async () => {
    try {
      await signOut();
      console.log('User successfully logged out');
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };
  return (
    <div className='tw-absolute tw-z-10 tw-right-0 tw-top-8 tw-w-[320px] tw-h-auto tw-bg-[#1A2C3D] tw-rounded tw-py-6 tw-flex tw-flex-col tw-items-start tw-gap-4 tw-shadow-xl tw-shadow-black '>
      <div className='tw-px-6 tw-font-bold tw-text-lg'>MY ACCOUNT</div>
      {account_load && (
        <div className='tw-px-6 tw-w-full'>
          <div className='tw-bg-[#49C74233] tw-w-full tw-px-6 tw-py-4 tw-rounded tw-flex tw-items-center tw-gap-6'>
            <Image src={Wallet} width={32} height={32} alt='wallet icon' className='tw-w-8 tw-h-8' />
            <div className='tw-flex tw-flex-col tw-items-start tw-grow'>
              <span className='tw-font-bold tw-text-xl tw-py-1'>${account_load}.00</span>
              <span className='tw-text-[#49C742]'>Withdraw</span>
            </div>
          </div>
        </div>
      )}
      <div className='tw-px-6 tw-flex tw-flex-col tw-items-start tw-w-full'>
        <button className='tw-text-left tw-p-2 hover:tw-bg-white/5 tw-rounded tw-w-full'>Profile</button>
        <button className='tw-text-left tw-p-2 hover:tw-bg-white/5 tw-rounded tw-w-full'>Settings</button>
        <button onClick={handleSignOut} className='tw-text-left tw-p-2 hover:tw-bg-white/5 tw-rounded tw-w-full'>
          Logout
        </button>
      </div>
    </div>
  );
};

const SearchDropDown: React.FC<SearchDropDownProps> = ({ searchedData, onSearchClick }) => {
  return (
    <div
      id='search-box'
      className='tw-bg-shade-100 tw-absolute tw-left-0 tw-right-0 sm:tw-bg-shade-50 tw-max-h-[344px] tw-overflow-y-scroll tw-z-10 tw-rounded-b tw-px-1 tw-border-t-[1px] tw-border-t-[#1b252e]'
    >
      {Array.isArray(searchedData) &&
        searchedData.map((carData) => {
          return (
            <div
              key={carData.auction_id}
              onClick={() => onSearchClick(`${carData.attributes[2].value}`, `${carData.attributes[3].value}`)}
              className='tw-p-2 hover:tw-bg-shade-25 hover:tw-cursor-pointer hover:tw-rounded'
            >
              {carData.attributes[2].value} {carData.attributes[3].value}
            </div>
          );
        })}
    </div>
  );
};

interface Attribute {
  key: string;
  value: string | number;
  _id: string;
}

interface Image {
  placing: number;
  src: string;
}

interface Sort {
  price: number;
  bids: number;
  deadline: string;
}

interface SearchDatas {
  _id: string;
  attributes: Attribute[];
  auction_id: string;
  website: string;
  image: string;
  page_url: string;
  description: string[];
  images_list: Image[];
  listing_details: string[];
  sort: Sort;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface SearchDropDownProps {
  searchedData: SearchDatas[];
  onSearchClick: (carMake: string, carModel: string) => void;
}
