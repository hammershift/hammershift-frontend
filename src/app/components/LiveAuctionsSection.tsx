"use client";

import { Badge } from "@/app/components/badge";
import { Card, CardContent } from "@/app/components/card_component";
import { Button } from "@/app/components/ui/button";
import { Clock, Users as UsersIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import CountdownTimer from "./CountdownTimer";

// Format currency — mirrors what page.tsx uses
const USDollar = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

interface Props {
  auctions: any[];
}

export default function LiveAuctionsSection({ auctions }: Props) {
  const [polygonMarketMap, setPolygonMarketMap] = useState<Map<string, string>>(
    new Map()
  );

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const res = await fetch("/api/polygon-markets?status=ACTIVE");
        if (!res.ok) return;
        const markets: any[] = await res.json();
        const map = new Map<string, string>();
        for (const market of markets) {
          if (market.auctionId && market._id) {
            map.set(market.auctionId, market._id.toString());
          }
        }
        setPolygonMarketMap(map);
      } catch {
        // best-effort — silent fail
      }
    };
    fetchMarkets();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {auctions.slice(0, 12).map((auction: any) => {
        const polygonMarketId =
          polygonMarketMap.get(auction._id?.toString()) ||
          polygonMarketMap.get(auction.auction_id);

        return (
          <div key={auction._id} className="relative flex flex-col">
            <Link href={`/auctions/car_view_page/${auction._id}?mode=free_play`}>
              <Card className="h-full border-[#1E2A36] bg-[#13202D] transition-all hover:border-[#E94560] hover:shadow-lg hover:shadow-[#E94560]/20">
                <div className="relative h-[200px]">
                  <Image
                    src={auction.image || "/images/default-car.jpg"}
                    alt={auction.title}
                    fill
                    className="rounded-t-xl object-cover"
                  />
                  {auction.source_badge && (
                    <div className="absolute right-2 top-2">
                      <Badge className="bg-[#FFB547] text-[#0A0A1A]">
                        {auction.source_badge.toUpperCase()}
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="mb-3 line-clamp-2 font-bold">
                    {auction.title}
                  </h3>
                  <div className="mb-4 grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-xs text-gray-400">Current Bid</div>
                      <div className="font-mono font-bold text-[#00D4AA]">
                        {USDollar.format(auction.sort?.price || 0)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Time Left</div>
                      <div className="flex items-center text-sm">
                        <Clock className="mr-1 h-3 w-3 text-[#FFB547]" />
                        {auction.sort?.deadline ? (
                          <CountdownTimer
                            endTime={new Date(auction.sort.deadline)}
                            size="sm"
                          />
                        ) : (
                          <span className="font-mono text-xs text-gray-400">
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-400">
                      <UsersIcon className="mr-1 h-3 w-3" />
                      {auction.prediction_count || 0} predictions
                    </div>
                    <Button
                      size="sm"
                      className="bg-[#E94560] text-white hover:bg-[#E94560]/90"
                    >
                      Predict
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {polygonMarketId && (
              <a
                href={`/trading/${polygonMarketId}`}
                className="mt-2 flex items-center justify-center gap-1.5 w-full bg-[#00D4AA]/10 hover:bg-[#00D4AA]/20 border border-[#00D4AA]/40 text-[#00D4AA] text-xs font-semibold py-2 px-3 rounded-lg transition-colors"
              >
                ⚡ Trade Market
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}
