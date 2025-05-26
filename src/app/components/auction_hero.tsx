import Link from "next/link";
import { Button } from "./ui/button";
export default function AuctionHero() {
    const isTournamentDisabled = true;

    return (
        <div className="section-container">
            <div className="flex flex-col items-center justify-center rounded px-4">
                <h1 className="mb-4 text-center text-4xl font-bold md:text-6xl">
                    <span className="text-white">PREDICT.</span>{" "}
                    <span className="text-[#F2CA16]">COMPETE.</span>{" "}
                    <span className="text-white">WIN.</span>
                </h1>
                <h3 className="mb-7 text-lg md:text-xl text-center">
                    {/* Shift Your Perspective, Hammer Down on Your Predictions */}
                    Predict the hammer prices of collectible, rare, classic, and exotic car auctions and win prizes
                </h3>
                {/* <p className="text-lg text-center">
          Join the auction action with Hammershift! Your car auction savvy could
          be your ticket to victory. Feel the rush of live auctions, strategize
          your wagers, and anticipate the fall of the gavel. This is no game of
          chance—it&apos;s a test of your knowledge and a thrill ride with every
          bid.
        </p> */}
                <p className="mx-auto mb-8 max-w-md text-sm text-gray-300 text-center text-justify">
                    For entertainment purposes only. Velocity Markets does not
                    guarantee results. Users must be 18+ to play free games and
                    21+ for paid games.
                </p>
            </div>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link href="/free_play">
                    <Button
                        variant="default"
                        className="w-full bg-[#F2CA16] text-[#0C1924] hover:bg-[#F2CA16]/90 sm:w-auto"
                    >
                        PLAY FREE GAME
                    </Button>
                </Link>
                <Link
                    href="/tournaments"
                    className={`w-full border-[#F2CA16] text-[#F2CA16] hover:bg-[#F2CA16] hover:text-[#0C1924] sm:w-auto ${isTournamentDisabled ? 'pointer-events-none opacity-50' : ''
                        }`}
                    aria-disabled={isTournamentDisabled}
                    tabIndex={isTournamentDisabled ? -1 : undefined}
                >
                    <Button
                        variant="outline"
                        className="w-full border-[#F2CA16] text-[#F2CA16] hover:bg-[#F2CA16] hover:text-[#0C1924] sm:w-auto"
                    >
                        {"JOIN TOURNAMENT (COMING SOON)"}
                    </Button>
                </Link>
            </div>
        </div>
    );
}
