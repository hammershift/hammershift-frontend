"use client";

import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    const fetchTournamentsData = async () => {
      try {
        const res = await getLimitedTournaments(3);
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
        <div className="tw-flex">
          <Image
            src={ArrowLeft}
            width={32}
            height={32}
            alt="arrow left"
            className="tw-w-8 tw-h-8"
          />
          <Image
            src={ArrowRight}
            width={32}
            height={32}
            alt="arrow right"
            className="tw-w-8 tw-h-8 tw-ml-4"
          />
        </div>
      </header>
      <section className="tw-flex tw-flex-col sm:tw-flex-row sm:tw-w-full tw-overflow-x-auto tw-gap-4 sm:tw-gap-8 tw-mt-8">
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
      </section>
    </div>
  );
};

export default Tournaments;
