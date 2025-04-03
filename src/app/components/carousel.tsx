'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import SwiperCore from 'swiper';

import YellowSportsCarFull from '../../../public/images/yellow-sportscar-full.svg';
// import ArrowRight from '../../../public/images/arrow-right.svg';
// import ArrowLeft from '../../../public/images/arrow-left.svg';
import DiagonalLinesCarousel from '../../../public/images/diagonal-lines-carousel.svg';
// import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

SwiperCore.use([Navigation, Pagination, Scrollbar, A11y]);

const Carousel: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const swiperRef = useRef<SwiperCore>();

  const handleSignUpWagerClick = () => {
    if (session) {
      router.push('/authenticated');
    } else {
      router.push('/create_account');
    }
  };

  const handleLeftArrow = () => {
    if (swiperRef.current) {
      swiperRef.current.slidePrev();
    }
  };

  const handleRightArrow = () => {
    if (swiperRef.current) {
      swiperRef.current.slideNext();
    }
  };

  return (
    <div className='relative pt-8 h-[344px] overflow-hidden'>
      <div className='carousel-container relative w-full h-[280px] overflow-hidden'>
        <div
          className='card-wrapper h-[280px]'

        >
          <Swiper
            modules={[Navigation, Pagination, Scrollbar, A11y]}
            spaceBetween={50}
            slidesPerView={1}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            pagination={{ clickable: true }}
            style={{
              '--swiper-navigation-color': '#fff',
              '--swiper-pagination-color': '#fff',
              '--swiper-pagination-bullet-inactive-color': '#fff',
              '--swiper-pagination-bullet-inactive-opacity': '0.2',
            } as React.CSSProperties}

          >
            <SwiperSlide>
              <SlideOne onClick={handleSignUpWagerClick} />
            </SwiperSlide>
            <SwiperSlide  >
              <div className='carousel-slide'>
                <img src='/images/Banner_Ad.jpg' alt='car' />
              </div>
            </SwiperSlide>
            <SwiperSlide >
              <div className='carousel-slide'>
                <img src='/images/Banner_Ad2.jpg' alt='car' />
              </div>
            </SwiperSlide>
            <SwiperSlide >
              <div className='carousel-slide'>
                <img src='/images/Banner_Ad3.jpg' alt='car' />
              </div>
            </SwiperSlide>
            <SwiperSlide >
              <div className='carousel-slide'>
                Section 5
              </div>
            </SwiperSlide>
          </Swiper>
          <div onClick={handleLeftArrow} className='swiper-button-prev' style={{ color: 'white' }}>
          </div>
          <div onClick={handleRightArrow} className='swiper-button-next' style={{ color: 'white' }}>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Carousel;

type SlideOneProps = {
  onClick: () => void;
};

const SlideOne: React.FC<SlideOneProps> = ({ onClick }) => {
  return (
    <div className='relative bg-[#1A2C3D] flex justify-between h-[280px] w-full sm:items-center overflow-hidden'>
      <div className='w-full mt-12 lg:mt-0 py-4 lg:py-8 px-6 sm:px-8 z-[1]'>
        <div className='text-xs text-[#F2CA16] pb-2'>NEW PLAYERS</div>
        <div className='font-euro text-[32px] w-[280px] md:w-4/6 md:text-[40px] leading-none'>
          500 WELCOME <br />
          CREDITS
        </div>
        <button onClick={onClick} className='btn-yellow mt-4 sm:mt-6 hover:scale-110 transform transition-all duration-100'>
          SIGN UP & WAGER
        </button>
      </div>
      <Image
        src={YellowSportsCarFull}
        width={569}
        height={213}
        alt='dollar'
        className='w-auto h-[93px] sm:h-[150px] lg:h-[213px] top-6 sm:top-10 sm:right-[-40px] absolute sm:block right-[-32px] sm:right-0 z-[1]'
      />
      <Image
        src={DiagonalLinesCarousel}
        width={733}
        height={664}
        alt='dollar'
        className='w-auto h-[300px] absolute top-0 right-0 sm:right-4 md:right-8 lg:right-36'
      />
    </div>
  );
};
