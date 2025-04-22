import { GameModeCard } from "./game_mode_card";
import { PlayCircle, Trophy, DollarSign } from "lucide-react";
export const GameModes = () => {
  return (
    <section className="mx-auto w-full py-12">
      <h2 className="mb-8 text-center text-3xl font-bold">GAME MODES</h2>
      <div className="grid gap-6 md:grid-cols-3">
        <GameModeCard
          title="FREE PLAY MODE"
          description="Practice with AI-powered insights"
          icon={PlayCircle}
          playerCount={1234}
          link={"/free_play"}
          badgeText="AI POWERED"
        />
        <GameModeCard
          title="TOURNAMENT MODE (COMING SOON)"
          description="Compete for prize pools"
          icon={Trophy}
          playerCount={123}
          link={"/"}
        />
        <GameModeCard
          title="GUESS THE HAMMER (COMING SOON)"
          description="Guess the hammer price"
          icon={DollarSign}
          playerCount={727}
          link={"/"}
        />
      </div>
      <p className="mt-4 text-center text-sm text-gray-300">
        All game results are based on prediction and are for entertainment
        purposes only.
      </p>
    </section>
  );
};
