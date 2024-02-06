import Links from "@/app/components/links";
import TournamentsList from "@/app/ui/tournaments/TournamentsList";
import React from "react";

const TournamentsPage = () => {
  return (
    <div className=" tw-relative tw-flex tw-flex-col tw-items-center">
      <TournamentsList />
    </div>
  );
};

export default TournamentsPage;
