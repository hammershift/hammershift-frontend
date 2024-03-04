"use client";

import React, { useEffect, useState } from "react";
import {
  getAllTournamentWagers,
  getAuctionsByTournamentId,
  getOneTournamentWager,
  getSortedTournaments,
  getTournamentPointsByTournamentId,
  getTournaments,
} from "@/lib/data";
import { TimerProvider } from "@/app/_context/TimerContext";
import Image from "next/image"; // Assuming you are using Next.js Image component
import { MoonLoader } from "react-spinners";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";

const DynamicTournamentsCards = dynamic(
  () => import("../../components/tournaments_card"),
  {
    ssr: false,
    loading: () => (
      <div className="tw-flex tw-mt-8 tw-justify-evenly tw-bg-gray-600 tw-rounded-lg tw-animate-pulse">
        <div className="tw-flex tw-flex-col tw-justify-center tw-items-center tw-m-2">
          <div className="tw-w-96 tw-mb-2 tw-h-48 tw-bg-gray-700"></div>
          <div className="tw-w-3/5 tw-h-6 tw-mb-2 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
          <div className="tw-w-3/5 tw-mb-2 tw-h-6 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
          <div className="tw-w-3/5 tw-mb-2 tw-h-6 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
          <div className="tw-w-full tw-mb-2 tw-h-10 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
        </div>
      </div>
    ),
  }
);

export interface Tournaments {
  _id: string;
  title: string;
  pot: number;
  endTime: Date;
  tournamentEndTime: Date;
  cars: number;
  buyInFee: number;
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

interface Wager {
  // Define the properties of a wager here
  // For example:
  id: string;
  amount: number;
}

const TournamentsList = () => {
  const [tournamentsData, setTournamentsData] = useState<Tournaments[]>([]);
  const [totalTournaments, setTotalTournaments] = useState(0);
  const [auctionData, setAuctionData] = useState<Record<string, Auctions[]>>(
    {}
  );
  const [sortType, setSortType] = useState<string>("newest");
  const [tournamentLimit, setTournamentLimit] = useState(6);
  const [playerLimit, setPlayerLimit] = useState(3);
  const [loading, setLoading] = useState<boolean>(false);
  const [tournamentPointsData, setTournamentPointsData] = useState<
    TournamentPoints[]
  >([]);

  useEffect(() => {
    const fetchTournamentsData = async () => {
      setLoading(true);
      try {
        const data = await getSortedTournaments(sortType, tournamentLimit);
        const tournamentsArray = data.tournaments;
        if (data) {
          setTournamentsData(tournamentsArray);
          setTotalTournaments(data?.total);

          // Fetch tournament points data for each tournament
          const tournamentPointsPromises = tournamentsArray.map(
            (tournament: { _id: string }) =>
              getTournamentPointsByTournamentId(tournament._id, playerLimit)
          );
          const tournamentPointsArray = await Promise.all(
            tournamentPointsPromises
          );
          setTournamentPointsData(tournamentPointsArray);

          setLoading(false);
          return;
        }
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch tournament data:", error);
      }
    };
    fetchTournamentsData();
  }, [sortType, tournamentLimit, playerLimit]);

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

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortType(event.target.value);
  };

  const handleLoadMore = (event: React.MouseEvent<HTMLButtonElement>) => {
    setTournamentLimit((prev) => prev + 3);
  };

  return (
    <div>
      <div className="tw-mt-5">
        <div className="tw-flex tw-justify-between tw-items-center">
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
      <div className="tw-grid tw-grid-cols-2 max-sm:tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-x-4 md:tw-gap-x-6 tw-gap-y-8 md:tw-gap-y-16 tw-mt-12 tw-pb-20">
        {tournamentsData &&
          tournamentsData.map((tournament, index) => {
            const imagesForTournament =
              auctionData[tournament._id]?.map((auction) => auction.image) ||
              [];
            const tournamentPoints = tournamentPointsData[index];
            return (
              <div key={tournament._id}>
                <TimerProvider deadline={tournament.endTime}>
                  <DynamicTournamentsCards
                    tournament_id={tournament._id}
                    pot={tournament.pot}
                    title={tournament.title}
                    deadline={tournament.endTime}
                    tournament_deadline={tournament.tournamentEndTime}
                    images={imagesForTournament}
                    tournamentPoints={tournamentPoints}
                  />
                </TimerProvider>
              </div>
            );
          })}
      </div>
      <div>
        <div className="tw-text-[18px] tw-opacity-50 tw-text-center tw-mb-4">
          {tournamentLimit < totalTournaments
            ? `Showing ${tournamentLimit} of ${totalTournaments} tournaments`
            : `Showing ${totalTournaments} of ${totalTournaments} tournaments`}
        </div>
        <button
          className={`btn-transparent-white tw-w-full tw-text-[18px] tw-mb-8`}
          onClick={handleLoadMore}
        >
          Load More
        </button>
      </div>
    </div>
  );
};

export default TournamentsList;
