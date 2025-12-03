import { USDollar } from "@/helpers/utils";
import { getCars } from "@/lib/data";
import { Auction } from "@/models/auction.model";
import { formatDistanceToNow, isValid } from "date-fns";
import {
  Clock,
  RefreshCcw,
  Users,
  DollarSign,
  Trophy,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Badge } from "./badge";
import { Card, CardContent } from "./card_component";
import { Button } from "./ui/button";
import { createPageUrl } from "./utils";
import { getTournaments } from "@/lib/data";
import { Tournament } from "@/models/tournament.model";
export const LiveTournaments = () => {
  const [liveTournaments, setLiveTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef(null);
  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const data = await getTournaments({
        offset: 0,
        limit: 20,
        type: "free",
      });
      setLiveTournaments(data?.tournaments || []);
    } catch (e) {
      console.log(e);
      setLiveTournaments([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchTournaments();
  }, []);

  const formatTimeLeft = (dateString: string) => {
    if (!dateString || dateString == "") return "No end date";

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
    <section className="py-0">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">LIVE TOURNAMENTS</h2>
        <Button
          variant="outline"
          className="border-[#F2CA16] text-[#F2CA16]"
          onClick={() => fetchTournaments()}
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
      <div className="relative">
        {!loading && (
          <div
            className="scrollbar-hide flex space-x-4 overflow-x-auto py-2"
            ref={scrollContainerRef}
          >
            {!loading &&
              liveTournaments.length > 0 &&
              liveTournaments.map((tournament, index) => (
                <div key={index} className="w-80 flex-shrink-0 lg:w-96">
                  <Card className="overflow-hidden border-[#1E2A36] bg-[#13202D] transition-colors hover:border-[#F2CA16]">
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
                        <h3 className="mb-2 text-xl font-bold">
                          {tournament.name}
                        </h3>
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
                            <div className="text-gray-400> text-sm">
                              Entry Fee
                            </div>
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
                            <div className="text-sm text-gray-400">
                              Prize Pool
                            </div>
                            <div className="font-bold">
                              {tournament.type === "free_play"
                                ? `${tournament.auction_ids.length * 10} points`
                                : `$${tournament.prizePool || 0}`}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-[#F2CA16]" />
                          <div>
                            <div className="text-sm text-gray-400">Ends</div>
                            <div>
                              {formatTimeLeft(tournament.endTime.toString())}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-[#F2CA16]" />
                          <div>
                            <div className="text-sm text-gray-400">Players</div>
                            <div>
                              {tournament.users.length || 0}/
                              {tournament.maxUsers || 0}
                            </div>
                          </div>
                        </div>
                      </div>
                      <Link
                        href={`${createPageUrl("tournaments")}/${tournament._id}`}
                      >
                        <Button className="w-full bg-[#F2CA16] text-[#0C1924] hover:bg-[#F2CA16]/90">
                          {formatTimeLeft(tournament.endTime.toString()) ===
                          "Ended"
                            ? "View Details"
                            : tournament.type === "free_play"
                              ? "Play for Free"
                              : "Enter Tournament"}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              ))}
          </div>
        )}
        {
          // Loading spinner
          loading && (
            <div className="flex min-h-[30vh] items-center justify-center">
              <Loader2 className="h-16 w-16 animate-spin" color="#F2CA16" />
            </div>
          )
        }
      </div>
    </section>
  );
};

export default LiveTournaments;
