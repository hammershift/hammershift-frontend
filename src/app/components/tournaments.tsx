"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

import TournamentsIcon from "../../../public/images/award-trophy-star-1.svg";
import ArrowRight from "../../../public/images/arrow-right.svg";
import ArrowLeft from "../../../public/images/arrow-left.svg";
import TournamentsCard from "./tournaments_card";
import {
  getAuctionsByTournamentId,
  getLimitedTournaments,
  getTournamentPointsByTournamentId,
  getTournaments,
} from "@/lib/data";
import { TimerProvider } from "../_context/TimerContext";

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import SwiperCore from 'swiper';

SwiperCore.use([Navigation, Pagination, Scrollbar, A11y]);

interface Tournaments {
  buyInFee: number;
  _id: string;
  title: string;
  pot: number;
  endTime: Date;
  // Add other properties of the tournament here
}

interface Auctions {
  _id: string;
  image: string;
}

interface AuctionScore {
  auctionID: string;
  score: number;
}
interface TournamentPoints {
  player: string;
  points: number;
  auctionScores: AuctionScore[];
}

const Tournaments = () => {
  const [tournamentsData, setTournamentsData] = useState<Tournaments[]>([]);
  const [auctionData, setAuctionData] = useState<Record<string, Auctions[]>>(
    {}
  );
  const [playerLimit, setPlayerLimit] = useState(3);
  const [tournamentPointsData, setTournamentPointsData] = useState<
    TournamentPoints[]
  >([]);

  const [screenWidth, setScreenWidth] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const swiperRef = useRef<SwiperCore>();

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
      setIsMobile(window.innerWidth < 900);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const NUM_TO_DISPLAY = screenWidth < 1450 ? 2 : 3;

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


  useEffect(() => {
    const fetchTournamentsData = async () => {
      try {
        const res = await getLimitedTournaments(5);
        const tournamentsArray = res.tournaments;
        setTournamentsData(tournamentsArray);

        const tournamentPointsPromises = tournamentsArray.map(
          (tournament: { _id: string }) =>
            getTournamentPointsByTournamentId(tournament._id, playerLimit)
        );
        const tournamentPointsArray = await Promise.all(
          tournamentPointsPromises
        );
        setTournamentPointsData(tournamentPointsArray);
        return;
      } catch (error) {
        console.error("Failed to fetch tournament data:", error);
      }
    };
    fetchTournamentsData();
  }, [playerLimit]);
  useEffect(() => {
    const fetchAuctionData = async () => {
      try {
        const auctionsByTournament: Record<string, Auctions[]> = {};
        for (const tournament of tournamentsData) {
          const auctionDataForTournament = await getAuctionsByTournamentId(
            tournament._id
          );
          auctionsByTournament[tournament._id] = auctionDataForTournament;
        }
        setAuctionData(auctionsByTournament);
      } catch (error) {
        console.error("Failed to fetch auction data:", error);
      }
    };
    fetchAuctionData();
  }, [tournamentsData]);

  return (
    <div className="tw-py-8 sm:tw-py-16">
      <header className="tw-flex tw-justify-between">
        <div className="tw-flex tw-items-center">
          <Image
            src={TournamentsIcon}
            width={40}
            height={40}
            alt="dollar"
            className="tw-w-10 tw-h-10"
          />
          <div className="tw-font-bold tw-text-2xl sm:tw-text-3xl tw-ml-4">
            Tournaments
          </div>
        </div>
        <div className={` ${isMobile ? 'tw-hidden' : 'tw-flex'} `}>
          <Image
            src={ArrowLeft}
            width={32}
            height={32}
            alt="arrow left"
            className="tw-w-8 tw-h-8"
            onClick={handleLeftArrow}
          />
          <Image
            src={ArrowRight}
            width={32}
            height={32}
            alt="arrow right"
            className="tw-w-8 tw-h-8 tw-ml-4"
            onClick={handleRightArrow}
          />
        </div>
      </header>
      <section className="tw-my-6">
        {isMobile ? (
          <div className="tw-flex tw-flex-col tw-justify-center tw-items-center tw-w-auto tw-gap-4 tw-mt-8 ">
            {tournamentsData &&
              tournamentsData.map((tournament, index) => {
                const imagesForTournament =
                  auctionData[tournament._id]?.map((auction) => auction.image) ||
                  [];
                const tournamentPoints = tournamentPointsData[index];
                return (
                  <div key={tournament._id}>
                    <TimerProvider deadline={tournament.endTime}>
                      <TournamentsCard
                        tournament_id={tournament._id}
                        pot={tournament.pot}
                        title={tournament.title}
                        deadline={tournament.endTime}
                        images={imagesForTournament}
                        tournamentPoints={tournamentPoints}
                      />
                    </TimerProvider>
                  </div>
                );
              })}
          </div>
        ) : (
          <Swiper
            modules={[Navigation, Pagination, Scrollbar, A11y]}
            spaceBetween={25}
            slidesPerView={NUM_TO_DISPLAY}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            style={{
              '--swiper-navigation-color': '#fff',
              '--swiper-pagination-color': '#fff',
            } as React.CSSProperties}
          >
            {tournamentsData &&
              tournamentsData.map((tournament, index) => {
                const imagesForTournament =
                  auctionData[tournament._id]?.map((auction) => auction.image) ||
                  [];
                const tournamentPoints = tournamentPointsData[index];
                return (
                  <SwiperSlide key={tournament._id}>
                    <TimerProvider deadline={tournament.endTime}>
                      <TournamentsCard
                        tournament_id={tournament._id}
                        pot={tournament.pot}
                        title={tournament.title}
                        deadline={tournament.endTime}
                        images={imagesForTournament}
                        tournamentPoints={tournamentPoints}
                      />
                    </TimerProvider>
                  </SwiperSlide>
                );
              })}
          </Swiper>

        )}
      </section>
    </div>
  );
};

export default Tournaments;
