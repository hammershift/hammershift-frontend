"use client";

import Link from "next/link";
import AuctionCard from "./AuctionCard";
import { Auction } from "@/models/auction.model";

interface DailySlateProps {
  auctions: Auction[];
}

export function DailySlate({ auctions }: DailySlateProps) {
  if (auctions.length === 0) {
    return (
      <div className="rounded-lg border border-[#1E2A36] bg-[#13202D] p-12 text-center">
        <p className="mb-4 text-gray-400">No auctions closing in the next 24 hours.</p>
        <Link href="/free_play" className="text-sm text-[#E94560] underline">
          Browse all auctions
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold text-white">
        {"Today's Slate — "}
        <span className="text-[#E94560]">{auctions.length}</span>
        {" auctions closing in the next 24 hours"}
      </h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {auctions.map((auction) => (
          <AuctionCard key={auction._id?.toString()} auction={auction} />
        ))}
      </div>
    </div>
  );
}
