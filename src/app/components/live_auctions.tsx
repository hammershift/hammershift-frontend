import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { Card, CardContent } from "./card_component";
import { Users, RefreshCcw, Clock } from "lucide-react";
import { formatDistanceToNow, isValid } from "date-fns";
import { USDollar } from "@/helpers/utils";
import { Badge } from "./badge";
import { Auction } from "@/models/auction.model";
import { getCars } from "@/lib/data";
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

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        console.log("Fetching auctions...");
        const response = await getCars({ limit: 10 });
        setAuctions(response.cars);
      } catch (e) {
        console.log(e);
      }
    };

    fetchAuctions();
  }, []);

  return (
    <section className="py-0">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">LIVE AUCTIONS</h2>
        <Button
          variant="outline"
          className="border-[#F2CA16] text-[#F2CA16]"
          onClick={() => setCurrentIndex(0)}
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
      <div className="relative">
        <div
          className="scrollbar-hide flex space-x-4 overflow-x-auto py-2"
          ref={scrollContainerRef}
        >
          {auctions.length > 0 &&
            auctions.map((auction, index) => (
              <div key={index} className="w-80 flex-shrink-0">
                <Card className="h-full border-[#1E2A36] bg-[#13202D]">
                  <div className="relative">
                    <Image
                      src={auction.image || defaultImage}
                      alt={"default"}
                      width={500}
                      height={192}
                      className="h-48 w-full object-cover"
                    />
                    <div className="absolute right-2 top-2">
                      <Badge
                        variant="default"
                        className="bg-[#F2CA16] text-[#0C1924]"
                      >
                        {auction.attributes[2].value}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="mb-2 font-bold">Title</h3>
                    <div className="mb-4 grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-sm text-gray-400">Current Bid</div>
                        <div className="font-bold text-[#F2CA16]">
                          {USDollar.format(auction.attributes[0].value)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Time Left</div>
                        <div className="flex items-center">
                          <Clock className="mr-1 h-4 w-4 text-[#F2CA16]" />
                          {formatTimeLeft(auction.sort?.deadline.toString() ?? "")}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-400">
                        <Users className="mr-1 h-4 w-4" />0 watchers
                      </div>
                      <Link href="/">
                        <Button className="bg-[#F2CA16] text-[#0C1924] hover:bg-[#F2CA16]/90">
                          PREDICT NOW
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
};
