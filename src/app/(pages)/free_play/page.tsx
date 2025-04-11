"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { createPageUrl } from "@/app/components/utils";
import { Button } from "@/app/components/ui/button";
import { Trophy } from "lucide-react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/app/components/ui/tabs";
import { Card } from "@/app/components/card_component";
import { getCars } from "@/lib/data";
import { AIStatistics } from "@/app/components/ai_statistics";
import { AuctionFilters } from "@/app/components/auction_filters";
import { AuctionGrid } from "@/app/components/auction_grid";
import ResponsivePagination from "react-responsive-pagination";
import "react-responsive-pagination/themes/classic.css";
const FreePlay = () => {
  const [hammerCars, setHammerCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("hammer");
  const [velocityPicks, setVelocityPicks] = useState([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [filters, setFilters] = useState({
    make: "all",
    priceRange: "all",
    status: "active",
  });
  const loadHammerCars = async () => {
    setLoading(true);
    try {
      console.log("Loading hammer cars, page:", currentPage);
      const now = new Date().toISOString();

      const response = await getCars({
        offset: (currentPage - 1) * 6,
        limit: 6,
      });
      // console.log(response);
      console.log(response);
      setHammerCars(response.cars);
      setTotalPages(response.total);
    } catch (e) {
      console.error("Error in loading hammer cars:", e);
      setError("Failed to load hammer game cars");
    } finally {
      setLoading(false);
    }
  };

  //TODO: for Velocity Picks, add field in auction model for isVelocityPick

  useEffect(() => {
    loadHammerCars();
  }, [currentPage]);

  // useEffect(() => {
  //   if (hammerCars.length > 0) {
  //     // console.log(hammerCars);
  //     setLoading(false);
  //   }
  // }, [hammerCars]);
  return (
    <div className="page-container">
      <div className="section-container mx-auto px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">FREE PLAY</h1>
            <p className="text-gray-400">
              Practice your prediction skills without risking real money
            </p>
          </div>
          {/* <Link href={createPageUrl("Leaderboard")}>
            <Button
              variant="outline"
              className="border-[#F2CA16] text-[#F2CA16] hover:bg-[#F2CA16] hover:text-[#0C1924]"
            >
              <Trophy className="mr-2 h-5 w-5" />
              LEADERBOARD
            </Button>
          </Link> */}
        </div>

        <div className="mb-8 rounded-md border border-blue-800/30 bg-blue-900/20 p-4">
          <p className="text-blue-400">
            <strong>Disclaimer:</strong> All predictions on Velocity Markets are
            for entertainment purposes only. We do not provide financial advice
            or guarantee accuracy of information. Always do your own research
            before making financial decisions.
          </p>
        </div>
        {/* 
        <div className="mb-8 flex items-start gap-4 rounded-md border border-purple-800/30 bg-purple-900/20 p-4">
          <div className="mt-1 min-w-[40px]">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-white">
              AI
            </div>
          </div>
          <div>
            <h3 className="mb-1 text-lg font-bold text-purple-400">
              AI Agents Active
            </h3>
            <p className="text-gray-300">
              Our Free Play mode includes AI agents actively participating
              alongside human players. These agents analyze market data, vehicle
              specifications, and historical trends to make informed
              predictions. Compete against them to test your prediction skills!
            </p>
          </div>
        </div> */}

        {error && (
          <div className="mb-8 rounded-md border border-red-800/30 bg-red-900/20 p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* <div className="mb-8">
          <AIStatistics />
        </div> */}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="border-[#333333] bg-[#2C2C2C]">
            <TabsTrigger
              value="hammer"
              className="data-[state=active]:bg-[#F2CA16] data-[state=active]:text-[#0C1924]"
              // className={`${activeTab === "hammer" ? "bg-[#F2CA16] text-[#0C1924]" : ""}`}
            >
              Free Guess the Hammer
            </TabsTrigger>
            {/* <TabsTrigger
            value="tournaments"
            className="data-[state=active]:bg-[#F2CA16] data-[state=active]:text-[#0C1924]"
          >
            Free Tournaments
          </TabsTrigger> */}
          </TabsList>

          <TabsContent value="hammer" className="pt-6">
            {/* {velocityPicks.length > 0 && (
              <VelocityPicks cars={velocityPicks} mode="free_play" />
            )} */}

            <Card className="mb-8 border-[#333333] bg-[#2C2C2C] p-6">
              <AuctionFilters filters={filters} setFilters={setFilters} />
            </Card>

            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-b-transparent border-l-transparent border-r-transparent border-t-[#F2CA16]"></div>
              </div>
            ) : (
              <AuctionGrid auctions={hammerCars} mode="free_play" />
            )}
          </TabsContent>

          {/* <TabsContent value="tournaments" className="pt-6">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-b-transparent border-l-transparent border-r-transparent border-t-[#F2CA16]"></div>
              </div>
            ) : freeTournaments.length > 0 ? (
              <TournamentList tournaments={freeTournaments} isFreeMode={true} />
            ) : (
              <div className="rounded-lg border border-[#1E2A36] bg-[#13202D] p-12 text-center">
                <h3 className="mb-2 text-xl font-bold">
                  No Free Tournaments Available
                </h3>
                <p className="text-gray-400">
                  There are currently no free tournaments available. Please
                  check back later!
                </p>
              </div>
            )}
          </TabsContent> */}
        </Tabs>
        <div className="mx-auto mb-8 w-1/3">
          <ResponsivePagination
            current={currentPage}
            total={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
};
export default FreePlay;
