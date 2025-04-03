import { GameModeCard } from "./game_mode_card";
import { PlayCircle, Trophy, DollarSign } from "lucide-react";
export const GameModes = () => {
  return (
    <section className="section-container mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold text-center mb-8">GAME MODES</h2>
      <div className="grid md:grid-cols-3 gap-6">
        <GameModeCard
          title="FREE PLAY MODE"
          description="Practice with AI-powered insights"
          icon={PlayCircle}
          playerCount={1234}
          link={"/"}
          badgeText="AI POWERED"
        />
        <GameModeCard
          title="TOURNAMENT MODE"
          description="Compete for prize pools"
          icon={Trophy}
          playerCount={123}
          link={"/"}
        />
        <GameModeCard
          title="GUESS THE HAMMER"
          description="Guess the hammer price"
          icon={DollarSign}
          playerCount={727}
          link={"/"}
        />
      </div>
      <p className="text-sm text-gray-300 mt-4 text-center">
        All game results are based on prediction and are for entertainment
        purposes only.
      </p>
    </section>
  );
};
