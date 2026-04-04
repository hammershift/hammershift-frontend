import { USDollar } from "@/helpers/utils";
import { getCars } from "@/lib/data";
import { Auction } from "@/models/auction.model";
import { formatDistanceToNow, isValid } from "date-fns";
import { Clock, RefreshCcw, Users, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Badge } from "./badge";
import { Card, CardContent } from "./card_component";
import { Button } from "./ui/button";
import { createPageUrl } from "./utils";
export const LiveAuctions = () => {
  // const [auctions, setAuctions] = useState([
  //     {
  //         id: 1,
  //     },
  //     {
  //         id: 2,
  //     },
  //     {
  //         id: 3,
  //     },
  //     {
  //         id: 4,
  //     },
  //     {
  //         id: 5,
  //     },
  //     {
  //         id: 6,
  //     },
  //     {
  //         id: 7,
  //     },
  //     {
  //         id: 8,
  //     },
  //     {
  //         id: 9,
  //     },
  //     {
  //         id: 10,
  //     },
  // ]);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const scrollContainerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const defaultImage =
    "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80";
  const formatTimeLeft = (dateString: string) => {
    if (!dateString || dateString == "") return "No end date";

    try {
      // Scraper offsets sort.deadline by -1 day; add 24h for display
      const endDate = new Date(new Date(dateString).getTime() + 24 * 60 * 60 * 1000);

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

  const getModeParams = (mode: string) => {
    if (mode === "tournament") {
      return { mode: "tournament" };
    } else if (mode === "price_is_right") {
      return { mode: "price_is_right" };
    }
    return { mode: "free_play" };
  };

  const fetchAuctions = async () => {
    setLoading(true);
    try {
      console.log("Fetching auctions...");
      const response = await getCars({ limit: 20 });
      setAuctions(response.cars);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  return (
    <section className="py-0">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">LIVE AUCTIONS</h2>
        <Button
          variant="outline"
          className="border-[#E94560] text-[#E94560]"
          onClick={() => fetchAuctions()}
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
            {auctions.length > 0 &&
              auctions.map((auction, index) => (
                <div key={index} className="w-80 flex-shrink-0 lg:w-96">
                  <Card className="flex h-full flex-col border-white/[0.08] bg-[#16181f] transition-colors hover:border-[#E94560]">
                    <div className="relative h-[240px]">
                      <Image
                        src={auction.image || defaultImage}
                        alt={"default"}
                        fill
                        className="rounded-t-xl object-cover"
                      />
                      <div className="absolute right-2 top-2">
                        <Badge
                          variant="default"
                          className="bg-[#01696F] text-white"
                        >
                          {auction.attributes[2].value}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="flex flex-grow flex-col justify-between p-4">
                      {/* Title stays at top */}
                      <h3 className="mb-2 font-bold">{auction.title}</h3>

                      {/* Bottom-aligned section */}
                      <div className="mt-auto space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className="text-sm text-gray-400">
                              Current Bid
                            </div>
                            <div className="font-bold text-[#E94560]">
                              {USDollar.format(auction.attributes[0].value)}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">
                              Time Left
                            </div>
                            <div className="flex items-center">
                              <Clock className="mr-1 h-4 w-4 text-[#E94560]" />
                              {formatTimeLeft(
                                auction.sort?.deadline.toString() ?? ""
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-400">
                            <Users className="mr-1 h-4 w-4" /> 0 watchers
                          </div>
                          <Link
                            href={`${createPageUrl("auction_details")}?id=${auction.auction_id}&${new URLSearchParams(getModeParams("free_play"))}`}
                          >
                            <Button asChild className="bg-[#01696F] text-white hover:bg-[#0C4E54]">
                              PREDICT NOW
                            </Button>
                          </Link>
                        </div>
                      </div>
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
              <Loader2 className="h-16 w-16 animate-spin" color="#E94560" />
            </div>
          )
        }
      </div>
    </section>
  );
};
