"use client";

import React, { useEffect, useState } from "react";
import { TournamentsCard } from "@/app/components/card";
import { getAuctionsByTournamentId, getTournaments } from "@/lib/data";
import { TimerProvider } from "@/app/_context/TimerContext";
import Image from "next/image"; // Assuming you are using Next.js Image component

interface Tournaments {
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

const TournamentsList = () => {
  const [tournamentsData, setTournamentsData] = useState<Tournaments[]>([]);
  const [auctionData, setAuctionData] = useState<Record<string, Auctions[]>>(
    {}
  );

  useEffect(() => {
    const fetchTournamentsData = async () => {
      try {
        const data = await getTournaments();
        const tournamentsArray = data.tournaments;
        setTournamentsData(tournamentsArray);
      } catch (error) {
        console.error("Failed to fetch tournament data:", error);
      }
    };
    fetchTournamentsData();
  }, []);

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
    <div>
      <div className="tw-mt-5">
        <span className="tw-bg-[#156CC3] tw-rounded-full tw-px-2.5 tw-py-2 tw-font-bold">
          ACTIVE TOURNAMENTS
        </span>
      </div>
      <div className="tw-grid tw-grid-cols-2 md:tw-grid-cols-3 tw-gap-x-4 md:tw-gap-x-6 tw-gap-y-8 md:tw-gap-y-16 tw-mt-12 ">
        {tournamentsData &&
          tournamentsData.map((tournament) => {
            const imagesForTournament =
              auctionData[tournament._id]?.map((auction) => auction.image) ||
              [];
            return (
              <div key={tournament._id}>
                <TimerProvider deadline={tournament.endTime}>
                  <TournamentsCard
                    tournament_id={tournament._id}
                    pot={tournament.pot}
                    title={tournament.title}
                    deadline={tournament.endTime}
                    images={imagesForTournament}
                  />
                </TimerProvider>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default TournamentsList;
