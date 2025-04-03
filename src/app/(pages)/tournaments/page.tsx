import React from "react";
import TournamentsList from "@/app/ui/tournaments/TournamentsList";
import TournamentHero from "@/app/components/tournament_hero";

const TournamentsPage = () => {
    return (
        <div className=" relative flex flex-col items-center">
            <TournamentHero />
            <TournamentsList />
        </div>
    );
};

export default TournamentsPage;
