'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

import YellowSportsCarFull from '../../../public/images/yellow-sportscar-full.svg';
import ArrowRight from '../../../public/images/arrow-right.svg';
import ArrowLeft from '../../../public/images/arrow-left.svg';
import DiagonalLinesCarousel from '../../../public/images/diagonal-lines-carousel.svg';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const Carousel: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignUpWagerClick = () => {
    if (session) {
      router.push('/authenticated');
    } else {
      router.push('/create_account');
    }
  };

  // const rightArrowHandler = () => {
  //   if (sliderTransform === -80) {
  //     setSliderTransform(0);
  //   } else {
  //     setSliderTransform((prev) => prev - 20);
  //   }
  // };
  // const leftArrowHandler = () => {
  //   if (sliderTransform === 0) {
  //     setSliderTransform(-80);
  //   } else {
  //     setSliderTransform((prev) => prev + 20);
  //   }
  // };
  // const sliderButtonsData = [
  //   { id: 'slide1', transform: 0 },
  //   { id: 'slide2', transform: -20 },
  //   { id: 'slide3', transform: -40 },
  //   { id: 'slide4', transform: -60 },
  //   { id: 'slide5', transform: -80 },
  // ];

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
            navigation
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

        </div>
        {/* <div className='controller-container'>
          <button onClick={leftArrowHandler} className='scroll-button'>
            <Image src={ArrowLeft} alt='arrow left' width={40} height={40} className='tw-absolute tw-top-[115px] arrow-slider tw-rounded-full' />
          </button>
          <button onClick={rightArrowHandler} className='scroll-button'>
            <Image src={ArrowRight} alt='arrow left' width={40} height={40} className='tw-absolute tw-top-[115px] tw-right-0 arrow-slider tw-rounded-full' />
          </button>
          <ul className='tw-w-[72px] tw-flex tw-justify-between tw-items-end tw-absolute tw-bottom-[6px] sm:tw-bottom-[16px] tw-left-1/2 tw-translate-x-[-50%]'>
            {sliderButtonsData.map((slide) => {
              return (
                <li key={slide.id}>
                  <button onClick={() => setSliderTransform(slide.transform)}>
                    <div
                      className='tw-w-[7px] tw-h-[7px] tw-bg-white tw-rounded-full'
                      style={{
                        opacity: `${sliderTransform === slide.transform ? '100%' : '20%'}`,
                      }}
                    ></div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div> */}
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
