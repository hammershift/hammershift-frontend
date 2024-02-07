"use client";

import React, { useEffect, useState } from "react";
import { TournamentsCard } from "@/app/components/card";
import { getTournaments } from "@/lib/data";

interface Tournaments {
  _id: string;
  // Add other properties of the tournament here
}

const TournamentsList = () => {
  const [tournamentsData, setTournamentsData] = useState<Tournaments[]>([]);

  useEffect(() => {
    const fetchTournamentsData = async () => {
      try {
        const res = await getTournaments();
        const tournamentsArray = res.tournaments; // Extract the tournaments array from the response
        setTournamentsData(tournamentsArray); // Set the extracted array to your state
      } catch (error) {
        console.error("Failed to fetch tournament data:", error);
      }
    };
    fetchTournamentsData();
  }, []);

  console.log(typeof tournamentsData, tournamentsData);

  return (
    <div>
      <div className="tw-mt-5">
        <span className="tw-bg-[#156CC3] tw-rounded-full tw-px-2.5 tw-py-2 tw-font-bold">
          ACTIVE TOURNAMENTS
        </span>
      </div>
      <div className="tw-flex tw-gap-x-4 md:tw-gap-x-6 tw-gap-y-8 md:tw-gap-y-16 tw-mt-12 ">
        {tournamentsData &&
          tournamentsData.map((tournament) => (
            <div key={tournament._id}>
              <TournamentsCard tournament_id={tournament._id} />
            </div>
          ))}
      </div>
    </div>
  );
};

export default TournamentsList;
