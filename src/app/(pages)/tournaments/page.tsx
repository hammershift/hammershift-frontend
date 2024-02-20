import React from "react";
import TournamentsList from "@/app/ui/tournaments/TournamentsList";
import { MoonLoader } from "react-spinners";

const TournamentsPage = () => {
  return (
    <div className=" tw-relative tw-flex tw-flex-col tw-items-center">
      <TournamentsList />
    </div>
  );
};

export default TournamentsPage;
