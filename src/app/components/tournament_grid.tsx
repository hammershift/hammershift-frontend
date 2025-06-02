"use client";
import { Tournament } from "@/models/tournament.model";
import { createPageUrl } from "./utils";
import { formatDate, formatDistanceToNow, isValid } from "date-fns";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/badge";
import { Trophy, Users, Clock, ArrowRight, DollarSign } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
interface IProps {
  tournaments: Tournament[];
}

const TournamentGrid = ({ tournaments }: IProps) => {
  if (!Array.isArray(tournaments) || tournaments.length === 0) return null;

  const formatTimeLeft = (dateString: string) => {
    if (!dateString) return "No end date";

    try {
      const endDate = new Date(dateString);

      if (!isValid(endDate)) {
        return "Invalid date";
      }

      const now = new Date();
      if (endDate < now) {
        return "Ended";
      }

      return formatDistanceToNow(endDate, { addSuffix: true });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Date error";
    }
  };
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {tournaments.map((tournament, index) => (
        <Card
          key={tournament.tournament_id}
          className="overflow-hidden border-[#1E2A36] bg-[#13202D] transition-colors hover:border-[#F2CA16]"
        >
          <div className="relative aspect-video">
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 to-transparent" />
            <Image
              src={tournament.banner}
              alt={tournament.name}
              layout="fill"
              objectFit="cover"
              className="h-full w-full"
            />
            <div className="absolute bottom-4 left-4 right-4 z-20">
              <h3 className="mb-2 text-xl font-bold">{tournament.name}</h3>
              <p className="line-clamp-2 text-sm text-gray-300">
                {tournament.description}
              </p>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-[#F2CA16]" />
                <div>
                  <div className="text-gray-400> text-sm">Entry Fee</div>
                  <div className="font-bold">
                    {tournament.type === "free_play"
                      ? "free"
                      : `$${tournament.buyInFee}`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-[#F2CA16]" />
                <div>
                  <div className="text-sm text-gray-400">Prize Pool</div>
                  <div className="font-bold">
                    {tournament.type === "free_play"
                      ? "Practice"
                      : `$${tournament.prizePool || 0}`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#F2CA16]" />
                <div>
                  <div className="text-sm text-gray-400">Ends</div>
                  <div>{formatTimeLeft(tournament.endTime?.toString())}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#F2CA16]" />
                <div>
                  <div className="text-sm text-gray-400">Players</div>
                  <div>
                    {tournament.users.length || 0}/{tournament.maxUsers || 0}
                  </div>
                </div>
              </div>
            </div>
            <Link
              href={`${createPageUrl("tournaments")}/${tournament.tournament_id}`}
            >
              <Button className="w-full bg-[#F2CA16] text-[#0C1924] hover:bg-[#F2CA16]/90">
                {tournament.type === "free_play"
                  ? "Play Free"
                  : "Enter Tournament"}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TournamentGrid;
