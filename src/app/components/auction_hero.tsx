import Link from "next/link";
import { Button } from "./button";
export default function AuctionHero() {
  return (
    <div>
      <div className="px-4 rounded flex flex-col justify-center items-center">
        <h1 className="text-4xl font-bold mb-4 md:text-6xl text-center">
          <span className="text-white">PREDICT.</span>{" "}
          <span className="text-[#F2CA16]">COMPETE.</span>{" "}
          <span className="text-white">WIN.</span>
        </h1>
        <h3 className="text-lg md:text-xl mb-7">
          {/* Shift Your Perspective, Hammer Down on Your Predictions */}
          Predict the hammer prices of classic car auctions and win prizes
        </h3>
        {/* <p className="text-lg text-center">
          Join the auction action with Hammershift! Your car auction savvy could
          be your ticket to victory. Feel the rush of live auctions, strategize
          your wagers, and anticipate the fall of the gavel. This is no game of
          chance—it&apos;s a test of your knowledge and a thrill ride with every
          bid.
        </p> */}
        <p className="text-xs text-gray-300 mb-8 max-w-md mx-auto text-center">
          For entertainment purposes only. HammerShift does not guarantee
          results. Users must be 18+ to play free games and 21+ for paid games.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link href="/">
          <Button
            variant="default"
            size="default"
            className="bg-[#F2CA16] text-[#0C1924] hover:bg-[#F2CA16]/90 t-w-full sm:w-auto"
          >
            PLAY FREE GAME
          </Button>
        </Link>
        <Link href="/">
          <Button
            variant="outline"
            className="border-[#F2CA16] text-[#F2CA16] hover:bg-[#F2CA16] hover:text-[#0C1924] w-full sm:w-auto"
          >
            JOIN TOURNAMENT
          </Button>
        </Link>
      </div>
    </div>
  );
}
