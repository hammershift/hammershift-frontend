"use client";

import React, { useEffect, useState } from "react";
import { TournamentsCard } from "@/app/components/card";
import {
  getAuctionsByTournamentId,
  getSortedTournaments,
  getTournaments,
} from "@/lib/data";
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
  const [sortType, setSortType] = useState<string>("newest");

  useEffect(() => {
    const fetchTournamentsData = async () => {
      try {
        const data = await getSortedTournaments(sortType);
        const tournamentsArray = data.tournaments;
        setTournamentsData(tournamentsArray);
      } catch (error) {
        console.error("Failed to fetch tournament data:", error);
      }
    };
    fetchTournamentsData();
  }, [sortType]);

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortType(event.target.value);
  };

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
        <div className="tw-flex tw-justify-between">
          {" "}
          <span className="tw-bg-[#156CC3] tw-rounded-full tw-px-2.5 tw-py-2 tw-font-bold">
            ACTIVE TOURNAMENTS
          </span>
          <select
            className="tw-inline-flex tw-justify-between tw-items-center tw-gap-x-1.5 tw-rounded-md tw-px-3 tw-py-2.5  tw-text-white-900 tw-shadow-sm tw-bg-[#172431] hover:tw-bg-[#1A2C3D] tw-truncate"
            onChange={handleSortChange}
          >
            <option value="newest">Newly Listed</option>
            <option value="endingSoon">Ending Soon</option>
          </select>
        </div>
      </div>
      <div className="tw-grid tw-grid-cols-2 max-sm:tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-x-4 md:tw-gap-x-6 tw-gap-y-8 md:tw-gap-y-16 tw-mt-12 ">
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
