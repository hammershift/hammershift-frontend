"use client";
import React, { useState, useEffect } from "react";
import { Trophy, Clock, Users, DollarSign, AlertTriangle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { createPageUrl } from "@/app/components/utils";
import { Card } from "@/app/components/card_component";
import { Button } from "@/app/components/ui/button";
import { formatDistanceToNow, isValid } from "date-fns";
import { Tournament } from "@/models/tournament.model";
import { getTournaments } from "@/lib/data";
import TournamentGrid from "@/app/components/tournament_grid";
export default function Tournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const formatDate = (dateString: string) => {
    if (!dateString) return "Date not set";

    try {
      const date = new Date(dateString);
      if (!isValid(date)) {
        return "Invalid date";
      }
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error(`Date formatting error: ${error}`);
      return "Date error";
    }
  };

  useEffect(() => {
    async function loadTournaments() {
      try {
        const data = await getTournaments({
          offset: (currentPage - 1) * 6,
          limit: 6,
          type: "standard",
        });
        setTournaments(data.tournaments);
        setTotalPages(data.total);
      } catch (error) {
        console.log(`Error loading tournaments: ${error}`);
      } finally {
        setLoading(false);
      }
    }
    loadTournaments();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-3xl font-bold">TOURNAMENTS</h1>
          <p className="text-gray-400">
            Compete against others for real prizes
          </p>
        </div>
      </div>

      <div className="mb-8 rounded-md border border-orange-800/30 bg-orange-900/20 p-4">
        <div className="flex gap-3">
          <AlertTriangle className="mt-1 flex-shrink-0 text-orange-500" />
          <div>
            <p className="text-sm text-orange-400">
              <strong>Risk Disclosure:</strong> Velocity Markets is intended for
              entertainment purposes. While we offer paid games with real
              prizes, these involve financial risk. A 12% platform fee is
              applied to tournament entries. Never participate with money you
              cannot afford to lose.
            </p>
          </div>
        </div>
      </div>

      {/* <div className="mb-6 flex items-center justify-between">
        <div className="flex w-full items-center justify-center">
          <div className="mb-1 text-5xl font-bold">COMING SOON</div>
        </div>
      </div> */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((_, i) => (
            <Card
              key={i}
              className="animate-pulse overflow-hidden border-[#333333] bg-[#2C2C2C]"
            >
              <div className="aspect-video bg-[#333333]"></div>
              <div className="p-6">
                <div className="mb-4 h-7 rounded bg-[#333333]"></div>
                <div className="mb-6 h-4 rounded bg-[#333333]"></div>
                <div className="mb-6 grid grid-cols-2 gap-4">
                  <div>
                    <div className="mb-2 h-3 w-20 rounded bg-[#333333]"></div>
                    <div className="h-5 w-16 rounded bg-[#333333]"></div>
                  </div>
                  <div>
                    <div className="mb-2 h-3 w-20 rounded bg-[#333333]"></div>
                    <div className="h-5 w-16 rounded bg-[#333333]"></div>
                  </div>
                  <div>
                    <div className="mb-2 h-3 w-20 rounded bg-[#333333]"></div>
                    <div className="h-5 w-16 rounded bg-[#333333]"></div>
                  </div>
                  <div>
                    <div className="mb-2 h-3 w-20 rounded bg-[#333333]"></div>
                    <div className="h-5 w-16 rounded bg-[#333333]"></div>
                  </div>
                </div>
                <div className="h-10 rounded bg-[#333333]"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <TournamentGrid tournaments={tournaments} />
      )}
    </div>
  );
}
