import { TournamentsCard } from "@/app/components/card";
import React from "react";

const TournamentsList = () => {
  return (
    <div className="tw-flex tw-flex-col tw-gap-x-4 md:tw-gap-x-6 tw-gap-y-8 md:tw-gap-y-16 tw-mt-12 ">
      {/* to be replaced with map */}
      <TournamentsCard />
      <TournamentsCard />
      <TournamentsCard />
    </div>
  );
};

export default TournamentsList;
