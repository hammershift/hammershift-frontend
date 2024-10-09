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
    <div className='tw-relative tw-pt-8 tw-h-[344px] tw-overflow-hidden'>
      <div className='carousel-container tw-relative tw-w-full tw-h-[280px] tw-overflow-hidden'>
        <div
          className='card-wrapper tw-h-[280px]'

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
    <div className='tw-relative tw-bg-[#1A2C3D] tw-flex tw-justify-between tw-h-[280px] tw-w-full sm:tw-items-center tw-overflow-hidden'>
      <div className='tw-w-full tw-mt-12 lg:tw-mt-0 tw-py-4 lg:tw-py-8 tw-px-6 sm:tw-px-8 tw-z-[1]'>
        <div className='tw-text-xs tw-text-[#F2CA16] tw-pb-2'>NEW PLAYERS</div>
        <div className='tw-font-euro tw-text-[32px] tw-w-[280px] md:tw-w-4/6 md:tw-text-[40px] tw-leading-none'>
          500 WELCOME <br />
          CREDITS
        </div>
        <button onClick={onClick} className='btn-yellow tw-mt-4 sm:tw-mt-6 hover:tw-scale-110 tw-transform tw-transition-all tw-duration-100'>
          SIGN UP & WAGER
        </button>
      </div>
      <Image
        src={YellowSportsCarFull}
        width={569}
        height={213}
        alt='dollar'
        className='tw-w-auto tw-h-[93px] sm:tw-h-[150px] lg:tw-h-[213px] tw-top-6 sm:tw-top-10 sm:tw-right-[-40px] tw-absolute sm:tw-block tw-right-[-32px] sm:tw-right-0 tw-z-[1]'
      />
      <Image
        src={DiagonalLinesCarousel}
        width={733}
        height={664}
        alt='dollar'
        className='tw-w-auto tw-h-[300px] tw-absolute tw-top-0 tw-right-0 sm:tw-right-4 md:tw-right-8 lg:tw-right-36'
      />
    </div>
  );
};
