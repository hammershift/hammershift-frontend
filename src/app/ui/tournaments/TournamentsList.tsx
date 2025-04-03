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
            <div className="flex mt-8 justify-evenly bg-gray-600 rounded-lg animate-pulse">
                <div className="flex flex-col justify-center items-center m-2">
                    <div className="w-96 mb-2 h-48 bg-gray-700"></div>
                    <div className="w-3/5 h-6 mb-2 bg-gray-700 rounded-lg animate-pulse"></div>
                    <div className="w-3/5 mb-2 h-6 bg-gray-700 rounded-lg animate-pulse"></div>
                    <div className="w-3/5 mb-2 h-6 bg-gray-700 rounded-lg animate-pulse"></div>
                    <div className="w-full mb-2 h-10 bg-gray-700 rounded-lg animate-pulse"></div>
                </div>
            </div>
        ),
    }
);

export interface Tournaments {
    status: number;
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
                const data = await getSortedTournaments(
                    sortType,
                    tournamentLimit
                );
                const tournamentsArray = data.tournaments;
                if (data) {
                    setTournamentsData(tournamentsArray);
                    setTotalTournaments(data?.total);

                    // Fetch tournament points data for each tournament
                    const tournamentPointsPromises = tournamentsArray.map(
                        (tournament: { _id: string }) =>
                            getTournamentPointsByTournamentId(
                                tournament._id,
                                playerLimit
                            )
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
    console.log("tournaments data: ", tournamentsData);

    useEffect(() => {
        const fetchAuctionData = async () => {
            try {
                const auctionsByTournament: Record<string, Auctions[]> = {};
                for (const tournament of tournamentsData) {
                    const auctionDataForTournament =
                        await getAuctionsByTournamentId(tournament._id);
                    auctionsByTournament[tournament._id] =
                        auctionDataForTournament;
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
            <div className="mt-5">
                <div className="flex justify-between items-center">
                    {" "}
                    <div className="font-bold text-3xl md:text-5xl">
                        Tournaments
                    </div>
                    <select
                        className="inline-flex justify-between items-center gap-x-1.5 rounded-md px-3 py-2.5  text-white-900 shadow-sm bg-[#172431] hover:bg-[#1A2C3D] truncate"
                        onChange={handleSortChange}
                    >
                        <option value="newest">Newly Listed</option>
                        <option value="endingSoon">Ending Soon</option>
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-2 max-sm:grid-cols-1 md:grid-cols-2 gap-x-4 md:gap-x-[64px] gap-y-8 md:gap-y-16 pb-20 mt-12">
                {tournamentsData &&
                    tournamentsData.map((tournament, index) => {
                        const imagesForTournament =
                            auctionData[tournament._id]?.map(
                                (auction) => auction.image
                            ) || [];
                        const tournamentPoints = tournamentPointsData[index];
                        return (
                            <div key={tournament._id}>
                                <TimerProvider deadline={tournament.endTime}>
                                    <DynamicTournamentsCards
                                        tournament_id={tournament._id}
                                        pot={tournament.pot}
                                        title={tournament.title}
                                        deadline={tournament.endTime}
                                        tournament_deadline={
                                            tournament.tournamentEndTime
                                        }
                                        images={imagesForTournament}
                                        tournamentPoints={tournamentPoints}
                                        canceledTournament={
                                            tournament.status === 3
                                        }
                                    />
                                </TimerProvider>
                            </div>
                        );
                    })}
            </div>
            <div>
                <div className="text-[18px] opacity-50 text-center mb-4">
                    {tournamentLimit < totalTournaments
                        ? `Showing ${tournamentLimit} of ${totalTournaments} tournaments`
                        : `Showing ${totalTournaments} of ${totalTournaments} tournaments`}
                </div>
                <button
                    className={`btn-transparent-white w-full text-[18px] mb-8`}
                    onClick={handleLoadMore}
                >
                    Load More
                </button>
            </div>
        </div>
    );
};

export default TournamentsList;
