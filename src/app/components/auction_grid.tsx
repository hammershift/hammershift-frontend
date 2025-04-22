import { Auction } from "@/models/auction.model";
import { formatDistanceToNow, isValid } from "date-fns";
import { Clock, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Card, CardContent } from "./card_component";
import { Button } from "./ui/button";
import { createPageUrl } from "./utils";
import { Badge } from "./badge";
interface IProps {
  auctions: Auction[];
  mode: string;
  user?: any;
}
export const AuctionGrid = ({
  auctions = [],
  mode = "free_play",
  user,
}: IProps) => {
  const [processedCars, setProcessedCars] = useState(new Set());

  const activeAuctions = auctions.filter((auction) => auction.isActive);

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

  const getModeParams = (mode: string) => {
    if (mode === "tournament") {
      return { mode: "tournament" };
    } else if (mode === "price_is_right") {
      return { mode: "price_is_right" };
    }
    return { mode: "free_play" };
  };

  if (!Array.isArray(auctions)) {
    return null;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {activeAuctions.map((auction, index) => (
        <Card
          key={index}
          className="overflow-hidden border-[#1E2A36] bg-[#13202D] transition-colors hover:border-[#F2CA16]"
        >
          <div className="relative">
            {/* <img
              src={
                auction.image_urls?.[0] ||
                "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80"
              }
              alt={auction.title || "Car auction"}
              className="h-48 w-full object-cover"
            /> */}
            <Image
              src={
                auction.image ||
                "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80"
              }
              alt={"Car auction"}
              width={483.333}
              height={192}
              className="h-48 w-full object-cover sm:h-56 md:h-64"
            />
            <div className="absolute right-2 top-2">
              <Badge className="bg-[#F2CA16] text-[#0C1924]">
                {auction.attributes[2].value || "Car"}
              </Badge>
            </div>
          </div>
          <CardContent className="p-4">
            <h3 className="mb-2 font-bold">{auction.title || "Unknown Car"}</h3>
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-400">Current Bid</div>
                <div className="font-bold text-[#F2CA16]">
                  ${(auction.sort!.price || 0).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Time Left</div>
                <div className="flex items-center">
                  <Clock className="mr-1 h-4 w-4 text-[#F2CA16]" />
                  {formatTimeLeft(auction.sort!.deadline.toString())}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-400">
                <Users className="mr-1 h-4 w-4" />
                {auction.watchers || 0} watchers
              </div>

              <Link
                href={`${createPageUrl("auction_details")}?id=${auction.auction_id}&${new URLSearchParams(getModeParams(mode))}`}
              >
                <Button
                  className={
                    mode === "price_is_right"
                      ? "bg-green-600 hover:bg-green-700"
                      : mode === "tournament"
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "bg-[#F2CA16] text-[#0C1924] hover:bg-[#F2CA16]/90"
                  }
                >
                  {mode === "price_is_right" ? "PLACE WAGER" : "PREDICT NOW"}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
