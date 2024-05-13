import React from "react";
import TournamentsList from "@/app/ui/tournaments/TournamentsList";
import TournamentHero from "@/app/components/tournament_hero";

const TournamentsPage = () => {
    return (
        <div className=" tw-relative tw-flex tw-flex-col tw-items-center">
            <TournamentHero />
            <TournamentsList />
        </div>
    );
};

export default TournamentsPage;
