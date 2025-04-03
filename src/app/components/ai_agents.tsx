import { Brain, Bot, Zap, Share2, ShieldCheck } from "lucide-react";
import { Button } from "./button";
import Link from "next/link";

export const AIAgents = () => {
  return (
    <div className="py-10">
      <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
        <div className="md:w-1/2">
          <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center text-white mb-4">
            <Brain className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold mb-4">POWERED BY AI AGENTS</h2>
          <p className="text-gray-300 mb-6">
            Compete against our sophisticated AI agents that analyze historical
            data, market trends, and vehicle specifications to make informed
            predictions about auction outcomes.
          </p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-start gap-3">
              <Bot className="w-5 h-5 text-purple-400 mt-1" />
              <div>
                <h4 className="font-bold">Multiple Agent Types</h4>
                <p className="text-sm text-gray-400">
                  Specialized in different vehicle categories
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-purple-400 mt-1" />
              <div>
                <h4 className="font-bold">Real-time Analysis</h4>
                <p className="text-sm text-gray-400">
                  Continuous market monitoring
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Share2 className="w-5 h-5 text-purple-400 mt-1" />
              <div>
                <h4 className="font-bold">Learning System</h4>
                <p className="text-sm text-gray-400">
                  Constantly improving with new data
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-purple-400 mt-1" />
              <div>
                <h4 className="font-bold">Fair Play</h4>
                <p className="text-sm text-gray-400">
                  Transparent prediction strategies
                </p>
              </div>
            </div>
          </div>

          <Link href="/">
            <Button className="bg-purple-600 hover:bg-purple-700">
              PLAY AGAINST AI AGENTS
            </Button>
          </Link>
        </div>

        <div className="md:w-1/2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#1E2A36] p-6 rounded-lg border border-purple-800/20">
              <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center mb-4">
                <Bot className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="font-bold mb-2">ClassicConnoisseur</h3>
              <p className="text-sm text-gray-400">
                Specializes in pre-1970 classics, focusing on rarity,
                originality, and historical significance.
              </p>
            </div>

            <div className="bg-[#1E2A36] p-6 rounded-lg border border-purple-800/20">
              <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center mb-4">
                <Bot className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="font-bold mb-2">MarketAnalyst</h3>
              <p className="text-sm text-gray-400">
                Tracks market trends across makes and models, predicting based
                on recent comparable sales.
              </p>
            </div>

            <div className="bg-[#1E2A36] p-6 rounded-lg border border-purple-800/20">
              <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center mb-4">
                <Bot className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="font-bold mb-2">RarityDetective</h3>
              <p className="text-sm text-gray-400">
                Focuses on limited production models and special editions,
                analyzing collectibility factors.
              </p>
            </div>

            <div className="bg-[#1E2A36] p-6 rounded-lg border border-purple-800/20">
              <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center mb-4">
                <Bot className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="font-bold mb-2">TrendTracker</h3>
              <p className="text-sm text-gray-400">
                Specializes in emerging classics and future collectibles based
                on market sentiment analysis.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
